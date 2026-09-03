import fs from 'node:fs';
import { transform } from 'sucrase';

const RUNNER_PATH =
  './src/features/playground/engines/react-lite/runner/runner-entry.tsx';
const SHARED_COMPONENT_PATHS = [
  './src/features/playground/components/file-explorer.tsx',
  './src/features/playground/components/file-tabs.tsx',
  './src/features/playground/components/playground-toolbar.tsx',
];
const RUNNER_BRIDGE_PATH = './src/features/playground/hooks/use-runner-bridge.ts';
const PLAYGROUND_HOOK_PATH = './src/features/playground/hooks/use-playground.ts';

function check(condition, successMessage, failureMessage) {
  if (!condition) {
    throw new Error(failureMessage);
  }
  console.log(`  ✓ ${successMessage}`);
}

async function loadGeneratedSrcDoc() {
  const source = fs.readFileSync(RUNNER_PATH, 'utf8');
  const transformed = transform(source, { transforms: ['typescript'] }).code.replace(
    "import { PLAYGROUND_PROTOCOL } from './protocol';",
    "const PLAYGROUND_PROTOCOL = 'nextpro-playground-v1';"
  );
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`;
  const { generateIframeSrcDoc } = await import(moduleUrl);
  return { source, html: generateIframeSrcDoc('validation-session') };
}

function validateGeneratedScripts(html) {
  const scripts = Array.from(
    html.matchAll(/<script(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/script>/gi)
  );
  const inlineScripts = scripts.filter(
    ({ groups }) => !/\bsrc\s*=/.test(groups?.attrs ?? '')
  );

  check(
    inlineScripts.length > 0,
    'generated srcdoc contains inline runtime scripts',
    'Generated srcdoc has no inline runtime scripts.'
  );

  for (const [index, script] of inlineScripts.entries()) {
    const attrs = script.groups?.attrs ?? '';
    const body = script.groups?.body ?? '';
    try {
      if (/\btype\s*=\s*["']module["']/.test(attrs)) {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        new AsyncFunction(body);
      } else {
        new Function(body);
      }
    } catch (error) {
      throw new Error(
        `Generated inline script ${index + 1} is invalid JavaScript: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  console.log(
    `  ✓ ${inlineScripts.length} generated inline script(s) parse as valid JavaScript`
  );
}

function validateSingleReactRuntime(source, html) {
  check(
    !source.includes('react@18') && !source.includes('react-dom@18'),
    'React 18 fallback is absent',
    'React 18 fallback can create incompatible React elements and roots.'
  );
  check(
    html.includes('react@19.2.8') && html.includes('react-dom@19.2.8/client'),
    'React and ReactDOM use the repository React 19.2.8 version',
    'Generated srcdoc must load React and ReactDOM 19.2.8 from one runtime.'
  );
  check(
    html.includes('window.__REACT_RUNTIME_READY__ = true'),
    'runtime readiness is explicit',
    'Generated srcdoc does not expose an explicit runtime-ready state.'
  );
  check(
    html.includes("window.dispatchEvent(new Event('react-runtime-ready'))") &&
      html.includes('attempts < 1000'),
    'cold CDN loads can recover within the extended bootstrap window',
    'React runtime bootstrap must recover from slow CDN module loading.'
  );
}

function validateRunnerRecoveryContract() {
  const bridgeSource = fs.readFileSync(RUNNER_BRIDGE_PATH, 'utf8');
  const playgroundSource = fs.readFileSync(PLAYGROUND_HOOK_PATH, 'utf8');

  check(
    bridgeSource.includes('currentRunIdRef.current = \'\'') &&
      bridgeSource.includes('setRuntimeError(null)'),
    'iframe reboot clears stale run and error state',
    'Runner reboot must clear the active run id and stale runtime error.'
  );
  check(
    playgroundSource.includes('const retryRunner = React.useCallback') &&
      playgroundSource.includes('hasInitialRunRef.current = false') &&
      playgroundSource.includes('lastExecutedFilesRef.current = null'),
    'runner retry schedules the current project for execution again',
    'Runner retry must reset initial-run and executed-files guards.'
  );
}

function validateSharedAccessibilityContracts() {
  const source = SHARED_COMPONENT_PATHS.map((path) => fs.readFileSync(path, 'utf8')).join(
    '\n'
  );
  check(
    !/<div[^>]*\bonClick=/.test(source),
    'shared file controls do not use clickable divs',
    'Shared playground controls must use native interactive elements instead of clickable divs.'
  );
  check(
    source.includes('role="tablist"') && source.includes('role="tab"'),
    'file tabs expose tab semantics',
    'File tabs must expose tablist/tab semantics.'
  );
  check(
    source.includes('aria-live="polite"') && source.includes('role="status"'),
    'runner and save states are announced',
    'Dynamic runner/save states need polite live-region semantics.'
  );
  check(
    source.includes('min-h-11') && source.includes('min-w-11'),
    'shared icon controls include 44px touch targets',
    'Shared icon controls need 44px touch targets.'
  );
}

console.log('=== Playground Runtime Release Gate ===\n');

const { source, html } = await loadGeneratedSrcDoc();
console.log('1. React generated-srcdoc contract:');
validateGeneratedScripts(html);
validateSingleReactRuntime(source, html);
validateRunnerRecoveryContract();

console.log('\n2. Shared playground accessibility contract:');
validateSharedAccessibilityContracts();

console.log('\n✅ Playground runtime release gate passed.');
