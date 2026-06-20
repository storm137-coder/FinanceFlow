'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, AccountFormData } from '@/validations/schemas';
import { useAddAccount } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { toMinorUnits } from '@/lib/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutateAsync: addAccount } = useAddAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      currency: 'USD',
      initialBalance: 0,
    }
  });

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    try {
      await addAccount({
        name: data.name,
        type: data.type,
        currency: data.currency,
        initialBalanceMinorUnits: toMinorUnits(data.initialBalance, data.currency),
      });
      toast.success('Account created successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input id="name" {...register('name')} placeholder="e.g. Chase Checking" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Account Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" {...register('currency')} placeholder="USD" />
          {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialBalance">Initial Balance</Label>
        <Input 
          id="initialBalance" 
          type="number" 
          step="0.01" 
          {...register('initialBalance')} 
          placeholder="0.00" 
        />
        {errors.initialBalance && <p className="text-sm text-destructive">{errors.initialBalance.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Account'}
      </Button>
    </form>
  );
}
