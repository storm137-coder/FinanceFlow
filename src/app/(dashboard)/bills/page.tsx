'use client';

import React, { useState, useMemo } from 'react';
import { useBills } from '@/hooks/useBills';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BillForm } from '@/components/finance/BillForm';
import { formatCurrency } from '@/lib/currency';
import { formatDateSafe, safeParseDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays } from 'date-fns';
import { Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bill } from '@/types';

export default function BillsPage() {
  const { bills = [], loading, addBill, updateBill, deleteBill } = useBills();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const handleMarkPaid = async (bill: Bill) => {
    await updateBill(bill.id, { 
      status: 'paid'
    });
    toast.success('Marked as paid!');
  };

  const stats = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let upcoming = 0;

    bills.forEach(b => {
      if (b.status === 'paid') totalPaid += b.amount;
      if (b.status === 'pending' || b.status === 'overdue') {
        totalDue += b.amount;
        const dueDate = safeParseDate(b.dueDate);
        const days = dueDate ? differenceInDays(dueDate, new Date()) : Infinity;
        if (days >= 0 && days <= 7) upcoming += 1;
      }
    });

    return { totalDue, totalPaid, upcoming };
  }, [bills]);

  if (loading) {
    return <div className="animate-pulse space-y-4 p-4"><div className="h-20 bg-surface-sunken rounded" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-h2 font-display text-foreground">Bills & Subscriptions</h1>
          <p className="text-body text-muted-foreground">Manage your recurring payments and due dates.</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Bill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bill</DialogTitle>
            </DialogHeader>
            <BillForm onSuccess={() => setIsAddModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-0 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-warning" />
          <p className="text-caption text-muted-foreground mb-1.5">Total Due</p>
          <p className="text-h3 font-display text-warning truncate">{formatCurrency(stats.totalDue, user?.currency)}</p>
        </Card>
        <Card className="p-5 border-0 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-positive" />
          <p className="text-caption text-muted-foreground mb-1.5">Paid This Month</p>
          <p className="text-h3 font-display text-positive truncate">{formatCurrency(stats.totalPaid, user?.currency)}</p>
        </Card>
        <Card className="p-5 border-0 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
          <p className="text-caption text-muted-foreground mb-1.5">Upcoming (7 days)</p>
          <p className="text-h3 font-display text-foreground">{stats.upcoming} bills</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-card border border-border border-dashed rounded-xl">
            <div className="mb-4 h-14 w-14 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No Bills Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">You haven&apos;t added any bills or subscriptions yet. Add one to start tracking your due dates.</p>
          </div>
        ) : (
          bills.map(bill => {
            const dueDate = safeParseDate(bill.dueDate);
            const daysUntilDue = dueDate ? differenceInDays(dueDate, new Date()) : Infinity;
            const isOverdue = bill.status !== 'paid' && daysUntilDue < 0;
            const isDueSoon = bill.status !== 'paid' && daysUntilDue >= 0 && daysUntilDue <= 3;

            return (
              <Card key={bill.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{bill.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{bill.category}</p>
                    </div>
                    {bill.status === 'paid' ? (
                      <span className="bg-positive-soft text-positive text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shrink-0"><CheckCircle2 className="w-3 h-3"/> Paid</span>
                    ) : isOverdue ? (
                      <span className="bg-negative-soft text-negative text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shrink-0"><AlertCircle className="w-3 h-3"/> Overdue</span>
                    ) : (
                      <span className="bg-warning-soft text-warning text-xs px-2.5 py-1 rounded-full font-medium shrink-0">Due in {daysUntilDue}d</span>
                    )}
                  </div>

                  <p className="text-2xl font-display text-foreground mb-4">
                    {formatCurrency(bill.amount, user?.currency)}
                    {bill.recurring && <span className="text-sm font-normal text-muted-foreground ml-1">/{bill.recurringType === 'monthly' ? 'mo' : bill.recurringType}</span>}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Calendar className="w-4 h-4" />
                    Due: {formatDateSafe(bill.dueDate, 'MMM dd, yyyy')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => setEditingBill(bill)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {bill.status !== 'paid' && (
                    <Button size="sm" className="text-positive-foreground bg-positive hover:bg-positive/90 border-0" onClick={() => handleMarkPaid(bill)}>
                      Mark Paid
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          {editingBill && (
            <BillForm 
              initialData={editingBill} 
              onSuccess={() => setEditingBill(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

