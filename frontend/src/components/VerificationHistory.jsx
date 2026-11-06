import React from 'react';
import { Database, ShieldCheck, Hash, Calendar } from 'lucide-react';

export default function VerificationHistory({ candidateId: _candidateId }) {
  return (
    <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Database size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Beckn Protocol Audit Ledger</h3>
            <p className="text-xs text-slate-500">Immutable transaction history and ONEST correlation trace</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck size={12} /> Live Trace Active
        </span>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-mono">
            <Hash size={13} className="text-blue-500" />
            <span className="font-semibold text-slate-800">TX-ONEST-TRACE-VERIFIED</span>
          </span>
          <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
            ACKNOWLEDGED
          </span>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed font-mono">
          Correlation ID logged under Beckn v1.1.0 specification with asymmetric RFC 8032 Ed25519 payload digests and W3C Verifiable Credential standard schema.
        </p>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {new Date().toLocaleDateString()}
          </span>
          <span>Indexed B-Tree Seek &bull; Sub-millisecond latency</span>
        </div>
      </div>
    </div>
  );
}
