// src/components/ui/Badge.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { QuoteStatus } from '@prisma/client';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-bg-glass text-text-primary border border-border-glass',
        primary: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
        success: 'bg-green-500/10 text-green-400 border border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
        info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

// Status-specific badge component
export interface StatusBadgeProps {
  status: QuoteStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
    DRAFT: {
      label: 'Draft',
      className: 'badge-draft',
    },
    FINALIZED: {
      label: 'Finalized',
      className: 'badge-finalized',
    },
    PRINTED: {
      label: 'Printed',
      className: 'badge-printed',
    },
    SENT: {
      label: 'Sent',
      className: 'badge-sent',
    },
    SAVED: {
      label: 'Saved',
      className: 'badge-saved',
    },
    ARCHIVED: {
      label: 'Archived',
      className: 'badge-archived',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';
