'use client';

import { useState, useMemo } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction, Goal } from '@/types';
import { OverviewCharts } from '@/components/analytics/OverviewCharts';
import { CategoryCharts } from '@/components/analytics/CategoryCharts';
import { TrendCharts } from '@/components/analytics/TrendCharts';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { format, subMonths, isAfter, startOfMonth, parseISO } from 'date-fns';
import { HiOutlineChartBar, HiOutlineArrowTrendingUp, HiOutlineWallet, HiOutlineBanknotes } from 'react-icons/hi2';

type Period = 'this_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all_time';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('last_6_months');
  
  const { data: transactions, loading: txLoading } = useCollection<Transaction>('transactions');
  
  const { data: goals, loading: goalsLoading } = useCollection<Goal>('goals');

  const currency = user?.currency || 'USD';

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'this_month':
        startDate = startOfMonth(now);
        break;
      case 'last_3_months':
        startDate = startOfMonth(subMonths(now, 3));
        break;
      case 'last_6_months':
        startDate = startOfMonth(subMonths(now, 6));
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all_time':
      default:
        return transactions;
    }
    
    return transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return isAfter(txDate, startDate);
    });
  }, [transactions, period]);

  // Computed stats
  const { totalIncome, totalExpenses, savingsRate } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expenses += tx.amount;
    });
    
    const savings = income - expenses;
    const rate = income > 0 ? (savings / income) * 100 : 0;
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      savingsRate: Math.max(0, rate).toFixed(1)
    };
  }, [filteredTransactions]);

  // Prepare Overview Data
  const overviewData = useMemo(() => {
    if (!filteredTransactions.length) return [];
    
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    filteredTransactions.forEach(tx => {
      const date = parseISO(tx.date);
      const monthKey = format(date, 'MMM yy');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (tx.type === 'income') monthlyData[monthKey].income += tx.amount;
      if (tx.type === 'expense') monthlyData[monthKey].expenses += tx.amount;
    });
    
    const sortedKeys = Object.keys(monthlyData).sort((a, b) => {
      const d1 = new Date(a);
      const d2 = new Date(b);
      return d1.getTime() - d2.getTime();
    });

    return sortedKeys.map(key => ({
      month: key,
      income: monthlyData[key].income,
      expenses: monthlyData[key].expenses,
      cashFlow: monthlyData[key].income - monthlyData[key].expenses
    }));
  }, [filteredTransactions]);

  // Prepare Category Data
  const { expensesByCategory, topCategories } = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      });
      
    const data = Object.entries(categoryTotals)
      .map(([name, value]) => {
        const catDef = EXPENSE_CATEGORIES.find(c => c.value === name);
        return {
          name: catDef ? catDef.label : name,
          value,
          color: catDef ? catDef.color : '#94A3B8'
        };
      })
      .sort((a, b) => b.value - a.value);
      
    return {
      expensesByCategory: data,
      topCategories: data.slice(0, 5)
    };
  }, [filteredTransactions]);

  // Prepare Trend Data
  const { savingsData, goalData } = useMemo(() => {
    let cumulative = 0;
    const savings = overviewData.map(d => {
      cumulative += d.cashFlow;
      return {
        month: d.month,
        savings: cumulative
      };
    });

    const goalsMapped = (goals || []).map(g => ({
      name: g.name,
      currentAmount: g.currentAmount,
      targetAmount: g.targetAmount
    }));

    return { savingsData: savings, goalData: goalsMapped };
  }, [overviewData, goals]);

  const loading = txLoading || goalsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/60 text-sm mt-1">Deep dive into your financial metrics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 outline-none backdrop-blur-md"
        >
          <option value="this_month" className="bg-slate-900">This Month</option>
          <option value="last_3_months" className="bg-slate-900">Last 3 Months</option>
          <option value="last_6_months" className="bg-slate-900">Last 6 Months</option>
          <option value="this_year" className="bg-slate-900">This Year</option>
          <option value="all_time" className="bg-slate-900">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel p-5 border-white/10 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <HiOutlineArrowTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Income</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalIncome, currency)}</p>
          </div>
        </Card>
        <Card className="glass-panel p-5 border-white/10 flex items-center gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-lg">
            <HiOutlineChartBar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Expenses</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalExpenses, currency)}</p>
          </div>
        </Card>
        <Card className="glass-panel p-5 border-white/10 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <HiOutlineWallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Net Savings</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalIncome - totalExpenses, currency)}</p>
          </div>
        </Card>
        <Card className="glass-panel p-5 border-white/10 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
            <HiOutlineBanknotes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-white/60">Savings Rate</p>
            <p className="text-xl font-bold text-white">{savingsRate}%</p>
          </div>
        </Card>
      </div>

      <section className="space-y-6">
        <OverviewCharts data={overviewData} />
      </section>

      <section className="space-y-6">
        <CategoryCharts expensesByCategory={expensesByCategory} topCategories={topCategories} />
      </section>

      <section className="space-y-6">
        <TrendCharts savingsData={savingsData} goalData={goalData} />
      </section>
    </div>
  );
}
