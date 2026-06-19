import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatRelativeDate, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { HiOutlineChevronRight } from 'react-icons/hi2';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const getCategoryDetails = (categoryName: string, type: 'income' | 'expense') => {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return list.find(c => c.value === categoryName || c.label === categoryName) || { label: categoryName, color: '#9ca3af', icon: '📝' };
  };

  return (
    <Card className="flex flex-col bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-xl overflow-hidden h-full">
      <div className="p-6 border-b border-zinc-200/20 dark:border-zinc-800/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Transactions</h3>
        <Link href="/transactions" className="text-sm text-indigo-500 hover:text-indigo-400 flex items-center transition-colors">
          View All <HiOutlineChevronRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      
      <div className="flex-1 p-0 overflow-y-auto max-h-[400px]">
        {transactions.length > 0 ? (
          <div className="divide-y divide-zinc-200/20 dark:divide-zinc-800/50">
            {transactions.map((tx) => {
              const category = getCategoryDetails(tx.category, tx.type);
              const isIncome = tx.type === 'income';
              
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/5 dark:hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.icon || (isIncome ? '💰' : '💸')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">
                        {isIncome ? tx.source : tx.merchant || tx.notes || 'Transaction'}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {category.label}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          {formatRelativeDate(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-semibold", isIncome ? "text-emerald-500" : "text-rose-500")}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState title="No recent transactions" description="Your latest transactions will appear here." />
          </div>
        )}
      </div>
    </Card>
  );
};
