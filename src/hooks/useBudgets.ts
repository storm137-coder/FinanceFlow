import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Budget } from '@/types';
import { useEffect, useMemo } from 'react';
import { useAllTransactions } from './useTransactions';
import { getTransactionDateComponents } from '@/lib/utils';

export const BUDGETS_QUERY_KEY = ['budgets'];

export function useBudgets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: allTransactions = [] } = useAllTransactions();

  const queryResult = useQuery({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: () => new Promise<Budget[]>(() => {}),
    enabled: !!user,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'budgets'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const budgets: Budget[] = [];
        snapshot.forEach((doc) => {
          budgets.push({ id: doc.id, ...doc.data() } as Budget);
        });
        
        queryClient.setQueryData(BUDGETS_QUERY_KEY, budgets);
      },
      (error) => {
        console.error('Error fetching budgets:', error);
      }
    );

    return () => unsubscribe();
  }, [user, queryClient]);

  // Compute spentMinorUnits dynamically from allTransactions for each budget
  const budgetsWithSpent = useMemo(() => {
    if (!queryResult.data) return undefined;

    return queryResult.data.map((budget) => {
      const budgetCat = (budget.category || '').trim().toLowerCase();
      const targetYear = typeof budget.year === 'number' ? budget.year : new Date().getFullYear();
      const targetMonth = typeof budget.month === 'number' ? budget.month : new Date().getMonth();

      let spent = 0;
      allTransactions.forEach((tx) => {
        if (tx.type !== 'expense') return;

        const txCat = (tx.categoryId || '').trim().toLowerCase();
        if (txCat !== budgetCat) return;

        const dateComp = getTransactionDateComponents(tx.date);
        if (!dateComp) return;

        if (dateComp.year === targetYear && dateComp.month === targetMonth) {
          const amount = tx.amountMinorUnits !== undefined 
            ? tx.amountMinorUnits 
            : Math.round(((tx as any).amount || 0) * 100);
          spent += amount;
        }
      });

      return {
        ...budget,
        spentMinorUnits: spent,
      };
    });
  }, [queryResult.data, allTransactions]);

  return {
    ...queryResult,
    data: budgetsWithSpent,
  };
}

export function useAddBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'spentMinorUnits' | 'uid'>) => {
      if (!user) throw new Error('Must be logged in to add a budget');

      const budgetsRef = collection(db, 'users', user.uid, 'budgets');
      const newBudgetRef = doc(budgetsRef);

      const budgetPayload = {
        ...budgetData,
        uid: user.uid,
        spentMinorUnits: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newBudgetRef, budgetPayload);
      return newBudgetRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });
}

export function useDeleteBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to delete a budget');

      const budgetRef = doc(db, 'users', user.uid, 'budgets', id);
      await deleteDoc(budgetRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });
}

export function useUpdateBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      if (!user) throw new Error('Not logged in');
      const ref = doc(db, 'users', user.uid, 'budgets', id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });
}
