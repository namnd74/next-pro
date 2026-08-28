import type { PlaygroundFile, CompilationResult } from '../types';

export type EngineKind = 'react-lite' | 'webcontainer' | 'wasm-linux' | 'mock-arena';

export type EngineStatus =
  | 'idle'
  | 'booting'
  | 'compiling'
  | 'starting'
  | 'ready'
  | 'error'
  | 'timeout'
  | 'disposed';

export interface EngineCapabilities {
  supportsServerActions: boolean;
  supportsTerminal: boolean;
  supportsHotReload: boolean;
  supportsCustomPackages: boolean;
  estimatedMemoryMb: number;
}

export interface IExecutionEngine {
  readonly id: EngineKind;
  readonly name: string;
  readonly capabilities: EngineCapabilities;
  status: EngineStatus;

  /** Boot or initialize runtime resources */
  boot(config?: Record<string, unknown>): Promise<void>;

  /** Write or update a file in the virtual filesystem / runtime */
  writeFile(path: string, content: string): Promise<void>;

  /** Optional file removal */
  deleteFile?(path: string): Promise<void>;

  /** Run / compile virtual project */
  compileAndRun?(
    files: Record<string, PlaygroundFile | string>,
    entryPath?: string
  ): Promise<CompilationResult>;

  /** Execute terminal CLI command if supported */
  executeCommand?(
    command: string
  ): Promise<{ stdout: string; stderr?: string; exitCode: number }>;

  /** Subscribe to status updates */
  onStatusChange?(listener: (status: EngineStatus) => void): () => void;

  /** Clean up resources and free memory */
  dispose(): Promise<void>;
}
