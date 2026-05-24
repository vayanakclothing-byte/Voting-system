import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface LogsPanelProps {
  logs: any[];
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ logs }) => {
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 15;

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const searchLower = logSearch.toLowerCase();
      const matchesSearch = l.action.toLowerCase().includes(searchLower) || 
                            l.details.toLowerCase().includes(searchLower);
      const matchesType = logTypeFilter === 'all' || l.type === logTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [logs, logSearch, logTypeFilter]);

  useEffect(() => {
    setLogPage(1);
  }, [logSearch, logTypeFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, logPage]);

  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-6">
      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input type="text" value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search logs by action or details..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner" />
          </div>
          <div className="w-full md:w-48">
            <select value={logTypeFilter} onChange={e => setLogTypeFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner">
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-extrabold text-white mb-2">Complete Audit Logs ({filteredLogs.length !== logs.length ? `${filteredLogs.length} of ${logs.length}` : logs.length})</h2>
        <p className="text-xs text-slate-400 mb-6">Full chronological record of all administrative and student voting events.</p>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 mb-6">
          {paginatedLogs.length > 0 ? (
            paginatedLogs.map(log => (
              <div key={log.id} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-start justify-between gap-4 shadow-inner">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'danger' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-xs font-bold text-white">{log.action}</span>
                  </div>
                  <p className="text-xs text-slate-300">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">No activity logs found matching current filters.</div>
          )}
        </div>

        {totalLogPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
            <div className="text-xs text-slate-400">Showing <strong className="text-slate-200">{Math.min(filteredLogs.length, (logPage - 1) * logsPerPage + 1)}</strong> to <strong className="text-slate-200">{Math.min(filteredLogs.length, logPage * logsPerPage)}</strong> of <strong className="text-slate-200">{filteredLogs.length}</strong> activity logs</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setLogPage(p => Math.max(1, p - 1))} disabled={logPage === 1} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"><FaChevronLeft className="text-xs" /></button>
              <span className="text-xs font-bold text-slate-300 px-3">Page {logPage} of {totalLogPages}</span>
              <button onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))} disabled={logPage === totalLogPages} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"><FaChevronRight className="text-xs" /></button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
