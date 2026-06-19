'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { WishlistCard } from '@/components/wishlist/WishlistCard';
import { useCollection } from '@/hooks/useCollection';
import type { WishlistItem } from '@/types';
import { wishlistSchema } from '@/validations/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiOutlinePlus, HiOutlineSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = 'all' | 'planned' | 'saving' | 'purchased';

export default function WishlistPage() {
  const { data: items, loading, add, update, remove } = useCollection<WishlistItem>('wishlist');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  const form = useForm({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      name: '',
      price: 0,
      priority: 'medium',
      status: 'planned' as 'planned' | 'saving' | 'purchased' | 'cancelled',
      storeUrl: '',
      imageUrl: '',
      expectedDate: '',
    }
  });

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(item => item.status === filter);
  }, [items, filter]);

  const openModal = (item?: WishlistItem) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        name: item.name,
        price: item.price,
        priority: item.priority,
        status: item.status,
        storeUrl: item.storeUrl || '',
        imageUrl: item.imageUrl || '',
        expectedDate: item.expectedDate 
          ? new Date(item.expectedDate).toISOString().split('T')[0] 
          : '',
      });
    } else {
      setEditingItem(null);
      form.reset({
        name: '',
        price: 0,
        priority: 'medium',
        status: 'planned',
        storeUrl: '',
        imageUrl: '',
        expectedDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        expectedPurchaseDate: data.expectedPurchaseDate || null
      };

      if (editingItem) {
        await update(editingItem.id, formattedData);
        toast.success('Item updated successfully');
      } else {
        await add(formattedData);
        toast.success('Item added to wishlist');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await remove(id);
        toast.success('Item removed from wishlist');
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wishlist</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and plan your future purchases</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <HiOutlinePlus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto no-scrollbar">
        {(['all', 'planned', 'saving', 'purchased'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {!loading && filteredItems.length === 0 ? (
        <EmptyState
          icon={HiOutlineSparkles}
          title="Wishlist is empty"
          description="You haven't added any items to your wishlist yet."
          action={{ label: 'Add Item', onClick: () => openModal() }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <WishlistCard 
                  item={item} 
                  onEdit={openModal} 
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? "Edit Item" : "Add to Wishlist"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Item Name</label>
            <Input {...form.register('name')} placeholder="e.g. MacBook Pro, Vacation" />
            {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Estimated Price</label>
              <Input type="number" step="0.01" {...form.register('price', { valueAsNumber: true })} placeholder="0.00" />
              {form.formState.errors.price && <p className="text-red-500 text-xs mt-1">{form.formState.errors.price.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Priority</label>
              <select
                {...form.register('priority')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
              <select
                {...form.register('status')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                <option value="planned">Planned</option>
                <option value="saving">Saving</option>
                <option value="purchased">Purchased</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Expected Date</label>
              <Input type="date" {...form.register('expectedDate')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Store URL (Optional)</label>
            <Input {...form.register('storeUrl')} placeholder="https://..." />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Image URL (Optional)</label>
            <Input {...form.register('imageUrl')} placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
