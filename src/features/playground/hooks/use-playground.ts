import * as React from 'react';
import type { PlaygroundFile, PlaygroundProject, PlaygroundLayoutConfig } from '../types';
import { compileVirtualProject, cleanVirtualPath } from '../engines/react-lite';
import { useRunnerBridge } from './use-runner-bridge';
import {
  getPlatformProject,
  savePlatformDelta,
  deletePlatformProject,
  getPlatformHistory,
  savePlatformSnapshot,
  clearPlatformHistory,
  resolveEffectiveFiles,
  computeDelta,
  type FileChangeStatus,
  type PlatformHistorySnapshot,
} from '@/lib/storage/platform-db';

export type { FileChangeStatus };

export interface UsePlaygroundProps {
  initialFiles: Record<string, string | PlaygroundFile>;
  entryPath?: string;
  autoRunDebounceMs?: number;
  platform?: string; // default 'react-lite'
  scopeId?: string; // e.g. lesson.id or 'scratchpad'
  enableAutoSave?: boolean;
}

export function usePlayground({
  initialFiles,
  entryPath = '/App.tsx',
  autoRunDebounceMs = 250,
  platform = 'react-lite',
  scopeId,
  enableAutoSave = true,
}: UsePlaygroundProps) {
  // Normalize base template files
  const normalizedInitialProject = React.useMemo<PlaygroundProject>(() => {
    const files: Record<string, PlaygroundFile> = {};
    for (const [key, val] of Object.entries(initialFiles)) {
      const path = cleanVirtualPath(key);
      if (typeof val === 'string') {
        files[path] = { path, content: val };
      } else {
        files[path] = { ...val, path };
      }
    }

    if (platform === 'react-lite') {
      if (files['/App.tsx'] && !files['/src/App.tsx']) {
        files['/src/App.tsx'] = { ...files['/App.tsx'], path: '/src/App.tsx' };
        delete files['/App.tsx'];
      }
      if (files['/styles.css'] && !files['/src/index.css']) {
        files['/src/index.css'] = { ...files['/styles.css'], path: '/src/index.css' };
        delete files['/styles.css'];
      }
      for (const [p, f] of Object.entries(files)) {
        if (
          p.startsWith('/components/') ||
          p.startsWith('/data/') ||
          p.startsWith('/hooks/') ||
          p.startsWith('/utils/')
        ) {
          const np = `/src${p}`;
          files[np] = { ...f, path: np };
          delete files[p];
        }
      }
      if (!files['/index.html']) {
        files['/index.html'] = {
          path: '/index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NextPro React Studio</title>
  </head>
  <body>
    <!-- Container DOM duy nhất của ứng dụng Single Page (SPA) -->
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        };
      }
      if (!files['/src/main.tsx']) {
        files['/src/main.tsx'] = {
          path: '/src/main.tsx',
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Trái tim khởi động: Tìm phần tử #root và kích hoạt chu kỳ render
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}`,
        };
      }
      if (!files['/src/index.css']) {
        files['/src/index.css'] = {
          path: '/src/index.css',
          content: '/* Custom playground styles */\n',
        };
      }
    }

    let normEntry = cleanVirtualPath(entryPath);
    if (files['/src/main.tsx']) {
      normEntry = '/src/main.tsx';
    } else if (!files[normEntry]) {
      const firstKey = Object.keys(files)[0] || '/App.tsx';
      normEntry = firstKey;
    }

    const defaultActive = files['/src/App.tsx']
      ? '/src/App.tsx'
      : files['/App.tsx']
        ? '/App.tsx'
        : normEntry;

    return {
      files,
      entryPath: normEntry,
      activePath: defaultActive,
    };
  }, [initialFiles, entryPath]);

  const [project, setProject] = React.useState<PlaygroundProject>(
    normalizedInitialProject
  );
  const projectRef = React.useRef(project);
  React.useEffect(() => {
    projectRef.current = project;
  }, [project]);
  const [layout, setLayout] = React.useState<PlaygroundLayoutConfig>({
    orientation: 'horizontal',
    viewport: 'desktop',
    showConsole: false,
    showSidebar: true,
    showPreview: true,
    isFullscreen: false,
  });

  const [compileErrors, setCompileErrors] = React.useState<
    { path: string; message: string }[]
  >([]);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [historySnapshots, setHistorySnapshots] = React.useState<
    PlatformHistorySnapshot[]
  >([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastExecutedFilesRef = React.useRef<PlaygroundProject['files'] | null>(null);

  // Compute Delta & Visual Change Statuses
  const {
    isCustomized,
    statusMap: fileStatusMap,
    modifiedFiles,
    addedFiles,
    deletedFiles,
  } = React.useMemo(() => {
    return computeDelta(normalizedInitialProject.files, project.files);
  }, [normalizedInitialProject.files, project.files]);

  const modifiedCount =
    Object.keys(modifiedFiles).length +
    Object.keys(addedFiles).length +
    deletedFiles.length;

  // Runner Bridge
  const bridge = useRunnerBridge();
  const executeProjectInRunner = bridge.execute;
  const rebootRunnerIframe = bridge.rebootIframe;

  // 1. Hydrate saved project from IndexedDB on mount with Virtual Overlay merge
  React.useEffect(() => {
    let isMounted = true;

    async function loadSavedState() {
      if (!scopeId) {
        setIsHydrated(true);
        return;
      }

      try {
        const savedDelta = await getPlatformProject(platform, scopeId);
        if (isMounted && savedDelta && savedDelta.isCustomized) {
          const mergedFiles = resolveEffectiveFiles(
            normalizedInitialProject.files,
            savedDelta
          );
          const hydratedProject = {
            files: mergedFiles,
            entryPath: normalizedInitialProject.entryPath,
            activePath:
              savedDelta.activePath && mergedFiles[savedDelta.activePath]
                ? savedDelta.activePath
                : normalizedInitialProject.activePath,
          };
          setProject(hydratedProject);
        }
        if (isMounted) {
          const history = await getPlatformHistory(platform, scopeId);
          setHistorySnapshots(history);
        }
      } catch (err) {
        console.warn('[usePlayground] Error loading from IndexedDB:', err);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    }

    loadSavedState();
    return () => {
      isMounted = false;
    };
  }, [platform, scopeId, normalizedInitialProject]);

  // Trigger Compilation and Execution
  const runProject = React.useCallback(() => {
    // Automatically ensure preview is visible when running
    setLayout((prev) =>
      prev.showPreview === false ? { ...prev, showPreview: true } : prev
    );

    const currentProject = projectRef.current;
    lastExecutedFilesRef.current = currentProject.files;
    const result = compileVirtualProject(currentProject.files, currentProject.entryPath);

    if (!result.success) {
      setCompileErrors(result.errors);
      return;
    }

    setCompileErrors([]);
    executeProjectInRunner(currentProject.entryPath, result.modules);
  }, [executeProjectInRunner]);

  const hasInitialRunRef = React.useRef(false);

  const retryRunner = React.useCallback(() => {
    hasInitialRunRef.current = false;
    lastExecutedFilesRef.current = null;
    rebootRunnerIframe();
  }, [rebootRunnerIframe]);

  // Initial Auto-run when iframe is ready and project is hydrated
  React.useEffect(() => {
    if (bridge.isIframeReady && isHydrated && !hasInitialRunRef.current) {
      hasInitialRunRef.current = true;
      runProject();
    }
  }, [bridge.isIframeReady, isHydrated, runProject]);

  // Re-run when preview is unhidden to ensure fresh rendering
  const prevShowPreviewRef = React.useRef(layout.showPreview);
  React.useEffect(() => {
    if (prevShowPreviewRef.current === false && layout.showPreview !== false) {
      runProject();
    }
    prevShowPreviewRef.current = layout.showPreview;
  }, [layout.showPreview, runProject]);

  // Debounced auto-save Delta to IndexedDB (Zero bloat)
  const triggerAutoSave = React.useCallback(
    (currentProject: PlaygroundProject) => {
      if (!scopeId || !enableAutoSave || !isHydrated) return;

      setSaveStatus('saving');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        try {
          const record = await savePlatformDelta(
            platform,
            scopeId,
            normalizedInitialProject.files,
            currentProject.files,
            currentProject.activePath
          );
          if (record) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
          } else {
            setSaveStatus('idle');
          }
        } catch (err) {
          console.warn('[usePlayground] Failed to auto-save to IndexedDB:', err);
          setSaveStatus('idle');
        }
      }, 400);
    },
    [platform, scopeId, enableAutoSave, isHydrated, normalizedInitialProject.files]
  );

  // Debounced auto-run on every project file mutation. Reading from projectRef
  // guarantees the timer compiles the committed project instead of the render
  // snapshot that scheduled it.
  React.useEffect(() => {
    if (!bridge.isIframeReady || !isHydrated || !hasInitialRunRef.current) return;
    if (lastExecutedFilesRef.current === project.files) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(runProject, autoRunDebounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [project.files, bridge.isIframeReady, isHydrated, runProject, autoRunDebounceMs]);

  // File Mutators
  const updateFileContent = React.useCallback(
    (path: string, newContent: string) => {
      const normPath = cleanVirtualPath(path);
      setProject((prev) => {
        const existing = prev.files[normPath];
        if (!existing || existing.content === newContent) return prev;

        const updated: PlaygroundProject = {
          ...prev,
          files: {
            ...prev.files,
            [normPath]: {
              ...existing,
              content: newContent,
            },
          },
        };

        triggerAutoSave(updated);
        return updated;
      });
    },
    [triggerAutoSave]
  );

  const addFile = React.useCallback(
    (filePath: string, content = '// New file\n') => {
      const normPath = cleanVirtualPath(filePath);
      setProject((prev) => {
        if (prev.files[normPath]) return prev;
        const updated: PlaygroundProject = {
          ...prev,
          activePath: normPath,
          files: {
            ...prev.files,
            [normPath]: { path: normPath, content },
          },
        };
        triggerAutoSave(updated);
        return updated;
      });
    },
    [triggerAutoSave]
  );

  const deleteFile = React.useCallback(
    (filePath: string) => {
      const normPath = cleanVirtualPath(filePath);
      setProject((prev) => {
        if (normPath === prev.entryPath) return prev; // Cannot delete entry file
        const updatedFiles = { ...prev.files };
        delete updatedFiles[normPath];

        const remainingKeys = Object.keys(updatedFiles);
        const nextActive =
          prev.activePath === normPath
            ? remainingKeys[0] || prev.entryPath
            : prev.activePath;

        const updated: PlaygroundProject = {
          ...prev,
          activePath: nextActive,
          files: updatedFiles,
        };
        triggerAutoSave(updated);
        return updated;
      });
    },
    [triggerAutoSave]
  );

  const renameFile = React.useCallback(
    (oldPath: string, newPath: string) => {
      const normOld = cleanVirtualPath(oldPath);
      const normNew = cleanVirtualPath(newPath);

      setProject((prev) => {
        if (!prev.files[normOld] || prev.files[normNew] || normOld === prev.entryPath)
          return prev;

        const fileData = prev.files[normOld];
        const updatedFiles = { ...prev.files };
        delete updatedFiles[normOld];
        updatedFiles[normNew] = { ...fileData, path: normNew };

        const updated: PlaygroundProject = {
          ...prev,
          activePath: prev.activePath === normOld ? normNew : prev.activePath,
          files: updatedFiles,
        };
        triggerAutoSave(updated);
        return updated;
      });
    },
    [triggerAutoSave]
  );

  // Reset single file to its base template
  const resetFile = React.useCallback(
    (path: string) => {
      const normPath = cleanVirtualPath(path);
      const original = normalizedInitialProject.files[normPath];

      setProject((prev) => {
        const updatedFiles = { ...prev.files };
        if (original) {
          updatedFiles[normPath] = { ...original };
        } else {
          // File was user-added, remove it
          delete updatedFiles[normPath];
        }

        const nextActive = updatedFiles[normPath]
          ? normPath
          : Object.keys(updatedFiles)[0] || prev.entryPath;

        const updated: PlaygroundProject = {
          ...prev,
          activePath: nextActive,
          files: updatedFiles,
        };
        triggerAutoSave(updated);
        return updated;
      });
    },
    [normalizedInitialProject.files, triggerAutoSave]
  );

  // Manual & Auto Snapshots
  const createSnapshot = React.useCallback(
    async (name?: string, summary?: string) => {
      if (!scopeId) return null;
      try {
        const snapshot = await savePlatformSnapshot(
          platform,
          scopeId,
          project.files,
          name,
          summary
        );
        setHistorySnapshots((prev) => [snapshot, ...prev].slice(0, 20));
        return snapshot;
      } catch (err) {
        console.warn('[usePlayground] Error saving snapshot:', err);
        return null;
      }
    },
    [platform, scopeId, project.files]
  );

  // Restore snapshot
  const revertToSnapshot = React.useCallback(
    (snapshot: PlatformHistorySnapshot) => {
      setProject((prev) => {
        const updated: PlaygroundProject = {
          ...prev,
          files: snapshot.files,
          activePath: snapshot.files[prev.activePath] ? prev.activePath : prev.entryPath,
        };
        triggerAutoSave(updated);
        return updated;
      });
      bridge.clearLogs();
    },
    [triggerAutoSave, bridge]
  );

  // Reset to original starter template
  const resetProject = React.useCallback(async () => {
    hasInitialRunRef.current = false;
    lastExecutedFilesRef.current = null;
    setProject(normalizedInitialProject);
    bridge.clearLogs();
    retryRunner();

    if (scopeId) {
      try {
        await deletePlatformProject(platform, scopeId);
        await clearPlatformHistory(platform, scopeId);
        setHistorySnapshots([]);
      } catch (err) {
        console.warn('[usePlayground] Error resetting IndexedDB state:', err);
      }
    }
  }, [normalizedInitialProject, bridge, platform, scopeId, retryRunner]);

  const toggleConsole = React.useCallback(() => {
    setLayout((prev) => ({ ...prev, showConsole: !prev.showConsole }));
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setLayout((prev) => ({ ...prev, showSidebar: !prev.showSidebar }));
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    setLayout((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const setIsFullscreen = React.useCallback((isFullscreen: boolean) => {
    setLayout((prev) => ({ ...prev, isFullscreen }));
  }, []);

  const togglePreview = React.useCallback(() => {
    setLayout((prev) => ({ ...prev, showPreview: prev.showPreview === false }));
  }, []);

  const setShowPreview = React.useCallback((showPreview: boolean) => {
    setLayout((prev) => ({ ...prev, showPreview }));
  }, []);

  const setOrientation = React.useCallback((orientation: 'horizontal' | 'vertical') => {
    setLayout((prev) => ({ ...prev, orientation }));
  }, []);

  const setViewport = React.useCallback((viewport: 'desktop' | 'tablet' | 'mobile') => {
    setLayout((prev) => ({ ...prev, viewport }));
  }, []);

  // Listen for Escape key to close fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && layout.isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layout.isFullscreen, setIsFullscreen]);

  return {
    project,
    activeFile: project.files[project.activePath] || project.files[project.entryPath],
    layout,
    compileErrors,
    saveStatus,
    isCustomized,
    modifiedCount,
    fileStatusMap,
    historySnapshots,
    isHydrated,
    bridge,
    updateFileContent,
    addFile,
    deleteFile,
    renameFile,
    resetFile,
    createSnapshot,
    revertToSnapshot,
    setActivePath: (path: string) =>
      setProject((prev) => ({ ...prev, activePath: cleanVirtualPath(path) })),
    resetProject,
    runProject,
    retryRunner,
    toggleConsole,
    toggleSidebar,
    togglePreview,
    setShowPreview,
    toggleFullscreen,
    setIsFullscreen,
    setOrientation,
    setViewport,
  };
}
