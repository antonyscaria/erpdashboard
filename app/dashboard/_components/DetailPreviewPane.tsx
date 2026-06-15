import React from 'react';
import { MaterialRequest } from '../../../types/dashboard';

export default function DetailPreviewPane({ activeMr }: { activeMr: MaterialRequest | undefined }) {
  if (!activeMr) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 font-medium">
        No active item contextual parameters focused.
      </div>
    );
  }

  const isCompleted = activeMr.stage === 'Completed';

  return (
    <div className="w-full">
      {/* Container Header Profile Tab */}
      <div className="px-5 py-4 border-b border-[#F1F5F9] bg-slate-50/50 flex justify-between items-center">
        <h2 className="text-[10px] font-black text-[#1E293B] tracking-wider uppercase">
          Material Line Contextual Ledger View
        </h2>
        <span className="px-2 py-0.5 font-mono text-[9px] bg-slate-200/60 rounded text-slate-500 font-bold">
          {activeMr.mr_number}
        </span>
      </div>

      {/* Target Properties Header Information Segment */}
      <div className="p-5 border-b border-[#F1F5F9]">
        <div className="text-[9px] uppercase font-bold text-[#94A3B8] tracking-widest">Procurement Objective Purpose</div>
        <div className="text-base font-black text-slate-800 mt-1 tracking-tight">{activeMr.purpose}</div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Associated Supplier</div>
            <div className="text-xs font-extrabold text-slate-700 mt-0.5 truncate">{activeMr.supplier_name}</div>
          </div>
          <div className={`p-3 rounded-xl border transition-colors ${
            isCompleted ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' : 'bg-blue-50/40 border-blue-100 text-blue-800'
          }`}>
            <div className="text-[8px] font-bold uppercase tracking-wider opacity-60">Workflow Pipeline Stage</div>
            <div className="text-xs font-black mt-0.5">{activeMr.stage}</div>
          </div>
        </div>
      </div>

      {/* Baseline Pricing Index Analysis Metrics Block */}
      <div className="p-5 bg-slate-50/40 border-b border-[#F1F5F9] space-y-3">
        <div className="text-[9px] uppercase font-bold text-[#94A3B8] tracking-widest">Price Validation Analysis</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
            <div className="text-[8px] text-slate-400 font-bold uppercase">Lowest Quotation</div>
            <div className="text-xs font-black text-slate-300 mt-0.5">N/A</div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
            <div className="text-[8px] text-slate-400 font-bold uppercase">Average System Rate</div>
            <div className="text-xs font-black text-slate-300 mt-0.5">N/A</div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
            <div className="text-[8px] text-slate-400 font-bold uppercase">Historical Delta</div>
            <div className="text-xs font-black text-slate-300 mt-0.5">N/A</div>
          </div>
        </div>
      </div>

      {/* Core Ledger Cost Matrix Segment Display */}
      <div className="p-5 bg-gradient-to-b from-white to-slate-50/40 space-y-3 text-xs">
        <div className="flex justify-between items-center text-slate-500">
          <span className="font-medium">Raw Material Requests Subtotal</span>
          <span className="font-mono font-bold text-slate-800">
            AED {Number(activeMr.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500">
          <span className="font-medium">Standard Framework Levy (5% UAE VAT)</span>
          <span className="font-mono font-bold text-slate-800">
            AED {Number(activeMr.vat).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-center text-sm">
          <div>
            <span className="block font-black text-slate-900 tracking-tight">Total Final Cost</span>
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">VAT-Inclusive Aggregation</span>
          </div>
          <span className="text-lg font-black text-[#2563EB] font-mono tracking-tight">
            AED {Number(activeMr.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}