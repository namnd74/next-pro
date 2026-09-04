'use client';

import * as React from 'react';
import { WebContainerManager } from '@/features/playground/engines/webcontainer/webcontainer-manager';

export default function WebContainerProbePage() {
  const [result, setResult] = React.useState<{
    state: 'idle' | 'booting' | 'success' | 'error';
    exitCode?: number;
    output?: string;
    reason?: string;
    crossOriginIsolated?: boolean;
    hasSharedArrayBuffer?: boolean;
    nodeVersion?: string;
  }>({ state: 'idle' });

  const hasExecutedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function execute() {
      const crossOriginIsolated =
        typeof window !== 'undefined' && !!window.crossOriginIsolated;
      const hasSharedArrayBuffer =
        typeof window !== 'undefined' && typeof window.SharedArrayBuffer !== 'undefined';

      if (!crossOriginIsolated || !hasSharedArrayBuffer) {
        setResult({
          state: 'error',
          reason:
            'Isolation headers missing: crossOriginIsolated or SharedArrayBuffer false',
          crossOriginIsolated,
          hasSharedArrayBuffer,
        });
        return;
      }

      setResult({ state: 'booting', crossOriginIsolated, hasSharedArrayBuffer });

      try {
        const wc = await WebContainerManager.getInstance();

        // Write probe script into root virtual filesystem
        await wc.fs.writeFile(
          'probe.js',
          'console.log("AUTHENTIC_WEBCONTAINER_EXECUTION"); process.exit(0);'
        );

        // Spawn node to execute the script
        const proc = await wc.spawn('node', ['probe.js']);

        let output = '';
        proc.output.pipeTo(
          new WritableStream({
            write(data) {
              output += data;
            },
          })
        );

        const exitCode = await proc.exit;

        // Also probe node version
        let versionOutput = '';
        const vProc = await wc.spawn('node', ['--version']);
        vProc.output.pipeTo(
          new WritableStream({
            write(data) {
              versionOutput += data;
            },
          })
        );
        await vProc.exit;

        setResult({
          state: 'success',
          exitCode,
          output: output.trim(),
          nodeVersion: versionOutput.trim(),
          crossOriginIsolated,
          hasSharedArrayBuffer,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setResult({
          state: 'error',
          reason: message,
          crossOriginIsolated,
          hasSharedArrayBuffer,
        });
      }
    }

    execute();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">WebContainer Isolation & Execution Probe</h1>
      <div
        id="probe-result"
        data-testid="probe-result"
        data-state={result.state}
        data-json={JSON.stringify(result)}
        className="mt-4 rounded border p-4 font-mono text-sm"
      >
        Status: {result.state}
        {result.output && <div>Output: {result.output}</div>}
        {result.nodeVersion && <div>Node: {result.nodeVersion}</div>}
        {result.reason && <div className="text-red-500">Reason: {result.reason}</div>}
      </div>
    </main>
  );
}
