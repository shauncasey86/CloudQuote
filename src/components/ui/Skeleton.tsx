// src/components/ui/Skeleton.tsx

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-shimmer skeleton',
          variant === 'text' && 'h-4 w-full',
          variant === 'circular' && 'rounded-full',
          variant === 'rectangular' && 'rounded',
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="table-container">
      <div className="space-y-2 p-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
