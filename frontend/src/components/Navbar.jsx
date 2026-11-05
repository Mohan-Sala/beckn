import React from 'react';
import { LogOut, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => navigate('/')}
      >
        <div className="bg-primary-600 p-2 rounded-lg text-white group-hover:bg-primary-700 transition-colors shadow-md">
          <ShieldCheck size={24} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors">
            Beckn<span className="text-primary-600 font-light">Verify</span>
          </span>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            ONEST Framework
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col text-right hidden sm:block">
          <span className="text-sm font-semibold text-gray-900">{user.name}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{user.role}</span>
        </div>
        
        <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
        
        <button 
          onClick={() => navigate('/verify-resume')} 
          className="flex items-center gap-2 text-primary-700 bg-primary-50 hover:bg-primary-100 font-semibold transition-colors px-3 py-2 rounded-lg border border-primary-200 shadow-sm"
        >
          <FileText size={18} /> <span className="hidden sm:inline">Resume Verifier</span>
        </button>

        <button 
          onClick={() => navigate('/verify-badge')} 
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-primary-50"
        >
          <ShieldCheck size={18} /> <span className="hidden sm:inline">Verify Badge</span>
        </button>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-md hover:bg-red-50"
        >
          <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
