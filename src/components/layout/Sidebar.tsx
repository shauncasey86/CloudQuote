'use client';

// src/components/layout/Sidebar.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Role } from '@prisma/client';
import { useSidebar } from './DashboardLayout';
import {
  FileText,
  Package,
  Settings,
  Users,
  Home,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/quotes',
    label: 'Quotes',
    icon: FileText,
  },
  {
    href: '/products',
    label: 'Products',
    icon: Package,
  },
  {
    href: '/settings/house-types',
    label: 'House Types',
    icon: Home,
    adminOnly: true,
  },
  {
    href: '/settings/users',
    label: 'Users',
    icon: Users,
    adminOnly: true,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isOpen, setIsOpen } = useSidebar();
  const isLoading = status === 'loading';

  const isAdmin = session?.user?.role === Role.ADMIN;

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Docked Sidebar - Full height, no margins (Fitts's Law) */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-56 bg-bg-surface border-r border-border-subtle flex flex-col z-40 transition-transform duration-200',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-bg-canvas transition-colors md:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-text-primary" />
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-border-subtle">
          <Link href="/quotes" className="flex flex-col items-center text-center group" onClick={handleLinkClick}>
            <Image
              src="/wi-logo.svg"
              alt="Wilson Interiors"
              width={120}
              height={36}
              className="w-28 h-auto mb-2 group-hover:opacity-80 transition-opacity"
            />
            <span className="text-sm font-semibold text-text-primary font-header">
              CloudQuote
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="text-[10px] font-semibold text-text-muted tracking-wider px-3 py-2 uppercase">
            Menu
          </div>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              // During loading, show all items (including admin items with loading state)
              // After loading, hide admin-only items from non-admins
              if (item.adminOnly && !isLoading && !isAdmin) {
                return null;
              }

              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/settings' && pathname.startsWith(item.href));

              // Show loading skeleton for admin items while session is loading
              if (item.adminOnly && isLoading) {
                return (
                  <div
                    key={item.href}
                    className="nav-item opacity-50"
                  >
                    <Icon className="w-4 h-4 text-text-muted" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'nav-item',
                    isActive && 'active'
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-current" : "text-text-muted"
                  )} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border-subtle">
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Shaun Casey</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
