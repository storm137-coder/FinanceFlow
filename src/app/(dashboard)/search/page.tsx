'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction, Goal, Bill, Investment, Loan, WishlistItem } from '@/types';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineCreditCard, 
  HiOutlineChartBar, 
  HiOutlineCalendar,
  HiOutlineBanknotes,
  HiOutlineHome,
  HiOutlineShoppingBag
} from 'react-icons/hi2';

type SearchTab = 'all' | 'transactions' | 'goals' | 'bills' | 'investments' | 'loans' | 'wishlist';

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: transactions, loading: l1 } = useCollection<Transaction>('transactions');
  const { data: goals, loading: l2 } = useCollection<Goal>('goals');
  const { data: bills, loading: l3 } = useCollection<Bill>('bills');
  const { data: investments, loading: l4 } = useCollection<Investment>('investments');
  const { data: loans, loading: l5 } = useCollection<Loan>('loans');
  const { data: wishlist, loading: l6 } = useCollection<WishlistItem>('wishlist');

  const loading = l1 || l2 || l3 || l4 || l5 || l6;
  const currency = user?.currency || 'USD';

  const results = useMemo(() => {
    if (!query.trim()) return { transactions: [], goals: [], bills: [], investments: [], loans: [], wishlist: [] };
    const lowerQuery = query.toLowerCase();

    return {
      transactions: (transactions || []).filter(t => (t.merchant || '').toLowerCase().includes(lowerQuery) || (t.source || '').toLowerCase().includes(lowerQuery) || (t.description || '').toLowerCase().includes(lowerQuery) || t.category.toLowerCase().includes(lowerQuery)),
      goals: (goals || []).filter(g => g.name.toLowerCase().includes(lowerQuery)),
      bills: (bills || []).filter(b => b.name.toLowerCase().includes(lowerQuery)),
      investments: (investments || []).filter(i => i.name.toLowerCase().includes(lowerQuery) || (i.broker || '').toLowerCase().includes(lowerQuery)),
      loans: (loans || []).filter(l => l.name.toLowerCase().includes(lowerQuery) || (l.lender || '').toLowerCase().includes(lowerQuery)),
      wishlist: (wishlist || []).filter(w => w.name.toLowerCase().includes(lowerQuery)),
    };
  }, [query, transactions, goals, bills, investments, loans, wishlist]);

  const tabs = [
    { id: 'all', label: 'All Results' },
    { id: 'transactions', label: 'Transactions', count: results.transactions.length },
    { id: 'goals', label: 'Goals', count: results.goals.length },
    { id: 'bills', label: 'Bills', count: results.bills.length },
    { id: 'investments', label: 'Investments', count: results.investments.length },
    { id: 'loans', label: 'Loans', count: results.loans.length },
    { id: 'wishlist', label: 'Wishlist', count: results.wishlist.length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!query.trim()) {
      return (
        <div className="py-20">
          <EmptyState
            icon={HiOutlineMagnifyingGlass}
            title="Search FinanceFlow"
            description="Type above to search across your transactions, goals, bills, and more. Use Ctrl+K to focus."
          />
        </div>
      );
    }

    const hasResults = Object.values(results).some(arr => arr.length > 0);
    
    if (!hasResults) {
      return (
        <div className="py-20">
          <EmptyState
            icon={HiOutlineMagnifyingGlass}
            title="No results found"
            description={`We couldn't find anything matching "${query}"`}
          />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {(activeTab === 'all' || activeTab === 'transactions') && results.transactions.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineCreditCard className="text-primary-400" /> Transactions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.transactions.map(tx => (
                <Card key={tx.id} className="glass-panel p-4 border-white/10 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-white truncate pr-2">{tx.merchant || tx.source || tx.description || 'Transaction'}</p>
                    <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-white/50">
                    <span className="capitalize">{tx.category.replace('_', ' ')}</span>
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'goals') && results.goals.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineChartBar className="text-purple-400" /> Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.goals.map(goal => (
                <Card key={goal.id} className="glass-panel p-4 border-white/10 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-white truncate pr-2">{goal.name}</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-sm text-white/50">
                    <span>{formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'bills') && results.bills.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineCalendar className="text-blue-400" /> Bills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.bills.map(bill => (
                <Card key={bill.id} className="glass-panel p-4 border-white/10 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-white truncate pr-2">{bill.name}</p>
                    <span className="text-white font-medium">{formatCurrency(bill.amount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Due: {formatDate(bill.dueDate)}</span>
                    <span className={bill.status === 'paid' ? 'text-emerald-400' : 'text-blue-400'}>{bill.status}</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-6 h-6" />
        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything... (Ctrl+K)"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg backdrop-blur-md"
          autoComplete="off"
        />
      </div>

      {query.trim() && (
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
          {tabs.map(tab => {
            if (tab.id !== 'all' && tab.count === 0) return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SearchTab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-60">({tab.count})</span>}
              </button>
            )
          })}
        </div>
      )}

      {renderContent()}
    </div>
  );
}
