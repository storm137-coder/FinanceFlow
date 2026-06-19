'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const colorStyles = {
  default: {
    bar: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
    track: 'bg-indigo-100 dark:bg-indigo-950/50',
  },
  success: {
    bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    track: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
  warning: {
    bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
    track: 'bg-amber-100 dark:bg-amber-950/50',
  },
  danger: {
    bar: 'bg-gradient-to-r from-red-500 to-red-400',
    track: 'bg-red-100 dark:bg-red-950/50',
  },
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

interface ProgressBarProps {
  value: number;
  color?: keyof typeof colorStyles;
  size?: keyof typeof sizeStyles;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  color = 'default',
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Progress
          </span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          sizeStyles[size],
          colorStyles[color].track
        )}
      >
        <motion.div
          initial={animated ? { width: 0 } : { width: `${clampedValue}%` }}
          animate={{ width: `${clampedValue}%` }}
          transition={
            animated
              ? { duration: 1, ease: 'easeOut', delay: 0.2 }
              : { duration: 0 }
          }
          className={cn(
            'h-full rounded-full relative',
            colorStyles[color].bar
          )}
        >
          {animated && (
            <div className="absolute inset-0 animate-shimmer rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
