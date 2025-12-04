'use client';

// src/components/layout/Sidebar.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Role } from '@prisma/client';
import {
  FileText,
  Package,
  Settings,
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-canvas/95 backdrop-blur-xl border-r border-border-glass flex flex-col z-40">
      {/* Logo */}
      <div className="p-6">
        <Link href="/quotes" className="flex flex-col items-center text-center group">
          <Image
            src="/wi-logo.svg"
            alt="Wilson Interiors"
            width={160}
            height={48}
            className="w-40 h-auto mb-3 group-hover:opacity-90 transition-opacity"
          />
          <span className="text-lg font-bold text-gradient leading-tight font-header tracking-wider">
            CLOUDQUOTE
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="text-xs font-header text-text-muted tracking-wider px-4 mb-3">
          MENU
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
                  isActive ? "text-[#212533]" : "text-text-muted group-hover:text-gold"
                )} />
                <span className="font-header text-sm tracking-wide">{item.label.toUpperCase()}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#212533]/80" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-[#B19334]/10 to-[#BB9E6C]/10 border border-[#B19334]/20">
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
  );
};
