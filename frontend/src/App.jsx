import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

const Login = lazy(() => import('./pages/Login'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'));
const AddCredential = lazy(() => import('./pages/AddCredential'));
const VerificationProcess = lazy(() => import('./pages/VerificationProcess'));
const VerificationResult = lazy(() => import('./pages/VerificationResult'));
const EmployerProfileView = lazy(() => import('./pages/EmployerProfileView'));
const BadgeVerify = lazy(() => import('./pages/BadgeVerify'));
const ResumeVerifier = lazy(() => import('./pages/ResumeVerifier'));

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <div className="min-h-screen bg-slate-50/70 text-slate-900 selection:bg-blue-500 selection:text-white">
        <Suspense fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loading BecknVerify...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={user.role === 'CANDIDATE' ? '/candidate/dashboard' : '/employer/dashboard'} />} />
            <Route path="/verify-badge" element={<BadgeVerify user={user} />} />
            <Route path="/verify-badge/:skillId" element={<BadgeVerify user={user} />} />
            <Route path="/verify-resume" element={<ResumeVerifier user={user} />} />
            
            {/* Candidate Routes */}
            {user?.role === 'CANDIDATE' && (
              <>
                <Route path="/candidate/dashboard" element={<CandidateDashboard user={user} />} />
                <Route path="/candidate/verify-resume" element={<ResumeVerifier user={user} />} />
                <Route path="/candidate/credential/add/:skillId" element={<AddCredential user={user} />} />
                <Route path="/candidate/verification/:skillId" element={<VerificationProcess user={user} />} />
                <Route path="/candidate/result/:skillId" element={<VerificationResult user={user} />} />
              </>
            )}

            {/* Employer Routes */}
            {user?.role === 'EMPLOYER' && (
              <>
                <Route path="/employer/dashboard" element={<EmployerDashboard user={user} />} />
                <Route path="/employer/candidate/:candidateId" element={<EmployerProfileView user={user} />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
