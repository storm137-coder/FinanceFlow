'use client';

import { TransactionForm } from '@/components/finance/TransactionForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, ArrowUpRight, ArrowDownRight, ArrowRightLeft, ArrowLeftRight, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/currency';
import { formatDateSafe } from '@/lib/utils';

export default function TransactionsPage() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactions();

  // Flatten infinite query pages into a single array
  const transactions = data?.pages.flatMap(page => page.transactions) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-display text-foreground">Transactions</h1>
          <p className="text-body text-muted-foreground mt-1">
            Track your income, expenses, and transfers.
          </p>
        </div>
        <Dialog open={isTransactionModalOpen} onOpenChange={(open) => {
          setIsTransactionModalOpen(open);
          if (!open) setSelectedTransaction(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedTransaction(null)} className="shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTransaction ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
            </DialogHeader>
            <TransactionForm
              initialData={selectedTransaction}
              onSuccess={() => {
                setIsTransactionModalOpen(false);
                setSelectedTransaction(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="divide-y divide-border animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="h-4 bg-surface-sunken rounded w-20" />
                <div className="h-4 bg-surface-sunken rounded w-32 flex-1" />
                <div className="h-6 bg-surface-sunken rounded-full w-20" />
                <div className="h-4 bg-surface-sunken rounded w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="mb-3 h-12 w-12 mx-auto rounded-full bg-negative-soft flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-negative" />
            </div>
            <p className="font-medium text-negative">Failed to load transactions</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 h-12 w-12 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="font-medium text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Click &ldquo;Add Transaction&rdquo; to get started.</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-surface-sunken/60 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Category / Merchant</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
            {/* Table Body */}
            <ul className="divide-y divide-border">
              {transactions.map((tx) => (
                <li key={tx.id} className="group p-4 hover:bg-surface-sunken/40 transition-all duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 text-sm text-muted-foreground font-medium">
                      {formatDateSafe(tx.date, 'MMM d, yyyy')}
                    </div>
                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.categoryId}</p>
                      {tx.merchant && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{tx.merchant}</p>
                      )}
                    </div>
                    <div className="col-span-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${tx.type === 'income' ? 'bg-positive-soft text-positive' :
                          tx.type === 'expense' ? 'bg-negative-soft text-negative' :
                          'bg-accent-soft text-accent'}`}
                      >
                        {tx.type === 'income' && <ArrowUpRight className="h-3 w-3" />}
                        {tx.type === 'expense' && <ArrowDownRight className="h-3 w-3" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="h-3 w-3" />}
                        <span className="capitalize">{tx.type}</span>
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-3">
                      <span className={`font-mono text-sm font-medium tabular-nums ${tx.type === 'income' ? 'text-positive' : tx.type === 'expense' ? 'text-negative' : 'text-foreground'}`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency((tx.amountMinorUnits !== undefined ? tx.amountMinorUnits : ((tx as any).amount || 0) * 100), tx.currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsTransactionModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {hasNextPage && (
              <div className="px-5 py-4 text-center border-t border-border bg-surface-sunken/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

