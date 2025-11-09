import { Link, Outlet } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard de Administración</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Importar Graduandos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Sube un archivo Excel con la lista de graduandos y sus cupos permitidos.
              </p>
              <Link to="/admin/import-graduates">
                <Button>Ir a Importar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crear Eventos/Auditorios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Crea nuevos eventos y configura auditorios con capacidad.
              </p>
              <Link to="/admin/create-event-auditorium">
                <Button>Ir a Crear</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Aforo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Visualiza métricas en tiempo real del aforo de eventos y auditorios.
              </p>
              <Link to="/admin/occupancy-dashboard">
                <Button>Ver Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Gestiona tickets, revoca acceso y visualiza el estado.
              </p>
              <Link to="/admin/tickets-list">
                <Button>Ver Tickets</Button>
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