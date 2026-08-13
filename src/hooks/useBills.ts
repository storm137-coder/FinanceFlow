import { useCollection } from './useCollection';
import { Bill } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useBills() {
  const { data, loading, error, add, update, remove, refresh } = useCollection<Bill>('bills');
  
  return {
    bills: data,
    loading,
    error,
    addBill: add,
    updateBill: update,
    deleteBill: remove,
    refresh
  };
}
export function useUpdateBill() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      if (!user) throw new Error('Not logged in');
      const ref = doc(db, 'users', user.uid, 'bills', id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    }
  });
}
export function useDeleteBill() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not logged in');
      const ref = doc(db, 'users', user.uid, 'bills', id);
      await deleteDoc(ref);
    }
  });
}
