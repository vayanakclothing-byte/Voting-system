import React, { useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { GLOBAL_POSITIONS, HOUSE_POSITIONS } from '../types';

export const PrintableReport: React.FC = () => {
  const { candidates, students, votes, refreshData } = useApp();

  // Load data immediately
  useEffect(() => {
    db.fetchAllStudents().then(() => {
      refreshData();
    });
  }, []);

  // When data is fully loaded and ready, trigger the print dialog after a tiny delay
  useEffect(() => {
    if (students.length > 0 && candidates.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [students.length, candidates.length]);

  const totalStudents = students.length;
  const votedStudents = students.filter(s => s.hasVoted).length;
  const participationRate = totalStudents > 0 ? Math.round((votedStudents / totalStudents) * 100) : 0;

  // Determine races and winners for each specific contest
  const races = useMemo(() => {
    const result: { title: string, position: string, houseFilter: string, totalVotes: number, winner: typeof candidates[0] | null, runnerUp: typeof candidates[0] | null }[] = [];
    
    GLOBAL_POSITIONS.forEach(pos => {
      const cands = candidates.filter(c => c.position === pos).sort((a, b) => b.votesCount - a.votesCount);
      if (cands.length === 0) return;
      result.push({
        title: pos,
        position: pos,
        houseFilter: 'All',
        totalVotes: cands.reduce((s, c) => s + c.votesCount, 0),
        winner: cands[0] && cands[0].votesCount > 0 ? cands[0] : null,
        runnerUp: cands[1] && cands[1].votesCount > 0 ? cands[1] : null
      });
    });

    HOUSE_POSITIONS.forEach(pos => {
      ['Blue', 'Red', 'Green', 'Yellow'].forEach(house => {
        const cands = candidates.filter(c => c.position === pos && c.house === house).sort((a, b) => b.votesCount - a.votesCount);
        if (cands.length > 0) {
          result.push({
            title: `${house} ${pos}`,
            position: pos,
            houseFilter: house,
            totalVotes: cands.reduce((s, c) => s + c.votesCount, 0),
            winner: cands[0] && cands[0].votesCount > 0 ? cands[0] : null,
            runnerUp: cands[1] && cands[1].votesCount > 0 ? cands[1] : null
          });
        }
      });
    });

    return result;
  }, [candidates]);

  // House-wise statistics
  const houseStats = useMemo(() => {
    const houses = ['Blue', 'Red', 'Green', 'Yellow'];
    return houses.map(h => {
      const houseCands = candidates.filter(c => c.house === h);
      const totalHouseVotes = houseCands.reduce((sum, c) => sum + c.votesCount, 0);
      return { house: h, votes: totalHouseVotes };
    }).sort((a, b) => b.votes - a.votes);
  }, [candidates]);

  return (
    <div className="bg-white min-h-screen text-black font-serif p-8 max-w-4xl mx-auto">
      {/* Official Document Header */}
      <div className="text-center border-b-2 border-black pb-6 mb-8">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Royal Academy Logo" className="h-20 w-20 object-contain grayscale" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <h1 className="text-3xl font-extrabold uppercase tracking-widest mb-1">Royal Academy</h1>
        <h2 className="text-xl font-bold uppercase tracking-wider text-gray-700">Official Election Results 2083</h2>
        <p className="text-sm mt-2 font-medium text-gray-500">Generated on {new Date().toLocaleString()}</p>
      </div>

      {/* Overview Statistics */}
      <div className="mb-10">
        <h3 className="text-lg font-bold uppercase border-b border-gray-300 pb-2 mb-4">Election Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 border border-gray-300 rounded-lg">
            <div className="text-sm text-gray-500 font-bold uppercase">Total Eligible Voters</div>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </div>
          <div className="p-4 border border-gray-300 rounded-lg">
            <div className="text-sm text-gray-500 font-bold uppercase">Ballots Cast</div>
            <div className="text-2xl font-bold">{votedStudents}</div>
          </div>
          <div className="p-4 border border-gray-300 rounded-lg">
            <div className="text-sm text-gray-500 font-bold uppercase">Voter Turnout</div>
            <div className="text-2xl font-bold">{participationRate}%</div>
          </div>
        </div>
      </div>

      {/* House Performance */}
      <div className="mb-10">
        <h3 className="text-lg font-bold uppercase border-b border-gray-300 pb-2 mb-4">House Performance</h3>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 font-bold uppercase text-sm">House Name</th>
              <th className="border border-gray-300 p-2 font-bold uppercase text-sm">Total Votes Accrued</th>
            </tr>
          </thead>
          <tbody>
            {houseStats.map((stat) => (
              <tr key={stat.house}>
                <td className="border border-gray-300 p-2 font-semibold">{stat.house} House</td>
                <td className="border border-gray-300 p-2">{stat.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Position Winners */}
      <div className="mb-12">
        <h3 className="text-lg font-bold uppercase border-b border-gray-300 pb-2 mb-4">Elected Representatives</h3>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 font-bold uppercase text-sm">Position</th>
              <th className="border border-gray-300 p-2 font-bold uppercase text-sm">Winner</th>
              <th className="border border-gray-300 p-2 font-bold uppercase text-sm">Total Votes</th>
              <th className="border border-gray-300 p-2 font-bold uppercase text-sm">Runner Up</th>
            </tr>
          </thead>
          <tbody>
            {races.map((race) => (
              <tr key={race.title}>
                <td className="border border-gray-300 p-2 font-bold">{race.title}</td>
                <td className="border border-gray-300 p-2">
                  {race.winner ? (
                    <div>
                      <span className="font-bold">{race.winner.name}</span>
                      <span className="text-xs text-gray-600 ml-1">({race.winner.house})</span>
                    </div>
                  ) : <span className="text-gray-400 italic">No Winner</span>}
                </td>
                <td className="border border-gray-300 p-2 font-mono">
                  {race.winner ? race.winner.votesCount : 0} / {race.totalVotes}
                </td>
                <td className="border border-gray-300 p-2 text-sm text-gray-600">
                  {race.runnerUp ? `${race.runnerUp.name} (${race.runnerUp.votesCount})` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="mt-20 pt-10 border-t-2 border-black flex justify-between px-10">
        <div className="text-center w-64">
          <div className="border-b border-black h-12 mb-2"></div>
          <p className="font-bold uppercase text-sm">Election Commissioner</p>
          <p className="text-xs text-gray-500">Royal Academy</p>
        </div>
        <div className="text-center w-64">
          <div className="border-b border-black h-12 mb-2"></div>
          <p className="font-bold uppercase text-sm">Principal</p>
          <p className="text-xs text-gray-500">Royal Academy</p>
        </div>
      </div>

      {/* Print Instructions - Visible only on screen */}
      <div className="fixed bottom-4 right-4 print:hidden bg-blue-100 text-blue-800 px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm border border-blue-200">
        <p className="font-bold mb-1">Print Mode Active</p>
        <p>If the print dialog didn't open automatically, press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong>) to print or save this report as a PDF.</p>
        <button onClick={() => window.close()} className="mt-3 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold w-full hover:bg-blue-700">Close Tab</button>
      </div>

      {/* Hide navbar globally via print media query just in case */}
      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
        }
      `}</style>
    </div>
  );
};
