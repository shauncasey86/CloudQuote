'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Search, Plus, FolderPlus } from 'lucide-react';

interface ProductsHeaderProps {
  onAddProduct: () => void;
  onAddCategory?: () => void;
  isAdmin: boolean;
}

export function ProductsHeader({ onAddProduct, onAddCategory, isAdmin }: ProductsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get('search') || '');

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearch(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounce search input
  const [searchValue, setSearchValue] = React.useState(search);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchChange(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, handleSearchChange]);

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient-nebula mb-2">
            Products
          </h1>
          <p className="text-text-secondary text-base">
            Manage product catalog and pricing
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && onAddCategory && (
            <Button variant="secondary" onClick={onAddCategory}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          )}
          {isAdmin && (
            <Button variant="primary" onClick={onAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 animate-fadeUp-delay-1">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by product name, code, or description..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="input pl-12 w-full"
          />
        </div>
      </div>
    </div>
  );
}
