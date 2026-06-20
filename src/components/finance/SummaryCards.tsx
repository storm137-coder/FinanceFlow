'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/currency';
import { Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function SummaryCards() {
  const { 
    totalBalanceMinorUnits, 
    displayCurrency, 
    monthlyIncomeMinorUnits, 
    monthlyExpenseMinorUnits, 
    isLoading 
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 rounded-lg border border-border bg-card h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Balance Card */}
      <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm text-muted-foreground">Total Balance</h3>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-display font-bold">
            {formatCurrency(totalBalanceMinorUnits, displayCurrency)}
          </p>
        </div>
      </div>

      {/* Monthly Income Card */}
      <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm text-muted-foreground">Monthly Income</h3>
          <ArrowUpRight className="h-4 w-4 text-positive" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-display font-bold">
            {formatCurrency(monthlyIncomeMinorUnits, displayCurrency)}
          </p>
        </div>
      </div>

      {/* Monthly Expense Card */}
      <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm text-muted-foreground">Monthly Expenses</h3>
          <ArrowDownRight className="h-4 w-4 text-negative" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-display font-bold">
            {formatCurrency(monthlyExpenseMinorUnits, displayCurrency)}
          </p>
        </div>
      </div>
    </div>
  );
}
