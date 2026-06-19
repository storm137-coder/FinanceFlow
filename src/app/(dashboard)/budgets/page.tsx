'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { useCollection } from '@/hooks/useCollection';
import type { Budget } from '@/types';
import { budgetSchema } from '@/validations/schemas';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlinePlus, HiOutlineChartPie, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function BudgetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const monthString = `${year}-${month.toString().padStart(2, '0')}`;
  
  const { data: budgets, loading, add, update, remove } = useCollection<Budget>('budgets');
  
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => b.month === month && b.year === year);
  }, [budgets, month, year]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const form = useForm({
    defaultValues: {
      category: '',
      amount: 0,
      monthStr: monthString,
    }
  });

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const openModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      form.reset({
        category: budget.category,
        amount: budget.amount,
        monthStr: `${budget.year}-${budget.month.toString().padStart(2, '0')}`,
      });
    } else {
      setEditingBudget(null);
      form.reset({
        category: '',
        amount: 0,
        monthStr: monthString,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
    form.reset();
  };

  const onSubmit = async (data: any) => {
    try {
      const [y, m] = data.monthStr.split('-');
      const monthNum = parseInt(m, 10);
      const yearNum = parseInt(y, 10);
      
      const finalData = {
        category: data.category,
        amount: data.amount,
        month: monthNum,
        year: yearNum,
      };

      if (editingBudget) {
        await update(editingBudget.id, { ...finalData, spent: editingBudget.spent });
        toast.success('Budget updated successfully');
      } else {
        await add({ ...finalData, spent: 0 });
        toast.success('Budget created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await remove(id);
        toast.success('Budget deleted successfully');
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Budgets</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your monthly spending limits</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
              <HiOutlineChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 font-medium text-sm w-32 text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
              <HiOutlineChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
          <h3 className="text-blue-100 font-medium mb-1">Total Budget</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalBudget)}</p>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Spent</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Remaining</h3>
          <p className={`text-3xl font-bold ${totalRemaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
            {formatCurrency(totalRemaining)}
          </p>
        </Card>
      </div>

      {!loading && filteredBudgets.length === 0 ? (
        <EmptyState
          icon={HiOutlineChartPie}
          title="No budgets found"
          description="You haven't set up any budgets for this month yet."
          action={{ label: 'Create Budget', onClick: () => openModal() }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredBudgets.map(budget => (
              <motion.div
                key={budget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <BudgetCard budget={budget} onEdit={openModal} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBudget ? "Edit Budget" : "Add Budget"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
            <select
              {...form.register('category', { required: 'Category is required' })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            >
              <option value="">Select a category...</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.category.message as string}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Amount</label>
            <Input
              type="number"
              step="0.01"
              {...form.register('amount', { valueAsNumber: true, required: 'Amount is required' })}
              placeholder="0.00"
            />
            {form.formState.errors.amount && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.amount.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Month</label>
            <Input
              type="month"
              {...form.register('monthStr', { required: 'Month is required' })}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
