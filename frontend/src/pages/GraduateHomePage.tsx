import React, { useState, useEffect } from 'react';
import InviteCard from '../components/InviteCard';
import EmptyState from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import type { InvitationsResponse, Invitation } from '../types/graduate';

export default function GraduateHomePage() {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { get } = useApi();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvitations = async () => {
      setIsLoading(true);
      try {
        const response = await get<InvitationsResponse>('/graduate/invitations');
        const invitationsData = (response.data as any)?.data || [];
        setInvitations(invitationsData);
      } catch (error) {
        console.error('Error loading invitations:', error);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadInvitations();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const hasInvitados = invitations.length > 0;

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12">
        <div className="h-56 w-full rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
          {imageError ? (
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-2">🏛️</div>
              <p className="text-lg">Campus Universidad del Tolima</p>
            </div>
          ) : (
            <img
              src="/storage/images/campus.jpg"
              alt="Campus Universidad del Tolima"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>

      {/* Card "Disponibilidad de tickets" (col-span-8) */}
      <section className="col-span-12 xl:col-span-8">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <h2 className="font-semibold">Aún tienes disponible algunos tickets</h2>
              <p className="text-slate-600">Puedes agregar a un máximo de 3 personas.</p>
            </div>
            <Button>Agregar invitado</Button>
          </div>
        </div>
      </section>

      {/* Aside "Estado del evento" (col-span-4) */}
      <aside className="col-span-12 xl:col-span-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
          <h3 className="font-semibold mb-4">Estado del Evento</h3>
          <div className="space-y-3 divide-y divide-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-600">Cupos disponibles</span>
              <span className="font-medium text-green-600">245/300</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-slate-600">Fecha</span>
              <span className="font-medium">15 Dic 2024</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-slate-600">Hora</span>
              <span className="font-medium">3:00 PM</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-slate-600">Lugar</span>
              <span className="font-medium">Auditorio 1 – UT</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Sección "Mis invitados" (col-span-12) */}
      <section className="col-span-12">
        <h3 className="font-semibold mb-3">Mis Invitados</h3>
        {hasInvitados ? (
          <div className="grid gap-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
            {invitations.slice(0, 6).map((invitation) => (
              <InviteCard
                key={invitation.id}
                name={`Invitación ${invitation.id}`}
                document={`Estado: ${invitation.status}`}
                seat={invitation.event?.name || `Evento ${invitation.event_id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tienes invitados aún"
            description="Agrega a tus primeros invitados para el evento."
            actionLabel="Agregar invitado"
            onAction={() => console.log('Agregar invitado')}
          />
        )}
      </section>
    </div>
  );
}