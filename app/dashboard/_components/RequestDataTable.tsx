'use client';

import React from 'react';

// Define the shape of your Material Request
interface MRRow {
  id: number;
  date: string;
  mr_number: string;
  requestor_name: string;
  value: number;
  status: 'Paid' | 'Unpaid';
}

interface RequestDataTableProps {
  mrs: MRRow[];
  onRowClick: (id: number) => void;
  activeId?: number;
}

export default function RequestDataTable({ mrs, onRowClick, activeId }: RequestDataTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-slate-200 text-[11px] font-black text-slate-900 uppercase">
            <th className="py-3 px-4">Required Date</th>
            <th className="py-3 px-4">MR Number</th>
            <th className="py-3 px-4">Requester</th>
            <th className="py-3 px-4 text-right">Value (Incl. VAT)</th>
            <th className="py-3 px-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="text-xs font-bold text-slate-800">
          {mrs.map((mr) => (
            <tr 
              key={mr.id} 
              onClick={() => onRowClick(mr.id)} 
              className={`hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition ${
                activeId === mr.id ? 'bg-blue-50/50' : ''
              }`}
            >
              <td className="py-4 px-4 text-slate-500">{mr.date}</td>
              <td className="py-4 px-4 font-black text-blue-600">{mr.mr_number}</td>
              <td className="py-4 px-4">{mr.requestor_name}</td>
              <td className="py-4 px-4 text-right font-mono">
                AED {Number(mr.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="py-4 px-4 text-center">
                <span className={`px-3 py-1 rounded-full border text-[10px] ${
                  mr.status === 'Paid' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {mr.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}