'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PriceUnit } from '@prisma/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  basePrice: number;
  priceUnit: PriceUnit;
  categoryId: string;
  active: boolean;
  minQuantity?: number | null;
  maxQuantity?: number | null;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface ProductFormData {
  categoryId: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  basePrice: number;
  priceUnit: PriceUnit;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  active: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  categories,
  onSubmit,
  isLoading,
}: ProductFormModalProps) {
  const [formData, setFormData] = React.useState<ProductFormData>({
    categoryId: '',
    sku: '',
    name: '',
    description: '',
    basePrice: 0,
    priceUnit: PriceUnit.UNIT,
    minQuantity: 1,
    maxQuantity: null,
    active: true,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize form when product changes
  React.useEffect(() => {
    if (product) {
      setFormData({
        categoryId: product.categoryId,
        sku: product.sku || '',
        name: product.name,
        description: product.description || '',
        basePrice: Number(product.basePrice),
        priceUnit: product.priceUnit,
        minQuantity: product.minQuantity ? Number(product.minQuantity) : 1,
        maxQuantity: product.maxQuantity ? Number(product.maxQuantity) : null,
        active: product.active,
      });
    } else {
      setFormData({
        categoryId: categories[0]?.id || '',
        sku: '',
        name: '',
        description: '',
        basePrice: 0,
        priceUnit: PriceUnit.UNIT,
        minQuantity: 1,
        maxQuantity: null,
        active: true,
      });
    }
    setErrors({});
  }, [product, categories, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.basePrice < 0) {
      newErrors.basePrice = 'Base price must be positive';
    }

    if (formData.minQuantity && formData.minQuantity <= 0) {
      newErrors.minQuantity = 'Minimum quantity must be positive';
    }

    if (
      formData.maxQuantity &&
      formData.minQuantity &&
      formData.maxQuantity < formData.minQuantity
    ) {
      newErrors.maxQuantity = 'Maximum quantity must be greater than minimum';
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;

    if (type === 'number') {
      processedValue = value === '' ? null : Number(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
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
      title={product ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            error={errors.categoryId}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          {/* Code */}
          <Input
            label="Code"
            name="sku"
            value={formData.sku || ''}
            onChange={handleChange}
            error={errors.sku}
            placeholder="e.g., BU-300"
          />

          {/* Product Name */}
          <div className="md:col-span-2">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="e.g., Base Unit 300mm"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              error={errors.description}
              placeholder="Optional product description"
              rows={3}
            />
          </div>

          {/* Base Price */}
          <Input
            label="Base Price (£)"
            name="basePrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.basePrice}
            onChange={handleChange}
            error={errors.basePrice}
            required
          />

          {/* Price Unit */}
          <Select
            label="Pricing Model"
            name="priceUnit"
            value={formData.priceUnit}
            onChange={handleChange}
            error={errors.priceUnit}
            required
          >
            <option value={PriceUnit.UNIT}>Per Unit</option>
            <option value={PriceUnit.LINEAR_METER}>Per Linear Meter</option>
            <option value={PriceUnit.SQUARE_METER}>Per Square Meter</option>
          </Select>

          {/* Min Quantity */}
          <Input
            label="Minimum Quantity"
            name="minQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.minQuantity || ''}
            onChange={handleChange}
            error={errors.minQuantity}
            placeholder="Default: 1"
          />

          {/* Max Quantity */}
          <Input
            label="Maximum Quantity"
            name="maxQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.maxQuantity || ''}
            onChange={handleChange}
            error={errors.maxQuantity}
            placeholder="Optional"
          />

          {/* Active Status */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-5 h-5 rounded border-glass bg-glass checked:bg-accent-primary checked:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-colors"
              />
              <span className="text-text-primary font-medium">
                Active (visible in product catalog)
              </span>
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
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
