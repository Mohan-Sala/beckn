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
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await employerService.searchCandidates(searchTerm.trim());
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (name) => {
    setSearchTerm(name);
    setIsSearching(true);
    setHasSearched(true);
    employerService.searchCandidates(name)
      .then(res => setResults(res.data || []))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      
      {/* Hero Search Section */}
      <div className="bg-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
        
        {/* Subtle grid and ambient lights */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ONEST Framework • Beckn Protocol BAP
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Verify Talent with Confidence
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-normal mb-8 max-w-2xl mx-auto leading-relaxed">
            Query authenticated credentials across the decentralized ONEST network. Instantly inspect cryptographically verified skills and issuer digital signatures.
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                <Search size={20} />
              </div>
              
              <input 
                type="text" 
                className="w-full pl-12 pr-32 py-4 sm:py-4.5 bg-slate-800/90 text-white border border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm sm:text-base outline-none transition-all placeholder-slate-400 shadow-2xl" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search candidates by name (e.g. Alex, Sarah)..."
              />

              <div className="absolute right-2 flex items-center">
                <button 
                  type="submit" 
                  disabled={isSearching || !searchTerm.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Search</span>
                      <ArrowRight size={14} className="hidden sm:inline" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Filter Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <span>Quick search:</span>
            {['Alex', 'Sarah', 'John'].map(name => (
              <button
                key={name}
                type="button"
                onClick={() => handleQuickSearch(name)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!hasSearched ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Begin Candidate Discovery</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Enter any candidate's name above to look up their unified profile and inspect verified Beckn ONEST skill badges.
            </p>
          </div>
        ) : (
          <div className="animate-slide-up space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Search Results</span>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full">
                  {results.length} found
                </span>
              </h2>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Verified through ONEST Work Opportunities Protocol
              </span>
            </div>
            
            {results.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl shadow-xs border border-slate-200 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <User size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">No candidate records found</h4>
                <p className="text-sm text-slate-500">
                  No verified candidates matched "{searchTerm}". Check the spelling or try searching another name.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map((candidate, idx) => (
                  <div 
                    key={candidate.candidateId} 
                    className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group card-hover"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-600 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-inner border border-slate-200 shrink-0">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {candidate.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                          <GraduationCap size={15} className="text-slate-400 shrink-0" />
                          <span>{candidate.education}</span>
                          <span className="text-slate-400">•</span>
                          <span>Graduation {candidate.graduationYear}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-center min-w-[120px]">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Trust Score</p>
                        <div className="flex items-baseline justify-center gap-0.5">
                          <span className="text-2xl font-black text-slate-900">{candidate.overallVerificationScore}</span>
                          <span className="text-xs font-bold text-blue-600">%</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate(`/employer/candidate/${candidate.candidateId}`)}
                        className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
                      >
                        <span>Inspect Profile</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
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
