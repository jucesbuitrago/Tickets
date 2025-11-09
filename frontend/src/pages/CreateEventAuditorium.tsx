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
    <div className="max-w-6xl mx-auto p-8 lg:p-12">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">Crear Eventos y Auditorios</h1>

      <div className="mb-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-12">
            <button
              onClick={() => setActiveTab('event')}
              className={`py-3 px-2 border-b-2 font-semibold text-base lg:text-lg transition-colors ${
                activeTab === 'event'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Crear Evento
            </button>
            <button
              onClick={() => setActiveTab('auditorium')}
              className={`py-3 px-2 border-b-2 font-semibold text-base lg:text-lg transition-colors ${
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
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl lg:text-3xl">Crear Nuevo Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEventSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="eventName" className="block text-base lg:text-lg font-medium text-gray-700">
                  Nombre del Evento
                </label>
                <Input
                  id="eventName"
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  required
                  placeholder="Ej: Graduación 2025"
                  className="h-12 text-base lg:text-lg"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="eventDate" className="block text-base lg:text-lg font-medium text-gray-700">
                  Fecha del Evento
                </label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="h-12 text-base lg:text-lg"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="eventStatus" className="block text-base lg:text-lg font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="eventStatus"
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                  className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base lg:text-lg"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <Button type="submit" disabled={isCreatingEvent} className="h-12 px-8 text-base lg:text-lg font-semibold">
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
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl lg:text-3xl">Crear Nuevo Auditorio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuditoriumSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="eventSelect" className="block text-base lg:text-lg font-medium text-gray-700">
                  Evento
                </label>
                <select
                  id="eventSelect"
                  value={auditoriumForm.event_id}
                  onChange={(e) => setAuditoriumForm({ ...auditoriumForm, event_id: parseInt(e.target.value) })}
                  required
                  className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base lg:text-lg"
                >
                  <option value={0}>Seleccionar evento...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="auditoriumName" className="block text-base lg:text-lg font-medium text-gray-700">
                  Nombre del Auditorio
                </label>
                <Input
                  id="auditoriumName"
                  type="text"
                  value={auditoriumForm.name}
                  onChange={(e) => setAuditoriumForm({ ...auditoriumForm, name: e.target.value })}
                  required
                  placeholder="Ej: Auditorio Principal"
                  className="h-12 text-base lg:text-lg"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-base lg:text-lg font-medium text-gray-700">
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
                  className="h-12 text-base lg:text-lg"
                />
              </div>

              <Button type="submit" disabled={isCreatingAuditorium} className="h-12 px-8 text-base lg:text-lg font-semibold">
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