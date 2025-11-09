import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import type { DashboardAforoResponse } from '../types/admin';

const OccupancyDashboard = () => {
  const [data, setData] = useState<DashboardAforoResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { get } = useApi();

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get<DashboardAforoResponse>('/admin/dashboard/aforo');
      setData((response.data as any)?.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getOccupancyBgColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-100';
    if (rate >= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (isLoading && !data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando métricas de aforo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadDashboardData}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 lg:p-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Dashboard de Aforo</h1>
        <div className="flex items-center gap-6">
          {lastUpdated && (
            <span className="text-base text-gray-500">
              Última actualización: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={loadDashboardData} disabled={isLoading} className="px-6 py-3 text-base lg:text-lg">
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* Global Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{data.total_events}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Auditorios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{data.total_auditoriums}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Capacidad Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{data.total_capacity.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ocupación Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getOccupancyColor(data.occupancy_rate)}`}>
                  {data.total_occupancy.toLocaleString()} ({data.occupancy_rate.toFixed(1)}%)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Details */}
          <div className="space-y-6">
            {data.events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{event.name}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Auditorios</p>
                      <p className="text-lg font-semibold">{event.auditoriums_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Capacidad Total</p>
                      <p className="text-lg font-semibold">{event.total_capacity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ocupación Actual</p>
                      <p className="text-lg font-semibold">{event.total_occupancy.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tasa de Ocupación</p>
                      <p className={`text-lg font-semibold ${getOccupancyColor(event.occupancy_rate)}`}>
                        {event.occupancy_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Auditoriums List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Auditorios</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {event.auditoriums.map((auditorium) => (
                        <div
                          key={auditorium.id}
                          className={`p-4 rounded-lg border ${getOccupancyBgColor(auditorium.occupancy_rate)}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{auditorium.name}</h5>
                            <span className={`text-sm font-medium ${getOccupancyColor(auditorium.occupancy_rate)}`}>
                              {auditorium.occupancy_rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Capacidad: {auditorium.capacity}</p>
                            <p>Ocupación: {auditorium.current_occupancy}</p>
                            <p>Disponible: {auditorium.available_capacity}</p>
                          </div>
                          <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                auditorium.occupancy_rate >= 90 ? 'bg-red-500' :
                                auditorium.occupancy_rate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(auditorium.occupancy_rate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OccupancyDashboard;