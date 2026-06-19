'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { HiOutlineInbox } from 'react-icons/hi2';

interface EmptyStateProps {
  icon?: ReactNode | React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: { label: string; onClick: () => void } | ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  
  let IconElement: ReactNode = null;
  if (icon) {
    if (typeof icon === 'function') {
      const IconComp = icon as React.ElementType;
      IconElement = <IconComp className="w-8 h-8" />;
    } else {
      IconElement = icon as ReactNode;
    }
  } else {
    IconElement = <HiOutlineInbox className="w-8 h-8" />;
  }

  let actionElement = null;
  if (actionLabel && onAction) {
    actionElement = <Button onClick={onAction}>{actionLabel}</Button>;
  } else if (action && typeof action === 'object' && 'label' in action && 'onClick' in action) {
    const actionObj = action as { label: string; onClick: () => void };
    actionElement = <Button onClick={actionObj.onClick}>{actionObj.label}</Button>;
  } else if (action) {
    actionElement = action as ReactNode;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-6"
      >
        <div className="text-indigo-500 dark:text-indigo-400 text-3xl">{IconElement}</div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold text-slate-900 dark:text-white mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {actionElement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {actionElement}
        </motion.div>
      )}
    </motion.div>
  );
}
