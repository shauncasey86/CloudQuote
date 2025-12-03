'use client';

// src/components/layout/Header.tsx

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Search, Moon, Sun, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';

export const Header: React.FC = () => {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-bg-base/80 backdrop-blur-xl border-b border-border-glass flex items-center justify-between px-6 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search quotes, customers..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-bg-elevated hover:bg-bg-surface border border-border-subtle transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-violet-400" />}
        </button>

        {/* User Menu */}
        {session && (
          <div className="relative pl-3 ml-3 border-l border-border-glass" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-bg-elevated transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-text-primary leading-tight">
                  {session.user.name}
                </div>
                <div className="text-xs text-text-muted">
                  {session.user.role}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 dropdown-menu animate-slideUp">
                <div className="p-3 border-b border-border-glass">
                  <div className="text-sm font-semibold text-text-primary">{session.user.name}</div>
                  <div className="text-xs text-text-muted truncate">{session.user.email}</div>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-text-muted" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full dropdown-item text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
