import React from 'react';
import SidebarGrad from './SidebarGrad';
import TopbarUser from './TopbarUser';
import BottomBarGrad from './BottomBarGrad';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-8 lg:px-6 md:px-4 sm:px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar (hidden en <lg) */}
          <aside className="hidden lg:block col-span-3 xl:col-span-3 sticky top-0 h-screen bg-white border-r rounded-r-2xl p-4">
            <SidebarGrad />
          </aside>

          {/* Main */}
          <main className="col-span-12 lg:col-span-9 py-6">
            <TopbarUser />
            {children}
          </main>
        </div>
      </div>

      {/* Bottom bar solo en mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <BottomBarGrad />
      </nav>
    </div>
  );
}