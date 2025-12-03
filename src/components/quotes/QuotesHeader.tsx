'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Search, Filter, Plus } from 'lucide-react';
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
      if (value && value !== 'all') {
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
          <h1 className="text-4xl font-bold text-gradient-nebula mb-2">
            Quotes
          </h1>
          <p className="text-text-secondary text-base">
            Manage and create kitchen installation quotes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/quotes/new">
            <Button variant="primary" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Quote
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 animate-fadeUp-delay-1">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by quote number, customer name, or address..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="input pl-12 w-full"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input w-full"
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
