'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
      <div className="p-4 bg-negative/10 text-negative rounded-full">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-h2 font-display text-foreground">Something went wrong</h2>
        <p className="text-body text-muted-foreground max-w-md mx-auto">
          We encountered an unexpected error while trying to load this page. 
          {error.message && <span className="block mt-2 text-sm bg-surface-sunken p-2 rounded text-ink">{error.message}</span>}
        </p>
      </div>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}

