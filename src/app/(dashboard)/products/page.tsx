'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFormModal, ProductFormData } from '@/components/products/ProductFormModal';
import { useSession } from 'next-auth/react';
import { Role, PriceUnit } from '@prisma/client';

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

      // Refresh the product list
      fetchProducts();
      fetchCategories(); // Update category counts
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
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

      // Refresh the product list
      await fetchProducts();
      await fetchCategories(); // Update category counts
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error instanceof Error ? error.message : 'Failed to save product. Please try again.');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setIsSaving(false);
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
      <ProductsHeader onAddProduct={handleAddProduct} isAdmin={isAdmin} />

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
          />
        </CardContent>
      </Card>

      {isAdmin && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
