import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, query, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Loan } from '@/types';
import { generateId } from '@/lib/utils';

export const LOANS_QUERY_KEY = ['loans'];

export function useLoans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: LOANS_QUERY_KEY,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const q = query(collection(db, 'users', user.uid, 'loans'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Loan));
    },
    enabled: !!user,
  });
}

export function useAddLoan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanData: Omit<Loan, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Must be logged in to add a loan');

      const id = generateId();
      const loanRef = doc(db, 'users', user.uid, 'loans', id);

      const newLoan: Omit<Loan, 'id'> = {
        uid: user.uid,
        ...loanData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(loanRef, {
        ...newLoan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
    },
  });
}

export function useUpdateLoan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...loanData }: Partial<Loan> & { id: string }) => {
      if (!user) throw new Error('Must be logged in to update a loan');

      const loanRef = doc(db, 'users', user.uid, 'loans', id);
      
      const cleanData = Object.fromEntries(
        Object.entries(loanData).filter(([_, v]) => v !== undefined)
      );

      await updateDoc(loanRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
    },
  });
}

export function useDeleteLoan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to delete a loan');

      const loanRef = doc(db, 'users', user.uid, 'loans', id);
      await deleteDoc(loanRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY });
    },
  });
}
