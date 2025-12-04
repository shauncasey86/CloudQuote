'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { QuoteStatus } from '@prisma/client';
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
import {
  Eye,
  Edit,
  Copy,
  Archive,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  address: string;
  status: QuoteStatus;
  total: number;
  createdAt: Date | string;
  _count?: {
    items: number;
  };
  createdBy?: {
    name: string;
  };
}

interface QuotesTableProps {
  quotes: Quote[];
  isLoading?: boolean;
}

const statusVariants: Record<QuoteStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'default',
  FINALIZED: 'warning',
  PRINTED: 'info',
  SENT: 'success',
  SAVED: 'info',
  ARCHIVED: 'danger',
};

function ActionsDropdown({ quote }: { quote: Quote }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    // Use setTimeout to avoid the immediate click that opened the menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotes/${quote.id}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to duplicate');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      router.push(`/quotes/${data.data.id}?edit=true`);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      if (!res.ok) throw new Error('Failed to archive');
      return res.json();
    },
    onSuccess: () => {
      setIsOpen(false);
      router.refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      setIsOpen(false);
      // Use router.refresh() to re-fetch server component data
      router.refresh();
    },
  });

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        title="More actions"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="p-2.5 rounded-xl bg-transparent text-text-primary hover:bg-bg-glass-light transition-all duration-200 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {isOpen && (
        <div
          className="fixed w-48 bg-bg-elevated border border-border-glass rounded-lg shadow-xl py-1"
          style={{ top: dropdownPosition.top, right: dropdownPosition.right, zIndex: 9999 }}
        >
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-glass-light flex items-center gap-2 transition-colors uppercase"
            onClick={() => {
              duplicateMutation.mutate();
              setIsOpen(false);
            }}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="w-4 h-4" />
            {duplicateMutation.isPending ? 'DUPLICATING...' : 'DUPLICATE'}
          </button>
          {quote.status !== 'ARCHIVED' && (
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-glass-light flex items-center gap-2 transition-colors uppercase"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              <Archive className="w-4 h-4" />
              {archiveMutation.isPending ? 'ARCHIVING...' : 'ARCHIVE'}
            </button>
          )}
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors uppercase"
            onClick={() => {
              if (confirm('Are you sure you want to delete this quote? This cannot be undone.')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? 'DELETING...' : 'DELETE'}
          </button>
        </div>
      )}
    </div>
  );
}

export function QuotesTable({ quotes, isLoading }: QuotesTableProps) {
  if (isLoading) {
    return <QuotesTableSkeleton />;
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-lg">No quotes found</p>
        <p className="text-text-secondary text-sm mt-2">
          Create your first quote to get started
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quote #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.id} className="group relative">
            <TableCell className="font-mono font-medium">
              <Link
                href={`/quotes/${quote.id}`}
                className="hover:text-accent-primary transition-colors"
              >
                {quote.quoteNumber}
              </Link>
            </TableCell>
            <TableCell className="font-medium">
              {quote.customerName}
            </TableCell>
            <TableCell className="text-text-secondary max-w-xs truncate">
              {quote.address}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariants[quote.status]}>
                {quote.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono font-medium">
              £{Number(quote.total).toFixed(2)}
            </TableCell>
            <TableCell className="text-text-secondary">
              {quote._count?.items || 0} items
            </TableCell>
            <TableCell className="text-text-secondary">
              {format(new Date(quote.createdAt), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Link href={`/quotes/${quote.id}`}>
                  <Button variant="ghost" size="icon" title="View">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/quotes/${quote.id}?edit=true`}>
                  <Button variant="ghost" size="icon" title="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <ActionsDropdown quote={quote} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function QuotesTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quote #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20 ml-auto" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
