import React from 'react';
import { Home, Bookmark, Ticket, Bell, User } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', href: '/graduate' },
  { icon: Bookmark, label: 'Guardados', href: '/graduate/saved' },
  { icon: Ticket, label: 'Tickets', href: '/graduate/tickets' },
  { icon: Bell, label: 'Notificaciones', href: '/graduate/notifications' },
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