'use client';

import * as React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card glass className="w-full max-w-md border-destructive/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Something went wrong!</CardTitle>
          <CardDescription>
            {error.message || 'An unexpected runtime error occurred.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button variant="default" onClick={() => reset()} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
