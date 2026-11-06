import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService } from '../services/api';
import { 
  UploadCloud, FileText, Building, Key, ArrowLeft, Check, 
  ShieldCheck, X
} from 'lucide-react';

export default function AddCredential({ user }) {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    certificateName: '',
    credentialId: '',
    issuer: ''
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('skillId', skillId);
    data.append('certificateName', formData.certificateName);
    data.append('credentialId', formData.credentialId);
    data.append('issuer', formData.issuer);
    if (file) {
      data.append('file', file);
    }

    try {
      await candidateService.addCredential(user.id, data);
      navigate('/candidate/dashboard');
    } catch (err) {
      alert('Failed to save credential. Please ensure all required fields are filled.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/candidate/dashboard')}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/90">
        
        {/* Card Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
            <ShieldCheck size={12} /> ONEST Credential Verification Standard
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Upload Verified Credential
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
            Attach your certificate PDF or image. The backend optical engine will decode embedded QR codes and match official issuer records.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-5">
            
            {/* Certificate Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Certificate Title / Program Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FileText size={18} />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm text-slate-800 outline-none transition-all placeholder-slate-400" 
                  value={formData.certificateName}
                  onChange={e => setFormData({...formData, certificateName: e.target.value})}
                  placeholder="e.g. AWS Certified Solutions Architect, Google Cloud Associate"
                  required 
                />
              </div>
            </div>

            {/* Credential ID and Issuer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Credential ID / Serial Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm text-slate-800 font-mono outline-none transition-all placeholder-slate-400" 
                    value={formData.credentialId}
                    onChange={e => setFormData({...formData, credentialId: e.target.value})}
                    placeholder="e.g. AWS-SAA-10827"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Authoritative Issuer Organization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building size={18} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm text-slate-800 outline-none transition-all placeholder-slate-400" 
                    value={formData.issuer}
                    onChange={e => setFormData({...formData, issuer: e.target.value})}
                    placeholder="e.g. Amazon Web Services, Oracle"
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Evidence Document File Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Evidence Document (PDF or Certificate Image)
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer relative ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-300'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".pdf,image/png,image/jpeg,image/jpg" 
                  onChange={e => setFile(e.target.files[0])} 
                  className="hidden" 
                />

                <div className="w-14 h-14 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                  <UploadCloud size={28} />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                      <Check size={16} /> {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • Ready for optical inspection
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-2 text-xs text-red-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <X size={13} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-700">
                      Click to browse or drag and drop your certificate here
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports PDF, PNG, JPG (up to 10MB) • Optical QR scanning supported
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/candidate/dashboard')} 
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving & Registering...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Save Credential</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
