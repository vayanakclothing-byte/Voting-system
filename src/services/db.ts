import { Student, Teacher, Candidate, Vote, ElectionState, ActivityLog, HouseColor, SchoolClass } from '../types';
import { firestore } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, writeBatch, runTransaction, query, orderBy, limit } from 'firebase/firestore';

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

  private state = {
    students: [] as Student[],
    teachers: [] as Teacher[],
    candidates: [] as Candidate[],
    votes: [] as Vote[],
    classes: [] as SchoolClass[],
    electionState: DEFAULT_ELECTION_STATE,
    logs: [] as ActivityLog[]
  };

  public initRealtimeListeners() {
    if (!firestore) return;

    this.unsubscribes.forEach(unsub => unsub());
    this.unsubscribes = [];

    const collections = ['students', 'teachers', 'candidates', 'votes', 'classes', 'logs'];
    
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
      this.notifyListeners();
    });
    this.unsubscribes.push(electionUnsub);
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
  public async castVote(studentId: string, studentName: string, className: string, house: HouseColor, votedCandidates: { [position: string]: string }): Promise<{ success: boolean; message: string }> {
    if (!firestore) return { success: false, message: 'Database not connected.' };
    if (this.state.electionState.status !== 'active') return { success: false, message: 'Election is not active.' };

    try {
      await runTransaction(firestore, async (transaction) => {
        let studentRef = null;
        let isManual = false;
        
        if (studentId.startsWith('manual_')) {
          isManual = true;
        } else {
          studentRef = doc(firestore, 'students', studentId);
          const studentDoc = await transaction.get(studentRef);
          if (studentDoc.exists() && studentDoc.data().hasVoted) {
            throw new Error('ALREADY_VOTED');
          }
        }

        const timestamp = new Date().toISOString();

        // Register the vote
        const voteRef = doc(collection(firestore, 'votes'));
        transaction.set(voteRef, { id: voteRef.id, studentId, studentName, className, house, votedCandidates, timestamp });

        // Mark student as voted
        if (!isManual && studentRef) {
          transaction.update(studentRef, { hasVoted: true, votedAt: timestamp });
        } else if (isManual) {
          const newStudentRef = doc(collection(firestore, 'students'));
          transaction.set(newStudentRef, { id: newStudentRef.id, name: studentName, className, house, hasVoted: true, votedAt: timestamp });
        }

        // Increment candidates safely
        for (const pos of Object.keys(votedCandidates)) {
          const candId = votedCandidates[pos];
          const candRef = doc(firestore, 'candidates', candId);
          const candDoc = await transaction.get(candRef);
          if (candDoc.exists()) {
            transaction.update(candRef, { votesCount: candDoc.data().votesCount + 1 });
          }
        }
      });
      
      this.addLog('Vote Cast', `Student ${studentName} voted.`, 'success');
      return { success: true, message: 'Your vote has been successfully submitted!' };
    } catch (e: any) {
      if (e.message === 'ALREADY_VOTED') {
        this.addLog('Security Alert', `Duplicate vote blocked for ${studentName}`, 'danger');
        return { success: false, message: 'You have already submitted your vote!' };
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
    batch.update(doc(firestore, 'system', 'electionState'), { status: 'active', startTime: new Date().toISOString() });
    await batch.commit();
    this.addLog('Election Reset', 'All votes cleared.', 'warning');
  }

  public factoryReset() {
    // Left unimplemented for safety in Firestore
  }
}

export const db = new DatabaseService();
