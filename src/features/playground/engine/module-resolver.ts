import type { PlaygroundFile } from '../types';

export const ALLOWED_EXTERNAL_MODULES = new Set([
  'react',
  'react-dom',
  'react-dom/client',
  'lucide-react',
  '@playground/ui',
]);

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const INDEX_FILES = ['/index.tsx', '/index.ts', '/index.jsx', '/index.js'];

export interface ResolvedModule {
  type: 'virtual' | 'external' | 'error';
  path: string;
  error?: string;
}

export function normalizeVirtualPath(baseDir: string, relativePath: string): string {
  // If relativePath already starts with virtual root '/'
  const combined = relativePath.startsWith('/')
    ? relativePath
    : `${baseDir ? `/${baseDir.replace(/^\/|\/$/g, '')}` : ''}/${relativePath}`;

  const segments = combined.split('/');
  const stack: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (stack.length > 0) {
        stack.pop();
      } else {
        // Attempting to traverse above virtual root
        throw new Error(
          `Path traversal violation: '${relativePath}' escapes the virtual root.`
        );
      }
    } else {
      stack.push(segment);
    }
  }

  return `/${stack.join('/')}`;
}

export function cleanVirtualPath(path: string): string {
  if (path.startsWith('/')) return path;
  return `/${path}`;
}

export function getDirname(filePath: string): string {
  const normalized = cleanVirtualPath(filePath);
  const lastSlashIndex = normalized.lastIndexOf('/');
  if (lastSlashIndex <= 0) return '';
  return normalized.substring(0, lastSlashIndex);
}

export function resolveVirtualModule(
  importer: string,
  specifier: string,
  files: Record<string, PlaygroundFile | string>
): ResolvedModule {
  // 1. External packages (e.g. 'react', 'lucide-react', '@playground/ui')
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
    const basePkg = specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0];

    if (
      ALLOWED_EXTERNAL_MODULES.has(basePkg) ||
      ALLOWED_EXTERNAL_MODULES.has(specifier)
    ) {
      return {
        type: 'external',
        path: specifier,
      };
    }

    return {
      type: 'error',
      path: specifier,
      error: `Module '${specifier}' is not available. Allowed modules: ${Array.from(ALLOWED_EXTERNAL_MODULES).join(', ')}.`,
    };
  }

  // 2. Normalize relative path
  let normalizedPath: string;
  try {
    const importerDir = getDirname(importer);
    normalizedPath = normalizeVirtualPath(importerDir, specifier);
  } catch (err) {
    return {
      type: 'error',
      path: specifier,
      error: err instanceof Error ? err.message : 'Invalid import path',
    };
  }

  // Helper to check file existence with or without leading slash
  const fileExists = (p: string): boolean => {
    const withSlash = cleanVirtualPath(p);
    const withoutSlash = p.replace(/^\//, '');
    return Boolean(files[withSlash] || files[withoutSlash]);
  };

  // Direct match
  if (fileExists(normalizedPath)) {
    return { type: 'virtual', path: normalizedPath };
  }

  // Extension inference: .tsx, .ts, .jsx, .js
  for (const ext of EXTENSIONS) {
    const candidate = `${normalizedPath}${ext}`;
    if (fileExists(candidate)) {
      return { type: 'virtual', path: candidate };
    }
  }

  // Directory index inference: /index.tsx, /index.ts, /index.jsx, /index.js
  for (const indexFile of INDEX_FILES) {
    const candidate = `${normalizedPath}${indexFile}`;
    if (fileExists(candidate)) {
      return { type: 'virtual', path: candidate };
    }
  }

  return {
    type: 'error',
    path: specifier,
    error: `Cannot find module '${specifier}' imported from '${importer}'.`,
  };
}
