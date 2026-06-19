'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCollection } from '@/hooks/useCollection';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/Button';
import { HiOutlinePlus } from 'react-icons/hi2';
import type { Transaction } from '@/types';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const { data: transactions, loading: isLoading, remove } = useCollection<Transaction>('transactions', {
    orderByField: 'date',
    orderDirection: 'desc'
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const handleAdd = () => {
    setTransactionToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success('Transaction deleted');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 h-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Transactions</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Manage your income and expenses
          </p>
        </div>
        <Button onClick={handleAdd} className="flex-shrink-0">
          <HiOutlinePlus className="w-5 h-5 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="h-[600px] w-full animate-pulse bg-white/5 border border-white/10 rounded-2xl" />
        ) : (
          <TransactionList 
            transactions={transactions || []} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setTransactionToEdit(null);
        }}
        transactionToEdit={transactionToEdit}
      />
    </motion.div>
  );
}
