import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Budget } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const percentage = Math.min(Math.round((budget.spent / budget.amount) * 100), 100);
  const remaining = budget.amount - budget.spent;
  const isExceeded = budget.spent > budget.amount;

  let progressColor: 'success' | 'danger' | 'warning' | 'default' = 'success';
  let badgeColor = 'bg-green-500/10 text-green-500';
  let warningMessage = null;

  if (percentage >= 100 || isExceeded) {
    progressColor = 'danger';
    badgeColor = 'bg-red-500/10 text-red-500';
    warningMessage = 'Budget Exceeded';
  } else if (percentage >= 90) {
    progressColor = 'danger';
    badgeColor = 'bg-red-400/10 text-red-400';
    warningMessage = 'Almost Exhausted (>90%)';
  } else if (percentage >= 75) {
    progressColor = 'warning';
    badgeColor = 'bg-orange-500/10 text-orange-500';
    warningMessage = 'Nearing Limit (>75%)';
  } else if (percentage >= 50) {
    progressColor = 'warning';
    badgeColor = 'bg-yellow-500/10 text-yellow-500';
    warningMessage = 'Halfway There (>50%)';
  }

  return (
    <Card className="p-5 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              {budget.category}
            </h3>
            {warningMessage && (
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", badgeColor)}>
                {warningMessage}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatCurrency(budget.spent)} spent of {formatCurrency(budget.amount)}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(budget)}>
            <HiOutlinePencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => onDelete(budget.id)}>
            <HiOutlineTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {percentage}% Used
          </span>
          <span className={cn("font-medium", isExceeded ? "text-red-500" : "text-slate-700 dark:text-slate-300")}>
            {isExceeded ? 'Exceeded by ' : 'Remaining: '}
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>
        <ProgressBar value={percentage} color={progressColor} className="h-2" />
      </div>
    </Card>
  );
}
