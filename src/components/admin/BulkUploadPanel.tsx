import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaUpload, FaCheckCircle, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { db } from '../../services/db';
import { BulkStudentSchema, BulkTeacherSchema, BulkCandidateSchema } from '../../utils/validators';
import toast from 'react-hot-toast';

interface BulkUploadPanelProps {
  refreshData: () => void;
}

export const BulkUploadPanel: React.FC<BulkUploadPanelProps> = ({ refreshData }) => {
  const [bulkType, setBulkType] = useState<'students' | 'teachers' | 'candidates'>('students');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploadReport, setUploadReport] = useState<{ imported: number; skipped: number } | null>(null);

  const downloadSampleTemplate = () => {
    let wsData: any[] = [];
    if (bulkType === 'students') {
      wsData = [
        ['Student Name', 'Class', 'Section', 'Roll Number'],
        ['John Doe', 'Class 10', 'A', '101'],
        ['Jane Smith', 'Class 10', 'B', '102']
      ];
    } else if (bulkType === 'teachers') {
      wsData = [
        ['Teacher Name', 'Subject', 'Department'],
        ['Mr. Alan Turing', 'Computer Science', 'Science'],
        ['Dr. Marie Curie', 'Chemistry', 'Science']
      ];
    } else {
      wsData = [
        ['Candidate Name', 'Position', 'House', 'Slogan', 'Symbol', 'Photo URL'],
        ['Leo Vance', 'Head Boy', 'Blue', 'Leading with Honor!', '⚓', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400']
      ];
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, `${bulkType}_sample_template.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setParsedRows(data);
      setUploadReport(null);
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkUpload = async () => {
    if (parsedRows.length === 0) return;

    if (bulkType === 'students') {
      const formatted = parsedRows.map(r => ({
        name: String(r['Student Name'] || r['name'] || ''),
        className: String(r['Class'] || r['className'] || ''),
        section: String(r['Section'] || r['section'] || ''),
        rollNumber: String(r['Roll Number'] || r['rollNumber'] || '')
      }));

      const parsed = BulkStudentSchema.safeParse(formatted);
      if (!parsed.success) {
        toast.error('Validation failed: ' + parsed.error.issues[0].message);
        return;
      }
      const res = await db.bulkUploadStudents(parsed.data);
      setUploadReport(res);
    } else if (bulkType === 'teachers') {
      const formatted = parsedRows.map(r => ({
        name: String(r['Teacher Name'] || r['name'] || ''),
        subject: String(r['Subject'] || r['subject'] || ''),
        department: String(r['Department'] || r['department'] || '')
      }));

      const parsed = BulkTeacherSchema.safeParse(formatted);
      if (!parsed.success) {
        toast.error('Validation failed: ' + parsed.error.issues[0].message);
        return;
      }
      const res = await db.bulkUploadTeachers(parsed.data);
      setUploadReport(res);
    } else {
      const formatted = parsedRows.map(r => ({
        name: String(r['Candidate Name'] || r['name'] || ''),
        position: ['Head Boy', 'Head Girl', 'Sports Captain', 'Discipline Captain'].includes(r['Position']) ? r['Position'] : String(r['Position'] || ''),
        house: ['Blue', 'Red', 'Green', 'Yellow'].includes(r['House']) ? r['House'] : 'Blue',
        slogan: String(r['Slogan'] || r['slogan'] || 'Excellence in Action!'),
        symbol: String(r['Symbol'] || r['symbol'] || '⭐'),
        photoUrl: String(r['Photo URL'] || r['photoUrl'] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400')
      }));

      const parsed = BulkCandidateSchema.safeParse(formatted);
      if (!parsed.success) {
        toast.error('Validation failed: ' + parsed.error.issues[0].message);
        return;
      }
      const res = await db.bulkUploadCandidates(parsed.data);
      setUploadReport(res);
    }

    refreshData();
    setParsedRows([]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-extrabold text-white mb-2">Excel & CSV Bulk Data Import</h2>
        <p className="text-xs text-slate-400 mb-6">Upload student rosters, teacher lists, or candidate manifests in bulk. Download the sample template to ensure correct column headers.</p>

        {/* Upload Type Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Table:</label>
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['students', 'teachers', 'candidates'] as const).map(type => (
              <button key={type} onClick={() => { setBulkType(type); setParsedRows([]); setUploadReport(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${bulkType === type ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}>
                {type}
              </button>
            ))}
          </div>
          <button onClick={downloadSampleTemplate} className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-bold text-xs transition-all border border-slate-700 flex items-center gap-1.5 shadow-inner">
            <FaDownload /><span>Download {bulkType} Template</span>
          </button>
        </div>

        {/* Drag and drop / file input container */}
        <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl p-10 text-center bg-slate-950/40 transition-colors mb-6 relative group">
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 text-3xl group-hover:scale-110 transition-transform shadow-inner">
            <FaUpload />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Click or Drag Excel/CSV File Here</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">Supports .xlsx, .xls, and .csv formats matching the sample template structure.</p>
        </div>

        {/* Upload Success Report */}
        {uploadReport && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between text-xs text-emerald-200 shadow-inner">
            <div className="flex items-center gap-2 font-bold"><FaCheckCircle className="text-emerald-400 text-base" /><span>Bulk Import Complete!</span></div>
            <div className="flex items-center gap-4"><span>Successfully Imported: <strong className="text-white font-extrabold">{uploadReport.imported}</strong></span><span>Duplicates Skipped: <strong className="text-white font-extrabold">{uploadReport.skipped}</strong></span></div>
          </div>
        )}

        {/* Data Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Data Preview ({parsedRows.length} rows ready to import)</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setParsedRows([])} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors border border-slate-700 flex items-center gap-1.5">
                  <FaTimes /><span>Cancel</span>
                </button>
                <button onClick={handleConfirmBulkUpload} className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 border border-emerald-400/30">
                  <FaCheckCircle /><span>Confirm & Save Data</span>
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-auto border border-slate-800 rounded-2xl bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold sticky top-0">
                    {Object.keys(parsedRows[0]).map(key => <th key={key} className="p-3">{key}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      {Object.values(row).map((val: any, j) => <td key={j} className="p-3 truncate max-w-xs">{String(val)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
