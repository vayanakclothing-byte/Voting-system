import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaChartBar, FaClipboardList, FaPlay, FaPause, FaStop, FaRedoAlt } from 'react-icons/fa';
import { db } from '../../services/db';

interface OverviewPanelProps {
  totalStudents: number;
  participationRate: number;
  candidatesCount: number;
  votesCount: number;
  electionState: any;
  handleUpdateElectionStatus: (status: 'active' | 'paused' | 'completed') => void;
  handleResetElection: () => void;
  refreshData: () => void;
  logs: any[];
  setActiveTab: (tab: any) => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  totalStudents,
  participationRate,
  candidatesCount,
  votesCount,
  electionState,
  handleUpdateElectionStatus,
  handleResetElection,
  refreshData,
  logs,
  setActiveTab
}) => {
  return (
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
          <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidates</div><div className="text-2xl font-extrabold text-white">{candidatesCount}</div></div>
        </div>
        <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30 shrink-0 shadow-inner"><FaClipboardList /></div>
          <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ballots Cast</div><div className="text-2xl font-extrabold text-white">{votesCount}</div></div>
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
  );
};
