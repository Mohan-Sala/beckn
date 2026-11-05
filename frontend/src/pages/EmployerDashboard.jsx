import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employerService } from '../services/api';
import { Search, User, Briefcase, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function EmployerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await employerService.searchCandidates(searchTerm);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Search Section */}
      <div className="bg-gray-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-emerald-300 border border-white/20 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4">
            <span>ONEST Framework</span> • <span>Beckn Protocol BAP</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Verify Talent with Confidence</h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium mb-10 max-w-2xl mx-auto">Access cryptographically verified skills and credentials instantly through the ONEST decentralized network powered by Beckn protocol.</p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search size={24} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input 
              type="text" 
              className="w-full pl-16 pr-32 py-5 bg-white/10 glass-dark text-white border border-white/20 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white/20 transition-all outline-none text-lg placeholder-gray-400" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search candidates by name..."
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button 
                type="submit" 
                disabled={isSearching}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:bg-gray-600 flex items-center gap-2"
              >
                {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        {!hasSearched ? (
          <div className="text-center py-20 opacity-60">
            <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-bold text-gray-400">Enter a candidate name to begin.</p>
          </div>
        ) : (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              Search Results <span className="text-sm bg-gray-200 text-gray-600 py-1 px-2.5 rounded-full">{results.length}</span>
            </h2>
            
            {results.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl shadow-sm border border-gray-200">
                <User size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium text-lg">No verified candidates found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {results.map((candidate, idx) => (
                  <div key={candidate.candidateId} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row items-center gap-6 group" style={{animationDelay: `${idx*0.1}s`}}>
                    <div className="w-20 h-20 bg-gradient-to-tr from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-gray-400 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:text-primary-600 transition-colors shadow-inner">
                      {candidate.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{candidate.name}</h3>
                      <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
                        <GraduationCap size={18}/> {candidate.education} ({candidate.graduationYear})
                      </p>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 text-center w-full md:w-auto">
                      <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Overall Trust Score</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-black text-gray-900">{candidate.overallVerificationScore}</span>
                        <span className="text-gray-500 font-bold">%</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/employer/candidate/${candidate.candidateId}`)}
                      className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      View Profile <ArrowRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
