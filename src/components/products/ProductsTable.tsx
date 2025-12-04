'use client';

import React from 'react';
import { PriceUnit } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, AlertCircle, Plus, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface Product {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  basePrice: number;
  priceUnit: PriceUnit;
  active: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: {
    products: number;
  };
}

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading?: boolean;
  isAdmin: boolean;
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  onReorderCategories?: (orderedIds: string[]) => void;
  onReorderProducts?: (orderedIds: string[], categoryId: string | null) => void;
}

const priceUnitLabels: Record<PriceUnit, string> = {
  UNIT: 'Per Unit',
  LINEAR_METER: 'Per Linear Meter',
  SQUARE_METER: 'Per Square Meter',
};

export function ProductsTable({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
  onEdit,
  onDelete,
  isLoading,
  isAdmin,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  onReorderProducts,
}: ProductsTableProps) {
  const [draggedCategoryId, setDraggedCategoryId] = React.useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = React.useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = React.useState<string[]>([]);
  const [productOrder, setProductOrder] = React.useState<string[]>([]);

  // Initialize category order when categories change
  React.useEffect(() => {
    setCategoryOrder(categories.map(c => c.id));
  }, [categories]);

  // Initialize product order when products change
  React.useEffect(() => {
    setProductOrder(products.map(p => p.id));
  }, [products]);

  // Category drag handlers
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', categoryId);
  };

  const handleCategoryDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedCategoryId || draggedCategoryId === targetId) return;

    const newOrder = [...categoryOrder];
    const draggedIndex = newOrder.indexOf(draggedCategoryId);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCategoryId);

    setCategoryOrder(newOrder);
  };

  const handleCategoryDragEnd = () => {
    if (draggedCategoryId && onReorderCategories) {
      onReorderCategories(categoryOrder);
    }
    setDraggedCategoryId(null);
  };

  // Product drag handlers
  const handleProductDragStart = (e: React.DragEvent, productId: string) => {
    setDraggedProductId(productId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', productId);
  };

  const handleProductDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedProductId || draggedProductId === targetId) return;

    const newOrder = [...productOrder];
    const draggedIndex = newOrder.indexOf(draggedProductId);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedProductId);

    setProductOrder(newOrder);
  };

  const handleProductDragEnd = () => {
    if (draggedProductId && onReorderProducts) {
      onReorderProducts(productOrder, selectedCategory);
    }
    setDraggedProductId(null);
  };

  // Sort categories and products by drag order
  const orderedCategories = [...categories].sort(
    (a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id)
  );

  const orderedProducts = [...products].sort(
    (a, b) => productOrder.indexOf(a.id) - productOrder.indexOf(b.id)
  );

  if (isLoading) {
    return <ProductsTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-glass">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === null
              ? 'bg-accent-primary text-white shadow-glow'
              : 'bg-glass hover:bg-glass-hover text-text-secondary hover:text-text-primary'
          }`}
        >
          All Categories
          <span className="ml-2 text-sm opacity-75">
            ({products.length})
          </span>
        </button>

        {orderedCategories.map((category) => (
          <div
            key={category.id}
            className={`group relative flex items-center ${
              isAdmin ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
            draggable={isAdmin}
            onDragStart={(e) => handleCategoryDragStart(e, category.id)}
            onDragOver={(e) => handleCategoryDragOver(e, category.id)}
            onDragEnd={handleCategoryDragEnd}
          >
            {isAdmin && (
              <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
            )}
            <button
              onClick={() => onCategoryChange(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-accent-primary text-white shadow-glow'
                  : 'bg-glass hover:bg-glass-hover text-text-secondary hover:text-text-primary'
              } ${draggedCategoryId === category.id ? 'opacity-50' : ''}`}
            >
              {category.name}
              <span className="ml-2 text-sm opacity-75">
                ({category._count.products})
              </span>
            </button>

            {/* Category edit/delete buttons */}
            {isAdmin && (
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory?.(category);
                  }}
                  className="w-6 h-6 rounded-full bg-bg-elevated border border-border-glass flex items-center justify-center hover:bg-accent-primary hover:border-accent-primary transition-colors"
                  title="Edit category"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory?.(category);
                  }}
                  className="w-6 h-6 rounded-full bg-bg-elevated border border-border-glass flex items-center justify-center hover:bg-accent-danger hover:border-accent-danger transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add category button */}
        {isAdmin && (
          <button
            onClick={onAddCategory}
            className="px-4 py-2 rounded-lg font-medium transition-all bg-glass hover:bg-glass-hover text-text-secondary hover:text-text-primary border-2 border-dashed border-border-glass hover:border-accent-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Products Table */}
      {orderedProducts.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary text-lg">No products found</p>
          <p className="text-text-secondary text-sm mt-2">
            {selectedCategory
              ? 'Try selecting a different category or adjusting your search'
              : isAdmin
              ? 'Create your first product to get started'
              : 'No products available yet'}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead className="w-10"></TableHead>}
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
              <TableHead>Pricing Model</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedProducts.map((product) => (
              <TableRow
                key={product.id}
                className={`group ${draggedProductId === product.id ? 'opacity-50' : ''}`}
                draggable={isAdmin}
                onDragStart={(e) => handleProductDragStart(e, product.id)}
                onDragOver={(e) => handleProductDragOver(e, product.id)}
                onDragEnd={handleProductDragEnd}
              >
                {isAdmin && (
                  <TableCell className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </TableCell>
                )}
                <TableCell className="font-mono text-sm text-text-secondary">
                  {product.sku || '—'}
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    {product.name}
                    {product.description && (
                      <div className="text-sm text-text-secondary mt-1 line-clamp-1">
                        {product.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{product.category.name}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  £{Number(product.basePrice).toFixed(2)}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {priceUnitLabels[product.priceUnit]}
                </TableCell>
                <TableCell>
                  <Badge variant={product.active ? 'success' : 'danger'}>
                    {product.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={product.active ? 'Deactivate' : 'Delete'}
                        onClick={() => onDelete(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Category tabs skeleton */}
      <div className="flex gap-2 pb-4 border-b border-glass">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Table skeleton */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Base Price</TableHead>
            <TableHead>Pricing Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
