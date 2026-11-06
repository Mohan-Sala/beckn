import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService, verificationService } from '../services/api';
import { ShieldCheck, Network, Lock, FileText, CheckCircle, Database } from 'lucide-react';

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
    setProgress(15); // Start

    try {
      await verificationService.giveConsent(user.id, skillId);
      await verificationService.verifySkill(user.id, skillId);
      
      let attempts = 0;
      const maxAttempts = 12; // Max 12 seconds

      // Poll the backend until the state is no longer REQUESTED, DISCOVERING, INITIALIZED
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

  if (!skill) return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-primary-100 rounded-2xl mb-4 shadow-inner">
          <Network size={40} className="text-primary-600" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3">
          <span>ONEST Framework</span> • <span>Beckn BAP</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Beckn & ONEST Network Verification</h2>
        <p className="text-gray-500 mt-2 text-lg max-w-2xl mx-auto">Verify your <span className="font-bold text-gray-800">{skill.name}</span> skill across decentralized registries and assessment providers in the ONEST framework.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Credential Data Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-bl-full -z-10"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Database size={20} className="text-primary-500"/> Submitted Evidence</h3>
          
          {credential ? (
            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Certificate Name</p>
                <p className="font-semibold text-gray-900">{credential.certificateName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Credential ID</p>
                <p className="font-mono text-gray-900 font-bold">{credential.credentialId}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Issuer</p>
                <p className="font-semibold text-gray-900">{credential.issuer}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Evidence File</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1"><FileText size={16} className="text-primary-500"/> {credential.evidenceFileUrl || 'Attached'}</p>
                </div>
                <span className="bg-success-100 text-success-700 p-1.5 rounded-full"><CheckCircle size={18}/></span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No credential attached.</p>
              <button 
                onClick={() => navigate(`/candidate/credential/add/${skillId}`)}
                className="mt-4 text-primary-600 font-bold hover:underline"
              >
                Upload Credential
              </button>
            </div>
          )}
        </div>

        {/* Verification Action Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 text-white relative flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Lock size={24} className="text-primary-400"/> Security & Consent</h3>
            
            <div className="bg-white/10 p-5 rounded-xl border border-white/20 mb-8 backdrop-blur-sm">
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative flex items-center justify-center mt-1">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    disabled={isVerifying}
                  />
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${consent ? 'bg-primary-500 border-primary-500' : 'border-gray-400'}`}>
                    {consent && <CheckCircle size={16} className="text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-300 leading-relaxed">
                  I authorize this platform to query the Beckn ONEST network, education registries, and assessment providers using my credential data to cryptographically verify my <strong className="text-white">"{skill.name}"</strong> skill.
                </span>
              </label>
            </div>

            {isVerifying && (
              <div className="mb-8 animate-fade-in">
                <div className="flex justify-between text-sm font-bold mb-2 text-primary-300 uppercase tracking-wider">
                  <span>Network Query Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
                  <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out relative" style={{ width: `${progress}%` }}>
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse-slow"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-400 font-mono">
                  <p className={`transition-colors ${progress >= 20 ? 'text-success-400' : ''}`}>&gt; Querying ONEST registry...</p>
                  {progress >= 40 && <p className={`animate-fade-in transition-colors ${progress >= 60 ? 'text-success-400' : ''}`}>&gt; Validating issuer signature...</p>}
                  {progress >= 60 && <p className={`animate-fade-in transition-colors ${progress >= 80 ? 'text-success-400' : ''}`}>&gt; Correlating assessment scores...</p>}
                  {progress >= 80 && <p className="animate-fade-in text-white font-bold">&gt; Computing confidence index...</p>}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleVerify}
            disabled={!consent || !credential || isVerifying}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
              !consent || !credential
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
              : isVerifying
                ? 'bg-primary-800 text-primary-200 cursor-wait'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white active:scale-[0.98] border border-primary-400/50'
            }`}
          >
            {isVerifying ? (
              <><div className="w-5 h-5 border-2 border-primary-300 border-t-white rounded-full animate-spin"></div> Processing Request</>
            ) : (
              <><ShieldCheck size={22} /> Initiate Verification</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
