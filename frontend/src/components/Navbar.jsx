import React, { useState } from 'react';
import { LogOut, ShieldCheck, FileText, BadgeCheck, Menu, X, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo & ONEST Pill */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Beckn<span className="text-blue-600 font-semibold">Verify</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  ONEST v1.1
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight -mt-1 hidden sm:block">
                Decentralized Skill & Credential Network
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => navigate('/verify-resume')} 
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/verify-resume') || isCurrent('/candidate/verify-resume')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <FileText size={16} />
              <span>Resume Verifier</span>
            </button>

            <button 
              onClick={() => navigate('/verify-badge')} 
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/verify-badge')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <BadgeCheck size={16} />
              <span>Verify Badge</span>
            </button>
          </div>

          {/* User Profile & Actions */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">{user.name}</span>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                  user.role === 'EMPLOYER' ? 'text-purple-600' : 'text-blue-600'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50/80 border border-transparent hover:border-red-100 transition-all"
              title="Sign out of session"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200/80 py-4 px-2 space-y-2 animate-slide-up bg-white/95 backdrop-blur-md rounded-b-2xl shadow-xl">
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl mb-3 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">{user.role}</p>
              </div>
            </div>

            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/verify-resume'); }} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <FileText size={18} className="text-blue-500" />
              <span>Resume Verifier</span>
            </button>

            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/verify-badge'); }} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <BadgeCheck size={18} className="text-indigo-500" />
              <span>Verify Badge</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
