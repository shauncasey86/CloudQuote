'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus } from 'lucide-react';

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
  bespokeUpliftCost: number;
  onBespokeUpliftChange: (amount: number) => void;
}

export function AdditionalCosts({
  costs,
  onAddCost,
  onUpdateCost,
  onRemoveCost,
  bespokeUpliftCost,
  onBespokeUpliftChange,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bespoke Uplift Cost - Always First */}
        <div className="flex items-center gap-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
          <span className="flex-1 text-sm font-medium text-amber-400">BESPOKE UPLIFT COST</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">£</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={bespokeUpliftCost}
              onChange={(e) => onBespokeUpliftChange(parseFloat(e.target.value) || 0)}
              className="input w-24 text-sm text-right"
            />
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
