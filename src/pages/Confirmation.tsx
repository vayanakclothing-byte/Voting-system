import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { FaCheckCircle, FaGraduationCap, FaHome, FaFlagCheckered } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const Confirmation: React.FC = () => {
  const { currentStudent, logoutStudent } = useApp();
  const navigate = useNavigate();

  // Trigger celebration voice announcement
  useEffect(() => {
    const speech = new SpeechSynthesisUtterance('Your vote has been successfully submitted. Thank you for participating in the Royal Academy student council election.');
    window.speechSynthesis.speak(speech);
  }, []);

  const handleFinish = () => {
    logoutStudent();
    navigate('/');
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden">
      {/* Confetti Explosion Effect */}
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        gravity={0.15}
        colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6']}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="glass-panel bg-slate-900/90 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-3xl max-w-xl w-full p-8 md:p-12 shadow-2xl shadow-emerald-500/10 text-center relative overflow-hidden"
      >
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30 border border-emerald-300/40 text-5xl"
        >
          <FaCheckCircle />
        </motion.div>

        {/* School Branding Header */}
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
          <FaGraduationCap className="text-indigo-400 text-lg" />
          <span className="text-xs font-bold uppercase tracking-widest">Royal Academy Election 2083</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-4 bg-gradient-to-r from-emerald-400 via-teal-200 to-white bg-clip-text text-transparent">
          Your Vote Has Been Successfully Submitted
        </h1>

        <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto mb-8 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          Thank you, <strong className="text-white font-bold">{currentStudent?.name || 'Student'}</strong>. Your encrypted ballot has been securely locked and recorded in the lab database. Your session is now concluded.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full sm:w-1/2 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
          >
            <FaFlagCheckered className="text-base" />
            <span>Finish Session</span>
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full sm:w-1/2 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <FaHome className="text-base" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Ambient background glow decoration */}
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </main>
  );
};
