'use client';

import { useGoals, useUpdateGoalProgress } from '@/hooks/useGoals';
import { useAccounts } from '@/hooks/useAccounts';
import { GoalForm } from '@/components/finance/GoalForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, toMinorUnits } from '@/lib/currency';
import { PlusCircle, Target, ArrowUpRight, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const { data: accounts } = useAccounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoalForUpdate, setSelectedGoalForUpdate] = useState<any>(null);
  const [updateAmount, setUpdateAmount] = useState<string>('');
  const [updateAction, setUpdateAction] = useState<'add' | 'remove'>('add');
  const updateProgress = useUpdateGoalProgress();

  const defaultCurrency = accounts && accounts.length > 0 ? accounts[0].currency : 'USD';

  const submitUpdate = () => {
    if (!selectedGoalForUpdate || !updateAmount) return;
    const amountFloat = parseFloat(updateAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }
    
    let amountMinorUnits = toMinorUnits(amountFloat, defaultCurrency);
    if (updateAction === 'remove') {
      amountMinorUnits = -amountMinorUnits;
    }

    const newTotal = Math.max(0, selectedGoalForUpdate.currentMinorUnits + amountMinorUnits);
    
    updateProgress.mutate({
      id: selectedGoalForUpdate.id,
      newAmountMinorUnits: newTotal
    }, {
      onSuccess: () => {
        toast.success('Goal progress updated!');
        setSelectedGoalForUpdate(null);
        setUpdateAmount('');
        setUpdateAction('add');
      },
      onError: () => {
        toast.error('Failed to update progress.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-display">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Track your progress towards big purchases.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
            </DialogHeader>
            <GoalForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-card border border-border rounded-lg"></div>
          ))}
        </div>
      ) : !goals || goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No goals set</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Planning a vacation or buying a new car? Set a savings goal to track your progress.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>Create your first goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {goals.map(goal => {
            const percentage = Math.min((goal.currentMinorUnits / goal.targetMinorUnits) * 100, 100);
            const isCompleted = percentage >= 100;

            return (
              <div key={goal.id} className="p-6 rounded-lg border border-border bg-card shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Target Date: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    goal.priority === 'high' ? 'bg-negative/10 text-negative' :
                    goal.priority === 'medium' ? 'bg-accent/10 text-accent' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {goal.priority.toUpperCase()}
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Saved</p>
                      <p className="font-display font-bold text-2xl">
                        {formatCurrency(goal.currentMinorUnits, defaultCurrency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Goal</p>
                      <p className="font-medium">
                        {formatCurrency(goal.targetMinorUnits, defaultCurrency)}
                      </p>
                    </div>
                  </div>

                  <div className="relative w-full h-3 overflow-hidden rounded-full bg-secondary">
                    <div 
                      className={`h-full w-full flex-1 transition-all duration-500 ${isCompleted ? 'bg-positive' : 'bg-primary'}`}
                      style={{ transform: `translateX(-${100 - (percentage || 0)}%)` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
                    
                    {!isCompleted && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedGoalForUpdate(goal)}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Update Progress
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Progress Dialog */}
      <Dialog open={!!selectedGoalForUpdate} onOpenChange={(open) => !open && setSelectedGoalForUpdate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Goal Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Tabs value={updateAction} onValueChange={(val: any) => setUpdateAction(val)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add Funds</TabsTrigger>
                <TabsTrigger value="remove">Withdraw Funds</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-2">
              <Label htmlFor="updateAmount">
                {updateAction === 'add' ? 'Amount to Add' : 'Amount to Withdraw'} ({defaultCurrency})
              </Label>
              <Input 
                id="updateAmount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={updateAmount} 
                onChange={(e) => setUpdateAmount(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && submitUpdate()}
                autoFocus
              />
            </div>
            <Button 
              onClick={submitUpdate} 
              className="w-full" 
              disabled={updateProgress.isPending}
              variant={updateAction === 'add' ? 'default' : 'destructive'}
            >
              {updateProgress.isPending ? 'Saving...' : updateAction === 'add' ? 'Add to Goal' : 'Withdraw from Goal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
