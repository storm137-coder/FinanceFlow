'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/currency';
import { Landmark, ArrowUpRight, ArrowDownRight, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReconcileBalanceForm } from './ReconcileBalanceForm';
import { useState } from 'react';

export function SummaryCards() {
  const {
    totalBalanceMinorUnits,
    displayCurrency,
    monthlyIncomeMinorUnits,
    monthlyExpenseMinorUnits,
    accounts,
    isLoading
  } = useDashboard();

  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-border bg-card h-32 overflow-hidden">
            <div className="h-1 w-full bg-surface-sunken" />
            <div className="p-6 space-y-3">
              <div className="h-3 bg-surface-sunken rounded w-1/3" />
              <div className="h-6 bg-surface-sunken rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Balance Card */}
      <div className="group relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden card-hover-effect">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent opacity-60" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent-soft flex items-center justify-center">
                <Landmark className="h-4 w-4 text-accent" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Total Balance</h3>
            </div>

            <Dialog open={isReconcileModalOpen} onOpenChange={setIsReconcileModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reconcile Total Balance</DialogTitle>
                </DialogHeader>
                <ReconcileBalanceForm
                  accounts={accounts}
                  currentTotalBalanceMinorUnits={totalBalanceMinorUnits}
                  displayCurrency={displayCurrency}
                  onSuccess={() => setIsReconcileModalOpen(false)}
                  onCancel={() => setIsReconcileModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <p className="text-figure-lg font-display font-bold text-foreground truncate">
              {formatCurrency(totalBalanceMinorUnits, displayCurrency)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Income Card */}
      <div className="group relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden card-hover-effect">
        <div className="absolute top-0 left-0 right-0 h-1 bg-positive" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-positive-soft flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-positive" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Monthly Income</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <p className="text-figure-lg font-display font-bold text-positive truncate">
              +{formatCurrency(monthlyIncomeMinorUnits, displayCurrency)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Expense Card */}
      <div className="group relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden card-hover-effect">
        <div className="absolute top-0 left-0 right-0 h-1 bg-negative" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-negative-soft flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4 text-negative" />
              </div>
              <h3 className="font-medium text-sm text-muted-foreground">Monthly Expenses</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <p className="text-figure-lg font-display font-bold text-negative truncate">
              -{formatCurrency(monthlyExpenseMinorUnits, displayCurrency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
