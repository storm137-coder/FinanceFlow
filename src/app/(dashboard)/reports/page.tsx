'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import { exportToCSV } from '@/lib/csv';
import { FileText, Download, FileSpreadsheet, Filter } from 'lucide-react';
import { formatDateSafe, safeParseDate } from '@/lib/utils';
import { subDays, subMonths, startOfYear, isAfter, isBefore } from 'date-fns';

export default function ReportsPage() {
  const { data, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('transactions');

  const defaultCurrency = accounts?.[0]?.currency || 'USD';

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    const transactions = data?.pages.flatMap(page => page.transactions) || [];
    if (!transactions.length) return [];
    
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '7days': startDate = subDays(now, 7); break;
      case '30days': startDate = subDays(now, 30); break;
      case '90days': startDate = subDays(now, 90); break;
      case 'thisYear': startDate = startOfYear(now); break;
      case 'allTime': 
      default:
        startDate = new Date(0); // 1970
    }

    return transactions
      .filter(t => {
        const d = safeParseDate(t.date);
        return d && isAfter(d, startDate);
      })
      .sort((a, b) => {
        const da = safeParseDate(a.date);
        const db = safeParseDate(b.date);
        return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
      });
  }, [data, dateRange]);

  // Calculate summaries
  const { totalIncome, totalExpense } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amountMinorUnits;
        if (t.type === 'expense') acc.totalExpense += t.amountMinorUnits;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const data = filteredTransactions.map(t => ({
      Date: formatDateSafe(t.date, 'yyyy-MM-dd'),
      Type: t.type.toUpperCase(),
      Category: t.categoryId,
      Amount: (t.amountMinorUnits / 100).toFixed(2), // convert minor units for export
      Currency: t.currency,
      Merchant: t.merchant || '',
      Notes: t.notes || '',
    }));

    exportToCSV(data, `financeflow-${dateRange}-transactions`);
  };

  const handleExportPDF = () => {
    // Generate PDF server-side to adhere to design system
    const url = `/api/reports/export?dateRange=${dateRange}&reportType=${reportType}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display font-display text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Generate summaries and export your data for tax or record keeping.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 card-hover-effect">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg text-foreground">Report Settings</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="budgets" disabled>Budgets (Coming Soon)</SelectItem>
                  <SelectItem value="investments" disabled>Investments (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 border-t border-border space-y-3">
              <Button 
                onClick={handleExportPDF} 
                className="w-full justify-start"
                disabled={isLoading || filteredTransactions.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                className="w-full justify-start"
                disabled={isLoading || filteredTransactions.length === 0}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px] card-hover-effect">
            <h2 className="font-semibold text-lg text-foreground mb-6">Report Preview</h2>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-surface rounded-lg"></div>
                <div className="h-64 bg-surface rounded-lg"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">No data found</h3>
                <p className="text-muted-foreground">Try adjusting your date range.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-surface-sunken p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Income</p>
                    <p className="font-semibold text-positive">{formatCurrency(totalIncome, defaultCurrency)}</p>
                  </div>
                  <div className="bg-surface-sunken p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Expense</p>
                    <p className="font-semibold text-negative">{formatCurrency(totalExpense, defaultCurrency)}</p>
                  </div>
                  <div className="bg-surface-sunken p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Flow</p>
                    <p className="font-semibold">{formatCurrency(totalIncome - totalExpense, defaultCurrency)}</p>
                  </div>
                  <div className="bg-surface-sunken p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Records</p>
                    <p className="font-semibold">{filteredTransactions.length}</p>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-surface-sunken">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {filteredTransactions.slice(0, 5).map(t => (
                        <tr key={t.id}>
                          <td className="px-4 py-3">{formatDateSafe(t.date, 'MMM d, yyyy')}</td>
                          <td className="px-4 py-3 capitalize">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">{t.categoryId}</td>
                          <td className={`px-4 py-3 text-right font-medium ${t.type === 'income' ? 'text-positive' : ''}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountMinorUnits, t.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTransactions.length > 5 && (
                    <div className="bg-surface-sunken p-3 text-center text-xs text-muted-foreground border-t border-border">
                      Showing 5 of {filteredTransactions.length} records. Download report to see all.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
