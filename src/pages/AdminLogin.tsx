import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaKey, FaUserShield } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const AdminLogin: React.FC = () => {
  const { isAdminLoggedIn, loginAdmin } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin');
    }
  }, [isAdminLoggedIn, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 text-3xl shadow-inner">
          <FaLock />
        </div>
        <h1 className="text-2xl font-extrabold text-white text-center mb-2">Admin Dashboard Login</h1>
        <p className="text-xs text-slate-400 text-center mb-6">Enter the secure admin credentials to access the management portal.</p>

        {lockoutUntil && Date.now() < lockoutUntil && (
          <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold p-3 rounded-xl text-center mb-4">
            Too many failed attempts. Account temporarily locked.
          </div>
        )}

        <form onSubmit={async (e) => {
          e.preventDefault();
          if (lockoutUntil && Date.now() < lockoutUntil) {
            const secsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
            alert(`Too many failed attempts. Please wait ${secsLeft} seconds.`);
            return;
          }
          const success = await loginAdmin(email, password);
          if (!success) {
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            if (newAttempts >= 5) {
              setLockoutUntil(Date.now() + 60000);
              setLoginAttempts(0);
            }
          }
        }} className="space-y-6">
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
};
