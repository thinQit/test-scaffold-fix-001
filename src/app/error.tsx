'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">Please try again or return later.</p>
      <Button onClick={reset} variant="primary">Try again</Button>
    </div>
  );
}

export default Error;
