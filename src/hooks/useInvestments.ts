import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, query, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Investment } from '@/types';
import { generateId } from '@/lib/utils';

export const INVESTMENTS_QUERY_KEY = ['investments'];

export function useInvestments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: INVESTMENTS_QUERY_KEY,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const q = query(collection(db, 'users', user.uid, 'investments'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
    },
    enabled: !!user,
  });
}

export function useAddInvestment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invData: Omit<Investment, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Must be logged in to add an investment');

      const id = generateId();
      const invRef = doc(db, 'users', user.uid, 'investments', id);

      const newInv: Omit<Investment, 'id'> = {
        uid: user.uid,
        ...invData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(invRef, {
        ...newInv,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENTS_QUERY_KEY });
    },
  });
}

export function useUpdateInvestment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...invData }: Partial<Investment> & { id: string }) => {
      if (!user) throw new Error('Must be logged in to update an investment');

      const invRef = doc(db, 'users', user.uid, 'investments', id);
      
      const cleanData = Object.fromEntries(
        Object.entries(invData).filter(([_, v]) => v !== undefined)
      );

      await updateDoc(invRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENTS_QUERY_KEY });
    },
  });
}

export function useDeleteInvestment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to delete an investment');

      const invRef = doc(db, 'users', user.uid, 'investments', id);
      await deleteDoc(invRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENTS_QUERY_KEY });
    },
  });
}
