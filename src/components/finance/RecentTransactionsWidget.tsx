'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/currency';
import { formatDateSafe } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

export function RecentTransactionsWidget() {
  const { recentTransactions, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card animate-pulse">
        <div className="h-4 bg-surface-sunken rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-surface-sunken rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card flex flex-col h-full shadow-sm card-hover-effect">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        <Link
          href="/transactions"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All &rarr;
        </Link>
      </div>

      {!recentTransactions || recentTransactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center py-8">
          <div className="mb-3 h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium">No transactions found</p>
          <p className="text-xs mt-1">Add your first transaction to get started.</p>
        </div>
      ) : (
        <ul className="space-y-1 flex-1">
          {recentTransactions.map(tx => (
            <li key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-sunken/60 transition-all duration-150 -mx-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                  ${tx.type === 'income' ? 'bg-positive-soft text-positive' :
                    tx.type === 'expense' ? 'bg-negative-soft text-negative' :
                    'bg-accent-soft text-accent'}`}
                >
                  {tx.type === 'income' && <ArrowUpRight className="h-4 w-4" />}
                  {tx.type === 'expense' && <ArrowDownRight className="h-4 w-4" />}
                  {tx.type === 'transfer' && <ArrowRightLeft className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.categoryId}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDateSafe(tx.date, 'MMM d, yyyy')}
                    {tx.merchant ? ` · ${tx.merchant}` : ''}
                  </p>
                </div>
              </div>
              <div className={`font-mono text-sm font-medium tabular-nums shrink-0 ml-3 ${tx.type === 'income' ? 'text-positive' : tx.type === 'expense' ? 'text-negative' : 'text-foreground'}`}>
                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                {formatCurrency((tx.amountMinorUnits !== undefined ? tx.amountMinorUnits : ((tx as any).amount || 0) * 100), tx.currency)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

