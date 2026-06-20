'use client';

import React, { useState, useMemo } from 'react';
import { useBills } from '@/hooks/useBills';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BillForm } from '@/components/finance/BillForm';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
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
        const days = differenceInDays(new Date(b.dueDate), new Date());
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
        <Card className="p-4 border-l-4 border-l-warning/50">
          <p className="text-caption text-muted-foreground mb-1">Total Due</p>
          <p className="text-h3 font-display text-warning truncate">{formatCurrency(stats.totalDue, user?.currency)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-positive/50">
          <p className="text-caption text-muted-foreground mb-1">Paid This Month</p>
          <p className="text-h3 font-display text-positive truncate">{formatCurrency(stats.totalPaid, user?.currency)}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary/50">
          <p className="text-caption text-muted-foreground mb-1">Upcoming (7 days)</p>
          <p className="text-h3 font-display text-foreground">{stats.upcoming} bills</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-surface border border-border border-dashed rounded-xl">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-h3 font-display text-foreground mb-2">No Bills Found</h3>
            <p className="text-body text-muted-foreground max-w-sm mx-auto">You haven't added any bills or subscriptions yet. Add one to start tracking your due dates.</p>
          </div>
        ) : (
          bills.map(bill => {
            const daysUntilDue = differenceInDays(new Date(bill.dueDate), new Date());
            const isOverdue = bill.status !== 'paid' && daysUntilDue < 0;
            const isDueSoon = bill.status !== 'paid' && daysUntilDue >= 0 && daysUntilDue <= 3;

            return (
              <Card key={bill.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-foreground text-lg">{bill.name}</h4>
                      <p className="text-sm text-muted-foreground">{bill.category}</p>
                    </div>
                    {bill.status === 'paid' ? (
                      <span className="bg-positive/10 text-positive text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium"><CheckCircle2 className="w-3 h-3"/> Paid</span>
                    ) : isOverdue ? (
                      <span className="bg-negative/10 text-negative text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3"/> Overdue</span>
                    ) : (
                      <span className="bg-warning/10 text-warning text-xs px-2 py-1 rounded-full font-medium">Due in {daysUntilDue}d</span>
                    )}
                  </div>
                  
                  <p className="text-2xl font-display text-foreground mb-4">
                    {formatCurrency(bill.amount, user?.currency)}
                    {bill.recurring && <span className="text-sm font-normal text-muted-foreground ml-1">/{bill.recurringType === 'monthly' ? 'mo' : bill.recurringType}</span>}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Calendar className="w-4 h-4" />
                    Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => setEditingBill(bill)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {bill.status !== 'paid' && (
                    <Button size="sm" variant="outline" className="text-positive border-positive/30 hover:bg-positive/10" onClick={() => handleMarkPaid(bill)}>
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

