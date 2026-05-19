import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { Candidate, Student, Teacher, HouseColor, SchoolClass } from '../types';
import * as XLSX from 'xlsx';
import {
  FaUserShield, FaPlay, FaPause, FaStop, FaRedoAlt, FaPlus, FaEdit, FaTrash, FaFileExcel,
  FaFileCsv, FaDownload, FaUpload, FaCheckCircle, FaExclamationTriangle, FaTimes, FaChartBar,
  FaUsers, FaChalkboardTeacher, FaSchool, FaClipboardList, FaLock, FaKey, FaSave
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard: React.FC = () => {
  const {
    candidates, students, teachers, classes, votes, logs, electionState,
    isAdminLoggedIn, loginAdmin, logoutAdmin, refreshData
  } = useApp();

  const navigate = useNavigate();

  // Admin Login PIN State
  const [pinInput, setPinInput] = useState('');

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'students' | 'teachers' | 'classes' | 'bulk' | 'logs'>('overview');

  // --- ELECTION CONTROLS ---
  const handleUpdateElectionStatus = (status: 'active' | 'paused' | 'completed') => {
    db.updateElectionState({ status });
    refreshData();
  };

  const handleResetElection = () => {
    const confirm = window.confirm('WARNING: Are you absolutely sure you want to reset the election? This will clear all vote counts and student voting records!');
    if (confirm) {
      db.resetElectionData();
      refreshData();
      alert('Election has been reset successfully.');
    }
  };

  // --- CANDIDATES MANAGEMENT STATES ---
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candName, setCandName] = useState('');
  const [candPos, setCandPos] = useState<Candidate['position']>('Head Boy');
  const [candHouse, setCandHouse] = useState<HouseColor>('Blue');
  const [candSlogan, setCandSlogan] = useState('');
  const [candSymbol, setCandSymbol] = useState('');
  const [candPhoto, setCandPhoto] = useState('');

  const handleOpenAddCandidate = () => {
    setEditingCandidateId(null);
    setCandName(''); setCandPos('Head Boy'); setCandHouse('Blue'); setCandSlogan(''); setCandSymbol('⭐'); setCandPhoto('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditCandidate = (c: Candidate) => {
    setEditingCandidateId(c.id);
    setCandName(c.name); setCandPos(c.position); setCandHouse(c.house); setCandSlogan(c.slogan); setCandSymbol(c.symbol); setCandPhoto(c.photoUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCandidateId) {
      db.updateCandidate(editingCandidateId, { name: candName, position: candPos, house: candHouse, slogan: candSlogan, symbol: candSymbol, photoUrl: candPhoto });
    } else {
      db.addCandidate({ name: candName, position: candPos, house: candHouse, slogan: candSlogan, symbol: candSymbol, photoUrl: candPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' });
    }
    refreshData();
    setEditingCandidateId(null);
    setCandName(''); setCandPos('Head Boy'); setCandHouse('Blue'); setCandSlogan(''); setCandSymbol('⭐'); setCandPhoto('');
  };

  const handleDeleteCandidate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      db.deleteCandidate(id);
      refreshData();
    }
  };

  // --- STUDENTS MANAGEMENT STATES ---
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studName, setStudName] = useState('');
  const [studClass, setStudClass] = useState('');
  const [studSection, setStudSection] = useState('');
  const [studHouse, setStudHouse] = useState<HouseColor>('Blue');
  const [studRoll, setStudRoll] = useState('');

  const handleOpenAddStudent = () => {
    setEditingStudentId(null);
    setStudName(''); setStudClass(classes[0]?.name || 'Class 10'); setStudSection('A'); setStudHouse('Blue'); setStudRoll('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setStudName(s.name); setStudClass(s.className); setStudSection(s.section || ''); setStudHouse(s.house); setStudRoll(s.rollNumber || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudentId) {
      db.updateStudent(editingStudentId, { name: studName, className: studClass, section: studSection, house: studHouse, rollNumber: studRoll });
    } else {
      db.addStudent({ name: studName, className: studClass, section: studSection, house: studHouse, rollNumber: studRoll });
    }
    refreshData();
    setEditingStudentId(null);
    setStudName(''); setStudClass(classes[0]?.name || 'Class 10'); setStudSection('A'); setStudHouse('Blue'); setStudRoll('');
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Delete student?')) { db.deleteStudent(id); refreshData(); }
  };

  // --- TEACHERS MANAGEMENT STATES ---
  const [teachName, setTeachName] = useState('');
  const [teachSubj, setTeachSubj] = useState('');
  const [teachDept, setTeachDept] = useState('');

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    db.addTeacher({ name: teachName, subject: teachSubj, department: teachDept });
    refreshData(); setTeachName(''); setTeachSubj(''); setTeachDept('');
  };

  const handleDeleteTeacher = (id: string) => {
    if (window.confirm('Delete teacher?')) { db.deleteTeacher(id); refreshData(); }
  };

  // --- CLASSES MANAGEMENT STATES ---
  const [classNameInput, setClassNameInput] = useState('');
  const [classSecInput, setClassSecInput] = useState('A, B, C');

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    db.addClass({ name: classNameInput, sections: classSecInput.split(',').map(s => s.trim()) });
    refreshData(); setClassNameInput('');
  };

  const handleDeleteClass = (id: string) => {
    if (window.confirm('Delete class?')) { db.deleteClass(id); refreshData(); }
  };

  // --- BULK UPLOAD STATES ---
  const [bulkType, setBulkType] = useState<'students' | 'teachers' | 'candidates'>('students');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploadReport, setUploadReport] = useState<{ imported: number; skipped: number } | null>(null);

  const downloadSampleTemplate = () => {
    let wsData: any[] = [];
    if (bulkType === 'students') {
      wsData = [
        ['Student Name', 'Class', 'Section', 'House Color', 'Roll Number'],
        ['John Doe', 'Class 10', 'A', 'Blue', '101'],
        ['Jane Smith', 'Class 10', 'B', 'Red', '102']
      ];
    } else if (bulkType === 'teachers') {
      wsData = [
        ['Teacher Name', 'Subject', 'Department'],
        ['Mr. Alan Turing', 'Computer Science', 'Science'],
        ['Dr. Marie Curie', 'Chemistry', 'Science']
      ];
    } else {
      wsData = [
        ['Candidate Name', 'Position', 'House', 'Slogan', 'Symbol', 'Photo URL'],
        ['Leo Vance', 'Head Boy', 'Blue', 'Leading with Honor!', '⚓', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400']
      ];
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, `${bulkType}_sample_template.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setParsedRows(data);
      setUploadReport(null);
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkUpload = () => {
    if (parsedRows.length === 0) return;

    if (bulkType === 'students') {
      const formatted = parsedRows.map(r => ({
        name: r['Student Name'] || r['name'] || 'Unknown',
        className: r['Class'] || r['className'] || 'Class 10',
        section: r['Section'] || r['section'] || 'A',
        house: ['Blue', 'Red', 'Green', 'Yellow'].includes(r['House Color']) ? r['House Color'] : 'Blue',
        rollNumber: r['Roll Number'] || r['rollNumber'] || ''
      }));
      const res = db.bulkUploadStudents(formatted);
      setUploadReport(res);
    } else if (bulkType === 'teachers') {
      const formatted = parsedRows.map(r => ({
        name: r['Teacher Name'] || r['name'] || 'Unknown',
        subject: r['Subject'] || r['subject'] || '',
        department: r['Department'] || r['department'] || ''
      }));
      const res = db.bulkUploadTeachers(formatted);
      setUploadReport(res);
    } else {
      const formatted = parsedRows.map(r => ({
        name: r['Candidate Name'] || r['name'] || 'Unknown',
        position: ['Head Boy', 'Head Girl', 'Sports Captain', 'Discipline Captain'].includes(r['Position']) ? r['Position'] : 'Head Boy',
        house: ['Blue', 'Red', 'Green', 'Yellow'].includes(r['House']) ? r['House'] : 'Blue',
        slogan: r['Slogan'] || r['slogan'] || 'Excellence in Action!',
        symbol: r['Symbol'] || r['symbol'] || '⭐',
        photoUrl: r['Photo URL'] || r['photoUrl'] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      }));
      const res = db.bulkUploadCandidates(formatted);
      setUploadReport(res);
    }

    refreshData();
    setParsedRows([]);
  };

  // --- LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isAdminLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 text-3xl shadow-inner">
            <FaLock />
          </div>
          <h1 className="text-2xl font-extrabold text-white text-center mb-2">Admin Dashboard Login</h1>
          <p className="text-xs text-slate-400 text-center mb-6">Enter the secure election officer PIN to access the management portal. (Demo PIN: 2083 or admin)</p>

          <form onSubmit={(e) => { e.preventDefault(); loginAdmin(pinInput); }} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Security PIN</label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner tracking-widest font-mono"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all border border-indigo-400/30">
              Authenticate
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  const totalStudents = students.length;
  const votedStudents = students.filter(s => s.hasVoted).length;
  const participationRate = totalStudents > 0 ? Math.round((votedStudents / totalStudents) * 100) : 0;

  return (
    <main className="min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Top Admin Header */}
      <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl border border-indigo-500/30">
              Super Admin Panel
            </span>
            <span className="text-xs text-slate-400 font-semibold">Royal Academy 2083</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Election Management Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
            Configure candidates, monitor live voting activity, manage bulk school data, and control the live election state.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/results')} className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs md:text-sm transition-all border border-slate-700 flex items-center gap-2">
            <FaChartBar />
            <span>Live Results</span>
          </button>
          <button onClick={logoutAdmin} className="px-5 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-xs md:text-sm border border-rose-500/30 transition-all flex items-center gap-2">
            <span>Logout Admin</span>
          </button>
        </div>

        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full overflow-x-auto mb-8 shadow-inner">
        {[
          { id: 'overview', label: 'Overview & Controls', icon: FaUserShield },
          { id: 'candidates', label: `Candidates (${candidates.length})`, icon: FaUsers },
          { id: 'students', label: `Students (${students.length})`, icon: FaUsers },
          { id: 'teachers', label: `Teachers (${teachers.length})`, icon: FaChalkboardTeacher },
          { id: 'classes', label: `Classes (${classes.length})`, icon: FaSchool },
          { id: 'bulk', label: 'Bulk Data Upload', icon: FaFileExcel },
          { id: 'logs', label: 'Activity Logs', icon: FaClipboardList }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW & ELECTION CONTROLS */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl border border-blue-500/30 shrink-0 shadow-inner"><FaUsers /></div>
                <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Voters</div><div className="text-2xl font-extrabold text-white">{totalStudents}</div></div>
              </div>
              <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30 shrink-0 shadow-inner"><FaChartBar /></div>
                <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voter Turnout</div><div className="text-2xl font-extrabold text-white">{participationRate}%</div></div>
              </div>
              <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl border border-indigo-500/30 shrink-0 shadow-inner"><FaUsers /></div>
                <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidates</div><div className="text-2xl font-extrabold text-white">{candidates.length}</div></div>
              </div>
              <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30 shrink-0 shadow-inner"><FaClipboardList /></div>
                <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ballots Cast</div><div className="text-2xl font-extrabold text-white">{votes.length}</div></div>
              </div>
            </div>

            {/* Master Election Controls */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-extrabold text-white mb-2">Master Election Controls</h2>
              <p className="text-xs text-slate-400 mb-6">Control the live state of the lab voting portal. Pausing or stopping locks all student screens instantly.</p>

              <div className="flex flex-wrap items-center gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 shadow-inner">
                <div className="flex items-center gap-3 mr-auto">
                  <span className={`w-3.5 h-3.5 rounded-full ${electionState.status === 'active' ? 'bg-emerald-500 animate-ping' : electionState.status === 'paused' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  <div>
                    <span className="text-sm font-bold text-white capitalize">Status: {electionState.status} Mode</span>
                    <div className="text-xs text-slate-400">{electionState.status === 'active' ? 'Students can log in and cast votes.' : 'Voting portal is currently locked.'}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => handleUpdateElectionStatus('active')} disabled={electionState.status === 'active'} className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center gap-2 border border-emerald-400/30">
                    <FaPlay /><span>Start / Resume</span>
                  </button>
                  <button onClick={() => handleUpdateElectionStatus('paused')} disabled={electionState.status === 'paused'} className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50 flex items-center gap-2 border border-amber-400/30">
                    <FaPause /><span>Pause</span>
                  </button>
                  <button onClick={() => handleUpdateElectionStatus('completed')} disabled={electionState.status === 'completed'} className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center gap-2 border border-rose-400/30">
                    <FaStop /><span>Stop Election</span>
                  </button>
                  <div className="h-8 w-px bg-slate-700 mx-2 hidden sm:block"></div>
                  <button 
                    onClick={() => {
                      db.updateElectionState({ allowManualTyping: !electionState.allowManualTyping });
                      refreshData();
                    }} 
                    className={`px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border ${electionState.allowManualTyping ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                  >
                    <span>{electionState.allowManualTyping ? 'Typing: ON' : 'Typing: OFF'}</span>
                  </button>
                  <button onClick={handleResetElection} className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-700">
                    <FaRedoAlt /><span>Factory Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Voting Activity Logs Preview */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-xl font-extrabold text-white mb-1">Live Voting Activity</h2><p className="text-xs text-slate-400">Real-time audit logs of lab voting actions.</p></div>
                <button onClick={() => setActiveTab('logs')} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">View All Logs →</button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {logs.slice(0, 5).map(log => (
                  <div key={log.id} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-start justify-between gap-4 shadow-inner">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'danger' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <span className="text-xs font-bold text-white">{log.action}</span>
                      </div>
                      <p className="text-xs text-slate-300">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CANDIDATES MANAGEMENT */}
        {activeTab === 'candidates' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
            {/* Add / Edit Form */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-white">{editingCandidateId ? 'Edit Candidate Details' : 'Register New Candidate'}</h2>
                {editingCandidateId && (
                  <button onClick={handleOpenAddCandidate} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                    <FaPlus /><span>Switch to Add New</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCandidate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Candidate Name</label>
                  <input type="text" value={candName} onChange={e => setCandName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Position</label>
                  <select value={candPos} onChange={e => setCandPos(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner">
                    <option value="Head Boy">Head Boy</option><option value="Head Girl">Head Girl</option><option value="Sports Captain">Sports Captain</option><option value="Discipline Captain">Discipline Captain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">House Color</label>
                  <select value={candHouse} onChange={e => setCandHouse(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner">
                    <option value="Blue">Blue House</option><option value="Red">Red House</option><option value="Green">Green House</option><option value="Yellow">Yellow House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Election Symbol (Emoji/Icon)</label>
                  <input type="text" value={candSymbol} onChange={e => setCandSymbol(e.target.value)} placeholder="⭐, ⚓, 🔥, etc." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Campaign Slogan</label>
                  <input type="text" value={candSlogan} onChange={e => setCandSlogan(e.target.value)} placeholder="Short inspiring slogan" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Photo URL</label>
                  <input type="url" value={candPhoto} onChange={e => setCandPhoto(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                  <button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-2">
                    <FaSave /><span>{editingCandidateId ? 'Update Candidate' : 'Save Candidate'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Candidates Table List */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-x-auto">
              <h2 className="text-xl font-extrabold text-white mb-6">Registered Candidates List</h2>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4 pl-4">Candidate</th>
                    <th className="pb-4">Position</th>
                    <th className="pb-4">House</th>
                    <th className="pb-4">Symbol</th>
                    <th className="pb-4">Votes</th>
                    <th className="pb-4 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {candidates.map(cand => (
                    <tr key={cand.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 pl-4 flex items-center gap-3">
                        <img src={cand.photoUrl} alt={cand.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div><div className="font-bold text-white">{cand.name}</div><div className="text-xs text-slate-400 italic">"{cand.slogan}"</div></div>
                      </td>
                      <td className="py-4 font-semibold text-indigo-400">{cand.position}</td>
                      <td className="py-4"><span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${cand.house === 'Blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : cand.house === 'Red' ? 'bg-red-500/20 text-red-300 border-red-500/30' : cand.house === 'Green' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>{cand.house}</span></td>
                      <td className="py-4 text-xl">{cand.symbol}</td>
                      <td className="py-4 font-extrabold text-white">{cand.votesCount}</td>
                      <td className="py-4 pr-4 text-right space-x-2">
                        <button onClick={() => handleOpenEditCandidate(cand)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700"><FaEdit /></button>
                        <button onClick={() => handleDeleteCandidate(cand.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white border border-slate-700"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 3: STUDENTS MANAGEMENT */}
        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
            {/* Add / Edit Form */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-white">{editingStudentId ? 'Edit Student Details' : 'Register New Student'}</h2>
                {editingStudentId && <button onClick={handleOpenAddStudent} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">Switch to Add New</button>}
              </div>

              <form onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Student Name</label>
                  <input type="text" value={studName} onChange={e => setStudName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Class</label>
                  <select value={studClass} onChange={e => setStudClass(e.target.value)} className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner">
                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">House Color</label>
                  <select value={studHouse} onChange={e => setStudHouse(e.target.value as any)} className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner">
                    <option value="Blue">Blue</option><option value="Red">Red</option><option value="Green">Green</option><option value="Yellow">Yellow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Roll No.</label>
                  <input type="text" value={studRoll} onChange={e => setStudRoll(e.target.value)} placeholder="e.g. 101" className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" />
                </div>
                <div className="md:col-span-5 flex justify-end gap-3 pt-2">
                  <button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-2">
                    <FaSave /><span>{editingStudentId ? 'Update Student' : 'Save Student'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Students Table */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-x-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-extrabold text-white">Registered Students ({students.length})</h2>
                <button 
                  onClick={() => {
                    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
                      Name: s.name,
                      Class: s.className,
                      Section: s.section || 'N/A',
                      House: s.house,
                      'Roll No': s.rollNumber || 'N/A',
                      'Voted Status': s.hasVoted ? 'VOTED' : 'PENDING'
                    })));
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Voter Directory");
                    XLSX.writeFile(wb, "Voter_Directory_Report.xlsx");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-2 border border-indigo-500/30 transition-colors"
                >
                  <FaDownload />
                  <span>Export Voter Directory</span>
                </button>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4 pl-4">Name</th><th className="pb-4">Class</th><th className="pb-4">House</th><th className="pb-4">Roll No.</th><th className="pb-4">Voting Status</th><th className="pb-4 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {students.map(stud => (
                    <tr key={stud.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 pl-4 font-bold text-white">{stud.name}</td>
                      <td className="py-4 text-slate-300">{stud.className} {stud.section ? `(Sec ${stud.section})` : ''}</td>
                      <td className="py-4"><span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${stud.house === 'Blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : stud.house === 'Red' ? 'bg-red-500/20 text-red-300 border-red-500/30' : stud.house === 'Green' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>{stud.house}</span></td>
                      <td className="py-4 text-slate-400 font-mono">{stud.rollNumber || 'N/A'}</td>
                      <td className="py-4">{stud.hasVoted ? <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold flex items-center gap-1 w-max"><FaCheckCircle /><span>Voted</span></span> : <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 font-bold flex items-center gap-1 w-max"><FaExclamationTriangle /><span>Pending</span></span>}</td>
                      <td className="py-4 pr-4 text-right space-x-2">
                        <button onClick={() => handleOpenEditStudent(stud)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700"><FaEdit /></button>
                        <button onClick={() => handleDeleteStudent(stud.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white border border-slate-700"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: TEACHERS MANAGEMENT */}
        {activeTab === 'teachers' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-extrabold text-white mb-6">Register New Teacher Supervisor</h2>
              <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Teacher Name</label><input type="text" value={teachName} onChange={e => setTeachName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required /></div>
                <div><label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Subject</label><input type="text" value={teachSubj} onChange={e => setTeachSubj(e.target.value)} placeholder="e.g. Mathematics" className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" /></div>
                <div><label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Department</label><input type="text" value={teachDept} onChange={e => setTeachDept(e.target.value)} placeholder="e.g. Science" className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" /></div>
                <div className="md:col-span-3 flex justify-end pt-2"><button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-2"><FaSave /><span>Save Teacher</span></button></div>
              </form>
            </div>

            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-x-auto">
              <h2 className="text-xl font-extrabold text-white mb-6">Registered Teachers ({teachers.length})</h2>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead><tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider"><th className="pb-4 pl-4">Name</th><th className="pb-4">Subject</th><th className="pb-4">Department</th><th className="pb-4 pr-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {teachers.map(teach => (
                    <tr key={teach.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 pl-4 font-bold text-white">{teach.name}</td><td className="py-4 text-slate-300">{teach.subject || 'N/A'}</td><td className="py-4 text-slate-400">{teach.department || 'N/A'}</td>
                      <td className="py-4 pr-4 text-right"><button onClick={() => handleDeleteTeacher(teach.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white border border-slate-700"><FaTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 5: CLASSES & HOUSES MANAGEMENT */}
        {activeTab === 'classes' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-extrabold text-white mb-6">Register New School Class</h2>
              <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Class Name</label><input type="text" value={classNameInput} onChange={e => setClassNameInput(e.target.value)} placeholder="e.g. Class 10" className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required /></div>
                <div><label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sections (Comma Separated)</label><input type="text" value={classSecInput} onChange={e => setClassSecInput(e.target.value)} placeholder="A, B, C" className="w-full bg-slate-95 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required /></div>
                <div className="md:col-span-2 flex justify-end pt-2"><button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-2"><FaSave /><span>Save Class</span></button></div>
              </form>
            </div>

            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-x-auto">
              <h2 className="text-xl font-extrabold text-white mb-6">Registered Classes ({classes.length})</h2>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead><tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider"><th className="pb-4 pl-4">Class Name</th><th className="pb-4">Available Sections</th><th className="pb-4 pr-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {classes.map(cls => (
                    <tr key={cls.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 pl-4 font-bold text-white">{cls.name}</td><td className="py-4 text-slate-300">{cls.sections.join(', ')}</td>
                      <td className="py-4 pr-4 text-right"><button onClick={() => handleDeleteClass(cls.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white border border-slate-700"><FaTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 6: BULK DATA UPLOAD */}
        {activeTab === 'bulk' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-extrabold text-white mb-2">Excel & CSV Bulk Data Import</h2>
              <p className="text-xs text-slate-400 mb-6">Upload student rosters, teacher lists, or candidate manifests in bulk. Download the sample template to ensure correct column headers.</p>

              {/* Upload Type Selector */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Table:</label>
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['students', 'teachers', 'candidates'] as const).map(type => (
                    <button key={type} onClick={() => { setBulkType(type); setParsedRows([]); setUploadReport(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${bulkType === type ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                <button onClick={downloadSampleTemplate} className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5 shadow-inner">
                  <FaDownload /><span>Download {bulkType} Template</span>
                </button>
              </div>

              {/* Drag and drop / file input container */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl p-10 text-center bg-slate-950/40 transition-colors mb-6 relative group">
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 text-3xl group-hover:scale-110 transition-transform shadow-inner">
                  <FaUpload />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Click or Drag Excel/CSV File Here</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Supports .xlsx, .xls, and .csv formats matching the sample template structure.</p>
              </div>

              {/* Upload Success Report */}
              {uploadReport && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between text-xs text-emerald-200 shadow-inner">
                  <div className="flex items-center gap-2 font-bold"><FaCheckCircle className="text-emerald-400 text-base" /><span>Bulk Import Complete!</span></div>
                  <div className="flex items-center gap-4"><span>Successfully Imported: <strong className="text-white font-extrabold">{uploadReport.imported}</strong></span><span>Duplicates Skipped: <strong className="text-white font-extrabold">{uploadReport.skipped}</strong></span></div>
                </div>
              )}

              {/* Data Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white">Data Preview ({parsedRows.length} rows ready to import)</h3>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setParsedRows([])} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors border border-slate-700 flex items-center gap-1.5">
                        <FaTimes /><span>Cancel</span>
                      </button>
                      <button onClick={handleConfirmBulkUpload} className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 border border-emerald-400/30">
                        <FaCheckCircle /><span>Confirm & Save Data</span>
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-auto border border-slate-800 rounded-2xl bg-slate-950">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold sticky top-0">
                          {Object.keys(parsedRows[0]).map(key => <th key={key} className="p-3">{key}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {parsedRows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-900/50">
                            {Object.values(row).map((val: any, j) => <td key={j} className="p-3 truncate max-w-xs">{String(val)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 7: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-extrabold text-white mb-2">Complete Audit Logs</h2>
            <p className="text-xs text-slate-400 mb-6">Full chronological record of all administrative and student voting events.</p>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {logs.map(log => (
                <div key={log.id} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-start justify-between gap-4 shadow-inner">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'danger' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <span className="text-xs font-bold text-white">{log.action}</span>
                    </div>
                    <p className="text-xs text-slate-300">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
