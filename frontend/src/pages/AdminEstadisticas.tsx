import React from 'react';
import { AdminCard } from '../components/ui/AdminCard';

const AdminEstadisticas: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black h-14 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">UT</span>
          </div>
          <h1 className="text-white font-semibold">Universidad del Tolima</h1>
        </div>
        <button className="text-white hover:text-gray-300 transition-colors">
          Salir
        </button>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 w-16 bg-black h-[calc(100vh-3.5rem)] flex flex-col items-center py-6 space-y-6">
        {/* Navigation items would go here */}
      </aside>

      {/* Main Content */}
      <main className="ml-16 mt-14">
        <div className="mx-auto max-w-[1280px] px-6 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">Módulo Estadísticas</h1>
              <p className="text-slate-400">Próximamente disponible</p>
            </div>

            <AdminCard className="flex items-center justify-center h-96">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Próximamente</h2>
                <p className="text-slate-600">Esta funcionalidad estará disponible en futuras versiones</p>
              </div>
            </AdminCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEstadisticas;