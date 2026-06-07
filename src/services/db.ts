import { Student, Teacher, Candidate, Vote, ElectionState, ActivityLog, HouseColor, SchoolClass, GLOBAL_POSITIONS, HOUSE_POSITIONS } from '../types';
import { firestore } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, writeBatch, runTransaction, query, orderBy, limit, where, increment } from 'firebase/firestore';

const DEFAULT_ELECTION_STATE: ElectionState = {
  status: 'active',
  allowManualTyping: true,
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 28800000).toISOString(),
  announcement: 'Welcome to the Royal Academy Student Council Election 2083!',
  voiceAnnouncements: true
};

class DatabaseService {
  private listeners: (() => void)[] = [];
  private unsubscribes: (() => void)[] = [];
  private electionEndInterval: ReturnType<typeof setInterval> | null = null;

  private state = {
    students: [] as Student[],
    teachers: [] as Teacher[],
    candidates: [] as Candidate[],
    votes: [] as Vote[],
    classes: [] as SchoolClass[],
    electionState: DEFAULT_ELECTION_STATE,
    logs: [] as ActivityLog[]
  };

  private studentsCache: { [className: string]: Student[] } = {};

  public initRealtimeListeners() {
    if (!firestore) return;

    this.unsubscribes.forEach(unsub => unsub());
    this.unsubscribes = [];

    const collections = ['teachers', 'candidates', 'votes', 'classes', 'logs'];
    
    collections.forEach(col => {
      let q = collection(firestore, col);
      if (col === 'logs') {
        q = query(collection(firestore, col), orderBy('timestamp', 'desc'), limit(100)) as any;
      }
      const unsub = onSnapshot(q, (snapshot) => {
        (this.state as any)[col] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.notifyListeners();
      });
      this.unsubscribes.push(unsub);
    });

    const electionUnsub = onSnapshot(doc(firestore, 'system', 'electionState'), (docSnap) => {
      if (docSnap.exists()) {
        this.state.electionState = docSnap.data() as ElectionState;
      } else {
        setDoc(doc(firestore, 'system', 'electionState'), DEFAULT_ELECTION_STATE);
        this.state.electionState = DEFAULT_ELECTION_STATE;
      }
      // Auto-end election when endTime has passed
      this.checkAndAutoEndElection();
      this.notifyListeners();
    });
    this.unsubscribes.push(electionUnsub);

    // Periodic check every 30s to catch election end even without Firestore events
    this.startElectionEndTimer();
  }

  private checkAndAutoEndElection() {
    const { status, endTime } = this.state.electionState;
    if (status === 'active' && endTime) {
      const end = new Date(endTime).getTime();
      if (!isNaN(end) && Date.now() >= end) {
        this.state.electionState.status = 'completed';
        // Persist the change to Firestore
        if (firestore) {
          updateDoc(doc(firestore, 'system', 'electionState'), { status: 'completed' }).catch(() => {});
        }
        this.addLog('Election Auto-Ended', 'Election automatically ended because the scheduled end time was reached.', 'warning');
      }
    }
  }

  private startElectionEndTimer() {
    if (this.electionEndInterval) clearInterval(this.electionEndInterval);
    this.electionEndInterval = setInterval(() => {
      const prevStatus = this.state.electionState.status;
      this.checkAndAutoEndElection();
      if (prevStatus !== this.state.electionState.status) {
        this.notifyListeners();
      }
    }, 30000); // Check every 30 seconds
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // --- ELECTION STATE ---
  public getElectionState(): ElectionState { return this.state.electionState; }
  public async updateElectionState(newState: Partial<ElectionState>) {
    if (!firestore) return;
    
    // If setting status to active, ensure endTime is in the future
    if (newState.status === 'active') {
      const currentEndTime = newState.endTime || this.state.electionState.endTime;
      if (currentEndTime) {
        const end = new Date(currentEndTime).getTime();
        if (isNaN(end) || Date.now() >= end) {
          newState.endTime = new Date(Date.now() + 28800000).toISOString(); // 8 hours default
        }
      } else {
        newState.endTime = new Date(Date.now() + 28800000).toISOString();
      }
    }
    
    await updateDoc(doc(firestore, 'system', 'electionState'), newState);
    this.addLog(`Election State Updated`, `Status changed to ${newState.status || this.state.electionState.status}`, 'info');
  }

  // --- CANDIDATES ---
  public getCandidates(): Candidate[] { return this.state.candidates; }
  public getCandidatesByHouse(house: HouseColor): Candidate[] { return this.state.candidates.filter(c => c.house === house); }
  
  public async addCandidate(candidate: Omit<Candidate, 'id' | 'votesCount'>) {
    if (!firestore) return;
    const newDoc = doc(collection(firestore, 'candidates'));
    await setDoc(newDoc, { ...candidate, id: newDoc.id, votesCount: 0 });
    this.addLog('Candidate Added', `Added ${candidate.name}`, 'success');
  }

  public async updateCandidate(id: string, updates: Partial<Candidate>) {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'candidates', id), updates);
    this.addLog('Candidate Updated', `Updated details for candidate ID: ${id}`, 'info');
  }

  public async deleteCandidate(id: string) {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'candidates', id));
  }

  public async deleteAllCandidates() {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    this.state.candidates.forEach(c => batch.delete(doc(firestore, 'candidates', c.id)));
    await batch.commit();
    this.addLog('Bulk Delete', `Deleted all candidates.`, 'danger');
  }

  // --- STUDENTS ---
  public getStudents(): Student[] { return this.state.students; }

  public async fetchStudentsByClass(className: string): Promise<Student[]> {
    if (!firestore) return [];
    
    // Check local cache first
    if (this.studentsCache[className]) {
      this.state.students = this.studentsCache[className];
      this.notifyListeners();
      return this.studentsCache[className];
    }

    try {
      const q = query(
        collection(firestore, 'students'),
        where('className', '==', className)
      );
      const snapshot = await getDocs(q);
      let fetchedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
      
      // Fallback: If strict equality fails (e.g., due to trailing spaces or case mismatch in bulk upload),
      // fetch all students and filter locally.
      if (fetchedStudents.length === 0) {
         const allSnapshot = await getDocs(collection(firestore, 'students'));
         const allStudents = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
         const normalize = (c: string) => c.replace(/[\s\-_]+/g, '').replace(/class/gi, '').toLowerCase();
         const normClass = normalize(className);
         fetchedStudents = allStudents.filter(s => 
           normalize(s.className || '') === normClass
         );
      }

      // Store in cache
      this.studentsCache[className] = fetchedStudents;
      
      // Update state for current view
      this.state.students = fetchedStudents;
      this.notifyListeners();
      
      return fetchedStudents;
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  }

  public async fetchAllStudents(): Promise<Student[]> {
    if (!firestore) return [];
    try {
      const snapshot = await getDocs(collection(firestore, 'students'));
      const fetchedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
      this.state.students = fetchedStudents;
      this.notifyListeners();
      return fetchedStudents;
    } catch (error) {
      console.error("Error fetching all students:", error);
      return [];
    }
  }
  
  public async addStudent(student: Omit<Student, 'id' | 'hasVoted'>) {
    if (!firestore) return;
    const newDoc = doc(collection(firestore, 'students'));
    await setDoc(newDoc, { ...student, id: newDoc.id, hasVoted: false });
    this.addLog('Student Added', `Added student ${student.name}`, 'success');
  }

  public async updateStudent(id: string, updates: Partial<Student>) {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'students', id), updates);
  }

  public async deleteStudent(id: string) {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'students', id));
  }

  public async deleteAllStudents() {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    this.state.students.forEach(s => batch.delete(doc(firestore, 'students', s.id)));
    await batch.commit();
    this.addLog('Bulk Delete', `Deleted all students.`, 'danger');
  }

  // --- TEACHERS & CLASSES ---
  public getTeachers(): Teacher[] { return this.state.teachers; }
  public async addTeacher(teacher: Omit<Teacher, 'id'>) {
    if (!firestore) return;
    const newDoc = doc(collection(firestore, 'teachers'));
    await setDoc(newDoc, { ...teacher, id: newDoc.id });
  }
  public async deleteTeacher(id: string) { if (firestore) await deleteDoc(doc(firestore, 'teachers', id)); }

  public getClasses(): SchoolClass[] { return this.state.classes; }
  public async addClass(schoolClass: Omit<SchoolClass, 'id'>) {
    if (!firestore) return;
    const newDoc = doc(collection(firestore, 'classes'));
    await setDoc(newDoc, { ...schoolClass, id: newDoc.id });
  }
  public async deleteClass(id: string) { if (firestore) await deleteDoc(doc(firestore, 'classes', id)); }

  // --- VOTING (TRANSACTIONAL) ---
  public async castVote(studentId: string, studentName: string, className: string, house: HouseColor | 'Teacher' | 'All' | string, votedCandidates: { [position: string]: string }): Promise<{ success: boolean; message: string }> {
    if (!firestore) return { success: false, message: 'Database not connected.' };
    if (this.state.electionState.status !== 'active') return { success: false, message: 'Election is not active.' };

    try {
      await runTransaction(firestore, async (transaction) => {
        let personRef = null;
        let isManual = false;
        const collectionName = className === 'Teacher' ? 'teachers' : 'students';
        
        // Validation: Verify all required positions are present.
        // For students, both GLOBAL and HOUSE. For teachers, GLOBAL (and possibly HOUSE depending on rules, but we'll check based on what is expected)
        const expectedPositions = className === 'Teacher' ? [...GLOBAL_POSITIONS, ...HOUSE_POSITIONS] : [...GLOBAL_POSITIONS, ...HOUSE_POSITIONS];
        const votedPositionKeys = Object.keys(votedCandidates);
        
        const missingPositions = expectedPositions.filter(pos => !votedPositionKeys.includes(pos));
        if (missingPositions.length > 0 && !isManual) { // manual could be a teacher making a quick exception, but let's enforce it broadly. Actually let's just warn or allow partial if we wanted, but prompt said prevent skipping required positions.
             throw new Error(`MISSING_POSITIONS:${missingPositions.join(',')}`);
        }
        
        if (studentId.startsWith('manual_')) {
          isManual = true;
        } else {
          personRef = doc(firestore, collectionName, studentId);
          const personDoc = await transaction.get(personRef);
          if (personDoc.exists() && personDoc.data().hasVoted) {
            throw new Error('ALREADY_VOTED');
          }
        }

        const timestamp = new Date().toISOString();

        // Register the vote
        const voteRef = doc(collection(firestore, 'votes'));
        transaction.set(voteRef, { id: voteRef.id, studentId, studentName, className, house, votedCandidates, timestamp });

        // Mark person as voted
        if (!isManual && personRef) {
          transaction.update(personRef, { hasVoted: true, votedAt: timestamp });
        } else if (isManual) {
          const newPersonRef = doc(collection(firestore, collectionName));
          transaction.set(newPersonRef, { id: newPersonRef.id, name: studentName, className, hasVoted: true, votedAt: timestamp });
        }

        // Increment candidates safely
        for (const pos of Object.keys(votedCandidates)) {
          const candId = votedCandidates[pos];
          const candRef = doc(firestore, 'candidates', candId);
          transaction.update(candRef, { votesCount: increment(1) });
        }
      });
      
      this.addLog('Vote Cast', `Student ${studentName} voted.`, 'success');
      
      // Invalidate cache for this class so next fetch gets updated hasVoted status
      if (this.studentsCache[className]) {
        delete this.studentsCache[className];
      }
      
      return { success: true, message: 'Your vote has been successfully submitted!' };
    } catch (e: any) {
      if (e.message === 'ALREADY_VOTED') {
        this.addLog('Security Alert', `Duplicate vote blocked for ${studentName}`, 'danger');
        return { success: false, message: 'You have already submitted your vote!' };
      }
      if (e.message.startsWith('MISSING_POSITIONS')) {
         return { success: false, message: 'You must vote for all required positions.' };
      }
      return { success: false, message: 'Vote failed due to a server error.' };
    }
  }

  public getVotes(): Vote[] { return this.state.votes; }

  // --- LOGS ---
  public getLogs(): ActivityLog[] { return this.state.logs; }
  public async addLog(action: string, details: string, type: 'info' | 'success' | 'warning' | 'danger') {
    if (!firestore) return;
    const newDoc = doc(collection(firestore, 'logs'));
    await setDoc(newDoc, { id: newDoc.id, action, details, timestamp: new Date().toISOString(), type });
  }

  // --- BULK UPLOAD ---
  public async bulkUploadStudents(students: Omit<Student, 'id' | 'hasVoted'>[]) {
    if (!firestore) return { imported: 0, skipped: 0 };
    const batch = writeBatch(firestore);
    let count = 0;
    students.forEach(s => {
      const newDoc = doc(collection(firestore, 'students'));
      batch.set(newDoc, { ...s, id: newDoc.id, hasVoted: false });
      count++;
    });
    await batch.commit();
    this.studentsCache = {}; // Invalidate cache
    this.addLog('Bulk Upload Students', `Imported ${count} students.`, 'success');
    return { imported: count, skipped: 0 };
  }

  public async bulkUploadTeachers(teachers: Omit<Teacher, 'id'>[]) {
    if (!firestore) return { imported: 0, skipped: 0 };
    const batch = writeBatch(firestore);
    let count = 0;
    teachers.forEach(t => {
      const newDoc = doc(collection(firestore, 'teachers'));
      batch.set(newDoc, { ...t, id: newDoc.id });
      count++;
    });
    await batch.commit();
    this.addLog('Bulk Upload', `Imported ${count} teachers.`, 'success');
    return { imported: count, skipped: 0 };
  }

  public async bulkUploadCandidates(candidates: Omit<Candidate, 'id' | 'votesCount'>[]) {
    if (!firestore) return { imported: 0, skipped: 0 };
    const batch = writeBatch(firestore);
    let count = 0;
    candidates.forEach(c => {
      const newDoc = doc(collection(firestore, 'candidates'));
      batch.set(newDoc, { ...c, id: newDoc.id, votesCount: 0 });
      count++;
    });
    await batch.commit();
    this.addLog('Bulk Upload', `Imported ${count} candidates.`, 'success');
    return { imported: count, skipped: 0 };
  }

  public async resetElectionData() {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    this.state.candidates.forEach(c => batch.update(doc(firestore, 'candidates', c.id), { votesCount: 0 }));
    this.state.students.forEach(s => batch.update(doc(firestore, 'students', s.id), { hasVoted: false }));
    this.state.votes.forEach(v => batch.delete(doc(firestore, 'votes', v.id)));
    batch.update(doc(firestore, 'system', 'electionState'), { 
      status: 'active', 
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 28800000).toISOString() // Reset endTime to 8 hours from now
    });
    await batch.commit();
    this.addLog('Election Reset', 'All votes cleared.', 'warning');
  }

  public factoryReset() {
    // Left unimplemented for safety in Firestore
  }
}

export const db = new DatabaseService();
