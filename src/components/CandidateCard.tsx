import React from 'react';
import { Candidate } from '../types';
import { FaCheckCircle, FaVoteYea } from 'react-icons/fa';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (candidateId: string) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isSelected, onSelect }) => {
  const getHouseCardStyles = () => {
    switch (candidate.house) {
      case 'Blue':
        return {
          glow: 'hover:shadow-blue-500/30 hover:-translate-y-1',
          border: isSelected ? 'border-blue-500 bg-blue-600/20 shadow-blue-500/40 shadow-2xl' : 'border-blue-500/20 hover:border-blue-500/50 bg-slate-900/60',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          button: isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30'
        };
      case 'Red':
        return {
          glow: 'hover:shadow-red-500/30 hover:-translate-y-1',
          border: isSelected ? 'border-red-500 bg-red-600/20 shadow-red-500/40 shadow-2xl' : 'border-red-500/20 hover:border-red-500/50 bg-slate-900/60',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30',
          button: isSelected ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30'
        };
      case 'Green':
        return {
          glow: 'hover:shadow-green-500/30 hover:-translate-y-1',
          border: isSelected ? 'border-green-500 bg-green-600/20 shadow-green-500/40 shadow-2xl' : 'border-green-500/20 hover:border-green-500/50 bg-slate-900/60',
          badge: 'bg-green-500/20 text-green-300 border-green-500/30',
          button: isSelected ? 'bg-green-600 text-white shadow-lg shadow-green-600/40' : 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30'
        };
      case 'Yellow':
        return {
          glow: 'hover:shadow-yellow-500/30 hover:-translate-y-1',
          border: isSelected ? 'border-amber-500 bg-amber-600/20 shadow-amber-500/40 shadow-2xl' : 'border-amber-500/20 hover:border-amber-500/50 bg-slate-900/60',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          button: isSelected ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40' : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30'
        };
      default:
        return {
          glow: 'hover:shadow-indigo-500/30 hover:-translate-y-1',
          border: isSelected ? 'border-indigo-500 bg-indigo-600/20 shadow-indigo-500/40 shadow-2xl' : 'border-slate-800 hover:border-slate-700 bg-slate-900/60',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          button: isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
        };
    }
  };

  const styles = getHouseCardStyles();

  return (
    <div
      className={`glass-panel rounded-3xl p-5 border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${styles.border} ${styles.glow} shadow-xl transform`}
      onClick={() => onSelect(candidate.id)}
    >
      {/* Selection Checkmark Badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
          <FaCheckCircle className="text-lg" />
        </div>
      )}

      {/* Top Section: Photo & Symbol */}
      <div className="relative mb-4 md:mb-5 group">
        <div className="w-full aspect-[4/3] sm:h-56 sm:aspect-auto rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50 relative shadow-inner">
          <img
            src={candidate.photoUrl}
            alt={candidate.name}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${candidate.name}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        </div>

        {/* Election Symbol Floating Badge */}
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 shadow-2xl flex items-center gap-3 group-hover:scale-105 transition-transform">
          <span className="text-3xl md:text-2xl filter drop-shadow-md">{candidate.symbol}</span>
          <span className="text-xs md:text-[10px] font-extrabold text-slate-200 tracking-wider uppercase">Symbol</span>
        </div>
      </div>

      {/* Middle Section: Details */}
      <div className="flex-1 flex flex-col justify-between mb-5 md:mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2 md:mb-1.5 flex-wrap">
            <span className={`text-xs md:text-[10px] font-extrabold uppercase px-3 py-1 md:px-2.5 md:py-0.5 rounded-lg border tracking-wider ${styles.badge}`}>
              {candidate.house} House
            </span>
            <span className="text-sm md:text-xs text-slate-300 md:text-slate-400 font-bold md:font-semibold">• {candidate.position}</span>
          </div>

          <h3 className="text-2xl md:text-xl font-extrabold text-white tracking-tight mb-3 md:mb-2 group-hover:text-indigo-300 transition-colors drop-shadow-md">
            {candidate.name}
          </h3>

          <p className="text-sm md:text-xs text-slate-200 md:text-slate-300/90 italic line-clamp-3 md:line-clamp-2 bg-slate-950/60 p-3 md:p-2.5 rounded-xl border border-slate-800/80 border-l-4 border-l-indigo-500 shadow-sm">
            "{candidate.slogan}"
          </p>
        </div>
      </div>

      {/* Bottom Section: Vote Action Button */}
      <button
        type="button"
        className={`w-full py-4 px-6 md:py-3 md:px-4 rounded-2xl font-bold text-base md:text-sm flex items-center justify-center gap-3 md:gap-2 transition-all duration-300 active:scale-95 ${styles.button}`}
      >
        <FaVoteYea className="text-xl md:text-base" />
        {isSelected ? 'Selected for Vote' : `Vote for ${candidate.name}`}
      </button>

      {/* Ambient background glow decoration */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/5 blur-3xl pointer-events-none" />
    </div>
  );
};
