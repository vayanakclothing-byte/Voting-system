import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { HouseColor } from '../types';
import { FaGraduationCap, FaUserGraduate, FaKeyboard, FaListUl, FaUndoAlt, FaArrowRight, FaLock, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'use-debounce';
import { db } from '../services/db';
import { CampaignPosters } from '../components/CampaignPosters';
import { NoticeBoard } from '../components/NoticeBoard';

export const Login: React.FC = () => {
  const {
    students,
    teachers,
    classes,
    electionState,
    loginStudent,
    logoutStudent,
    setSelectedHouse,
    selectedHouse,
    currentStudent
  } = useApp();

  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [fetchedClassStudents, setFetchedClassStudents] = useState<any[]>([]);

  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [studentNameInput, setStudentNameInput] = useState<string>('');
  const [houseInput, setHouseInput] = useState<HouseColor | ''>('');
  const [isManualMode, setIsManualMode] = useState<boolean>(electionState.allowManualTyping);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const [debouncedStudentName] = useDebounce(studentNameInput, 500);

  // Fetch students based on class selection dynamically
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setFetchedClassStudents([]);
        return;
      }
      
      setIsLoadingStudents(true);
      try {
        if (selectedClass === 'Teacher') {
           const teacherData = teachers.map(t => ({
            id: t.id,
            name: t.name,
            className: 'Teacher',
            section: '',
            hasVoted: t.hasVoted || false
          })).sort((a, b) => a.name.localeCompare(b.name));
          setFetchedClassStudents(teacherData);
        } else {
           const classData = await db.fetchStudentsByClass(selectedClass);
           setFetchedClassStudents(classData.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (e) {
        console.error("Failed to load students", e);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedClass, teachers]);

  // Issue 7: Clear stale sessions on mount if election is not active or has ended
  useEffect(() => {
    const isEnded = electionState.status !== 'active' || (electionState.endTime && Date.now() >= new Date(electionState.endTime).getTime());
    if (isEnded && currentStudent) {
      logoutStudent();
    }
  }, [electionState.status, electionState.endTime, currentStudent, logoutStudent]);


  // Filter students based on section
  const classStudents = useMemo(() => {
    if (!selectedSection) return fetchedClassStudents;
    
    const targetSection = selectedSection.trim().toLowerCase();
    return fetchedClassStudents.filter(s => {
      const studSec = (s.section || '').trim().toLowerCase();
      // Handle cases where a student might be assigned to multiple sections like "A, B"
      return studSec === targetSection || studSec.split(',').map((x: string) => x.trim()).includes(targetSection);
    });
  }, [fetchedClassStudents, selectedSection]);

  const availableSections = useMemo(() => {
    if (!selectedClass) return [];
    
    // First try to get from Classes database config
    const cls = classes.find(c => c.name === selectedClass);
    if (cls && cls.sections && cls.sections.length > 0) {
      return cls.sections;
    }
    
    // Fallback: derive unique sections from the students themselves
    const extractedSections: string[] = [];
    fetchedClassStudents.forEach(s => {
      const sec = (s.section || '').trim();
      if (sec) {
        sec.split(',').forEach((part: string) => extractedSections.push(part.trim()));
      }
    });
    const uniqueSections = Array.from(new Set(extractedSections.filter(Boolean)));
    return uniqueSections.sort();
  }, [classes, students, selectedClass, fetchedClassStudents]);

  // Auto-suggestion list while typing (using debounced value)
  const suggestions = useMemo(() => {
    if (!debouncedStudentName.trim()) return classStudents;
    return classStudents.filter(s =>
      s.name.toLowerCase().includes(debouncedStudentName.toLowerCase())
    );
  }, [classStudents, debouncedStudentName]);

  const handleHouseSelection = (house: HouseColor) => {
    setHouseInput(house);
    setSelectedHouse(house); // Dynamically update entire UI theme
  };

  const handleSelectSuggestedStudent = (name: string) => {
    setStudentNameInput(name);
    setShowSuggestions(false);
  };

  const handleReset = () => {
    setSelectedClass('');
    setSelectedSection('');
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
    if (!houseInput && selectedClass !== 'Teacher') {
      alert('Please select your House Color.');
      return;
    }

    const matchedStudent = classStudents.find(s => s.name.toLowerCase() === studentNameInput.trim().toLowerCase());
    if (!matchedStudent && !isManualMode) {
        alert("The selected student is not valid for this class.");
        return;
    }

    // Verify student session login
    const success = loginStudent({
      name: matchedStudent ? matchedStudent.name : studentNameInput.trim(), // Use exact DB name if matched
      className: selectedClass,
      house: selectedClass === 'Teacher' ? 'Teacher' : (houseInput as HouseColor),
      id: matchedStudent?.id || `manual_${Date.now()}`,
      isTeacher: selectedClass === 'Teacher'
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
                setSelectedSection('');
                setStudentNameInput(''); // reset student name on class change
              }}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              required
            >
              <option value="">-- Choose Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {/* 1.5 Select Section */}
          {selectedClass && availableSections.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1.5 Select Your Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setStudentNameInput('');
                }}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              >
                <option value="">-- All Sections --</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          )}

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
                  {showSuggestions && selectedClass && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800"
                    >
                      {isLoadingStudents ? (
                        <div className="p-6 flex flex-col items-center justify-center gap-3">
                           <FaSpinner className="animate-spin text-indigo-400 text-2xl" />
                           <span className="text-sm text-slate-400 font-medium">Fetching students...</span>
                        </div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map(student => (
                          <li
                            key={student.id}
                            onClick={() => handleSelectSuggestedStudent(student.name)}
                            className="px-4 py-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-sm transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <FaUserGraduate className="text-slate-500" />
                              <span className="text-white font-medium">{student.name}</span>
                              {student.section && (
                                <span className="text-xs text-slate-400">Sec {student.section}</span>
                              )}
                            </div>
                          </li>
                        ))
                      ) : (
                         <div className="px-4 py-3 text-slate-400 text-sm text-center">No matching students found in this class.</div>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : isLoadingStudents ? (
               <div className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 flex items-center justify-center gap-3">
                 <FaSpinner className="animate-spin text-indigo-400" />
                 <span className="text-sm text-slate-400 font-medium">Loading student list...</span>
               </div>
            ) : (
              <select
                value={studentNameInput}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setStudentNameInput(selectedName);
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
          {selectedClass !== 'Teacher' && (
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              3. Select House Color (Dynamic Theme)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Blue House */}
              <button
                type="button"
                id="login-house-blue"
                aria-label="Select Blue House theme"
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
                id="login-house-red"
                aria-label="Select Red House theme"
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
                id="login-house-green"
                aria-label="Select Green House theme"
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
                id="login-house-yellow"
                aria-label="Select Yellow House theme"
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
          )}

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
