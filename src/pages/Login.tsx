import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { HouseColor } from '../types';
import { FaGraduationCap, FaUserGraduate, FaKeyboard, FaListUl, FaUndoAlt, FaArrowRight, FaLock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { CampaignPosters } from '../components/CampaignPosters';
import { NoticeBoard } from '../components/NoticeBoard';

export const Login: React.FC = () => {
  const {
    students,
    classes,
    electionState,
    loginStudent,
    setSelectedHouse,
    selectedHouse,
    currentStudent
  } = useApp();

  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentNameInput, setStudentNameInput] = useState<string>('');
  const [houseInput, setHouseInput] = useState<HouseColor | ''>('');
  const [isManualMode, setIsManualMode] = useState<boolean>(electionState.allowManualTyping);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Filter students based on class selection
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);

  // Auto-suggestion list while typing
  const suggestions = useMemo(() => {
    if (!studentNameInput.trim()) return classStudents;
    return classStudents.filter(s =>
      s.name.toLowerCase().includes(studentNameInput.toLowerCase())
    );
  }, [classStudents, studentNameInput]);

  const handleHouseSelection = (house: HouseColor) => {
    setHouseInput(house);
    setSelectedHouse(house); // Dynamically update entire UI theme
  };

  const handleSelectSuggestedStudent = (name: string, house: HouseColor) => {
    setStudentNameInput(name);
    handleHouseSelection(house);
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setSelectedClass('');
    setStudentNameInput('');
    setHouseInput('');
    setSelectedHouse(null);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass) {
      alert('Please select your Class.');
      return;
    }
    if (!studentNameInput.trim()) {
      alert('Please enter or select your Student Name.');
      return;
    }
    if (!houseInput) {
      alert('Please select your House Color.');
      return;
    }

    // Verify student session login
    const success = loginStudent({
      name: studentNameInput.trim(),
      className: selectedClass,
      house: houseInput,
      id: classStudents.find(s => s.name.toLowerCase() === studentNameInput.trim().toLowerCase())?.id
    });

    if (success) {
      navigate('/voting');
    }
  };

  // Determine dynamic house border/shadow glow for login card
  const getLoginCardGlow = () => {
    switch (selectedHouse) {
      case 'Blue': return 'border-blue-500/40 shadow-blue-500/20';
      case 'Red': return 'border-red-500/40 shadow-red-500/20';
      case 'Green': return 'border-green-500/40 shadow-green-500/20';
      case 'Yellow': return 'border-yellow-500/40 shadow-yellow-500/20';
      default: return 'border-slate-800 shadow-indigo-500/10';
    }
  };

  return (
    <main className="min-h-screen pb-16 pt-8 px-4 md:px-8 relative z-10 flex flex-col items-center justify-center">
      {/* Top Welcome Title Area */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30 border border-indigo-400/30 text-white text-3xl"
        >
          <FaGraduationCap />
        </motion.div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Royal Academy Student Council Election 2083
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Welcome to the official live voting portal. Please authenticate your student credentials below to cast your encrypted ballot for the 2083 student council leaders.
        </p>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`glass-panel bg-slate-900/80 backdrop-blur-2xl border-2 rounded-3xl max-w-xl w-full p-6 md:p-10 shadow-2xl transition-all duration-500 relative overflow-visible mb-16 ${getLoginCardGlow()}`}
      >
        {/* Election Status Lock Header */}
        {electionState.status !== 'active' && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-rose-400">
            <FaLock />
            <span>Election Currently {electionState.status.toUpperCase()}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Select Class */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Select Your Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setStudentNameInput(''); // reset student name on class change
              }}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              required
            >
              <option value="">-- Choose Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Student Name Input / Dropdown */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Student Name
              </label>

              {/* Mode Toggle Button */}
              {electionState.allowManualTyping && (
                <button
                  type="button"
                  onClick={() => setIsManualMode(!isManualMode)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  {isManualMode ? <FaListUl /> : <FaKeyboard />}
                  <span>{isManualMode ? 'Switch to Dropdown' : 'Switch to Typing'}</span>
                </button>
              )}
            </div>

            {isManualMode ? (
              <div className="relative">
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => {
                    setStudentNameInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Type your full student name..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  required
                />

                {/* Auto-suggestion Dropdown */}
                <AnimatePresence>
                  {showSuggestions && selectedClass && suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800"
                    >
                      {suggestions.map(student => (
                        <li
                          key={student.id}
                          onClick={() => handleSelectSuggestedStudent(student.name, student.house)}
                          className="px-4 py-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-sm transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FaUserGraduate className="text-slate-500" />
                            <span className="text-white font-medium">{student.name}</span>
                            {student.section && (
                              <span className="text-xs text-slate-400">Sec {student.section}</span>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-lg border font-bold ${
                            student.house === 'Blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            student.house === 'Red' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            student.house === 'Green' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>
                            {student.house}
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <select
                value={studentNameInput}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setStudentNameInput(selectedName);
                  const s = classStudents.find(st => st.name === selectedName);
                  if (s) {
                    handleHouseSelection(s.house);
                  }
                }}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                required
              >
                <option value="">-- Choose Student Name --</option>
                {classStudents.map(s => (
                  <option key={s.id} value={s.name}>{s.name} {s.section ? `(Sec ${s.section})` : ''}</option>
                ))}
              </select>
            )}
            {!selectedClass && (
              <p className="text-[10px] text-amber-400/90 mt-1.5 font-medium">
                💡 Please select your class first to load the student list.
              </p>
            )}
          </div>

          {/* 3. Select House Color */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              3. Select House Color (Dynamic Theme)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Blue House */}
              <button
                type="button"
                onClick={() => handleHouseSelection('Blue')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  houseInput === 'Blue'
                    ? 'bg-blue-600/30 border-blue-500 shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-blue-500 mb-2 shadow-md shadow-blue-500/50" />
                <span className="text-xs font-bold text-white">Blue House</span>
              </button>

              {/* Red House */}
              <button
                type="button"
                onClick={() => handleHouseSelection('Red')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  houseInput === 'Red'
                    ? 'bg-red-600/30 border-red-500 shadow-lg shadow-red-500/30 scale-105'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-red-500 mb-2 shadow-md shadow-red-500/50" />
                <span className="text-xs font-bold text-white">Red House</span>
              </button>

              {/* Green House */}
              <button
                type="button"
                onClick={() => handleHouseSelection('Green')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  houseInput === 'Green'
                    ? 'bg-green-600/30 border-green-500 shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-green-500 mb-2 shadow-md shadow-green-500/50" />
                <span className="text-xs font-bold text-white">Green House</span>
              </button>

              {/* Yellow House */}
              <button
                type="button"
                onClick={() => handleHouseSelection('Yellow')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  houseInput === 'Yellow'
                    ? 'bg-amber-600/30 border-amber-500 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-amber-500 mb-2 shadow-md shadow-amber-500/50" />
                <span className="text-xs font-bold text-white">Yellow House</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="w-1/3 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <FaUndoAlt />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={electionState.status !== 'active'}
              className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-indigo-400/30"
            >
              <span>Continue to Voting</span>
              <FaArrowRight />
            </button>
          </div>
        </form>

        {/* Existing Session Prompt */}
        {currentStudent && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Active Session: </span>
              <span className="font-bold text-white">{currentStudent.name} ({currentStudent.house})</span>
            </div>
            <button
              onClick={() => navigate('/voting')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-bold transition-colors"
            >
              Resume Voting →
            </button>
          </div>
        )}
      </motion.div>

      {/* Campaign Posters Gallery */}
      <CampaignPosters />

      {/* Election Notice Board */}
      <NoticeBoard />
    </main>
  );
};
