import { Link, Outlet } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-12">Dashboard de Administración</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl">Importar Graduandos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-gray-600 leading-relaxed">
                Sube un archivo Excel con la lista de graduandos y sus cupos permitidos.
              </p>
              <Link to="/admin/import-graduates">
                <Button className="w-full lg:w-auto">Ir a Importar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl">Crear Eventos/Auditorios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-gray-600 leading-relaxed">
                Crea nuevos eventos y configura auditorios con capacidad.
              </p>
              <Link to="/admin/create-event-auditorium">
                <Button className="w-full lg:w-auto">Ir a Crear</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl">Dashboard de Aforo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-gray-600 leading-relaxed">
                Visualiza métricas en tiempo real del aforo de eventos y auditorios.
              </p>
              <Link to="/admin/occupancy-dashboard">
                <Button className="w-full lg:w-auto">Ver Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl">Lista de Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-gray-600 leading-relaxed">
                Gestiona tickets, revoca acceso y visualiza el estado.
              </p>
              <Link to="/admin/tickets-list">
                <Button className="w-full lg:w-auto">Ver Tickets</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;