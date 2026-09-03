'use client';

import * as React from 'react';
import type {
  FileSystemTree,
  WebContainer,
  WebContainerProcess,
} from '@webcontainer/api';
import { WebContainerManager } from '../webcontainer-manager';
import { checkWebContainerSupport } from '../webcontainer-guard';
import { DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE } from '../next-starter-template';
import type { WebContainerStatus, WebContainerGuardResult } from '../types';

const INSTALL_TIMEOUT_MS = 180_000;
const SERVER_READY_TIMEOUT_MS = 90_000;

export interface UseWebContainerOptions {
  autoBoot?: boolean;
  initialTemplate?: FileSystemTree;
  onServerReady?: (port: number, url: string) => void;
  onTerminalOutput?: (data: string) => void;
}

function getFileContents(tree: FileSystemTree, path: string): string | null {
  const parts = path.replace(/^\//, '').split('/');
  let current: FileSystemTree = tree;

  for (let index = 0; index < parts.length; index += 1) {
    const node = current[parts[index]];
    if (!node) return null;
    if (index === parts.length - 1) {
      return 'file' in node &&
        'contents' in node.file &&
        typeof node.file.contents === 'string'
        ? node.file.contents
        : null;
    }
    if (!('directory' in node)) return null;
    current = node.directory;
  }

  return null;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (reason) => {
        clearTimeout(timer);
        reject(reason);
      }
    );
  });
}

export function useWebContainer(options: UseWebContainerOptions = {}) {
  const {
    autoBoot = false,
    initialTemplate = DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE,
    onServerReady,
    onTerminalOutput,
  } = options;

  const [status, setStatus] = React.useState<WebContainerStatus>('idle');
  const [serverUrl, setServerUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [guard, setGuard] = React.useState<WebContainerGuardResult>(() => ({
    supported: false,
  }));

  const devProcessRef = React.useRef<WebContainerProcess | null>(null);
  const operationRef = React.useRef<Promise<void> | null>(null);
  const installedManifestRef = React.useRef<string | null>(null);
  const mountedRef = React.useRef(true);
  const expectedProcessExitRef = React.useRef(new WeakSet<WebContainerProcess>());
  const unsubscribeRef = React.useRef<Array<() => void>>([]);
  const readyRef = React.useRef<{
    resolve: (value: { port: number; url: string }) => void;
    reject: (reason: unknown) => void;
  } | null>(null);
  const onTerminalOutputRef = React.useRef(onTerminalOutput);
  const onServerReadyRef = React.useRef(onServerReady);

  React.useEffect(() => {
    onTerminalOutputRef.current = onTerminalOutput;
  }, [onTerminalOutput]);

  React.useEffect(() => {
    onServerReadyRef.current = onServerReady;
  }, [onServerReady]);

  const updateStatus = React.useCallback((nextStatus: WebContainerStatus) => {
    if (mountedRef.current) setStatus(nextStatus);
  }, []);

  const reportError = React.useCallback((reason: unknown, prefix = 'WebContainer') => {
    const message = reason instanceof Error ? reason.message : String(reason);
    if (mountedRef.current) {
      setStatus('error');
      setError(message);
    }
    onTerminalOutputRef.current?.(`\x1b[31m[${prefix}]: ${message}\x1b[0m\r\n`);
  }, []);

  const attachContainerListeners = React.useCallback(
    (wc: WebContainer) => {
      if (unsubscribeRef.current.length > 0) return;

      unsubscribeRef.current = [
        wc.on('server-ready', (port, url) => {
          const pending = readyRef.current;
          if (!pending) return;
          readyRef.current = null;
          pending.resolve({ port, url });
        }),
        wc.on('error', (containerError) => {
          const runtimeError = new Error(`WebContainer error: ${containerError.message}`);
          readyRef.current?.reject(runtimeError);
          readyRef.current = null;
          reportError(runtimeError);
        }),
      ];
    },
    [reportError]
  );

  const pipeOutput = React.useCallback((process: WebContainerProcess) => {
    process.output
      .pipeTo(
        new WritableStream({
          write(data) {
            onTerminalOutputRef.current?.(data);
          },
        })
      )
      .catch(() => {});
  }, []);

  const stopDevServer = React.useCallback(async () => {
    const process = devProcessRef.current;
    if (!process) return;

    devProcessRef.current = null;
    expectedProcessExitRef.current.add(process);
    try {
      process.kill();
      await withTimeout(process.exit, 2_000, 'Timeout khi dừng dev server.');
    } catch {
      // A killed process may reject while its port is being released.
    }
  }, []);

  const installDependencies = React.useCallback(
    async (tree: FileSystemTree) => {
      const manifest = getFileContents(tree, '/package.json');
      if (!manifest) {
        throw new Error('Workspace thiếu package.json nên không thể cài dependencies.');
      }
      if (installedManifestRef.current === manifest) return;

      updateStatus('installing');
      onTerminalOutputRef.current?.(
        '\x1b[38;2;56;189;248m[3/4] Đang cài dependencies (npm install)...\x1b[0m\r\n'
      );
      const installProcess = await WebContainerManager.spawnCommand('npm', [
        'install',
        '--no-audit',
        '--no-fund',
      ]);
      pipeOutput(installProcess);
      let exitCode: number;
      try {
        exitCode = await withTimeout(
          installProcess.exit,
          INSTALL_TIMEOUT_MS,
          'npm install quá thời gian 3 phút.'
        );
      } catch (reason) {
        installProcess.kill();
        throw reason;
      }
      if (exitCode !== 0) {
        throw new Error(`npm install thất bại với exit code ${exitCode}.`);
      }
      installedManifestRef.current = manifest;
    },
    [pipeOutput, updateStatus]
  );

  const startDevServer = React.useCallback(async () => {
    updateStatus('starting');
    if (mountedRef.current) setServerUrl(null);
    onTerminalOutputRef.current?.(
      '\x1b[38;2;250;204;21m[4/4] Đang chạy npm run dev...\x1b[0m\r\n'
    );

    const readyPromise = new Promise<{ port: number; url: string }>((resolve, reject) => {
      readyRef.current = { resolve, reject };
    });
    const process = await WebContainerManager.spawnCommand('npm', [
      'run',
      'dev',
      '--',
      '--hostname',
      '0.0.0.0',
      '--port',
      '3000',
    ]);
    devProcessRef.current = process;
    pipeOutput(process);

    void process.exit.then((exitCode) => {
      const expected = expectedProcessExitRef.current.has(process);
      if (expected || devProcessRef.current !== process) return;

      devProcessRef.current = null;
      const processError = new Error(
        `Next.js dev server đã dừng với exit code ${exitCode}.`
      );
      readyRef.current?.reject(processError);
      readyRef.current = null;
      reportError(processError, 'Dev Server Stopped');
    });

    const ready = await withTimeout(
      readyPromise,
      SERVER_READY_TIMEOUT_MS,
      'Next.js dev server không phát tín hiệu server-ready trong 90 giây.'
    );
    if (!mountedRef.current || devProcessRef.current !== process) return;

    setServerUrl(ready.url);
    setError(null);
    setStatus('ready');
    onTerminalOutputRef.current?.(
      `\r\n\x1b[38;2;74;222;128m▲ [Next.js 15.4 Compatibility Runtime Ready] Port ${ready.port}: ${ready.url}\x1b[0m\r\n`
    );
    onServerReadyRef.current?.(ready.port, ready.url);
  }, [pipeOutput, reportError, updateStatus]);

  const runExclusive = React.useCallback((operation: () => Promise<void>) => {
    if (operationRef.current) return operationRef.current;

    const promise = operation().finally(() => {
      if (operationRef.current === promise) operationRef.current = null;
    });
    operationRef.current = promise;
    return promise;
  }, []);

  const boot = React.useCallback(
    (files: FileSystemTree = initialTemplate) =>
      runExclusive(async () => {
        const support = checkWebContainerSupport();
        if (mountedRef.current) setGuard(support);
        if (!support.supported) {
          updateStatus('unsupported');
          if (mountedRef.current) {
            setError(support.message || 'Trình duyệt chưa bật Cross-Origin Isolation.');
          }
          return;
        }

        try {
          if (mountedRef.current) setError(null);
          updateStatus('booting');
          onTerminalOutputRef.current?.(
            '\x1b[38;2;99;102;241m[1/4] Đang khởi động Node.js WebContainer...\x1b[0m\r\n'
          );
          const wc = await WebContainerManager.getInstance();
          attachContainerListeners(wc);

          updateStatus('mounting');
          onTerminalOutputRef.current?.(
            '\x1b[38;2;56;189;248m[2/4] Đang đồng bộ workspace hiện tại...\x1b[0m\r\n'
          );
          await WebContainerManager.reconcileTree(files);
          await installDependencies(files);
          await stopDevServer();
          await startDevServer();
        } catch (reason) {
          readyRef.current = null;
          await stopDevServer();
          reportError(reason, 'Boot Failed');
          throw reason;
        }
      }),
    [
      attachContainerListeners,
      initialTemplate,
      installDependencies,
      reportError,
      runExclusive,
      startDevServer,
      stopDevServer,
      updateStatus,
    ]
  );

  const restartDevServer = React.useCallback(
    (files: FileSystemTree = initialTemplate) =>
      runExclusive(async () => {
        try {
          if (mountedRef.current) setError(null);
          updateStatus('mounting');
          onTerminalOutputRef.current?.(
            '\r\n\x1b[38;2;56;189;248m[*] Đang đồng bộ workspace và khởi động lại Next.js...\x1b[0m\r\n'
          );
          const wc = await WebContainerManager.getInstance();
          attachContainerListeners(wc);
          await WebContainerManager.reconcileTree(files);
          await installDependencies(files);
          await stopDevServer();
          await startDevServer();
        } catch (reason) {
          readyRef.current = null;
          await stopDevServer();
          reportError(reason, 'Restart Failed');
          throw reason;
        }
      }),
    [
      attachContainerListeners,
      initialTemplate,
      installDependencies,
      reportError,
      runExclusive,
      startDevServer,
      stopDevServer,
      updateStatus,
    ]
  );

  const writeFile = React.useCallback(
    async (path: string, content: string) => {
      try {
        await WebContainerManager.writeFile(path, content);
      } catch (reason) {
        reportError(reason, 'Write Failed');
        throw reason;
      }
    },
    [reportError]
  );

  const removeFile = React.useCallback(
    async (path: string) => {
      try {
        await WebContainerManager.rm(path);
      } catch (reason) {
        reportError(reason, 'Delete Failed');
        throw reason;
      }
    },
    [reportError]
  );

  const runCommand = React.useCallback(
    async (cmd: string, args: string[] = []) => {
      onTerminalOutputRef.current?.(`\r\n$ ${cmd} ${args.join(' ')}\r\n`);
      const process = await WebContainerManager.spawnCommand(cmd, args);
      pipeOutput(process);
      return process;
    },
    [pipeOutput]
  );

  React.useEffect(() => {
    mountedRef.current = true;
    const expectedProcessExits = expectedProcessExitRef.current;
    const support = checkWebContainerSupport();
    setGuard(support);
    if (!support.supported) {
      setStatus('unsupported');
      setError(support.message || 'Môi trường không hỗ trợ WebContainers.');
    }

    return () => {
      mountedRef.current = false;
      readyRef.current?.reject(new Error('WebContainer component đã unmount.'));
      readyRef.current = null;
      unsubscribeRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribeRef.current = [];
      const process = devProcessRef.current;
      if (process) {
        expectedProcessExits.add(process);
        process.kill();
        devProcessRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (autoBoot && guard.supported && status === 'idle') {
      void boot();
    }
  }, [autoBoot, boot, guard.supported, status]);

  return {
    status,
    serverUrl,
    error,
    guard,
    boot,
    restartDevServer,
    writeFile,
    removeFile,
    runCommand,
  };
}
