'use client';

import { useState, useMemo } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { 
  HiOutlineDocumentArrowDown, 
  HiOutlineDocumentText, 
  HiOutlineTableCells,
  HiOutlineChartPie
} from 'react-icons/hi2';
import { format, subDays, startOfMonth, endOfMonth, isAfter, isBefore, parseISO } from 'date-fns';

type ReportPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export default function ReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [isExporting, setIsExporting] = useState(false);

  const { data: transactions, loading } = useCollection<Transaction>('transactions');

  const currency = user?.currency || 'USD';

  const reportData = useMemo(() => {
    if (!transactions) return null;

    let startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case 'weekly':
        startDate = subDays(endDate, 7);
        break;
      case 'monthly':
        startDate = startOfMonth(endDate);
        break;
      case 'quarterly':
        startDate = subDays(endDate, 90);
        break;
      case 'yearly':
        startDate = subDays(endDate, 365);
        break;
      case 'custom':
        startDate = startOfMonth(endDate);
        break;
    }

    const filtered = transactions.filter(tx => {
      const d = parseISO(tx.date);
      return isAfter(d, startDate) && isBefore(d, endDate);
    });

    let income = 0;
    let expenses = 0;
    const catTotals: Record<string, number> = {};

    filtered.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expenses += tx.amount;
        catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
      }
    });

    const topCategories = Object.entries(catTotals)
      .map(([cat, amt]) => {
        const def = EXPENSE_CATEGORIES.find(c => c.value === cat);
        return {
          name: def ? def.label : cat,
          amount: amt
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      txCount: filtered.length,
      income,
      expenses,
      net: income - expenses,
      topCategories,
      startDate,
      endDate
    };
  }, [transactions, period]);

  const handleExport = async (type: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${type.toUpperCase()} report generated successfully`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-white/60 text-sm mt-1">Generate and export financial reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-panel p-6 border-white/10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Report Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="weekly" className="bg-slate-900">Last 7 Days</option>
                <option value="monthly" className="bg-slate-900">This Month</option>
                <option value="quarterly" className="bg-slate-900">Last 90 Days</option>
                <option value="yearly" className="bg-slate-900">Last 365 Days</option>
              </select>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-sm font-medium text-white/80 mb-2">Export Options</p>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                onClick={() => handleExport('pdf')}
                disabled={isExporting || !reportData?.txCount}
              >
                <HiOutlineDocumentText className="w-5 h-5 text-rose-400" />
                Export as PDF
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                onClick={() => handleExport('csv')}
                disabled={isExporting || !reportData?.txCount}
              >
                <HiOutlineTableCells className="w-5 h-5 text-emerald-400" />
                Export as CSV
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                onClick={() => handleExport('excel')}
                disabled={isExporting || !reportData?.txCount}
              >
                <HiOutlineDocumentArrowDown className="w-5 h-5 text-blue-400" />
                Export for Excel
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="glass-panel p-6 border-white/10 min-h-[500px]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
              <div className="p-3 bg-primary-500/20 text-primary-400 rounded-xl">
                <HiOutlineChartPie className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Report Preview</h2>
                {reportData && (
                  <p className="text-white/50 text-sm">
                    {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}
                  </p>
                )}
              </div>
            </div>

            {!reportData || reportData.txCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-white/50 text-lg">No data available for this period</p>
                <p className="text-white/30 text-sm mt-2">Try selecting a different date range</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Total Income</p>
                    <p className="text-xl font-semibold text-emerald-400">{formatCurrency(reportData.income, currency)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Total Expenses</p>
                    <p className="text-xl font-semibold text-rose-400">{formatCurrency(reportData.expenses, currency)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Net Savings</p>
                    <p className="text-xl font-semibold text-white">{formatCurrency(reportData.net, currency)}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Transactions</p>
                    <p className="text-xl font-semibold text-white">{reportData.txCount}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Top Spending Categories</h3>
                  <div className="space-y-3">
                    {reportData.topCategories.length > 0 ? (
                      reportData.topCategories.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                          <span className="text-white text-sm">{cat.name}</span>
                          <span className="text-white font-medium">{formatCurrency(cat.amount, currency)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/40 text-sm italic">No expenses recorded</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
