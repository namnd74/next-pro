import {
  WebContainer,
  type FileSystemTree,
  type WebContainerProcess,
} from '@webcontainer/api';
import { checkWebContainerSupport } from './webcontainer-guard';

interface PendingWrite {
  content: string;
  timer: ReturnType<typeof setTimeout>;
  waiters: Array<{
    resolve: () => void;
    reject: (reason: unknown) => void;
  }>;
}

export class WebContainerManager {
  private static instance: WebContainer | null = null;
  private static bootPromise: Promise<WebContainer> | null = null;
  private static writeQueue = new Map<string, PendingWrite>();
  private static mountedSourcePaths = new Set<string>();

  /**
   * Returns the singleton WebContainer instance, booting it if not already running.
   */
  public static async getInstance(): Promise<WebContainer> {
    const guard = checkWebContainerSupport();
    if (!guard.supported) {
      throw new Error(
        guard.message || 'WebContainer is not supported in this browser environment.'
      );
    }

    if (this.instance) {
      return this.instance;
    }

    if (!this.bootPromise) {
      this.bootPromise = WebContainer.boot()
        .then((wc) => {
          this.instance = wc;
          return wc;
        })
        .catch((err) => {
          this.bootPromise = null;
          throw err;
        });
    }

    return this.bootPromise;
  }

  /**
   * Mounts a FileSystemTree into the virtual filesystem
   */
  public static async mountTree(files: FileSystemTree): Promise<void> {
    const wc = await this.getInstance();
    await wc.mount(files);
    this.mountedSourcePaths = this.collectFilePaths(files);
  }

  /**
   * Reconciles source files without touching installed dependencies or Next.js build output.
   */
  public static async reconcileTree(files: FileSystemTree): Promise<void> {
    const wc = await this.getInstance();
    const nextPaths = this.collectFilePaths(files);
    const stalePaths = [...this.mountedSourcePaths].filter(
      (path) => !nextPaths.has(path)
    );

    await Promise.all(
      stalePaths.map(async (path) => {
        this.cancelPendingWrite(path);
        await wc.fs.rm(path, { recursive: true, force: true });
      })
    );

    await wc.mount(files);
    this.mountedSourcePaths = nextPaths;
  }

  /**
   * Writes a file to the WebContainer virtual file system with debouncing to trigger Next.js HMR.
   */
  public static async writeFile(
    path: string,
    content: string,
    debounceMs = 200
  ): Promise<void> {
    const wc = await this.getInstance();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return new Promise((resolve, reject) => {
      const existing = this.writeQueue.get(normalizedPath);
      if (existing) {
        clearTimeout(existing.timer);
      }

      const timer = setTimeout(async () => {
        const pending = this.writeQueue.get(normalizedPath);
        if (!pending) return;

        try {
          // Ensure parent directory exists
          const lastSlash = normalizedPath.lastIndexOf('/');
          if (lastSlash > 0) {
            const dir = normalizedPath.substring(0, lastSlash);
            await wc.fs.mkdir(dir, { recursive: true });
          }

          await wc.fs.writeFile(normalizedPath, pending.content, 'utf-8');
          this.mountedSourcePaths.add(normalizedPath);
          this.writeQueue.delete(normalizedPath);
          pending.waiters.forEach((waiter) => waiter.resolve());
        } catch (err) {
          this.writeQueue.delete(normalizedPath);
          pending.waiters.forEach((waiter) => waiter.reject(err));
        }
      }, debounceMs);

      this.writeQueue.set(normalizedPath, {
        content,
        timer,
        waiters: [...(existing?.waiters ?? []), { resolve, reject }],
      });
    });
  }

  /**
   * Removes a file or directory from the virtual filesystem
   */
  public static async rm(path: string): Promise<void> {
    const wc = await this.getInstance();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    this.cancelPendingWrite(normalizedPath);
    await wc.fs.rm(normalizedPath, { recursive: true, force: true });
    this.mountedSourcePaths.delete(normalizedPath);
  }

  /**
   * Spawns an interactive shell or CLI command in WebContainer
   */
  public static async spawnCommand(
    command: string,
    args: string[] = [],
    options?: {
      outputStream?: WritableStream<string>;
      terminal?: { cols: number; rows: number };
    }
  ): Promise<WebContainerProcess> {
    const wc = await this.getInstance();
    const proc = await wc.spawn(command, args, {
      terminal: options?.terminal,
    });

    if (options?.outputStream) {
      proc.output.pipeTo(options.outputStream).catch(() => {});
    }

    return proc;
  }

  /**
   * Teardown WebContainer instance if needed
   */
  public static async teardown(): Promise<void> {
    for (const path of this.writeQueue.keys()) {
      this.cancelPendingWrite(path);
    }

    if (this.instance) {
      try {
        await this.instance.teardown();
      } catch {
        // Ignore teardown errors
      }
      this.instance = null;
      this.bootPromise = null;
      this.mountedSourcePaths.clear();
    }
  }

  private static cancelPendingWrite(path: string): void {
    const pending = this.writeQueue.get(path);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.writeQueue.delete(path);
    pending.waiters.forEach((waiter) => waiter.resolve());
  }

  private static collectFilePaths(tree: FileSystemTree, parent = ''): Set<string> {
    const result = new Set<string>();

    for (const [name, node] of Object.entries(tree)) {
      const path = `${parent}/${name}`;
      if ('file' in node) {
        result.add(path);
      } else if ('directory' in node) {
        for (const child of this.collectFilePaths(node.directory, path)) {
          result.add(child);
        }
      }
    }

    return result;
  }
}
