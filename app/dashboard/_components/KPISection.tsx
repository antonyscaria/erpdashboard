import React from 'react';
import { DashboardMetrics } from '../../../types/dashboard';
export default function KPISection({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Revenue Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Revenue / Income</div>
        <div className="text-2xl font-black text-[#0F172A] mt-1.5 tracking-tight">AED {Number(metrics.revenue).toLocaleString()}</div>
        <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5 text-[11px] text-[#64748B]">
          <div className="flex justify-between items-center">
            <span>Project Contract value</span>
            <span className="font-bold text-[#0F172A]">+AED {Number(metrics.projectValue).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Scrap / Miscellaneous Sold</span>
            <span className="font-medium">Out of Scope</span>
          </div>
        </div>
        <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      </div>

      {/* Expenses Cost Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Expenses / Cost</div>
        <div className="text-2xl font-black text-[#EF4444] mt-1.5 tracking-tight">-AED {Number(metrics.totalExpenses).toLocaleString()}</div>
        <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5 text-[11px] text-[#64748B]">
          <div className="flex justify-between items-center">
            <span>Actual Material Request Cost</span>
            <span className="font-bold text-[#EF4444]">-AED {Number(metrics.actualCost).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Committed Pending Overhead</span>
            <span className="font-bold text-[#F59E0B]">-AED {Number(metrics.committedCost).toLocaleString()}</span>
          </div>
        </div>
        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" />
      </div>

      {/* Running P&L Metrics Box */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-white to-slate-50/50">
        <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Running PnL</div>
        <div className="text-2xl font-black text-[#10B981] mt-1.5 tracking-tight">AED {Number(metrics.runningPnL).toLocaleString()}</div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="py-1.5 bg-[#F1F5F9] text-[#475569] text-[10px] font-black rounded-lg hover:bg-slate-200 uppercase tracking-wider transition-colors disabled:opacity-50" disabled>
            ADD REVENUE
          </button>
          <button className="py-1.5 bg-[#F1F5F9] text-[#475569] text-[10px] font-black rounded-lg hover:bg-slate-200 uppercase tracking-wider transition-colors disabled:opacity-50" disabled>
            ADD EXPENSE
          </button>
        </div>
      </div>

      {/* Cost Assessment Index Box */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0]">
        <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Cost Optimization Analysis</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <div className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">Profit Margins</div>
            <div className="text-lg font-black text-slate-800 tracking-tight">{metrics.profitMargin}</div>
          </div>
          <div>
            <div className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">Aggregate Expenses</div>
            <div className="text-lg font-black text-slate-800 tracking-tight">AED {Number(metrics.totalExpenses).toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-dashed border-[#E2E8F0] flex justify-between items-center text-[10px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Committed Target Threshold</span>
          <span className="font-extrabold text-slate-700">AED {Number(metrics.committedCost).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}