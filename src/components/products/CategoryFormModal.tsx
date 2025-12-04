'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  active?: boolean;
  _count?: {
    products: number;
  };
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface CategoryFormData {
  name: string;
  description?: string | null;
  active?: boolean;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSubmit,
  isLoading,
}: CategoryFormModalProps) {
  const [formData, setFormData] = React.useState<CategoryFormData>({
    name: '',
    description: '',
    active: true,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form when category changes
  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        active: category.active !== false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        active: true,
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
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
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      title={category ? 'Edit Category' : 'Add New Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <Input
          label="Category Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g., Wall Units"
        />

        {/* Description */}
        <Textarea
          label="Description (optional)"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          error={errors.description}
          placeholder="Brief description of this category"
          rows={3}
        />

        {/* Active Toggle - only show when editing */}
        {category && (
          <div className="flex items-center justify-between p-3 bg-bg-glass rounded-lg border border-border-glass">
            <div>
              <p className="font-medium text-text-primary">Active Status</p>
              <p className="text-sm text-text-secondary">
                Inactive categories won&apos;t appear in product selection
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.active ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

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
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
