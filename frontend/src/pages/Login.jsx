import React, { useState } from 'react';
import { authService } from '../services/api';
import { ShieldCheck, Mail, Lock, ArrowRight, User, Briefcase, GraduationCap } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CANDIDATE'); // Default role
  
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
      }, 500);
    } catch (err) {
      setError(isSignup ? 'Registration failed. Email might already exist.' : 'Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    // Clear fields
    if (!isSignup) {
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
    <div className="min-h-screen flex items-center justify-center bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-slate-200 relative overflow-hidden py-10">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md z-10 animate-slide-up mx-4">
        <div className="glass rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/60">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-2xl shadow-lg mb-3 text-white transform hover:scale-105 transition-transform">
              <ShieldCheck size={40} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-3">
              <span>ONEST Framework</span> • <span>Beckn Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center">
              {isSignup ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 mt-2 text-center text-xs sm:text-sm leading-relaxed">
              {isSignup 
                ? 'Join the Beckn-based skill verification network with ONEST framework.' 
                : 'Decentralized skill and credential verification powered by Beckn & ONEST.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3 mb-6 rounded-lg text-sm font-medium animate-fade-in text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignup && (
              <div className="relative animate-fade-in">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all outline-none text-gray-800" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="Full Name"
                  required 
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input 
                type="email" 
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all outline-none text-gray-800" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password" 
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all outline-none text-gray-800" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required 
              />
            </div>

            {isSignup && (
              <div className="pt-2 pb-2 animate-fade-in">
                <p className="text-sm font-bold text-gray-700 mb-3">I am signing up as a:</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${role === 'CANDIDATE' ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="CANDIDATE" 
                      className="sr-only"
                      checked={role === 'CANDIDATE'}
                      onChange={() => setRole('CANDIDATE')}
                    />
                    <GraduationCap size={24} className={role === 'CANDIDATE' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="font-semibold text-sm">Candidate</span>
                  </label>
                  
                  <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${role === 'EMPLOYER' ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="EMPLOYER" 
                      className="sr-only"
                      checked={role === 'EMPLOYER'}
                      onChange={() => setRole('EMPLOYER')}
                    />
                    <Briefcase size={24} className={role === 'EMPLOYER' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="font-semibold text-sm">Employer</span>
                  </label>
                </div>
              </div>
            )}
            
            {isSignup && role === 'CANDIDATE' && (
              <div className="space-y-4 animate-fade-in mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700">Candidate Profile Details:</p>
                <input type="text" className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-gray-800" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" required />
                <input type="text" className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-gray-800" value={education} onChange={e => setEducation(e.target.value)} placeholder="Degree (e.g. B.Tech Computer Science)" required />
                <input type="text" className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-gray-800" value={college} onChange={e => setCollege(e.target.value)} placeholder="College / University" required />
                <input type="number" className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-gray-800" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} placeholder="Graduation Year (e.g. 2025)" required />
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{isSignup ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignup ? (
              <p>Already have an account? <button type="button" onClick={toggleMode} className="font-bold text-primary-600 hover:underline">Log in</button></p>
            ) : (
              <p>Don't have an account? <button type="button" onClick={toggleMode} className="font-bold text-primary-600 hover:underline">Sign up</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
