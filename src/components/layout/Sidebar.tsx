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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Dock Sidebar */}
      <aside
        className={cn(
          'fixed left-4 top-4 bottom-4 w-64 bg-bg-surface border border-border-subtle rounded-2xl flex flex-col z-40 transition-all duration-300',
          'shadow-float',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-bg-canvas hover:bg-bg-elevated border border-border-subtle transition-all md:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-text-primary" />
        </button>

        {/* Logo */}
        <div className="p-6 pb-4">
          <Link href="/quotes" className="flex flex-col items-center text-center group" onClick={handleLinkClick}>
            <Image
              src="/wi-logo.svg"
              alt="Wilson Interiors"
              width={140}
              height={42}
              className="w-36 h-auto mb-3 group-hover:opacity-80 transition-opacity"
            />
            <span className="text-lg font-semibold text-gradient leading-tight font-header tracking-tight">
              CloudQuote
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <div className="text-xs font-semibold text-text-muted tracking-wide px-4 mb-3 uppercase">
            Menu
          </div>
          <div className="space-y-1">
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
                    className="nav-item group opacity-50"
                  >
                    <Icon className="w-5 h-5 text-text-muted" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'nav-item group',
                    isActive && 'active'
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-text-muted group-hover:text-primary"
                  )} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 mx-3 mb-3 rounded-xl bg-bg-canvas border border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-muted">
              Created by Shaun Casey
            </div>
            <div className="text-xs text-text-muted">
              v1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
