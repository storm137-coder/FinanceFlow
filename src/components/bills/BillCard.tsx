import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Bill } from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineArrowPath } from 'react-icons/hi2';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (bill: Bill) => void;
}

export function BillCard({ bill, onEdit, onDelete, onMarkAsPaid }: BillCardProps) {
  const isOverdue = new Date(bill.dueDate) < new Date() && bill.status !== 'paid';
  const dueDateObj = new Date(bill.dueDate);
  const today = new Date();
  const diffTime = Math.abs(dueDateObj.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusBadge = null;
  if (bill.status === 'paid') {
    statusBadge = <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">Paid</span>;
  } else if (isOverdue) {
    statusBadge = <span className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">Overdue</span>;
  } else {
    statusBadge = <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">Due in {diffDays} days</span>;
  }

  return (
    <Card className="p-5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            {bill.recurring ? <HiOutlineArrowPath className="w-5 h-5" /> : <HiOutlineCheckCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 leading-tight">
              {bill.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {bill.category} {bill.recurring && `• ${bill.recurringType}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="font-bold text-lg text-slate-900 dark:text-white">
            {formatCurrency(bill.amount)}
          </span>
          {statusBadge}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Due: <span className="font-medium text-slate-900 dark:text-slate-200">{formatDate(bill.dueDate)}</span>
        </div>
        <div className="flex gap-2">
          {bill.status !== 'paid' && (
            <Button 
              size="sm" 
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900/50 dark:hover:bg-green-900/20"
              onClick={() => onMarkAsPaid(bill)}
            >
              Mark Paid
            </Button>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(bill)}>
              <HiOutlinePencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => onDelete(bill.id)}>
              <HiOutlineTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
