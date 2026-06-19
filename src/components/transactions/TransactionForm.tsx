'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { transactionSchema } from '@/validations/schemas';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';
import { useCollection } from '@/hooks/useCollection';
import toast from 'react-hot-toast';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
  defaultType?: 'income' | 'expense';
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  isOpen, 
  onClose, 
  transactionToEdit,
  defaultType = 'expense'
}) => {
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const { add, update } = useCollection<Transaction>('transactions');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      notes: '',
      recurring: false,
      tags: [],
      // conditionally required, need fallback
      source: '',
      merchant: '',
      time: '12:00',
      recurringType: 'monthly'
    }
  });

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      const formattedDate = typeof transactionToEdit.date === 'string'
        ? transactionToEdit.date.split('T')[0]
        : new Date().toISOString().split('T')[0];

      form.reset({
        type: transactionToEdit.type,
        amount: transactionToEdit.amount,
        category: transactionToEdit.category,
        date: formattedDate,
        paymentMethod: transactionToEdit.paymentMethod || 'Credit Card',
        notes: transactionToEdit.notes || '',
        recurring: transactionToEdit.recurring || false,
        tags: transactionToEdit.tags || [],
        source: transactionToEdit.source || '',
        merchant: transactionToEdit.merchant || '',
        time: transactionToEdit.time || '12:00',
        recurringType: transactionToEdit.recurringType || 'monthly'
      });
    } else {
      setType(defaultType);
      form.reset({
        type: defaultType,
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
        notes: '',
        recurring: false,
        tags: [],
        source: '',
        merchant: '',
        time: '12:00',
        recurringType: 'monthly'
      });
      form.setValue('type', defaultType);
    }
  }, [transactionToEdit, isOpen, defaultType, form]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    form.setValue('type', newType);
    form.setValue('category', '');
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // transform values
      const data = { ...values };
      if (typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      // Ensure specific fields based on type
      if (type === 'income') {
        delete data.merchant;
        delete data.time;
      } else {
        delete data.source;
      }

      if (transactionToEdit) {
        await update(transactionToEdit.id, data);
        toast.success('Transaction updated');
      } else {
        await add(data);
        toast.success('Transaction added');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? 'Edit Transaction' : 'Add Transaction'} className="max-w-2xl">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
            type === 'expense' ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
            type === 'income' ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          Income
        </button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <Input
                type="number"
                step="0.01"
                {...form.register('amount', { valueAsNumber: true })}
                className="pl-8"
                error={form.formState.errors.amount?.message as string}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
            <select
              {...form.register('category')}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-white"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
            {form.formState.errors.category && <p className="text-rose-500 text-xs mt-1">{form.formState.errors.category.message as string}</p>}
          </div>

          {type === 'income' ? (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Source</label>
              <Input
                {...form.register('source')}
                placeholder="e.g. Salary, Freelance"
                error={form.formState.errors.source?.message as string}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Merchant</label>
              <Input
                {...form.register('merchant')}
                placeholder="e.g. Starbucks, Amazon"
                error={form.formState.errors.merchant?.message as string}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
            <Input
              type="date"
              {...form.register('date')}
              error={form.formState.errors.date?.message as string}
            />
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Time</label>
              <Input
                type="time"
                {...form.register('time')}
                error={form.formState.errors.time?.message as string}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Payment Method</label>
            <select
              {...form.register('paymentMethod')}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-white"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Notes</label>
          <Input
            {...form.register('notes')}
            placeholder="Optional description..."
          />
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags (comma separated)</label>
            <Input
              {...form.register('tags')}
              placeholder="e.g. business, food, trip"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2 pt-2">
          <input 
            type="checkbox" 
            id="recurring" 
            {...form.register('recurring')}
            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="recurring" className="text-sm text-zinc-700 dark:text-zinc-300">This is a recurring transaction</label>
        </div>
        
        {form.watch('recurring') && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Recurring Frequency</label>
            <select
              {...form.register('recurringType')}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
        
        <div>
           <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Receipt Image</label>
           <Input type="file" accept="image/*" />
           <p className="text-xs text-zinc-500 mt-1">Upload functionality will be handled via Firebase Storage.</p>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>
            {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
