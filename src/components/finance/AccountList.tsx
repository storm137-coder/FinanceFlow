'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { formatCurrency } from '@/lib/currency';
import { CreditCard, Wallet, PiggyBank, Landmark, Edit2 } from 'lucide-react';
import { Account } from '@/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AccountForm } from '@/components/finance/AccountForm';

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
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  if (isLoading) return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-surface-sunken" />
            <div className="h-4 bg-surface-sunken rounded w-24" />
          </div>
          <div className="h-3 bg-surface-sunken rounded w-16" />
          <div className="h-6 bg-surface-sunken rounded w-32" />
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-destructive bg-card rounded-xl border border-border">
      <p>Failed to load accounts.</p>
    </div>
  );

  if (!accounts || accounts.length === 0) return (
    <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border border-dashed">
      <div className="mb-3 h-12 w-12 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <Landmark className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="font-medium">No accounts found</p>
      <p className="text-sm mt-1">Add an account to start tracking your finances.</p>
    </div>
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <div key={account.id} className="group relative p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col justify-between card-hover-effect">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-surface-sunken flex items-center justify-center">
                <AccountIcon type={account.type} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground leading-tight">{account.name}</h3>
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground bg-surface-sunken px-2.5 py-1 rounded-md shrink-0">
              {account.type}
            </span>
          </div>

          <div className="flex-1 min-w-0 flex items-end justify-between mt-2">
            <div className="min-w-0 pr-4">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Balance</p>
              <p className="text-xl font-bold font-mono tabular-nums tracking-tight text-foreground truncate">
                {formatCurrency(account.balanceMinorUnits, account.currency)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={() => setEditingAccount(account)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      </div>

      <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              initialData={editingAccount}
              onSuccess={() => setEditingAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
