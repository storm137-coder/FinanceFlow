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
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <p className="text-3xl font-display font-bold truncate">
              {formatCurrency(totalBalanceMinorUnits, displayCurrency)}
            </p>
          </div>
          
          <Dialog open={isReconcileModalOpen} onOpenChange={setIsReconcileModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Edit2 className="h-4 w-4" />
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
      </div>

      {/* Monthly Income Card */}
      <div className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm text-muted-foreground">Monthly Income</h3>
          <ArrowUpRight className="h-4 w-4 text-positive" />
        </div>
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-3xl font-display font-bold truncate">
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
        <div className="flex items-baseline gap-2 min-w-0">
          <p className="text-3xl font-display font-bold truncate">
            {formatCurrency(monthlyExpenseMinorUnits, displayCurrency)}
          </p>
        </div>
      </div>
    </div>
  );
}
