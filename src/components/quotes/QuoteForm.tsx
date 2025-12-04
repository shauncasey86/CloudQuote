'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HouseType } from '@prisma/client';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  compact?: boolean;
}

export function CustomerInfoSection({
  defaultValues,
  houseTypes,
  onSubmit,
  isLoading,
  compact = false,
}: CustomerInfoSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true); // Always open by default
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
                  <label className="text-xs text-text-muted mb-1 block uppercase">Quote #</label>
                  <input
                    {...register('quoteNumber')}
                    onBlur={handleFieldBlur}
                    placeholder="WO25..."
                    tabIndex={1}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block uppercase">House Type</label>
                  <select
                    name={houseTypeRegister.name}
                    ref={houseTypeRegister.ref}
                    onChange={handleHouseTypeChange}
                    onBlur={handleFieldBlur}
                    tabIndex={10}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 uppercase"
                  >
                    <option value="">SELECT TYPE...</option>
                    {houseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name.toUpperCase()} (£{Number((type as any).allowance || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block uppercase">Customer Name *</label>
                <input
                  {...register('customerName')}
                  onBlur={handleFieldBlur}
                  placeholder="FULL NAME"
                  tabIndex={2}
                  className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 uppercase"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block uppercase">Address *</label>
                <textarea
                  {...register('address')}
                  onBlur={handleFieldBlur}
                  placeholder="STREET ADDRESS"
                  rows={2}
                  tabIndex={3}
                  className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 resize-none uppercase"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block uppercase">Postcode</label>
                <input
                  {...register('postcode')}
                  onBlur={handleFieldBlur}
                  placeholder="E.G., AB12 3CD"
                  tabIndex={4}
                  className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 uppercase"
                />
              </div>

              {/* Selection Dropdowns */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-text-muted mb-1 block uppercase">Frontal</label>
                  <select
                    {...register('frontal')}
                    onBlur={handleFieldBlur}
                    tabIndex={11}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 uppercase"
                  >
                    <option value="">SELECT...</option>
                    {FRONTAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block uppercase">Handle</label>
                  <select
                    {...register('handle')}
                    onBlur={handleFieldBlur}
                    tabIndex={12}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 uppercase"
                  >
                    <option value="">SELECT...</option>
                    {HANDLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block uppercase">Worktop</label>
                  <select
                    {...register('worktop')}
                    onBlur={handleFieldBlur}
                    tabIndex={13}
                    className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 uppercase"
                  >
                    <option value="">SELECT...</option>
                    {WORKTOP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block uppercase">Notes</label>
                <textarea
                  {...register('notes')}
                  onBlur={handleFieldBlur}
                  placeholder="CUSTOMER-VISIBLE NOTES..."
                  rows={2}
                  tabIndex={5}
                  className="w-full px-2.5 py-1.5 text-sm bg-bg-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-violet-500 resize-none uppercase"
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
          </div>

          <Input
            label="CUSTOMER NAME"
            {...register('customerName')}
            error={errors.customerName?.message}
            onBlur={handleFieldBlur}
            required
            placeholder="ENTER CUSTOMER FULL NAME"
            tabIndex={2}
          />

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

          <Input
            label="POSTCODE"
            {...register('postcode')}
            onBlur={handleFieldBlur}
            placeholder="E.G., AB12 3CD"
            tabIndex={4}
          />

          {/* Selection Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          <Textarea
            label="NOTES (VISIBLE TO CUSTOMER)"
            {...register('notes')}
            error={errors.notes?.message}
            onBlur={handleFieldBlur}
            rows={3}
            placeholder="ANY ADDITIONAL NOTES FOR THE CUSTOMER..."
            tabIndex={5}
          />

          <Textarea
            label="INTERNAL NOTES"
            {...register('internalNotes')}
            error={errors.internalNotes?.message}
            onBlur={handleFieldBlur}
            rows={2}
            placeholder="INTERNAL NOTES (NOT VISIBLE TO CUSTOMER)..."
            tabIndex={6}
          />
        </form>
      </CardContent>
    </Card>
  );
}
