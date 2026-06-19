'use client';

import { useState, useMemo } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction, Bill, Goal } from '@/types';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { HiChevronLeft, HiChevronRight, HiOutlineXMark } from 'react-icons/hi2';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: transactions, loading: txLoading } = useCollection<Transaction>('transactions');
  const { data: bills, loading: billsLoading } = useCollection<Bill>('bills');
  const { data: goals, loading: goalsLoading } = useCollection<Goal>('goals');

  const currency = user?.currency || 'USD';
  const loading = txLoading || billsLoading || goalsLoading;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, {
      transactions: Transaction[];
      bills: Bill[];
      goals: Goal[];
    }>();

    const getMapEntry = (dateStr: string) => {
      if (!map.has(dateStr)) {
        map.set(dateStr, { transactions: [], bills: [], goals: [] });
      }
      return map.get(dateStr)!;
    };

    transactions?.forEach(tx => {
      const d = parseISO(tx.date);
      const dateStr = format(d, 'yyyy-MM-dd');
      getMapEntry(dateStr).transactions.push(tx);
    });

    bills?.forEach(bill => {
      const d = parseISO(bill.dueDate);
      const dateStr = format(d, 'yyyy-MM-dd');
      getMapEntry(dateStr).bills.push(bill);
    });

    goals?.forEach(goal => {
      if (goal.deadline) {
        const d = parseISO(goal.deadline);
        const dateStr = format(d, 'yyyy-MM-dd');
        getMapEntry(dateStr).goals.push(goal);
      }
    });

    return map;
  }, [transactions, bills, goals]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const selectedDateItems = selectedDate ? itemsByDate.get(format(selectedDate, 'yyyy-MM-dd')) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Financial Calendar</h1>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-md">
          <Button variant="ghost" size="sm" onClick={prevMonth} className="text-white hover:bg-white/10 p-2">
            <HiChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-white font-medium min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="text-white hover:bg-white/10 p-2">
            <HiChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-white/10 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-medium text-white/60">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[100px] sm:auto-rows-[120px] gap-px bg-white/10">
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const items = itemsByDate.get(dateStr);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "bg-slate-900/80 p-2 relative cursor-pointer hover:bg-white/5 transition-colors overflow-hidden",
                  !isSameMonth(day, currentDate) && "text-white/30 bg-slate-900/40",
                  isSelected && "ring-2 ring-primary-500 ring-inset bg-white/5",
                )}
              >
                <span className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                  isToday(day) ? "bg-primary-500 text-white" : "text-white/80"
                )}>
                  {format(day, 'd')}
                </span>

                <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] no-scrollbar">
                  {items?.transactions.map(tx => (
                    <div key={tx.id} className={cn(
                      "text-xs px-1.5 py-0.5 rounded truncate",
                      tx.type === 'income' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </div>
                  ))}
                  {items?.bills.map(bill => (
                    <div key={bill.id} className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 truncate">
                      Bill: {bill.name}
                    </div>
                  ))}
                  {items?.goals.map(goal => (
                    <div key={goal.id} className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 truncate">
                      Goal: {goal.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
      >
        <div className="space-y-6">
          {!selectedDateItems || (
            selectedDateItems.transactions.length === 0 &&
            selectedDateItems.bills.length === 0 &&
            selectedDateItems.goals.length === 0
          ) ? (
            <p className="text-white/50 text-center py-4">No events on this date.</p>
          ) : (
            <>
              {selectedDateItems.transactions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Transactions</h4>
                  <div className="space-y-2">
                    {selectedDateItems.transactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{tx.merchant || tx.source || tx.description || 'Transaction'}</p>
                          <p className="text-white/50 text-xs capitalize">{tx.category.replace('_', ' ')}</p>
                        </div>
                        <span className={cn(
                          "font-semibold text-sm",
                          tx.type === 'income' ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDateItems.bills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Bills Due</h4>
                  <div className="space-y-2">
                    {selectedDateItems.bills.map(bill => (
                      <div key={bill.id} className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{bill.name}</p>
                          <p className={cn(
                            "text-xs mt-0.5",
                            bill.status === 'paid' ? "text-emerald-400" : "text-blue-400"
                          )}>
                            {bill.status}
                          </p>
                        </div>
                        <span className="font-semibold text-sm text-white">
                          {formatCurrency(bill.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDateItems.goals.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Goal Deadlines</h4>
                  <div className="space-y-2">
                    {selectedDateItems.goals.map(goal => (
                      <div key={goal.id} className="flex flex-col p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg gap-2">
                        <div className="flex justify-between items-center">
                          <p className="text-white text-sm font-medium">{goal.name}</p>
                          <span className="text-white text-sm">{formatCurrency(goal.targetAmount, currency)}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="pt-4 flex justify-end">
            <Button variant="secondary" onClick={() => setSelectedDate(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
