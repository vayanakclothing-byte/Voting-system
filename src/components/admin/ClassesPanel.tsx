import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTrash } from 'react-icons/fa';
import { db } from '../../services/db';
import { SchoolClass } from '../../types';

interface ClassesPanelProps {
  classes: SchoolClass[];
  refreshData: () => void;
}

export const ClassesPanel: React.FC<ClassesPanelProps> = ({ classes, refreshData }) => {
  const [classNameInput, setClassNameInput] = useState('');
  const [classSecInput, setClassSecInput] = useState('A, B, C');

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    db.addClass({ name: classNameInput, sections: classSecInput.split(',').map(s => s.trim()) });
    refreshData(); setClassNameInput('');
  };

  const handleDeleteClass = (id: string) => {
    if (window.confirm('Delete class?')) { db.deleteClass(id); refreshData(); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-extrabold text-white mb-6">Register New School Class</h2>
        <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Class Name</label><input type="text" value={classNameInput} onChange={e => setClassNameInput(e.target.value)} placeholder="e.g. Class 10" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required /></div>
          <div><label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sections (Comma Separated)</label><input type="text" value={classSecInput} onChange={e => setClassSecInput(e.target.value)} placeholder="A, B, C" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required /></div>
          <div className="md:col-span-2 flex justify-end pt-2"><button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-2"><FaSave /><span>Save Class</span></button></div>
        </form>
      </div>

      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-x-auto">
        <h2 className="text-xl font-extrabold text-white mb-6">Registered Classes ({classes.length})</h2>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead><tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider"><th className="pb-4 pl-4">Class Name</th><th className="pb-4">Available Sections</th><th className="pb-4 pr-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {classes.map(cls => (
              <tr key={cls.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 pl-4 font-bold text-white">{cls.name}</td><td className="py-4 text-slate-300">{cls.sections.join(', ')}</td>
                <td className="py-4 pr-4 text-right"><button onClick={() => handleDeleteClass(cls.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white border border-slate-700"><FaTrash /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
