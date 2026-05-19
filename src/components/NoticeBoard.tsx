import React from 'react';
import { FaClipboardList, FaCheckCircle, FaExclamationCircle, FaUserShield } from 'react-icons/fa';

export const NoticeBoard: React.FC = () => {
  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="glass-panel bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl border border-indigo-500/30">
            <FaClipboardList />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Election Notice Board & Rules</h2>
            <p className="text-xs text-slate-400">Important guidelines for all Royal Academy voters during the live digital voting process.</p>
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rule 1 */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">
                <FaCheckCircle className="text-base" />
                <span>One Student, One Vote</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Each student is authorized to cast precisely one ballot. The system enforces strict cryptographic session locking upon submission.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
              Enforced by System Security
            </div>
          </div>

          {/* Rule 2 */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">
                <FaExclamationCircle className="text-base" />
                <span>Lab Silence & Secrecy</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Maintain absolute silence inside the computer lab. Do not discuss your votes with peers or attempt to view others' screens.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
              Monitored by Lab Teachers
            </div>
          </div>

          {/* Rule 3 */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-3">
                <FaUserShield className="text-base" />
                <span>Smart Board & Mobile Access</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You can scan the live QR code at the teacher's smart board to vote instantly from authorized lab tablets or mobile devices.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
              256-bit Encrypted Portal
            </div>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  );
};
