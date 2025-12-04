'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
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
        <Button variant="primary" onClick={onAddUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>
  );
}
