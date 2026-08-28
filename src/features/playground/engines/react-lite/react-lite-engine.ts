import type { IExecutionEngine, EngineStatus, EngineCapabilities } from '../types';
import type { PlaygroundFile, CompilationResult } from '../../types';
import { compileVirtualProject, clearCompileCache } from './compiler.worker';

export class ReactLiteEngine implements IExecutionEngine {
  readonly id = 'react-lite' as const;
  readonly name = 'React Lite (Sucrase)';
  readonly capabilities: EngineCapabilities = {
    supportsServerActions: false,
    supportsTerminal: false,
    supportsHotReload: true,
    supportsCustomPackages: false,
    estimatedMemoryMb: 25,
  };

  status: EngineStatus = 'idle';
  private statusListeners: Set<(status: EngineStatus) => void> = new Set();

  async boot(_config?: Record<string, unknown>): Promise<void> {
    this.setStatus('starting');
    clearCompileCache();
    this.setStatus('ready');
  }

  async writeFile(_path: string, _content: string): Promise<void> {
    // ReactLite is in-memory on demand compilation
  }

  async compileAndRun(
    files: Record<string, PlaygroundFile | string>,
    entryPath = '/App.tsx'
  ): Promise<CompilationResult> {
    this.setStatus('compiling');
    try {
      const result = compileVirtualProject(files, entryPath);
      this.setStatus(result.success ? 'ready' : 'error');
      return result;
    } catch (err) {
      this.setStatus('error');
      return {
        runId: `${Date.now()}`,
        success: false,
        modules: {},
        errors: [
          {
            path: entryPath,
            message: err instanceof Error ? err.message : String(err),
          },
        ],
        durationMs: 0,
      };
    }
  }

  onStatusChange(listener: (status: EngineStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async dispose(): Promise<void> {
    clearCompileCache();
    this.setStatus('disposed');
    this.statusListeners.clear();
  }

  private setStatus(newStatus: EngineStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }
}

export const createReactLiteEngine = (): ReactLiteEngine => {
  return new ReactLiteEngine();
};
