import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService } from '../services/api';
import { 
  ShieldCheck, ArrowLeft, CheckCircle, BrainCircuit, Activity, 
  Sparkles, Award, Share2, Layers, CheckCircle2, Lock, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VerificationResult({ user }) {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await candidateService.getProfile(user.id);
        const targetSkill = res.data.skills.find(s => s.skillId == skillId);
        setSkill(targetSkill);
        
        if (targetSkill && targetSkill.verificationStatus === 'VERIFIED') {
          // Trigger confetti celebration on load
          const duration = 2500;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 4,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#2563eb', '#10b981', '#ffffff']
            });
            confetti({
              particleCount: 4,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#2563eb', '#10b981', '#ffffff']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.id, skillId]);

  if (!skill) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading verification certificate...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/candidate/dashboard')}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Main Certificate Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden relative">
        
        {/* Dynamic Header */}
        <div className={`p-8 sm:p-12 text-center text-white relative overflow-hidden ${
          skill.verificationStatus === 'VERIFIED'
            ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900'
            : skill.verificationStatus === 'PARTIALLY VERIFIED'
            ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900'
            : 'bg-gradient-to-br from-red-600 via-rose-700 to-slate-900'
        }`}>
          
          {/* Subtle geometric circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 animate-fade-in max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 mb-4 shadow-xl shadow-black/10">
              {skill.verificationStatus === 'VERIFIED' ? (
                <ShieldCheck size={42} className="text-white" />
              ) : (
                <AlertTriangle size={42} className="text-white" />
              )}
            </div>

            <div className="block mb-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/20 text-white border border-white/30 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles size={13} /> ONEST Framework • Beckn Protocol
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">
              {skill.verificationStatus === 'VERIFIED' 
                ? 'Skill Authenticated!' 
                : skill.verificationStatus === 'PARTIALLY VERIFIED'
                ? 'Partially Verified'
                : 'Verification Incomplete'}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
              {skill.verificationStatus === 'VERIFIED'
                ? 'Cryptographically verified across decentralized authority nodes and published to your unified candidate record.'
                : 'The credential details could not be validated against the authoritative network registry. Please ensure a valid certificate or QR code is attached.'}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 text-center bg-slate-50/50 space-y-8">
          
          <div>
            <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              {skill.category}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {skill.name}
            </h3>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto">
            
            {/* Confidence Score Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                <Activity size={24} />
              </div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Confidence Score
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-slate-900">{skill.confidenceScore}</span>
                <span className="text-lg font-bold text-blue-600">%</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Capped &lt; 100% per Beckn standard</p>
            </div>
            
            {/* Competency Level Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 border border-purple-100">
                <BrainCircuit size={24} />
              </div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Assigned Competency
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 capitalize">
                {skill.competencyLevel || 'Advanced'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Verified by registry handshake</p>
            </div>

          </div>

          {/* Verification Protocol Ledger Details */}
          <div className="max-w-xl mx-auto bg-white p-5 rounded-2xl border border-slate-200/80 text-left space-y-2.5 text-xs text-slate-600">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Lock size={13} className="text-emerald-600" />
              Cryptographic Audit Proof
            </p>
            <div className="grid grid-cols-[130px_1fr] gap-1 text-[11px] text-slate-500 font-mono">
              <span>Standard:</span>
              <span className="text-slate-800 font-semibold">W3C Verifiable Credential v1.0</span>
              <span>Signature:</span>
              <span className="text-slate-800 font-semibold">RFC 8032 Ed25519</span>
              <span>Exchange:</span>
              <span className="text-emerald-700 font-semibold">ONEST Work Opportunities</span>
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => navigate('/candidate/dashboard')}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              Return to Profile Dashboard
            </button>
            <button 
              onClick={() => navigate('/verify-resume')}
              className="w-full sm:w-auto bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-blue-200 transition-colors"
            >
              Verify More Credentials
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
