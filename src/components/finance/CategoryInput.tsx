'use client';

import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransactions } from '@/hooks/useTransactions';
import { useBills } from '@/hooks/useBills';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/hooks/useGoals';
import { useWishlist } from '@/hooks/useWishlist';

interface CategoryInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  defaultCategories: string[];
  error?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CategoryInput = React.forwardRef<HTMLInputElement, CategoryInputProps>(
  ({ defaultCategories, error, label = "Category", id = "category", value, onChange, ...props }, ref) => {
    const { data: transactionsData } = useTransactions();
    const { bills } = useBills();
    const { data: budgets } = useBudgets();
    const { data: goals } = useGoals();
    const { data: wishlist } = useWishlist();

    const uniqueCategories = useMemo(() => {
      const custom = new Set<string>();
      
      transactionsData?.pages.flatMap(p => p.transactions).forEach(t => {
        if (t.categoryId) custom.add(t.categoryId);
      });
      bills?.forEach(b => {
        if (b.category) custom.add(b.category);
      });
      budgets?.forEach(b => {
        if (b.category) custom.add(b.category);
      });
      goals?.forEach(g => {
        if (g.category) custom.add(g.category);
      });
      wishlist?.forEach(w => {
        if (w.category) custom.add(w.category);
      });

      return Array.from(new Set([...defaultCategories, ...Array.from(custom)])).sort();
    }, [defaultCategories, transactionsData, bills, budgets, goals, wishlist]);

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input 
          id={id}
          list={`${id}-list`}
          autoComplete="off"
          ref={ref}
          value={value}
          onChange={onChange}
          {...props}
        />
        <datalist id={`${id}-list`}>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

CategoryInput.displayName = 'CategoryInput';
