'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Search, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { QuoteStatus } from '@prisma/client';

export function QuotesHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'all');

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

  const handleStatusChange = React.useCallback(
    (value: string) => {
      setStatus(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('status', value);
      } else {
        params.delete('status');
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
            Quotes
          </h1>
          <p className="text-text-muted">
            Manage and create kitchen installation quotes
          </p>
        </div>
        <Link href="/quotes/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by quote number, customer, or address..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input w-full cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value={QuoteStatus.DRAFT}>Draft</option>
            <option value={QuoteStatus.FINALIZED}>Finalized</option>
            <option value={QuoteStatus.SENT}>Sent</option>
            <option value={QuoteStatus.SAVED}>Saved</option>
            <option value={QuoteStatus.ARCHIVED}>Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
}
