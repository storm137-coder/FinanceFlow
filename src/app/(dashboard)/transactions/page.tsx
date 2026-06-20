'use client';

import { TransactionForm } from '@/components/finance/TransactionForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactions();

  // Flatten infinite query pages into a single array
  const transactions = data?.pages.flatMap(page => page.transactions) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-display font-display text-foreground">Transactions</h1>
        <Dialog open={isTransactionModalOpen} onOpenChange={(open) => {
          setIsTransactionModalOpen(open);
          if (!open) setSelectedTransaction(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedTransaction(null)}>
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

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading transactions...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Failed to load transactions.</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions yet. Click &quot;Add Transaction&quot; to start.
          </div>
        ) : (
          <div>
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-surface-sunken text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Date</div>
              <div className="col-span-4">Category / Merchant</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
            <ul className="divide-y divide-border">
              {transactions.map((tx) => (
                <li key={tx.id} className="p-4 hover:bg-surface-sunken/50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {format(new Date(tx.date), 'MMM d, yyyy')}
                    </div>
                    <div className="col-span-4">
                      <p className="font-medium">{tx.categoryId}</p>
                      {tx.merchant && <p className="text-xs text-muted-foreground">{tx.merchant}</p>}
                    </div>
                    <div className="col-span-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${tx.type === 'income' ? 'bg-positive/10 text-positive' : 
                          tx.type === 'expense' ? 'bg-negative/10 text-negative' : 
                          'bg-accent/10 text-accent'}`}
                      >
                        {tx.type === 'income' && <ArrowUpRight className="h-3 w-3" />}
                        {tx.type === 'expense' && <ArrowDownRight className="h-3 w-3" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="h-3 w-3" />}
                        <span className="capitalize">{tx.type}</span>
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-4">
                      <span className={`font-mono font-medium ${tx.type === 'income' ? 'text-positive' : 'text-foreground'}`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency((tx.amountMinorUnits !== undefined ? tx.amountMinorUnits : ((tx as any).amount || 0) * 100), tx.currency)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setIsTransactionModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {hasNextPage && (
              <div className="p-4 text-center border-t border-border bg-surface-sunken/30">
                <Button 
                  variant="outline" 
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

