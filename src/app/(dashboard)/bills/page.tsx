'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { BillCard } from '@/components/bills/BillCard';
import { useCollection } from '@/hooks/useCollection';
import type { Bill } from '@/types';
import { billSchema } from '@/validations/schemas';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlinePlus, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = 'all' | 'due' | 'paid' | 'overdue';

export default function BillsPage() {
  const { data: bills, loading, add, update, remove } = useCollection<Bill>('bills');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const form = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: {
      name: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      category: '',
      recurring: false,
      recurringType: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
      status: 'pending' as 'pending' | 'paid' | 'overdue',
    }
  });

  const isRecurring = form.watch('recurring');

  const filteredBills = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      const isOverdue = dueDate < today && bill.status !== 'paid';

      if (filter === 'due') return bill.status !== 'paid' && !isOverdue;
      if (filter === 'paid') return bill.status === 'paid';
      if (filter === 'overdue') return isOverdue;
      return true;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills, filter]);

  const { totalDue, paidThisMonth, upcoming } = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let due = 0;
    let paid = 0;
    let upc = 0;

    bills.forEach(bill => {
      const dueDate = new Date(bill.dueDate);
      if (bill.status !== 'paid') {
        due += bill.amount;
        if (dueDate > today) upc += bill.amount;
      }
      if (bill.status === 'paid' && dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
        paid += bill.amount;
      }
    });

    return { totalDue: due, paidThisMonth: paid, upcoming: upc };
  }, [bills]);

  const openModal = (bill?: Bill) => {
    if (bill) {
      setEditingBill(bill);
      form.reset({
        name: bill.name,
        amount: bill.amount,
        dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
        category: bill.category,
        recurring: bill.recurring || false,
        recurringType: bill.recurringType || 'monthly',
        status: bill.status,
      });
    } else {
      setEditingBill(null);
      form.reset({
        name: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        category: '',
        recurring: false,
        recurringType: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
        status: 'pending',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBill(null);
    form.reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingBill) {
        await update(editingBill.id, data);
        toast.success('Bill updated successfully');
      } else {
        await add(data);
        toast.success('Bill created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save bill');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await remove(id);
        toast.success('Bill deleted successfully');
      } catch (error) {
        toast.error('Failed to delete bill');
      }
    }
  };

  const handleMarkAsPaid = async (bill: Bill) => {
    try {
      await update(bill.id, { status: 'paid' });
      toast.success('Bill marked as paid');
    } catch (error) {
      toast.error('Failed to update bill');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bills & Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and manage your recurring payments</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <HiOutlinePlus className="h-4 w-4" />
          Add Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20">
          <h3 className="text-indigo-100 font-medium mb-1">Total Due</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalDue)}</p>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Paid This Month</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(paidThisMonth)}</p>
        </Card>
        <Card className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Upcoming</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(upcoming)}</p>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {(['all', 'due', 'paid', 'overdue'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {!loading && filteredBills.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentText}
          title="No bills found"
          description="There are no bills matching your current filter."
          action={{ label: 'Add Bill', onClick: () => openModal() }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredBills.map(bill => (
              <motion.div
                key={bill.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <BillCard 
                  bill={bill} 
                  onEdit={openModal} 
                  onDelete={handleDelete}
                  onMarkAsPaid={handleMarkAsPaid} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBill ? "Edit Bill" : "Add Bill"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Name</label>
            <Input {...form.register('name')} placeholder="e.g. Netflix, Rent" />
            {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message as string}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Amount</label>
              <Input type="number" step="0.01" {...form.register('amount', { valueAsNumber: true })} placeholder="0.00" />
              {form.formState.errors.amount && <p className="text-red-500 text-xs mt-1">{form.formState.errors.amount.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Due Date</label>
              <Input type="date" {...form.register('dueDate')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
            <select
              {...form.register('category')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            >
              <option value="">Select a category...</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="recurring" {...form.register('recurring')} className="rounded border-slate-300" />
            <label htmlFor="recurring" className="text-sm font-medium text-slate-700 dark:text-slate-300">This is a recurring bill</label>
          </div>

          {isRecurring && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Recurring Interval</label>
              <select
                {...form.register('recurringType')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Bill'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
