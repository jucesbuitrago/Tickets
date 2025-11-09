import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useApi } from '../hooks/useApi';
import type {
  CreateEventRequest,
  CreateEventResponse,
  CreateAuditoriumRequest,
  CreateAuditoriumResponse
} from '../types/admin';

interface Event {
  id: number;
  name: string;
  date: string;
  status: string;
}

const CreateEventAuditorium = () => {
  const [activeTab, setActiveTab] = useState<'event' | 'auditorium'>('event');
  const [events, setEvents] = useState<Event[]>([]);

  // Event form state
  const [eventForm, setEventForm] = useState<CreateEventRequest>({
    name: '',
    date: '',
    status: 'ACTIVE'
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventResult, setEventResult] = useState<CreateEventResponse | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  // Auditorium form state
  const [auditoriumForm, setAuditoriumForm] = useState<CreateAuditoriumRequest>({
    event_id: 0,
    name: '',
    capacity: 0
  });
  const [isCreatingAuditorium, setIsCreatingAuditorium] = useState(false);
  const [auditoriumResult, setAuditoriumResult] = useState<CreateAuditoriumResponse | null>(null);
  const [auditoriumError, setAuditoriumError] = useState<string | null>(null);

  const { post, get } = useApi();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Note: This endpoint might not exist yet, we'll need to add it to the backend
      const response = await get('/admin/events');
      setEvents((response.data as any)?.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setEventError(null);
    setEventResult(null);

    try {
      const response = await post<CreateEventResponse>('/admin/events', eventForm);
      setEventResult(response.data.data);
      setEventForm({ name: '', date: '', status: 'ACTIVE' });
      loadEvents(); // Reload events list
    } catch (err: any) {
      setEventError(err.response?.data?.message || 'Error al crear el evento');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleAuditoriumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAuditorium(true);
    setAuditoriumError(null);
    setAuditoriumResult(null);

    try {
      const response = await post<CreateAuditoriumResponse>('/admin/auditoriums', auditoriumForm);
      setAuditoriumResult(response.data.data);
      setAuditoriumForm({ event_id: 0, name: '', capacity: 0 });
    } catch (err: any) {
      setAuditoriumError(err.response?.data?.message || 'Error al crear el auditorio');
    } finally {
      setIsCreatingAuditorium(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Eventos y Auditorios</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('event')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'event'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Crear Evento
            </button>
            <button
              onClick={() => setActiveTab('auditorium')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'auditorium'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Crear Auditorio
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'event' && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">
                  Nombre del Evento
                </label>
                <Input
                  id="eventName"
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  required
                  placeholder="Ej: Graduación 2025"
                />
              </div>

              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                  Fecha del Evento
                </label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label htmlFor="eventStatus" className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="eventStatus"
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <Button type="submit" disabled={isCreatingEvent}>
                {isCreatingEvent ? 'Creando...' : 'Crear Evento'}
              </Button>
            </form>

            {eventError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{eventError}</p>
              </div>
            )}

            {eventResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">{eventResult.message}</p>
                {eventResult.data && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>ID: {eventResult.data.id}</p>
                    <p>Nombre: {eventResult.data.name}</p>
                    <p>Fecha: {new Date(eventResult.data.date).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'auditorium' && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Auditorio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuditoriumSubmit} className="space-y-4">
              <div>
                <label htmlFor="eventSelect" className="block text-sm font-medium text-gray-700">
                  Evento
                </label>
                <select
                  id="eventSelect"
                  value={auditoriumForm.event_id}
                  onChange={(e) => setAuditoriumForm({ ...auditoriumForm, event_id: parseInt(e.target.value) })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={0}>Seleccionar evento...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="auditoriumName" className="block text-sm font-medium text-gray-700">
                  Nombre del Auditorio
                </label>
                <Input
                  id="auditoriumName"
                  type="text"
                  value={auditoriumForm.name}
                  onChange={(e) => setAuditoriumForm({ ...auditoriumForm, name: e.target.value })}
                  required
                  placeholder="Ej: Auditorio Principal"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacidad
                </label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="10000"
                  value={auditoriumForm.capacity}
                  onChange={(e) => setAuditoriumForm({ ...auditoriumForm, capacity: parseInt(e.target.value) })}
                  required
                  placeholder="Ej: 500"
                />
              </div>

              <Button type="submit" disabled={isCreatingAuditorium}>
                {isCreatingAuditorium ? 'Creando...' : 'Crear Auditorio'}
              </Button>
            </form>

            {auditoriumError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{auditoriumError}</p>
              </div>
            )}

            {auditoriumResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">{auditoriumResult.message}</p>
                {auditoriumResult.data && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>ID: {auditoriumResult.data.id}</p>
                    <p>Nombre: {auditoriumResult.data.name}</p>
                    <p>Capacidad: {auditoriumResult.data.capacity}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateEventAuditorium;