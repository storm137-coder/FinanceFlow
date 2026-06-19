import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyles =
    'bg-slate-200 dark:bg-slate-700 animate-pulse';

  const variantStyles = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div
          key={i}
          className={cn(baseStyles, variantStyles[variant], className)}
          style={{
            width: width ?? (variant === 'circular' ? 40 : '100%'),
            height:
              height ??
              (variant === 'circular'
                ? 40
                : variant === 'rectangular'
                ? 100
                : 16),
          }}
        />
      ))}
    </div>
  );
}
