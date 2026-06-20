'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function CategorySpendChart() {
  const { spendByCategory, displayCurrency, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card h-80 flex items-center justify-center animate-pulse">
        <div className="w-48 h-48 rounded-full border-8 border-border"></div>
      </div>
    );
  }

  if (!spendByCategory || spendByCategory.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card h-80 flex flex-col items-center justify-center text-muted-foreground text-center">
        <div className="w-16 h-16 mb-4 opacity-20 rounded-full border-4 border-dashed border-foreground"></div>
        <p>No expenses this month.</p>
        <p className="text-sm">Add some transactions to see your breakdown.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-border bg-card flex flex-col h-full shadow-sm">
      <h3 className="font-semibold mb-6">Spend by Category (This Month)</h3>
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
