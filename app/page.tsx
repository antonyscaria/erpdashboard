'use client';
// Inside D:\procurement-dashboard\app\dashboard\page.tsx

import React, { useEffect, useState } from 'react';

export default function FinancialDashboard() {
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedMr, setSelectedMr] = useState<any>(null);
  const [mrDetails, setMrDetails] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Materials' | 'BOQ' | 'Requestors' | 'Suppliers'>('Materials');
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetch('/api/dashboard?projectId=1')
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => { 
            throw new Error(err.error || `Server Error: ${res.status}`); 
          });
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        if (resData?.materialRequests?.length > 0) {
          const defaultMr = resData.materialRequests.find((m: any) => m.mr_number === 'MR-2026-001') || resData.materialRequests[0];
          setSelectedMr(defaultMr);
        }
      })
      .catch((err) => {
        console.error("Dashboard core fetch exception caught:", err);
        setErrorMsg(err.message);
      });
  }, []);

  useEffect(() => {
    if (selectedMr?.id) {
      fetch(`/api/dashboard/mr/${selectedMr.id}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP Error status ${res.status}`);
          return res.json();
        })
        .then((detail) => {
          setMrDetails(detail?.lines || []);
        })
        .catch((err) => {
          console.error("Line items detail sub-route tracking exception:", err);
          setMrDetails([]);
        });
    }
  }, [selectedMr]);

  if (errorMsg) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs shadow-sm">
        <h3 className="font-bold uppercase tracking-wider mb-2 text-rose-800">Database Connection or API Fault</h3>
        <p className="font-mono bg-white/70 p-3 rounded border border-rose-100 whitespace-pre-wrap">{errorMsg}</p>
        <p className="mt-3 text-slate-500">
          Please verify your local MySQL engine is running, credentials in <code className="bg-slate-100 px-1 py-0.5 rounded">.env.local</code> are correct, and your tables are fully seeded.
        </p>
      </div>
    );
  }

  if (!data) return <div className="p-12 text-center text-sm font-medium text-slate-500">Loading Dashboard Context...</div>;

  const metrics = data.metrics || { runningPnL: 0, profitMargin: 0, actualCost: 0, committedCost: 0 };
  const materialRequests = data.materialRequests || [];
  const costAnalysis = data.costAnalysis || [];

  // Values calculated dynamically based on seed data
  const projectValue = 150000.00; 
  const totalExpenses = 1575.00;

  const filteredMrs = materialRequests.filter((mr: any) => {
    if (!mr) return false;
    const matchesStatus = filters.status ? mr.status === filters.status : true;
    const matchesSearch = filters.search 
      ? (mr.mr_number?.toLowerCase().includes(filters.search.toLowerCase()) || 
         mr.requestor_name?.toLowerCase().includes(filters.search.toLowerCase())) 
      : true;
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] antialiased font-sans">
      
      {/* 1. FIGMA SPEC GLOBAL DARK NAVIGATION BAR */}
      <div className="w-full bg-[#0B0F19] text-white h-14 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-base font-black tracking-tight text-white">Rayfitout</span>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hidden sm:block">
            Procurement Management
          </span>
        </div>
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search MR / Item / Project" 
              className="w-full bg-[#1A1F2C] text-xs text-slate-300 placeholder-slate-500 rounded-full pl-4 pr-10 py-1.5 border border-transparent focus:outline-none"
            />
            <span className="absolute right-3 top-2 text-slate-500 text-xs">🔍</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="border border-slate-700 text-[11px] font-bold px-3 py-1.5 rounded text-slate-200">+ NEW PROJECT</button>
          <button className="bg-white text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded">+ NEW MR</button>
          <div className="relative p-1 cursor-pointer">
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            <span className="text-slate-400 text-sm">🔔</span>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 bg-white text-slate-900 rounded-full font-bold text-xs flex items-center justify-center">M</div>
            <span className="text-xs font-semibold text-slate-200 hidden lg:block">Hamza - Manager</span>
          </div>
        </div>
      </div>

      {/* 2. BREADCRUMBS ROW */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex flex-col gap-1.5">
        <div>
          <button className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded uppercase">
            &larr; Back
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-slate-400">
          <span>Projects</span>
          <span>/</span>
          <span className="text-slate-500">Emirates Hills Villa</span>
          <span>/</span>
          <span className="text-slate-900">Financial Analytics</span>
        </div>
      </div>

      <div className="p-8 max-w-[1700px] mx-auto space-y-6">
        
        {/* 3. GREEN & RED REVENUE/EXPENSE HEADER BLOCKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Container Block */}
          <div className="bg-[#EBF7F2] border border-[#CDEEDF] rounded-xl p-5">
            <div className="flex justify-between items-center border-b border-[#D5F2E6] pb-3 mb-3">
              <span className="text-xs font-bold text-[#1F7A54] uppercase tracking-wider">Revenue/Income</span>
              <span className="text-sm font-bold text-[#1F7A54]">AED {projectValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 bg-white/70 p-2.5 rounded-lg border border-[#D5F2E6]">
              <div className="flex items-center gap-2">
                <span className="text-[#1F7A54] font-bold">&bull;</span>
                <span className="font-semibold">Project value</span>
              </div>
              <span className="font-bold text-slate-900">AED {projectValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Expenses Container Block */}
          <div className="bg-[#FDF2F2] border border-[#FDE8E8] rounded-xl p-5">
            <div className="flex justify-between items-center border-b border-[#FBD5D5] pb-3 mb-3">
              <span className="text-xs font-bold text-[#C81E1E] uppercase tracking-wider">Expenses/Cost</span>
              <span className="text-sm font-bold text-[#C81E1E]">AED {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 bg-white/70 p-2.5 rounded-lg border border-[#FBD5D5]">
              <div className="flex items-center gap-2">
                <span className="text-[#C81E1E] font-bold">&bull;</span>
                <span className="font-semibold">Material Requests</span>
              </div>
              <span className="font-bold text-slate-900">AED {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* 4. FOUR DISTINCT KPI CARD ROW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Running PnL</span>
            <span className="text-lg font-extrabold text-[#10B981] mt-2">
              AED {Number(metrics.runningPnL || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit Margin</span>
            <span className="text-lg font-extrabold text-[#2563EB] mt-2">
              {Number(metrics.profitMargin || 0).toFixed(2)}%
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actual Cost (Paid)</span>
            <span className="text-lg font-extrabold text-[#1F2937] mt-2">
              AED {Number(metrics.actualCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Committed Cost (Unpaid)</span>
            <span className="text-lg font-extrabold text-[#D97706] mt-2">
              AED {Number(metrics.committedCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </section>

        {/* 5. WORKSPACE CONTAINING SIDEBAR AND WORK TABLES */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* COST ANALYSIS SIDEBAR WITH REQUISITIONS TABS */}
          <div className="col-span-12 lg:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cost Analysis</h3>
            </div>
            
            {/* Navigational Sub Tabs */}
            <div className="flex border-b border-gray-100 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
              {(['Materials', 'BOQ', 'Requestors', 'Suppliers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-center transition-all ${activeTab === tab ? 'bg-white text-slate-900 border-b-2 border-slate-900' : 'hover:bg-gray-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'Materials' ? (
                <div className="space-y-2">
                  {costAnalysis.map((cat: any) => (
                    <div key={cat.id} className="flex justify-between items-center text-xs py-1">
                      <span className={cat.parent_id ? "pl-4 text-slate-600 font-medium" : "font-bold text-slate-900"}>
                        {cat.parent_id ? "↳ " : ""} {cat.name}
                      </span>
                      <span className="font-bold text-slate-800 text-right">
                        AED {Number(cat.total_spend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">
                  {activeTab} breakdown schema configured.
                </div>
              )}
            </div>
          </div>

          {/* CENTRAL APPLICATION DATA VIEW workspace */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* MATERIAL REQUESTS TRACKING DATA-TABLE */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Material Requests</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Search standard items..." 
                    className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none bg-slate-50"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                  <select 
                    className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs bg-slate-50 focus:outline-none font-medium"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Date</th>
                      <th className="p-3">MR Number</th>
                      <th className="p-3">Requestor</th>
                      <th className="p-3">Value</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMrs.map((mr: any) => (
                      <tr 
                        key={mr.id} 
                        onClick={() => setSelectedMr(mr)}
                        className={`cursor-pointer transition-colors ${selectedMr?.id === mr.id ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3 text-slate-500">2026-06-{mr.mr_number === 'MR-2026-001' ? '25' : '28'}</td>
                        <td className="p-3 flex items-center gap-2">
                          <span className="text-slate-900 font-bold">{mr.mr_number}</span>
                          {/* Ensure structural tags match layout styles */}
                          {mr.mr_number === 'MR-2026-002' && (
                            <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                              Important
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{mr.requestor_name}</td>
                        <td className="p-3 font-extrabold text-slate-900">
                          AED {Number(mr.total_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${mr.status === 'Paid' ? 'bg-[#EBF7F2] text-[#1F7A54] border-[#CDEEDF]' : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'}`}>
                            {mr.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DYNAMIC LINE-ITEMS SPECIFICATION PREVIEW TABLE */}
            {selectedMr && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedMr.mr_number} Material Request Preview</h4>
                    <div className="text-xs mt-1 space-y-0.5">
                      <p className="text-slate-500">Requestor: <span className="text-slate-900 font-semibold">{selectedMr.requestor_name}</span></p>
                      <p className="text-slate-500">Vendor: <span className="text-slate-900 font-semibold">{selectedMr.supplier_name || 'Gulf Fixings & Hardware Trading LLC'}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Workflow Status</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">{selectedMr.stage}</span>
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-gray-100">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Material Description</th>
                      <th className="pb-2 text-right">Req. Qty</th>
                      <th className="pb-2 text-center">Specs</th>
                      <th className="pb-2 text-right">Lowest Price</th>
                      <th className="pb-2 text-right">Avg Price</th>
                      <th className="pb-2 text-right">Prev. Price</th>
                      <th className="pb-2 text-center">BOQ Ref</th>
                      <th className="pb-2 text-right">Purchase Price / Unit</th>
                      <th className="pb-2 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mrDetails.map((line: any, index) => {
                      const lineTotal = Number(line.qty || 0) * Number(line.unit_price || 0);
                      return (
                        <tr key={line.id} className="text-slate-700">
                          <td className="py-2.5 text-slate-400 font-medium">{index + 1}</td>
                          <td className="py-2.5 font-bold text-slate-900">{line.material_name}</td>
                          <td className="py-2.5 text-right font-medium">{Number(line.qty || 0).toLocaleString()} {line.unit}</td>
                          <td className="py-2.5 text-center text-slate-400">N/A</td>
                          <td className="py-2.5 text-right text-slate-400">N/A</td>
                          <td className="py-2.5 text-right text-slate-400">N/A</td>
                          <td className="py-2.5 text-right text-slate-400">N/A</td>
                          <td className="py-2.5 text-center text-slate-500 font-bold">1.1.1</td>
                          <td className="py-2.5 text-right font-medium">AED {Number(line.unit_price || 0).toFixed(2)}</td>
                          <td className="py-2.5 text-right font-extrabold text-slate-900">
                            AED {lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* LEDGER PRICING COMPUTATIONS */}
                <div className="pt-3 border-t border-gray-100 flex flex-col items-end text-xs space-y-1.5 text-slate-500">
                  <div className="flex justify-between w-56">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-bold text-slate-900">
                      AED {(Number(selectedMr.total_value || 0) / 1.05).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between w-56">
                    <span className="font-medium">Subtotal VAT (5%):</span>
                    <span className="font-bold text-slate-900">
                      AED {(Number(selectedMr.total_value || 0) - (Number(selectedMr.total_value || 0) / 1.05)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between w-56 border-t border-gray-200 pt-2 text-sm font-black text-slate-900">
                    <span>Total Price:</span>
                    <span className="text-[#2563EB]">
                      AED {Number(selectedMr.total_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}