'use client';

// src/components/layout/Header.tsx

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, Moon, Sun, LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react';
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
    <header className="fixed top-0 left-0 md:left-56 right-0 h-14 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 z-30">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-md hover:bg-bg-canvas transition-colors mr-2"
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
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search quotes"
            className="w-full pl-9 pr-3 py-1.5 bg-bg-input border border-border-subtle rounded-md text-sm focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-muted"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-bg-canvas transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-text-secondary" />}
        </button>

        {/* User Menu */}
        <div className="relative pl-2 ml-2 border-l border-border-subtle" ref={menuRef}>
          {isLoading ? (
            <div className="flex items-center gap-2 p-1">
              <div className="w-8 h-8 rounded-md bg-bg-canvas animate-pulse" />
              <div className="hidden sm:block w-16 h-4 bg-bg-canvas rounded animate-pulse" />
            </div>
          ) : session ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-md hover:bg-bg-canvas transition-colors focus:outline-none focus:ring-2 focus:ring-text-primary/20"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-md bg-bg-canvas flex items-center justify-center">
                  <User className="w-4 h-4 text-text-secondary" aria-hidden="true" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-text-primary leading-tight">
                    {session.user.name}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 dropdown-menu animate-fadeIn"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="p-2 border-b border-border-subtle">
                    <div className="text-sm font-medium text-text-primary">{session.user.name}</div>
                    <div className="text-xs text-text-muted truncate">{session.user.email}</div>
                  </div>
                  <div className="py-1" role="none">
                    <Link
                      href="/settings"
                      className="dropdown-item focus:bg-bg-canvas focus:outline-none"
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
                      className="w-full dropdown-item text-danger hover:bg-bg-canvas focus:bg-bg-canvas focus:outline-none"
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
