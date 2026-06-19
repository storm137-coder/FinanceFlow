'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, calculateSavingsNeeded, cn } from '@/lib/utils';
import type { Goal } from '@/types';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineCalendarDays } from 'react-icons/hi2';
import confetti from 'canvas-confetti';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  
  const getDeadlineDate = () => {
    if (!goal.deadline) return null;
    return new Date(goal.deadline);
  };
  
  const deadline = getDeadlineDate();
  
  const daysRemaining = deadline ? Math.max(0, Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null;

  const handleComplete = () => {
    if (percentage === 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Trigger on mount if 100%
  React.useEffect(() => {
    if (percentage === 100) {
      handleComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage]);

  const savingsNeeded = calculateSavingsNeeded(goal.targetAmount, goal.currentAmount, deadline || new Date());

  const getPriorityColor = () => {
    switch(goal.priority) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <Card className="flex flex-col bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
         {goal.imageUrl && (
           <img src={goal.imageUrl} alt={goal.name} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
         )}
         <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(goal)} className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-md transition-colors">
              <HiOutlinePencil className="w-4 h-4" />
            </button>
            <button onClick={() => {
              if (confirm('Delete this goal?')) onDelete(goal.id);
            }} className="p-1.5 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md text-white rounded-md transition-colors">
              <HiOutlineTrash className="w-4 h-4" />
            </button>
         </div>
         <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="px-2 py-1 text-xs font-semibold bg-white/20 backdrop-blur-md text-white rounded-md shadow-sm">
              {goal.category}
            </span>
            <span className={cn("px-2 py-1 text-xs font-semibold backdrop-blur-md rounded-md shadow-sm border", getPriorityColor())}>
              {goal.priority.toUpperCase()}
            </span>
         </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 line-clamp-1">{goal.name}</h3>
        
        <div className="space-y-4 mb-6 flex-1">
          <div>
            <div className="flex justify-between text-sm font-medium mb-1.5">
              <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
              <span className={percentage === 100 ? "text-emerald-500" : "text-indigo-500"}>{percentage}%</span>
            </div>
            <ProgressBar value={percentage} color={percentage === 100 ? 'success' : 'default'} className="h-2.5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">Current</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{formatCurrency(goal.currentAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">Target</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{formatCurrency(goal.targetAmount)}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-3">
          {percentage < 100 && (
             <div className="flex justify-between items-center text-sm">
               <span className="text-zinc-500">Remaining</span>
               <span className="font-semibold text-zinc-900 dark:text-white">{formatCurrency(remaining)}</span>
             </div>
          )}
          
          {daysRemaining !== null && percentage < 100 && (
             <div className="flex items-center text-sm text-amber-600 dark:text-amber-500">
               <HiOutlineCalendarDays className="w-4 h-4 mr-1.5" />
               <span>{daysRemaining} days left</span>
             </div>
          )}
          
          {daysRemaining !== null && daysRemaining > 0 && percentage < 100 && (
             <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-xs flex justify-between">
               <div className="text-center">
                 <p className="text-zinc-500 mb-0.5">Daily</p>
                 <p className="font-semibold dark:text-zinc-300">{formatCurrency(savingsNeeded.daily)}</p>
               </div>
               <div className="text-center">
                 <p className="text-zinc-500 mb-0.5">Weekly</p>
                 <p className="font-semibold dark:text-zinc-300">{formatCurrency(savingsNeeded.weekly)}</p>
               </div>
               <div className="text-center">
                 <p className="text-zinc-500 mb-0.5">Monthly</p>
                 <p className="font-semibold dark:text-zinc-300">{formatCurrency(savingsNeeded.monthly)}</p>
               </div>
             </div>
          )}
        </div>
      </div>
    </Card>
  );
};
