import React, { useState } from 'react';
import { authService } from '../services/api';
import { ShieldCheck, Mail, Lock, ArrowRight, User, Briefcase, GraduationCap, CheckCircle2, Sparkles, Building2, Phone, Calendar } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CANDIDATE');
  
  // Profile fields
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      let res;
      if (isSignup) {
        const profileData = role === 'CANDIDATE' ? { phone, education, college, graduationYear: parseInt(graduationYear) || 0 } : {};
        res = await authService.register(name, email, password, role, profileData);
      } else {
        res = await authService.login(email, password);
      }
      
      // Save JWT token
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      setTimeout(() => {
        onLogin(res.data.user);
      }, 400);
    } catch (err) {
      setError(isSignup ? 'Registration failed. Email might already exist.' : 'Invalid credentials. Please verify your email and password.');
      setIsLoading(false);
    }
  };

  const toggleMode = (mode) => {
    setIsSignup(mode);
    setError('');
    if (mode) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('CANDIDATE');
      setPhone('');
      setEducation('');
      setCollege('');
      setGraduationYear('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      
      {/* Background Ambience and Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl z-10 animate-slide-up">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold tracking-wide uppercase shadow-inner mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ONEST Protocol • Beckn Open Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Decentralized Skill Verification
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-md mx-auto">
            Cryptographically authenticated credentials and student talent verification powered by Beckn v1.1.0
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-10 text-white">
          
          {/* Sign In / Sign Up Mode Switcher Tabs */}
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/60 mb-6">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                !isSignup 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                isSignup 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 mb-6 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name for Signup */}
            {isSignup && (
              <div className="animate-fade-in">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm outline-none transition-all"
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Poornachandra Raju"
                    required 
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required 
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required 
                />
              </div>
            </div>

            {/* Role Selection during Signup */}
            {isSignup && (
              <div className="pt-2 animate-fade-in">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CANDIDATE')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      role === 'CANDIDATE'
                        ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <GraduationCap size={22} className={role === 'CANDIDATE' ? 'text-blue-400' : 'text-slate-400'} />
                      {role === 'CANDIDATE' && <CheckCircle2 size={16} className="text-blue-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Candidate</p>
                      <p className="text-[11px] text-slate-400">Student & Job Seeker</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('EMPLOYER')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      role === 'EMPLOYER'
                        ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Briefcase size={22} className={role === 'EMPLOYER' ? 'text-purple-400' : 'text-slate-400'} />
                      {role === 'EMPLOYER' && <CheckCircle2 size={16} className="text-purple-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Employer</p>
                      <p className="text-[11px] text-slate-400">Recruiter & Verifier</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Candidate Specific Profile Fields */}
            {isSignup && role === 'CANDIDATE' && (
              <div className="space-y-3 pt-3 border-t border-slate-700/60 animate-fade-in">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Candidate Profile Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input 
                        type="text" 
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        placeholder="Phone Number" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar size={16} />
                      </div>
                      <input 
                        type="number" 
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500" 
                        value={graduationYear} 
                        onChange={e => setGraduationYear(e.target.value)} 
                        placeholder="Graduation Year (e.g. 2025)" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap size={16} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500" 
                    value={education} 
                    onChange={e => setEducation(e.target.value)} 
                    placeholder="Degree (e.g. B.Tech Computer Science)" 
                    required 
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 size={16} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:border-blue-500" 
                    value={college} 
                    onChange={e => setCollege(e.target.value)} 
                    placeholder="College / University Name" 
                    required 
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isSignup ? 'Create Unified Profile' : 'Authenticate & Enter'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400">
              Demo access: <span className="font-mono text-slate-300">alex@example.com</span> / <span className="font-mono text-slate-300">password123</span> (Candidate)
            </p>
          </div>

        </div>

        {/* Footer Trust Markers */}
        <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> RFC 8032 Ed25519 Signed
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-blue-400" /> ONEST Open Protocol
          </span>
          <span>•</span>
          <span>DPDP & GDPR Compliant</span>
        </div>

      </div>
    </div>
  );
}
