'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function CategorySpendChart() {
  const { spendByCategory, displayCurrency, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card flex flex-col h-full animate-pulse">
        <div className="h-4 bg-surface-sunken rounded w-1/3 mb-6" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-44 h-44 rounded-full border-8 border-surface-sunken" />
        </div>
      </div>
    );
  }

  if (!spendByCategory || spendByCategory.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card h-full flex flex-col items-center justify-center text-muted-foreground text-center">
        <div className="mb-4 h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
          <svg className="h-6 w-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3h5.25v5.25" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-9-9" />
          </svg>
        </div>
        <p className="text-sm font-medium">No expenses this month</p>
        <p className="text-xs mt-1">Add some transactions to see your breakdown.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card flex flex-col h-full shadow-sm card-hover-effect">
      <h3 className="font-semibold text-foreground mb-6">Spend by Category</h3>
      <p className="text-xs text-muted-foreground -mt-4 mb-6">This month</p>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={spendByCategory}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {spendByCategory.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => formatCurrency(value as number, displayCurrency)}
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value, entry: any) => <span className="text-sm text-foreground ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
