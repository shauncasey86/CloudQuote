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
  status: QuoteStatus;
}

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
  const totals = React.useMemo(() => {
    // Calculate items total (only non-allowance items add to the total)
    const itemsSubtotal = quoteState.items.reduce((sum, item) => {
      if (item.isInAllowance) return sum; // Allowance items don't add to total
      return sum + Number(item.unitPrice) * Number(item.quantity);
    }, 0);

    // Additional costs
    const additionalTotal = quoteState.additionalCosts.reduce(
      (sum, cost) => sum + Number(cost.amount),
      0
    );

    // Total = House type allowance + non-allowance items + additional costs
    const subtotal = houseTypeAllowance + itemsSubtotal + additionalTotal;

    return {
      subtotal,
      vatAmount: 0, // VAT handled separately if needed
      total: subtotal,
      houseTypeAllowance,
      itemsSubtotal,
      additionalTotal,
    };
  }, [quoteState.items, quoteState.additionalCosts, houseTypeAllowance]);

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
    const effectivePrice = isInAllowance ? 0 : Number(product.basePrice);
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
    };

    setQuoteState((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    toast.success(`Added ${product.name} to quote${isInAllowance ? ' (in allowance)' : ''}`);
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
        // Get the base price - if switching to allowance, price becomes 0; otherwise restore base price
        const basePrice = item.basePrice || item.unitPrice;
        const effectivePrice = isInAllowance ? 0 : basePrice;
        return {
          ...item,
          isInAllowance,
          unitPrice: effectivePrice,
          lineTotal: effectivePrice * Number(item.quantity),
          basePrice, // Keep track of original price
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

  const handleSave = async () => {
    if (!quoteId) {
      // Create new quote
      await createQuoteMutation.mutateAsync({
        ...quoteState.customerInfo,
        houseTypeAllowance,
        ...totals,
        items: quoteState.items,
        additionalCosts: quoteState.additionalCosts,
      });
    } else {
      // Update existing quote
      await updateQuoteMutation.mutateAsync({
        ...quoteState.customerInfo,
        houseTypeAllowance,
        ...totals,
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
        houseTypeAllowance,
        ...totals,
        items: finalizedState.items,
        additionalCosts: finalizedState.additionalCosts,
        status: QuoteStatus.FINALIZED,
      });
    } else {
      // Update existing quote with finalized status
      await updateQuoteMutation.mutateAsync({
        ...finalizedState.customerInfo,
        houseTypeAllowance,
        ...totals,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
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
        />
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <CustomerInfoSection
          defaultValues={quoteState.customerInfo}
          houseTypes={houseTypes}
          onSubmit={handleCustomerInfoSubmit}
          compact
        />

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
          onSave={handleSave}
          onFinalize={handleFinalize}
          onSend={handleSend}
          onDownloadPDF={handleDownloadPDF}
          isSaving={createQuoteMutation.isPending || updateQuoteMutation.isPending}
          autoSaveStatus={autosaveStatus}
        />
      </div>
    </div>
  );
}
