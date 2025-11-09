import React from 'react';
import { Menu } from 'lucide-react';

export default function TopbarUser() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Hola, Paula</h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}