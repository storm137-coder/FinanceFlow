'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { InvestmentCard } from '@/components/investments/InvestmentCard';
import { useCollection } from '@/hooks/useCollection';
import type { Investment } from '@/types';
import { investmentSchema } from '@/validations/schemas';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlinePlus, HiOutlineBriefcase } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export default function InvestmentsPage() {
  const { data: investments, loading, add, update, remove } = useCollection<Investment>('investments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const form = useForm({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: '',
      type: 'stocks',
      investedAmount: 0,
      currentValue: 0,
      broker: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    }
  });

  const { totalInvested, totalCurrentValue, totalReturns, returnsPercentage } = useMemo(() => {
    let invested = 0;
    let current = 0;
    investments.forEach(inv => {
      invested += inv.investedAmount;
      current += inv.currentValue;
    });
    const returns = current - invested;
    const percentage = invested > 0 ? (returns / invested) * 100 : 0;
    return { totalInvested: invested, totalCurrentValue: current, totalReturns: returns, returnsPercentage: percentage };
  }, [investments]);

  const allocationData = useMemo(() => {
    const data: Record<string, number> = {};
    investments.forEach(inv => {
      data[inv.type] = (data[inv.type] || 0) + inv.currentValue;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [investments]);

  const openModal = (inv?: Investment) => {
    if (inv) {
      setEditingInvestment(inv);
      form.reset({
        name: inv.name,
        type: inv.type,
        investedAmount: inv.investedAmount,
        currentValue: inv.currentValue,
        broker: inv.broker,
        purchaseDate: new Date(inv.purchaseDate).toISOString().split('T')[0],
      });
    } else {
      setEditingInvestment(null);
      form.reset({
        name: '',
        type: 'stocks',
        investedAmount: 0,
        currentValue: 0,
        broker: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInvestment(null);
    form.reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingInvestment) {
        await update(editingInvestment.id, data);
        toast.success('Investment updated successfully');
      } else {
        await add(data);
        toast.success('Investment added successfully');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save investment');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await remove(id);
        toast.success('Investment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete investment');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and manage your wealth</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <HiOutlinePlus className="h-4 w-4" />
          Add Investment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg shadow-purple-500/20 md:col-span-1">
          <h3 className="text-purple-100 font-medium mb-1">Current Value</h3>
          <p className="text-3xl font-bold mb-4">{formatCurrency(totalCurrentValue)}</p>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-purple-100 text-sm mb-1">Total Invested</p>
            <p className="font-semibold">{formatCurrency(totalInvested)}</p>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 flex flex-col justify-center">
          <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Returns</h3>
          <p className={`text-3xl font-bold ${totalReturns >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalReturns >= 0 ? '+' : ''}{formatCurrency(totalReturns)}
          </p>
          <p className={`text-sm mt-1 font-medium ${totalReturns >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {totalReturns >= 0 ? '+' : ''}{returnsPercentage.toFixed(2)}% All time
          </p>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 md:col-span-2 flex flex-col h-48">
          <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-2">Asset Allocation</h3>
          {allocationData.length > 0 ? (
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
              No allocation data
            </div>
          )}
        </Card>
      </div>

      {!loading && investments.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No investments found"
          description="Start building your portfolio by adding your first investment."
          action={{ label: 'Add Investment', onClick: () => openModal() }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {investments.map(inv => (
              <motion.div
                key={inv.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <InvestmentCard 
                  investment={inv} 
                  onEdit={openModal} 
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingInvestment ? "Edit Investment" : "Add Investment"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Name</label>
            <Input {...form.register('name')} placeholder="e.g. Apple Inc., Bitcoin" />
            {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Type</label>
              <select
                {...form.register('type')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                <option value="Stocks">Stocks</option>
                <option value="Crypto">Crypto</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Broker/Platform</label>
              <Input {...form.register('broker')} placeholder="e.g. Robinhood, Binance" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Invested Amount</label>
              <Input type="number" step="0.01" {...form.register('investedAmount', { valueAsNumber: true })} placeholder="0.00" />
              {form.formState.errors.investedAmount && <p className="text-red-500 text-xs mt-1">{form.formState.errors.investedAmount.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Current Value</label>
              <Input type="number" step="0.01" {...form.register('currentValue', { valueAsNumber: true })} placeholder="0.00" />
              {form.formState.errors.currentValue && <p className="text-red-500 text-xs mt-1">{form.formState.errors.currentValue.message as string}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Purchase Date</label>
            <Input type="date" {...form.register('purchaseDate')} />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Investment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
