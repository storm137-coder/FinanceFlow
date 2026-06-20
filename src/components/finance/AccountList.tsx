'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { formatCurrency } from '@/lib/currency';
import { CreditCard, Wallet, PiggyBank, Landmark } from 'lucide-react';
import { Account } from '@/types';

function AccountIcon({ type }: { type: Account['type'] }) {
  switch (type) {
    case 'checking': return <Landmark className="h-5 w-5 text-blue-500" />;
    case 'savings': return <PiggyBank className="h-5 w-5 text-green-500" />;
    case 'credit': return <CreditCard className="h-5 w-5 text-purple-500" />;
    case 'cash': return <Wallet className="h-5 w-5 text-amber-500" />;
  }
}

export function AccountList() {
  const { data: accounts, isLoading, error } = useAccounts();

  if (isLoading) return <div className="p-4 text-center text-muted-foreground animate-pulse">Loading accounts...</div>;
  if (error) return <div className="p-4 text-center text-destructive">Failed to load accounts.</div>;
  if (!accounts || accounts.length === 0) return <div className="p-4 text-center text-muted-foreground bg-surface rounded-lg border border-border border-dashed">No accounts found. Add one to get started.</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <div key={account.id} className="p-6 rounded-lg border border-border bg-card text-card-foreground shadow-sm flex flex-col justify-between hover:border-ring transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <AccountIcon type={account.type} />
              <h3 className="font-medium text-lg leading-none">{account.name}</h3>
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-surface-sunken px-2 py-1 rounded">
              {account.type}
            </span>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Balance</p>
            <p className="text-2xl font-bold font-mono tracking-tight">
              {formatCurrency(account.balanceMinorUnits, account.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
