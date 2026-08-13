'use client';

import { useBudgets } from '@/hooks/useBudgets';
import { useDashboard } from '@/hooks/useDashboard';
import { BudgetForm } from '@/components/finance/BudgetForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/currency';
import { PlusCircle, Target, Edit2 } from 'lucide-react';
import { useState } from 'react';

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useBudgets();
  const { spendByCategory, displayCurrency } = useDashboard();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-display">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage your monthly spending limits.</p>
        </div>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => {
            // Find how much has been spent this month from the dashboard hook
            const categorySpend = spendByCategory?.find(c => c.name === budget.category)?.value || 0;
            const percentage = Math.min((categorySpend / budget.amountMinorUnits) * 100, 100);
            
            // Dynamic styling based on progress
            const isNearLimit = percentage >= 80 && percentage < 100;
            const isOverLimit = percentage >= 100;
            const progressColor = isOverLimit ? 'bg-negative' : isNearLimit ? 'bg-accent' : 'bg-primary';

            return (
              <div key={budget.id} className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{budget.category}</h3>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent: {formatCurrency(categorySpend, displayCurrency)}</span>
                    <span className={`font-medium ${isOverLimit ? 'text-negative' : isNearLimit ? 'text-accent' : 'text-positive'}`}>
                      {formatCurrency(budget.amountMinorUnits - categorySpend, displayCurrency)} left
                    </span>
                  </div>
                  {/* Custom progress bar coloring via inline styles or class injection */}
                  <div className="relative w-full h-2 overflow-hidden rounded-full bg-secondary">
                    <div 
                      className={`h-full w-full flex-1 transition-all ${progressColor}`}
                      style={{ transform: `translateX(-${100 - (percentage || 0)}%)` }}
                    />
                  </div>
                  {isOverLimit && <p className="text-xs text-negative mt-1">You have exceeded this budget.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
