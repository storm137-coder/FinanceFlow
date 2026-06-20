'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, GoalFormData } from '@/validations/schemas';
import { useAddGoal } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toMinorUnits } from '@/lib/currency';
import { useAccounts } from '@/hooks/useAccounts';
import { toast } from 'sonner';

interface GoalFormProps {
  onSuccess?: () => void;
}

export function GoalForm({ onSuccess }: GoalFormProps) {
  const { data: accounts } = useAccounts();
  const addGoalMutation = useAddGoal();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCurrency = accounts && accounts.length > 0 ? accounts[0].currency : 'USD';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      status: 'active',
      currentAmount: 0,
    }
  });

  const onSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      await addGoalMutation.mutateAsync({
        name: data.name,
        description: data.description || '',
        targetMinorUnits: toMinorUnits(data.targetAmount, defaultCurrency),
        currentMinorUnits: toMinorUnits(data.currentAmount, defaultCurrency),
        category: data.category,
        priority: data.priority,
        deadline: data.deadline,
        status: data.status,
      });
      toast.success('Goal created successfully');
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input id="name" placeholder="E.g., New Car" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(val) => setValue('category', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Savings">Savings</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Vehicle">Vehicle</SelectItem>
            <SelectItem value="Emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('targetAmount')}
        />
        {errors.targetAmount && <p className="text-sm text-destructive">{errors.targetAmount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select onValueChange={(val: any) => setValue('priority', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-sm text-destructive">{errors.priority.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Target Date</Label>
          <Input id="deadline" type="date" {...register('deadline')} />
          {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Create Goal'}
      </Button>
    </form>
  );
}
