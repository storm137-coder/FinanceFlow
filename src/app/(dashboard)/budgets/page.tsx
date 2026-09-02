'use client';

import { useBudgets } from '@/hooks/useBudgets';
import { useDashboard } from '@/hooks/useDashboard';
import { BudgetForm } from '@/components/finance/BudgetForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import { formatBudgetPeriod } from '@/lib/utils';
import { PlusCircle, Target, Edit2, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useBudgets();
  const { displayCurrency } = useDashboard();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Distinct available periods from existing budgets
  const availablePeriods = useMemo(() => {
    if (!budgets || budgets.length === 0) return [];
    const periodMap = new Map<string, { year: number; month: number; label: string }>();

    budgets.forEach((b) => {
      const y = typeof b.year === 'number' ? b.year : currentYear;
      const m = typeof b.month === 'number' ? b.month : currentMonth;
      const key = `${y}-${m}`;
      if (!periodMap.has(key)) {
        const isCurrent = y === currentYear && m === currentMonth;
        periodMap.set(key, {
          year: y,
          month: m,
          label: isCurrent 
            ? `Current Month (${formatBudgetPeriod(m, y, 'short')})` 
            : formatBudgetPeriod(m, y, 'long'),
        });
      }
    });

    return Array.from(periodMap.entries()).map(([key, val]) => ({
      key,
      ...val,
    }));
  }, [budgets, currentYear, currentMonth]);

  // Filter budgets based on chosen period
  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];
    if (selectedPeriod === 'all') return budgets;

    return budgets.filter((b) => {
      const y = typeof b.year === 'number' ? b.year : currentYear;
      const m = typeof b.month === 'number' ? b.month : currentMonth;
      return `${y}-${m}` === selectedPeriod;
    });
  }, [budgets, selectedPeriod, currentYear, currentMonth]);

  // Compute summary metrics for filtered budgets
  const { totalBudgeted, totalSpent, totalRemaining } = useMemo(() => {
    let bTotal = 0;
    let sTotal = 0;
    filteredBudgets.forEach((b) => {
      bTotal += b.amountMinorUnits || 0;
      sTotal += b.spentMinorUnits || 0;
    });
    return {
      totalBudgeted: bTotal,
      totalSpent: sTotal,
      totalRemaining: bTotal - sTotal,
    };
  }, [filteredBudgets]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-display">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage your monthly spending limits.</p>
        </div>
        <div className="flex items-center gap-3">
          {availablePeriods.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {availablePeriods.map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Dialog open={isDialogOpen || !!editingBudget} onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setEditingBudget(null);
            } else {
              setIsDialogOpen(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBudget(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
              </DialogHeader>
              <BudgetForm 
                initialData={editingBudget}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditingBudget(null);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards Row */}
      {!isLoading && budgets && budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Total Budgeted</p>
            <p className="text-2xl font-display text-foreground font-bold mt-1">
              {formatCurrency(totalBudgeted, displayCurrency)}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-display text-foreground font-bold mt-1">
              {formatCurrency(totalSpent, displayCurrency)}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">
              {totalRemaining < 0 ? 'Total Over Budget' : 'Remaining'}
            </p>
            <p className={`text-2xl font-display font-bold mt-1 ${totalRemaining < 0 ? 'text-negative' : 'text-positive'}`}>
              {totalRemaining < 0 
                ? `-${formatCurrency(Math.abs(totalRemaining), displayCurrency)}`
                : formatCurrency(totalRemaining, displayCurrency)}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-card border border-border rounded-lg"></div>
          ))}
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No budgets set</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create budgets for categories like Groceries or Entertainment to keep your spending on track.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>Create your first budget</Button>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-lg text-center shadow-sm">
          <p className="text-muted-foreground mb-4">No budgets found for the selected period.</p>
          <Button variant="outline" onClick={() => setSelectedPeriod('all')}>View All Budgets</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map(budget => {
            const categorySpend = budget.spentMinorUnits ?? 0;
            const budgetLimit = budget.amountMinorUnits || 0;
            const remaining = budgetLimit - categorySpend;
            const percentage = budgetLimit > 0 ? (categorySpend / budgetLimit) * 100 : 0;
            const clampedPercentage = Math.min(percentage, 100);
            
            // Dynamic styling based on progress
            const isNearLimit = percentage >= 80 && percentage < 100;
            const isOverLimit = percentage >= 100;
            const progressColor = isOverLimit ? 'bg-negative' : isNearLimit ? 'bg-accent' : 'bg-primary';

            return (
              <div key={budget.id} className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{budget.category}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                        {formatBudgetPeriod(budget.month, budget.year)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Monthly Limit</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-display font-bold">
                        {formatCurrency(budget.amountMinorUnits, displayCurrency)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => setEditingBudget(budget)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-auto pt-4 space-y-2">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">
                      Spent: <span className="font-medium text-foreground">{formatCurrency(categorySpend, displayCurrency)}</span>
                    </span>
                    {isOverLimit ? (
                      <span className="font-medium text-negative">
                        {formatCurrency(categorySpend - budgetLimit, displayCurrency)} over
                      </span>
                    ) : (
                      <span className={`font-medium ${isNearLimit ? 'text-accent' : 'text-positive'}`}>
                        {formatCurrency(remaining, displayCurrency)} left
                      </span>
                    )}
                  </div>
                  {/* Custom progress bar coloring */}
                  <div className="relative w-full h-2 overflow-hidden rounded-full bg-secondary">
                    <div 
                      className={`h-full w-full flex-1 transition-all ${progressColor}`}
                      style={{ transform: `translateX(-${100 - clampedPercentage}%)` }}
                    />
                  </div>
                  {isOverLimit && (
                    <p className="text-xs text-negative mt-1 font-medium">
                      Exceeded by {formatCurrency(categorySpend - budgetLimit, displayCurrency)} ({percentage.toFixed(0)}% spent)
                    </p>
                  )}
                  {isNearLimit && (
                    <p className="text-xs text-accent mt-1">
                      {percentage.toFixed(0)}% of limit reached
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
