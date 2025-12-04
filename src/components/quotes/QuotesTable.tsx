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
import { useQueryClient } from '@tanstack/react-query';

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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; openUp: boolean }>({ top: 0, left: 0, openUp: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 150; // Approximate menu height
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuHeight;

      setMenuPosition({
        top: openUp ? rect.top : rect.bottom + 4,
        left: rect.right - 192, // 192px = w-48 (12rem)
        openUp
      });
    }
  }, [isOpen]);

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/quotes/${quote.id}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to duplicate');
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      router.push(`/quotes/${data.data.id}?edit=true`);
    } catch (error) {
      console.error('Failed to duplicate:', error);
    }
    setIsOpen(false);
  };

  const handleArchive = async () => {
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      if (!res.ok) throw new Error('Failed to archive');
      router.refresh();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quote? This cannot be undone.')) {
      setIsOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.error || 'Failed to delete quote';
        alert(message);
        setIsOpen(false);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      router.refresh();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete quote. Please try again.');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-transparent text-text-primary hover:bg-bg-glass-light transition-all duration-200 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu - fixed position to escape container overflow */}
          <div
            className="fixed w-48 bg-bg-elevated border border-border-glass rounded-lg shadow-xl py-1 z-[9999]"
            style={{
              top: menuPosition.openUp ? 'auto' : menuPosition.top,
              bottom: menuPosition.openUp ? `${window.innerHeight - menuPosition.top + 4}px` : 'auto',
              left: menuPosition.left
            }}
          >
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-glass-light flex items-center gap-2 transition-colors uppercase"
              onClick={handleDuplicate}
            >
              <Copy className="w-4 h-4" />
              DUPLICATE
            </button>
            {quote.status !== 'ARCHIVED' && (
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-glass-light flex items-center gap-2 transition-colors uppercase"
                onClick={handleArchive}
              >
                <Archive className="w-4 h-4" />
                ARCHIVE
              </button>
            )}
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors uppercase"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>
          </div>
        </>
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
