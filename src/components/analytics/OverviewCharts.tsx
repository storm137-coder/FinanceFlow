'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Transaction } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';

interface OverviewChartsProps {
  transactions: Transaction[];
  currency: string;
}

export function OverviewCharts({ transactions, currency }: OverviewChartsProps) {
  
  // Prepare data for Monthly Income vs Expenses
  const monthlyData = useMemo(() => {
    const dataMap = new Map<string, { month: string; income: number; expense: number; net: number; timestamp: number }>();
    
    if (transactions.length === 0) {
      // Default to last 6 months if no data
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, 'yyyy-MM');
        dataMap.set(key, { month: format(d, 'MMM yy'), income: 0, expense: 0, net: 0, timestamp: d.getTime() });
      }
    } else {
      // Determine min and max dates
      const dates = transactions.map(t => new Date(t.date).getTime());
      let minDate = new Date(Math.min(...dates));
      const maxDate = new Date(); // default max to now

      // Ensure at least a few months are shown even if there's only 1 transaction
      if (minDate > subMonths(maxDate, 5)) {
        minDate = subMonths(maxDate, 5);
      }
      
      // Generate all months between min and max
      let current = startOfMonth(minDate);
      while (current <= maxDate) {
        const key = format(current, 'yyyy-MM');
        dataMap.set(key, { month: format(current, 'MMM yy'), income: 0, expense: 0, net: 0, timestamp: current.getTime() });
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }
    }

    transactions.forEach(t => {
      const key = t.date.substring(0, 7); // yyyy-MM
      if (dataMap.has(key)) {
        const current = dataMap.get(key)!;
        const amount = t.amountMinorUnits / 100;
        if (t.type === 'income') {
          current.income += amount;
        } else {
          current.expense += amount;
        }
        current.net = current.income - current.expense;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-h3 font-display text-foreground mb-6">Income vs Expenses</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--ink-muted))' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--ink-muted))' }} tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--surface-sunken))' }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-h3 font-display text-foreground mb-6">Cash Flow (Net)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--ink-muted))' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--ink-muted))' }} tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="net" name="Net Cash Flow" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
