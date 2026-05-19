import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaBullhorn, FaClock, FaHourglassHalf } from 'react-icons/fa';

export const AnnouncementBanner: React.FC = () => {
  const { electionState } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');

  // Live Digital Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Election Countdown Timer
  useEffect(() => {
    if (!electionState.endTime) return;
    const end = new Date(electionState.endTime).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setCountdown('Election Ended');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [electionState.endTime]);

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 text-slate-300 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2 z-40 relative text-sm font-medium">
      {/* Left: Marquee Announcement */}
      <div className="flex items-center gap-2 w-full md:w-1/2 overflow-hidden">
        <FaBullhorn className="text-amber-400 shrink-0 animate-bounce" />
        <span className="text-xs uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold shrink-0 border border-amber-500/30">
          Notice
        </span>
        <div className="relative w-full overflow-hidden whitespace-nowrap">
          <p className="animate-[marquee_25s_linear_infinite] inline-block pl-[100%] text-slate-200 hover:pause">
            {electionState.announcement || 'Welcome to Royal Academy Student Council Election 2083. Cast your vote securely!'}
          </p>
        </div>
      </div>

      {/* Right: Live Clock & Countdown */}
      <div className="flex items-center gap-6 shrink-0 text-xs md:text-sm">
        {/* Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
          <span className={`w-2 h-2 rounded-full ${electionState.status === 'active' ? 'bg-emerald-500 animate-ping' : electionState.status === 'paused' ? 'bg-amber-500' : 'bg-rose-500'}`} />
          <span className="capitalize font-semibold text-slate-200">
            {electionState.status} Mode
          </span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">
          <FaClock className="text-blue-400" />
          <span className="font-mono font-bold text-slate-100">{currentTime}</span>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-1.5 bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-800/50 text-indigo-200">
          <FaHourglassHalf className="text-indigo-400 animate-spin-slow" />
          <span className="font-mono font-bold">{countdown || '00h 00m 00s'}</span>
        </div>
      </div>
    </div>
  );
};
