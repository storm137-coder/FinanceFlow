'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/currency';
import { useAuth } from '@/contexts/AuthContext';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results } = useSearch();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (query.trim()) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [query]);

  const handleSelect = (item: any, type: string) => {
    setOpen(false);
    setQuery('');
    
    // Navigate based on item type
    switch (type) {
      case 'transactions':
        router.push('/transactions');
        break;
      case 'goals':
        router.push('/goals');
        break;
      case 'bills':
        router.push('/bills');
        break;
      case 'investments':
        router.push('/investments');
        break;
      case 'loans':
        router.push('/loans');
        break;
    }
  };

  const hasResults = Object.values(results).some((arr: any) => arr.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything..." 
            className="pl-9 bg-surface-sunken border-transparent focus-visible:ring-1"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        {!hasResults ? (
          <div className="p-4 text-center text-ink-muted text-sm">
            No results found for "{query}"
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            {Object.entries(results).map(([category, items]: [string, any]) => {
              if (items.length === 0) return null;
              
              return (
                <div key={category} className="p-2">
                  <h4 className="px-2 py-1 text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {items.slice(0, 5).map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item, category)}
                        className="w-full text-left px-2 py-2 text-sm rounded hover:bg-surface-sunken flex justify-between items-center group"
                      >
                        <span className="truncate pr-4 text-foreground font-medium group-hover:text-primary transition-colors">
                          {item.name || item.merchant || item.source || item.category}
                        </span>
                        {(() => {
                          const displayAmount = item.amount !== undefined 
                            ? item.amount 
                            : ((item.amountMinorUnits ?? item.currentValueMinorUnits ?? item.targetMinorUnits) !== undefined 
                                ? (item.amountMinorUnits ?? item.currentValueMinorUnits ?? item.targetMinorUnits) / 100 
                                : undefined);
                                
                          if (displayAmount !== undefined) {
                            return (
                              <span className="text-ink-muted shrink-0 text-xs font-mono">
                                {formatCurrency(displayAmount, user?.currency)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
