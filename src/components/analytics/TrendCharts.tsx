'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Transaction } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';

interface TrendChartsProps {
  transactions: Transaction[];
  currency: string;
}

export function TrendCharts({ transactions, currency }: TrendChartsProps) {
  
  const savingsGrowthData = useMemo(() => {
    // Sort transactions oldest to newest
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulativeSavings = 0;
    const dataMap = new Map<string, number>();

    if (transactions.length === 0) {
      // Generate last 12 months as base
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, 'yyyy-MM');
        dataMap.set(key, 0); 
      }
    } else {
      const dates = transactions.map(t => new Date(t.date).getTime());
      let minDate = new Date(Math.min(...dates));
      const maxDate = new Date();

      if (minDate > subMonths(maxDate, 11)) {
        minDate = subMonths(maxDate, 11);
      }
      
      let current = startOfMonth(minDate);
      while (current <= maxDate) {
        const key = format(current, 'yyyy-MM');
        dataMap.set(key, 0);
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }
    }

    sorted.forEach(t => {
      const amount = t.amountMinorUnits / 100;
      if (t.type === 'income') cumulativeSavings += amount;
      else cumulativeSavings -= amount;

      const key = t.date.substring(0, 7);
      if (dataMap.has(key)) {
        dataMap.set(key, cumulativeSavings);
      }
    });

    // Fill forward the cumulative savings for months with no transactions
    let lastKnown = 0;
    return Array.from(dataMap.entries()).map(([key, value]) => {
      if (value !== 0 || dataMap.get(key) !== 0) {
        lastKnown = value || lastKnown;
      }
      return {
        month: format(parseISO(key + '-01'), 'MMM yy'),
        savings: lastKnown
      };
    });
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-accent">
            Total Savings: {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-h3 font-display text-foreground mb-6">Savings Growth</h3>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={savingsGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--ink-muted))' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--ink-muted))' }} tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="savings" 
              name="Cumulative Savings"
              stroke="hsl(var(--accent))" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
