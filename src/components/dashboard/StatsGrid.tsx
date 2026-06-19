'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { HiArrowTrendingUp, HiArrowTrendingDown, HiOutlineWallet, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineSparkles } from 'react-icons/hi2';

interface StatsGridProps {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
  isLoading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const StatsGrid: React.FC<StatsGridProps> = ({
  balance,
  income,
  expenses,
  savings,
  balanceChange,
  incomeChange,
  expenseChange,
  savingsChange,
  isLoading
}) => {
  const stats = [
    {
      title: 'Total Balance',
      amount: balance,
      change: balanceChange,
      icon: HiOutlineWallet,
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400'
    },
    {
      title: 'Total Income',
      amount: income,
      change: incomeChange,
      icon: HiOutlineArrowTrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Total Expenses',
      amount: expenses,
      change: expenseChange,
      icon: HiOutlineArrowTrendingDown,
      gradient: 'from-rose-500 to-rose-600',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400'
    },
    {
      title: 'Total Savings',
      amount: savings,
      change: savingsChange,
      icon: HiOutlineSparkles,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-32 animate-pulse bg-white/5 border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item}>
          <Card className="p-6 bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-xl overflow-hidden relative group">
            <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.gradient} transition-opacity group-hover:opacity-20`} />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(stat.amount)}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <span className={`flex items-center text-sm font-medium ${stat.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change >= 0 ? <HiArrowTrendingUp className="w-4 h-4 mr-1" /> : <HiArrowTrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(stat.change)}%
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                vs last month
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
