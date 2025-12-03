'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
}

export function Pagination({ page, total, limit }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-border-glass pt-4">
      <div className="text-sm text-text-secondary">
        Showing {startItem} to {endItem} of {total} results
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first page, last page, current page, and pages around current
              return (
                p === 1 ||
                p === totalPages ||
                (p >= page - 1 && p <= page + 1)
              );
            })
            .map((p, i, arr) => {
              // Add ellipsis if there's a gap
              const prevPage = arr[i - 1];
              const showEllipsis = prevPage && p - prevPage > 1;

              return (
                <React.Fragment key={p}>
                  {showEllipsis && (
                    <span className="px-2 text-text-secondary">...</span>
                  )}
                  <button
                    onClick={() => goToPage(p)}
                    className={cn(
                      'min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors',
                      p === page
                        ? 'bg-accent-primary text-white'
                        : 'hover:bg-bg-glass text-text-secondary'
                    )}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
