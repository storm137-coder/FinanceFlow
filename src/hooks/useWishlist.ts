import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, query, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { WishlistItem } from '@/types';
import { generateId } from '@/lib/utils';

export const WISHLIST_QUERY_KEY = ['wishlist'];

export function useWishlist() {
  const { user } = useAuth();

  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const q = query(collection(db, 'users', user.uid, 'wishlist'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));
    },
    enabled: !!user,
  });
}

export function useAddWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: Omit<WishlistItem, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Must be logged in to add an item');

      const id = generateId();
      const itemRef = doc(db, 'users', user.uid, 'wishlist', id);

      const newItem: Omit<WishlistItem, 'id'> = {
        uid: user.uid,
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(itemRef, {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}

export function useUpdateWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...itemData }: Partial<WishlistItem> & { id: string }) => {
      if (!user) throw new Error('Must be logged in to update an item');

      const itemRef = doc(db, 'users', user.uid, 'wishlist', id);
      
      const cleanData = Object.fromEntries(
        Object.entries(itemData).filter(([_, v]) => v !== undefined)
      );

      await updateDoc(itemRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}

export function useDeleteWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to delete an item');

      const itemRef = doc(db, 'users', user.uid, 'wishlist', id);
      await deleteDoc(itemRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}
