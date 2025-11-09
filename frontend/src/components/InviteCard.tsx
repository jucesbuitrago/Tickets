import React from 'react';
import Badge from './ui/Badge';

interface InviteCardProps {
  name: string;
  document: string;
  seat: string;
  avatar?: string;
}

export default function InviteCard({ name, document, seat, avatar }: InviteCardProps) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-300 rounded-full flex-shrink-0">
          {avatar && <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
          <p className="text-sm text-slate-600">{document}</p>
        </div>
        <Badge>
          {seat}
        </Badge>
      </div>
    </div>
  );
}