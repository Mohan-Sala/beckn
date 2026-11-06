import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService, verificationService } from '../services/api';
import { 
  ShieldCheck, Network, Lock, FileText, CheckCircle, Database, 
  ArrowLeft, Check, AlertCircle, RefreshCw, KeyRound
} from 'lucide-react';

export default function VerificationProcess({ user }) {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [credential, setCredential] = useState(null);
  const [consent, setConsent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await candidateService.getProfile(user.id);
        const targetSkill = res.data.skills.find(s => s.skillId == skillId);
        setSkill(targetSkill);
        
        if (targetSkill) {
          try {
            const credRes = await candidateService.getCredentialForSkill(user.id, skillId);
            setCredential(credRes.data);
          } catch (e) {
            console.log("No credential found for this skill");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.id, skillId]);

  const handleVerify = async () => {
    if (!consent) return;
    setIsVerifying(true);
    setProgress(15);

    try {
      await verificationService.giveConsent(user.id, skillId);
      await verificationService.verifySkill(user.id, skillId);
      
      let attempts = 0;
      const maxAttempts = 12;

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const res = await verificationService.getResult(user.id, skillId);
          const status = res.data ? res.data.status : null;
          
          if (status === 'REQUESTED') {
            setProgress(35);
          } else if (status === 'DISCOVERING') {
            setProgress(55);
          } else if (status === 'INITIALIZED') {
            setProgress(80);
          } else if (status === 'VERIFIED' || status === 'PARTIALLY VERIFIED' || status === 'NOT VERIFIED') {
            setProgress(100);
            clearInterval(pollInterval);
            setTimeout(() => {
              navigate(`/candidate/result/${skillId}`);
            }, 400);
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setProgress(100);
            setTimeout(() => {
              navigate(`/candidate/result/${skillId}`);
            }, 400);
          }
        } catch (pollErr) {
          console.error("Polling error", pollErr);
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsVerifying(false);
          }
        }
      }, 1000);
      
    } catch (err) {
      alert('Verification initiation failed. Please ensure a credential is attached.');
      setIsVerifying(false);
    }
  };

  if (!skill) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preparing Beckn Protocol transaction...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/candidate/dashboard')}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Network size={14} /> ONEST Network Protocol • Beckn BAP
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Verify Skill: <span className="text-blue-600">{skill.name}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Execute an RFC 8032 Ed25519 cryptographically signed discovery contract across authoritative ONEST credential registries.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Submitted Evidence Card */}
        <div className="md:col-span-6 bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Database size={18} className="text-blue-600" />
              Attached Credential Evidence
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Evidence Ledger
            </span>
          </div>
          
          {credential ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Certificate Title</p>
                <p className="font-bold text-sm text-slate-900">{credential.certificateName}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Credential ID / QR Payload</p>
                <p className="font-mono text-xs font-bold text-emerald-700 break-all">{credential.credentialId}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Authoritative Issuer</p>
                <p className="font-bold text-sm text-slate-900">{credential.issuer}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Document File</p>
                  <p className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
                    <FileText size={15} className="text-blue-500" />
                    <span className="truncate max-w-[180px]">{credential.evidenceFileUrl || 'Attached Certificate'}</span>
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 p-1.5 rounded-full">
                  <CheckCircle size={16} />
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No credential attached</p>
                <p className="text-xs text-slate-500 mt-0.5">Please upload your certificate before requesting verification.</p>
              </div>
              <button 
                onClick={() => navigate(`/candidate/credential/add/${skillId}`)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-2"
              >
                Upload Credential Now &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Verification & Consent Action Card */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl shadow-xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 border border-slate-700/60">
          
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
                <Lock size={12} /> DPDP & GDPR Compliant
              </div>
              <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <KeyRound size={20} className="text-blue-400" />
                Network Authorization & Consent
              </h3>
            </div>
            
            {/* Consent Box */}
            <div className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700 backdrop-blur-md">
              <label className="flex items-start gap-3.5 cursor-pointer select-none">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    disabled={isVerifying}
                  />
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    consent ? 'bg-blue-600 border-blue-600' : 'border-slate-500 bg-slate-900'
                  }`}>
                    {consent && <Check size={14} className="text-white stroke-[3]" />}
                  </div>
                </div>
                <span className="text-xs text-slate-300 leading-relaxed font-normal">
                  I explicitly grant consent for this platform to broadcast an Ed25519-signed query to the Beckn ONEST network to verify my <strong className="text-white font-bold">"{skill.name}"</strong> credential against authoritative registries.
                </span>
              </label>
            </div>

            {/* Live Network Execution Stepper & Terminal Log */}
            {isVerifying && (
              <div className="space-y-4 animate-fade-in bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <span>Beckn Protocol Execution</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Micro Terminal Stages */}
                <div className="space-y-1.5 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <p className={progress >= 15 ? 'text-emerald-400 font-semibold' : ''}>
                    [1/4] &gt; Generating RFC 8032 Ed25519 signed envelope...
                  </p>
                  {progress >= 35 && (
                    <p className={progress >= 55 ? 'text-emerald-400 font-semibold' : 'text-blue-300'}>
                      [2/4] &gt; Broadcast POST /search to ONEST gateway...
                    </p>
                  )}
                  {progress >= 55 && (
                    <p className={progress >= 80 ? 'text-emerald-400 font-semibold' : 'text-blue-300'}>
                      [3/4] &gt; Initializing terms & provider handshake (/init)...
                    </p>
                  )}
                  {progress >= 80 && (
                    <p className="text-white font-bold animate-pulse">
                      [4/4] &gt; Finalizing verification proof & scoring (/confirm)...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Verification Trigger Button */}
          <button 
            onClick={handleVerify}
            disabled={!consent || !credential || isVerifying}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${
              !consent || !credential
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                : isVerifying
                  ? 'bg-blue-900 text-blue-200 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 border border-blue-400/30'
            }`}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Executing Beckn Handshake...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Initiate Beckn ONEST Verification</span>
              </>
            )}
          </button>

        </div>
      </div>

    </div>
  );
}
