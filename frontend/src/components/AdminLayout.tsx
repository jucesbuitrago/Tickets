import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Home,
  Layers,
  Upload,
  BarChart3,
  Calendar,
  LogOut,
  ChevronLeft
} from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '/admin', icon: Home },
  { name: 'Módulos', href: '/admin/modulos', icon: Layers },
  { name: 'Cargue de datos', href: '/admin/cargue', icon: Upload },
  { name: 'Estadísticas', href: '/admin/estadisticas', icon: BarChart3 },
  { name: 'Agenda/Eventos', href: '/admin/agenda', icon: Calendar },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <button
          onClick={handleLogout}
          className="text-white hover:text-gray-300 transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 w-16 bg-black h-[calc(100vh-3.5rem)] flex flex-col items-center py-6 space-y-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-purple-600 transition-colors group"
              title={item.name}
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </Link>
          );
        })}
      </aside>

      {/* Main Content */}
      <main className="ml-16 mt-14">
        <div className="mx-auto max-w-[1280px] px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}