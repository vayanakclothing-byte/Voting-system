import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { useNavigate } from 'react-router-dom';
import {
  FaUserShield, FaChartBar, FaUsers, FaChalkboardTeacher, FaSchool, FaFileExcel,
  FaClipboardList, FaLock, FaKey
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { OverviewPanel } from '../components/admin/OverviewPanel';
import { CandidatesPanel } from '../components/admin/CandidatesPanel';
import { StudentsPanel } from '../components/admin/StudentsPanel';
import { ClassesPanel } from '../components/admin/ClassesPanel';
import { TeachersPanel } from '../components/admin/TeachersPanel';
import { BulkUploadPanel } from '../components/admin/BulkUploadPanel';
import { LogsPanel } from '../components/admin/LogsPanel';

export const AdminDashboard: React.FC = () => {
  const {
    candidates, students, teachers, classes, votes, logs, electionState,
    isAdminLoggedIn, loginAdmin, logoutAdmin, refreshData
  } = useApp();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminLoggedIn) {
      db.fetchAllStudents().then(() => {
        refreshData();
      });
    }
  }, [isAdminLoggedIn]);

  // Admin Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  // --- LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!isAdminLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 text-3xl shadow-inner">
            <FaLock />
          </div>
          <h1 className="text-2xl font-extrabold text-white text-center mb-2">Admin Dashboard Login</h1>
          <p className="text-xs text-slate-400 text-center mb-6">Enter the secure admin credentials to access the management portal.</p>

          <form onSubmit={(e) => { e.preventDefault(); loginAdmin(email, password); }} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <FaUserShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
        {activeTab === 'overview' && (
          <OverviewPanel
            key="overview"
            totalStudents={totalStudents}
            participationRate={participationRate}
            candidatesCount={candidates.length}
            votesCount={votes.length}
            electionState={electionState}
            handleUpdateElectionStatus={handleUpdateElectionStatus}
            handleResetElection={handleResetElection}
            refreshData={refreshData}
            logs={logs}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'candidates' && <CandidatesPanel key="candidates" candidates={candidates} refreshData={refreshData} />}
        {activeTab === 'students' && <StudentsPanel key="students" students={students} classes={classes} refreshData={refreshData} />}
        {activeTab === 'teachers' && <TeachersPanel key="teachers" teachers={teachers} refreshData={refreshData} />}
        {activeTab === 'classes' && <ClassesPanel key="classes" classes={classes} refreshData={refreshData} />}
        {activeTab === 'bulk' && <BulkUploadPanel key="bulk" refreshData={refreshData} />}
        {activeTab === 'logs' && <LogsPanel key="logs" logs={logs} />}
      </AnimatePresence>
    </main>
  );
};
