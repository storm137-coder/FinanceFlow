'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCollection } from '@/hooks/useCollection';
import { GoalCard } from '@/components/goals/GoalCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { goalSchema } from '@/validations/schemas';
import { HiOutlinePlus } from 'react-icons/hi2';
import type { Goal } from '@/types';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const { data: goals, loading: isLoading, add, update, remove } = useCollection<Goal>('goals', {
    orderByField: 'deadline',
    orderDirection: 'asc'
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      category: 'Savings',
      priority: 'medium'
    }
  });

  const handleAdd = () => {
    setGoalToEdit(null);
    form.reset({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      category: 'Savings',
      priority: 'medium'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    const deadline = typeof goal.deadline === 'string' ? goal.deadline.split('T')[0] : '';
      
    form.reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: deadline,
      category: goal.category,
      priority: goal.priority
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (goalToEdit) {
        await update(goalToEdit.id, values);
        toast.success('Goal updated');
      } else {
        await add(values);
        toast.success('Goal added');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 h-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Financial Goals</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Track your progress towards your financial targets
          </p>
        </div>
        <Button onClick={handleAdd} className="flex-shrink-0">
          <HiOutlinePlus className="w-5 h-5 mr-2" />
          Add Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 animate-pulse bg-white/5 border border-white/10 rounded-2xl" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-12">
          <EmptyState 
            title="No goals set yet" 
            description="Start saving for your dreams by setting up your first financial goal."
            action={<Button onClick={handleAdd} className="mt-4">Create your first goal</Button>}
          />
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={goalToEdit ? 'Edit Goal' : 'Create New Goal'} className="max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Goal Name</label>
            <Input
              {...form.register('name')}
              placeholder="e.g. New Car, Emergency Fund"
              error={form.formState.errors.name?.message as string}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register('targetAmount', { valueAsNumber: true })}
                  className="pl-8"
                  error={form.formState.errors.targetAmount?.message as string}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register('currentAmount', { valueAsNumber: true })}
                  className="pl-8"
                  error={form.formState.errors.currentAmount?.message as string}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Date</label>
            <Input
              type="date"
              {...form.register('deadline')}
              error={form.formState.errors.deadline?.message as string}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
              <select
                {...form.register('category')}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-white"
              >
                <option value="Savings">Savings</option>
                <option value="Investment">Investment</option>
                <option value="Debt Payoff">Debt Payoff</option>
                <option value="Purchase">Major Purchase</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Priority</label>
              <select
                {...form.register('priority')}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>
              {goalToEdit ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
