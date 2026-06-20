'use client';

import { useState } from 'react';
import { useWishlist, useUpdateWishlist } from '@/hooks/useWishlist';
import { WishlistForm } from '@/components/finance/WishlistForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/currency';
import { PlusCircle, Edit2, ShoppingBag, ExternalLink, CheckCircle } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const { mutateAsync: updateItem } = useUpdateWishlist();
  const { data: accounts } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const defaultCurrency = accounts?.[0]?.currency || 'USD';

  const markAsPurchased = async (item: any) => {
    await updateItem({ id: item.id, status: 'purchased' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-negative bg-negative/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-muted-foreground bg-secondary';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display font-display text-foreground">Wishlist</h1>
          <p className="text-muted-foreground mt-1">Track things you want to buy.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedItem(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedItem(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedItem ? 'Edit Item' : 'Add to Wishlist'}</DialogTitle>
            </DialogHeader>
            <WishlistForm 
              initialData={selectedItem}
              defaultCurrency={defaultCurrency}
              onSuccess={() => {
                setIsModalOpen(false);
                setSelectedItem(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-12 text-center animate-pulse">Loading wishlist...</div>
      ) : !wishlist || wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Save items you want to buy later so you can plan your budget accordingly.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Add an item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => (
            <div key={item.id} className={`bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col ${item.status === 'purchased' ? 'opacity-60' : ''}`}>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                    {item.priority} Priority
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 -mt-2 -mr-2"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="text-xl font-semibold mb-1 truncate">{item.name}</h3>
                <p className="text-2xl font-display font-medium text-primary mb-4">
                  {formatCurrency(item.priceMinorUnits, defaultCurrency)}
                </p>

                {item.status === 'purchased' && (
                  <div className="flex items-center text-positive text-sm font-medium mb-4">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Purchased
                  </div>
                )}
                
                {item.storeUrl && (
                  <a 
                    href={item.storeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-accent hover:underline mb-2"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View in Store
                  </a>
                )}
              </div>

              {item.status !== 'purchased' && item.status !== 'cancelled' && (
                <div className="p-4 bg-surface-sunken border-t border-border mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => markAsPurchased(item)}
                  >
                    Mark as Purchased
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
