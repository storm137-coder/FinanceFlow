'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection } from '@/hooks/useCollection';
import type { Transaction, Goal, Bill, Investment, Loan, WishlistItem } from '@/types';

export function useSearch() {
  const [query, setQuery] = useState('');
  const { data: transactions } = useCollection<Transaction>('transactions');
  const { data: goals } = useCollection<Goal>('goals');
  const { data: bills } = useCollection<Bill>('bills');
  const { data: investments } = useCollection<Investment>('investments');
  const { data: loans } = useCollection<Loan>('loans');
  const { data: wishlist } = useCollection<WishlistItem>('wishlist');

  const results = useMemo(() => {
    if (!query.trim()) return { transactions: [], goals: [], bills: [], investments: [], loans: [], wishlist: [] };
    const q = query.toLowerCase();
    return {
      transactions: transactions.filter(t =>
        t.categoryId?.toLowerCase().includes(q) ||
        t.merchant?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
      ),
      goals: goals.filter(g => g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)),
      bills: bills.filter(b => b.name.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q)),
      investments: investments.filter(i => i.name.toLowerCase().includes(q) || i.type?.toLowerCase().includes(q)),
      loans: loans.filter(l => l.name.toLowerCase().includes(q) || l.lender?.toLowerCase().includes(q)),
      wishlist: wishlist.filter(w => w.name.toLowerCase().includes(q) || w.category?.toLowerCase().includes(q)),
    };
  }, [query, transactions, goals, bills, investments, loans, wishlist]);

  const totalResults = useMemo(() =>
    Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
    [results]
  );

  return { query, setQuery, results, totalResults };
}
