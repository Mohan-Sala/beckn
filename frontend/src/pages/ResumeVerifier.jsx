import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateService } from '../services/api';
import { 
  UploadCloud, FileText, CheckCircle, XCircle, AlertTriangle, 
  ExternalLink, ShieldCheck, Sparkles, Filter, RefreshCw, 
  ShieldAlert, Check, QrCode, Scan, Link2, ArrowLeft
} from 'lucide-react';

export default function ResumeVerifier({ user }) {
  const [activeTab, setActiveTab] = useState('cert-qr'); // 'cert-qr' | 'resume-upload'
  
  // Certificate QR Scanner state
  const [certFile, setCertFile] = useState(null);
  const [isScanningCert, setIsScanningCert] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [certError, setCertError] = useState(null);
  const [isDraggingCert, setIsDraggingCert] = useState(false);
  const certInputRef = useRef(null);

  // Resume Scanner state
  const [resumeFile, setResumeFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [resumeResults, setResumeResults] = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const resumeInputRef = useRef(null);

  // Common Sync State
  const [syncingBadgeId, setSyncingBadgeId] = useState(null);
  const [syncedBadges, setSyncedBadges] = useState({});
  const navigate = useNavigate();

  // QR Certificate File Handler
  const handleCertFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCertFile(e.target.files[0]);
      setCertError(null);
      setQrResult(null);
    }
  };

  const handleScanCertificate = async () => {
    if (!certFile) {
      setCertError('Please select a certificate PDF or image file first.');
      return;
    }
    setIsScanningCert(true);
    setCertError(null);
    setQrResult(null);

    const formData = new FormData();
    formData.append('file', certFile);

    try {
      const res = await candidateService.verifyCertificateQr(formData);
      setQrResult(res.data);
    } catch (err) {
      console.error(err);
      setCertError(err.response?.data?.error || 'Failed to scan and verify certificate QR code.');
    } finally {
      setIsScanningCert(false);
    }
  };

  const handleTestQrPayload = async (payload) => {
    setIsScanningCert(true);
    setCertError(null);
    setQrResult(null);

    try {
      const res = await candidateService.verifyQrPayload(payload);
      setQrResult(res.data);
    } catch (err) {
      console.error(err);
      setCertError(err.response?.data?.error || 'Failed to verify QR payload.');
    } finally {
      setIsScanningCert(false);
    }
  };

  // Resume File Handler
  const handleResumeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setResumeError(null);
    }
  };

  const handleVerifyResumeFile = async () => {
    if (!resumeFile) {
      setResumeError('Please select a resume document (PDF) first.');
      return;
    }
    setIsProcessingResume(true);
    setResumeError(null);
    setResumeResults(null);

    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      const res = await candidateService.verifyResumeFile(formData);
      setResumeResults(res.data);
    } catch (err) {
      console.error(err);
      setResumeError(err.response?.data?.error || 'Failed to parse and verify the resume.');
    } finally {
      setIsProcessingResume(false);
    }
  };

  const handleSyncToProfile = async (title, credentialId, issuer, urlKey) => {
    if (!user || user.role !== 'CANDIDATE') {
      alert('Please log in as a candidate to sync certificates to your profile.');
      return;
    }

    const key = urlKey || credentialId;
    setSyncingBadgeId(key);
    try {
      const formData = new FormData();
      formData.append('skillId', '1');
      formData.append('certificateName', title || 'Verified Certificate');
      formData.append('credentialId', credentialId || key);
      formData.append('issuer', issuer || 'Accredited Authority');

      await candidateService.addCredential(user.id, formData);
      setSyncedBadges(prev => ({ ...prev, [key]: true }));
    } catch (err) {
      console.error(err);
      alert('Failed to sync certificate to profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSyncingBadgeId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Top back navigation */}
      {user && (
        <button 
          onClick={() => navigate(user.role === 'CANDIDATE' ? '/candidate/dashboard' : '/employer/dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none hidden md:block">
          <ShieldCheck size={260} />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[11px] font-extrabold tracking-wider uppercase text-blue-300 border border-white/15">
            <Sparkles size={13} /> ONEST Framework & Beckn Verification Pipeline
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Certificate & Resume Authenticity Engine
          </h1>
          
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Multi-layer verification across the ONEST network utilizing high-resolution optical QR code scanning, printed certificate ID extraction, and live decentralized registry handshakes.
          </p>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={() => setActiveTab('cert-qr')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs ${
                activeTab === 'cert-qr'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/50'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <QrCode size={16} />
              <span>Verify Certificate (QR Code & ID)</span>
            </button>

            <button
              onClick={() => setActiveTab('resume-upload')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs ${
                activeTab === 'resume-upload'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/50'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Link2 size={16} />
              <span>Resume Link Scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CERTIFICATE QR SCANNER */}
      {activeTab === 'cert-qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Upload Left Column */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Scan size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload Certificate File</h2>
                  <p className="text-xs text-slate-500">Supports PDF, PNG, JPG (Coursera, Credly, Udemy, Oracle)</p>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => certInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingCert(true); }}
                onDragLeave={() => setIsDraggingCert(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCert(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setCertFile(e.dataTransfer.files[0]);
                    setCertError(null);
                    setQrResult(null);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all my-5 cursor-pointer relative ${
                  isDraggingCert
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-300'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={certInputRef}
                  type="file"
                  id="cert-file-input"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleCertFileChange}
                  className="hidden"
                />
                
                <div className="w-14 h-14 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                  <QrCode size={26} />
                </div>

                <p className="font-bold text-slate-800 text-xs sm:text-sm mb-1 pointer-events-none">
                  {certFile ? certFile.name : 'Click to browse or drop certificate file here'}
                </p>
                <p className="text-xs text-slate-400 mb-3 pointer-events-none">
                  {certFile ? `${(certFile.size / 1024).toFixed(1)} KB` : 'Optical recognition extracts QR and printed ID layers'}
                </p>
                
                <span className="inline-block text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 pointer-events-none">
                  {certFile ? 'Change Certificate' : 'Browse File'}
                </span>
              </div>

              {certError && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl mb-4 border border-red-200 flex items-start gap-2">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{certError}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleScanCertificate}
              disabled={isScanningCert || !certFile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99]"
            >
              {isScanningCert ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Scanning & Rasterizing Document...</span>
                </>
              ) : (
                <>
                  <Scan size={16} />
                  <span>Scan & Verify Certificate Document</span>
                </>
              )}
            </button>

            {/* Direct Certificate ID / QR Link Fallback */}
            <div className="pt-5 border-t border-slate-100">
              <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
                Manual Verification via Certificate ID or URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 798b8316-2680-4d47-9e95-90bd2c424455 or https://..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleTestQrPayload(e.target.value.trim());
                    }
                  }}
                  id="direct-cert-id-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('direct-cert-id-input');
                    if (el && el.value.trim()) {
                      handleTestQrPayload(el.value.trim());
                    }
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Verify ID
                </button>
              </div>
            </div>
          </div>

          {/* QR Verification Results Panel */}
          <div className="lg:col-span-6">
            {qrResult ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 animate-fade-in space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" size={20} />
                    Authenticity Verdict
                  </h3>
                  
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                    (qrResult.isValid ?? qrResult.valid)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : qrResult.status === 'NO QR FOUND'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {qrResult.status}
                  </span>
                </div>

                {/* Verdict Detail Card */}
                <div className={`p-5 rounded-2xl border ${
                  (qrResult.isValid ?? qrResult.valid)
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : qrResult.status === 'NO QR FOUND'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-red-50/70 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {(qrResult.isValid ?? qrResult.valid) ? (
                      <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={22} />
                    ) : (
                      <XCircle className="text-red-600 shrink-0 mt-0.5" size={22} />
                    )}
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {qrResult.certificateTitle || qrResult.issuer || 'Verification Result'}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                        {qrResult.verificationDetails}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Payload Details */}
                {qrResult.qrPayload && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Decoded QR Payload Content
                    </label>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-xs text-slate-800 break-all flex items-center justify-between gap-2">
                      <span>{qrResult.qrPayload}</span>
                      {qrResult.qrPayload.startsWith('http') && (
                        <a
                          href={qrResult.qrPayload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 shrink-0"
                          title="Open URL"
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Detected Printed Certificate ID */}
                {qrResult.extractedCertId && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Printed Certificate ID / Serial
                    </label>
                    <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl font-mono text-xs text-indigo-900 font-bold">
                      {qrResult.extractedCertId}
                    </div>
                  </div>
                )}

                {/* Sync to Profile Action */}
                {(qrResult.isValid ?? qrResult.valid) && (
                  <button
                    onClick={() => handleSyncToProfile(qrResult.certificateTitle, qrResult.credentialId, qrResult.issuer, qrResult.qrPayload)}
                    disabled={syncingBadgeId === (qrResult.qrPayload || qrResult.credentialId) || syncedBadges[qrResult.qrPayload || qrResult.credentialId]}
                    className={`w-full font-bold py-3 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      syncedBadges[qrResult.qrPayload || qrResult.credentialId]
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95'
                    }`}
                  >
                    {syncedBadges[qrResult.qrPayload || qrResult.credentialId] ? (
                      <>
                        <Check size={16} /> Synchronized to Unified Profile
                      </>
                    ) : syncingBadgeId === (qrResult.qrPayload || qrResult.credentialId) ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} /> Sync Verified Credential to Profile
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <QrCode size={44} className="text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No Scan Results Yet</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Upload a certificate on the left to extract QR codes and verify against authoritative ONEST registries.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RESUME LINK SCANNER */}
      {activeTab === 'resume-upload' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileText size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Resume Document</h2>
                <p className="text-xs text-slate-500">Extracts certificate URLs while filtering out LinkedIn, GitHub, and portfolios</p>
              </div>
            </div>

            <div
              onClick={() => resumeInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingResume(true); }}
              onDragLeave={() => setIsDraggingResume(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingResume(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setResumeFile(e.dataTransfer.files[0]);
                  setResumeError(null);
                  setResumeResults(null);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
                isDraggingResume
                  ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-300'
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={resumeInputRef}
                type="file"
                id="resume-file-input"
                accept=".pdf,.txt"
                onChange={handleResumeFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                <UploadCloud size={28} />
              </div>
              <p className="font-bold text-slate-800 text-xs sm:text-sm mb-1 pointer-events-none">
                {resumeFile ? resumeFile.name : 'Click to browse or drop your Resume PDF'}
              </p>
              <p className="text-xs text-slate-400 mb-3 pointer-events-none">
                {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB` : 'Supports PDF documents with embedded links'}
              </p>
              <span className="inline-block text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 pointer-events-none">
                {resumeFile ? 'Change File' : 'Browse File'}
              </span>
            </div>

            {resumeError && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>{resumeError}</span>
              </div>
            )}

            <button
              onClick={handleVerifyResumeFile}
              disabled={isProcessingResume || !resumeFile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isProcessingResume ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Extracting & Verifying Links...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Extract & Verify Resume Links</span>
                </>
              )}
            </button>
          </div>

          {/* Resume Extraction Results */}
          {resumeResults && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Links Found</p>
                  <p className="text-3xl font-black text-slate-900">{resumeResults.totalLinksFound}</p>
                </div>
                <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs">
                  <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold mb-1">Verified Badges</p>
                  <p className="text-3xl font-black text-emerald-600">{resumeResults.validCertificatesCount}</p>
                </div>
                <div className="bg-red-50/70 p-5 rounded-2xl border border-red-200 shadow-xs">
                  <p className="text-[11px] uppercase tracking-wider text-red-700 font-bold mb-1">Invalid / Revoked</p>
                  <p className="text-3xl font-black text-red-600">{resumeResults.invalidCertificatesCount}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">Filtered Out</p>
                  <p className="text-3xl font-black text-slate-700">{resumeResults.ignoredLinks?.length || 0}</p>
                </div>
              </div>

              {/* Extracted Certificate Cards */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" size={20} />
                    Extracted Resume Credentials ({resumeResults.extractedCertificates?.length || 0})
                  </h2>
                </div>

                {resumeResults.extractedCertificates?.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 space-y-2">
                    <AlertTriangle size={32} className="mx-auto text-amber-500" />
                    <p className="font-semibold text-sm text-slate-700">No credential URLs identified in this document.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {resumeResults.extractedCertificates.map((cert, index) => {
                      const certValid = cert.isValid ?? cert.valid;
                      return (
                        <div key={index} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                              {certValid ? (
                                <CheckCircle className="text-emerald-600" size={20} />
                              ) : (
                                <XCircle className="text-red-600" size={20} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm sm:text-base">
                                  {cert.title || cert.issuer + ' Credential'}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  certValid
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {cert.status}
                                </span>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-semibold">
                                  {cert.issuer}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mb-1">{cert.verificationDetails}</p>
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-mono break-all hover:underline"
                              >
                                {cert.url}
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {certValid ? (
                              <button
                                onClick={() => handleSyncToProfile(cert.title, cert.badgeId, cert.issuer, cert.url)}
                                disabled={syncingBadgeId === cert.url || syncedBadges[cert.url]}
                                className={`font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
                                  syncedBadges[cert.url]
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                }`}
                              >
                                {syncedBadges[cert.url] ? (
                                  <>
                                    <Check size={13} /> Synced to Profile
                                  </>
                                ) : syncingBadgeId === cert.url ? (
                                  <>
                                    <RefreshCw size={13} className="animate-spin" /> Syncing...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={13} /> Sync to Profile
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-red-600 px-3 py-1 bg-red-50 rounded-lg border border-red-200">
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filtered Out Links */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter size={14} /> Filtered Non-Credential URLs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeResults.ignoredLinks?.map((item, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-mono">
                      {item}
                    </span>
                  ))}
                  {resumeResults.ignoredLinks?.length === 0 && (
                    <span className="text-xs text-slate-400">No external non-credential links found.</span>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
