import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService } from '../services/api';
import { ShieldCheck, ArrowLeft, Award, CheckCircle, BrainCircuit, Activity } from 'lucide-react';
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
          const duration = 3000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#3b82f6', '#10b981', '#ffffff']
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#3b82f6', '#10b981', '#ffffff']
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

  if (!skill) return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 animate-slide-up">
      <button 
        onClick={() => navigate('/candidate/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Dynamic Header */}
        <div className="bg-gradient-to-r from-success-500 to-emerald-700 p-12 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative z-10 animate-fade-in">
            <div className="inline-flex items-center justify-center p-6 bg-white/20 rounded-full backdrop-blur-md border-4 border-white/40 mb-4 shadow-xl">
              <ShieldCheck size={64} className="text-white" />
            </div>
            <div className="block mb-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-white/20 text-white border border-white/30 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                ONEST Framework • Beckn Verified
              </span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-2">Skill Verified!</h2>
            <p className="text-success-100 text-lg font-medium">Your skill has been successfully validated across the ONEST network.</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-12 text-center bg-gray-50/50">
          <div className="mb-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{skill.category}</span>
          </div>
          <h3 className="text-5xl font-black text-gray-900 mb-10 tracking-tight">{skill.name}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-primary-500 mb-3 flex justify-center"><Activity size={32} /></div>
              <p className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-1">Confidence Score</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold text-gray-900">{skill.confidenceScore}</span>
                <span className="text-xl font-bold text-gray-400">%</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-purple-500 mb-3 flex justify-center"><BrainCircuit size={32} /></div>
              <p className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-1">Competency Level</p>
              <span className="text-3xl font-extrabold text-gray-900 capitalize">{skill.competencyLevel}</span>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-success-500" />
              Cryptographically verified and added to your unified Beckn profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
