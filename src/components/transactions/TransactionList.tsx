'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants';
import { HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineListBullet, HiOutlineSquares2X2 } from 'react-icons/hi2';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all'|'income'|'expense'>('all');
  const [viewMode, setViewMode] = useState<'list'|'grid'>('list');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const term = search.toLowerCase();
      const matchSearch = term === '' || 
        (tx.merchant?.toLowerCase() || '').includes(term) ||
        (tx.source?.toLowerCase() || '').includes(term) ||
        (tx.notes?.toLowerCase() || '').includes(term) ||
        (tx.category?.toLowerCase() || '').includes(term);
      return matchType && matchSearch;
    });
  }, [transactions, search, typeFilter]);

  const paginatedTxs = filteredTxs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);

  const getCategoryDetails = (categoryName: string, type: 'income' | 'expense') => {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return list.find(c => c.value === categoryName || c.label === categoryName) || { label: categoryName, color: '#9ca3af', icon: '📝' };
  };

  return (
    <Card className="flex flex-col bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 shadow-xl overflow-hidden min-h-[600px]">
      <div className="p-4 border-b border-zinc-200/20 dark:border-zinc-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select 
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
          
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white" : "text-zinc-500")}
            >
              <HiOutlineListBullet className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white" : "text-zinc-500")}
            >
              <HiOutlineSquares2X2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-0 overflow-y-auto">
        {filteredTxs.length > 0 ? (
          viewMode === 'list' ? (
            <div className="divide-y divide-zinc-200/20 dark:divide-zinc-800/50">
              {paginatedTxs.map((tx) => {
                const category = getCategoryDetails(tx.category, tx.type);
                const isIncome = tx.type === 'income';
                
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/5 dark:hover:bg-zinc-800/20 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner flex-shrink-0"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.icon || (isIncome ? '💰' : '💸')}
                      </div>
                      <div>
                        <p className="text-base font-medium text-zinc-900 dark:text-white">
                          {isIncome ? tx.source : tx.merchant || tx.notes || 'Transaction'}
                        </p>
                        <div className="flex items-center mt-1 space-x-2 flex-wrap gap-y-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            {category.label}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-500">
                            {formatDate(tx.date as any)}
                          </span>
                          {tx.paymentMethod && (
                             <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center">
                               • {tx.paymentMethod}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className={cn("text-base font-semibold", isIncome ? "text-emerald-500" : "text-rose-500")}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(tx)} className="p-1.5 text-zinc-500 hover:text-indigo-500 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => {
                          if(confirm('Are you sure you want to delete this transaction?')) {
                            onDelete(tx.id);
                          }
                        }} className="p-1.5 text-zinc-500 hover:text-rose-500 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
               {paginatedTxs.map((tx) => {
                 const category = getCategoryDetails(tx.category, tx.type);
                 const isIncome = tx.type === 'income';
                 
                 return (
                   <Card key={tx.id} className="p-4 flex flex-col bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm relative group">
                      <div className="flex justify-between items-start mb-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {category.icon || (isIncome ? '💰' : '💸')}
                        </div>
                        <p className={cn("text-lg font-bold", isIncome ? "text-emerald-500" : "text-rose-500")}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1 line-clamp-1">
                        {isIncome ? tx.source : tx.merchant || tx.notes || 'Transaction'}
                      </p>
                      <p className="text-xs text-zinc-500 mb-4">{formatDate(tx.date as any)}</p>
                      
                      <div className="mt-auto flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-700">
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {category.label}
                        </span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(tx)} className="p-1 text-zinc-400 hover:text-indigo-500">
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            if(confirm('Delete this transaction?')) onDelete(tx.id);
                          }} className="p-1 text-zinc-400 hover:text-rose-500">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                   </Card>
                 )
               })}
            </div>
          )
        ) : (
          <div className="p-12">
            <EmptyState 
              title="No transactions found" 
              description={search ? "Try adjusting your search or filters." : "You haven't added any transactions yet."} 
            />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-zinc-200/20 dark:border-zinc-800/50 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500">
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredTxs.length)} of {filteredTxs.length}
          </p>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
