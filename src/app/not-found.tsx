import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card glass className="w-full max-w-md text-center">
        <CardHeader>
          <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Compass className="animate-spin-slow h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for might have been removed, had its name changed, or
            is temporarily unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="default" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Overview
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
