'use client';

import { Button } from '@/components/ui/button';
import { Inter, Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6 bg-background text-foreground">
          <div className="space-y-2">
            <h2 className="text-display font-display">Fatal Error</h2>
            <p className="text-body text-muted-foreground max-w-md mx-auto">
              A critical error occurred that prevented the application from loading.
            </p>
          </div>
          <Button onClick={() => reset()} variant="default">
            Reload Application
          </Button>
        </div>
      </body>
    </html>
  );
}

