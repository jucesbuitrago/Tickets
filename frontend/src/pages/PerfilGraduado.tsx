import React from 'react';
import { Settings, MessageSquare, HelpCircle, Headphones } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PerfilGraduado() {
  const { user } = useAuth();
  return (
    <div className="grid grid-cols-12 gap-8">
        {/* Header */}
        <div className="col-span-12 flex justify-between items-center">
          <h1 className="text-4xl font-semibold text-slate-900">Perfil</h1>
          <div className="flex gap-2">
            <button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D71920]/40"
              aria-label="Configuración"
            >
              <Settings size={20} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#D71920]/40"
              aria-label="Mensajes"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-300 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                <img
                  src={`/storage/images/profile-${user?.id || 'default'}.jpg`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = document.createElement('div');
                      icon.innerHTML = '👤';
                      icon.className = 'text-2xl';
                      parent.appendChild(icon);
                    }
                  }}
                />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-1">{user?.name || 'Usuario'}</h2>
              <p className="text-slate-600">Próxima graduada</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="col-span-12 xl:col-span-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <HelpCircle size={20} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Saved</h3>
                  <p className="text-sm text-slate-600">Elementos guardados</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <HelpCircle size={20} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Help Center</h3>
                  <p className="text-sm text-slate-600">Centro de ayuda</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Headphones size={20} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Customer Service</h3>
                  <p className="text-sm text-slate-600">Servicio al cliente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}