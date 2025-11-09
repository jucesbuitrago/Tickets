import React from 'react';
import AppLayout from '../components/AppLayout';
import TicketCard from '../components/TicketCard';

export default function TicketView() {
  const handleRefund = () => {
    console.log('Refund ticket');
  };

  const handleSend = () => {
    console.log('Send ticket');
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Ticket Card */}
        <div className="col-span-12 lg:col-span-6">
          <TicketCard
            eventName="Ceremonia de Graduación"
            date="15 Dic 2024"
            time="3:00 PM"
            location="Teatro Principal"
            seat="K11"
            onRefund={handleRefund}
            onSend={handleSend}
          />
        </div>

        {/* Details */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Detalles del Evento</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-600 block text-sm mb-1">Ceremonia</span>
                <span className="font-medium">Graduación 2024</span>
              </div>
              <div>
                <span className="text-slate-600 block text-sm mb-1">Teatro</span>
                <span className="font-medium">Principal</span>
              </div>
              <div>
                <span className="text-slate-600 block text-sm mb-1">Fecha/Hora</span>
                <span className="font-medium">15 Dic 2024, 3:00 PM</span>
              </div>
              <div>
                <span className="text-slate-600 block text-sm mb-1">Sala</span>
                <span className="font-medium">Aula Magna</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600 block text-sm mb-1">Asiento</span>
                <span className="font-medium">K11</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}