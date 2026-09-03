import fs from 'node:fs';
import { DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE } from '../src/features/playground/engines/webcontainer/next-starter-template.ts';

console.log('=== Next.js 16 Curriculum / WebContainer Runtime Verification ===\n');

const rootPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const sandboxNextVersion = '15.4.1';

// 1. Validate Standard Next.js App Router Template Structure
const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'app/layout.tsx',
  'app/page.tsx',
  'app/client-demo.tsx',
  'app/globals.css',
  'app/api/health/route.ts',
];
console.log('1. Checking required Standard Next.js App Router files:');

let allPresent = true;
for (const file of requiredFiles) {
  const parts = file.split('/');
  let node = DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE;
  let found = true;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i === parts.length - 1) {
      if (!node[p] || !node[p].file) {
        found = false;
        break;
      }
    } else {
      if (!node[p] || !node[p].directory) {
        found = false;
        break;
      }
      node = node[p].directory;
    }
  }

  if (found) {
    console.log(`  ✓ ${file}`);
  } else {
    console.error(`  ✗ Missing template file: ${file}`);
    allPresent = false;
  }
}

if (!allPresent) {
  console.error('\n❌ Template validation failed!');
  process.exit(1);
}

// 2. Validate package.json scripts and dependencies
console.log('\n2. Validating package.json standard Next.js CLI scripts:');
const pkgJson = JSON.parse(DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE['package.json'].file.contents);
const appDirectory = DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE.app.directory;
if (
  pkgJson.scripts?.dev === 'next dev' &&
  pkgJson.scripts?.build === 'next build' &&
  pkgJson.scripts?.start === 'next start' &&
  pkgJson.dependencies?.next === sandboxNextVersion &&
  pkgJson.dependencies?.react === '19.2.8' &&
  pkgJson.devDependencies?.typescript &&
  pkgJson.devDependencies?.['@types/node'] &&
  pkgJson.devDependencies?.['@types/react'] &&
  pkgJson.devDependencies?.['@types/react-dom'] &&
  rootPackageJson.dependencies?.next === '^16.3.3'
) {
  console.log('  ✓ package.json uses the Next.js 15.4 Webpack-default CLI script: "dev": "next dev"');
  console.log(`  ✓ sandbox pins Next.js ${sandboxNextVersion} with React 19.2.8`);
  console.log('  ✓ TypeScript toolchain is preinstalled; Next.js auto-install is not required');
  console.log('  ✓ host application remains on Next.js ^16.3.3');
} else {
  console.error('  ✗ host/sandbox runtime contract or package scripts are invalid');
  process.exit(1);
}

const nextPlaygroundCode = fs.readFileSync(
  './src/features/playground/components/next-playground.tsx',
  'utf-8'
);
if (
  !nextPlaygroundCode.includes("next: '15.4.1'") ||
  !nextPlaygroundCode.includes("dev: 'next dev'") ||
  nextPlaygroundCode.includes("dev: 'next dev --webpack'") ||
  !nextPlaygroundCode.includes('Next 15.4 Runtime + React 19')
) {
  console.error('  ✗ Next playground starter or runtime disclosure drifted from the compatibility contract');
  process.exit(1);
}
console.log('  ✓ playground starter and UI disclose the Next.js 15.4 compatibility runtime');

if (
  appDirectory['page.tsx'].file.contents.includes("'use client'") ||
  !appDirectory['page.tsx'].file.contents.includes("from './client-demo'") ||
  !appDirectory['client-demo.tsx'].file.contents.includes("'use client'")
) {
  console.error('  ✗ Client interactivity must be isolated from the App Router page boundary');
  process.exit(1);
}
console.log('  ✓ App Router page remains a Server Component and delegates interactivity to client-demo.tsx');

// 3. Confirm absence of mock server.mjs
console.log('\n3. Architectural Check (No Mock server.mjs):');
if (DEFAULT_NEXTJS_APP_ROUTER_TEMPLATE['server.mjs']) {
  console.error('  ✗ Mock server.mjs found in template! Must use standard next dev.');
  process.exit(1);
} else {
  console.log('  ✓ No fake server.mjs found in Next.js App Router template.');
}

// 4. Validate Single-Instance React 19.2.8 in runner-entry.tsx
console.log('\n4. Validating Single-Instance React 19 in React Playground Runner:');
const runnerPath = './src/features/playground/engines/react-lite/runner/runner-entry.tsx';
const runnerCode = fs.readFileSync(runnerPath, 'utf-8');

if (runnerCode.includes('react@18') || runnerCode.includes('react-dom@18')) {
  console.error('  ✗ React 18 fallback found in runner-entry.tsx! This causes React error #31.');
  process.exit(1);
} else {
  console.log('  ✓ Zero React 18 / ReactDOM 18 scripts in runner-entry.tsx.');
}

if (
  runnerCode.includes('https://esm.sh/react@19.2.8') &&
  runnerCode.includes('https://esm.sh/react-dom@19.2.8') &&
  runnerCode.includes('window.__REACT_RUNTIME_READY__')
) {
  console.log('  ✓ Single-instance React 19.2.8 & ReactDOM 19.2.8 loader enforced.');
  console.log('  ✓ Runtime readiness guarded by window.__REACT_RUNTIME_READY__ boolean flag.');
} else {
  console.error('  ✗ Missing unified React 19.2.8 loader or readiness flag.');
  process.exit(1);
}

console.log(
  '\n✅ Next.js 16 curriculum, Next.js 15.4.1 WebContainer runtime, and React 19.2.8 validations passed!'
);
