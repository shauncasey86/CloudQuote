'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserPlus } from 'lucide-react';

interface UsersHeaderProps {
  onAddUser: () => void;
}

export function UsersHeader({ onAddUser }: UsersHeaderProps) {
  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient-nebula mb-2">
            User Management
          </h1>
          <p className="text-text-secondary text-base">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="primary" size="lg" onClick={onAddUser}>
            <UserPlus className="w-5 h-5 mr-2" />
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
}
