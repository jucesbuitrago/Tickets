import React from 'react';
import SidebarGrad from './SidebarGrad';
import TopbarUser from './TopbarUser';
import BottomBarGrad from './BottomBarGrad';
import { useAuth } from '../hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  return (
    <div className="min-h-dvh w-dvw bg-slate-50 text-slate-900">
      {/* Sidebar fija (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-white border-r">
        <SidebarGrad />
      </aside>

      {/* Contenido desplazado por la sidebar */}
      <main className="min-h-dvh w-full lg:pl-72">
        {/* Topbar pegajoso */}
        <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur px-6 lg:px-10 py-5">
          <TopbarUser />
        </header>

        {/* Zona de páginas */}
        <div className="px-6 lg:px-10 py-8">
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </div>
      </main>

      {/* Bottom bar en mobile */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t">
        <BottomBarGrad />
      </nav>
    </div>
  );
}