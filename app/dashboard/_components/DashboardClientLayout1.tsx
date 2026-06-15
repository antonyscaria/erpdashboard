// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function FinancialDashboardPage() {
  // Layout collapse states
  const [projectValueOpen, setProjectValueOpen] = useState(true);
  const [scrapSoldOpen, setScrapSoldOpen] = useState(true);
  const [materialRequestsOpen, setMaterialRequestsOpen] = useState(true);

  // Material requests tree breakdown states
  const [costAnalysisTab, setCostAnalysisTab] = useState<'Materials' | 'BOQ'>('Materials');
  const [woodOpen, setWoodOpen] = useState(true);
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [hardwareOpen, setHardwareOpen] = useState(true);
  const [hingesOpen, setHingesOpen] = useState(true);

  // Context menu dynamic overlay toggles
  const [activeRevenueMenu, setActiveRevenueMenu] = useState<string | null>(null);
  const [activeExpenseMenu, setActiveExpenseMenu] = useState<string | null>(null);

  // Core Toolbar Action State Flow
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isAddTagSubmenuOpen, setIsAddTagSubmenuOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Inline Row Action Dropdown Overlay
  const [inlineActionMenuOpenId, setInlineActionMenuOpenId] = useState<string | null>(null);
  const [isInlineAddTagSubmenuOpen, setIsInlineAddTagSubmenuOpen] = useState(false);
  const [inlineTagInput, setInlineTagInput] = useState('');

  // --- NEW INTEGRATED STATES FOR TRANSACTION FORM MODAL ---
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionMode, setTransactionMode] = useState<'Revenue' | 'Expense'>('Revenue');
  const [formType, setFormType] = useState<'ONE TIME' | 'RECURRING'>('ONE TIME');
  const [formDate, setFormDate] = useState('2026-01-22');
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-01-22');
  const [formEndDate, setFormEndDate] = useState('2026-01-22');

  // Refs for tracking dropdown wrappers to detect click outside
  const revenueMenuRef = useRef<HTMLDivElement | null>(null);
  const expenseMenuRef = useRef<HTMLDivElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const inlineActionRef = useRef<HTMLDivElement | null>(null);

  // Click outside event listener logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeRevenueMenu && revenueMenuRef.current && !revenueMenuRef.current.contains(event.target as Node)) {
        setActiveRevenueMenu(null);
      }
      if (activeExpenseMenu && expenseMenuRef.current && !expenseMenuRef.current.contains(event.target as Node)) {
        setActiveExpenseMenu(null);
      }
      if (isActionMenuOpen && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
        setIsAddTagSubmenuOpen(false);
      }
      if (inlineActionMenuOpenId && inlineActionRef.current && !inlineActionRef.current.contains(event.target as Node)) {
        setInlineActionMenuOpenId(null);
        setIsInlineAddTagSubmenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeRevenueMenu, activeExpenseMenu, isActionMenuOpen, inlineActionMenuOpenId]);
  

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] antialiased font-sans pb-16 relative">
      
      {/* =========================================================================
         1. TOP NAVIGATION NAVBAR
         ========================================================================= */}
      <nav className="w-full bg-[#000000] text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6 w-full max-w-2xl">
          <div className="flex items-baseline gap-1.5 shrink-0">
            <span className="font-black text-xl tracking-tight text-white">Rayfitout</span>
            <span className="text-[9px] tracking-widest text-slate-400 font-bold uppercase">
              PROCUREMENT MANAGEMENT
            </span>
          </div>
          
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search MR / Item / Project" 
              className="w-full bg-[#FFFFFF] text-slate-900 placeholder:text-slate-400 text-xs rounded-lg pl-4 pr-10 py-1.5 border border-transparent focus:outline-none font-medium"
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-slate-400 text-sm pointer-events-none">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button className="px-4 py-1.5 bg-transparent hover:bg-slate-900 border border-white rounded-md text-xs font-bold text-white tracking-wide transition">
            + NEW PROJECT
          </button>
          <button className="px-4 py-1.5 bg-[#FFFFFF] hover:bg-slate-100 text-slate-900 rounded-md text-xs font-bold tracking-wide transition shadow-sm">
            + NEW MR
          </button>
          
          <div className="relative p-1.5 text-slate-300 hover:text-white cursor-pointer transition">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22a2.01 2.01 0 002-2h-4a2.01 2.01 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-black" />
          </div>

          <div className="h-5 w-[1px] bg-slate-800 mx-0.5" />
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-900 font-bold text-xs shadow-inner">
              M
            </div>
            <span className="text-xs font-bold text-slate-200 tracking-tight">Hamza - Manager</span>
          </div>

          <button className="p-1.5 text-slate-400 hover:text-white transition rounded-md border border-slate-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      {/* =========================================================================
         2. BREADCRUMB HEADER STRIP
         ========================================================================= */}
      <div className="max-w-[1920px] mx-auto px-6 pt-4">
        <button className="px-3 py-1 bg-[#EAEAEA] hover:bg-slate-200 transition text-slate-800 text-[11px] font-bold rounded-md flex items-center gap-1.5">
          <span>‹</span> BACK
        </button>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 flex items-center justify-between mt-3 mb-5">
        <div className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-900">
          <span className="text-slate-800 font-black tracking-wide">PROJECTS</span>
          <span className="text-slate-400 text-xs font-bold">›</span>
          <span className="text-slate-800 font-black tracking-wide">EMIRATES HILLS VILLA</span>
          <span className="text-slate-400 text-xs font-bold">›</span>
          <span className="text-slate-900 font-black tracking-wide text-base">FINANCIAL ANALYTICS</span>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
          <span>APR 15-22, 2026</span>
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
         3. TOP EXECUTIVE METRICS ROW
         ========================================================================= */}
      <div className="max-w-[1920px] mx-auto px-6 grid grid-cols-12 gap-5 items-stretch">
        
        {/* GRAPH PANEL */}
        <div className="col-span-12 lg:col-span-2 bg-white border border-slate-200/50 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative min-h-[460px]">
          <div className="flex flex-row justify-between h-[92%] relative">
            <div className="flex flex-col justify-between h-full text-[9px] font-black text-slate-400 font-mono tracking-tighter pt-1 pb-4">
              <div>AED 5M</div> <div>AED 5M</div> <div>AED 5M</div> <div>AED 5M</div>
              <div>AED 5M</div> <div>AED 5M</div> <div>AED 5M</div> <div>AED 2M</div>
              <div>AED 1M</div> <div className="text-slate-300">AED 0</div>
            </div>
            <div className="flex items-end justify-center gap-4 w-full h-full px-2 pb-4 relative">
              <div className="w-11 bg-[#10B981] rounded-t-xl h-[96%] transition-all" />
              <div className="w-11 bg-[#EF4444] rounded-t-xl h-[54%] transition-all" />
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-[10px] font-bold text-slate-500 tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span>Expenses</span>
            </div>
          </div>
        </div>

        {/* LISTS + METRICS STRIP CONTAINER */}
        <div className="col-span-12 lg:col-span-10 flex flex-col justify-between gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch h-full">
            
            {/* REVENUE INCOME PANEL */}
            <div className="bg-[#E6FBF3] border border-[#A7F3D0] rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-[350px]">
              <div ref={revenueMenuRef} className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex justify-between items-center pb-1">
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Revenue / Income</h2>
                  <span className="bg-[#A7F3D0] text-[#047857] font-mono text-sm font-black px-3 py-1 rounded-lg">+ AED 151,300</span>
                </div>

                {/* Project Value Node */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-visible relative">
                  <div className="p-3 flex justify-between items-center">
                    <div onClick={() => setProjectValueOpen(!projectValueOpen)} className="flex items-center gap-2.5 text-sm font-black text-[#047857] cursor-pointer select-none">
                      <span className="text-slate-400 text-[10px] w-2.5 text-center">{projectValueOpen ? '▼' : '▶'}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span>Project value</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-[#047857] font-mono">
                      <span>+ AED 150,000</span>
                      <button 
                        onClick={() => setActiveRevenueMenu(activeRevenueMenu === 'project' ? null : 'project')}
                        className="text-slate-400 hover:text-slate-900 font-black text-base px-1 transition"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {activeRevenueMenu === 'project' && (
                    <div className="absolute right-3 top-10 bg-white border border-slate-200 rounded-lg py-1.5 w-40 shadow-md z-30 text-xs font-bold text-slate-700">
                      {!projectValueOpen ? (
                        <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                      ) : (
                        <>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📝 Edit</button>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📋 Duplicate</button>
                          <div className="h-[1px] bg-slate-100 my-1" />
                          <button className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2">🗑️ Delete</button>
                        </>
                      )}
                    </div>
                  )}

                  {projectValueOpen && (
                    <div className="px-9 pb-3 pt-1 border-t border-slate-50 space-y-2 text-[11px] font-bold">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-500 hover:underline cursor-pointer">BOQ-001</span>
                        <span className="font-mono text-[#047857] flex items-center gap-1.5">+ AED 150,000</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrap/Good Sold Node */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-visible relative">
                  <div className="p-3 flex justify-between items-center">
                    <div onClick={() => setScrapSoldOpen(!scrapSoldOpen)} className="flex items-center gap-2.5 text-sm font-black text-[#047857] cursor-pointer select-none">
                      <span className="text-slate-400 text-[10px] w-2.5 text-center">{scrapSoldOpen ? '▼' : '▶'}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span>Scrap/Good Sold</span>
                      <span className="bg-[#FEF3C7] text-[#D97706] text-[9px] px-2 py-0.5 rounded-md font-bold tracking-tight">Manual Entry - One Time</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-[#047857] font-mono">
                      <span>+ AED 1,300</span>
                      <button 
                        onClick={() => setActiveRevenueMenu(activeRevenueMenu === 'scrap' ? null : 'scrap')}
                        className="text-slate-400 hover:text-slate-900 font-black text-base px-1 transition"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {activeRevenueMenu === 'scrap' && (
                    <div className="absolute right-3 top-10 bg-white border border-slate-200 rounded-lg py-1.5 w-40 shadow-md z-30 text-xs font-bold text-slate-700">
                      {!scrapSoldOpen ? (
                        <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                      ) : (
                        <>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📝 Edit</button>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📋 Duplicate</button>
                          <div className="h-[1px] bg-slate-100 my-1" />
                          <button className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2">🗑️ Delete</button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Item A Node */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-visible relative">
                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2.5 text-sm font-black text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span>Item A</span>
                      <span className="bg-[#FEF3C7] text-[#D97706] text-[9px] px-2 py-0.5 rounded-md font-bold tracking-tight">Manual Entry - Recurring</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-800 font-mono">
                      <span>AED 1,300</span>
                      <button 
                        onClick={() => setActiveRevenueMenu(activeRevenueMenu === 'itemA' ? null : 'itemA')}
                        className="text-slate-400 hover:text-slate-900 font-black text-base px-1 transition"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {activeRevenueMenu === 'itemA' && (
                    <div className="absolute right-3 top-10 bg-white border border-slate-200 rounded-lg py-1.5 w-40 shadow-md z-30 text-xs font-bold text-slate-700">
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📝 Edit</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📋 Duplicate</button>
                      <div className="h-[1px] bg-slate-100 my-1" />
                      <button className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2">🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button configuration connected to state workflow */}
              <button 
                onClick={() => {
                  setTransactionMode('Revenue');
                  setFormType('ONE TIME');
                  setIsTransactionModalOpen(true);
                }}
                className="w-full mt-4 py-2 bg-[#00A86B] hover:bg-[#00945E] transition text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm uppercase"
              >
                <span>ADD REVENUE</span> <span className="w-4 h-4 rounded-full bg-white text-[#00A86B] text-[10px] flex items-center justify-center font-black">+</span>
              </button>
            </div>

            {/* EXPENSES COST PANEL */}
            <div className="bg-[#FFF5F5] border border-[#FEE2E2] rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-[350px]">
              <div ref={expenseMenuRef} className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex justify-between items-center pb-1">
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Expenses / Cost</h2>
                  <span className="bg-[#FEE2E2] text-[#991B1B] font-mono text-sm font-black px-3 py-1 rounded-lg">- AED 2,875</span>
                </div>

                {/* Material Requests Node */}
                <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-visible relative">
                  <div className="p-3 flex justify-between items-center">
                    <div onClick={() => setMaterialRequestsOpen(!materialRequestsOpen)} className="flex items-center gap-2.5 text-sm font-black text-[#991B1B] cursor-pointer select-none">
                      <span className="text-slate-400 text-[10px] w-2.5 text-center">{materialRequestsOpen ? '▼' : '▶'}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                      <span>Material Requests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-[#991B1B] font-mono">
                      <span>- AED 1,575</span>
                      <button 
                        onClick={() => setActiveExpenseMenu(activeExpenseMenu === 'mr' ? null : 'mr')}
                        className="text-slate-400 hover:text-slate-900 font-black text-base px-1 transition"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {activeExpenseMenu === 'mr' && (
                    <div className="absolute right-3 top-10 bg-white border border-slate-200 rounded-lg py-1.5 w-41 shadow-md z-30 text-xs font-bold text-slate-700">
                      {!materialRequestsOpen ? (
                        <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                      ) : (
                        <>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📝 Edit</button>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                          <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📋 Duplicate</button>
                          <div className="h-[1px] bg-slate-100 my-1" />
                          <button className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2">🗑️ Delete</button>
                        </>
                      )}
                    </div>
                  )}

                  {materialRequestsOpen && (
                    <div className="px-9 pb-3 pt-1 border-t border-slate-50 bg-slate-50/20 space-y-1.5 text-[11px] font-bold text-slate-400">
                      <div className="flex justify-between items-center"><span>PAID</span><span className="text-rose-600 font-mono">AED 1,050</span></div>
                      <div className="flex justify-between items-center"><span>UNPAID</span><span className="text-rose-600 font-mono">AED 525</span></div>
                    </div>
                  )}
                </div>

                {/* Expense Item A Node */}
                <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-visible relative">
                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2.5 text-sm font-black text-[#991B1B]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                      <span>Item A</span>
                      <span className="bg-[#FEF3C7] text-[#D97706] text-[9px] px-2 py-0.5 rounded-md font-bold tracking-tight">Manual Entry - One Time</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-[#991B1B] font-mono">
                      <span>- AED 1,300</span>
                      <button 
                        onClick={() => setActiveExpenseMenu(activeExpenseMenu === 'itemA_exp' ? null : 'itemA_exp')}
                        className="text-slate-400 hover:text-slate-900 font-black text-base px-1 transition"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {activeExpenseMenu === 'itemA_exp' && (
                    <div className="absolute right-3 top-10 bg-white border border-slate-200 rounded-lg py-1.5 w-41 shadow-md z-30 text-xs font-bold text-slate-700">
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📝 Edit</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Hide Expense</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📋 Duplicate</button>
                      <div className="h-[1px] bg-slate-100 my-1" />
                      <button className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2">🗑️ Delete</button>
                    </div>
                  )}
                </div>

                {/* Wages Node */}
                <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-visible relative">
                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-rose-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
                      <span>Wages</span>
                      <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold tracking-tight">Manual Entry - Recurring</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-rose-300 font-mono">
                      <span>- AED 1,300</span>
                      <button 
                        onClick={() => setActiveExpenseMenu(activeExpenseMenu === 'wages' ? null : 'wages')}
                        className="text-slate-300 hover:text-slate-600 font-black text-base px-1 transition"
                      >
                        ⋮
                      </button>
                    </div>
                  </div>

                  {activeExpenseMenu === 'wages' && (
                    <div className="absolute right-3 top-10 bg-white border border-slate-200 rounded-lg py-1.5 w-41 shadow-md z-30 text-xs font-bold text-slate-700">
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📝 Edit</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">👁️ Unhide Expense</button>
                      <button className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2">📋 Duplicate</button>
                      <div className="h-[1px] bg-slate-100 my-1" />
                      <button className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2">🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button configuration connected to state workflow */}
              <button 
                onClick={() => {
                  setTransactionMode('Expense');
                  setFormType('ONE TIME');
                  setIsTransactionModalOpen(true);
                }}
                className="w-full mt-4 py-2 bg-[#E5484D] hover:bg-[#DC3E42] transition text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm uppercase"
              >
                <span>ADD EXPENSE</span> <span className="w-4 h-4 rounded-full bg-white text-[#E5484D] text-[10px] flex items-center justify-center font-black">+</span>
              </button>
            </div>
          </div>

          {/* LOWER HORIZONTAL METRICS STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-800 flex items-center gap-1 tracking-tight"><span>Running PnL</span><span className="w-3.5 h-3.5 text-[10px] text-white bg-black rounded-full inline-flex items-center justify-center font-bold font-serif">i</span></div>
                <div className="text-xl font-black text-[#00A86B] tracking-tight">AED 148,425</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#E6FBF3] flex items-center justify-center text-[#00A86B] shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-800 flex items-center gap-1 tracking-tight"><span>Profit Margin</span><span className="w-3.5 h-3.5 text-[10px] text-white bg-black rounded-full inline-flex items-center justify-center font-bold font-serif">i</span></div>
                <div className="text-xl font-black text-[#00A86B] tracking-tight">98.1%</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-amber-500 shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" /></svg></div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-800 flex items-center gap-1 tracking-tight"><span>Actual Cost</span><span className="w-3.5 h-3.5 text-[10px] text-white bg-black rounded-full inline-flex items-center justify-center font-bold font-serif">i</span></div>
                <div className="text-xl font-black text-[#9A2C2C] tracking-tight">AED 2,350</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FFF5F5] flex items-center justify-center text-[#E5484D] shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-800 flex items-center gap-1 tracking-tight"><span>Committed Cost</span><span className="w-3.5 h-3.5 text-[10px] text-white bg-black rounded-full inline-flex items-center justify-center font-bold font-serif">i</span></div>
                <div className="text-xl font-black text-[#9A2C2C] tracking-tight">AED 525</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-amber-600 shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
         4. MATERIAL REQUESTS & COST ANALYSIS BLOCK
         ========================================================================= */}
      <div className="max-w-[1920px] mx-auto px-6 mt-12 grid grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: EXPENSE BREAKDOWN & TREE BLOCK */}
        <div className="col-span-12 lg:col-span-3 space-y-5">
          <h2 className="text-xl font-black tracking-tight text-slate-900 px-0.5">Material Requests</h2>
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 tracking-tight block mb-1">Expense Breakdown</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight mb-4">AED 1,575</div>
            
            <div className="space-y-2 text-[11px] font-black tracking-wide text-slate-600">
              <div className="flex justify-between items-center">
                <span>PAID</span>
                <span className="font-mono text-slate-900">- AED 1,050</span>
              </div>
              <div className="flex justify-between items-center">
                <span>UNPAID</span>
                <span className="font-mono text-slate-900">- AED 525</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase px-0.5">Cost Analysis</h3>
            
            <div className="flex bg-[#EAEAEA] p-0.5 rounded-lg text-xs font-black">
              <button 
                onClick={() => setCostAnalysisTab('Materials')}
                className={`flex-1 py-1.5 rounded-md text-center transition ${costAnalysisTab === 'Materials' ? 'bg-[#000000] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}
              >
                Materials
              </button>
              <button 
                onClick={() => setCostAnalysisTab('BOQ')}
                className={`flex-1 py-1.5 rounded-md text-center transition ${costAnalysisTab === 'BOQ' ? 'bg-[#000000] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'}`}
              >
                BOQ
              </button>
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-white text-slate-900 text-xs rounded-lg pl-3 pr-8 py-1.5 border border-slate-200 shadow-xs focus:outline-none font-medium"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs pointer-events-none">🔍</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-[11px] font-bold">
              <div className="bg-[#F8F9FA] px-3 py-2 border-b border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <span>Description</span>
                <span>Cost</span>
              </div>

              <div className="p-2.5 space-y-1 max-h-[380px] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center py-1 px-1 hover:bg-slate-50 rounded-sm">
                  <div className="flex items-center gap-1.5">
                    <input type="checkbox" defaultChecked className="rounded-xs accent-black w-3.5 h-3.5" />
                    <span className="text-slate-800">All Materials</span>
                  </div>
                  <span className="font-mono font-black text-slate-900">AED 1,575</span>
                </div>

                <div className="bg-slate-50/60 rounded-md">
                  <div className="flex justify-between items-center py-1.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <input type="checkbox" defaultChecked className="rounded-xs accent-black w-3.5 h-3.5" />
                      <button onClick={() => setWoodOpen(!woodOpen)} className="text-slate-400 text-[9px] w-3 text-center">
                        {woodOpen ? '▼' : '▶'}
                      </button>
                      <span className="text-slate-900 font-black">Wood</span>
                    </div>
                    <span className="font-mono font-black border-b-2 border-emerald-500 text-slate-900">AED 1,050</span>
                  </div>

                  {woodOpen && (
                    <div className="pl-6 pr-2 pb-1.5 space-y-1 border-l border-slate-200/60 ml-4">
                      <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" defaultChecked className="rounded-xs accent-black w-3 h-3" />
                          <button onClick={() => setBoardsOpen(!boardsOpen)} className="text-slate-400 text-[8px] w-2.5 text-center">
                            {boardsOpen ? '▼' : '▶'}
                          </button>
                          <span className="text-slate-700">Boards & Panels</span>
                        </div>
                        <span className="font-mono border-b border-emerald-500 text-slate-800">AED 1,050</span>
                      </div>

                      {boardsOpen && (
                        <div className="pl-6 pr-1 py-0.5 text-slate-500 font-medium space-y-1">
                          <div className="flex justify-between items-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <input type="checkbox" defaultChecked className="rounded-xs accent-black w-3 h-3" />
                              <span>MDF 12 x 300mm</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 border-b border-emerald-500">AED 1,050</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-md">
                  <div className="flex justify-between items-center py-1.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <input type="checkbox" defaultChecked className="rounded-xs accent-black w-3.5 h-3.5" />
                      <button onClick={() => setHardwareOpen(!hardwareOpen)} className="text-slate-400 text-[9px] w-3 text-center">
                        {hardwareOpen ? '▼' : '▶'}
                      </button>
                      <span className="text-slate-900 font-black">Hardware</span>
                    </div>
                    <span className="font-mono font-black border-b-2 border-emerald-500 text-slate-900">AED 525</span>
                  </div>

                  {hardwareOpen && (
                    <div className="pl-6 pr-2 pb-1.5 space-y-1 border-l border-slate-200/60 ml-4">
                      <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" defaultChecked className="rounded-xs accent-black w-3 h-3" />
                          <button onClick={() => setHingesOpen(!hingesOpen)} className="text-slate-400 text-[8px] w-2.5 text-center">
                            {hingesOpen ? '▼' : '▶'}
                          </button>
                          <span className="text-slate-700">Hinges & Fittings</span>
                        </div>
                        <span className="font-mono border-b border-emerald-500 text-slate-800">AED 525</span>
                      </div>

                      {hingesOpen && (
                        <div className="pl-6 pr-1 py-0.5 text-slate-500 font-medium space-y-1">
                          <div className="flex justify-between items-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <input type="checkbox" defaultChecked className="rounded-xs accent-black w-3 h-3" />
                              <span className="leading-tight">Concealed Hinge 35mm</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700 border-b border-emerald-500">AED 525</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE DATATABLE */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="text-xs font-bold text-slate-400">
              Showing 40 MRs <span className="text-blue-500 font-black hover:underline cursor-pointer">(All Materials)</span> for <span className="text-blue-500 font-black hover:underline cursor-pointer">Private Villa, Test</span>
            </div>

            {/* Core Action Dropdown Flow */}
            <div ref={actionMenuRef} className="flex items-center gap-2 relative">
              <button 
                onClick={() => {
                  setIsActionMenuOpen(!isActionMenuOpen);
                  setIsAddTagSubmenuOpen(false);
                }}
                className="bg-black text-white px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-slate-900 transition flex items-center gap-1"
              >
                <span>Action</span>
                <span className="text-[9px] opacity-70">{isActionMenuOpen ? '▲' : '▼'}</span>
              </button>

              {isActionMenuOpen && (
                <div className="absolute right-0 top-9 bg-white border border-slate-200 rounded-lg py-1 w-44 shadow-md z-40 text-xs font-semibold text-slate-800">
                  <button 
                    onMouseEnter={() => setIsAddTagSubmenuOpen(true)}
                    onClick={() => setIsAddTagSubmenuOpen(!isAddTagSubmenuOpen)}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between transition ${isAddTagSubmenuOpen ? 'bg-slate-50' : ''}`}
                  >
                    <span>Add Tag</span>
                    <span className="text-slate-400 font-mono text-[10px]">›</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      setIsAddTagSubmenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 transition"
                  >
                    Remove Tag
                  </button>

                  {isAddTagSubmenuOpen && (
                    <div className="absolute left-full top-0 ml-1 bg-white border border-slate-200 rounded-lg p-3 w-64 shadow-md z-50">
                      <input 
                        type="text"
                        placeholder="Create a New Tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="w-full bg-white text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none placeholder:text-slate-400 font-medium"
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => {
                            if (newTagInput.trim()) {
                              alert(`Tag added: ${newTagInput}`);
                              setNewTagInput('');
                            }
                            setIsActionMenuOpen(false);
                            setIsAddTagSubmenuOpen(false);
                          }}
                          className="bg-black hover:bg-slate-950 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-white text-slate-900 placeholder:text-slate-400 text-xs rounded-md pl-3 pr-8 py-1.5 border border-slate-200 shadow-xs focus:outline-none font-medium w-44"
                />
                <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 text-xs pointer-events-none">🔍</span>
              </div>
            </div>
          </div>

          {/* Inline Selection Filtering Control Toggles Strip */}
          <div className="flex flex-wrap items-center gap-2 bg-[#F8F9FA] border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md flex items-center gap-1.5 shadow-xs text-slate-800 text-[11px]">
              📅 <span>APR 15-22, 2026</span>
            </button>
            
            <div className="flex items-center gap-1 ml-2 text-[11px]">
              <span className="text-slate-400 font-medium">Show</span>
              <select className="bg-white border border-slate-200 rounded-md px-2 py-1 pr-6 font-black text-slate-800 text-[11px] focus:outline-none appearance-none cursor-pointer bg-no-repeat bg-[right_6px_center] [background-image:url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px]">
                <option>MR Value</option>
              </select>
            </div>

            <select className="bg-white border border-slate-200 rounded-md px-2 py-1 font-bold text-slate-400 text-[11px] focus:outline-none cursor-pointer">
              <option>All Requestor</option>
            </select>

            <select className="bg-white border border-slate-200 rounded-md px-2 py-1 font-bold text-slate-400 text-[11px] focus:outline-none cursor-pointer">
              <option>Paid & Unpaid</option>
            </select>

            <button className="text-blue-500 font-black text-[11px] hover:underline pl-1 cursor-pointer">
              Reset
            </button>
          </div>

          {/* Master Main Structured Data Grid Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-slate-200 text-[11px] font-black text-slate-900 tracking-wide uppercase">
                  <th className="py-3 px-4 w-10"><input type="checkbox" className="rounded-xs accent-black w-3.5 h-3.5" /></th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">MR Number</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4 text-right pr-12">Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-slate-800">
                <tr className="hover:bg-slate-50/50 transition border-b border-slate-100">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded-xs accent-black w-3.5 h-3.5" /></td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">01/12/2026</td>
                  <td className="py-3.5 px-4 overflow-visible">
                    <div className="space-y-1">
                      <span className="text-blue-500 font-black cursor-pointer hover:underline block">MR-2026-001</span>
                      
                      <div ref={inlineActionRef} className="flex items-center gap-1.5 text-[9px] relative">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1 font-black">
                          Important <span className="text-slate-400 text-[8px] font-normal hover:text-black cursor-pointer">×</span>
                        </span>
                        
                        <button 
                          onClick={() => {
                            setInlineActionMenuOpenId(inlineActionMenuOpenId === 'MR-001' ? null : 'MR-001');
                            setIsInlineAddTagSubmenuOpen(false);
                          }}
                          className="text-slate-400 hover:text-slate-600 font-bold border border-dashed border-slate-200 rounded px-1.5 py-0.5 bg-slate-50/40"
                        >
                          Add Tag +
                        </button>

                        {inlineActionMenuOpenId === 'MR-001' && (
                          <div className="absolute left-16 top-5 bg-white border border-slate-200 rounded-lg py-1 w-44 shadow-md z-40 text-xs font-semibold text-slate-800 text-left">
                            <button 
                              onMouseEnter={() => setIsInlineAddTagSubmenuOpen(true)}
                              onClick={() => setIsInlineAddTagSubmenuOpen(!isInlineAddTagSubmenuOpen)}
                              className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between transition ${isInlineAddTagSubmenuOpen ? 'bg-slate-50' : ''}`}
                            >
                              <span>Add Tag</span>
                              <span className="text-slate-400 font-mono text-[10px]">›</span>
                            </button>
                            <button 
                              onClick={() => {
                                setInlineActionMenuOpenId(null);
                                setIsInlineAddTagSubmenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 transition"
                            >
                              Remove Tag
                            </button>

                            {isInlineAddTagSubmenuOpen && (
                              <div className="absolute left-full top-0 ml-1 bg-white border border-slate-200 rounded-lg p-3 w-64 shadow-md z-50">
                                <input 
                                  type="text"
                                  placeholder="Create a New Tag"
                                  value={inlineTagInput}
                                  onChange={(e) => setInlineTagInput(e.target.value)}
                                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none placeholder:text-slate-400 font-medium"
                                />
                                <div className="flex justify-end mt-2">
                                  <button 
                                    onClick={() => {
                                      if (inlineTagInput.trim()) {
                                        alert(`Tag added to row: ${inlineTagInput}`);
                                        setInlineTagInput('');
                                      }
                                      setInlineActionMenuOpenId(null);
                                      setIsInlineAddTagSubmenuOpen(false);
                                    }}
                                    className="bg-black hover:bg-slate-950 text-white text-xs font-bold px-4 py-1.5 rounded-md shadow-sm transition"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-black">Shinto Antony</td>
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-right pr-12">AED 1,050</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block bg-[#E6FBF3] text-[#047857] font-black text-[10px] px-6 py-1 rounded-full tracking-wide border border-[#A7F3D0]">
                      Paid
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition border-b border-slate-100 bg-[#E6FBF3]/20">
                  <td className="py-3.5 px-4"><input type="checkbox" className="rounded-xs accent-black w-3.5 h-3.5" /></td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">01/12/2026</td>
                  <td className="py-3.5 px-4">
                    <span className="text-blue-500 font-black hover:underline">MR-2026-002</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-black">Shinto Antony</td>
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-right pr-12">AED 525</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block bg-[#FFF5F5] text-[#991B1B] font-black text-[10px] px-5 py-1 rounded-full tracking-wide border border-[#FEE2E2]">
                      Unpaid
                    </span>
                  </td>
                </tr>

                {[...Array(4)].map((_, index) => (
                  <tr key={index} className="h-11 border-b border-slate-100/50 opacity-20"><td colSpan={6} /></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Standard Data Table Pagination Controllers Row */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 pt-2">
            <button className="p-1 hover:text-black transition text-sm">‹</button>
            <button className="w-6 h-6 rounded bg-black text-white flex items-center justify-center text-[11px] font-black shadow-sm">1</button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">2</button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">3</button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">4</button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">5</button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">6</button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">7</button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">8</button>
            <span className="px-1 text-slate-300 font-normal">...</span>
            <button className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-[11px] text-slate-700 transition">30</button>
            <button className="p-1 hover:text-black transition text-sm">›</button>
          </div>

        </div>
      </div>

      {/* =========================================================================
         5. MATERIAL REQUEST PREVIEW SECTION
         ========================================================================= */}
      <div className="max-w-[1920px] mx-auto px-6 mt-16 pt-10 border-t border-slate-200/80 space-y-5">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Material Request Preview</h2>
        
        <div className="w-full flex flex-col lg:flex-row gap-6 items-stretch">
          <div className="w-full lg:w-[260px] bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs text-xs">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-tight">MR Number</span>
                  <span className="text-blue-500 font-black text-sm tracking-tight cursor-pointer hover:underline">MR-2026-002</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-tight">Current Stage</span>
                  <span className="text-slate-900 font-black text-xs tracking-tight">Completed</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block tracking-tight">Requestor</span>
                <span className="text-slate-900 font-black text-sm tracking-tight">Shinto Antony</span>
              </div>
            </div>

            <div className="space-y-0.5 mt-4 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block tracking-tight">Vendor Name</span>
              <span className="text-blue-600 font-black text-xs block cursor-pointer hover:underline">
                Gulf Fixings & Hardware Trading LLC
              </span>
            </div>
          </div>

          <div className="flex-1 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-slate-200 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Material Description</th>
                  <th className="py-2.5 px-4">Req. Qty</th>
                  <th className="py-2.5 px-4">Lowest Price</th>
                  <th className="py-2.5 px-4">Avg Price</th>
                  <th className="py-2.5 px-4">Prev. Price</th>
                  <th className="py-2.5 px-4">BOQ REF</th>
                  <th className="py-2.5 px-4">Purchase Price / Unit</th>
                  <th className="py-2.5 px-4 text-right pr-4">Total Price</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold text-slate-700 divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/40">
                  <td className="py-3 px-4 text-slate-400 text-center">1</td>
                  <td className="py-3 px-4 text-blue-500 font-black cursor-pointer hover:underline">
                    Concealed Hinge 35mm
                  </td>
                  <td className="py-3 px-4 text-slate-900">20 Nos</td>
                  <td className="py-3 px-4 text-slate-400 font-medium">N/A</td>
                  <td className="py-3 px-4 text-slate-400 font-medium">N/A</td>
                  <td className="py-3 px-4 text-slate-400 font-medium">N/A</td>
                  <td className="py-3 px-4 text-blue-500 font-black cursor-pointer hover:underline">1.1.1</td>
                  <td className="py-3 px-4 text-slate-900 font-mono">AED 25</td>
                  <td className="py-3 px-4 text-slate-900 font-mono text-right pr-4">AED 500</td>
                </tr>
                <tr className="h-8 opacity-20"><td colSpan={9} /></tr>
              </tbody>
            </table>

            <div className="border-t border-slate-100 bg-[#FAFBFB]/50 px-4 py-2.5 flex flex-col items-end gap-1.5 text-[11px] font-bold text-slate-500">
              <div className="flex items-center gap-12">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900 text-right w-20">AED 500</span>
              </div>
              <div className="flex items-center gap-12 font-black text-slate-900">
                <span>Total W/ VAT</span>
                <span className="font-mono text-right w-20">AED 525</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
         6. TRANSACTION CREATION FORM MODAL (REF: Screenshot 2026-06-14 203244.png)
         ========================================================================= */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-3xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden text-slate-800 font-sans border border-slate-100">
            
            {/* Modal Header Title Banner Row */}
            <div className="px-6 pt-5 pb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {transactionMode === 'Revenue' ? (
                  <div className="w-8 h-8 rounded-lg bg-[#E6FBF3] text-[#10B981] flex items-center justify-center font-bold text-base">💵</div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#FFF5F5] text-[#EF4444] flex items-center justify-center font-bold text-base">📉</div>
                )}
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Create {transactionMode === 'Revenue' ? 'a Revenue Source' : (formType === 'RECURRING' ? 'an Expense' : 'an Expense Source')}
                </h2>
              </div>
              <button 
                onClick={() => setIsTransactionModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 font-black text-sm p-1.5 hover:bg-slate-50 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Input Action Form Content Block */}
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                alert(`Successfully Saved ${transactionMode}: ${formName}`); 
                setIsTransactionModalOpen(false); 
              }} 
              className="px-6 pb-6 space-y-4"
            >
              
              {/* Row 1: Structural Type Dropdown Parameter & Single Date Field Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'ONE TIME' | 'RECURRING')}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                  >
                    <option value="ONE TIME">ONE TIME</option>
                    <option value="RECURRING">RECURRING</option>
                  </select>
                </div>

                {formType === 'ONE TIME' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                      Date of {transactionMode}
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 font-semibold rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Row 2: Identifying Description Label Name Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter source identification name..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white font-medium shadow-3xs"
                />
              </div>

              {/* Row 3: Numeric Cost/Income Metric Amount Node Input Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Amount</label>
                <div className="relative rounded-lg shadow-3xs">
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-12 py-2 text-xs font-mono font-black text-slate-900 focus:outline-none focus:bg-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[10px] font-bold text-slate-400">
                    AED
                  </div>
                </div>
              </div>

              {/* RECURRING EXTRA PARAMETERS HOOK SPLIT CONDITIONAL CONTAINER PANEL */}
              {formType === 'RECURRING' && (
                <div className="space-y-4 pt-1">
                  
                  {/* Step A: Choose Interval Period Regularity */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Frequency</label>
                    <select
                      value={formFrequency}
                      onChange={(e) => setFormFrequency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                    >
                      <option value="">SELECT FREQUENCY</option>
                      <option value="Weekly">Weekly Cycle</option>
                      <option value="Bi-Weekly">Bi-Weekly Cycle</option>
                      <option value="Monthly">Monthly Billing</option>
                      <option value="Quarterly">Quarterly Tranche</option>
                    </select>
                  </div>

                  {/* Step B: Start and End Duration Span Parameter Inputs Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Start Date</label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 font-semibold rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase">End Date</label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 font-semibold rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* Bottom Layout Action Submit Footer */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-8 py-2 bg-black hover:bg-slate-900 transition text-white font-bold text-xs rounded-lg uppercase tracking-wider"
                >
                  CREATE
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}