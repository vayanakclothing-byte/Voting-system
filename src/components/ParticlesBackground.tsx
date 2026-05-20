import React from 'react';
import { useApp } from '../context/AppContext';

export const ParticlesBackground: React.FC = () => {
  const { selectedHouse } = useApp();

  const getHouseGlowColors = () => {
    switch (selectedHouse) {
      case 'Blue': return { orb1: 'bg-blue-600/20', orb2: 'bg-blue-700/15', orb3: 'bg-blue-400/10' };
      case 'Red': return { orb1: 'bg-red-600/20', orb2: 'bg-red-700/15', orb3: 'bg-red-400/10' };
      case 'Green': return { orb1: 'bg-green-600/20', orb2: 'bg-green-700/15', orb3: 'bg-green-400/10' };
      case 'Yellow': return { orb1: 'bg-amber-600/20', orb2: 'bg-amber-700/15', orb3: 'bg-amber-400/10' };
      default: return { orb1: 'bg-indigo-600/15', orb2: 'bg-purple-600/10', orb3: 'bg-blue-500/10' };
    }
  };

  const colors = getHouseGlowColors();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90" />
      
      {/* CSS Animated Glowing Orbs (Hardware Accelerated) */}
      <div className={`absolute top-10 left-[10%] w-64 md:w-96 h-64 md:h-96 rounded-full blur-[80px] md:blur-[100px] animate-pulse-slow ${colors.orb1} hidden md:block`} />
      <div className={`absolute bottom-20 right-[10%] w-72 md:w-[30rem] h-72 md:h-[30rem] rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow ${colors.orb2} hidden md:block`} style={{ animationDelay: '2s' }} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-[25rem] h-64 md:h-[25rem] rounded-full blur-[60px] md:blur-[90px] animate-pulse-slow ${colors.orb3} hidden md:block`} style={{ animationDelay: '4s' }} />

      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
};
