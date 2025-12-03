'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HouseType } from '@prisma/client';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  compact?: boolean;
}

export function CustomerInfoSection({
  defaultValues,
  houseTypes,
  onSubmit,
  isLoading,
  compact = false,
}: CustomerInfoSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(!compact);
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

  const customerName = watch('customerName');
  const quoteNumber = watch('quoteNumber');

  // Compact version for sidebar
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Customer</CardTitle>
              {!isExpanded && customerName && (
                <p className="text-sm text-text-secondary mt-0.5">{customerName}</p>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            )}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Quote #</label>
                  <input
                    {...register('quoteNumber')}
                    onBlur={handleFieldBlur}
                    placeholder="Q-2024-001"
                    tabIndex={1}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">House Type</label>
                  <select
                    {...register('houseTypeId')}
                    onBlur={handleFieldBlur}
                    tabIndex={2}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Standard</option>
                    {houseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Customer Name *</label>
                <input
                  {...register('customerName')}
                  onBlur={handleFieldBlur}
                  placeholder="Full name"
                  tabIndex={3}
                  className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Email</label>
                  <input
                    type="email"
                    {...register('customerEmail')}
                    onBlur={handleFieldBlur}
                    placeholder="email@example.com"
                    tabIndex={4}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Phone</label>
                  <input
                    type="tel"
                    {...register('customerPhone')}
                    onBlur={handleFieldBlur}
                    placeholder="+44 7XXX"
                    tabIndex={5}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Address *</label>
                <textarea
                  {...register('address')}
                  onBlur={handleFieldBlur}
                  placeholder="Full address with postcode"
                  rows={2}
                  tabIndex={6}
                  className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Notes</label>
                <textarea
                  {...register('notes')}
                  onBlur={handleFieldBlur}
                  placeholder="Customer-visible notes..."
                  rows={2}
                  tabIndex={7}
                  className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    );
  }

  // Full version (original)
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
              tabIndex={1}
            />
            <Select
              label="House Type"
              {...register('houseTypeId')}
              error={errors.houseTypeId?.message}
              onBlur={handleFieldBlur}
              tabIndex={2}
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
            tabIndex={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register('customerEmail')}
              error={errors.customerEmail?.message}
              onBlur={handleFieldBlur}
              placeholder="customer@example.com"
              tabIndex={4}
            />
            <Input
              label="Phone"
              type="tel"
              {...register('customerPhone')}
              error={errors.customerPhone?.message}
              onBlur={handleFieldBlur}
              placeholder="+44 7XXX XXXXXX"
              tabIndex={5}
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
            tabIndex={6}
          />

          <Textarea
            label="Notes (Visible to Customer)"
            {...register('notes')}
            error={errors.notes?.message}
            onBlur={handleFieldBlur}
            rows={3}
            placeholder="Any additional notes for the customer..."
            tabIndex={7}
          />

          <Textarea
            label="Internal Notes"
            {...register('internalNotes')}
            error={errors.internalNotes?.message}
            onBlur={handleFieldBlur}
            rows={2}
            placeholder="Internal notes (not visible to customer)..."
            tabIndex={8}
          />
        </form>
      </CardContent>
    </Card>
  );
}
