import React from 'react';
import { Menu } from 'lucide-react';

export default function TopbarUser() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-4xl font-semibold">Hola, Paula</h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
        <button
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D71920]/40"
          aria-label="Menú"
        >
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}