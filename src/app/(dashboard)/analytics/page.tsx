'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { OverviewCharts } from '@/components/analytics/OverviewCharts';
import { CategoryCharts } from '@/components/analytics/CategoryCharts';
import { TrendCharts } from '@/components/analytics/TrendCharts';
import { useCollection } from '@/hooks/useCollection';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TimeRange = 'this_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all_time';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: transactions = [], loading } = useCollection<Transaction>('transactions');
  const [timeRange, setTimeRange] = useState<TimeRange>('last_6_months');

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    if (timeRange === 'all_time') return transactions;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case 'this_month':
        cutoffDate.setDate(1);
        break;
      case 'last_3_months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'last_6_months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'this_year':
        cutoffDate.setMonth(0, 1);
        break;
    }
    
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  }, [transactions, timeRange]);

  // Calculate high-level stats
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    filteredTransactions.forEach(t => {
      const amount = t.amountMinorUnits !== undefined 
        ? t.amountMinorUnits / 100 
        : ((t as any).amount || 0);
      if (t.type === 'income') income += amount;
      if (t.type === 'expense') expense += amount;
    });
    
    return {
      income,
      expense,
      savings: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-sunken rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-sunken rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-surface-sunken rounded-xl" />
          <div className="h-80 bg-surface-sunken rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-h2 font-display text-foreground">Analytics</h1>
          <p className="text-body text-muted-foreground">Deep dive into your financial patterns.</p>
        </div>
        
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-positive/50">
          <p className="text-caption text-muted-foreground mb-1">Total Income</p>
          <p className="text-h3 font-display text-positive">{formatCurrency(Math.round(stats.income * 100), user?.currency)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-negative/50">
          <p className="text-caption text-muted-foreground mb-1">Total Expenses</p>
          <p className="text-h3 font-display text-negative">{formatCurrency(Math.round(stats.expense * 100), user?.currency)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary/50">
          <p className="text-caption text-muted-foreground mb-1">Net Savings</p>
          <p className="text-h3 font-display text-foreground">{formatCurrency(Math.round(stats.savings * 100), user?.currency)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-accent/50">
          <p className="text-caption text-muted-foreground mb-1">Savings Rate</p>
          <p className="text-h3 font-display text-foreground">{stats.savingsRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        <OverviewCharts transactions={filteredTransactions} currency={user?.currency || 'USD'} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryCharts transactions={filteredTransactions} currency={user?.currency || 'USD'} />
          <TrendCharts transactions={transactions} currency={user?.currency || 'USD'} />
        </div>
      </div>
    </div>
  );
}

