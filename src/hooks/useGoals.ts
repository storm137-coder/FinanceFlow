import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Goal } from '@/types';
import { useEffect } from 'react';

export const GOALS_QUERY_KEY = ['goals'];

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => new Promise<Goal[]>(() => {}),
    enabled: !!user,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'goals'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goals: Goal[] = [];
        snapshot.forEach((doc) => {
          goals.push({ id: doc.id, ...doc.data() } as Goal);
        });
        
        queryClient.setQueryData(GOALS_QUERY_KEY, goals);
      },
      (error) => {
        console.error('Error fetching goals:', error);
      }
    );

    return () => unsubscribe();
  }, [user, queryClient]);

  return queryResult;
}

export function useAddGoal() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'uid'>) => {
      if (!user) throw new Error('Must be logged in to add a goal');

      const goalsRef = collection(db, 'users', user.uid, 'goals');
      const newGoalRef = doc(goalsRef);

      const cleanGoalData = Object.fromEntries(
        Object.entries(goalData).filter(([_, v]) => v !== undefined)
      );

      const goalPayload = {
        ...cleanGoalData,
        uid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newGoalRef, goalPayload);
      return newGoalRef.id;
    },
  });
}

export function useUpdateGoalProgress() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, newAmountMinorUnits }: { id: string; newAmountMinorUnits: number }) => {
      if (!user) throw new Error('Must be logged in to update a goal');

      const goalRef = doc(db, 'users', user.uid, 'goals', id);
      
      await updateDoc(goalRef, {
        currentMinorUnits: newAmountMinorUnits,
        updatedAt: serverTimestamp(),
      });
    },
  });
}

export function useDeleteGoal() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in to delete a goal');

      const goalRef = doc(db, 'users', user.uid, 'goals', id);
      await deleteDoc(goalRef);
    },
  });
}

export function useUpdateGoal() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      if (!user) throw new Error('Not logged in');
      const ref = doc(db, 'users', user.uid, 'goals', id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    }
  });
}
