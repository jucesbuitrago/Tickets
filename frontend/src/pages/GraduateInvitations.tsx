import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApi } from '../hooks/useApi';
import type {
  InvitationsResponse,
  Invitation,
  CreateInvitationRequest,
  CreateInvitationResponse,
  DeleteInvitationResponse
} from '../types/graduate';

export default function GraduateInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const [deletingInvitationId, setDeletingInvitationId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventId, setEventId] = useState('');

  const { get, post, delete: del } = useApi();

  const loadInvitations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get<InvitationsResponse>('/graduate/invitations');
      const invitationsData = (response.data as any)?.data || [];
      setInvitations(invitationsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las invitaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleCreateInvitation = async () => {
    if (!eventId.trim()) {
      setError('El ID del evento es requerido');
      return;
    }

    setCreatingInvitation(true);
    setError(null);

    try {
      const request: CreateInvitationRequest = {
        event_id: parseInt(eventId)
      };

      await post<CreateInvitationResponse>('/graduate/invitations', request);
      setEventId('');
      setShowCreateForm(false);
      await loadInvitations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la invitación');
    } finally {
      setCreatingInvitation(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta invitación? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingInvitationId(invitationId);
    setError(null);

    try {
      await del<DeleteInvitationResponse>(`/graduate/invitations/${invitationId}`);
      await loadInvitations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar la invitación');
    } finally {
      setDeletingInvitationId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
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
      case 'CREATED':
        return 'Creada';
      case 'USED':
        return 'Usada';
      case 'REVOKED':
        return 'Revocada';
      case 'EXPIRED':
        return 'Expirada';
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
            <p className="mt-4 text-gray-600">Cargando invitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-slate-900">Mis Invitaciones</h1>
        <div className="flex gap-4">
          <Button onClick={loadInvitations}>Actualizar</Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancelar' : 'Crear Invitación'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="col-span-12 rounded-2xl bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create Invitation Form */}
      {showCreateForm && (
        <div className="col-span-12">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Crear Nueva Invitación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="eventId" className="block text-sm font-medium text-slate-700">
                  ID del Evento
                </label>
                <Input
                  id="eventId"
                  type="number"
                  placeholder="Ingresa el ID del evento"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateInvitation}
                  disabled={creatingInvitation}
                  className="w-full h-12 font-semibold"
                >
                  {creatingInvitation ? 'Creando...' : 'Crear Invitación'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invitations List */}
      <div className="col-span-12">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Invitaciones ({invitations.length})</h2>
          {invitations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No tienes invitaciones creadas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Invitación
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
                  {invitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invitation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invitation.event?.name || `Evento ${invitation.event_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                          {getStatusText(invitation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {invitation.status === 'CREATED' && (
                          <Button
                            onClick={() => handleDeleteInvitation(invitation.id)}
                            disabled={deletingInvitationId === invitation.id}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {deletingInvitationId === invitation.id ? 'Eliminando...' : 'Eliminar'}
                          </Button>
                        )}
                        {invitation.status === 'REVOKED' && (
                          <span className="text-gray-400">Eliminada</span>
                        )}
                        {invitation.status === 'USED' && (
                          <span className="text-blue-600">Usada</span>
                        )}
                        {invitation.status === 'EXPIRED' && (
                          <span className="text-gray-600">Expirada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}