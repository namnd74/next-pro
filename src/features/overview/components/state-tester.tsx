'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  RotateCw,
  CheckCircle2,
  Database,
  Server,
  Layers,
  Sparkles,
  LogOut,
  LogIn,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { OVERVIEW_QUERY_KEY } from '../hooks/use-overview-metrics';

export function StateTester() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const [userNameInput, setUserNameInput] = React.useState(user?.name || '');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefetch = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: OVERVIEW_QUERY_KEY });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (userNameInput.trim()) {
      updateUser({ name: userNameInput.trim() });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Zustand Global State Card */}
      <Card glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
                <Database className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Zustand State Store</CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-[11px]">
              localStorage Persist
            </Badge>
          </div>
          <CardDescription>
            Live client state synchronization across components and tab reloads.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border-border/50 bg-secondary/60 space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Auth Session:</span>
              <Badge variant={isAuthenticated ? 'success' : 'secondary'}>
                {isAuthenticated ? 'Authenticated' : 'Logged Out'}
              </Badge>
            </div>

            {isAuthenticated && user && (
              <div className="border-border/40 space-y-1 border-t pt-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User:</span>
                  <span className="text-foreground font-semibold">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
              </div>
            )}

            <div className="border-border/40 flex items-center justify-between border-t pt-2 text-xs">
              <span className="text-muted-foreground">UI Store (Sidebar):</span>
              <span className="text-primary font-mono font-medium">
                {sidebarOpen ? 'Open' : 'Collapsed'}
              </span>
            </div>
          </div>

          {/* Interactive controls */}
          <form onSubmit={handleUpdateName} className="flex gap-2">
            <Input
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="Update user name..."
              className="h-9 text-xs"
              disabled={!isAuthenticated}
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="text-xs whitespace-nowrap"
              disabled={!isAuthenticated}
            >
              Update
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={logout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() =>
                  login(
                    {
                      id: 'usr_demo_01',
                      name: 'Alex Rivera',
                      email: 'alex.rivera@example.com',
                      role: 'admin',
                    },
                    'demo-token'
                  )
                }
              >
                <LogIn className="h-3.5 w-3.5" />
                Simulate Login
              </Button>
            )}

            <Button
              variant="glass"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={toggleSidebar}
            >
              <Layers className="h-3.5 w-3.5" />
              Toggle Sidebar State
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TanStack React Query + Axios Integration Card */}
      <Card glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                <Server className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">TanStack Query + Axios</CardTitle>
            </div>
            <Badge variant="success" className="text-[11px]">
              Query Cached
            </Badge>
          </div>
          <CardDescription>
            Optimized server state fetching, automatic garbage collection & retry policy.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border-border/50 bg-secondary/60 space-y-2.5 rounded-xl border p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Query Key:</span>
              <span className="text-foreground font-mono font-semibold">
                {`['overview', 'metrics']`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cache Policy:</span>
              <span className="text-foreground">staleTime: 30s | gcTime: 5m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">HTTP Interceptor:</span>
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active (Auto-Bearer)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="default"
              size="sm"
              className="w-full gap-2 text-xs"
              isLoading={isRefreshing}
              onClick={handleRefetch}
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Trigger Invalidate & Refetch
            </Button>
          </div>

          <div className="text-muted-foreground flex items-center justify-between px-1 text-[11px]">
            <span>Devtools embedded at bottom right</span>
            <span className="text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              React 19 Ready
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
