'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variantStyles = {
  default:
    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm',
  glass:
    'bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-lg',
  gradient:
    'bg-white dark:bg-slate-800 border border-transparent shadow-lg',
  outlined:
    'bg-transparent border-2 border-slate-200 dark:border-slate-700',
};

interface CardProps {
  children?: ReactNode;
  className?: string;
  variant?: keyof typeof variantStyles;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  gradient = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow:
                '0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.06)',
            }
          : undefined
      }
      onClick={onClick}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variantStyles[variant],
        gradient &&
          'relative overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:-z-10',
        hover && 'cursor-pointer',
        className
      )}
    >
      {gradient && (
        <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-800 -z-[5]" />
      )}
      {children}
    </motion.div>
  );
}
