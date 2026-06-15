'use client';
import React from 'react';
import { MaterialRequest } from '../../../types/dashboard';
import { useRouter, useSearchParams } from 'next/navigation';


export default function MaterialRequestsTable({ materialRequests }: { materialRequests: MaterialRequest[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMrNumber = searchParams.get('selectedMr') || materialRequests[0]?.mr_number;

  return (
    <div className="w-full">
      {/* 1. Internal Workspace Switch Tabs */}
      <div className="flex border-b border-[#F1F5F9] text-xs font-bold text-[#64748B] bg-slate-50/50">
        <button className="px-5 py-3.5 text-[#2563EB] border-b-2 border-[#2563EB] bg-white font-extrabold">
          Material Requests
        </button>
        <button className="px-5 py-3.5 hover:text-slate-800 transition-colors opacity-60 cursor-not-allowed" disabled>
          Expense Breakdown
        </button>
        <button className="px-5 py-3.5 hover:text-slate-800 transition-colors opacity-60 cursor-not-allowed" disabled>
          Materials BOQ
        </button>
      </div>

      {/* 2. Secondary Filter Metric Sub-bar */}
      <div className="p-4 border-b border-[#F1F5F9] flex justify-between items-center bg-white">
        <div>
          <h3 className="text-xs font-black text-[#1E293B]">Showing All Linked Procurement Line Item Requests</h3>
          <p className="text-[10px] text-[#94A3B8] font-semibold tracking-wide uppercase mt-0.5">UAE 5% VAT Standard Inclusive Framework</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-bold rounded-md text-slate-600 shadow-2xs hover:bg-slate-50">Filter</button>
          <button className="px-2.5 py-1 bg-white border border-slate-100 text-[10px] font-bold rounded-md text-slate-400 shadow-2xs" disabled>Reset</button>
        </div>
      </div>

      {/* 3. Main Operational Column Layout Headers */}
      <div className="grid grid-cols-12 bg-slate-50/70 border-b border-[#E2E8F0] px-5 py-3 text-[9px] font-bold text-[#475569] uppercase tracking-widest">
        <div className="col-span-1">Action</div>
        <div className="col-span-2">Dates</div>
        <div className="col-span-3">MR Number</div>
        <div className="col-span-3">Requester Profile</div>
        <div className="col-span-3 text-right">VAT-Inclusive Cost</div>
      </div>

      {/* 4. Interactive Row Mapping Loop Container */}
      <div className="divide-y divide-slate-100 text-xs">
        {materialRequests.map((mr) => {
          const isSelected = selectedMrNumber === mr.mr_number;
          const isPaid = mr.status === 'Paid';

          return (
            <div
              key={mr.id}
              onClick={() => router.push(`?selectedMr=${mr.mr_number}`, { scroll: false })}
              className={`grid grid-cols-12 px-5 py-4 items-center cursor-pointer transition-all duration-150 ${
                isSelected 
                  ? 'bg-blue-50/40 border-l-4 border-[#2563EB] font-medium' 
                  : 'hover:bg-slate-50/80 border-l-4 border-transparent'
              }`}
            >
              <div className="col-span-1 text-slate-400 text-sm hover:scale-115 transition-transform">👁️</div>
              <div className="col-span-2 text-[#64748B] font-mono tracking-tight">
                {new Date(mr.date).toLocaleDateString('en-GB')}
              </div>
              <div className="col-span-3 flex flex-col items-start gap-1">
                <span className="font-extrabold text-[#2563EB] tracking-tight hover:underline">
                  {mr.mr_number}
                </span>
                {/* Specific Warning Tags Injection Display */}
                {mr.tags.includes('Important') && (
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-extrabold rounded-md uppercase tracking-wider border border-red-100">
                    Important
                  </span>
                )}
              </div>
              <div className="col-span-3 text-[#334155] flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="truncate tracking-tight font-medium">{mr.requestor_name}</span>
              </div>
              <div className="col-span-3 text-right font-black text-[#0F172A] tracking-tight text-sm">
                AED {Number(mr.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}