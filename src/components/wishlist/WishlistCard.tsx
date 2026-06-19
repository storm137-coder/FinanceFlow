import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { WishlistItem } from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineShoppingBag, HiOutlineLink } from 'react-icons/hi2';

interface WishlistCardProps {
  item: WishlistItem;
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
}

export function WishlistCard({ item, onEdit, onDelete }: WishlistCardProps) {
  let statusColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (item.status === 'purchased') statusColor = 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
  else if (item.status === 'saving') statusColor = 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
  else if (item.status === 'cancelled') statusColor = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';

  let priorityColor = 'text-slate-500';
  if (item.priority === 'high') priorityColor = 'text-red-500';
  else if (item.priority === 'medium') priorityColor = 'text-yellow-500';

  return (
    <Card className="flex flex-col gap-0 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="h-40 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <HiOutlineShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        )}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-900/90 rounded-lg p-1 backdrop-blur-sm">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(item)}>
            <HiOutlinePencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => onDelete(item.id)}>
            <HiOutlineTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 leading-tight line-clamp-1">
              {item.name}
            </h3>
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", statusColor)}>
              {item.status}
            </span>
          </div>
          <p className="font-bold text-lg text-slate-900 dark:text-white mt-1">
            {formatCurrency(item.price)}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium capitalize", priorityColor)}>
              {item.priority} Priority
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {item.expectedDate ? formatDate(item.expectedDate) : 'No date'}
            </span>
          </div>
          
          {item.storeUrl && (
            <a href={item.storeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 p-1 bg-blue-50 dark:bg-blue-500/10 rounded-md transition-colors">
              <HiOutlineLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
