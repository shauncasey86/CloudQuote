'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Trash2, GripVertical } from 'lucide-react';
import { QuoteItem } from '@prisma/client';

interface QuoteItemWithDetails extends QuoteItem {
  product?: {
    name: string;
    sku?: string | null;
  };
}

interface QuoteItemsTableProps {
  items: QuoteItemWithDetails[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  isLoading?: boolean;
  houseTypeMultiplier?: number;
}

export function QuoteItemsTable({
  items,
  onUpdateQuantity,
  onRemoveItem,
  isLoading,
  houseTypeMultiplier = 1,
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
              <TableHead className="w-24 text-right">Qty</TableHead>
              <TableHead className="w-32 text-right">Unit Price</TableHead>
              <TableHead className="w-32 text-right">Line Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const unitPriceWithMultiplier =
                Number(item.unitPrice) * houseTypeMultiplier;
              const lineTotal = unitPriceWithMultiplier * Number(item.quantity);

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <button className="cursor-move text-text-secondary hover:text-text-primary">
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
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
                  <TableCell className="text-right">
                    <input
                      type="number"
                      min={0.1}
                      step={item.priceUnit === 'LINEAR_METER' ? '0.1' : '1'}
                      value={Number(item.quantity)}
                      onChange={(e) => {
                        const newQty = parseFloat(e.target.value) || 0;
                        if (newQty > 0) {
                          onUpdateQuantity(item.id, newQty);
                        }
                      }}
                      className="input text-right w-20 text-sm"
                    />
                    <span className="text-xs text-text-secondary ml-1">
                      {item.priceUnit === 'LINEAR_METER' ? 'm' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div className="space-y-1">
                      <div className="text-xs text-text-secondary">
                        £{Number(item.unitPrice).toFixed(2)}
                      </div>
                      {houseTypeMultiplier !== 1 && (
                        <div className="text-sm font-medium">
                          £{unitPriceWithMultiplier.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    £{lineTotal.toFixed(2)}
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
