import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSave, FaEdit, FaTrash } from 'react-icons/fa';
import { db } from '../../services/db';
import { Candidate, HouseColor, GLOBAL_POSITIONS, HOUSE_POSITIONS } from '../../types';

interface CandidatesPanelProps {
  candidates: Candidate[];
  refreshData: () => void;
}

export const CandidatesPanel: React.FC<CandidatesPanelProps> = ({ candidates, refreshData }) => {
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candName, setCandName] = useState('');
  const [candPos, setCandPos] = useState<Candidate['position']>('Head Boy');
  const [candCustomPos, setCandCustomPos] = useState('');
  const [candHouse, setCandHouse] = useState<HouseColor>('Blue');
  const [candSlogan, setCandSlogan] = useState('');
  const [candSymbol, setCandSymbol] = useState('');
  const [candPhoto, setCandPhoto] = useState('');

  const handleOpenAddCandidate = () => {
    setEditingCandidateId(null);
    setCandName(''); setCandPos('Head Boy'); setCandHouse('Blue'); setCandSlogan(''); setCandSymbol('⭐'); setCandPhoto('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditCandidate = (c: Candidate) => {
    setEditingCandidateId(c.id);
    setCandName(c.name); setCandPos(c.position); setCandCustomPos(''); setCandHouse(c.house); setCandSlogan(c.slogan); setCandSymbol(c.symbol); setCandPhoto(c.photoUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPos = candCustomPos.trim() !== '' ? candCustomPos.trim() as Candidate['position'] : candPos;
    if (editingCandidateId) {
      db.updateCandidate(editingCandidateId, { name: candName, position: finalPos, house: candHouse, slogan: candSlogan, symbol: candSymbol, photoUrl: candPhoto });
    } else {
      db.addCandidate({ name: candName, position: finalPos, house: candHouse, slogan: candSlogan, symbol: candSymbol, photoUrl: candPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' });
    }
    refreshData();
    setEditingCandidateId(null);
    setCandName(''); setCandPos('Head Boy'); setCandCustomPos(''); setCandHouse('Blue'); setCandSlogan(''); setCandSymbol('⭐'); setCandPhoto('');
  };

  const handleDeleteCandidate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      db.deleteCandidate(id);
      refreshData();
    }
  };

  const handleDeleteAllCandidates = () => {
    if (window.confirm('Are you absolutely sure you want to delete ALL candidates? This cannot be undone!')) {
      db.deleteAllCandidates();
      refreshData();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
      {/* Add / Edit Form */}
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-white">{editingCandidateId ? 'Edit Candidate Details' : 'Register New Candidate'}</h2>
          {editingCandidateId && (
            <button onClick={handleOpenAddCandidate} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              <FaPlus /><span>Switch to Add New</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSaveCandidate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Candidate Name</label>
            <input type="text" value={candName} onChange={e => setCandName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Candidate Position (optional custom)</label>
            <input type="text" value={candCustomPos} onChange={e => setCandCustomPos(e.target.value)} placeholder="e.g., Vice President" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" />
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 mt-4">Position</label>
            <select value={candPos} onChange={e => setCandPos(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner">
               <optgroup label="School Leadership">
                  {GLOBAL_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
               </optgroup>
               <optgroup label="House Positions">
                  {HOUSE_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
               </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">House Color</label>
            <select value={candHouse} onChange={e => setCandHouse(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner">
              <option value="Blue">Blue House</option><option value="Red">Red House</option><option value="Green">Green House</option><option value="Yellow">Yellow House</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Election Symbol (Emoji/Icon)</label>
            <input type="text" value={candSymbol} onChange={e => setCandSymbol(e.target.value)} placeholder="⭐, ⚓, 🔥, etc." className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Campaign Slogan</label>
            <input type="text" value={candSlogan} onChange={e => setCandSlogan(e.target.value)} placeholder="Short inspiring slogan" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Candidate Photo</label>
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 10 * 1024 * 1024) {
                alert('Image size exceeds 10MB limit. Please choose a smaller file.');
                e.target.value = '';
                return;
              }
              const url = URL.createObjectURL(file);
              setCandPhoto(url);
            }} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 pt-2">
            <button type="submit" className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 flex items-center gap-2">
              <FaSave /><span>{editingCandidateId ? 'Update Candidate' : 'Save Candidate'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Candidates Table List */}
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-white">Registered Candidates List</h2>
          <button onClick={handleDeleteAllCandidates} className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 font-bold text-xs flex items-center gap-2 border border-rose-500/30 transition-colors">
            <FaTrash /><span>Delete All</span>
          </button>
        </div>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-4 pl-4">Candidate</th>
              <th className="pb-4">Position</th>
              <th className="pb-4">House</th>
              <th className="pb-4">Symbol</th>
              <th className="pb-4">Votes</th>
              <th className="pb-4 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {candidates.map(cand => (
              <tr key={cand.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 pl-4 flex items-center gap-3">
                  <img src={cand.photoUrl} alt={cand.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div><div className="font-bold text-white">{cand.name}</div><div className="text-xs text-slate-400 italic">"{cand.slogan}"</div></div>
                </td>
                <td className="py-4 font-semibold text-indigo-400">{cand.position}</td>
                <td className="py-4"><span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${cand.house === 'Blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : cand.house === 'Red' ? 'bg-red-500/20 text-red-300 border-red-500/30' : cand.house === 'Green' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>{cand.house}</span></td>
                <td className="py-4 text-xl">{cand.symbol}</td>
                <td className="py-4 font-extrabold text-white">{cand.votesCount}</td>
                <td className="py-4 pr-4 text-right space-x-2">
                  <button onClick={() => handleOpenEditCandidate(cand)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700"><FaEdit /></button>
                  <button onClick={() => handleDeleteCandidate(cand.id)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-white border border-slate-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
