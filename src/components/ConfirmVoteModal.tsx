import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaExclamationTriangle, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  selections: { [position: string]: string };
  races: { id: string; title: string; position: string; houseFilter: string }[];
}

export const ConfirmVoteModal: React.FC<ConfirmVoteModalProps> = ({ isOpen, onClose, onConfirm, selections, races }) => {
  const { candidates, currentStudent } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    // Simulate secure cryptographic submission delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    await onConfirm();
    // Modal will close, no need to set isSubmitting(false) unless error
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-panel bg-slate-900/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-xl w-full p-3 sm:p-5 md:p-6 shadow-2xl shadow-indigo-500/10 relative overflow-hidden flex flex-col max-h-[calc(100svh-1rem)]"
        >
          {/* Header */}
          <div className="flex items-start sm:items-center gap-3 pb-3 border-b border-slate-800 mb-3 shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-xl sm:text-2xl shrink-0">
              <FaExclamationTriangle />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">Review & Confirm Your Vote</h2>
              <p className="text-xs text-slate-400">Please review your selections carefully. Once submitted, your vote cannot be changed.</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="ml-auto p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 disabled:opacity-50"
            >
              <FaTimes />
            </button>
          </div>

          {/* Student Info Summary */}
          {currentStudent && (
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div>
                <span className="text-slate-400">Voter: </span>
                <span className="font-bold text-white">{currentStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-400">Class: </span>
                <span className="font-bold text-white">{currentStudent.className}</span>
              </div>
              <div>
                <span className="text-slate-400">House: </span>
                <span className="font-bold text-white">{currentStudent.house} House</span>
              </div>
            </div>
          )}

          {/* Selections List */}
          <div className="space-y-2.5 overflow-y-auto pr-1 sm:pr-2 flex-1 min-h-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 sticky top-0 bg-slate-900/95 py-1 z-10">Your Chosen Candidates:</h3>
            {races.map(race => {
              const candidateId = selections[race.id];
              const candidate = candidates.find(c => c.id === candidateId);

              return (
                <div key={race.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60 gap-2 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${race.houseFilter === 'Blue' ? 'bg-blue-500' : race.houseFilter === 'Red' ? 'bg-red-500' : race.houseFilter === 'Green' ? 'bg-green-500' : race.houseFilter === 'Yellow' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                    <span className="text-xs md:text-sm font-semibold text-slate-300">{race.title === race.position ? race.title : `${race.title} ${race.position}`}:</span>
                  </div>
                  {candidate ? (
                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <span className="text-lg">{candidate.symbol}</span>
                      <span className="text-sm font-bold text-white max-w-[160px] sm:max-w-[200px] truncate">{candidate.name}</span>
                      <span className={`text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-500/30 hidden sm:inline`}>
                        {candidate.house}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 self-end sm:self-auto">
                      No Candidate Selected
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0 pt-3 mt-3 border-t border-slate-800 bg-slate-900/95">
            <button
              type="button"
              id="confirm-modal-btn-back"
              aria-label="Return to candidate selection"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all border border-slate-700 disabled:opacity-50"
            >
              Back to Editing
            </button>
            <button
              type="button"
              id="confirm-modal-btn-submit"
              aria-label="Confirm choices and cast final ballot"
              onClick={handleFinalConfirm}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-emerald-400/30"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Encrypting & Submitting...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-lg" />
                  <span>Confirm & Submit Vote</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
