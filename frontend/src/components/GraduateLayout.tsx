import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarGrad from './SidebarGrad';
import TopbarUser from './TopbarUser';
import BottomBarGrad from './BottomBarGrad';

export default function GraduateLayout() {
  return (
    <div className="min-h-dvh w-full bg-slate-50 text-slate-900 antialiased">
      {/* Sidebar fija (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-white border-r">
        <SidebarGrad />
      </aside>

      {/* Main desplazado por sidebar */}
      <main className="min-h-dvh w-full lg:pl-72">
        {/* Topbar sticky */}
        <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur py-5">
          <div className="mx-auto max-w-screen-2xl px-10">
            <TopbarUser />
          </div>
        </header>

        {/* Zona de páginas */}
        <div className="px-10 py-8">
          <div className="mx-auto max-w-screen-2xl">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Bottom bar en mobile */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t">
        <BottomBarGrad />
      </nav>
    </div>
  );
}