'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { Charts } from '@/components/dashboard/Charts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { UpcomingBills } from '@/components/dashboard/UpcomingBills';
import { formatDate } from '@/lib/utils';
import type { Transaction, Bill } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: transactions, loading: txLoading } = useCollection<Transaction>('transactions', {
    orderByField: 'date',
    orderDirection: 'desc'
  });
  
  const { data: bills, loading: billsLoading } = useCollection<Bill>('bills', {
    orderByField: 'dueDate',
    orderDirection: 'asc'
  });

  // Derived stats
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let lastMonthIncome = 0;
    let lastMonthExpenses = 0;
    
    transactions?.forEach(tx => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      const isLastMonth = txDate.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) && 
                          txDate.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
                          
      if (tx.type === 'income') {
        income += tx.amount;
        if (isCurrentMonth) lastMonthIncome += 0; // simplify for now, keeping running totals
      } else {
        expenses += tx.amount;
      }
    });
    
    const balance = income - expenses;
    const savings = balance > 0 ? balance : 0;
    
    return {
      balance, income, expenses, savings,
      balanceChange: 5.2, // mock percentage
      incomeChange: 2.1,
      expenseChange: -1.5,
      savingsChange: 8.4
    };
  }, [transactions]);

  // Chart data
  const chartData = useMemo(() => {
    const monthlyMap: Record<string, { income: number; expenses: number }> = {};
    const categoryMap: Record<string, number> = {};
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      monthlyMap[monthStr] = { income: 0, expenses: 0 };
    }
    
    transactions?.forEach(tx => {
      const txDate = new Date(tx.date);
      const monthStr = txDate.toLocaleString('default', { month: 'short' });
      
      if (monthlyMap[monthStr]) {
        if (tx.type === 'income') {
          monthlyMap[monthStr].income += tx.amount;
        } else {
          monthlyMap[monthStr].expenses += tx.amount;
        }
      }
      
      if (tx.type === 'expense') {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });
    
    const monthlyData = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6);
    
    return { monthlyData, categoryData };
  }, [transactions]);

  const recentTxs = transactions?.slice(0, 10) || [];
  
  // Filter bills due in next 7 days
  const upcomingBills = useMemo(() => {
    if (!bills) return [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return bills.filter(b => {
      if (b.status === 'paid') return false;
      const due = new Date(b.dueDate);
      due.setHours(0,0,0,0);
      return due >= today && due <= nextWeek;
    }).slice(0, 5);
  }, [bills]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Hello, {user?.displayName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Here's what's happening with your finances today, {formatDate(new Date().toISOString())}.
          </p>
        </div>
      </div>

      <StatsGrid 
        {...stats} 
        isLoading={txLoading}
      />

      <QuickActions />

      <Charts 
        monthlyData={chartData.monthlyData}
        categoryData={chartData.categoryData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 h-full items-stretch">
        <RecentTransactions transactions={recentTxs} />
        <UpcomingBills bills={upcomingBills} />
      </div>
    </motion.div>
  );
}
