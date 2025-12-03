'use client';

// src/components/layout/Sidebar.tsx

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Role } from '@prisma/client';
import {
  FileText,
  Package,
  Settings,
  Users,
  Sparkles,
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
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-canvas/95 backdrop-blur-xl border-r border-border-glass flex flex-col z-40">
      {/* Logo */}
      <div className="p-6">
        <Link href="/quotes" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-gradient block leading-tight">
              CloudQuote
            </span>
            <span className="text-xs text-text-muted">Kitchen Quoting</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider px-4 mb-3">
          Menu
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            // Hide admin-only items from non-admins
            if (item.adminOnly && !isAdmin) {
              return null;
            }

            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/settings' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'nav-item group',
                  isActive && 'active'
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-text-muted group-hover:text-text-primary"
                )} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">CloudQuote</div>
            <div className="text-xs text-text-muted">v1.0.0</div>
          </div>
        </div>
        <div className="text-xs text-text-muted">
          Created by Shaun Casey
        </div>
      </div>
    </aside>
  );
};
