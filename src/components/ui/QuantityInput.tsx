// src/components/ui/QuantityInput.tsx
'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export function QuantityInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  unit,
  size = 'md',
  className,
  disabled = false,
}: QuantityInputProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = max !== undefined ? Math.min(max, value + step) : value + step;
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || min;
    if (newValue >= min && (max === undefined || newValue <= max)) {
      onChange(newValue);
    }
  };

  const sizeClasses = {
    sm: {
      button: 'px-1 py-0.5',
      icon: 'w-3 h-3',
      input: 'w-10 py-0.5 text-xs',
    },
    md: {
      button: 'px-1.5 py-1',
      icon: 'w-3.5 h-3.5',
      input: 'w-12 py-1 text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(
            classes.button,
            'hover:bg-bg-glass transition-colors text-text-muted hover:text-gold',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-text-muted'
          )}
        >
          <ChevronDown className={classes.icon} />
        </button>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn(
            classes.input,
            'text-center bg-transparent focus:outline-none',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className={cn(
            classes.button,
            'hover:bg-bg-glass transition-colors text-text-muted hover:text-gold',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-text-muted'
          )}
        >
          <ChevronUp className={classes.icon} />
        </button>
      </div>
      {unit && (
        <span className="text-xs text-text-secondary ml-1">{unit}</span>
      )}
    </div>
  );
}
