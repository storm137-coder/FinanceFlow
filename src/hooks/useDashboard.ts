'use client';

import { useState, useMemo } from 'react';
import { useCollection } from '@/hooks/useCollection';
import type { Transaction, Goal, Budget, Bill, Investment, Loan, WishlistItem } from '@/types';

export function useDashboard() {
  const { data: transactions, loading: txLoading } = useCollection<Transaction>('transactions');
  const { data: goals, loading: goalsLoading } = useCollection<Goal>('goals');
  const { data: budgets, loading: budgetsLoading } = useCollection<Budget>('budgets');
  const { data: bills, loading: billsLoading } = useCollection<Bill>('bills');
  const { data: investments, loading: investmentsLoading } = useCollection<Investment>('investments');
  const { data: loans, loading: loansLoading } = useCollection<Loan>('loans');

  const loading = txLoading || goalsLoading || budgetsLoading || billsLoading || investmentsLoading || loansLoading;

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const lastMonthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const totalIncome = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastExpenses = lastMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incomeChange = lastIncome > 0 ? ((totalIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses > 0 ? ((totalExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    return {
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      totalSavings: totalIncome - totalExpenses,
      incomeChange: Math.round(incomeChange),
      expenseChange: Math.round(expenseChange),
      savingsChange: 0,
    };
  }, [transactions]);

  const recentTransactions = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    [transactions]
  );

  const upcomingBills = useMemo(() => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return bills.filter(b => {
      if (b.status === 'paid') return false;
      const due = new Date(b.dueDate);
      return due <= weekLater;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { name: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthTx = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y;
      });
      months.push({
        name: d.toLocaleDateString('en', { month: 'short' }),
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const expenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const catMap: Record<string, number> = {};
    expenses.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return {
    loading,
    stats,
    recentTransactions,
    upcomingBills,
    monthlyData,
    categoryData,
    transactions,
    goals,
    budgets,
    bills,
    investments,
    loans,
  };
}
