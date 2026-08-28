import * as React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PlaygroundErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Playground Host Error]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-6 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-80" />
          <h3 className="mb-1 text-sm font-bold">
            {this.props.fallbackTitle || 'Playground Error'}
          </h3>
          <p className="mx-auto mb-4 max-w-md font-mono text-xs opacity-90">
            {this.state.error?.message ||
              'An unexpected error occurred in the playground host.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            className="gap-2 text-xs"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
