'use client';

import React from 'react';
import { Role } from '@prisma/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Shield, User, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

interface UsersTableProps {
  users: User[];
  currentUserId: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const roleConfig = {
  [Role.ADMIN]: {
    label: 'Admin',
    variant: 'primary' as const,
    icon: Shield,
  },
  [Role.STAFF]: {
    label: 'Staff',
    variant: 'info' as const,
    icon: User,
  },
  [Role.READONLY]: {
    label: 'Read Only',
    variant: 'warning' as const,
    icon: Eye,
  },
};

export function UsersTable({ users, currentUserId, onEdit, onDelete }: UsersTableProps) {
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const handleDeleteClick = (user: User) => {
    if (deleteConfirm === user.id) {
      onDelete(user);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(user.id);
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  if (users.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-glass rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No users found
          </h3>
          <p className="text-text-secondary">
            Get started by adding your first user
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glass">
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass">
            {users.map((user) => {
              const roleInfo = roleConfig[user.role];
              const RoleIcon = roleInfo.icon;
              const isCurrentUser = user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-glass/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-accent-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-text-secondary">(You)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-text-secondary">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={roleInfo.variant}>
                      <RoleIcon className="w-3.5 h-3.5 mr-1.5" />
                      {roleInfo.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-text-secondary text-sm">
                      {format(new Date(user.createdAt), 'dd MMM yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!isCurrentUser && (
                        <Button
                          variant={deleteConfirm === user.id ? 'danger' : 'ghost'}
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          title={
                            deleteConfirm === user.id
                              ? 'Click again to confirm'
                              : 'Delete user'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
