import type { IExecutionEngine, EngineStatus, EngineCapabilities } from '../types';
import type { PlaygroundFile, CompilationResult } from '../../types';
import { WebContainerManager } from './webcontainer-manager';
import { checkWebContainerSupport } from './webcontainer-guard';
import { DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE } from './next-starter-template';
import type { WebContainerProcess } from '@webcontainer/api';
import type { FileSystemTree } from '@webcontainer/api';

function buildWorkspaceTree(
  files?: Record<string, PlaygroundFile | string>
): FileSystemTree {
  const tree = structuredClone(DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE);
  if (!files) return tree;

  for (const [rawPath, value] of Object.entries(files)) {
    const parts = rawPath.replace(/^\//, '').split('/').filter(Boolean);
    let directory = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        directory[part] = {
          file: {
            contents: typeof value === 'string' ? value : value.content,
          },
        };
        return;
      }
      const existing = directory[part];
      if (!existing || !('directory' in existing)) {
        directory[part] = { directory: {} };
      }
      const next = directory[part];
      if ('directory' in next) directory = next.directory;
    });
  }

  return tree;
}

export class WebContainerEngine implements IExecutionEngine {
  readonly id = 'webcontainer' as const;
  readonly name = 'Next.js App Router (Wasm Node.js)';
  readonly capabilities: EngineCapabilities = {
    supportsServerActions: true,
    supportsTerminal: true,
    supportsHotReload: true,
    supportsCustomPackages: true,
    estimatedMemoryMb: 450,
  };

  status: EngineStatus = 'idle';
  private statusListeners: Set<(status: EngineStatus) => void> = new Set();
  private devProcess: WebContainerProcess | null = null;
  private serverUrl: string | null = null;
  private onServerReadyCallback?: (url: string, port: number) => void;
  private unsubscribers: Array<() => void> = [];
  private bootPromise: Promise<void> | null = null;

  async boot(config?: {
    files?: Record<string, PlaygroundFile | string>;
    onServerReady?: (url: string, port: number) => void;
  }): Promise<void> {
    if (this.bootPromise) return this.bootPromise;

    const promise = this.bootInternal(config).finally(() => {
      if (this.bootPromise === promise) this.bootPromise = null;
    });
    this.bootPromise = promise;
    return promise;
  }

  private async bootInternal(config?: {
    files?: Record<string, PlaygroundFile | string>;
    onServerReady?: (url: string, port: number) => void;
  }): Promise<void> {
    const guard = checkWebContainerSupport();
    if (!guard.supported) {
      this.setStatus('error');
      throw new Error(guard.message);
    }

    if (config?.onServerReady) {
      this.onServerReadyCallback = config.onServerReady;
    }

    this.setStatus('booting');

    try {
      const wc = await WebContainerManager.getInstance();
      this.unsubscribers.forEach((unsubscribe) => unsubscribe());
      this.unsubscribers = [];

      const serverReady = new Promise<void>((resolve, reject) => {
        this.unsubscribers.push(
          wc.on('server-ready', (port, url) => {
            this.serverUrl = url;
            this.setStatus('ready');
            this.onServerReadyCallback?.(url, port);
            resolve();
          }),
          wc.on('error', (error) => reject(new Error(error.message)))
        );
      });

      const workspace = buildWorkspaceTree(config?.files);
      await WebContainerManager.reconcileTree(workspace);

      this.setStatus('booting');
      const installProcess = await WebContainerManager.spawnCommand('npm', [
        'install',
        '--no-audit',
        '--no-fund',
      ]);
      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installExitCode}.`);
      }

      if (this.devProcess) this.devProcess.kill();
      this.setStatus('starting');
      this.devProcess = await WebContainerManager.spawnCommand('npm', [
        'run',
        'dev',
        '--',
        '--hostname',
        '0.0.0.0',
        '--port',
        '3000',
      ]);
      const currentProcess = this.devProcess;
      void currentProcess.exit.then((exitCode) => {
        if (this.devProcess !== currentProcess) return;
        this.devProcess = null;
        if (this.status !== 'disposed') this.setStatus('error');
        console.error(`Next.js dev server exited with code ${exitCode}.`);
      });

      await Promise.race([
        serverReady,
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error('Next.js server-ready timeout after 90 seconds.')),
            90_000
          );
        }),
      ]);
    } catch (err) {
      this.setStatus('error');
      if (this.devProcess) {
        this.devProcess.kill();
        this.devProcess = null;
      }
      throw err;
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    await WebContainerManager.writeFile(path, content);
  }

  async deleteFile(path: string): Promise<void> {
    await WebContainerManager.rm(path);
  }

  async executeCommand(
    command: string
  ): Promise<{ stdout: string; stderr?: string; exitCode: number }> {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    let output = '';
    const proc = await WebContainerManager.spawnCommand(cmd, args, {
      outputStream: new WritableStream({
        write(chunk) {
          output += chunk;
        },
      }),
    });

    const exitCode = await proc.exit;
    return {
      stdout: output,
      exitCode,
    };
  }

  async compileAndRun(
    _files: Record<string, PlaygroundFile | string>,
    _entryPath?: string
  ): Promise<CompilationResult> {
    // In WebContainers, Next.js dev server runs continuously via HMR.
    return {
      runId: `${Date.now()}`,
      success: this.status === 'ready',
      modules: {},
      errors: [],
      durationMs: 0,
    };
  }

  onStatusChange(listener: (status: EngineStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async dispose(): Promise<void> {
    if (this.devProcess) {
      this.devProcess.kill();
      this.devProcess = null;
    }
    this.serverUrl = null;
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.setStatus('disposed');
    this.statusListeners.clear();
  }

  public getServerUrl(): string | null {
    return this.serverUrl;
  }

  private setStatus(newStatus: EngineStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }
}

export const createWebContainerEngine = (): WebContainerEngine => {
  return new WebContainerEngine();
};
