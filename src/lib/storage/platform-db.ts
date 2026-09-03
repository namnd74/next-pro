import type { PlaygroundFile } from '@/features/playground/types';

export interface PlatformProjectRecord {
  id: string; // "${platform}:${scopeId}"
  platform: string; // 'react-lite' | 'nextjs' | 'cyber' | 'node' | string
  scopeId: string; // e.g. lessonId, missionId, etc.
  title?: string;
  templateVersion?: number;
  // Delta Patch Storage Model
  modifiedFiles: Record<string, string>; // Only modified files: path -> content
  addedFiles: Record<string, PlaygroundFile>; // User-created files
  deletedFiles: string[]; // Deleted template file paths
  isCustomized: boolean;
  activePath?: string;
  updatedAt: number;
  createdAt: number;
}

export interface PlatformHistorySnapshot {
  id: string;
  projectId: string;
  platform: string;
  scopeId: string;
  timestamp: number;
  name?: string;
  files: Record<string, PlaygroundFile>;
  summary?: string;
}

export type FileChangeStatus = 'clean' | 'modified' | 'added' | 'readOnly';

const DB_NAME = 'nextpro_platform_storage';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in the browser'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Projects Delta Store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('platform', 'platform', { unique: false });
        projectStore.createIndex('scopeId', 'scopeId', { unique: false });
        projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 2. History Snapshots Store
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('projectId', 'projectId', { unique: false });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 3. Global Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

export function formatProjectId(platform: string, scopeId: string): string {
  return `${platform}:${scopeId}`;
}

/**
 * Merge Base Template with User Delta Patch at runtime.
 */
export function resolveEffectiveFiles(
  baseTemplate: Record<string, PlaygroundFile>,
  delta: PlatformProjectRecord | null
): Record<string, PlaygroundFile> {
  if (!delta || !delta.isCustomized) {
    return { ...baseTemplate };
  }

  const effective: Record<string, PlaygroundFile> = {};

  // 1. Copy base template (excluding files deleted by user)
  for (const [path, file] of Object.entries(baseTemplate)) {
    if (!delta.deletedFiles.includes(path)) {
      effective[path] = { ...file };
    }
  }

  // 2. Overlay modified files (with backward compatibility mapping)
  for (const [rawPath, modifiedContent] of Object.entries(delta.modifiedFiles)) {
    let path = rawPath;
    if (path === '/App.tsx' && effective['/src/App.tsx']) {
      path = '/src/App.tsx';
    } else if (path === '/styles.css' && effective['/src/index.css']) {
      path = '/src/index.css';
    }
    if (effective[path]) {
      effective[path] = { ...effective[path], content: modifiedContent };
    } else {
      effective[path] = { path, content: modifiedContent };
    }
  }

  // 3. Add user-created files
  for (const [rawPath, newFile] of Object.entries(delta.addedFiles)) {
    let path = rawPath;
    if (path === '/App.tsx' && effective['/src/App.tsx']) {
      path = '/src/App.tsx';
    }
    effective[path] = { ...newFile, path };
  }

  return effective;
}

/**
 * Compare current working files against Base Template to compute Delta.
 */
export function computeDelta(
  baseTemplate: Record<string, PlaygroundFile>,
  currentFiles: Record<string, PlaygroundFile>
): {
  modifiedFiles: Record<string, string>;
  addedFiles: Record<string, PlaygroundFile>;
  deletedFiles: string[];
  isCustomized: boolean;
  statusMap: Record<string, FileChangeStatus>;
} {
  const modifiedFiles: Record<string, string> = {};
  const addedFiles: Record<string, PlaygroundFile> = {};
  const deletedFiles: string[] = [];
  const statusMap: Record<string, FileChangeStatus> = {};

  // Check base template files
  for (const [path, baseFile] of Object.entries(baseTemplate)) {
    const current = currentFiles[path];
    if (!current) {
      deletedFiles.push(path);
    } else if (current.content !== baseFile.content) {
      modifiedFiles[path] = current.content;
      statusMap[path] = 'modified';
    } else {
      statusMap[path] = baseFile.readOnly ? 'readOnly' : 'clean';
    }
  }

  // Check added files
  for (const [path, currentFile] of Object.entries(currentFiles)) {
    if (!baseTemplate[path]) {
      addedFiles[path] = currentFile;
      statusMap[path] = 'added';
    }
  }

  const isCustomized =
    Object.keys(modifiedFiles).length > 0 ||
    Object.keys(addedFiles).length > 0 ||
    deletedFiles.length > 0;

  return {
    modifiedFiles,
    addedFiles,
    deletedFiles,
    isCustomized,
    statusMap,
  };
}

export async function getPlatformProject(
  platform: string,
  scopeId: string
): Promise<PlatformProjectRecord | null> {
  try {
    const db = await getDB();
    const id = formatProjectId(platform, scopeId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[PlatformDB] Failed to load project:', err);
    return null;
  }
}

export async function savePlatformDelta(
  platform: string,
  scopeId: string,
  baseTemplate: Record<string, PlaygroundFile>,
  currentFiles: Record<string, PlaygroundFile>,
  activePath?: string
): Promise<PlatformProjectRecord | null> {
  const db = await getDB();
  const id = formatProjectId(platform, scopeId);
  const { modifiedFiles, addedFiles, deletedFiles, isCustomized } = computeDelta(
    baseTemplate,
    currentFiles
  );

  // If not customized (clean / reverted back to 100% original template), prune from DB!
  if (!isCustomized) {
    await deletePlatformProject(platform, scopeId);
    return null;
  }

  const now = Date.now();
  const record: PlatformProjectRecord = {
    id,
    platform,
    scopeId,
    modifiedFiles,
    addedFiles,
    deletedFiles,
    isCustomized: true,
    activePath,
    updatedAt: now,
    createdAt: now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    const request = store.put(record);

    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePlatformProject(
  platform: string,
  scopeId: string
): Promise<void> {
  const db = await getDB();
  const id = formatProjectId(platform, scopeId);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPlatformHistory(
  platform: string,
  scopeId: string,
  limit = 20
): Promise<PlatformHistorySnapshot[]> {
  try {
    const db = await getDB();
    const projectId = formatProjectId(platform, scopeId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => {
        const results = (request.result as PlatformHistorySnapshot[]) || [];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results.slice(0, limit));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[PlatformDB] Failed to get history:', err);
    return [];
  }
}

export async function savePlatformSnapshot(
  platform: string,
  scopeId: string,
  files: Record<string, PlaygroundFile>,
  name?: string,
  summary?: string
): Promise<PlatformHistorySnapshot> {
  const db = await getDB();
  const projectId = formatProjectId(platform, scopeId);
  const now = Date.now();
  const id = `${projectId}_${now}_${Math.random().toString(36).slice(2, 7)}`;

  const snapshot: PlatformHistorySnapshot = {
    id,
    projectId,
    platform,
    scopeId,
    timestamp: now,
    name: name || `Snapshot ${new Date(now).toLocaleTimeString()}`,
    files,
    summary,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    const request = store.put(snapshot);

    request.onsuccess = () => resolve(snapshot);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPlatformHistory(
  platform: string,
  scopeId: string
): Promise<void> {
  const db = await getDB();
  const projectId = formatProjectId(platform, scopeId);

  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    const index = store.index('projectId');
    const request = index.openCursor(IDBKeyRange.only(projectId));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}
