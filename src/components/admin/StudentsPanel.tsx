import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSave, FaEdit, FaTrash, FaSearch, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { db } from '../../services/db';
import { Student, HouseColor, SchoolClass } from '../../types';

interface StudentsPanelProps {
  students: Student[];
  classes: SchoolClass[];
  refreshData: () => void;
}

export const StudentsPanel: React.FC<StudentsPanelProps> = ({ students, classes, refreshData }) => {
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studName, setStudName] = useState('');
  const [studClass, setStudClass] = useState('');
  const [studSection, setStudSection] = useState('');
  const [studRoll, setStudRoll] = useState('');

  const handleOpenAddStudent = () => {
    setEditingStudentId(null);
    setStudName(''); setStudClass(classes[0]?.name || 'Class 10'); setStudSection('A'); setStudRoll('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setStudName(s.name); setStudClass(s.className); setStudSection(s.section || ''); setStudRoll(s.rollNumber || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudentId) {
      db.updateStudent(editingStudentId, { name: studName, className: studClass, section: studSection, rollNumber: studRoll });
    } else {
      db.addStudent({ name: studName, className: studClass, section: studSection, rollNumber: studRoll });
    }
    refreshData();
    setEditingStudentId(null);
    setStudName(''); setStudClass(classes[0]?.name || 'Class 10'); setStudSection('A'); setStudRoll('');
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Delete student?')) { db.deleteStudent(id); refreshData(); }
  };

  const handleDeleteAllStudents = () => {
    if (window.confirm('Are you absolutely sure you want to delete ALL students? This cannot be undone!')) {
      db.deleteAllStudents();
      refreshData();
    }
  };

  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [studentPage, setStudentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const searchLower = studentSearch.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(searchLower) || 
                            (s.rollNumber && s.rollNumber.toLowerCase().includes(searchLower)) ||
                            (s.className && s.className.toLowerCase().includes(searchLower));
      const matchesClass = studentClassFilter === 'all' || s.className === studentClassFilter;
      const matchesStatus = studentStatusFilter === 'all' || 
                            (studentStatusFilter === 'voted' ? s.hasVoted : !s.hasVoted);
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, studentSearch, studentClassFilter, studentStatusFilter]);

  useEffect(() => {
    setStudentPage(1);
  }, [studentSearch, studentClassFilter, studentStatusFilter]);

  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, studentPage]);

  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
      {/* Add / Edit Form */}
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-white">{editingStudentId ? 'Edit Student Details' : 'Register New Student'}</h2>
          {editingStudentId && <button onClick={handleOpenAddStudent} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">Switch to Add New</button>}
        </div>

        <form onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Student Name</label>
            <input type="text" value={studName} onChange={e => setStudName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Class</label>
            <select value={studClass} onChange={e => setStudClass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner">
              {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Roll No.</label>
            <input type="text" value={studRoll} onChange={e => setStudRoll(e.target.value)} placeholder="e.g. 101" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" />
          </div>
          <div className="md:col-span-5 flex justify-end gap-3 pt-2">
            <button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-2">
              <FaSave /><span>{editingStudentId ? 'Update Student' : 'Save Student'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input type="text" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search by student name, class, or roll number..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner" />
          </div>
          <div className="w-full md:w-48">
            <select value={studentClassFilter} onChange={e => setStudentClassFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner">
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select value={studentStatusFilter} onChange={e => setStudentStatusFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner">
              <option value="all">All Statuses</option>
              <option value="voted">Voted Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-x-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-extrabold text-white">Registered Students ({filteredStudents.length !== students.length ? `${filteredStudents.length} of ${students.length}` : students.length})</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleDeleteAllStudents} className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 font-bold text-xs flex items-center gap-2 border border-rose-500/30 transition-colors">
              <FaTrash /><span>Delete All</span>
            </button>
            <button onClick={() => {
              const ws = XLSX.utils.json_to_sheet(filteredStudents.map(s => ({
                Name: s.name, Class: s.className, Section: s.section || 'N/A', 'Roll No': s.rollNumber || 'N/A', 'Voted Status': s.hasVoted ? 'VOTED' : 'PENDING'
              })));
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Voter Directory");
              XLSX.writeFile(wb, "Voter_Directory_Report.xlsx");
            }} className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-2 border border-indigo-500/30 transition-colors">
              <FaDownload /><span>Export Voter Directory</span>
            </button>
          </div>
        </div>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead><tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider"><th className="pb-4 pl-4">Name</th><th className="pb-4">Class</th><th className="pb-4">Roll No.</th><th className="pb-4">Voting Status</th><th className="pb-4 pr-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map(stud => (
                <tr key={stud.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 pl-4 font-bold text-white">{stud.name}</td>
                  <td className="py-4 text-slate-300">{stud.className} {stud.section ? `(Sec ${stud.section})` : ''}</td>
                  <td className="py-4 text-slate-400 font-mono">{stud.rollNumber || 'N/A'}</td>
                  <td className="py-4">{stud.hasVoted ? <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">Voted</span> : <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-bold">Pending</span>}</td>
                  <td className="py-4 pr-4 text-right space-x-2">
                    <button onClick={() => handleOpenEditStudent(stud)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700 transition-colors"><FaEdit /></button>
                    <button onClick={() => handleDeleteStudent(stud.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white border border-slate-700 transition-colors"><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500 text-sm">No students found matching filters.</td></tr>
            )}
          </tbody>
        </table>

        {totalStudentPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-4">
            <div className="text-xs text-slate-400">Showing <strong className="text-slate-200">{Math.min(filteredStudents.length, (studentPage - 1) * itemsPerPage + 1)}</strong> to <strong className="text-slate-200">{Math.min(filteredStudents.length, studentPage * itemsPerPage)}</strong> of <strong className="text-slate-200">{filteredStudents.length}</strong> students</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setStudentPage(p => Math.max(1, p - 1))} disabled={studentPage === 1} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"><FaChevronLeft className="text-xs" /></button>
              <span className="text-xs font-bold text-slate-300 px-3">Page {studentPage} of {totalStudentPages}</span>
              <button onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))} disabled={studentPage === totalStudentPages} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"><FaChevronRight className="text-xs" /></button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
