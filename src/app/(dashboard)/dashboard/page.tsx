'use client';

import { AccountList } from '@/components/finance/AccountList';
import { AccountForm } from '@/components/finance/AccountForm';
import { SummaryCards } from '@/components/finance/SummaryCards';
import { CategorySpendChart } from '@/components/finance/CategorySpendChart';
import { RecentTransactionsWidget } from '@/components/finance/RecentTransactionsWidget';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-display text-foreground">Dashboard</h1>
          <p className="text-body text-muted-foreground mt-1">
            Your financial overview at a glance.
          </p>
        </div>
        <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <AccountForm onSuccess={() => setIsAccountModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Metrics Row */}
      <section className="animate-in-d1">
        <SummaryCards />
      </section>

      {/* Analytics & Recents Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in-d2">
        <CategorySpendChart />
        <RecentTransactionsWidget />
      </section>

      {/* Bottom Row */}
      <section className="animate-in-d3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 font-display">Your Accounts</h2>
        </div>
        <AccountList />
      </section>
    </div>
  );
}
