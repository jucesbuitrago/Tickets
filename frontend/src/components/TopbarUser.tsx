import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function TopbarUser() {
  const { user } = useAuth();
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-4xl font-semibold">Hola, {user?.name || 'Usuario'}</h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-300 rounded-full overflow-hidden flex items-center justify-center">
          <img
            src={`/storage/images/profile-${user?.id || 'default'}.jpg`}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '👤';
                parent.className = 'w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-sm';
              }
            }}
          />
        </div>
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