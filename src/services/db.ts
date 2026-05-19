import { Student, Teacher, Candidate, Vote, ElectionState, ActivityLog, HouseColor, SchoolClass } from '../types';

const STORAGE_KEY = 'royal_academy_election_data_2083';

interface DatabaseSchema {
  students: Student[];
  teachers: Teacher[];
  candidates: Candidate[];
  votes: Vote[];
  classes: SchoolClass[];
  electionState: ElectionState;
  logs: ActivityLog[];
}

const INITIAL_CANDIDATES: Candidate[] = [
  // Head Boy
  { id: 'c1', name: 'Alexander Wright', position: 'Head Boy', house: 'Blue', slogan: 'Sailing Towards Excellence!', symbol: '⚓', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400', votesCount: 42 },
  { id: 'c2', name: 'Marcus Vance', position: 'Head Boy', house: 'Red', slogan: 'Blazing a Trail of Leadership!', symbol: '🔥', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', votesCount: 38 },
  { id: 'c3', name: 'Oliver Greenlaw', position: 'Head Boy', house: 'Green', slogan: 'Rooted in Integrity, Growing in Strength!', symbol: '🌳', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', votesCount: 45 },
  { id: 'c4', name: 'Sebastian Sterling', position: 'Head Boy', house: 'Yellow', slogan: 'Shining Bright for a Better Tomorrow!', symbol: '⭐', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', votesCount: 31 },

  // Head Girl
  { id: 'c5', name: 'Sophia Sterling', position: 'Head Girl', house: 'Blue', slogan: 'Calm Waters, Strong Direction!', symbol: '🌊', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', votesCount: 49 },
  { id: 'c6', name: 'Elena Rostova', position: 'Head Girl', house: 'Red', slogan: 'Passion, Power, Progress!', symbol: '⚡', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', votesCount: 52 },
  { id: 'c7', name: 'Maya Lin', position: 'Head Girl', house: 'Green', slogan: 'Harmony and Innovation Hand in Hand!', symbol: '🍀', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', votesCount: 41 },
  { id: 'c8', name: 'Chloe Bennett', position: 'Head Girl', house: 'Yellow', slogan: 'Illuminating Student Voices!', symbol: '☀️', photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400', votesCount: 36 },

  // Sports Captain
  { id: 'c9', name: 'Liam Hunter', position: 'Sports Captain', house: 'Blue', slogan: 'Diving Deep for the Victory!', symbol: '🦈', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', votesCount: 35 },
  { id: 'c10', name: 'Jordan Sparks', position: 'Sports Captain', house: 'Red', slogan: 'Unstoppable Energy on Every Field!', symbol: '🎯', photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400', votesCount: 58 },
  { id: 'c11', name: 'Ethan Hunt', position: 'Sports Captain', house: 'Green', slogan: 'Endurance, Teamwork, Triumph!', symbol: '🏃', photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400', votesCount: 39 },
  { id: 'c12', name: 'Lucas Gold', position: 'Sports Captain', house: 'Yellow', slogan: 'Reaching for the Gold Trophy!', symbol: '🏆', photoUrl: 'https://images.unsplash.com/photo-1537511446984-935f663eb1f4?auto=format&fit=crop&q=80&w=400', votesCount: 44 },

  // Discipline Captain
  { id: 'c13', name: 'Hannah Abbott', position: 'Discipline Captain', house: 'Blue', slogan: 'Fairness, Respect, Dignity!', symbol: '⚖️', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', votesCount: 43 },
  { id: 'c14', name: 'Victor Thorne', position: 'Discipline Captain', house: 'Red', slogan: 'Firm Standards, Warm Hearts!', symbol: '🛡️', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', votesCount: 37 },
  { id: 'c15', name: 'Zara Meadows', position: 'Discipline Captain', house: 'Green', slogan: 'Cultivating Peace and Order!', symbol: '🕊️', photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400', votesCount: 48 },
  { id: 'c16', name: 'Aria Sun', position: 'Discipline Captain', house: 'Yellow', slogan: 'Guiding by Positive Example!', symbol: '🧭', photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400', votesCount: 40 }
];

const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: 'Aarav Sharma', className: 'Class 10', section: 'A', house: 'Blue', rollNumber: '101', hasVoted: false },
  { id: 's2', name: 'Emily Watson', className: 'Class 10', section: 'A', house: 'Red', rollNumber: '102', hasVoted: false },
  { id: 's3', name: 'Rohan Verma', className: 'Class 10', section: 'B', house: 'Green', rollNumber: '103', hasVoted: true, votedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 's4', name: 'Priya Patel', className: 'Class 11', section: 'A', house: 'Yellow', rollNumber: '201', hasVoted: false },
  { id: 's5', name: 'Daniel Craig', className: 'Class 12', section: 'C', house: 'Blue', rollNumber: '305', hasVoted: false },
  { id: 's6', name: 'Ananya Gupta', className: 'Class 9', section: 'B', house: 'Red', rollNumber: '902', hasVoted: false },
  { id: 's7', name: 'David Miller', className: 'Class 11', section: 'B', house: 'Green', rollNumber: '215', hasVoted: false },
  { id: 's8', name: 'Sarah Jenkins', className: 'Class 8', section: 'A', house: 'Yellow', rollNumber: '801', hasVoted: false }
];

const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'cl1', name: 'Class 8', sections: ['A', 'B', 'C'] },
  { id: 'cl2', name: 'Class 9', sections: ['A', 'B', 'C'] },
  { id: 'cl3', name: 'Class 10', sections: ['A', 'B', 'C'] },
  { id: 'cl4', name: 'Class 11', sections: ['A', 'B', 'Science', 'Commerce'] },
  { id: 'cl5', name: 'Class 12', sections: ['A', 'B', 'Science', 'Commerce'] }
];

const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Dr. Arthur Pendelton', subject: 'Mathematics', department: 'Science' },
  { id: 't2', name: 'Mrs. Clara Oswald', subject: 'English Literature', department: 'Languages' },
  { id: 't3', name: 'Mr. Rajesh Kothari', subject: 'Physics', department: 'Science' }
];

const INITIAL_ELECTION_STATE: ElectionState = {
  status: 'active',
  allowManualTyping: true,
  startTime: new Date(Date.now() - 7200000).toISOString(),
  endTime: new Date(Date.now() + 28800000).toISOString(), // 8 hours from now
  announcement: 'Welcome to the Royal Academy Student Council Election 2083! Please cast your votes fairly and maintain lab silence. QR Code voting is now active at the smart boards.',
  voiceAnnouncements: true
};

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'l1', action: 'Election Started', details: 'Super Admin started the Student Council Election 2083', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'info' },
  { id: 'l2', action: 'Bulk Upload', details: 'Uploaded 16 candidates and 8 students successfully', timestamp: new Date(Date.now() - 7000000).toISOString(), type: 'success' },
  { id: 'l3', action: 'Vote Cast', details: 'Student Rohan Verma (Class 10) cast their vote', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'success' }
];

class DatabaseService {
  private listeners: (() => void)[] = [];

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        this.notifyListeners();
      }
    });
  }

  private getData(): DatabaseSchema {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const initialData: DatabaseSchema = {
        students: INITIAL_STUDENTS,
        teachers: INITIAL_TEACHERS,
        candidates: INITIAL_CANDIDATES,
        votes: [],
        classes: INITIAL_CLASSES,
        electionState: INITIAL_ELECTION_STATE,
        logs: INITIAL_LOGS
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  }

  private saveData(data: DatabaseSchema) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.notifyListeners();
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
  public getElectionState(): ElectionState {
    return this.getData().electionState;
  }

  public updateElectionState(newState: Partial<ElectionState>) {
    const data = this.getData();
    data.electionState = { ...data.electionState, ...newState };
    this.saveData(data);
    this.addLog(`Election State Updated`, `Status changed to ${data.electionState.status}`, 'info');
  }

  // --- CANDIDATES ---
  public getCandidates(): Candidate[] {
    return this.getData().candidates;
  }

  public getCandidatesByHouse(house: HouseColor): Candidate[] {
    return this.getData().candidates.filter(c => c.house === house);
  }

  public addCandidate(candidate: Omit<Candidate, 'id' | 'votesCount'>) {
    const data = this.getData();
    const newCandidate: Candidate = {
      ...candidate,
      id: 'c_' + Date.now(),
      votesCount: 0
    };
    data.candidates.push(newCandidate);
    this.saveData(data);
    this.addLog('Candidate Added', `Added ${candidate.name} for ${candidate.position} (${candidate.house})`, 'success');
  }

  public updateCandidate(id: string, updates: Partial<Candidate>) {
    const data = this.getData();
    data.candidates = data.candidates.map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveData(data);
    this.addLog('Candidate Updated', `Updated details for candidate ID: ${id}`, 'info');
  }

  public deleteCandidate(id: string) {
    const data = this.getData();
    const candidate = data.candidates.find(c => c.id === id);
    data.candidates = data.candidates.filter(c => c.id !== id);
    this.saveData(data);
    if (candidate) {
      this.addLog('Candidate Deleted', `Removed candidate ${candidate.name}`, 'warning');
    }
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.getData().students;
  }

  public addStudent(student: Omit<Student, 'id' | 'hasVoted'>) {
    const data = this.getData();
    const newStudent: Student = {
      ...student,
      id: 's_' + Date.now(),
      hasVoted: false
    };
    data.students.push(newStudent);
    this.saveData(data);
    this.addLog('Student Added', `Added student ${student.name} (${student.className})`, 'success');
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    const data = this.getData();
    data.students = data.students.map(s => s.id === id ? { ...s, ...updates } : s);
    this.saveData(data);
  }

  public deleteStudent(id: string) {
    const data = this.getData();
    data.students = data.students.filter(s => s.id !== id);
    this.saveData(data);
  }

  // --- TEACHERS ---
  public getTeachers(): Teacher[] {
    return this.getData().teachers;
  }

  public addTeacher(teacher: Omit<Teacher, 'id'>) {
    const data = this.getData();
    data.teachers.push({ ...teacher, id: 't_' + Date.now() });
    this.saveData(data);
  }

  public deleteTeacher(id: string) {
    const data = this.getData();
    data.teachers = data.teachers.filter(t => t.id !== id);
    this.saveData(data);
  }

  // --- CLASSES ---
  public getClasses(): SchoolClass[] {
    return this.getData().classes;
  }

  public addClass(schoolClass: Omit<SchoolClass, 'id'>) {
    const data = this.getData();
    data.classes.push({ ...schoolClass, id: 'cl_' + Date.now() });
    this.saveData(data);
  }

  public deleteClass(id: string) {
    const data = this.getData();
    data.classes = data.classes.filter(c => c.id !== id);
    this.saveData(data);
  }

  // --- VOTING ---
  public castVote(studentId: string, studentName: string, className: string, house: HouseColor, votedCandidates: { [position: string]: string }): { success: boolean; message: string } {
    const data = this.getData();

    if (data.electionState.status !== 'active') {
      return { success: false, message: 'Election is not currently active.' };
    }

    // Check if student already voted
    const student = data.students.find(s => s.id === studentId || s.name.toLowerCase() === studentName.toLowerCase());
    if (student && student.hasVoted) {
      this.addLog('Security Alert: Duplicate Vote Attempt', `Student ${studentName} (${className}) attempted to vote again.`, 'danger');
      return { success: false, message: 'You have already submitted your vote! Multiple voting is strictly prohibited.' };
    }

    const timestamp = new Date().toISOString();

    // Create vote record
    const newVote: Vote = {
      id: 'v_' + Date.now(),
      studentId: student ? student.id : 'manual_' + Date.now(),
      studentName,
      className,
      house,
      votedCandidates,
      timestamp
    };

    data.votes.push(newVote);

    // Update student voted status
    if (student) {
      student.hasVoted = true;
      student.votedAt = timestamp;
    } else {
      // If manual typing student wasn't in db, add them as voted
      data.students.push({
        id: newVote.studentId,
        name: studentName,
        className,
        house,
        hasVoted: true,
        votedAt: timestamp
      });
    }

    // Increment candidate vote counts
    Object.values(votedCandidates).forEach(candidateId => {
      const candidate = data.candidates.find(c => c.id === candidateId);
      if (candidate) {
        candidate.votesCount += 1;
      }
    });

    this.saveData(data);
    this.addLog('Vote Cast Successfully', `Student ${studentName} (${className}) submitted their vote securely.`, 'success');
    return { success: true, message: 'Your vote has been successfully submitted!' };
  }

  public getVotes(): Vote[] {
    return this.getData().votes;
  }

  // --- LOGS ---
  public getLogs(): ActivityLog[] {
    return this.getData().logs;
  }

  public addLog(action: string, details: string, type: 'info' | 'success' | 'warning' | 'danger') {
    const data = this.getData();
    const newLog: ActivityLog = {
      id: 'l_' + Date.now() + Math.random(),
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    data.logs = [newLog, ...data.logs];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.notifyListeners();
  }

  // --- BULK UPLOAD ---
  public bulkUploadStudents(students: Omit<Student, 'id' | 'hasVoted'>[]) {
    const data = this.getData();
    let count = 0;
    students.forEach(s => {
      if (!data.students.some(existing => existing.name.toLowerCase() === s.name.toLowerCase() && existing.className === s.className)) {
        data.students.push({
          ...s,
          id: 's_' + Date.now() + Math.random(),
          hasVoted: false
        });
        count++;
      }
    });
    this.saveData(data);
    this.addLog('Bulk Upload Students', `Successfully imported ${count} new students (${students.length - count} duplicates skipped).`, 'success');
    return { imported: count, skipped: students.length - count };
  }

  public bulkUploadTeachers(teachers: Omit<Teacher, 'id'>[]) {
    const data = this.getData();
    let count = 0;
    teachers.forEach(t => {
      if (!data.teachers.some(existing => existing.name.toLowerCase() === t.name.toLowerCase())) {
        data.teachers.push({
          ...t,
          id: 't_' + Date.now() + Math.random()
        });
        count++;
      }
    });
    this.saveData(data);
    this.addLog('Bulk Upload Teachers', `Successfully imported ${count} new teachers.`, 'success');
    return { imported: count, skipped: teachers.length - count };
  }

  public bulkUploadCandidates(candidates: Omit<Candidate, 'id' | 'votesCount'>[]) {
    const data = this.getData();
    let count = 0;
    candidates.forEach(c => {
      if (!data.candidates.some(existing => existing.name.toLowerCase() === c.name.toLowerCase() && existing.position === c.position)) {
        data.candidates.push({
          ...c,
          id: 'c_' + Date.now() + Math.random(),
          votesCount: 0
        });
        count++;
      }
    });
    this.saveData(data);
    this.addLog('Bulk Upload Candidates', `Successfully imported ${count} new candidates.`, 'success');
    return { imported: count, skipped: candidates.length - count };
  }

  // --- RESET / FACTORY SEED ---
  public resetElectionData() {
    const data = this.getData();
    // Reset vote counts and student voted status
    data.candidates.forEach(c => c.votesCount = 0);
    data.students.forEach(s => {
      s.hasVoted = false;
      delete s.votedAt;
    });
    data.votes = [];
    data.electionState.status = 'active';
    data.electionState.startTime = new Date().toISOString();
    this.saveData(data);
    this.addLog('Election Reset', 'All vote counts and student voting records have been cleared for a fresh election.', 'warning');
  }

  public factoryReset() {
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }
}

export const db = new DatabaseService();
