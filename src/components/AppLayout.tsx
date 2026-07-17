'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={`flex flex-col min-h-screen content-transition ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <Topbar sidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 max-w-screen-2xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}