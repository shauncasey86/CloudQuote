'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Trash2, GripVertical, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface QuoteItemWithDetails {
  id: string;
  productName: string;
  productSku?: string | null;
  quantity: number | any;
  priceUnit: string;
  unitPrice: number | any;
  lineTotal: number | any;
  isInAllowance?: boolean;
  notes?: string | null;
  basePrice?: number | any;
  product?: {
    name: string;
    sku?: string | null;
    basePrice?: number | any;
  };
}

interface QuoteItemsTableProps {
  items: QuoteItemWithDetails[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateAllowance?: (itemId: string, isInAllowance: boolean) => void;
  onRemoveItem: (itemId: string) => void;
  isLoading?: boolean;
}

export function QuoteItemsTable({
  items,
  onUpdateQuantity,
  onUpdateAllowance,
  onRemoveItem,
  isLoading,
}: QuoteItemsTableProps) {
  // Refs for keyboard navigation
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Handle keyboard navigation - Enter moves to next row
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Items</h3>
        <div className="text-center py-12 text-text-secondary border border-border-subtle rounded-md bg-bg-surface">
          <p>No items added yet</p>
          <p className="text-sm mt-2">
            Select products from the catalog above to add to this quote
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Items ({items.length})
      </h3>
      <div className="border border-border-subtle rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="w-20 text-center">Allow</TableHead>
              <TableHead className="w-28 text-center">Qty</TableHead>
              <TableHead className="w-28 text-right">Unit Price</TableHead>
              <TableHead className="w-28 text-right">Line Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const lineTotal = Number(item.lineTotal);
              const isInAllowance = item.isInAllowance || false;
              const step = item.priceUnit === 'LINEAR_METER' ? 0.1 : 1;
              const currentQty = Number(item.quantity);

              return (
                <TableRow
                  key={item.id}
                  className={isInAllowance ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}
                >
                  <TableCell>
                    <button className="cursor-move text-text-muted hover:text-text-primary">
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{item.productName}</p>
                      {item.productSku && (
                        <p className="text-xs text-text-muted font-mono">
                          {item.productSku}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-text-muted mt-1 italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  {/* Allowance Toggle - High visibility */}
                  <TableCell className="text-center">
                    {onUpdateAllowance && (
                      <button
                        type="button"
                        onClick={() => onUpdateAllowance(item.id, !isInAllowance)}
                        className={`allowance-toggle w-7 h-7 rounded flex items-center justify-center mx-auto transition-all ${
                          isInAllowance
                            ? 'active bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-600 text-emerald-600'
                            : 'border-2 border-border-default hover:border-emerald-500'
                        }`}
                        title={isInAllowance ? 'Remove from allowance' : 'Include in allowance (free)'}
                      >
                        {isInAllowance && <Check className="w-4 h-4" />}
                      </button>
                    )}
                  </TableCell>
                  {/* Quantity with up/down arrows and keyboard navigation */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-bg-input border border-border-subtle rounded-md overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = Math.max(step, currentQty - step);
                            onUpdateQuantity(item.id, newQty);
                          }}
                          className="px-1.5 py-1 hover:bg-bg-canvas transition-colors text-text-muted hover:text-text-primary"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <input
                          ref={(el) => { inputRefs.current[index] = el; }}
                          type="number"
                          min={step}
                          step={step}
                          value={currentQty}
                          onChange={(e) => {
                            const newQty = parseFloat(e.target.value) || step;
                            if (newQty > 0) {
                              onUpdateQuantity(item.id, newQty);
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-12 py-1 text-center text-sm bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, currentQty + step)}
                          className="px-1.5 py-1 hover:bg-bg-canvas transition-colors text-text-muted hover:text-text-primary"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.priceUnit === 'LINEAR_METER' && (
                        <span className="text-xs text-text-muted ml-1">m</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {isInAllowance ? (
                      <span className="text-success">£0.00</span>
                    ) : (
                      <span>£{Number(item.unitPrice).toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {isInAllowance ? (
                      <span className="text-success">£0.00</span>
                    ) : (
                      <span className="text-money">£{lineTotal.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove item"
                      className="hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
