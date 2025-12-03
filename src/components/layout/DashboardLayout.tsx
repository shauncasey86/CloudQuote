'use client';

// src/components/layout/DashboardLayout.tsx

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-bg-base">
        <Sidebar />
        <Header />
        <main className="ml-64 pt-16 min-h-screen">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
};
