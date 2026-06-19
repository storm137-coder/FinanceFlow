import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, cn } from '@/lib/utils';
import type { Bill } from '@/types';
import { HiOutlineChevronRight, HiOutlineCalendar } from 'react-icons/hi2';

interface UpcomingBillsProps {
  bills: Bill[];
}

export const UpcomingBills: React.FC<UpcomingBillsProps> = ({ bills }) => {
  const getDaysRemaining = (dueDate: string | Date | any) => {
    // Basic calculation for days remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (days === 0) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  };

  const getStatusText = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    return `In ${days}d`;
  };

  return (
    <Card className="flex flex-col bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-xl overflow-hidden h-full">
      <div className="p-6 border-b border-zinc-200/20 dark:border-zinc-800/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Upcoming Bills</h3>
        <Link href="/bills" className="text-sm text-indigo-500 hover:text-indigo-400 flex items-center transition-colors">
          View All <HiOutlineChevronRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      
      <div className="flex-1 p-0 overflow-y-auto max-h-[400px]">
        {bills.length > 0 ? (
          <div className="divide-y divide-zinc-200/20 dark:divide-zinc-800/50">
            {bills.map((bill) => {
              const daysRemaining = getDaysRemaining(bill.dueDate);
              const statusClass = getStatusColor(daysRemaining);
              
              return (
                <div key={bill.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/5 dark:hover:bg-zinc-800/20 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${statusClass}`}>
                      <HiOutlineCalendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {bill.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium border", statusClass)}>
                          {getStatusText(daysRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState title="No upcoming bills" description="You're all caught up for the next 7 days." />
          </div>
        )}
      </div>
    </Card>
  );
};
