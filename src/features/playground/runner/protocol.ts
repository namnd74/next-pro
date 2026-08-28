import type { ConsoleMessage } from '../types';

export const PLAYGROUND_PROTOCOL = 'nextpro-playground-v1' as const;

export type HostToRunnerMessage =
  | {
      protocol: typeof PLAYGROUND_PROTOCOL;
      sessionId: string;
      runId: string;
      type: 'EXECUTE';
      entryPath: string;
      modules: Record<string, string>;
    }
  | {
      protocol: typeof PLAYGROUND_PROTOCOL;
      sessionId: string;
      runId: string;
      type: 'RESET';
    };

export type RunnerToHostMessage =
  | {
      protocol: typeof PLAYGROUND_PROTOCOL;
      sessionId: string;
      type: 'READY';
    }
  | {
      protocol: typeof PLAYGROUND_PROTOCOL;
      sessionId: string;
      runId: string;
      type: 'RUN_START';
    }
  | {
      protocol: typeof PLAYGROUND_PROTOCOL;
      sessionId: string;
      runId: string;
      type: 'RENDER_SUCCESS';
    }
  | {
      protocol: typeof PLAYGROUND_PROTOCOL;
      sessionId: string;
      runId: string;
      type: 'CONSOLE';
      payload: ConsoleMessage;
    }
  | {
      protocol: typeof PLAYGROUND_PROTOCOL;
      sessionId: string;
      runId: string;
      type: 'ERROR';
      payload: {
        category:
          | 'CompilationError'
          | 'ModuleResolutionError'
          | 'ModuleExecutionError'
          | 'ReactRenderError'
          | 'AsyncRuntimeError';
        message: string;
        stack?: string;
        file?: string;
        line?: number;
      };
    };

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
