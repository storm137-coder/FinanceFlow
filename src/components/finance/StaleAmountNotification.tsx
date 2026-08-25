'use client';

import React, { useEffect, useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useInvestments } from '@/hooks/useInvestments';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';
import { Account, Investment } from '@/types';

export function StaleAmountNotification() {
  const { data: accounts } = useAccounts();
  const { data: investments } = useInvestments();
  const [isVisible, setIsVisible] = useState(false);
  const [staleItemsCount, setStaleItemsCount] = useState(0);

  useEffect(() => {
    const dismissedAt = localStorage.getItem('financeflow_stale_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = differenceInDays(new Date(), new Date(dismissedAt));
      if (daysSinceDismissed < 7) {
        return; // Don't show again for 7 days
      }
    }

    let staleCount = 0;
    const now = new Date();
    const checkStale = (item: Account | Investment) => {
      if (!item.updatedAt) return;
      
      // Check if it's a Firestore Timestamp or string
      const updatedAt = item.updatedAt as unknown as { toDate?: () => Date };
      const date = typeof updatedAt.toDate === 'function' 
        ? updatedAt.toDate() 
        : new Date(item.updatedAt as string);
      
      if (differenceInDays(now, date) > 30) {
        staleCount++;
      }
    };

    if (accounts) accounts.forEach(checkStale);
    if (investments) investments.forEach(checkStale);

    if (staleCount > 0) {
      setStaleItemsCount(staleCount);
      setIsVisible(true);
    }
  }, [accounts, investments]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    localStorage.setItem('financeflow_stale_dismissed', new Date().toISOString());
    setIsVisible(false);
  };

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start sm:items-center gap-3 text-warning-foreground">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0 text-warning" />
        <div>
          <h4 className="font-medium text-sm">Update Reminder</h4>
          <p className="text-sm opacity-90">
            You have {staleItemsCount} item{staleItemsCount > 1 ? 's' : ''} (accounts or investments) that haven't been updated in over 30 days. Please update their amounts to keep your tracking accurate.
          </p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={handleDismiss} className="shrink-0 text-warning hover:text-warning hover:bg-warning/20">
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
