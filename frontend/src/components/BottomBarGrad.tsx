import React from 'react';
import { Home, Ticket, User } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', href: '/graduate' },
  { icon: Ticket, label: 'Tickets', href: '/graduate/tickets' },
  { icon: User, label: 'Perfil', href: '/graduate/profile' },
];

export default function BottomBarGrad() {
  return (
    <div className="flex justify-around items-center py-3 px-4">
      {menuItems.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <item.icon size={20} />
          <span className="text-xs font-medium">{item.label}</span>
        </a>
      ))}
    </div>
  );
}