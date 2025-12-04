'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFormModal, ProductFormData } from '@/components/products/ProductFormModal';
import { CategoryFormModal, CategoryFormData } from '@/components/products/CategoryFormModal';
import { useSession } from 'next-auth/react';
import { Role, PriceUnit } from '@prisma/client';
import { toast } from 'sonner';

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

export default function ProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [isSavingCategory, setIsSavingCategory] = React.useState(false);

  const isAdmin = session?.user?.role === Role.ADMIN;

  // Fetch categories
  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch products
  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const search = searchParams.get('search');

      if (search) params.set('search', search);
      if (selectedCategory) params.set('categoryId', selectedCategory);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, selectedCategory]);

  // Initial data fetch
  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Product handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to ${product.active ? 'deactivate' : 'delete'} "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success(`Product ${product.active ? 'deactivated' : 'deleted'}`);
      fetchProducts();
      fetchCategories();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleProductFormSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

      const method = editingProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      toast.success(editingProduct ? 'Product updated' : 'Product created');
      await fetchProducts();
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    const hasProducts = category._count.products > 0;
    const action = hasProducts ? 'deactivate' : 'delete';

    if (!confirm(`Are you sure you want to ${action} "${category.name}"?${hasProducts ? ' This category has products and will be deactivated.' : ''}`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      const result = await response.json();
      toast.success(result.deactivated ? 'Category deactivated' : 'Category deleted');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleCategoryFormSubmit = async (data: CategoryFormData) => {
    setIsSavingCategory(true);
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';

      const method = editingCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      toast.success(editingCategory ? 'Category updated' : 'Category created');
      await fetchCategories();
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
      throw error;
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Reorder handlers
  const handleReorderCategories = async (orderedIds: string[]) => {
    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder categories');
      }

      const result = await response.json();
      setCategories(result.data);
      toast.success('Categories reordered');
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Failed to reorder categories');
      fetchCategories(); // Revert to original order
    }
  };

  const handleReorderProducts = async (orderedIds: string[], categoryId: string | null) => {
    try {
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds, categoryId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder products');
      }

      const result = await response.json();
      setProducts(result.data);
      toast.success('Products reordered');
    } catch (error) {
      console.error('Error reordering products:', error);
      toast.error('Failed to reorder products');
      fetchProducts(); // Revert to original order
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.id === selectedCategory)
    : products;

  return (
    <div className="space-y-6">
      <ProductsHeader onAddProduct={handleAddProduct} onAddCategory={handleAddCategory} isAdmin={isAdmin} />

      <Card className="animate-fadeUp-delay-2" hover={false}>
        <CardContent className="p-6">
          <ProductsTable
            products={filteredProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onReorderCategories={handleReorderCategories}
            onReorderProducts={handleReorderProducts}
          />
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      {isAdmin && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={editingProduct}
          categories={categories}
          onSubmit={handleProductFormSubmit}
          isLoading={isSaving}
        />
      )}

      {/* Category Form Modal */}
      {isAdmin && (
        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          category={editingCategory}
          onSubmit={handleCategoryFormSubmit}
          isLoading={isSavingCategory}
        />
      )}
    </div>
  );
}
