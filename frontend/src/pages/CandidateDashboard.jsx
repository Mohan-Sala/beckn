import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateService } from '../services/api';
import { 
  CheckCircle, AlertTriangle, Clock, GraduationCap, ChevronRight, 
  PlusCircle, Sparkles, ShieldCheck, Share2, Network, ExternalLink, 
  Layers, CheckCircle2, Shield
} from 'lucide-react';

export default function CandidateDashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState({});
  const [isConnecting, setIsConnecting] = useState(null);
  const navigate = useNavigate();

  const connectPlatform = (platform) => {
    setIsConnecting(platform);
    setTimeout(() => {
      setConnectedPlatforms(prev => ({...prev, [platform]: true}));
      setIsConnecting(null);
    }, 1500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await candidateService.getProfile(user.id);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [user.id]);

  if (!profile) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading unified candidate profile...</p>
    </div>
  );

  const renderBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <CheckCircle size={14} className="text-emerald-600" /> Verified
          </span>
        );
      case 'PARTIALLY VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
            <AlertTriangle size={14} className="text-amber-600" /> Partially Verified
          </span>
        );
      case 'NOT VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/80 shadow-xs">
            <AlertTriangle size={14} className="text-red-600" /> Not Verified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/80 shadow-xs">
            <Clock size={14} className="text-slate-400" /> Pending Review
          </span>
        );
    }
  };

  // Metrics calculation
  const totalSkills = profile.skills?.length || 0;
  const verifiedSkills = profile.skills?.filter(s => s.verificationStatus === 'VERIFIED').length || 0;
  const pendingSkills = totalSkills - verifiedSkills;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Profile Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl shadow-xl p-6 sm:p-10 text-white relative overflow-hidden border border-slate-700/60">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none hidden lg:block">
          <GraduationCap size={280} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center justify-between">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-lg shadow-blue-500/30 border-2 border-white/20 shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck size={13} /> ONEST Network Verified Candidate
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">{profile.name}</h1>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-300 text-xs sm:text-sm font-medium">
                <span className="flex items-center gap-1.5 text-blue-300 font-semibold">
                  <GraduationCap size={16} /> {profile.education}
                </span>
                <span className="text-slate-500">•</span>
                <span>{profile.college}</span>
                <span className="text-slate-500">•</span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-xs font-semibold">
                  Class of {profile.graduationYear}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Score Radial Card */}
          <div className="w-full md:w-auto bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex md:flex-col items-center justify-between md:justify-center min-w-[160px] text-center shadow-inner">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                Unified Trust Score
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {profile.overallVerificationScore}
                </span>
                <span className="text-lg font-bold text-blue-400">%</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
              <CheckCircle2 size={12} /> Capped &lt; 100% (Tamper-Resistant)
            </div>
          </div>

        </div>

        {/* Quick Stats Strip */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Skills</p>
              <p className="text-lg font-bold text-white">{totalSkills}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Verified Skills</p>
              <p className="text-lg font-bold text-emerald-400">{verifiedSkills}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">In Progress</p>
              <p className="text-lg font-bold text-amber-300">{pendingSkills}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Network Standard</p>
              <p className="text-xs font-bold text-indigo-300">W3C Verifiable</p>
            </div>
          </div>
        </div>

      </div>

      {/* Skills Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Professional Competency Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cryptographically verifiable skills published to the Beckn ONEST network.
          </p>
        </div>
        <button
          onClick={() => navigate('/candidate/verify-resume')}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Sparkles size={16} /> Auto-Verify via Resume / QR
        </button>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.skills?.map((skill, idx) => (
          <div 
            key={skill.skillId} 
            className="bg-white rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/80 p-6 flex flex-col justify-between group card-hover"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div>
              {/* Card Header: Category & Badge */}
              <div className="flex justify-between items-start mb-3 gap-2">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md tracking-wide">
                  {skill.category}
                </span>
                {renderBadge(skill.verificationStatus)}
              </div>

              {/* Skill Title */}
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {skill.name}
              </h3>

              {/* Status Display Area */}
              <div className="py-4 my-2 border-y border-slate-100 flex flex-col items-center justify-center min-h-[100px]">
                {skill.verificationStatus === 'VERIFIED' ? (
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-1">
                      <Sparkles size={13} className="text-emerald-600" />
                      Level: {skill.competencyLevel}
                    </div>
                    
                    {/* Score Bar */}
                    <div className="w-full max-w-[200px] mt-2">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Confidence</span>
                        <span className="text-emerald-700 font-bold">{skill.confidenceScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(skill.confidenceScore || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center px-2">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <ShieldCheck size={20} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Upload certificate or scan QR to verify this credential.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card Action Buttons */}
            {skill.name.toLowerCase().includes('credly') ? (
              <div className="mt-4 pt-2">
                <button 
                  onClick={() => navigate(`/verify-badge/${skill.skillId}`)}
                  className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 ${
                    skill.verificationStatus === 'VERIFIED' 
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                  }`}
                >
                  <span>{skill.verificationStatus === 'VERIFIED' ? 'View Linked Credly Badge' : 'Verify via Credly'}</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-2 flex items-center gap-2.5">
                <button 
                  onClick={() => navigate(`/candidate/credential/add/${skill.skillId}`)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlusCircle size={15} className="text-slate-500" />
                  <span>Upload</span>
                </button>

                <button 
                  onClick={() => {
                    if (skill.verificationStatus === 'VERIFIED') {
                      navigate(`/candidate/result/${skill.skillId}`);
                    } else {
                      navigate(`/candidate/verification/${skill.skillId}`);
                    }
                  }}
                  className={`flex-1 font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                    skill.verificationStatus === 'VERIFIED' 
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                  }`}
                >
                  <span>{skill.verificationStatus === 'VERIFIED' ? 'Audit Proof' : 'Verify Now'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hiring Platforms Section */}
      <div className="mt-14 pt-8 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shadow-inner">
            <Network size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Beckn Open Hiring Network</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Instantly broadcast your verified trust score with ONEST compatible hiring platforms without re-verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { id: 'linkedin', name: 'LinkedIn Jobs', icon: 'LI', color: 'from-blue-600 to-blue-800' },
            { id: 'naukri', name: 'Naukri.com', icon: 'NK', color: 'from-sky-500 to-sky-700' },
            { id: 'indeed', name: 'Indeed Platform', icon: 'IN', color: 'from-indigo-600 to-indigo-800' }
          ].map(platform => (
            <div 
              key={platform.id} 
              className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 flex flex-col items-center text-center hover:shadow-md transition-all group card-hover"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${platform.color} rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md mb-3 transform group-hover:scale-105 transition-transform`}>
                {platform.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-0.5">{platform.name}</h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-4">ONEST Work Exchange</p>
              
              {connectedPlatforms[platform.id] ? (
                <button disabled className="w-full bg-emerald-50 text-emerald-700 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-200 flex justify-center items-center gap-1.5 cursor-default">
                  <CheckCircle size={15} /> Synced via Beckn
                </button>
              ) : (
                <button 
                  onClick={() => connectPlatform(platform.id)}
                  disabled={isConnecting !== null}
                  className="w-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-200 transition-all flex justify-center items-center gap-1.5 shadow-xs"
                >
                  {isConnecting === platform.id ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Share2 size={14} /> Sync Profile</>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
