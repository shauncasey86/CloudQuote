'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UsersHeader } from '@/components/users/UsersHeader';
import { UsersTable } from '@/components/users/UsersTable';
import { UserFormModal, UserFormData } from '@/components/users/UserFormModal';
import { Role } from '@prisma/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Check if user is admin
  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== Role.ADMIN) {
      router.push('/settings');
      return;
    }
  }, [session, status, router]);

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user.role === Role.ADMIN) {
      fetchUsers();
    }
  }, [session, fetchUsers]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      toast.success(`User ${user.name} deleted successfully`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }

      toast.success(
        editingUser
          ? `User ${data.name} updated successfully`
          : `User ${data.name} created successfully`
      );

      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Failed to save user');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-glass rounded-xl w-64 mb-2"></div>
          <div className="h-5 bg-glass rounded-xl w-96"></div>
        </div>
        <div className="glass-card p-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-glass rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== Role.ADMIN) {
    return null;
  }

  return (
    <div className="space-y-6">
      <UsersHeader onAddUser={handleAddUser} />

      <div className="animate-fadeUp-delay-1">
        <UsersTable
          users={users}
          currentUserId={session.user.id}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
