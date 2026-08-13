'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { investmentSchema, InvestmentFormData } from '@/validations/schemas';
import { useAddInvestment, useUpdateInvestment, useDeleteInvestment } from '@/hooks/useInvestments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Investment } from '@/types';
import { toMinorUnits, fromMinorUnits } from '@/lib/currency';

interface InvestmentFormProps {
  onSuccess?: () => void;
  initialData?: any;
  defaultCurrency?: string;
}

const INVESTMENT_TYPES = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'etf', label: 'ETFs' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'gold', label: 'Gold / Precious Metals' },
  { value: 'other', label: 'Other' },
];

export function InvestmentForm({ onSuccess, initialData, defaultCurrency = 'USD' }: InvestmentFormProps) {
  const { mutateAsync: addInvestment } = useAddInvestment();
  const { mutateAsync: updateInvestment } = useUpdateInvestment();
  const { mutateAsync: deleteInvestment } = useDeleteInvestment();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(investmentSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      investedAmount: fromMinorUnits(initialData.investedAmountMinorUnits, defaultCurrency),
      currentValue: fromMinorUnits(initialData.currentValueMinorUnits, defaultCurrency),
      purchaseDate: initialData.purchaseDate,
      broker: initialData.broker || '',
      notes: initialData.notes || '',
    } : {
      name: '',
      type: 'stocks',
      investedAmount: 0,
      currentValue: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    }
  });

  const onSubmit = async (data: InvestmentFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        investedAmountMinorUnits: toMinorUnits(data.investedAmount, defaultCurrency),
        currentValueMinorUnits: toMinorUnits(data.currentValue, defaultCurrency),
        purchaseDate: data.purchaseDate,
        broker: data.broker || '',
        notes: data.notes || '',
      };

      if (initialData) {
        await updateInvestment({ id: initialData.id, ...payload });
        toast.success('Investment updated successfully!');
      } else {
        await addInvestment(payload);
        toast.success('Investment added successfully!');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save investment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this investment?')) return;
    
    setIsLoading(true);
    try {
      await deleteInvestment(initialData.id);
      toast.success('Investment deleted successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete investment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Asset Name or Ticker</Label>
        <Input id="name" {...register('name')} placeholder="e.g. AAPL, Vanguard S&P 500" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Asset Class</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="investedAmount">Total Invested</Label>
          <Input id="investedAmount" type="number" step="0.01" {...register('investedAmount')} />
          {errors.investedAmount && <p className="text-sm text-destructive">{errors.investedAmount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentValue">Current Value</Label>
          <Input id="currentValue" type="number" step="0.01" {...register('currentValue')} />
          {errors.currentValue && <p className="text-sm text-destructive">{errors.currentValue.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Date Acquired</Label>
        <Input id="purchaseDate" type="date" {...register('purchaseDate')} />
        {errors.purchaseDate && <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="broker">Broker / Platform (Optional)</Label>
        <Input id="broker" {...register('broker')} placeholder="e.g. Robinhood, Fidelity" />
        {errors.broker && <p className="text-sm text-destructive">{errors.broker.message}</p>}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Asset' : 'Add Asset'}
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
