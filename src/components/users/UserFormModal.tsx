'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Role } from '@prisma/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface UserFormData {
  email: string;
  name: string;
  password?: string;
  role: Role;
}

export function UserFormModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading,
}: UserFormModalProps) {
  const [formData, setFormData] = React.useState<UserFormData>({
    email: '',
    name: '',
    password: '',
    role: Role.STAFF,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name,
        password: '', // Don't pre-fill password for edits
        role: user.role,
      });
    } else {
      setFormData({
        email: '',
        name: '',
        password: '',
        role: Role.STAFF,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password is required for new users, optional for edits
    if (!user && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Remove password from data if it's empty (for edits)
      const submitData = { ...formData };
      if (user && !submitData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User' : 'Add New User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Name */}
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., John Smith"
          />

          {/* Email */}
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="e.g., john.smith@company.com"
          />

          {/* Password */}
          <div>
            <Input
              label={user ? 'New Password (leave blank to keep current)' : 'Password'}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required={!user}
              placeholder={user ? 'Leave blank to keep current password' : 'At least 8 characters'}
            />
            {!user && (
              <p className="text-xs text-text-secondary mt-1">
                Must be at least 8 characters long
              </p>
            )}
          </div>

          {/* Role */}
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            required
          >
            <option value={Role.STAFF}>Staff</option>
            <option value={Role.ADMIN}>Admin</option>
            <option value={Role.READONLY}>Read Only</option>
          </Select>

          {/* Role descriptions */}
          <div className="bg-glass border border-glass rounded-xl p-4 space-y-2 text-sm">
            <p className="font-medium text-text-primary">Role Permissions:</p>
            <ul className="space-y-1 text-text-secondary">
              <li><strong>Admin:</strong> Full access to all features including user and product management</li>
              <li><strong>Staff:</strong> Can create, edit, and send quotes. View products.</li>
              <li><strong>Read Only:</strong> Can view quotes and products but cannot make changes</li>
            </ul>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-glass">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
