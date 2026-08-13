'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema, BudgetFormData } from '@/validations/schemas';
import { useAddBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toMinorUnits, fromMinorUnits } from '@/lib/currency';
import { useAccounts } from '@/hooks/useAccounts';
import { toast } from 'sonner';
import { CATEGORIES } from '@/components/finance/TransactionForm';

interface BudgetFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function BudgetForm({ onSuccess, initialData }: BudgetFormProps) {
  const { data: accounts } = useAccounts();
  const { mutateAsync: addBudgetMutation } = useAddBudget();
  const { mutateAsync: updateBudgetMutation } = useUpdateBudget();
  const { mutateAsync: deleteBudgetMutation } = useDeleteBudget();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCurrency = accounts && accounts.length > 0 ? accounts[0].currency : 'USD';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData ? {
      category: initialData.category,
      amount: fromMinorUnits(initialData.amountMinorUnits, defaultCurrency),
      month: initialData.month,
      year: initialData.year,
      spent: fromMinorUnits(initialData.spentMinorUnits || 0, defaultCurrency),
    } : {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      spent: 0,
    }
  });

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        category: data.category,
        month: data.month,
        year: data.year,
        amountMinorUnits: toMinorUnits(data.amount, defaultCurrency),
      };

      if (initialData) {
        await updateBudgetMutation({ id: initialData.id, ...payload });
        toast.success('Budget updated successfully');
      } else {
        await addBudgetMutation(payload);
        toast.success('Budget created successfully');
      }
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || (initialData ? 'Failed to update budget' : 'Failed to create budget'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    setIsSubmitting(true);
    try {
      await deleteBudgetMutation(initialData.id);
      toast.success('Budget deleted successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error('Failed to delete budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(val) => setValue('category', val)} defaultValue={initialData?.category}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Monthly Budget Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount')}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">Month (0-11)</Label>
          <Input id="month" type="number" min="0" max="11" {...register('month')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" {...register('year')} />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Budget' : 'Create Budget'}
        </Button>
        {initialData && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
