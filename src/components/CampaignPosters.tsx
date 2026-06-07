import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBullhorn, FaTimes, FaStar } from 'react-icons/fa';

export const CampaignPosters: React.FC = () => {
  const { candidates } = useApp();
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);
  const [filterHouse, setFilterHouse] = useState<string>('All');

  const houses = ['All', 'Blue', 'Red', 'Green', 'Yellow'];

  const getCardStyle = (house: string, position: string) => {
    if (position === 'Head Boy' || position === 'Head Girl') {
      return 'glass-panel border-slate-800/80 shadow-xl';
    }
    switch (house) {
      case 'Blue': return 'glass-card-blue shadow-blue-500/30 border-blue-500/50';
      case 'Red': return 'glass-card-red shadow-red-500/30 border-red-500/50';
      case 'Green': return 'glass-card-green shadow-green-500/30 border-green-500/50';
      case 'Yellow': return 'glass-card-yellow shadow-yellow-500/30 border-yellow-500/50';
      default: return 'glass-panel border-slate-800/80 shadow-xl';
    }
  };

  const getObjectives = (candidate: any) => {
    const hash = candidate.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const position = candidate.position;

    const headPool = [
      ['Bridge the gap between students and management.', 'Lead the student council to organize mega events.', 'Ensure a positive and inclusive school environment.'],
      ['Promote student well-being and mental health.', 'Represent student voices in school board meetings.', 'Foster a culture of respect and academic excellence.'],
      ['Implement new campus initiatives.', 'Enhance school infrastructure and facilities.', 'Build a stronger alumni network for mentorship.'],
      ['Organize school-wide cultural festivals.', 'Focus on eco-friendly and sustainability projects.', 'Create better communication channels for students.']
    ];

    const sportsPool = [
      ['Promote athletic excellence and sportsmanship.', 'Organize inter-house tournaments and sports meets.', 'Ensure proper maintenance of sports equipment.'],
      ['Introduce new sports and fitness programs.', 'Improve training facilities and coaching access.', 'Encourage participation from all students.'],
      ['Focus on student-athlete physical and mental health.', 'Organize friendly matches with other schools.', 'Create an intramural sports league.'],
      ['Host regular fitness challenges.', 'Upgrade school gymnasium and fields.', 'Celebrate sports achievements with dedicated awards.']
    ];

    const disciplinePool = [
      ['Maintain decorum and discipline on campus.', 'Implement fair rules and monitor compliance.', 'Assist teachers in managing large gatherings.'],
      ['Promote anti-bullying campaigns.', 'Create a student-led peer mediation program.', 'Ensure a safe and secure learning environment.'],
      ['Develop a transparent reward and consequence system.', 'Focus on positive reinforcement rather than punishment.', 'Organize workshops on ethics and behavior.'],
      ['Bridge the gap between students and disciplinary staff.', 'Ensure smooth transitions between classes.', 'Foster a culture of mutual respect and responsibility.']
    ];

    const housePool = [
      ['Lead the house to victory in inter-house competitions.', 'Discover and nurture talents within the house.', 'Maintain high house spirit and participation.'],
      ['Organize weekly house meetings and bonding activities.', 'Ensure fair representation in all school events.', 'Build a strong mentorship network within the house.'],
      ['Focus on winning the annual house cup.', 'Coordinate academic and sports tutoring for house members.', 'Create a supportive house community.'],
      ['Host house-specific events and fundraisers.', 'Promote collaboration among junior and senior members.', 'Foster a competitive yet friendly environment.']
    ];

    const defaultPool = [
      ['Represent student interests effectively.', 'Work collaboratively with other council members.', 'Bring positive changes to the school.'],
      ['Focus on student feedback and actionable improvements.', 'Ensure transparency in council decisions.', 'Promote a diverse and inclusive campus.'],
      ['Organize community service and outreach programs.', 'Support student clubs and extracurriculars.', 'Create a lasting impact during my tenure.']
    ];

    let pool = defaultPool;
    if (position === 'Head Boy' || position === 'Head Girl') pool = headPool;
    else if (position === 'Sports Captain') pool = sportsPool;
    else if (position === 'Discipline Captain') pool = disciplinePool;
    else if (position === 'House Captain' || position === 'House Vice Captain') pool = housePool;

    return pool[hash % pool.length];
  };

  const filteredCandidates = filterHouse === 'All'
    ? candidates
    : candidates.filter(c => c.house === filterHouse);

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const positionOrder: Record<string, number> = {
      'Head Boy': 1,
      'Head Girl': 2,
      'Sports Captain': 3,
      'Discipline Captain': 4,
      'House Captain': 5,
      'House Vice Captain': 6
    };
    
    const posA = positionOrder[a.position] || 99;
    const posB = positionOrder[b.position] || 99;
    
    if (posA !== posB) {
      return posA - posB;
    }
    
    const houseOrder: Record<string, number> = {
      'Blue': 1,
      'Red': 2,
      'Green': 3,
      'Yellow': 4
    };
    
    const houseA = houseOrder[a.house] || 99;
    const houseB = houseOrder[b.house] || 99;
    
    return houseA - houseB;
  });

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <FaBullhorn />
            <span className="text-xs font-bold uppercase tracking-wider">Interactive Gallery</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Candidate Campaign Posters</h2>
          <p className="text-xs md:text-sm text-slate-400">Explore the manifestos, slogans, and campaign promises of our student leaders.</p>
        </div>

        {/* House Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {houses.map(house => (
            <button
              key={house}
              onClick={() => setFilterHouse(house)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${filterHouse === house ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              {house} {house !== 'All' && 'House'}
            </button>
          ))}
        </div>
      </div>

      {/* Posters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {sortedCandidates.map(candidate => (
          <motion.div
            key={candidate.id}
            whileHover={{ y: -6 }}
            className={`glass-panel rounded-3xl overflow-hidden border group cursor-pointer flex flex-col justify-between shadow-xl ${getCardStyle(candidate.house, candidate.position)}`}
            onClick={() => setSelectedPoster(candidate.id)}
          >
            <div className="h-64 overflow-hidden relative bg-slate-900">
              <img
                src={candidate.photoUrl}
                alt={candidate.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Symbol Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md w-10 h-10 rounded-xl border border-slate-700 flex items-center justify-center text-xl shadow-lg">
                {candidate.symbol}
              </div>

              {/* Position Tag */}
              <div className="absolute bottom-3 left-3 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg shadow-lg">
                {candidate.position}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between bg-slate-950/40">
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                  {candidate.house} House Candidate
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {candidate.name}
                </h3>
                <p className="text-xs text-slate-300 italic line-clamp-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  "{candidate.slogan}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>View Full Manifesto</span>
                <span>→</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Poster Modal Popup */}
      <AnimatePresence>
        {selectedPoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPoster(null)}
          >
            {(() => {
              const cand = candidates.find(c => c.id === selectedPoster);
              if (!cand) return null;

              return (
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className={`glass-panel bg-slate-900/95 border rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row ${getCardStyle(cand.house, cand.position)}`}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedPoster(null)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700"
                  >
                    <FaTimes />
                  </button>

                  <div className="w-full md:w-1/2 h-72 md:h-auto relative bg-slate-950">
                    <img src={cand.photoUrl} alt={cand.name} className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent md:hidden" />
                  </div>

                  <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-slate-900/80">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{cand.symbol}</span>
                        <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                          {cand.house} House
                        </span>
                      </div>

                      <h2 className="text-2xl font-extrabold text-white mb-1">{cand.name}</h2>
                      <p className="text-xs font-semibold text-indigo-400 mb-6">{cand.position}</p>

                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 mb-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FaStar className="text-amber-400" />
                          <span>Campaign Slogan</span>
                        </h4>
                        <p className="text-sm text-white italic leading-relaxed">
                          "{cand.slogan}"
                        </p>
                      </div>

                      <div className="space-y-3 text-xs text-slate-300">
                        <h4 className="font-bold text-slate-400 uppercase tracking-wider">Key Objectives:</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-300/90">
                          {getObjectives(cand).map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPoster(null)}
                      className="mt-8 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
                    >
                      Close Manifesto
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
