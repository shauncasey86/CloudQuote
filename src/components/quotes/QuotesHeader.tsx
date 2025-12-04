'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

export function QuotesHeader() {
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
      params.delete('page'); // Reset to page 1
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
          <h1 className="text-3xl font-bold text-text-primary mb-1">
            QUOTES
          </h1>
          <p className="text-text-muted">
            MANAGE AND CREATE KITCHEN INSTALLATION QUOTES
          </p>
        </div>
        <Link href="/quotes/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            NEW QUOTE
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="SEARCH BY QUOTE NUMBER, CUSTOMER, OR ADDRESS..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>
    </div>
  );
}
