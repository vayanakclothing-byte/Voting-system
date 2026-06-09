import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute, FaUserShield, FaSignOutAlt, FaQrcode, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { QRModal } from './QRModal';

export const Navbar: React.FC = () => {
  const {
    currentStudent,
    isAdminLoggedIn,
    selectedHouse,
    isFullscreen,
    voiceAnnouncements,
    logoutStudent,
    logoutAdmin,
    toggleFullscreen,
    toggleVoiceAnnouncements
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (location.pathname === '/public-results' || location.pathname === '/print-report') return null;

  const getHouseBadgeColor = () => {
    switch (selectedHouse) {
      case 'Blue': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Red': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Green': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Yellow': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-slate-700/20 text-slate-300 border-slate-700/30';
    }
  };

  return (
    <>
      <header className="w-full glass-panel border-b border-slate-800/80 sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
        {/* Left: School Logo & Title */}
        <div 
          className={`flex items-center gap-3 ${(!isAdminLoggedIn && !currentStudent && location.pathname === '/results') ? '' : 'cursor-pointer'}`} 
          onClick={() => {
            if (!isAdminLoggedIn && !currentStudent && location.pathname === '/results') return;
            navigate('/');
          }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Royal Academy Logo" className="w-full h-full object-contain filter drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/shapes/svg?seed=RA'; }} />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Royal Academy
            </h1>
            <p className="text-xs text-indigo-400 font-medium tracking-wide">
              Student Council Election 2083
            </p>
          </div>
        </div>

        {/* Center: Active House Indicator / Student Badge */}
        <div className="hidden md:flex items-center gap-3">
          {currentStudent ? (
            <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-inner">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedHouse === 'Blue' ? 'bg-blue-500' : selectedHouse === 'Red' ? 'bg-red-500' : selectedHouse === 'Green' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <span className="text-sm font-semibold text-slate-200">{currentStudent.name}</span>
              <span className="text-xs text-slate-400">({currentStudent.className})</span>
              <span className={`text-xs px-2 py-0.5 rounded-lg border font-bold ${getHouseBadgeColor()}`}>
                {currentStudent.house} House
              </span>
            </div>
          ) : selectedHouse ? (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-bold text-xs ${getHouseBadgeColor()}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              Theme: {selectedHouse} House Active
            </div>
          ) : null}
        </div>

        {/* Right: Quick Tools & Navigation Actions */}
        {(isAdminLoggedIn || currentStudent) && (
          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop Quick Tools */}
            <div className="hidden sm:flex items-center gap-2 md:gap-3">
              {/* QR Code Voting Popup Button */}
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white transition-all tooltip"
                title="Smart Board QR Voting"
              >
                <FaQrcode className="text-base md:text-lg text-indigo-400" />
              </button>

              {/* Voice Announcement Toggle */}
              <button
                onClick={toggleVoiceAnnouncements}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white transition-all"
                title={voiceAnnouncements ? "Mute Voice Announcements" : "Enable Voice Announcements"}
              >
                {voiceAnnouncements ? <FaVolumeUp className="text-base md:text-lg text-emerald-400" /> : <FaVolumeMute className="text-base md:text-lg text-rose-400" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white transition-all"
                title="Fullscreen Election Mode"
              >
                {isFullscreen ? <FaCompress className="text-base md:text-lg text-blue-400" /> : <FaExpand className="text-base md:text-lg text-blue-400" />}
              </button>

              {/* Admin / Logout Actions */}
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  {location.pathname !== '/admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs md:text-sm shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
                    >
                      <FaUserShield />
                      <span>Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={logoutAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs md:text-sm border border-rose-500/30 transition-all"
                    title="Admin Logout"
                  >
                    <FaSignOutAlt />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    logoutStudent();
                    navigate('/');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold text-xs md:text-sm border border-rose-500/30 transition-all"
                >
                  <FaSignOutAlt />
                  <span>Exit Session</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              className="sm:hidden p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        )}
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (isAdminLoggedIn || currentStudent) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden fixed top-[64px] left-0 right-0 z-30 bg-slate-900 border-b border-slate-800 shadow-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-around pb-3 border-b border-slate-800">
              <button
                onClick={() => { setIsQRModalOpen(true); setIsMobileMenuOpen(false); }}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all"
              >
                <div className="p-3 bg-slate-800 rounded-xl"><FaQrcode className="text-xl text-indigo-400" /></div>
                <span className="text-[10px] font-bold mt-1">QR Vote</span>
              </button>

              <button
                onClick={toggleVoiceAnnouncements}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all"
              >
                <div className="p-3 bg-slate-800 rounded-xl">
                  {voiceAnnouncements ? <FaVolumeUp className="text-xl text-emerald-400" /> : <FaVolumeMute className="text-xl text-rose-400" />}
                </div>
                <span className="text-[10px] font-bold mt-1">Voice {voiceAnnouncements ? 'On' : 'Off'}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all"
              >
                <div className="p-3 bg-slate-800 rounded-xl">
                  {isFullscreen ? <FaCompress className="text-xl text-blue-400" /> : <FaExpand className="text-xl text-blue-400" />}
                </div>
                <span className="text-[10px] font-bold mt-1">Fullscreen</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {isAdminLoggedIn ? (
                <>
                  {location.pathname !== '/admin' && (
                    <button
                      onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
                      className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <FaUserShield /> Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => { logoutAdmin(); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-sm flex items-center justify-center gap-2 border border-rose-500/30"
                  >
                    <FaSignOutAlt /> Admin Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    logoutStudent();
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-sm flex items-center justify-center gap-2 border border-rose-500/30"
                >
                  <FaSignOutAlt /> Exit Session
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal Popup */}
      <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </>
  );
};
