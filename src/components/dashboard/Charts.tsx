'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartsProps {
  monthlyData: { month: string; income: number; expenses: number }[];
  categoryData: { name: string; value: number }[];
}

export const Charts: React.FC<ChartsProps> = ({ monthlyData, categoryData }) => {
  const getCategoryColor = (categoryName: string) => {
    const category = EXPENSE_CATEGORIES.find(c => c.value === categoryName || c.label === categoryName);
    return category?.color || '#8884d8';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card className="p-6 bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Income vs Expenses</h3>
        {monthlyData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
             <EmptyState title="No data available" description="We don't have enough data to display the chart." />
          </div>
        )}
      </Card>

      <Card className="p-6 bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-xl">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Spending by Category</h3>
        {categoryData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`}
                />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <EmptyState title="No data available" description="Add some expenses to see your spending breakdown." />
          </div>
        )}
      </Card>
    </div>
  );
};
