'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  WhereFilterOp
} from 'firebase/firestore';

interface UseCollectionOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  whereClause?: [string, WhereFilterOp, any][];
  where?: [string, WhereFilterOp, any][];
}

export function useCollection<T extends { id: string }>(
  collectionName: string,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Stringify options to avoid infinite loops if an object literal is passed
  const optionsString = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let q = query(collection(db, 'users', user.uid, collectionName), where('uid', '==', user.uid));
      
      const parsedOptions = optionsString ? JSON.parse(optionsString) as UseCollectionOptions : undefined;

      if (parsedOptions?.whereClause) {
        parsedOptions.whereClause.forEach(([field, op, value]) => {
          q = query(q, where(field, op, value));
        });
      } else if (parsedOptions?.where) {
        parsedOptions.where.forEach(([field, op, value]) => {
          q = query(q, where(field, op, value));
        });
      }

      if (parsedOptions?.orderByField) {
        q = query(q, orderBy(parsedOptions.orderByField, parsedOptions.orderDirection || 'desc'));
      }

      if (parsedOptions?.limitCount) {
        q = query(q, limit(parsedOptions.limitCount));
      }

      const querySnapshot = await getDocs(q);
      const items: T[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching collection:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, optionsString, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const add = async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'uid'>) => {
    if (!user) throw new Error('Not authenticated');
    
    const newDocRef = doc(collection(db, 'users', user.uid, collectionName));
    const dataToSave = {
      ...item,
      uid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(newDocRef, dataToSave);
    await fetchData(); // Refresh data
    return newDocRef.id;
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (!user) throw new Error('Not authenticated');
    
    const docRef = doc(db, 'users', user.uid, collectionName, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await fetchData();
  };

  const remove = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    
    await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
    await fetchData();
  };

  return { data, loading, error, add, update, remove, refresh: fetchData };
}
