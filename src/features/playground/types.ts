export interface PlaygroundFile {
  path: string;
  content: string;
  readOnly?: boolean;
}

export interface PlaygroundProject {
  files: Record<string, PlaygroundFile>;
  activePath: string;
  entryPath: string;
}

export type SerializedValue =
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'null' }
  | { type: 'undefined' }
  | { type: 'bigint'; value: string }
  | { type: 'symbol'; value: string }
  | { type: 'function'; name?: string }
  | { type: 'error'; message: string; stack?: string }
  | { type: 'array'; value: SerializedValue[] }
  | { type: 'object'; value: Record<string, SerializedValue> };

export interface ConsoleMessage {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error';
  args: SerializedValue[];
  timestamp: number;
}

export type RunnerStatus =
  'idle' | 'compiling' | 'starting' | 'ready' | 'error' | 'timeout';

export interface CompiledModule {
  path: string;
  code: string;
  error?: string;
}

export interface CompilationResult {
  runId: string;
  success: boolean;
  modules: Record<string, string>;
  errors: { path: string; message: string; line?: number; column?: number }[];
  durationMs: number;
}

export interface PlaygroundLayoutConfig {
  orientation: 'horizontal' | 'vertical';
  viewport: 'desktop' | 'tablet' | 'mobile';
  showConsole: boolean;
  showSidebar: boolean;
  showPreview?: boolean;
  isFullscreen: boolean;
}
