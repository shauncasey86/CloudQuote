'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus } from 'lucide-react';
import { Product, ProductCategory } from '@prisma/client';

interface ProductWithCategory extends Product {
  category: ProductCategory;
}

interface ProductSelectorProps {
  products: ProductWithCategory[];
  categories: ProductCategory[];
  onAddProduct: (product: Product, quantity: number) => void;
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
    onAddProduct(product, quantity);
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-accent-primary text-white'
                : 'bg-bg-glass hover:bg-bg-elevated'
            }`}
          >
            All Products
          </button>
          {categories
            .filter((cat) => cat.active)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-glass hover:bg-bg-elevated'
                }`}
              >
                {category.name}
              </button>
            ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-bg-glass h-32 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p>No products found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-bg-glass border border-border-glass rounded-lg p-4 hover:border-accent-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    {product.sku && (
                      <p className="text-xs text-text-secondary font-mono mt-1">
                        {product.sku}
                      </p>
                    )}
                  </div>
                  <Badge variant="info" className="text-xs">
                    {product.category.name}
                  </Badge>
                </div>

                {product.description && (
                  <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold font-mono">
                    £{Number(product.basePrice).toFixed(2)}
                  </span>
                  <span className="text-xs text-text-secondary">
                    / {product.priceUnit === 'LINEAR_METER' ? 'm' : 'unit'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={Number(product.minQuantity) || 1}
                    max={Number(product.maxQuantity) || undefined}
                    step={product.priceUnit === 'LINEAR_METER' ? '0.1' : '1'}
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [product.id]: parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="input text-sm w-20"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    className="flex-1"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
