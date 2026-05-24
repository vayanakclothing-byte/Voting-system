import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { Student, Teacher, Candidate, Vote, ElectionState, ActivityLog, HouseColor, SchoolClass } from '../types';
import toast from 'react-hot-toast';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface StudentSession {
  id?: string;
  name: string;
  className: string;
  house: HouseColor | 'Teacher';
  hasVoted?: boolean;
  isTeacher?: boolean;
}

interface AppContextType {
  // Data
  candidates: Candidate[];
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  votes: Vote[];
  logs: ActivityLog[];
  electionState: ElectionState;

  // Sessions
  currentStudent: StudentSession | null;
  isAdminLoggedIn: boolean;
  selectedHouse: HouseColor | null;

  // UI States
  isFullscreen: boolean;
  isDarkMode: boolean;
  voiceAnnouncements: boolean;

  // Methods
  loginStudent: (session: StudentSession) => boolean;
  logoutStudent: () => void;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  setSelectedHouse: (house: HouseColor | null) => void;
  toggleFullscreen: () => void;
  toggleDarkMode: () => void;
  toggleVoiceAnnouncements: () => void;
  castStudentVote: (votedCandidates: { [position: string]: string }) => Promise<{ success: boolean; message: string }>;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [electionState, setElectionState] = useState<ElectionState>(db.getElectionState());

  const [currentStudent, setCurrentStudent] = useState<StudentSession | null>(() => {
    const saved = sessionStorage.getItem('currentStudentSession');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  const [selectedHouse, setSelectedHouse] = useState<HouseColor | null>(() => {
    return currentStudent ? currentStudent.house : null;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [voiceAnnouncements, setVoiceAnnouncements] = useState<boolean>(true);

  const refreshData = () => {
    setCandidates(db.getCandidates());
    setStudents(db.getStudents());
    setTeachers(db.getTeachers());
    setClasses(db.getClasses());
    setVotes(db.getVotes());
    setLogs(db.getLogs());
    setElectionState(db.getElectionState());
  };

  useEffect(() => {
    db.initRealtimeListeners();
    const unsubscribeDb = db.subscribe(() => {
      refreshData();
    });
    
    const unsubscribeAuth = auth ? onAuthStateChanged(auth, (user) => {
      setIsAdminLoggedIn(!!user);
    }) : () => {};

    return () => {
      unsubscribeDb();
      unsubscribeAuth();
    };
  }, []);

  // Update house theme when current student changes
  useEffect(() => {
    if (currentStudent) {
      setSelectedHouse(currentStudent.house);
    }
  }, [currentStudent]);

  const loginStudent = (session: StudentSession): boolean => {
    if (electionState.status !== 'active') {
      toast.error('Election is currently not active!');
      return false;
    }

    // Verify if student/teacher already voted
    if (session.isTeacher) {
      const teacher = teachers.find(t => t.id === session.id || t.name.toLowerCase() === session.name.toLowerCase());
      if (teacher && teacher.hasVoted) {
        toast.error('You have already submitted your vote! Multiple voting is strictly prohibited.');
        db.addLog('Security Alert: Duplicate Login Attempt', `Teacher ${session.name} attempted to login again after voting.`, 'danger');
        return false;
      }
    } else {
      const student = students.find(s => s.id === session.id || s.name.toLowerCase() === session.name.toLowerCase());
      if (student && student.hasVoted) {
        toast.error('You have already submitted your vote! Multiple voting is strictly prohibited.');
        db.addLog('Security Alert: Duplicate Login Attempt', `Student ${session.name} (${session.className}) attempted to login again after voting.`, 'danger');
        return false;
      }
    }

    setCurrentStudent(session);
    setSelectedHouse(session.house);
    sessionStorage.setItem('currentStudentSession', JSON.stringify(session));
    toast.success(`Welcome, ${session.name}!`);

    if (voiceAnnouncements) {
      const speech = new SpeechSynthesisUtterance(`Welcome ${session.name} of ${session.house} House. Please cast your vote.`);
      window.speechSynthesis.speak(speech);
    }

    return true;
  };

  const logoutStudent = () => {
    setCurrentStudent(null);
    setSelectedHouse(null);
    sessionStorage.removeItem('currentStudentSession');
  };

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    if (!auth) {
      toast.error('Firebase Auth is not configured. Please add environment variables.');
      return false;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast.success('Admin authenticated successfully');
      db.addLog('Admin Login', 'Admin dashboard accessed via Firebase', 'info');
      return true;
    } catch (error: any) {
      toast.error('Invalid Credentials: ' + error.message);
      db.addLog('Failed Admin Login Attempt', 'Incorrect credentials entered', 'warning');
      return false;
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast.success('Admin logged out');
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(true);
  };

  const toggleVoiceAnnouncements = () => {
    setVoiceAnnouncements(!voiceAnnouncements);
    toast.success(`Voice announcements ${!voiceAnnouncements ? 'enabled' : 'disabled'}`);
  };

  const castStudentVote = async (votedCandidates: { [position: string]: string }): Promise<{ success: boolean; message: string }> => {
    if (!currentStudent) return { success: false, message: 'Not logged in.' };
    const res = await db.castVote(currentStudent.id || '', currentStudent.name, currentStudent.className, currentStudent.house, votedCandidates);
    if (res.success) {
      setCurrentStudent({ ...currentStudent, hasVoted: true });
      if (voiceAnnouncements) {
        const speech = new SpeechSynthesisUtterance('Your vote has been successfully submitted. Thank you.');
        window.speechSynthesis.speak(speech);
      }
    }
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        candidates,
        students,
        teachers,
        classes,
        votes,
        logs,
        electionState,
        currentStudent,
        isAdminLoggedIn,
        selectedHouse,
        isFullscreen,
        isDarkMode,
        voiceAnnouncements,
        loginStudent,
        logoutStudent,
        loginAdmin,
        logoutAdmin,
        setSelectedHouse,
        toggleFullscreen,
        toggleDarkMode,
        toggleVoiceAnnouncements,
        castStudentVote,
        refreshData
      }}
    >
      <div className={`${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen transition-colors duration-300`}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
