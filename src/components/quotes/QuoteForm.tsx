'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { HouseType } from '@prisma/client';

// Selection options
const FRONTAL_OPTIONS = ['White Gloss', 'Walnut'];
const HANDLE_OPTIONS = ['Tapered D', 'Classic D'];
const WORKTOP_OPTIONS = ['Black', 'Oak'];

const customerInfoSchema = z.object({
  quoteNumber: z.string().min(1, 'Quote number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  postcode: z.string().optional(),
  houseTypeId: z.string().optional(),
  frontal: z.string().optional(),
  handle: z.string().optional(),
  worktop: z.string().optional(),
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
    getValues,
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      quoteNumber: defaultValues?.quoteNumber || '',
      customerName: defaultValues?.customerName || '',
      customerEmail: defaultValues?.customerEmail || '',
      customerPhone: defaultValues?.customerPhone || '',
      address: defaultValues?.address || '',
      postcode: (defaultValues as any)?.postcode || '',
      houseTypeId: defaultValues?.houseTypeId || '',
      frontal: defaultValues?.frontal || '',
      handle: defaultValues?.handle || '',
      worktop: defaultValues?.worktop || '',
      notes: defaultValues?.notes || '',
      internalNotes: defaultValues?.internalNotes || '',
    },
  });

  // Auto-submit on blur for autosave
  const handleFieldBlur = () => {
    handleSubmit(onSubmit)();
  };

  // Get the register props for houseTypeId so we can combine onChange handlers
  const houseTypeRegister = register('houseTypeId');

  // Handle house type change - bypass validation and update immediately
  const handleHouseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // First let React Hook Form update the value
    houseTypeRegister.onChange(e);
    // Then call onSubmit directly with current values (bypassing validation)
    // This ensures house type change updates the total even on new quotes
    setTimeout(() => {
      const currentValues = getValues();
      onSubmit({ ...currentValues, houseTypeId: e.target.value });
    }, 0);
  };

  // Compact version is no longer needed - we always use the full inline version now
  // This component is now used directly in the collapsible header of QuoteEditor

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="QUOTE NUMBER"
          {...register('quoteNumber')}
          error={errors.quoteNumber?.message}
          onBlur={handleFieldBlur}
          required
          placeholder="WO25..."
          tabIndex={1}
        />
        <Select
          label="HOUSE TYPE"
          name={houseTypeRegister.name}
          ref={houseTypeRegister.ref}
          onChange={handleHouseTypeChange}
          error={errors.houseTypeId?.message}
          onBlur={handleFieldBlur}
          tabIndex={10}
        >
          <option value="">SELECT HOUSE TYPE</option>
          {houseTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name.toUpperCase()} (£{Number((type as any).allowance || 0).toFixed(2)})
            </option>
          ))}
        </Select>
        <Input
          label="CUSTOMER NAME"
          {...register('customerName')}
          error={errors.customerName?.message}
          onBlur={handleFieldBlur}
          required
          placeholder="FULL NAME"
          tabIndex={2}
        />
        <Input
          label="POSTCODE"
          {...register('postcode')}
          onBlur={handleFieldBlur}
          placeholder="E.G., AB12 3CD"
          tabIndex={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          label="ADDRESS"
          {...register('address')}
          error={errors.address?.message}
          onBlur={handleFieldBlur}
          required
          rows={2}
          placeholder="STREET ADDRESS"
          tabIndex={3}
        />
        <Textarea
          label="NOTES (VISIBLE TO CUSTOMER)"
          {...register('notes')}
          error={errors.notes?.message}
          onBlur={handleFieldBlur}
          rows={2}
          placeholder="ADDITIONAL NOTES..."
          tabIndex={5}
        />
      </div>

      {/* Selection Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select
          label="FRONTAL"
          {...register('frontal')}
          error={errors.frontal?.message}
          onBlur={handleFieldBlur}
          tabIndex={11}
        >
          <option value="">SELECT FRONTAL</option>
          {FRONTAL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </Select>
        <Select
          label="HANDLE"
          {...register('handle')}
          error={errors.handle?.message}
          onBlur={handleFieldBlur}
          tabIndex={12}
        >
          <option value="">SELECT HANDLE</option>
          {HANDLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </Select>
        <Select
          label="WORKTOP"
          {...register('worktop')}
          error={errors.worktop?.message}
          onBlur={handleFieldBlur}
          tabIndex={13}
        >
          <option value="">SELECT WORKTOP</option>
          {WORKTOP_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </Select>
        <Textarea
          label="INTERNAL NOTES"
          {...register('internalNotes')}
          error={errors.internalNotes?.message}
          onBlur={handleFieldBlur}
          rows={2}
          placeholder="INTERNAL NOTES..."
          tabIndex={6}
        />
      </div>
    </form>
  );
}
