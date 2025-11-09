import React from 'react';
import { QrCode } from 'lucide-react';

interface TicketCardProps {
  eventName: string;
  date: string;
  time: string;
  location: string;
  seat: string;
  qrCode?: string;
  onRefund?: () => void;
  onSend?: () => void;
}

export default function TicketCard({
  eventName,
  date,
  time,
  location,
  seat,
  qrCode,
  onRefund,
  onSend
}: TicketCardProps) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">{eventName}</h2>
        <div className="w-48 h-48 bg-slate-100 rounded-lg mx-auto flex items-center justify-center mb-4">
          {qrCode ? (
            <img src={qrCode} alt="QR Code" className="w-full h-full rounded-lg" />
          ) : (
            <QrCode size={64} className="text-slate-400" />
          )}
        </div>
        <div className="border-t-2 border-dashed border-slate-300 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Fecha:</span>
              <p className="font-medium">{date}</p>
            </div>
            <div>
              <span className="text-slate-600">Hora:</span>
              <p className="font-medium">{time}</p>
            </div>
            <div>
              <span className="text-slate-600">Lugar:</span>
              <p className="font-medium">{location}</p>
            </div>
            <div>
              <span className="text-slate-600">Asiento:</span>
              <p className="font-medium">{seat}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRefund}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors"
        >
          Refund
        </button>
        <button
          onClick={onSend}
          className="flex-1 px-4 py-2 bg-[#FF7A00] text-white rounded-2xl hover:brightness-110 transition-all"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}