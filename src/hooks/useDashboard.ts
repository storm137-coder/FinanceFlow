import { useMemo } from 'react';
import { useAccounts } from './useAccounts';
import { useTransactions } from './useTransactions';
import { startOfMonth, isAfter } from 'date-fns';
import { Transaction } from '@/types';

export function useDashboard() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions();

  const transactions = useMemo(() => {
    return transactionsData?.pages.flatMap(page => page.transactions) || [];
  }, [transactionsData]);

  const stats = useMemo(() => {
    let totalBalanceMinorUnits = 0;
    
    // Default to USD for the display currency if no accounts, otherwise pick the first account's currency
    const displayCurrency = accounts && accounts.length > 0 ? accounts[0].currency : 'USD';

    if (accounts) {
      totalBalanceMinorUnits = accounts.reduce((acc, account) => acc + account.balanceMinorUnits, 0);
    }

    const monthStart = startOfMonth(new Date());
    
    let monthlyIncomeMinorUnits = 0;
    let monthlyExpenseMinorUnits = 0;
    const categorySpend: Record<string, number> = {};

    transactions.forEach((tx: Transaction) => {
      const txDate = new Date(tx.date);
      if (isAfter(txDate, monthStart)) {
        const amount = tx.amountMinorUnits !== undefined 
          ? tx.amountMinorUnits 
          : Math.round(((tx as any).amount || 0) * 100);
          
        if (tx.type === 'income') {
          monthlyIncomeMinorUnits += amount;
        } else if (tx.type === 'expense') {
          monthlyExpenseMinorUnits += amount;
          
          // Aggregate for pie chart
          if (!categorySpend[tx.categoryId]) {
            categorySpend[tx.categoryId] = 0;
          }
          categorySpend[tx.categoryId] += amount;
        }
      }
    });

    const spendByCategory = Object.entries(categorySpend)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalBalanceMinorUnits,
      displayCurrency,
      monthlyIncomeMinorUnits,
      monthlyExpenseMinorUnits,
      spendByCategory,
      recentTransactions: transactions.slice(0, 5), // Top 5
    };
  }, [accounts, transactions]);

  return {
    ...stats,
    accounts: accounts || [],
    isLoading: accountsLoading || transactionsLoading,
  };
}
