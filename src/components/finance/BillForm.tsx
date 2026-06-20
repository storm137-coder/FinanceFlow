'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { billSchema } from '@/validations/schemas';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BILL_CATEGORIES } from '@/lib/constants';
import { useBills, useUpdateBill, useDeleteBill } from '@/hooks/useBills';
import { toast } from 'sonner';

interface BillFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BillForm({ initialData, onSuccess, onCancel }: BillFormProps) {
  const { addBill } = useBills();
  const { mutateAsync: updateBill } = useUpdateBill();
  const { mutateAsync: deleteBill } = useDeleteBill();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      amount: initialData.amount,
      dueDate: initialData.dueDate,
      recurring: initialData.recurring,
      recurringType: initialData.recurringType || 'monthly',
      status: initialData.status,
      autopay: initialData.autopay,
      category: initialData.category,
    } : {
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        amount: data.amount,
        category: data.category,
        dueDate: data.dueDate,
        status: data.status,
        recurring: data.recurring,
        recurringType: data.recurring ? data.recurringType : null,
        autopay: data.autopay,
      };

      if (initialData) {
        await updateBill({ id: initialData.id, ...payload });
        toast.success('Bill updated successfully!');
      } else {
        await addBill(payload);
        toast.success('Bill added successfully!');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save bill.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    setIsLoading(true);
    try {
      await deleteBill(initialData.id);
      toast.success('Bill deleted successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bill.');
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Bill' : 'Save Bill'}
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
