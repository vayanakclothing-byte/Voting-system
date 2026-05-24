import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FaTrophy, FaChartBar, FaChartPie, FaUsers, FaTv, FaSyncAlt, FaArrowLeft, FaMedal, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

export const LiveResults: React.FC = () => {
  const { candidates, students, votes, electionState, refreshData } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'positions' | 'analytics' | 'houses' | 'timeline'>('positions');
  const [smartBoardMode, setSmartBoardMode] = useState<boolean>(false);
  const [celebrateWinners, setCelebrateWinners] = useState<boolean>(false);

  const positions = ['Head Boy', 'Head Girl', 'Sports Captain', 'Discipline Captain'];

  // Calculate participation percentage
  const totalStudents = students.length;
  const votedStudents = students.filter(s => s.hasVoted).length;
  const participationRate = totalStudents > 0 ? Math.round((votedStudents / totalStudents) * 100) : 0;

  // Calculate House-wise statistics
  const houseStats = useMemo(() => {
    const houses = ['Blue', 'Red', 'Green', 'Yellow'];
    return houses.map(h => {
      const houseCands = candidates.filter(c => c.house === h);
      const totalHouseVotes = houseCands.reduce((sum, c) => sum + c.votesCount, 0);
      return {
        house: h,
        votes: totalHouseVotes,
        color: h === 'Blue' ? '#3b82f6' : h === 'Red' ? '#ef4444' : h === 'Green' ? '#10b981' : '#f59e0b'
      };
    });
  }, [candidates]);

  // Calculate Voter Turnout Timeline
  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    votes.forEach(v => {
      const d = new Date(v.timestamp);
      const time = `${d.getHours().toString().padStart(2, '0')}:${(Math.floor(d.getMinutes() / 10) * 10).toString().padStart(2, '0')}`;
      counts[time] = (counts[time] || 0) + 1;
    });
    let runningTotal = 0;
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, count]) => {
        runningTotal += count;
        return { time, count, runningTotal };
      });
  }, [votes]);

  // Determine winners for each position
  const winners = useMemo(() => {
    const result: { [pos: string]: typeof candidates[0] | null } = {};
    positions.forEach(pos => {
      const posCands = candidates.filter(c => c.position === pos);
      if (posCands.length === 0) {
        result[pos] = null;
        return;
      }
      let maxVotes = -1;
      let winner: typeof candidates[0] | null = null;
      posCands.forEach(c => {
        if (c.votesCount > maxVotes) {
          maxVotes = c.votesCount;
          winner = c;
        }
      });
      result[pos] = winner;
    });
    return result;
  }, [candidates, positions]);

  return (
    <main className={`min-h-screen pb-20 pt-8 px-4 md:px-8 max-w-7xl mx-auto relative z-10 transition-all duration-500 ${smartBoardMode ? 'max-w-full px-8 py-12 bg-slate-950' : ''}`}>
      {/* Celebration Confetti */}
      {celebrateWinners && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={150}
          gravity={0.1}
        />
      )}

      {/* Top Header & Smart Board Controls */}
      <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
              title="Go Back"
            >
              <FaArrowLeft />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl border border-indigo-500/30">
              Live Results & Analytics
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              <FaSyncAlt className="animate-spin text-indigo-400" />
              <span>Auto-refreshing</span>
            </span>
          </div>

          <h1 className={`font-extrabold text-white tracking-tight mb-2 ${smartBoardMode ? 'text-4xl md:text-6xl' : 'text-2xl md:text-4xl'}`}>
            Royal Academy Election Results
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time digital vote counting, house-wise performance metrics, and winning candidate projections for the 2083 student council.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Smart Board Toggle */}
          <button
            onClick={() => setSmartBoardMode(!smartBoardMode)}
            className={`px-5 py-3 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all border ${smartBoardMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-400/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
          >
            <FaTv className="text-base" />
            <span>{smartBoardMode ? 'Exit Smart Board Mode' : 'Smart Board Mode'}</span>
          </button>

          {/* Celebrate Winners Toggle */}
          <button
            onClick={() => setCelebrateWinners(!celebrateWinners)}
            className={`px-5 py-3 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all border ${celebrateWinners ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border-amber-300' : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'}`}
          >
            <FaTrophy className="text-base" />
            <span>{celebrateWinners ? 'Stop Celebration' : 'Celebrate Winners'}</span>
          </button>
        </div>

        {/* Ambient background glow decoration */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Participation & High-level Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {/* Total Votes */}
        <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl border border-blue-500/30 shrink-0 shadow-inner">
            <FaChartBar />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Ballots Cast</div>
            <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{votes.length}</div>
          </div>
        </div>

        {/* Participation Percentage */}
        <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30 shrink-0 shadow-inner">
            <FaUsers />
          </div>
          <div className="w-full">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Voter Turnout</span>
              <span className="text-emerald-400 font-bold">{participationRate}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 mt-2 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${participationRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-lg shadow-emerald-500/50"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 font-medium">{votedStudents} of {totalStudents} registered students voted</div>
          </div>
        </div>

        {/* Election Status */}
        <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30 shrink-0 shadow-inner">
            <FaChartPie />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Election Status</div>
            <div className="text-xl md:text-2xl font-extrabold text-white tracking-tight capitalize flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${electionState.status === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span>{electionState.status}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-medium truncate max-w-[180px]">{electionState.announcement}</div>
          </div>
        </div>
      </div>

      {/* View Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto mb-8 shadow-inner">
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 flex items-center justify-center gap-2 ${activeTab === 'positions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
          <FaTrophy />
          <span>Position-wise Winners</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 flex items-center justify-center gap-2 ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
          <FaChartBar />
          <span>Bar & Pie Charts</span>
        </button>
        <button
          onClick={() => setActiveTab('houses')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 flex items-center justify-center gap-2 ${activeTab === 'houses' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
          <FaUsers />
          <span>House-wise Statistics</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 flex items-center justify-center gap-2 ${activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
          <FaClock />
          <span>Voter Turnout Timeline</span>
        </button>
      </div>

      {/* Tab 1: Position-wise Winners & Progress Bars */}
      <AnimatePresence mode="wait">
        {activeTab === 'positions' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-12 mb-12">
            {positions.map(pos => {
              const posCands = candidates.filter(c => c.position === pos);
              const totalPosVotes = posCands.reduce((sum, c) => sum + c.votesCount, 0);
              const winner = winners[pos];

              return (
                <section key={pos} className="glass-panel bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
                  {/* Position Header & Winner Highlight */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-1">{pos}</h2>
                      <p className="text-xs text-slate-400">Total votes recorded for this role: <strong className="text-slate-200 font-bold">{totalPosVotes}</strong></p>
                    </div>

                    {winner && (
                      <div className="flex items-center gap-3 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-500/5">
                        <FaMedal className="text-amber-400 text-2xl shrink-0 animate-bounce" />
                        <div>
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Current Leader</div>
                          <div className="text-sm font-extrabold text-white flex items-center gap-2">
                            <span>{winner.name}</span>
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30">
                              {winner.house}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Candidates Animated Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posCands.map(candidate => {
                      const percentage = totalPosVotes > 0 ? Math.round((candidate.votesCount / totalPosVotes) * 100) : 0;
                      const isWinner = winner?.id === candidate.id && candidate.votesCount > 0;

                      return (
                        <div key={candidate.id} className={`bg-slate-950/60 p-5 rounded-2xl border transition-all ${isWinner ? 'border-amber-500/40 bg-amber-500/5 shadow-lg shadow-amber-500/5' : 'border-slate-800/80'}`}>
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50 shadow-inner">
                                <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover object-top" />
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-base">{candidate.symbol}</span>
                                  <h4 className="text-sm font-bold text-white truncate">{candidate.name}</h4>
                                </div>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border tracking-wider ${
                                  candidate.house === 'Blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                  candidate.house === 'Red' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                  candidate.house === 'Green' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                }`}>
                                  {candidate.house} House
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-lg font-extrabold text-white">{candidate.votesCount} <span className="text-xs text-slate-400 font-normal">votes</span></div>
                              <div className="text-xs font-bold text-indigo-400">{percentage}%</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, type: "spring" }}
                              className={`h-full rounded-full shadow-lg ${
                                candidate.house === 'Blue' ? 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-blue-500/50' :
                                candidate.house === 'Red' ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-red-500/50' :
                                candidate.house === 'Green' ? 'bg-gradient-to-r from-green-600 to-green-400 shadow-green-500/50' :
                                'bg-gradient-to-r from-amber-600 to-amber-400 shadow-amber-500/50'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </motion.div>
        )}

        {/* Tab 2: Analytics Bar & Pie Charts */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {positions.map(pos => {
              const posCands = candidates.filter(c => c.position === pos);
              const chartData = posCands.map(c => ({
                name: c.name,
                votes: c.votesCount,
                house: c.house,
                fill: c.house === 'Blue' ? '#3b82f6' : c.house === 'Red' ? '#ef4444' : c.house === 'Green' ? '#10b981' : '#f59e0b'
              }));

              return (
                <div key={pos} className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-white mb-1">{pos} Distribution</h3>
                    <p className="text-xs text-slate-400 mb-6">Visual vote share breakdown across candidates.</p>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="votes" radius={[12, 12, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Tab 3: House-wise Statistics & Pie Chart */}
        {activeTab === 'houses' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* House Stats Table */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white mb-1">House Performance Summary</h3>
                <p className="text-xs text-slate-400 mb-6">Aggregate voting power accumulated by each school house.</p>
              </div>

              <div className="space-y-4">
                {houseStats.map(stat => (
                  <div key={stat.house} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: stat.color }} />
                      <span className="text-sm font-bold text-white">{stat.house} House</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-white">{stat.votes} <span className="text-xs text-slate-400 font-normal">total votes</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* House Pie Chart */}
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between items-center text-center">
              <div>
                <h3 className="text-xl font-extrabold text-white mb-1">House Vote Share</h3>
                <p className="text-xs text-slate-400 mb-4">Proportional representation of house voting strength.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={houseStats} dataKey="votes" nameKey="house" cx="50%" cy="50%" outerRadius={90} innerRadius={60} paddingAngle={4} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                      {houseStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Voter Turnout Timeline */}
        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mb-12">
            <div className="glass-panel bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">Voter Turnout Over Time</h3>
                <p className="text-xs md:text-sm text-slate-400">Cumulative timeline showing the rate of student participation during the election period.</p>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} 
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                    />
                    <Line type="monotone" dataKey="runningTotal" name="Total Votes Cast" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#818cf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
