import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApi } from '../hooks/useApi';
import type { TicketsListResponse, Ticket, RevokeTicketResponse } from '../types/admin';

const TicketsList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [revokingTicketId, setRevokingTicketId] = useState<number | null>(null);

  const { get, delete: del } = useApi();

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: This endpoint might not exist yet, we'll need to add it to the backend
      const response = await get<TicketsListResponse>('/admin/tickets');
      const ticketData = (response.data as any)?.data || [];
      setTickets(ticketData);
      setFilteredTickets(ticketData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la lista de tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.invitation?.graduate_id?.toString().includes(searchTerm) ||
        ticket.id.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter]);

  const handleRevokeTicket = async (ticketId: number) => {
    setRevokingTicketId(ticketId);

    try {
      await del<RevokeTicketResponse>(`/admin/tickets/${ticketId}/revoke`);
      // Reload tickets after revocation
      await loadTickets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al revocar el ticket');
    } finally {
      setRevokingTicketId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'USED':
        return 'text-blue-600 bg-blue-100';
      case 'REVOKED':
        return 'text-red-600 bg-red-100';
      case 'EXPIRED':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'USED':
        return 'Usado';
      case 'REVOKED':
        return 'Revocado';
      case 'EXPIRED':
        return 'Expirado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando tickets...</p>
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
              <Button onClick={loadTickets}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 lg:p-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Lista de Tickets</h1>
        <Button onClick={loadTickets} className="px-6 py-3 text-base lg:text-lg">Actualizar</Button>
      </div>

      {/* Filters */}
      <Card className="mb-12 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="search" className="block text-base lg:text-lg font-medium text-gray-700">
                Buscar por ID de ticket o graduando
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 text-base lg:text-lg"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="statusFilter" className="block text-base lg:text-lg font-medium text-gray-700">
                Filtrar por estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base lg:text-lg"
              >
                <option value="ALL">Todos</option>
                <option value="ACTIVE">Activos</option>
                <option value="USED">Usados</option>
                <option value="REVOKED">Revocados</option>
                <option value="EXPIRED">Expirados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl lg:text-3xl">Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No se encontraron tickets con los filtros aplicados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Graduando
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auditorio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.invitation?.graduate_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.invitation?.event_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.invitation?.auditorium_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {ticket.status === 'ACTIVE' && (
                          <Button
                            onClick={() => handleRevokeTicket(ticket.id)}
                            disabled={revokingTicketId === ticket.id}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {revokingTicketId === ticket.id ? 'Revocando...' : 'Revocar'}
                          </Button>
                        )}
                        {ticket.status === 'REVOKED' && (
                          <span className="text-gray-400">Revocado</span>
                        )}
                        {ticket.status === 'USED' && (
                          <span className="text-blue-600">Usado</span>
                        )}
                        {ticket.status === 'EXPIRED' && (
                          <span className="text-gray-600">Expirado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsList;