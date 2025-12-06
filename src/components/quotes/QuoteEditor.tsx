'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomerInfoSection, type CustomerInfoFormData } from './QuoteForm';
import { ProductSelector } from './ProductSelector';
import { QuoteItemsTable } from './QuoteItemsTable';
import { AdditionalCosts } from './AdditionalCosts';
import { QuoteSummary } from './QuoteSummary';
import { useAutosave } from '@/hooks/useAutosave';
import { calculateQuoteTotal } from '@/lib/pricing';
import { Product, ProductCategory, HouseType, QuoteStatus } from '@prisma/client';
import { toast } from '@/lib/toast';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface QuoteEditorProps {
  quoteId?: string;
  initialData?: any;
  products: (Product & { category: ProductCategory })[];
  categories: ProductCategory[];
  houseTypes: HouseType[];
}

interface QuoteState {
  customerInfo: CustomerInfoFormData;
  items: any[];
  additionalCosts: any[];
  bespokeUpliftQty: number;
  status: QuoteStatus;
}

const BESPOKE_UPLIFT_PRICE = 30;

export function QuoteEditor({
  quoteId,
  initialData,
  products,
  categories,
  houseTypes,
}: QuoteEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize state from initial data or defaults
  const [quoteState, setQuoteState] = React.useState<QuoteState>({
    customerInfo: initialData?.customerInfo || {
      quoteNumber: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      postcode: '',
      houseTypeId: '',
      frontal: '',
      handle: '',
      worktop: '',
      notes: '',
      internalNotes: '',
    },
    items: initialData?.items || [],
    additionalCosts: initialData?.additionalCosts || [],
    bespokeUpliftQty: initialData?.bespokeUpliftQty ?? 0,
    status: initialData?.status || QuoteStatus.DRAFT,
  });

  // Get house type allowance
  const selectedHouseType = houseTypes.find(
    (ht) => ht.id === quoteState.customerInfo.houseTypeId
  );
  const houseTypeAllowance = selectedHouseType
    ? Number((selectedHouseType as any).allowance)
    : 0;

  // Calculate totals - starting from house type allowance
  // Note: This recalculates whenever items, additionalCosts, or houseTypeAllowance changes
  const totals = React.useMemo(() => {
    // Calculate items total (only non-allowance items add to the total)
    // Items marked as "in allowance" are free (£0.00)
    const itemsSubtotal = quoteState.items.reduce((sum, item) => {
      // Skip items that are marked as in allowance - they're free
      if (item.isInAllowance === true) return sum;
      const price = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);

    // Additional costs
    const additionalTotal = quoteState.additionalCosts.reduce(
      (sum, cost) => sum + (Number(cost.amount) || 0),
      0
    );

    // Bespoke uplift cost (qty * price)
    const bespokeUplift = (quoteState.bespokeUpliftQty || 0) * BESPOKE_UPLIFT_PRICE;

    // Total = House type allowance + non-allowance items + additional costs + bespoke uplift
    const subtotal = houseTypeAllowance + itemsSubtotal + additionalTotal + bespokeUplift;

    return {
      subtotal,
      vatAmount: 0, // VAT handled separately if needed
      total: subtotal,
      houseTypeAllowance,
      itemsSubtotal,
      additionalTotal,
      bespokeUplift,
    };
  }, [quoteState.items, quoteState.additionalCosts, quoteState.bespokeUpliftQty, houseTypeAllowance]);

  // Mutations
  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create quote');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Quote created successfully');
      router.push(`/quotes/${data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create quote');
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update quote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update quote');
    },
  });

  // Autosave functionality
  const autosaveData = React.useMemo(
    () => ({
      ...quoteState.customerInfo,
      items: quoteState.items,
      additionalCosts: quoteState.additionalCosts,
      bespokeUpliftQty: quoteState.bespokeUpliftQty,
    }),
    [quoteState]
  );

  const { status: autosaveStatus } = useAutosave({
    data: autosaveData,
    onSave: async (data) => {
      if (quoteId) {
        await updateQuoteMutation.mutateAsync(data);
      }
    },
    enabled: !!quoteId && quoteState.status === QuoteStatus.DRAFT,
    delay: 2000,
  });

  // Handlers
  const handleCustomerInfoSubmit = (data: CustomerInfoFormData) => {
    setQuoteState((prev) => ({
      ...prev,
      customerInfo: data,
    }));
  };

  const handleAddProduct = async (product: Product, quantity: number, isInAllowance: boolean = false) => {
    const basePrice = Number(product.basePrice);

    // Check if this product already exists in items with the same allowance status
    const existingItemIndex = quoteState.items.findIndex(
      (item) => item.productId === product.id && item.isInAllowance === isInAllowance
    );

    if (existingItemIndex >= 0) {
      // Combine quantities
      setQuoteState((prev) => ({
        ...prev,
        items: prev.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQty = Number(item.quantity) + quantity;
            const effectivePrice = isInAllowance ? 0 : basePrice;
            return {
              ...item,
              quantity: newQty,
              lineTotal: effectivePrice * newQty,
            };
          }
          return item;
        }),
      }));
      toast.success(`Updated ${product.name} quantity`);
    } else {
      // Add as new item
      const effectivePrice = isInAllowance ? 0 : basePrice;
      const newItem = {
        id: `temp-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity,
        priceUnit: product.priceUnit,
        unitPrice: effectivePrice,
        lineTotal: effectivePrice * quantity,
        isInAllowance,
        notes: '',
        sortOrder: quoteState.items.length,
        basePrice, // Always store original price for allowance toggle
      };

      setQuoteState((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
      toast.success(`Added ${product.name} to quote`);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setQuoteState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              lineTotal: item.isInAllowance ? 0 : Number(item.unitPrice) * quantity,
            }
          : item
      ),
    }));
  };

  const handleUpdateAllowance = (itemId: string, isInAllowance: boolean) => {
    setQuoteState((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        // basePrice should always be set, but fallback to unitPrice just in case
        const originalPrice = item.basePrice ?? item.unitPrice;
        // When in allowance, item is free (£0.00); otherwise use original price
        const effectivePrice = isInAllowance ? 0 : Number(originalPrice);
        return {
          ...item,
          isInAllowance,
          unitPrice: effectivePrice,
          lineTotal: effectivePrice * Number(item.quantity),
          basePrice: originalPrice, // Preserve the original price
        };
      }),
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setQuoteState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
    toast.success('Item removed from quote');
  };

  const handleAddCost = (cost: any) => {
    const newCost = {
      id: `temp-${Date.now()}`,
      ...cost,
      sortOrder: quoteState.additionalCosts.length,
    };

    setQuoteState((prev) => ({
      ...prev,
      additionalCosts: [...prev.additionalCosts, newCost],
    }));
  };

  const handleUpdateCost = (id: string, updates: any) => {
    setQuoteState((prev) => ({
      ...prev,
      additionalCosts: prev.additionalCosts.map((cost) =>
        cost.id === id ? { ...cost, ...updates } : cost
      ),
    }));
  };

  const handleRemoveCost = (id: string) => {
    setQuoteState((prev) => ({
      ...prev,
      additionalCosts: prev.additionalCosts.filter((cost) => cost.id !== id),
    }));
  };

  const handleBespokeUpliftQtyChange = (qty: number) => {
    setQuoteState((prev) => ({
      ...prev,
      bespokeUpliftQty: qty,
    }));
  };

  const handleSave = async () => {
    if (!quoteId) {
      // Create new quote
      await createQuoteMutation.mutateAsync({
        ...quoteState.customerInfo,
        ...totals,
        items: quoteState.items,
        additionalCosts: quoteState.additionalCosts,
        bespokeUpliftQty: quoteState.bespokeUpliftQty,
      });
    } else {
      // Update existing quote
      await updateQuoteMutation.mutateAsync({
        ...quoteState.customerInfo,
        ...totals,
        items: quoteState.items,
        additionalCosts: quoteState.additionalCosts,
        bespokeUpliftQty: quoteState.bespokeUpliftQty,
      });
      toast.success('Quote saved successfully');
    }
  };

  const handleFinalize = async () => {
    const finalizedState = { ...quoteState, status: QuoteStatus.FINALIZED };
    setQuoteState(finalizedState);

    if (!quoteId) {
      // Create new quote with finalized status
      await createQuoteMutation.mutateAsync({
        ...finalizedState.customerInfo,
        ...totals,
        items: finalizedState.items,
        additionalCosts: finalizedState.additionalCosts,
        bespokeUpliftQty: finalizedState.bespokeUpliftQty,
        status: QuoteStatus.FINALIZED,
      });
    } else {
      // Update existing quote with finalized status
      await updateQuoteMutation.mutateAsync({
        ...finalizedState.customerInfo,
        ...totals,
        items: finalizedState.items,
        additionalCosts: finalizedState.additionalCosts,
        bespokeUpliftQty: finalizedState.bespokeUpliftQty,
        status: QuoteStatus.FINALIZED,
      });
      toast.success('Quote finalized');
    }
  };

  const handleSend = async () => {
    if (!quoteId) {
      toast.error('Please save the quote first');
      return;
    }

    try {
      const response = await fetch(`/api/quotes/${quoteId}/send`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send quote');

      setQuoteState((prev) => ({ ...prev, status: QuoteStatus.SENT }));
      toast.success('Quote sent successfully');
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send quote');
    }
  };

  const handleDownloadPDF = () => {
    if (!quoteId) {
      toast.error('Please save the quote first');
      return;
    }

    window.open(`/api/quotes/${quoteId}/pdf`, '_blank');
  };

  const handlePrint = () => {
    if (!quoteId) {
      toast.error('Please save the quote first');
      return;
    }

    window.open(`/print/quotes/${quoteId}`, '_blank');
  };

  // Status border class mapping
  const statusBorderClass = {
    [QuoteStatus.DRAFT]: 'border-t-4 border-t-zinc-400',
    [QuoteStatus.FINALIZED]: 'border-t-4 border-t-blue-500',
    [QuoteStatus.SENT]: 'border-t-4 border-t-emerald-600',
    [QuoteStatus.SAVED]: 'border-t-4 border-t-zinc-900 dark:border-t-zinc-100',
    [QuoteStatus.ARCHIVED]: 'border-t-4 border-t-zinc-300',
  }[quoteState.status] || 'border-t-4 border-t-zinc-400';

  // State for customer info collapse
  const [customerInfoExpanded, setCustomerInfoExpanded] = React.useState(true);

  return (
    <div className={`${statusBorderClass} bg-bg-surface rounded-lg`}>
      {/* Persistent Sticky Header - Quote #, Customer, Running Total */}
      <div className="sticky top-14 z-20 bg-bg-surface border-b border-border-default px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wide">Quote</span>
              <p className="font-mono font-bold text-lg text-text-primary">
                {quoteState.customerInfo.quoteNumber || '—'}
              </p>
            </div>
            <div className="border-l border-border-subtle pl-6">
              <span className="text-xs text-text-muted uppercase tracking-wide">Customer</span>
              <p className="font-semibold text-text-primary truncate max-w-[200px]">
                {quoteState.customerInfo.customerName || '—'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-muted uppercase tracking-wide">Total</span>
            <p className="font-mono font-bold text-xl text-money">
              £{totals.total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info - Collapsible Header Section */}
      <div className="border-b border-border-subtle">
        <button
          type="button"
          onClick={() => setCustomerInfoExpanded(!customerInfoExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-canvas transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">Customer Details</span>
            {!customerInfoExpanded && quoteState.customerInfo.address && (
              <span className="text-sm text-text-muted ml-2">
                {quoteState.customerInfo.address.split('\n')[0]}
              </span>
            )}
          </div>
          {customerInfoExpanded ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </button>
        {customerInfoExpanded && (
          <div className="px-4 pb-4">
            <CustomerInfoSection
              defaultValues={quoteState.customerInfo}
              houseTypes={houseTypes}
              onSubmit={handleCustomerInfoSubmit}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-6">
        <ProductSelector
          products={products}
          categories={categories}
          onAddProduct={handleAddProduct}
        />

        <QuoteItemsTable
          items={quoteState.items}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateAllowance={handleUpdateAllowance}
          onRemoveItem={handleRemoveItem}
        />

        <AdditionalCosts
          costs={quoteState.additionalCosts}
          onAddCost={handleAddCost}
          onUpdateCost={handleUpdateCost}
          onRemoveCost={handleRemoveCost}
          bespokeUpliftQty={quoteState.bespokeUpliftQty}
          onBespokeUpliftQtyChange={handleBespokeUpliftQtyChange}
        />
      </div>

      {/* Summary Footer - Fixed at bottom of editor */}
      <div className="border-t border-border-default p-4">
        <QuoteSummary
          subtotal={totals.subtotal}
          vatRate={20}
          vatAmount={totals.vatAmount}
          total={totals.total}
          status={quoteState.status}
          itemsCount={quoteState.items.length}
          houseTypeAllowance={totals.houseTypeAllowance}
          itemsSubtotal={totals.itemsSubtotal}
          additionalTotal={totals.additionalTotal}
          bespokeUplift={totals.bespokeUplift}
          onSave={handleSave}
          onFinalize={handleFinalize}
          onSend={handleSend}
          onPrint={handlePrint}
          onDownloadPDF={handleDownloadPDF}
          isSaving={createQuoteMutation.isPending || updateQuoteMutation.isPending}
          autoSaveStatus={autosaveStatus}
        />
      </div>
    </div>
  );
}
