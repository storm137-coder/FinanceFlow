'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { wishlistSchema, WishlistFormData } from '@/validations/schemas';
import { useAddWishlist, useUpdateWishlist, useDeleteWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { WishlistItem } from '@/types';
import { toMinorUnits, fromMinorUnits } from '@/lib/currency';

interface WishlistFormProps {
  onSuccess?: () => void;
  initialData?: WishlistItem;
  defaultCurrency?: string;
}

export function WishlistForm({ onSuccess, initialData, defaultCurrency = 'USD' }: WishlistFormProps) {
  const { mutateAsync: addItem } = useAddWishlist();
  const { mutateAsync: updateItem } = useUpdateWishlist();
  const { mutateAsync: deleteItem } = useDeleteWishlist();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(wishlistSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      price: fromMinorUnits(initialData.priceMinorUnits, defaultCurrency),
      priority: initialData.priority,
      status: initialData.status,
      imageUrl: initialData.imageUrl || '',
      storeUrl: initialData.storeUrl || '',
      expectedDate: initialData.expectedDate || '',
      notes: initialData.notes || '',
      category: initialData.category || '',
    } : {
      name: '',
      price: 0,
      priority: 'medium',
      status: 'planned',
      imageUrl: '',
      storeUrl: '',
      expectedDate: '',
      notes: '',
      category: '',
    }
  });

  const onSubmit = async (data: WishlistFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        priceMinorUnits: toMinorUnits(data.price, defaultCurrency),
        priority: data.priority,
        status: data.status,
        imageUrl: data.imageUrl || '',
        storeUrl: data.storeUrl || '',
        expectedDate: data.expectedDate || '',
        notes: data.notes || '',
        category: data.category || '',
      };

      if (initialData) {
        await updateItem({ id: initialData.id, ...payload });
        toast.success('Wishlist item updated!');
      } else {
        await addItem(payload);
        toast.success('Added to wishlist!');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setIsLoading(true);
    try {
      await deleteItem(initialData.id);
      toast.success('Item removed from wishlist.');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input id="name" {...register('name')} placeholder="e.g. Sony WH-1000XM5" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Estimated Price</Label>
          <Input id="price" type="number" step="0.01" {...register('price')} />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeUrl">Store Link (Optional)</Label>
        <Input id="storeUrl" type="url" {...register('storeUrl')} placeholder="https://amazon.com/..." />
        {errors.storeUrl && <p className="text-sm text-destructive">{errors.storeUrl.message}</p>}
      </div>

      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="saving">Saving</SelectItem>
                  <SelectItem value="purchased">Purchased</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Add to Wishlist'}
        </Button>
        {initialData && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
