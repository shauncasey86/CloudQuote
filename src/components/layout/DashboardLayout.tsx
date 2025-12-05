'use client';

// src/components/layout/DashboardLayout.tsx

import React, { createContext, useContext, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// Sidebar context for mobile toggle
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within DashboardLayout');
  }
  return context;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContextValue: SidebarContextType = {
    isOpen: sidebarOpen,
    setIsOpen: setSidebarOpen,
    toggle: () => setSidebarOpen(prev => !prev),
  };

  return (
    <SessionProvider>
      <SidebarContext.Provider value={sidebarContextValue}>
        <div className="min-h-screen relative">
          <Sidebar />
          <Header />
          <main className="ml-0 md:ml-64 pt-16 min-h-screen">
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarContext.Provider>
    </SessionProvider>
  );
};
