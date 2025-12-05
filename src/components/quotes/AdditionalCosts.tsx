'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface AdditionalCost {
  id: string;
  quoteId: string;
  description: string;
  amount: number;
  taxable: boolean;
  sortOrder: number;
  createdAt: Date | string;
}

interface AdditionalCostsProps {
  costs: AdditionalCost[];
  onAddCost: (cost: Omit<AdditionalCost, 'id' | 'quoteId' | 'createdAt' | 'sortOrder'>) => void;
  onUpdateCost: (id: string, updates: Partial<AdditionalCost>) => void;
  onRemoveCost: (id: string) => void;
  bespokeUpliftQty: number;
  onBespokeUpliftQtyChange: (qty: number) => void;
}

const BESPOKE_UPLIFT_PRICE = 30;

export function AdditionalCosts({
  costs,
  onAddCost,
  onUpdateCost,
  onRemoveCost,
  bespokeUpliftQty,
  onBespokeUpliftQtyChange,
}: AdditionalCostsProps) {
  const [newCost, setNewCost] = React.useState({
    description: '',
    amount: '',
    taxable: true,
  });

  const handleAddCost = () => {
    if (newCost.description && newCost.amount) {
      onAddCost({
        description: newCost.description,
        amount: parseFloat(newCost.amount),
        taxable: newCost.taxable,
      });
      setNewCost({ description: '', amount: '', taxable: true });
    }
  };

  const bespokeTotal = bespokeUpliftQty * BESPOKE_UPLIFT_PRICE;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bespoke Uplift Cost - Fixed price £30, adjustable qty */}
        <div className="flex items-center gap-3 p-2 bg-bg-glass rounded-lg border border-border-glass">
          <span className="flex-1 text-sm">Bespoke Uplift Cost</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">£{BESPOKE_UPLIFT_PRICE.toFixed(2)}</span>
            <span className="text-xs text-text-muted">×</span>
            <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => onBespokeUpliftQtyChange(Math.max(0, bespokeUpliftQty - 1))}
                className="px-1.5 py-1 hover:bg-bg-glass transition-colors text-text-muted hover:text-gold"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="0"
                value={bespokeUpliftQty}
                onChange={(e) => onBespokeUpliftQtyChange(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-10 py-1 text-center text-sm bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => onBespokeUpliftQtyChange(bespokeUpliftQty + 1)}
                className="px-1.5 py-1 hover:bg-bg-glass transition-colors text-text-muted hover:text-gold"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="font-mono text-sm w-20 text-right">
              £{bespokeTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Existing Costs */}
        {costs.length > 0 && (
          <div className="space-y-2">
            {costs.map((cost) => (
              <div
                key={cost.id}
                className="flex items-center gap-3 p-2 bg-bg-glass rounded-lg border border-border-glass"
              >
                <input
                  type="text"
                  value={cost.description}
                  onChange={(e) =>
                    onUpdateCost(cost.id, { description: e.target.value })
                  }
                  className="input flex-1 text-sm"
                  placeholder="Description"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary">£</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={Number(cost.amount)}
                    onChange={(e) =>
                      onUpdateCost(cost.id, {
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input w-24 text-sm text-right"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveCost(cost.id)}
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Cost */}
        <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg border border-border-glass border-dashed">
          <input
            type="text"
            value={newCost.description}
            onChange={(e) =>
              setNewCost((prev) => ({ ...prev, description: e.target.value }))
            }
            className="input flex-1 text-sm"
            placeholder="e.g., Delivery, Installation, etc."
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">£</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newCost.amount}
              onChange={(e) =>
                setNewCost((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="input w-32 text-sm text-right"
              placeholder="0.00"
            />
          </div>
          <Button
            size="sm"
            onClick={handleAddCost}
            disabled={!newCost.description || !newCost.amount}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {costs.length === 0 && (
          <p className="text-text-secondary text-sm text-center py-4">
            Add additional costs like delivery, installation, or special charges
          </p>
        )}
      </CardContent>
    </Card>
  );
}
