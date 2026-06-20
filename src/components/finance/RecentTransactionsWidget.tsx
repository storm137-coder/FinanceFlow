'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export function RecentTransactionsWidget() {
  const { recentTransactions, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card h-80 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-border bg-card flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Recent Transactions</h3>
        <Link href="/transactions" className="text-sm text-primary hover:underline font-medium">
          View All
        </Link>
      </div>

      {!recentTransactions || recentTransactions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          No transactions found.
        </div>
      ) : (
        <ul className="space-y-4 flex-1">
          {recentTransactions.map(tx => (
            <li key={tx.id} className="flex items-center justify-between p-2 rounded hover:bg-surface-sunken transition-colors -mx-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${tx.type === 'income' ? 'bg-positive/10 text-positive' : 
                    tx.type === 'expense' ? 'bg-negative/10 text-negative' : 
                    'bg-accent/10 text-accent'}`}
                >
                  {tx.type === 'income' && <ArrowUpRight className="h-5 w-5" />}
                  {tx.type === 'expense' && <ArrowDownRight className="h-5 w-5" />}
                  {tx.type === 'transfer' && <ArrowRightLeft className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-sm leading-none">{tx.categoryId}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(tx.date), 'MMM d, yyyy')}
                    {tx.merchant ? ` • ${tx.merchant}` : ''}
                  </p>
                </div>
              </div>
              <div className={`font-mono text-sm font-medium ${tx.type === 'income' ? 'text-positive' : 'text-foreground'}`}>
                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                {formatCurrency(tx.amountMinorUnits, tx.currency)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
