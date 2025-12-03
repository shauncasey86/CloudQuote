'use client';

import React from 'react';
import Link from 'next/link';
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
  MoreVertical
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

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
  SENT: 'success',
  SAVED: 'info',
  ARCHIVED: 'danger',
};

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
          <TableRow key={quote.id} className="group">
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
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/quotes/${quote.id}`}>
                  <Button variant="ghost" size="icon" title="View">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/quotes/${quote.id}/edit`}>
                  <Button variant="ghost" size="icon" title="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" title="More actions">
                  <MoreVertical className="w-4 h-4" />
                </Button>
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
