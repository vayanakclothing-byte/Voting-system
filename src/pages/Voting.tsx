import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { CandidateCard } from '../components/CandidateCard';
import { ConfirmVoteModal } from '../components/ConfirmVoteModal';
import { FaUserShield, FaExclamationCircle, FaCheckCircle, FaUndoAlt, FaLock, FaArrowRight, FaArrowLeft, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { GLOBAL_POSITIONS, HOUSE_POSITIONS } from '../types';

export const Voting: React.FC = () => {
  const {
    candidates,
    currentStudent,
    selectedHouse,
    electionState,
    castStudentVote,
    logoutStudent
  } = useApp();

  const navigate = useNavigate();

  // Redirect if no active student session
  useEffect(() => {
    if (!currentStudent) {
      navigate('/');
    }
  }, [currentStudent, navigate]);

  // Selections: { 'Head Boy': candidateId, ... }
  const [selections, setSelections] = useState<{ [position: string]: string }>(() => {
    // Load saved progress
    const saved = localStorage.getItem(`voting_progress_${currentStudent?.id}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const positions = [...GLOBAL_POSITIONS, ...HOUSE_POSITIONS];

  // Auto-save selections
  useEffect(() => {
    if (currentStudent) {
       localStorage.setItem(`voting_progress_${currentStudent.id}`, JSON.stringify(selections));
    }
  }, [selections, currentStudent]);

  if (!currentStudent) return null;

  // Filter logic based on the position
  const getCandidatesForPosition = (pos: string) => {
    if (GLOBAL_POSITIONS.includes(pos)) {
       return candidates.filter(c => c.position === pos);
    }
    // House position logic
    if (currentStudent.isTeacher) {
       // Teachers can see candidates from all houses, but here let's assume they shouldn't vote for house captains 
       // based on standard school rules unless specified. We will allow them to vote for all for now.
       return candidates.filter(c => c.position === pos);
    }
    return candidates.filter(c => c.position === pos && c.house === selectedHouse);
  };

  const handleSelectCandidate = (position: string, candidateId: string) => {
    setSelections(prev => ({
      ...prev,
      [position]: candidateId
    }));
  };

  const currentPosition = positions[currentStep];
  const currentPosCandidates = getCandidatesForPosition(currentPosition);

  const handleNext = () => {
     if (currentStep < positions.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0,0);
     } else {
        handleOpenConfirm();
     }
  };

  const handleBack = () => {
     if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0,0);
     }
  };

  const handleOpenConfirm = () => {
    // Validate that student has selected a candidate for all positions
    const missingPositions = positions.filter(pos => !selections[pos]);

    if (missingPositions.length > 0) {
      const proceed = window.confirm(`You have not selected candidates for: ${missingPositions.join(', ')}. Do you wish to proceed with an incomplete ballot?`);
      if (!proceed) return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirmVote = async () => {
    const result = await castStudentVote(selections);
    setIsConfirmModalOpen(false);

    if (result.success) {
      localStorage.removeItem(`voting_progress_${currentStudent.id}`);
      navigate('/confirmation');
    } else {
      alert(result.message);
      if (result.message.includes('already submitted')) {
        logoutStudent();
        navigate('/');
      }
    }
  };

  return (
    <main className="min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Top Banner Info */}
      <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl border border-indigo-500/30">
              Live Lab Voting Portal
            </span>
            <span className="text-xs text-slate-400 font-semibold">🔒 256-bit Encrypted Session</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Cast Your Encrypted Ballot
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
            Welcome, <strong className="text-white font-bold">{currentStudent.name}</strong>. You are viewing candidates {currentStudent.isTeacher ? 'across all houses' : <>exclusively for the <strong className="text-white font-bold">{currentStudent.house} House</strong></>}. Please select one candidate for each position below.
          </p>
        </div>

        {/* Security Lock Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shrink-0 shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30">
            <FaUserShield />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Session Protected</div>
            <div className="text-[10px] text-slate-400">Auto-lock on submission</div>
          </div>
        </div>

        {/* Ambient background glow decoration */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Positions Grid */}
      {electionState.status !== 'active' ? (
        <div className="glass-panel bg-rose-500/10 border border-rose-500/20 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl">
          <FaLock className="text-rose-500 text-5xl mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Election is Currently Locked</h2>
          <p className="text-xs text-slate-300 mb-6">The election officer has paused or stopped the voting process. Please wait for the lab instructor's announcement.</p>
          <button
            onClick={() => { logoutStudent(); navigate('/'); }}
            className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
          >
            Return to Home
          </button>
        </div>
      ) : ( candidates.length === 0 ? (
        <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl">
          <FaExclamationCircle className="text-amber-400 text-5xl mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">No Candidates Found</h2>
          <p className="text-xs text-slate-400 mb-6">No candidates have been registered {currentStudent.isTeacher ? 'yet' : `for ${selectedHouse} House yet`}. Please inform your lab supervisor.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="space-y-10 mb-12">
            <div className="flex items-center justify-between text-slate-400 text-sm font-bold mb-4">
               <span>Voting Step {currentStep + 1} of {positions.length}</span>
               <span className="flex items-center gap-1 text-emerald-400"><FaSave /> Progress Auto-Saved</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-8">
              <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / positions.length) * 100}%` }}></div>
            </div>

            <AnimatePresence mode="wait">
              <motion.section 
                key={currentPosition}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-panel bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl"
              >
                {/* Category Header */}
                <div className="mb-6">
                   <div className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-700 mb-4">
                      {GLOBAL_POSITIONS.includes(currentPosition) ? "School Leadership" : "Your House Elections"}
                   </div>
                </div>

                {/* Position Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <span>{currentPosition}</span>
                      {selections[currentPosition] && (
                        <FaCheckCircle className="text-emerald-400 text-lg" title="Candidate Selected" />
                      )}
                    </h2>
                    <p className="text-xs text-slate-400">Select your preferred leader for this role.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Selected:</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${selections[currentPosition] ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {selections[currentPosition]
                        ? currentPosCandidates.find(c => c.id === selections[currentPosition])?.name
                        : 'None Selected'}
                    </span>
                  </div>
                </div>

                {/* Candidate Cards Grid */}
                {currentPosCandidates.length === 0 ? (
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 text-center text-xs text-slate-400 font-medium">
                    No candidates registered for {currentPosition} {currentStudent.isTeacher ? 'across any house' : `in ${selectedHouse} House`}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {currentPosCandidates.map(candidate => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={selections[currentPosition] === candidate.id}
                        onSelect={(id) => handleSelectCandidate(currentPosition, id)}
                      />
                    ))}
                  </div>
                )}
                
                {/* Navigation inside card */}
                <div className="mt-10 flex items-center justify-between border-t border-slate-800 pt-6">
                   <button
                     onClick={handleBack}
                     disabled={currentStep === 0}
                     className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                   >
                     <FaArrowLeft /> Back
                   </button>

                   <button
                     onClick={handleNext}
                     className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center gap-2"
                   >
                     {currentStep === positions.length - 1 ? 'Review Ballot' : 'Next Position'} <FaArrowRight />
                   </button>
                </div>
              </motion.section>
            </AnimatePresence>
        </div>
      ))}

      {/* Bottom Sticky Action Bar */}
      {electionState.status === 'active' && candidates.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 glass-panel bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 p-4 md:p-6 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl"
        >
          <div className="flex items-center gap-4 text-xs md:text-sm text-slate-300">
            <div>
              <span className="text-slate-400">Positions Selected: </span>
              <strong className="text-white font-bold">
                {Object.keys(selections).filter(pos => selections[pos]).length} / {positions.length}
              </strong>
            </div>
            <div className="hidden sm:block text-slate-600">|</div>
            <div className="hidden sm:block">
              <span className="text-slate-400">Voting for: </span>
              <strong className="text-white font-bold">{currentStudent.isTeacher ? 'All Houses' : `${currentStudent.house} House`}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                 setSelections({});
                 setCurrentStep(0);
                 localStorage.removeItem(`voting_progress_${currentStudent.id}`);
              }}
              className="w-1/3 sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs md:text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <FaUndoAlt />
              <span>Clear Ballot</span>
            </button>
            <button
              type="button"
              onClick={handleOpenConfirm}
              className="w-2/3 sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs md:text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
            >
              <FaCheckCircle className="text-lg" />
              <span>Submit Ballot</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Confirm Vote Modal Popup */}
      <ConfirmVoteModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalConfirmVote}
        selections={selections}
      />
    </main>
  );
};
