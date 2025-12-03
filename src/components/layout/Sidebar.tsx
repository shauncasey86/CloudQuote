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
  LayoutDashboard,
  Users,
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
    <aside className="fixed left-0 top-0 h-screen w-64 glass-effect border-r border-border-glass flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border-glass">
        <Link href="/quotes" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="font-display font-bold text-xl text-gradient">
            CloudQuote
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          // Hide admin-only items from non-admins
          if (item.adminOnly && !isAdmin) {
            return null;
          }

          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gradient-hero text-white shadow-lg shadow-purple-500/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-glass">
        <div className="text-xs text-text-secondary text-center space-y-1">
          <div>CloudQuote v0.0.1</div>
          <div>Created by Shaun Casey</div>
        </div>
      </div>
    </aside>
  );
};
