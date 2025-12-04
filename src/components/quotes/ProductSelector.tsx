'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [allowances, setAllowances] = React.useState<Record<string, boolean>>({});

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory;
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

  const sortedCategories = categories
    .filter((cat) => cat.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          {/* Search Bar - Compact */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Category Tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-[#B19334] to-[#BB9E6C] text-[#212533] shadow-md'
                  : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-glass border border-border-subtle'
              }`}
            >
              All
            </button>
            {sortedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#B19334] to-[#BB9E6C] text-[#212533] shadow-md'
                    : 'bg-bg-elevated text-text-muted hover:text-text-primary hover:bg-bg-glass border border-border-subtle'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products List - Row Style */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-bg-glass rounded-lg"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            No products found
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-1 px-2 py-1.5 text-xs font-bold text-text-muted uppercase tracking-wide border-b border-border-glass">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1 text-center">Allow</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Action</div>
            </div>
            {/* Product Rows */}
            <div className="divide-y divide-border-subtle">
              {filteredProducts.map((product) => {
                const currentQty = quantities[product.id] || 1;
                const minQty = Number(product.minQuantity) || 1;
                const step = product.priceUnit === 'LINEAR_METER' ? 0.1 : 1;
                const isInAllowance = allowances[product.id] || false;
                return (
                  <div
                    key={product.id}
                    className={`grid grid-cols-12 gap-1 px-2 py-1.5 items-center hover:bg-bg-glass-light transition-colors group ${isInAllowance ? 'bg-emerald-500/5' : ''}`}
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
                      <span className={`font-mono font-semibold text-sm ${isInAllowance ? 'text-emerald-400' : ''}`}>
                        {isInAllowance ? '£0.00' : `£${Number(product.basePrice).toFixed(2)}`}
                      </span>
                      {!isInAllowance && (
                        <span className="text-xs text-text-muted ml-1">
                          /{product.priceUnit === 'LINEAR_METER' ? 'm' : 'ea'}
                        </span>
                      )}
                    </div>
                    {/* Allowance Checkbox */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setAllowances((prev) => ({
                          ...prev,
                          [product.id]: !prev[product.id],
                        }))}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isInAllowance
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border-glass hover:border-emerald-400'
                        }`}
                        title={isInAllowance ? 'Remove from allowance' : 'Include in allowance (free)'}
                      >
                        {isInAllowance && <Check className="w-3 h-3" />}
                      </button>
                    </div>
                    {/* Quantity with themed up/down */}
                    <div className="col-span-2 flex justify-start">
                      <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQuantities((prev) => ({
                            ...prev,
                            [product.id]: Math.max(minQty, (prev[product.id] || 1) - step),
                          }))}
                          className="px-1.5 py-1 hover:bg-bg-glass transition-colors text-text-muted hover:text-[#B19334]"
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
                          className="px-1.5 py-1 hover:bg-bg-glass transition-colors text-text-muted hover:text-[#B19334]"
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
      </CardContent>
    </Card>
  );
}
