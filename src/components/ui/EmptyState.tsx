// src/components/ui/EmptyState.tsx
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: 'py-6 px-4',
      iconWrapper: 'w-10 h-10 mb-3',
      icon: 'w-5 h-5',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      container: 'py-8 px-6',
      iconWrapper: 'w-14 h-14 mb-4',
      icon: 'w-7 h-7',
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      container: 'py-12 px-8',
      iconWrapper: 'w-16 h-16 mb-4',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'glass-card text-center',
        styles.container,
        className
      )}
      role="status"
      aria-label={title}
    >
      <div className="max-w-sm mx-auto">
        {Icon && (
          <div
            className={cn(
              'bg-bg-glass rounded-full flex items-center justify-center mx-auto',
              styles.iconWrapper
            )}
          >
            <Icon className={cn(styles.icon, 'text-text-secondary')} aria-hidden="true" />
          </div>
        )}
        <h3 className={cn('font-semibold text-text-primary mb-2', styles.title)}>
          {title}
        </h3>
        {description && (
          <p className={cn('text-text-secondary mb-4', styles.description)}>
            {description}
          </p>
        )}
        {action && (
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            size={size === 'lg' ? 'default' : 'sm'}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
