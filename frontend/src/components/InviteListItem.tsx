import React from 'react';

interface InviteListItemProps {
  name: string;
  document: string;
  seat: string;
  avatar?: string;
}

export default function InviteListItem({ name, document, seat, avatar }: InviteListItemProps) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-300 rounded-full flex-shrink-0">
          {avatar && <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
          <p className="text-sm text-slate-600">{document}</p>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
            {seat}
          </span>
        </div>
      </div>
    </div>
  );
}