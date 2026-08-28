import { transform } from 'sucrase';
import type { PlaygroundFile, CompilationResult } from '../../types';
import { cleanVirtualPath } from './module-resolver';

// File-level compile cache
const compileCache = new Map<string, { source: string; code: string }>();

export function clearCompileCache(): void {
  compileCache.clear();
}

export function compileSingleFile(
  path: string,
  source: string
): { code: string; error?: string } {
  const normalizedPath = cleanVirtualPath(path);
  const cached = compileCache.get(normalizedPath);

  if (cached && cached.source === source) {
    return { code: cached.code };
  }

  // 1. Handle CSS files: compile into dynamic <style> injection JS module
  if (normalizedPath.endsWith('.css')) {
    const escapedCss = JSON.stringify(source);
    const styleId = `style-${normalizedPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const jsCode = `(function() {
  var styleId = ${JSON.stringify(styleId)};
  var el = document.getElementById(styleId);
  if (!el) {
    el = document.createElement('style');
    el.id = styleId;
    el.setAttribute('data-virtual-css', ${JSON.stringify(normalizedPath)});
    document.head.appendChild(el);
  }
  el.textContent = ${escapedCss};
})();
module.exports = {};`;

    compileCache.set(normalizedPath, { source, code: jsCode });
    return { code: jsCode };
  }

  // 2. Handle JS/TS/JSX/TSX with Sucrase
  try {
    const result = transform(source, {
      transforms: ['jsx', 'typescript', 'imports'],
      production: true,
      jsxRuntime: 'classic',
      filePath: normalizedPath,
    });

    compileCache.set(normalizedPath, {
      source,
      code: result.code,
    });

    return { code: result.code };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      code: '',
      error: `[Compile Error in ${path}]: ${errorMessage}`,
    };
  }
}

export function compileVirtualProject(
  files: Record<string, PlaygroundFile | string>,
  _entryPath = '/App.tsx',
  runId = `${Date.now()}`
): CompilationResult {
  const startTime = performance.now();
  const compiledModules: Record<string, string> = {};
  const errors: CompilationResult['errors'] = [];

  for (const [rawPath, file] of Object.entries(files)) {
    const path = cleanVirtualPath(rawPath);
    const content = typeof file === 'string' ? file : file.content;

    const { code, error } = compileSingleFile(path, content);

    if (error) {
      errors.push({
        path,
        message: error,
      });
    } else {
      compiledModules[path] = code;
      // Also register without leading slash for flexible require matching
      const withoutSlash = path.replace(/^\//, '');
      if (withoutSlash !== path) {
        compiledModules[withoutSlash] = code;
      }
    }
  }

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    runId,
    success: errors.length === 0,
    modules: compiledModules,
    errors,
    durationMs,
  };
}

// Worker message handling if instantiated as Web Worker
if (
  typeof self !== 'undefined' &&
  typeof window === 'undefined' &&
  'postMessage' in self
) {
  self.addEventListener('message', (event: MessageEvent) => {
    const { files, entryPath, runId } = event.data || {};
    if (files) {
      const result = compileVirtualProject(files, entryPath, runId);
      self.postMessage(result);
    }
  });
}
