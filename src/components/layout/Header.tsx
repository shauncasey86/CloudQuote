'use client';

// src/components/layout/Header.tsx

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, Moon, Sun, LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useSidebar } from './DashboardLayout';

export const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { toggle: toggleSidebar } = useSidebar();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const isLoading = status === 'loading';
  const router = useRouter();

  const menuItems = React.useRef<(HTMLElement | null)[]>([]);

  // Close menu when clicking outside and handle keyboard navigation
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!userMenuOpen) return;

      switch (event.key) {
        case 'Escape':
          setUserMenuOpen(false);
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < menuItems.current.length - 1 ? prev + 1 : 0;
            menuItems.current[next]?.focus();
            return next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : menuItems.current.length - 1;
            menuItems.current[next]?.focus();
            return next;
          });
          break;
        case 'Tab':
          // Close menu on tab out
          setUserMenuOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  // Reset focus index when menu closes
  React.useEffect(() => {
    if (!userMenuOpen) {
      setFocusedIndex(-1);
    }
  }, [userMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/quotes?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-bg-base/80 backdrop-blur-xl border-b border-border-glass flex items-center justify-between px-4 md:px-6 z-30">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-xl bg-bg-elevated hover:bg-bg-surface border border-border-subtle transition-all mr-3"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5 text-text-primary" />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md" role="search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search quotes, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search quotes and customers"
            className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all placeholder:text-text-muted"
          />
        </div>
      </form>

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
        <div className="relative pl-3 ml-3 border-l border-border-glass" ref={menuRef}>
          {isLoading ? (
            /* Loading skeleton */
            <div className="flex items-center gap-3 p-1.5 pr-3">
              <div className="w-9 h-9 rounded-xl bg-bg-elevated animate-pulse" />
              <div className="hidden sm:block space-y-1.5">
                <div className="w-20 h-3 bg-bg-elevated rounded animate-pulse" />
                <div className="w-12 h-2.5 bg-bg-elevated rounded animate-pulse" />
              </div>
            </div>
          ) : session ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-bg-elevated transition-all focus:outline-none focus:ring-2 focus:ring-gold/50"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-text-primary leading-tight">
                    {session.user.name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {session.user.role}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 dropdown-menu animate-slideUp"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="p-3 border-b border-border-glass">
                    <div className="text-sm font-semibold text-text-primary">{session.user.name}</div>
                    <div className="text-xs text-text-muted truncate">{session.user.email}</div>
                  </div>
                  <div className="py-1" role="none">
                    <Link
                      href="/settings"
                      className="dropdown-item focus:bg-bg-glass-light focus:outline-none"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                      tabIndex={focusedIndex === 0 ? 0 : -1}
                      ref={(el) => { menuItems.current[0] = el; }}
                    >
                      <Settings className="w-4 h-4 text-text-muted" aria-hidden="true" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full dropdown-item text-red-400 hover:text-red-300 focus:bg-bg-glass-light focus:outline-none"
                      role="menuitem"
                      tabIndex={focusedIndex === 1 ? 0 : -1}
                      ref={(el) => { menuItems.current[1] = el; }}
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};
