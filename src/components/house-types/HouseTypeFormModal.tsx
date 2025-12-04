'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Checkbox } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface HouseType {
  id: string;
  name: string;
  allowance: number;
  active: boolean;
}

interface HouseTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseType: HouseType | null;
  onSubmit: (data: HouseTypeFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface HouseTypeFormData {
  name: string;
  allowance: number;
  active: boolean;
}

export function HouseTypeFormModal({
  isOpen,
  onClose,
  houseType,
  onSubmit,
  isLoading,
}: HouseTypeFormModalProps) {
  const [formData, setFormData] = React.useState<HouseTypeFormData>({
    name: '',
    allowance: 0,
    active: true,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form when house type changes
  React.useEffect(() => {
    if (houseType) {
      setFormData({
        name: houseType.name,
        allowance: Number(houseType.allowance),
        active: houseType.active,
      });
    } else {
      setFormData({
        name: '',
        allowance: 0,
        active: true,
      });
    }
    setErrors({});
  }, [houseType, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.allowance < 0) {
      newErrors.allowance = 'Allowance must be 0 or greater';
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
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
      title={houseType ? 'Edit House Type' : 'Add New House Type'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Name */}
          <Input
            label="House Type Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., FLAT-BUNG/1, HOUSE/3+"
          />

          {/* Allowance */}
          <Input
            label="Allowance Amount (£)"
            name="allowance"
            type="number"
            step="0.01"
            min="0"
            value={formData.allowance}
            onChange={handleChange}
            error={errors.allowance}
            required
            placeholder="e.g., 5000.00"
          />
          <p className="text-xs text-text-secondary -mt-2">
            This is the starting amount for quotes using this house type
          </p>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
            <label htmlFor="active" className="text-sm text-text-primary cursor-pointer">
              Active (visible in quote creation)
            </label>
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
            {houseType ? 'Update House Type' : 'Create House Type'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
