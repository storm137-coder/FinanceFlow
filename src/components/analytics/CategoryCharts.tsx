'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface CategoryChartsProps {
  transactions: Transaction[];
  currency: string;
}

export function CategoryCharts({ transactions, currency }: CategoryChartsProps) {
  
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = new Map<string, number>();

    expenses.forEach(t => {
      const amount = t.amountMinorUnits !== undefined 
        ? t.amountMinorUnits / 100 
        : ((t as any).amount || 0);
      categoryTotals.set(t.categoryId, (categoryTotals.get(t.categoryId) || 0) + amount);
    });

    const data = Array.from(categoryTotals.entries())
      .map(([name, value]) => {
        const catConfig = EXPENSE_CATEGORIES.find(c => c.value === name);
        return {
          name: catConfig ? catConfig.label : name,
          value,
          color: catConfig ? catConfig.color : '#94a3b8'
        };
      })
      .sort((a, b) => b.value - a.value);

    return data;
  }, [transactions]);

  const topCategories = useMemo(() => {
    return categoryData.slice(0, 5);
  }, [categoryData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(Math.round(payload[0].value * 100), currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-h3 font-display text-foreground mb-6">Spending by Category</h3>
      
      {categoryData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-muted-foreground">
          No expenses for this period.
        </div>
      ) : (
        <div className="space-y-8">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-body font-medium text-foreground mb-4">Top 5 Categories</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--ink-muted))' }} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--surface-sunken))' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

