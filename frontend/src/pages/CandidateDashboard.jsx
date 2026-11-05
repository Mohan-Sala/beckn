import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateService } from '../services/api';
import { CheckCircle, AlertTriangle, Clock, GraduationCap, ChevronRight, PlusCircle, Sparkles, ShieldCheck, Share2, Network, ExternalLink } from 'lucide-react';

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
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  const renderBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="bg-success-50 text-success-600 border border-success-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><CheckCircle size={14} className="animate-pulse-slow"/> Verified</span>;
      case 'PARTIALLY VERIFIED':
        return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><AlertTriangle size={14}/> Partially Verified</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><Clock size={14}/> Pending</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 animate-fade-in">
      
      {/* Profile Hero Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 mb-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <GraduationCap size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-4xl font-extrabold shadow-inner border border-white/20">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
              <ShieldCheck size={12} /> ONEST Network Verified Candidate
            </div>
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{profile.name}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-gray-300 font-medium">
              <span className="flex items-center gap-2"><GraduationCap size={18} className="text-primary-400"/> {profile.education}</span>
              <span className="hidden sm:inline text-gray-600">•</span>
              <span>{profile.college}</span>
              <span className="hidden sm:inline text-gray-600">•</span>
              <span>Class of {profile.graduationYear}</span>
            </div>
          </div>
          <div className="bg-white/10 glass rounded-xl p-4 text-center min-w-[140px]">
            <p className="text-xs uppercase tracking-wider text-gray-300 mb-1 font-semibold">Trust Score</p>
            <p className="text-3xl font-bold text-white flex justify-center items-baseline gap-1">
              {profile.overallVerificationScore}<span className="text-lg text-primary-400">%</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Skills</h2>
          <p className="text-gray-500 mt-1">Manage and verify your professional competencies.</p>
        </div>
        <button
          onClick={() => navigate('/candidate/verify-resume')}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles size={18} /> Auto-Verify via Resume
        </button>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.skills?.map((skill, idx) => (
          <div key={skill.skillId} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex flex-col h-full animate-slide-up group" style={{ animationDelay: `${idx * 0.1}s` }}>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{skill.name}</h3>
                <p className="text-sm font-medium text-gray-500">{skill.category}</p>
              </div>
              {renderBadge(skill.verificationStatus)}
            </div>

            <div className="flex-1 flex items-center justify-center py-6">
              {skill.verificationStatus === 'VERIFIED' ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-success-50 rounded-full mb-3 shadow-inner border border-success-100">
                    <Sparkles size={28} className="text-success-500" />
                  </div>
                  <p className="font-bold text-gray-900">{skill.competencyLevel}</p>
                  <p className="text-sm text-gray-500 font-medium">Confidence: <span className="text-success-600 font-bold">{skill.confidenceScore}%</span></p>
                </div>
              ) : (
                <div className="text-center px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-3 border border-gray-100 border-dashed">
                    <ShieldCheck size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium max-w-[200px] mx-auto">Upload credentials to verify this skill on the Beckn network.</p>
                </div>
              )}
            </div>

            {skill.name.toLowerCase().includes('credly') ? (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => navigate(`/verify-badge/${skill.skillId}`)}
                  className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                    skill.verificationStatus === 'VERIFIED' 
                    ? 'bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-md hover:from-indigo-700 hover:to-indigo-800'
                  }`}
                >
                  {skill.verificationStatus === 'VERIFIED' ? 'View Linked Badge' : 'Verify via Credly'} <ExternalLink size={18} />
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => navigate(`/candidate/credential/add/${skill.skillId}`)}
                  className="flex-1 bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} className="text-gray-400" /> Upload
                </button>
                <button 
                  onClick={() => {
                    if (skill.verificationStatus === 'VERIFIED') {
                      navigate(`/candidate/result/${skill.skillId}`);
                    } else {
                      navigate(`/candidate/verification/${skill.skillId}`);
                    }
                  }}
                  className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                    skill.verificationStatus === 'VERIFIED' 
                    ? 'bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50' 
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-md hover:from-primary-700 hover:to-primary-800'
                  }`}
                >
                  {skill.verificationStatus === 'VERIFIED' ? 'View Evidence' : 'Verify Now'} <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hiring Platforms Section */}
      <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-100 p-2.5 rounded-xl text-primary-600 shadow-inner">
            <Network size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Beckn Open Hiring Network</h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">Instantly share your verified trust score with 3+ compatible hiring platforms via ONEST.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'linkedin', name: 'LinkedIn Jobs', icon: 'LI', color: 'from-blue-600 to-blue-800' },
            { id: 'naukri', name: 'Naukri.com', icon: 'NK', color: 'from-sky-500 to-sky-700' },
            { id: 'indeed', name: 'Indeed', icon: 'IN', color: 'from-indigo-600 to-indigo-800' }
          ].map(platform => (
            <div key={platform.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 group">
              <div className={`w-16 h-16 bg-gradient-to-br ${platform.color} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg mb-4 transform group-hover:scale-110 transition-transform`}>
                {platform.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{platform.name}</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-5">ONEST Partner</p>
              
              {connectedPlatforms[platform.id] ? (
                <button disabled className="w-full bg-success-50 text-success-700 font-bold py-2.5 px-4 rounded-xl border border-success-200 flex justify-center items-center gap-2 cursor-default shadow-inner">
                  <CheckCircle size={18} /> Synced via Beckn
                </button>
              ) : (
                <button 
                  onClick={() => connectPlatform(platform.id)}
                  disabled={isConnecting !== null}
                  className="w-full bg-white text-gray-700 hover:text-primary-600 font-semibold py-2.5 px-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all flex justify-center items-center gap-2 shadow-sm"
                >
                  {isConnecting === platform.id ? (
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Share2 size={16} /> Sync Profile</>
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
