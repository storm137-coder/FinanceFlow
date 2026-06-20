import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Account } from '@/types';
import { useEffect } from 'react';

// Key for React Query cache
export const ACCOUNTS_QUERY_KEY = ['accounts'];

export function useAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // We use useQuery to manage the state, but we populate it via a Firestore onSnapshot listener
  const queryResult = useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: () => new Promise<Account[]>(() => {}), // Stays pending until snapshot resolves
    enabled: !!user,
    staleTime: Infinity, // Rely on Firestore real-time updates instead of React Query refetching
  });

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'accounts'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const accounts: Account[] = [];
        snapshot.forEach((doc) => {
          accounts.push({ id: doc.id, ...doc.data() } as Account);
        });
        
        // Update React Query cache directly
        queryClient.setQueryData(ACCOUNTS_QUERY_KEY, accounts);
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );

    return () => unsubscribe();
  }, [user, queryClient]);

  return queryResult;
}

export function useAddAccount() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'balanceMinorUnits'> & { initialBalanceMinorUnits: number }) => {
      if (!user) throw new Error('Must be logged in to add an account');

      const accountsRef = collection(db, 'users', user.uid, 'accounts');
      const newAccountRef = doc(accountsRef);
      
      const { initialBalanceMinorUnits, ...rest } = accountData;

      const accountPayload = {
        ...rest,
        balanceMinorUnits: initialBalanceMinorUnits,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newAccountRef, accountPayload);
      return newAccountRef.id;
    },
  });
}

export function useUpdateAccount() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>> }) => {
      if (!user) throw new Error('Must be logged in to update an account');

      const accountRef = doc(db, 'users', user.uid, 'accounts', id);
      
      await updateDoc(accountRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
  });
}

export function useDeleteAccount() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to delete an account');

      const accountRef = doc(db, 'users', user.uid, 'accounts', id);
      await deleteDoc(accountRef);
    },
  });
}
