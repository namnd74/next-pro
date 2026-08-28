import * as React from 'react';
import type { ConsoleMessage, RunnerStatus } from '../types';
import {
  PLAYGROUND_PROTOCOL,
  type HostToRunnerMessage,
  type RunnerToHostMessage,
} from '../runner/protocol';

export interface UseRunnerBridgeOptions {
  onStatusChange?: (status: RunnerStatus) => void;
  watchdogTimeoutMs?: number;
}

export function useRunnerBridge(options: UseRunnerBridgeOptions = {}) {
  const { watchdogTimeoutMs = 5000 } = options;

  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const [sessionId] = React.useState<string>(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
  const [iframeKey, setIframeKey] = React.useState<number>(0);
  const [runnerStatus, setRunnerStatus] = React.useState<RunnerStatus>('idle');
  const [isIframeReady, setIsIframeReady] = React.useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = React.useState<ConsoleMessage[]>([]);
  const [runtimeError, setRuntimeError] = React.useState<string | null>(null);

  const currentRunIdRef = React.useRef<string>('');
  const watchdogTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const onStatusChangeRef = React.useRef(options.onStatusChange);
  React.useEffect(() => {
    onStatusChangeRef.current = options.onStatusChange;
  }, [options.onStatusChange]);

  const updateStatus = React.useCallback((nextStatus: RunnerStatus) => {
    setRunnerStatus(nextStatus);
    onStatusChangeRef.current?.(nextStatus);
  }, []);

  const clearWatchdog = React.useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const clearLogs = React.useCallback(() => {
    setConsoleLogs([]);
  }, []);

  const rebootIframe = React.useCallback(() => {
    clearWatchdog();
    setIsIframeReady(false);
    setIframeKey((k) => k + 1);
    updateStatus('idle');
  }, [clearWatchdog, updateStatus]);

  // Execute project inside iframe
  const execute = React.useCallback(
    (entryPath: string, modules: Record<string, string>) => {
      if (!iframeRef.current?.contentWindow) {
        return;
      }

      const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      currentRunIdRef.current = runId;
      setRuntimeError(null);
      updateStatus('starting');

      const message: HostToRunnerMessage = {
        protocol: PLAYGROUND_PROTOCOL,
        sessionId,
        runId,
        type: 'EXECUTE',
        entryPath,
        modules,
      };

      // Arm Health Watchdog
      clearWatchdog();
      watchdogTimerRef.current = setTimeout(() => {
        if (currentRunIdRef.current === runId) {
          updateStatus('timeout');
          setRuntimeError(
            'Runner health timeout: Execution did not complete within 5000ms.'
          );
        }
      }, watchdogTimeoutMs);

      iframeRef.current.contentWindow.postMessage(message, '*');
    },
    [sessionId, watchdogTimeoutMs, clearWatchdog, updateStatus]
  );

  // Message listener from iframe
  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as RunnerToHostMessage;

      // 1. Validate protocol & session nonce
      if (!data || typeof data !== 'object') return;
      if (data.protocol !== PLAYGROUND_PROTOCOL) return;
      if (data.sessionId !== sessionId) return;

      switch (data.type) {
        case 'READY': {
          setIsIframeReady(true);
          updateStatus('ready');
          break;
        }
        case 'RUN_START': {
          if (data.runId === currentRunIdRef.current) {
            updateStatus('starting');
          }
          break;
        }
        case 'RENDER_SUCCESS': {
          if (data.runId === currentRunIdRef.current) {
            clearWatchdog();
            updateStatus('ready');
            setRuntimeError(null);
          }
          break;
        }
        case 'CONSOLE': {
          setConsoleLogs((prev) => [...prev, data.payload]);
          break;
        }
        case 'ERROR': {
          if (data.runId === currentRunIdRef.current) {
            clearWatchdog();
            updateStatus('error');
            setRuntimeError(data.payload.message);
          }
          break;
        }
        default:
          break;
      }
    }

    window.addEventListener('message', handleMessage);

    // Active PING interval until iframe is acknowledged
    const pingInterval = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { protocol: PLAYGROUND_PROTOCOL, sessionId, type: 'PING' },
          '*'
        );
      }
    }, 300);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pingInterval);
      clearWatchdog();
    };
  }, [sessionId, clearWatchdog, updateStatus]);

  return {
    iframeRef,
    iframeKey,
    sessionId,
    runnerStatus,
    isIframeReady,
    consoleLogs,
    runtimeError,
    execute,
    clearLogs,
    rebootIframe,
  };
}
