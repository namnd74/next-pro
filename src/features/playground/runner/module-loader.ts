'use client';

import { RUNNER_EXTERNAL_MODULES } from './external-modules';

export interface ModuleInstance {
  exports: Record<string, unknown> | unknown;
}

export function unwrapDefaultExport(moduleExports: unknown): unknown {
  if (moduleExports && typeof moduleExports === 'object') {
    const exp = moduleExports as Record<string, unknown>;
    if ('default' in exp) {
      return exp.default;
    }
  }
  return moduleExports;
}

export class VirtualModuleLoader {
  private compiledModules: Record<string, string> = {};
  private moduleCache = new Map<string, ModuleInstance>();

  public reset(compiledModules: Record<string, string>): void {
    this.compiledModules = compiledModules;
    this.moduleCache.clear();
  }

  public requireModule(specifier: string, currentFile = '/App.tsx'): unknown {
    // 1. Check external packages
    if (RUNNER_EXTERNAL_MODULES[specifier]) {
      return RUNNER_EXTERNAL_MODULES[specifier];
    }

    // Lucide icon subpath fallback (e.g. require('lucide-react/dist/esm/icons/plus'))
    if (specifier.startsWith('lucide-react')) {
      return RUNNER_EXTERNAL_MODULES['lucide-react'];
    }

    // 2. Normalize path
    const resolvedPath = this.resolvePath(specifier, currentFile);

    // 3. Cache lookup (handles circular dependencies)
    const cached = this.moduleCache.get(resolvedPath);
    if (cached) {
      return cached.exports;
    }

    // 4. Find compiled source code
    const rawCode =
      this.compiledModules[resolvedPath] ??
      this.compiledModules[resolvedPath.replace(/^\//, '')];

    if (!rawCode) {
      throw new Error(`Cannot find module '${specifier}' imported from '${currentFile}'`);
    }

    // 5. Execute module with isolated scope
    const virtualModule: ModuleInstance = { exports: {} };
    this.moduleCache.set(resolvedPath, virtualModule);

    const customRequire = (nextSpecifier: string) =>
      this.requireModule(nextSpecifier, resolvedPath);

    try {
      const runnerFn = new Function('require', 'module', 'exports', rawCode);

      runnerFn(customRequire, virtualModule, virtualModule.exports);
    } catch (err) {
      // Invalidate failed module from cache so re-execution can retry
      this.moduleCache.delete(resolvedPath);
      throw err;
    }

    return virtualModule.exports;
  }

  private resolvePath(specifier: string, currentFile: string): string {
    if (specifier.startsWith('/')) {
      return specifier;
    }

    if (!specifier.startsWith('.')) {
      return `/${specifier}`;
    }

    const currentDir = currentFile.substring(0, currentFile.lastIndexOf('/'));
    const combined = `${currentDir}/${specifier}`;
    const segments = combined.split('/');
    const stack: string[] = [];

    for (const segment of segments) {
      if (!segment || segment === '.') continue;
      if (segment === '..') {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(segment);
      }
    }

    const normalized = `/${stack.join('/')}`;

    // Test with extensions if direct match not in compiledModules
    const hasFile = (p: string) =>
      Boolean(this.compiledModules[p] || this.compiledModules[p.replace(/^\//, '')]);

    if (hasFile(normalized)) return normalized;

    const extensions = [
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '/index.tsx',
      '/index.ts',
      '/index.jsx',
      '/index.js',
    ];
    for (const ext of extensions) {
      const candidate = `${normalized}${ext}`;
      if (hasFile(candidate)) return candidate;
    }

    return normalized;
  }
}
