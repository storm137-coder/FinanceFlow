import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Investment } from '@/types';
import { formatCurrency, cn, formatDate } from '@/lib/utils';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineBriefcase, HiOutlineBanknotes, HiOutlineArrowTrendingUp } from 'react-icons/hi2';

interface InvestmentCardProps {
  investment: Investment;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
}

export function InvestmentCard({ investment, onEdit, onDelete }: InvestmentCardProps) {
  const returns = investment.currentValue - investment.investedAmount;
  const returnsPercentage = (returns / investment.investedAmount) * 100;
  const isPositive = returns >= 0;

  const getIcon = () => {
    switch (investment.type.toLowerCase()) {
      case 'stocks': return <HiOutlineArrowTrendingUp className="w-5 h-5" />;
      case 'crypto': return <HiOutlineBanknotes className="w-5 h-5" />;
      default: return <HiOutlineBriefcase className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 leading-tight">
              {investment.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider">
                {investment.type}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {investment.broker}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(investment)}>
            <HiOutlinePencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => onDelete(investment.id)}>
            <HiOutlineTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Invested</p>
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(investment.investedAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Value</p>
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(investment.currentValue)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Since {formatDate(investment.purchaseDate)}
        </div>
        <div className={cn("flex flex-col items-end", isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
          <span className="font-bold">
            {isPositive ? '+' : ''}{formatCurrency(returns)}
          </span>
          <span className="text-xs font-medium bg-current/10 px-1.5 py-0.5 rounded mt-0.5">
            {isPositive ? '+' : ''}{returnsPercentage.toFixed(2)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
