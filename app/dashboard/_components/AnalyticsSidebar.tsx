'use client';

import React from 'react';
import { CostNode } from '../actions'; // Adjust path based on your folder structure

export default function AnalyticsSidebar({ tree }: { tree: CostNode[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs">
      <h2 className="text-sm font-black text-slate-900 mb-4">Material Analytics</h2>
      <div className="text-[11px] text-slate-400 font-bold uppercase italic">
        Tree structure loading...
      </div>
      {/* Recursion logic will go here once you're ready */}
    </div>
  );
}