'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HouseType } from '@prisma/client';

const customerInfoSchema = z.object({
  quoteNumber: z.string().min(1, 'Quote number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  houseTypeId: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;

interface CustomerInfoSectionProps {
  defaultValues?: Partial<CustomerInfoFormData>;
  houseTypes: HouseType[];
  onSubmit: (data: CustomerInfoFormData) => void;
  isLoading?: boolean;
}

export function CustomerInfoSection({
  defaultValues,
  houseTypes,
  onSubmit,
  isLoading,
}: CustomerInfoSectionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      quoteNumber: defaultValues?.quoteNumber || '',
      customerName: defaultValues?.customerName || '',
      customerEmail: defaultValues?.customerEmail || '',
      customerPhone: defaultValues?.customerPhone || '',
      address: defaultValues?.address || '',
      houseTypeId: defaultValues?.houseTypeId || '',
      notes: defaultValues?.notes || '',
      internalNotes: defaultValues?.internalNotes || '',
    },
  });

  // Auto-submit on blur for autosave
  const handleFieldBlur = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quote Number"
              {...register('quoteNumber')}
              error={errors.quoteNumber?.message}
              onBlur={handleFieldBlur}
              required
              placeholder="e.g., Q-2024-001"
            />
            <Select
              label="House Type"
              {...register('houseTypeId')}
              error={errors.houseTypeId?.message}
              onBlur={handleFieldBlur}
            >
              <option value="">Select house type</option>
              {houseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({Number(type.multiplier)}x)
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Customer Name"
            {...register('customerName')}
            error={errors.customerName?.message}
            onBlur={handleFieldBlur}
            required
            placeholder="Enter customer full name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register('customerEmail')}
              error={errors.customerEmail?.message}
              onBlur={handleFieldBlur}
              placeholder="customer@example.com"
            />
            <Input
              label="Phone"
              type="tel"
              {...register('customerPhone')}
              error={errors.customerPhone?.message}
              onBlur={handleFieldBlur}
              placeholder="+44 7XXX XXXXXX"
            />
          </div>

          <Textarea
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            onBlur={handleFieldBlur}
            required
            rows={3}
            placeholder="Enter full address including postcode"
          />

          <Textarea
            label="Notes (Visible to Customer)"
            {...register('notes')}
            error={errors.notes?.message}
            onBlur={handleFieldBlur}
            rows={3}
            placeholder="Any additional notes for the customer..."
          />

          <Textarea
            label="Internal Notes"
            {...register('internalNotes')}
            error={errors.internalNotes?.message}
            onBlur={handleFieldBlur}
            rows={2}
            placeholder="Internal notes (not visible to customer)..."
          />
        </form>
      </CardContent>
    </Card>
  );
}
