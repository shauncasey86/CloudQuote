'use client';

// src/components/layout/Header.tsx

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Search, Moon, Sun, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const { data: session } = useSession();
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 glass-effect border-b border-border-glass flex items-center justify-between px-6 z-30">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="search"
            placeholder="Search quotes, customers..."
            className="w-full pl-10 pr-4 py-2 bg-bg-glass border border-border-glass rounded-lg text-sm focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* User Menu */}
        {session && (
          <div className="flex items-center space-x-3 pl-4 border-l border-border-glass">
            <div className="text-right">
              <div className="text-sm font-medium text-text-primary">
                {session.user.name}
              </div>
              <div className="text-xs text-text-secondary">
                {session.user.role}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
