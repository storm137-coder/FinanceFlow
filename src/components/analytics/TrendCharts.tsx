'use client';

import { Card } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SavingsData {
  month: string;
  savings: number;
}

interface GoalData {
  name: string;
  currentAmount: number;
  targetAmount: number;
}

interface TrendChartsProps {
  savingsData: SavingsData[];
  goalData: GoalData[];
}

export function TrendCharts({ savingsData, goalData }: TrendChartsProps) {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const CustomTooltipSavings = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg shadow-lg border border-white/10 flex flex-col gap-1">
          <span className="text-white/70 text-sm font-medium">{label}</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-white/70 text-sm">Total Savings:</span>
            <span className="text-white font-medium text-sm">
              {formatCurrency(payload[0].value, currency)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipGoal = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg shadow-lg border border-white/10 flex flex-col gap-2">
          <span className="text-white/70 text-sm font-medium">{label}</span>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-white/70 capitalize">{entry.name}:</span>
              </div>
              <span className="text-white font-medium">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-panel border-white/10 p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Cumulative Savings</h3>
        <div className="flex-1 min-h-[300px]">
          {savingsData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
             <LineChart data={savingsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
               <XAxis 
                 dataKey="month" 
                 stroke="#ffffff50" 
                 fontSize={12} 
                 tickLine={false}
                 axisLine={false}
               />
               <YAxis 
                 stroke="#ffffff50" 
                 fontSize={12}
                 tickLine={false}
                 axisLine={false}
                 tickFormatter={(value) => `$${value}`}
               />
               <Tooltip content={<CustomTooltipSavings />} />
               <Line 
                 type="monotone" 
                 dataKey="savings" 
                 stroke="#10B981" 
                 strokeWidth={3}
                 dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                 activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
               />
             </LineChart>
           </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-white/50 text-sm">
              No savings data available
            </div>
          )}
        </div>
      </Card>

      <Card className="glass-panel border-white/10 p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Goal Progress Overview</h3>
        <div className="flex-1 min-h-[300px]">
          {goalData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#ffffff50" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltipGoal />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="currentAmount" name="Current" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="targetAmount" name="Target" fill="#ffffff20" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-white/50 text-sm">
              No active goals available
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
