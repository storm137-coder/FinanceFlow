'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '@/validations/schemas';
import { useAddTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { toMinorUnits, fromMinorUnits } from '@/lib/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/types';

export const CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Savings', 'Salary', 'Other'
];

interface TransactionFormProps {
  onSuccess?: () => void;
  initialData?: Transaction;
}

export function TransactionForm({ onSuccess, initialData }: TransactionFormProps) {
  const { data: accounts } = useAccounts();
  const { mutateAsync: addTransaction } = useAddTransaction();
  const { mutateAsync: updateTransaction } = useUpdateTransaction();
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, watch } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ? {
      type: initialData.type,
      accountId: initialData.accountId,
      date: initialData.date,
      amount: fromMinorUnits(initialData.amountMinorUnits, initialData.currency),
      categoryId: initialData.categoryId,
      merchant: initialData.merchant || '',
      notes: initialData.notes || '',
    } : {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
    }
  });

  const selectedAccountId = watch('accountId');
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId);

  const onSubmit = async (data: TransactionFormData) => {
    if (!selectedAccount) {
      toast.error('Please select a valid account.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        accountId: data.accountId,
        type: data.type,
        amountMinorUnits: toMinorUnits(data.amount, selectedAccount.currency),
        currency: selectedAccount.currency,
        categoryId: data.categoryId,
        merchant: data.merchant || '',
        date: data.date,
        tags: data.tags || [],
        notes: data.notes || '',
      };

      if (initialData) {
        await updateTransaction({ id: initialData.id, ...payload });
        toast.success('Transaction updated successfully!');
      } else {
        await addTransaction(payload);
        toast.success('Transaction added successfully!');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    setIsLoading(true);
    try {
      await deleteTransaction(initialData.id);
      toast.success('Transaction deleted successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <SelectTrigger id="accountId">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountId && <p className="text-sm text-destructive">{errors.accountId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" {...register('amount')} placeholder="0.00" />
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Input 
          id="categoryId" 
          list="categories" 
          placeholder="Select or type a category" 
          {...register('categoryId')} 
          disabled={isLoading} 
        />
        <datalist id="categories">
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="merchant">Merchant (Optional)</Label>
        <Input id="merchant" {...register('merchant')} placeholder="e.g. Whole Foods" />
        {errors.merchant && <p className="text-sm text-destructive">{errors.merchant.message}</p>}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}
        </Button>
        {initialData && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
