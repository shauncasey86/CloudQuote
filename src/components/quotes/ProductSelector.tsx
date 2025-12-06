'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Plus, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Product, ProductCategory } from '@prisma/client';

interface ProductWithCategory extends Product {
  category: ProductCategory;
}

interface ProductSelectorProps {
  products: ProductWithCategory[];
  categories: ProductCategory[];
  onAddProduct: (product: Product, quantity: number, isInAllowance: boolean) => void;
  isLoading?: boolean;
}

export function ProductSelector({
  products,
  categories,
  onAddProduct,
  isLoading,
}: ProductSelectorProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [allowances, setAllowances] = React.useState<Record<string, boolean>>({});

  const sortedCategories = React.useMemo(() =>
    categories.filter((cat) => cat.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  // Default to first category when categories load
  React.useEffect(() => {
    if (sortedCategories.length > 0 && selectedCategory === null) {
      setSelectedCategory(sortedCategories[0].id);
    }
  }, [sortedCategories, selectedCategory]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && product.active;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddProduct = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    const isInAllowance = allowances[product.id] || false;
    onAddProduct(product, quantity, isInAllowance);
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    setAllowances((prev) => ({ ...prev, [product.id]: false }));
  };

  return (
    <div>
      {/* Header with title and search */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Products</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-bg-input border border-border-subtle rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Two-column layout: Vertical category list + Products */}
      <div className="flex gap-4">
        {/* Vertical Category List */}
        <div className="w-48 flex-shrink-0">
          <div className="space-y-1">
            {sortedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-bg-base'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-canvas'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-12 bg-bg-canvas rounded-md"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No products found
            </div>
          ) : (
            <div className="border border-border-subtle rounded-md overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-1 px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wide bg-bg-canvas border-b border-border-subtle">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1 text-center">Allow</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Action</div>
              </div>
              {/* Product Rows */}
              <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
                {filteredProducts.map((product, index) => {
                  const currentQty = quantities[product.id] || 1;
                  const minQty = Number(product.minQuantity) || 1;
                  const step = product.priceUnit === 'LINEAR_METER' ? 0.1 : 1;
                  const isInAllowance = allowances[product.id] || false;
                  return (
                    <div
                      key={product.id}
                      className={`grid grid-cols-12 gap-1 px-3 py-2 items-center border-b border-border-subtle last:border-b-0 transition-colors group ${
                        isInAllowance
                          ? 'bg-emerald-50 dark:bg-emerald-950/20'
                          : index % 2 === 1 ? 'bg-bg-row-alt' : ''
                      } hover:bg-bg-canvas`}
                    >
                      {/* Product Info */}
                      <div className="col-span-5">
                        <div className="font-medium text-sm text-text-primary leading-tight">
                          {product.name}
                        </div>
                        {product.sku && (
                          <div className="text-xs text-text-muted font-mono">
                            {product.sku}
                          </div>
                        )}
                      </div>
                      {/* Price */}
                      <div className="col-span-2">
                        <span className={`font-mono font-semibold text-sm ${isInAllowance ? 'text-success' : ''}`}>
                          {isInAllowance ? '£0.00' : `£${Number(product.basePrice).toFixed(2)}`}
                        </span>
                        {!isInAllowance && (
                          <span className="text-xs text-text-muted ml-1">
                            /{product.priceUnit === 'LINEAR_METER' ? 'm' : 'ea'}
                          </span>
                        )}
                      </div>
                      {/* Allowance Toggle - High visibility */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setAllowances((prev) => ({
                            ...prev,
                            [product.id]: !prev[product.id],
                          }))}
                          className={`allowance-toggle w-6 h-6 rounded flex items-center justify-center transition-all ${
                            isInAllowance
                              ? 'active bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-600 text-emerald-600'
                              : 'border-2 border-border-default hover:border-emerald-500'
                          }`}
                          title={isInAllowance ? 'Remove from allowance' : 'Include in allowance (free)'}
                        >
                          {isInAllowance && <Check className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Quantity */}
                      <div className="col-span-2 flex justify-start">
                        <div className="flex items-center bg-bg-input border border-border-subtle rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setQuantities((prev) => ({
                              ...prev,
                              [product.id]: Math.max(minQty, (prev[product.id] || 1) - step),
                            }))}
                            className="px-1.5 py-1 hover:bg-bg-canvas transition-colors text-text-muted hover:text-text-primary"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={minQty}
                            max={Number(product.maxQuantity) || undefined}
                            step={step}
                            value={currentQty}
                            onChange={(e) =>
                              setQuantities((prev) => ({
                                ...prev,
                                [product.id]: parseFloat(e.target.value) || 1,
                              }))
                            }
                            className="w-12 py-1 text-center text-sm bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantities((prev) => ({
                              ...prev,
                              [product.id]: (prev[product.id] || 1) + step,
                            }))}
                            className="px-1.5 py-1 hover:bg-bg-canvas transition-colors text-text-muted hover:text-text-primary"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {/* Add Button */}
                      <div className="col-span-2 flex justify-start">
                        <Button
                          size="sm"
                          onClick={() => handleAddProduct(product)}
                          className="opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
