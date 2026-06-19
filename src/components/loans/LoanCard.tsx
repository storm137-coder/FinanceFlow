import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Loan } from '@/types';
import { formatCurrency, cn, formatDate } from '@/lib/utils';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineHomeModern } from 'react-icons/hi2';

interface LoanCardProps {
  loan: Loan;
  onEdit: (loan: Loan) => void;
  onDelete: (id: string) => void;
}

export function LoanCard({ loan, onEdit, onDelete }: LoanCardProps) {
  const progress = Math.min((loan.paidInstallments / loan.totalInstallments) * 100, 100);
  const remainingInstallments = loan.totalInstallments - loan.paidInstallments;
  
  return (
    <Card className="p-5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <HiOutlineHomeModern className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 leading-tight">
              {loan.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {loan.interestRate}% Interest Rate
            </p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(loan)}>
            <HiOutlinePencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => onDelete(loan.id)}>
            <HiOutlineTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Principal Amount</p>
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(loan.borrowedAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly EMI</p>
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(loan.monthlyEmi)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {loan.paidInstallments} of {loan.totalInstallments} Paid
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {remainingInstallments} left
          </span>
        </div>
        <ProgressBar value={progress} color="default" className="h-2" />
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">End date:</span>
        <span className="font-medium text-slate-900 dark:text-white">{formatDate(loan.endDate)}</span>
      </div>
    </Card>
  );
}
