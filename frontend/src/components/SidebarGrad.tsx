import React from 'react';
import { Home, Bookmark, Ticket, Bell, User } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', href: '/graduate' },
  { icon: Bookmark, label: 'Guardados', href: '/graduate/saved' },
  { icon: Ticket, label: 'Tickets', href: '/graduate/tickets' },
  { icon: Bell, label: 'Notificaciones', href: '/graduate/notifications' },
  { icon: User, label: 'Perfil', href: '/graduate/profile' },
];

export default function SidebarGrad() {
  return (
    <div className="space-y-2">
      {menuItems.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <item.icon size={20} />
          <span className="font-medium">{item.label}</span>
        </a>
      ))}
    </div>
  );
}