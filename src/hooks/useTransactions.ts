import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { collection, doc, query, where, orderBy, limit, startAfter, getDocs, runTransaction, serverTimestamp, QueryDocumentSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, Account } from '@/types';

export const TRANSACTIONS_QUERY_KEY = ['transactions'];

export function useTransactions(accountId?: string, categoryId?: string) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, accountId, categoryId],
    queryFn: async ({ pageParam = null }: { pageParam: QueryDocumentSnapshot | null }) => {
      if (!user) throw new Error('Not authenticated');

      let q = query(
        collection(db, 'users', user.uid, 'transactions'),
        orderBy('date', 'desc'),
        limit(20)
      );

      if (accountId) {
        q = query(q, where('accountId', '==', accountId));
      }
      
      if (categoryId) {
        q = query(q, where('categoryId', '==', categoryId));
      }

      if (pageParam) {
        q = query(q, startAfter(pageParam));
      }

      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      
      return {
        transactions,
        lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    initialPageParam: null as QueryDocumentSnapshot | null,
    enabled: !!user,
  });
}

export function useAddTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Must be logged in to add a transaction');

      const txRef = doc(collection(db, 'users', user.uid, 'transactions'));
      const accountRef = doc(db, 'users', user.uid, 'accounts', transactionData.accountId);

      await runTransaction(db, async (transaction) => {
        const accountDoc = await transaction.get(accountRef);
        if (!accountDoc.exists()) {
          throw new Error('Account does not exist!');
        }

        const accountData = accountDoc.data() as Account;
        let newBalance = accountData.balanceMinorUnits;

        if (transactionData.type === 'income') {
          newBalance += transactionData.amountMinorUnits;
        } else if (transactionData.type === 'expense') {
          newBalance -= transactionData.amountMinorUnits;
        }
        // Transfers would need two account updates, which we handle separately or extend this.

        transaction.update(accountRef, {
          balanceMinorUnits: newBalance,
          updatedAt: serverTimestamp(),
        });

        // Strip undefined values
        const cleanTransactionData = Object.fromEntries(
          Object.entries(transactionData).filter(([_, v]) => v !== undefined)
        );

        transaction.set(txRef, {
          ...cleanTransactionData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      return txRef.id;
    },
    onSuccess: () => {
      // Invalidate both transactions and accounts since balances changed
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...transactionData }: Partial<Transaction> & { id: string }) => {
      if (!user) throw new Error('Must be logged in to update a transaction');

      const txRef = doc(db, 'users', user.uid, 'transactions', id);
      
      const cleanTransactionData = Object.fromEntries(
        Object.entries(transactionData).filter(([_, v]) => v !== undefined)
      );

      // Note: A real implementation would also need to run a Firestore transaction to update the account balance
      // if the amount, type, or accountId changed. For simplicity in this step, we just update the transaction document.

      await runTransaction(db, async (transaction) => {
        transaction.update(txRef, {
          ...cleanTransactionData,
          updatedAt: serverTimestamp(),
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to delete a transaction');

      const txRef = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(txRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
