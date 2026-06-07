import React, { useMemo } from 'react';
import { Vote } from '../../types';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';

interface VotesPanelProps {
  votes: Vote[];
}

export const VotesPanel: React.FC<VotesPanelProps> = ({ votes }) => {
  const sortedVotes = useMemo(() => {
    return [...votes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [votes]);

  const handleDownloadCsv = () => {
    const headers = ['Voter Name', 'Class/Role', 'House', 'Timestamp'];
    
    const rows = sortedVotes.map(v => {
      const date = new Date(v.timestamp).toLocaleString();
      return `"${v.studentName}","${v.className}","${v.house}","${date}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voter_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <FaCheckCircle className="text-emerald-500" />
            <span>Voter Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Live record of all successfully cast ballots. ({votes.length} Total)</p>
        </div>
        <button
          onClick={handleDownloadCsv}
          disabled={votes.length === 0}
          className="px-5 py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold text-xs md:text-sm border border-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <FaDownload />
          <span>Download CSV</span>
        </button>
      </div>

      <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Voter Name</th>
                <th className="px-6 py-4">Class / Role</th>
                <th className="px-6 py-4">House Color</th>
                <th className="px-6 py-4">Time of Vote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedVotes.length > 0 ? (
                sortedVotes.map((vote) => (
                  <tr key={vote.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{vote.studentName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-xs border border-slate-700">
                        {vote.className}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {vote.house === 'Teacher' ? (
                        <span className="text-slate-400">Teacher (N/A)</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${vote.house === 'Blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : vote.house === 'Red' ? 'bg-red-500/10 text-red-400 border-red-500/20' : vote.house === 'Green' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {vote.house}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(vote.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No votes have been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
