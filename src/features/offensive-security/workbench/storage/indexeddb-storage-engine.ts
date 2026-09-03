import type { RuntimeSnapshot } from '../core/types';

const DB_NAME = 'NextProCyberRangeDB';
const DB_VERSION = 1;
const SNAPSHOT_STORE = 'labSnapshots';
export const CURRENT_SCHEMA_VERSION = 1;

interface StoredSnapshotRecord {
  lessonId: string;
  schemaVersion: number;
  lessonVersion: string;
  updatedAt: number;
  snapshot: RuntimeSnapshot;
}

/**
 * High-performance, asynchronous IndexedDB storage engine.
 * Falls back safely to an in-memory Map during SSR or headless test runner execution.
 */
class IndexedDbStorageEngine {
  private memoryFallback: Map<string, StoredSnapshotRecord> = new Map();
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private isBrowserIndexedDbAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.indexedDB !== 'undefined' &&
      window.indexedDB !== null
    );
  }

  private async getDb(): Promise<IDBDatabase | null> {
    if (!this.isBrowserIndexedDbAvailable()) {
      return null;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
            db.createObjectStore(SNAPSHOT_STORE, { keyPath: 'lessonId' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (err) => {
          console.warn(
            '[IndexedDbStorageEngine] Failed to open database, using fallback:',
            err
          );
          resolve(null);
        };
      } catch (err) {
        console.warn('[IndexedDbStorageEngine] Exception opening IndexedDB:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  async saveSnapshot(
    lessonId: string,
    snapshot: RuntimeSnapshot,
    lessonVersion: string = '1.0'
  ): Promise<void> {
    const record: StoredSnapshotRecord = {
      lessonId,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lessonVersion,
      updatedAt: Date.now(),
      snapshot,
    };

    const db = await this.getDb();
    if (!db) {
      this.memoryFallback.set(lessonId, record);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction([SNAPSHOT_STORE], 'readwrite');
        const store = tx.objectStore(SNAPSHOT_STORE);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch {
        this.memoryFallback.set(lessonId, record);
        resolve();
      }
    });
  }

  async loadSnapshot(
    lessonId: string,
    expectedLessonVersion?: string
  ): Promise<RuntimeSnapshot | null> {
    const db = await this.getDb();

    if (!db) {
      const record = this.memoryFallback.get(lessonId);
      if (!record) return null;
      if (record.schemaVersion !== CURRENT_SCHEMA_VERSION) {
        this.memoryFallback.delete(lessonId);
        return null;
      }
      return record.snapshot;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([SNAPSHOT_STORE], 'readonly');
        const store = tx.objectStore(SNAPSHOT_STORE);
        const req = store.get(lessonId);

        req.onsuccess = () => {
          const record = req.result as StoredSnapshotRecord | undefined;
          if (!record) {
            resolve(null);
            return;
          }

          // Version check: if schemaVersion changed or lesson was updated, invalidate stale snapshot
          if (record.schemaVersion !== CURRENT_SCHEMA_VERSION) {
            console.info(
              `[IndexedDbStorageEngine] Migrating stale snapshot for ${lessonId}`
            );
            this.clearSnapshot(lessonId).catch(() => {});
            resolve(null);
            return;
          }

          if (
            expectedLessonVersion &&
            record.lessonVersion &&
            record.lessonVersion !== expectedLessonVersion
          ) {
            console.info(
              `[IndexedDbStorageEngine] New lesson version detected for ${lessonId}`
            );
            this.clearSnapshot(lessonId).catch(() => {});
            resolve(null);
            return;
          }

          resolve(record.snapshot);
        };

        req.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  async clearSnapshot(lessonId: string): Promise<void> {
    this.memoryFallback.delete(lessonId);
    const db = await this.getDb();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([SNAPSHOT_STORE], 'readwrite');
        const store = tx.objectStore(SNAPSHOT_STORE);
        const req = store.delete(lessonId);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async clearAllSnapshots(): Promise<void> {
    this.memoryFallback.clear();
    const db = await this.getDb();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([SNAPSHOT_STORE], 'readwrite');
        const store = tx.objectStore(SNAPSHOT_STORE);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const indexedDbStorageEngine = new IndexedDbStorageEngine();
