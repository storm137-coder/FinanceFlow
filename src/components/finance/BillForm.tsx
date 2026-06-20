'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { billSchema } from '@/validations/schemas';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BILL_CATEGORIES } from '@/lib/constants';
import { Bill } from '@/types';

interface BillFormProps {
  initialData?: Bill;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function BillForm({ initialData, onSubmit, onCancel, loading }: BillFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: initialData || {
      name: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      recurring: true,
      recurringType: 'monthly',
      status: 'pending',
      autopay: false,
      category: 'Custom',
    }
  });

  const category = watch('category');
  const recurring = watch('recurring');
  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-body font-medium">Bill Name</label>
        <Input {...register('name')} placeholder="e.g. Netflix Subscription" />
        {errors.name && <p className="text-danger text-sm">{errors.name.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-body font-medium">Amount</label>
          <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
          {errors.amount && <p className="text-danger text-sm">{errors.amount.message as string}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-body font-medium">Category</label>
          <Select value={category} onValueChange={(val) => setValue('category', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {BILL_CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="mr-2">{c.icon}</span>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-body font-medium">Due Date</label>
          <Input type="date" {...register('dueDate')} />
          {errors.dueDate && <p className="text-danger text-sm">{errors.dueDate.message as string}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-body font-medium">Status</label>
          <Select value={status} onValueChange={(val: any) => setValue('status', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="recurring" {...register('recurring')} className="w-4 h-4 rounded border-border" />
          <label htmlFor="recurring" className="text-body">Recurring Bill</label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="autopay" {...register('autopay')} className="w-4 h-4 rounded border-border" />
          <label htmlFor="autopay" className="text-body">Auto-pay</label>
        </div>
      </div>

      {recurring && (
        <div className="space-y-2">
          <label className="text-body font-medium">Recurring Frequency</label>
          <Select value={watch('recurringType')} onValueChange={(val: any) => setValue('recurringType', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Bill'}</Button>
      </div>
    </form>
  );
}
