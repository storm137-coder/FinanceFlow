import { useMemo } from 'react';
import { useAccounts } from './useAccounts';
import { useAllTransactions } from './useTransactions';
import { getTransactionDateComponents } from '@/lib/utils';
import { Transaction } from '@/types';

export function useDashboard() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactions = [], isLoading: transactionsLoading } = useAllTransactions();

  const stats = useMemo(() => {
    let totalBalanceMinorUnits = 0;
    
    // Default to USD for the display currency if no accounts, otherwise pick the first account's currency
    const displayCurrency = accounts && accounts.length > 0 ? accounts[0].currency : 'INR';

    if (accounts) {
      totalBalanceMinorUnits = accounts.reduce((acc, account) => acc + account.balanceMinorUnits, 0);
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0=Jan, 11=Dec)
    
    let monthlyIncomeMinorUnits = 0;
    let monthlyExpenseMinorUnits = 0;
    const categorySpend: Record<string, number> = {};

    transactions.forEach((tx: Transaction) => {
      const dateComp = getTransactionDateComponents(tx.date);
      if (!dateComp) return;

      if (dateComp.year === currentYear && dateComp.month === currentMonth) {
        const amount = tx.amountMinorUnits !== undefined 
          ? tx.amountMinorUnits 
          : Math.round(((tx as any).amount || 0) * 100);
          
        if (tx.type === 'income') {
          monthlyIncomeMinorUnits += amount;
        } else if (tx.type === 'expense') {
          monthlyExpenseMinorUnits += amount;
          
          // Aggregate for pie chart with trimmed category name
          const catName = (tx.categoryId || 'Uncategorized').trim();
          if (!categorySpend[catName]) {
            categorySpend[catName] = 0;
          }
          categorySpend[catName] += amount;
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
