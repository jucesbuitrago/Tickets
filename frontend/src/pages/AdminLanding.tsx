import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/AdminLayout';
import { AdminCard } from '../components/ui/AdminCard';

const modules = [
  {
    id: 'auditorios',
    title: 'Cargue Auditorios',
    description: 'Gestiona los auditorios disponibles para eventos',
    image: '/api/placeholder/400/300', // Placeholder image
  },
  {
    id: 'graduados',
    title: 'Cargue Graduados',
    description: 'Importa y administra la información de graduados',
    image: '/api/placeholder/400/300', // Placeholder image
  },
  {
    id: 'estadisticas',
    title: 'Módulo Estadísticas',
    description: 'Visualiza métricas y reportes del sistema',
    image: '/api/placeholder/400/300', // Placeholder image
  },
  {
    id: 'asientos',
    title: 'Asignar Asientos',
    description: 'Gestiona la asignación de asientos para eventos',
    image: '/api/placeholder/400/300', // Placeholder image
  },
];

const AdminLanding: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleModuleClick = (moduleId: string) => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    switch (moduleId) {
      case 'auditorios':
        navigate('/admin/cargue-auditorios');
        break;
      case 'graduados':
        navigate('/admin/cargue-graduados');
        break;
      case 'estadisticas':
        navigate('/admin/estadisticas');
        break;
      case 'asientos':
        navigate('/admin/asignar-asientos');
        break;
      default:
        break;
    }
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
          onClick={() => navigate('/')}
          className="text-white hover:text-gray-300 transition-colors"
        >
          Salir
        </button>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 w-16 bg-black h-[calc(100vh-3.5rem)] flex flex-col items-center py-6 space-y-6">
        {/* Empty sidebar for landing page */}
      </aside>

      {/* Main Content */}
      <main className="ml-16 mt-14">
        <div className="mx-auto max-w-[1280px] px-6 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">Administrador</h1>
              <p className="text-slate-400">Selecciona un módulo para continuar</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-8">
              {modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className="cursor-pointer group"
                >
                  <AdminCard className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:ring-2 hover:ring-purple-500/50">
                    <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-slate-400 rounded-lg opacity-50"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {module.description}
                      </p>
                    </div>
                  </AdminCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLanding;