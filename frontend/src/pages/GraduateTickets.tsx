import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import type { TicketsResponse, Ticket, TicketQrResponse } from '../types/graduate';

const GraduateTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const { get } = useApi();

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: This endpoint might not exist yet, we'll need to add it to the backend
      const response = await get<TicketsResponse>('/graduate/tickets');
      const ticketsData = (response.data as any)?.data || [];
      setTickets(ticketsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleViewQr = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setLoadingQr(true);
    setQrCode(null);

    try {
      const response = await get<TicketQrResponse>(`/graduate/tickets/${ticket.id}/qr`);
      const qrData = (response.data as any)?.data;
      if (qrData?.qr_code) {
        setQrCode(qrData.qr_code);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el código QR');
    } finally {
      setLoadingQr(false);
    }
  };

  const handleShareTicket = async (ticket: Ticket) => {
    const shareData = {
      title: 'Ticket de Evento',
      text: `Ticket para ${ticket.invitation?.event?.name || 'evento'} - ID: ${ticket.id}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback to clipboard
        handleCopyToClipboard(ticket);
      }
    } else {
      handleCopyToClipboard(ticket);
    }
  };

  const handleCopyToClipboard = (ticket: Ticket) => {
    const text = `Ticket ID: ${ticket.id}\nEvento: ${ticket.invitation?.event?.name || 'N/A'}\nEstado: ${ticket.status}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Información del ticket copiada al portapapeles');
    });
  };

  const handleDownloadQr = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrCode}`;
    link.download = `ticket-qr-${selectedTicket?.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="max-w-6xl mx-auto p-6">
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
      <div className="max-w-6xl mx-auto p-6">
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
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Mis Tickets</h1>
        <Button onClick={loadTickets} className="px-6 py-3 text-base lg:text-lg">Actualizar</Button>
      </div>

      {/* QR Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Código QR - Ticket {selectedTicket.id}</h3>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setQrCode(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {loadingQr ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : qrCode ? (
              <div className="text-center">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code"
                  className="mx-auto mb-4"
                />
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleDownloadQr} variant="outline">
                    Descargar QR
                  </Button>
                  <Button onClick={() => handleShareTicket(selectedTicket)}>
                    Compartir
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">No se pudo cargar el código QR</p>
            )}
          </div>
        </div>
      )}

      {/* Tickets List */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl lg:text-3xl">Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No tienes tickets disponibles.
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
                      Evento
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
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.invitation?.event?.name || `Evento ${ticket.invitation?.event_id || 'N/A'}`}
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewQr(ticket)}
                            variant="outline"
                          >
                            Ver QR
                          </Button>
                          <Button
                            onClick={() => handleShareTicket(ticket)}
                            variant="outline"
                          >
                            Compartir
                          </Button>
                        </div>
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

export default GraduateTickets;