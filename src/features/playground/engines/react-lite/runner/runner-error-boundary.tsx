import * as React from 'react';

interface RunnerErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface RunnerErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RunnerErrorBoundary extends React.Component<
  RunnerErrorBoundaryProps,
  RunnerErrorBoundaryState
> {
  public override state: RunnerErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): RunnerErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  public override render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            padding: '16px',
            margin: '16px',
            borderRadius: '8px',
            backgroundColor: '#450a0a',
            border: '1px solid #dc2626',
            color: '#fecaca',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: '#f87171',
            }}
          >
            <span>⚠️ React Runtime Error</span>
          </div>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: '12px',
            }}
          >
            {this.state.error.message}
          </div>
          {this.state.error.stack && (
            <details style={{ marginTop: '8px', fontSize: '11px', color: '#fca5a5' }}>
              <summary style={{ cursor: 'pointer', opacity: 0.8 }}>Stack Trace</summary>
              <pre
                style={{
                  overflowX: 'auto',
                  marginTop: '6px',
                  whiteSpace: 'pre-wrap',
                  opacity: 0.7,
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
