import React from 'react';
import AppLayout from '../components/AppLayout';
import InviteListItem from '../components/InviteListItem';
import EmptyState from '../components/EmptyState';

const mockInvitados = [
  { name: 'Sara López', document: 'CC 12345678', seat: 'K11' },
  { name: 'Samalito Pérez', document: 'CC 87654321', seat: 'K12' },
];

export default function HomeGraduado() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="col-span-12">
          <div className="h-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl overflow-hidden">
            <img
              src="/api/placeholder/800/192"
              alt="Campus"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info cupos */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-7">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Aún tienes disponible algunos tickets
                </h2>
                <p className="text-slate-600">
                  Puedes agregar hasta 3 personas más a tu lista de invitados.
                </p>
              </div>
              <a href="/graduate/add-guest" className="px-5 py-3 bg-[#D71920] text-white rounded-2xl hover:bg-[#b9151b] transition-colors inline-block">
                Agregar invitado
              </a>
            </div>
          </div>
        </div>

        {/* Lista de invitados */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-7">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Mis Invitados</h3>
          {mockInvitados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockInvitados.map((invitado, index) => (
                <InviteListItem
                  key={index}
                  name={invitado.name}
                  document={invitado.document}
                  seat={invitado.seat}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tienes invitados aún"
              description="Agrega personas a tu lista de invitados para compartir este momento especial."
              actionLabel="Agregar invitado"
              onAction={() => window.location.href = '/graduate/add-guest'}
            />
          )}
        </div>

        {/* Aside */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Estado del Evento</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Cupos disponibles</span>
                <span className="font-medium">245/300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fecha del evento</span>
                <span className="font-medium">15 Dic 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Hora</span>
                <span className="font-medium">3:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}