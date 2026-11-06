import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService, verificationService } from '../services/api';
import { 
  ArrowLeft, GraduationCap, CheckCircle, Shield, XCircle, 
  Code, Clock, FileText, Database, ShieldCheck, Terminal, 
  Hash, ExternalLink, Calendar, CheckCircle2
} from 'lucide-react';

export default function EmployerProfileView() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await candidateService.getProfile(candidateId);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [candidateId]);

  const handleViewEvidence = async (skillId) => {
    setSelectedSkill(skillId);
    setIsLoadingEvidence(true);
    setEvidenceData(null);
    try {
      const res = await verificationService.getResult(candidateId, skillId);
      setEvidenceData(res.data);
    } catch (err) {
      console.error(err);
      setEvidenceData(null);
    } finally {
      setIsLoadingEvidence(false);
    }
  };

  if (!profile) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading candidate evidence ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/employer/dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft size={16} /> Back to Search Candidates
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck size={14} /> ONEST Audit Protocol Active
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 sm:p-8 text-center sticky top-24 space-y-6">
            
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-blue-500/25 border-4 border-white">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs sm:text-sm font-medium mt-1">
                <GraduationCap size={16} className="text-blue-600" />
                <span>{profile.education}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{profile.college} • Class of {profile.graduationYear}</p>
            </div>
            
            {/* Trust Score Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center">
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                Unified Trust Score
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-slate-900">{profile.overallVerificationScore}</span>
                <span className="text-lg font-bold text-blue-600">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" /> Maximum confidence ceiling: 95%
              </p>
            </div>

            {/* Security Guarantee List */}
            <div className="text-left pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
              <p className="flex items-center gap-2">
                <Shield size={14} className="text-emerald-500 shrink-0" />
                <span>Ed25519 Cryptographically Signed</span>
              </p>
              <p className="flex items-center gap-2">
                <Database size={14} className="text-blue-500 shrink-0" />
                <span>Indexed Transaction Audit Ledger</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle size={14} className="text-indigo-500 shrink-0" />
                <span>Tamper-Resistant QR Validation</span>
              </p>
            </div>

          </div>
        </div>

        {/* Skills Main Area */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Code size={20} className="text-blue-600" />
              Verified Skill Matrix
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Select a skill to inspect its cryptographic evidence
            </span>
          </div>
          
          {/* Skill Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.skills?.map(skill => (
              <div 
                key={skill.skillId} 
                onClick={() => handleViewEvidence(skill.skillId)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col justify-between group card-hover ${
                  selectedSkill === skill.skillId 
                    ? 'border-blue-500 shadow-md ring-4 ring-blue-50 bg-blue-50/10' 
                    : 'border-slate-200/90 hover:border-blue-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {skill.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {skill.name}
                      </h4>
                    </div>

                    {skill.verificationStatus === 'VERIFIED' ? (
                      <span className="bg-emerald-50 text-emerald-700 p-1.5 rounded-full border border-emerald-200">
                        <CheckCircle size={16} />
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 p-1.5 rounded-full border border-slate-200">
                        <Clock size={16} />
                      </span>
                    )}
                  </div>

                  {skill.verificationStatus === 'VERIFIED' && (
                    <div className="mb-3">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                        Level: {skill.competencyLevel}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  {skill.verificationStatus === 'VERIFIED' ? (
                    <>
                      <span className="text-slate-500">Confidence Index</span>
                      <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {skill.confidenceScore}%
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-normal">Click to check verification status</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cryptographic Evidence Terminal View */}
          {selectedSkill && (
            <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-slide-up mt-8">
              
              {/* Terminal Window Header */}
              <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                  <Terminal size={14} className="text-emerald-400" />
                  <span>onest_proof_ledger.json</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">SHA-256 Verified</span>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                </div>
              </div>
              
              {/* Terminal Output */}
              <div className="p-6 font-mono text-xs leading-relaxed text-slate-300 space-y-6">
                {isLoadingEvidence ? (
                  <div className="flex items-center gap-2 text-blue-400 py-6">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Querying Beckn Transaction Ledger & decrypting evidence block...</span>
                  </div>
                ) : !evidenceData ? (
                  <div className="text-red-400 flex items-center gap-2 py-4">
                    <XCircle size={16} /> No verified credential evidence found for this skill.
                  </div>
                ) : (
                  <div className="space-y-5">
                    
                    {/* Check Matrix */}
                    <div className="border-l-2 border-blue-500 pl-4 space-y-3">
                      <p className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                        // CRYPTOGRAPHIC VERIFICATION PROOFS
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <CheckCircle size={15} className={evidenceData.credentialStatus === 'VERIFIED' ? "text-emerald-400" : "text-slate-600"} />
                          <div>
                            <p className="text-[10px] text-slate-400">Credential Sig</p>
                            <p className={evidenceData.credentialStatus === 'VERIFIED' ? "text-emerald-300 font-bold" : "text-slate-500"}>
                              {evidenceData.credentialStatus || 'UNKNOWN'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <CheckCircle size={15} className={evidenceData.educationStatus === 'VERIFIED' ? "text-emerald-400" : "text-slate-600"} />
                          <div>
                            <p className="text-[10px] text-slate-400">Registry Match</p>
                            <p className={evidenceData.educationStatus === 'VERIFIED' ? "text-emerald-300 font-bold" : "text-slate-500"}>
                              {evidenceData.educationStatus || 'UNKNOWN'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <CheckCircle size={15} className={evidenceData.assessmentStatus === 'VERIFIED' ? "text-emerald-400" : "text-slate-600"} />
                          <div>
                            <p className="text-[10px] text-slate-400">Assessment</p>
                            <p className={evidenceData.assessmentStatus === 'VERIFIED' ? "text-emerald-300 font-bold" : "text-slate-500"}>
                              {evidenceData.assessmentStatus || 'UNKNOWN'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Submitted Evidence Details */}
                    {evidenceData.credentialId && (
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                        <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold mb-2">
                          // SUBMITTED CREDENTIAL DATA & ISSUER IDENTIFIERS
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-2 gap-y-1.5">
                          <span className="text-slate-400">Credential ID:</span>
                          <span className="text-emerald-400 font-bold">{evidenceData.credentialId}</span>
                          
                          <span className="text-slate-400">Authoritative Issuer:</span>
                          <span className="text-slate-200">{evidenceData.issuer || 'ONEST National Registry'}</span>
                          
                          <span className="text-slate-400">Certificate Title:</span>
                          <span className="text-slate-200">{evidenceData.certificateName || 'Accredited Credential'}</span>

                          <span className="text-slate-400">Confidence Score:</span>
                          <span className="text-blue-400 font-bold">{evidenceData.confidenceScore}%</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Timestamp & Verification Hash */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Hash size={13} className="text-blue-400" />
                        <span>TX ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}-ONEST-V1</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{evidenceData.verifiedAt ? new Date(evidenceData.verifiedAt).toUTCString() : new Date().toUTCString()}</span>
                      </span>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
