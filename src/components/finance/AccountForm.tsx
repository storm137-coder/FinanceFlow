'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, AccountFormData } from '@/validations/schemas';
import { useAddAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { toMinorUnits, fromMinorUnits } from '@/lib/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AccountForm({ onSuccess, initialData }: { onSuccess?: () => void; initialData?: any }) {
  const { mutateAsync: addAccount } = useAddAccount();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { mutateAsync: deleteAccount } = useDeleteAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      currency: initialData.currency,
      initialBalance: fromMinorUnits(initialData.balanceMinorUnits, initialData.currency),
    } : {
      name: '',
      type: 'checking',
      currency: 'USD',
      initialBalance: 0,
    }
  });

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        currency: data.currency,
        initialBalanceMinorUnits: toMinorUnits(data.initialBalance, data.currency),
      };
      
      if (initialData) {
        // useUpdateAccount doesn't use initialBalanceMinorUnits, it uses balanceMinorUnits, but our hook maps it if we omit it, wait - let's check useUpdateAccount.
        // Actually we just pass balanceMinorUnits to update
        await updateAccount({ id: initialData.id, data: {
          name: data.name,
          type: data.type,
          currency: data.currency,
          balanceMinorUnits: payload.initialBalanceMinorUnits
        }});
        toast.success('Account updated successfully!');
      } else {
        await addAccount(payload);
        toast.success('Account created successfully!');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(initialData ? 'Failed to update account.' : 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    setIsLoading(true);
    try {
      await deleteAccount(initialData.id);
      toast.success('Account deleted successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error('Failed to delete account.');
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

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Account' : 'Create Account'}
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
