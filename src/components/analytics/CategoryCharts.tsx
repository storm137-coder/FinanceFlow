'use client';

import { Card } from '@/components/ui/Card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryChartsProps {
  expensesByCategory: CategoryData[];
  topCategories: CategoryData[];
}

export function CategoryCharts({ expensesByCategory, topCategories }: CategoryChartsProps) {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-lg shadow-lg border border-white/10 flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color || payload[0].color }}
          />
          <span className="text-white/70">{data.name}:</span>
          <span className="text-white font-medium">
            {formatCurrency(payload[0].value, currency)}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-panel border-white/10 p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-white mb-6 self-start">Expenses by Category</h3>
        <div className="w-full flex-1 min-h-[300px] flex items-center justify-center">
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-white/50 text-sm">No expense data available</div>
          )}
        </div>
      </Card>

      <Card className="glass-panel border-white/10 p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Top Spending Categories</h3>
        <div className="flex-1 min-h-[300px]">
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topCategories} 
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#ffffff50" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-white/50 text-sm">
              No expense data available
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
