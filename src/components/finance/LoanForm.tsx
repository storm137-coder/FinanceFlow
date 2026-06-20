'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema, LoanFormData } from '@/validations/schemas';
import { useAddLoan, useUpdateLoan, useDeleteLoan } from '@/hooks/useLoans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loan } from '@/types';
import { toMinorUnits, fromMinorUnits } from '@/lib/currency';

interface LoanFormProps {
  onSuccess?: () => void;
  initialData?: any;
  defaultCurrency?: string;
}

export function LoanForm({ onSuccess, initialData, defaultCurrency = 'USD' }: LoanFormProps) {
  const { mutateAsync: addLoan } = useAddLoan();
  const { mutateAsync: updateLoan } = useUpdateLoan();
  const { mutateAsync: deleteLoan } = useDeleteLoan();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      borrowedAmount: fromMinorUnits(initialData.borrowedAmountMinorUnits, defaultCurrency),
      remainingAmount: fromMinorUnits(initialData.remainingAmountMinorUnits, defaultCurrency),
      interestRate: initialData.interestRate,
      durationYears: Math.floor(initialData.totalInstallments / 12),
      durationMonths: initialData.totalInstallments % 12,
      startDate: initialData.startDate,
      paidInstallments: initialData.paidInstallments,
      lender: initialData.lender || '',
      notes: initialData.notes || '',
    } : {
      name: '',
      borrowedAmount: 0,
      remainingAmount: 0,
      interestRate: 0,
      durationYears: 1,
      durationMonths: 0,
      startDate: new Date().toISOString().split('T')[0],
      paidInstallments: 0,
    }
  });

  // Watch fields for EMI auto-calculation
  const borrowedAmount = useWatch({ control: control, name: 'borrowedAmount' });
  const remainingAmount = useWatch({ control: control, name: 'remainingAmount' });
  const interestRate = useWatch({ control: control, name: 'interestRate' });
  const durationYears = useWatch({ control: control, name: 'durationYears' });
  const durationMonths = useWatch({ control: control, name: 'durationMonths' });

  const years = parseInt(String(durationYears) || '0', 10) || 0;
  const months = parseInt(String(durationMonths) || '0', 10) || 0;
  const totalMonths = years * 12 + months;

  const pBorrowed = parseFloat(String(borrowedAmount) || '0') || 0;
  const pRemaining = parseFloat(String(remainingAmount) || '0') || 0;
  const pInterest = parseFloat(String(interestRate) || '0') || 0;

  const principal = pRemaining > 0 ? pRemaining : pBorrowed;

  // Calculate EMI
  let calculatedEmi = 0;
  
  if (principal > 0 && totalMonths > 0) {
    if (pInterest === 0) {
      calculatedEmi = principal / totalMonths;
    } else {
      const monthlyRate = pInterest / 100 / 12;
      const mathPow = Math.pow(1 + monthlyRate, totalMonths);
      calculatedEmi = principal * (monthlyRate * mathPow) / (mathPow - 1);
    }
  }

  const onSubmit = async (data: LoanFormData) => {
    setIsLoading(true);
    try {
      const parsedYears = parseInt(String(data.durationYears) || '0', 10);
      const parsedMonths = parseInt(String(data.durationMonths) || '0', 10);
      const totalInstallments = parsedYears * 12 + parsedMonths;
      
      // Calculate End Date based on Start Date and duration
      const startDateObj = new Date(data.startDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setMonth(endDateObj.getMonth() + totalInstallments);
      const endDateStr = endDateObj.toISOString().split('T')[0];

      const payload = {
        name: data.name,
        borrowedAmountMinorUnits: toMinorUnits(data.borrowedAmount, defaultCurrency),
        remainingAmountMinorUnits: toMinorUnits(data.remainingAmount, defaultCurrency),
        interestRate: data.interestRate,
        monthlyEmiMinorUnits: toMinorUnits(calculatedEmi, defaultCurrency),
        startDate: data.startDate,
        endDate: endDateStr,
        paidInstallments: data.paidInstallments,
        totalInstallments: totalInstallments,
        lender: data.lender || '',
        notes: data.notes || '',
      };

      if (initialData) {
        await updateLoan({ id: initialData.id, ...payload });
        toast.success('Loan updated successfully!');
      } else {
        await addLoan(payload);
        toast.success('Loan added successfully!');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save loan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this loan?')) return;
    
    setIsLoading(true);
    try {
      await deleteLoan(initialData.id);
      toast.success('Loan deleted successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete loan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Loan Name</Label>
        <Input id="name" {...register('name')} placeholder="e.g. Home Mortgage" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="borrowedAmount">Total Borrowed</Label>
          <Input id="borrowedAmount" type="number" step="0.01" {...register('borrowedAmount')} />
          {errors.borrowedAmount && <p className="text-sm text-destructive">{errors.borrowedAmount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="remainingAmount">Remaining Balance</Label>
          <Input id="remainingAmount" type="number" step="0.01" {...register('remainingAmount')} />
          {errors.remainingAmount && <p className="text-sm text-destructive">{errors.remainingAmount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
          {errors.interestRate && <p className="text-sm text-destructive">{errors.interestRate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyEmi">Monthly Payment (Auto-Calculated)</Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-surface-sunken px-3 py-2 text-sm text-muted-foreground items-center">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: defaultCurrency }).format(calculatedEmi)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="durationYears">Duration (Years)</Label>
          <Input id="durationYears" type="number" {...register('durationYears')} />
          {errors.durationYears && <p className="text-sm text-destructive">{errors.durationYears.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMonths">Duration (Months)</Label>
          <Input id="durationMonths" type="number" {...register('durationMonths')} />
          {errors.durationMonths && <p className="text-sm text-destructive">{errors.durationMonths.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="paidInstallments">Installments Already Paid</Label>
          <Input id="paidInstallments" type="number" {...register('paidInstallments')} />
          {errors.paidInstallments && <p className="text-sm text-destructive">{errors.paidInstallments.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lender">Lender (Optional)</Label>
        <Input id="lender" {...register('lender')} placeholder="e.g. Chase Bank" />
        {errors.lender && <p className="text-sm text-destructive">{errors.lender.message}</p>}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Loan' : 'Save Loan'}
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
