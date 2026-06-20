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
      <div className="flex items-center justify-between">
        <h1 className="text-display font-display text-foreground">Dashboard</h1>
        <Dialog open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
          <DialogTrigger asChild>
            <Button>
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
      <section>
        <SummaryCards />
      </section>

      {/* Analytics & Recents Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySpendChart />
        <RecentTransactionsWidget />
      </section>

      {/* Bottom Row */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 font-display">Your Accounts</h2>
        </div>
        <AccountList />
      </section>
    </div>
  );
}
