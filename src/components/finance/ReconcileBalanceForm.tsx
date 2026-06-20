'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account } from '@/types';
import { useUpdateAccount } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { toMinorUnits, fromMinorUnits, formatCurrency } from '@/lib/currency';

const reconcileSchema = z.object({
  newTotalBalance: z.coerce.number().min(0, 'Balance cannot be negative').max(100000000000, 'Balance is too large'),
  accountId: z.string().min(1, 'Please select an account to adjust'),
});

type ReconcileFormData = z.infer<typeof reconcileSchema>;

interface ReconcileBalanceFormProps {
  accounts: Account[];
  currentTotalBalanceMinorUnits: number;
  displayCurrency: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReconcileBalanceForm({
  accounts,
  currentTotalBalanceMinorUnits,
  displayCurrency,
  onSuccess,
  onCancel
}: ReconcileBalanceFormProps) {
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const [isLoading, setIsLoading] = useState(false);

  const defaultAccount = accounts.length > 0 ? accounts[0].id : '';

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ReconcileFormData>({
    resolver: zodResolver(reconcileSchema) as any,
    defaultValues: {
      newTotalBalance: fromMinorUnits(currentTotalBalanceMinorUnits, displayCurrency),
      accountId: defaultAccount,
    }
  });

  const watchNewTotal = watch('newTotalBalance');
  
  // Calculate difference
  const differenceMinorUnits = toMinorUnits(watchNewTotal || 0, displayCurrency) - currentTotalBalanceMinorUnits;

  const onSubmit = async (data: ReconcileFormData) => {
    if (accounts.length === 0) {
      toast.error('No accounts available to adjust.');
      return;
    }

    const selectedAccount = accounts.find(a => a.id === data.accountId);
    if (!selectedAccount) {
      toast.error('Selected account not found.');
      return;
    }

    const diffMinorUnits = toMinorUnits(data.newTotalBalance, displayCurrency) - currentTotalBalanceMinorUnits;
    if (diffMinorUnits === 0) {
      toast.info('No changes made to total balance.');
      onSuccess?.();
      return;
    }

    setIsLoading(true);
    try {
      const newAccountBalance = selectedAccount.balanceMinorUnits + diffMinorUnits;

      await updateAccount({
        id: selectedAccount.id,
        data: {
          balanceMinorUnits: newAccountBalance
        }
      });
      
      toast.success('Total balance reconciled successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to reconcile balance.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-surface-sunken p-4 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground mb-1">Current Total Balance</p>
        <p className="text-2xl font-display font-bold">
          {formatCurrency(currentTotalBalanceMinorUnits, displayCurrency)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newTotalBalance">New Total Balance</Label>
        <Input
          id="newTotalBalance"
          type="number"
          step="0.01"
          {...register('newTotalBalance')}
          placeholder="0.00"
        />
        {errors.newTotalBalance && <p className="text-sm text-destructive">{errors.newTotalBalance.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountId">Apply Difference To Account</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Select which account's balance should be adjusted to reach the new total.
        </p>
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
              <SelectTrigger id="accountId">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balanceMinorUnits, acc.currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.accountId && <p className="text-sm text-destructive">{errors.accountId.message}</p>}
      </div>

      {differenceMinorUnits !== 0 && (
        <div className="text-sm border border-border p-3 rounded bg-background">
          Adjustment Amount:{' '}
          <span className={`font-semibold ${differenceMinorUnits > 0 ? 'text-positive' : 'text-negative'}`}>
            {differenceMinorUnits > 0 ? '+' : ''}{formatCurrency(differenceMinorUnits, displayCurrency)}
          </span>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isLoading || accounts.length === 0}>
          {isLoading ? 'Reconciling...' : 'Reconcile Balance'}
        </Button>
      </div>
    </form>
  );
}
