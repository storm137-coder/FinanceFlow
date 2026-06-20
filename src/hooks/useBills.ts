import { useCollection } from './useCollection';
import { Bill } from '@/types';

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
