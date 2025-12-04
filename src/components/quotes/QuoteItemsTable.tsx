'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

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
  onRemoveItem: (itemId: string) => void;
  isLoading?: boolean;
}

export function QuoteItemsTable({
  items,
  onUpdateQuantity,
  onRemoveItem,
  isLoading,
}: QuoteItemsTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-text-secondary">
            <p>No items added yet</p>
            <p className="text-sm mt-2">
              Select products from the catalog above to add to this quote
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Items ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="w-28 text-center">Qty</TableHead>
              <TableHead className="w-28 text-right">Unit Price</TableHead>
              <TableHead className="w-28 text-right">Line Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const lineTotal = Number(item.lineTotal);
              const isInAllowance = item.isInAllowance || false;
              const step = item.priceUnit === 'LINEAR_METER' ? 0.1 : 1;
              const currentQty = Number(item.quantity);

              return (
                <TableRow key={item.id} className={isInAllowance ? 'bg-emerald-500/5' : ''}>
                  <TableCell>
                    <button className="cursor-move text-text-secondary hover:text-text-primary">
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      {item.productSku && (
                        <p className="text-xs text-text-secondary font-mono">
                          {item.productSku}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-text-secondary mt-1 italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  {/* Quantity with up/down arrows */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = Math.max(step, currentQty - step);
                            onUpdateQuantity(item.id, newQty);
                          }}
                          className="px-1.5 py-1 hover:bg-bg-glass transition-colors text-text-muted hover:text-[#B19334]"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <input
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
                          className="w-12 py-1 text-center text-sm bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, currentQty + step)}
                          className="px-1.5 py-1 hover:bg-bg-glass transition-colors text-text-muted hover:text-[#B19334]"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.priceUnit === 'LINEAR_METER' && (
                        <span className="text-xs text-text-secondary ml-1">m</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {isInAllowance ? (
                      <span className="text-emerald-400">£0.00</span>
                    ) : (
                      <span>£{Number(item.unitPrice).toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {isInAllowance ? (
                      <span className="text-emerald-400">£0.00</span>
                    ) : (
                      <span>£{lineTotal.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
