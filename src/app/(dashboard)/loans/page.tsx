'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { LoanCard } from '@/components/loans/LoanCard';
import { useCollection } from '@/hooks/useCollection';
import type { Loan } from '@/types';
import { loanSchema } from '@/validations/schemas';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlinePlus, HiOutlineBanknotes } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoansPage() {
  const { data: loans, loading, add, update, remove } = useCollection<Loan>('loans');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const form = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      name: '',
      borrowedAmount: 0,
      remainingAmount: 0,
      interestRate: 0,
      monthlyEmi: 0,
      totalInstallments: 0,
      paidInstallments: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }
  });

  const { totalBorrowed, totalMonthlyEmi } = useMemo(() => {
    let borrowed = 0;
    let emi = 0;
    loans.forEach(loan => {
      borrowed += loan.borrowedAmount;
      emi += loan.monthlyEmi;
    });
    return { totalBorrowed: borrowed, totalMonthlyEmi: emi };
  }, [loans]);

  const openModal = (loan?: Loan) => {
    if (loan) {
      setEditingLoan(loan);
      form.reset({
        name: loan.name,
        borrowedAmount: loan.borrowedAmount,
        remainingAmount: loan.remainingAmount,
        interestRate: loan.interestRate,
        monthlyEmi: loan.monthlyEmi,
        totalInstallments: loan.totalInstallments,
        paidInstallments: loan.paidInstallments,
        startDate: loan.startDate ? new Date(loan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: loan.endDate ? new Date(loan.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingLoan(null);
      form.reset({
        name: '',
        borrowedAmount: 0,
        remainingAmount: 0,
        interestRate: 0,
        monthlyEmi: 0,
        totalInstallments: 0,
        paidInstallments: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLoan(null);
    form.reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingLoan) {
        await update(editingLoan.id, data);
        toast.success('Loan updated successfully');
      } else {
        await add(data);
        toast.success('Loan added successfully');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save loan');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await remove(id);
        toast.success('Loan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete loan');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Loans & Debts</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your active loans and track EMIs</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <HiOutlinePlus className="h-4 w-4" />
          Add Loan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none shadow-lg shadow-teal-500/20">
          <h3 className="text-teal-100 font-medium mb-1">Total Borrowed</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalBorrowed)}</p>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Monthly EMI</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalMonthlyEmi)}</p>
        </Card>
      </div>

      {!loading && loans.length === 0 ? (
        <EmptyState
          icon={HiOutlineBanknotes}
          title="No active loans"
          description="You don't have any active loans tracked at the moment."
          action={{ label: 'Add Loan', onClick: () => openModal() }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {loans.map(loan => (
              <motion.div
                key={loan.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <LoanCard 
                  loan={loan} 
                  onEdit={openModal} 
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingLoan ? "Edit Loan" : "Add Loan"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Loan Name</label>
            <Input {...form.register('name')} placeholder="e.g. Home Loan, Car Loan" />
            {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Borrowed Amount</label>
              <Input type="number" step="0.01" {...form.register('borrowedAmount', { valueAsNumber: true })} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Remaining Amount</label>
              <Input type="number" step="0.01" {...form.register('remainingAmount', { valueAsNumber: true })} placeholder="0.00" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Interest Rate (%)</label>
              <Input type="number" step="0.01" {...form.register('interestRate', { valueAsNumber: true })} placeholder="0.0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Monthly EMI</label>
              <Input type="number" step="0.01" {...form.register('monthlyEmi', { valueAsNumber: true })} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Total Installments</label>
              <Input type="number" {...form.register('totalInstallments', { valueAsNumber: true })} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Paid Installments</label>
              <Input type="number" {...form.register('paidInstallments', { valueAsNumber: true })} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Start Date</label>
              <Input type="date" {...form.register('startDate')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">End Date</label>
              <Input type="date" {...form.register('endDate')} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Loan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
