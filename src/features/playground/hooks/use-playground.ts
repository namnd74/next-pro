import * as React from 'react';
import type { PlaygroundFile, PlaygroundProject, PlaygroundLayoutConfig } from '../types';
import { compileVirtualProject } from '../engine/compiler.worker';
import { cleanVirtualPath } from '../engine/module-resolver';
import { useRunnerBridge } from './use-runner-bridge';

export interface UsePlaygroundProps {
  initialFiles: Record<string, string | PlaygroundFile>;
  entryPath?: string;
  autoRunDebounceMs?: number;
}

export function usePlayground({
  initialFiles,
  entryPath = '/App.tsx',
  autoRunDebounceMs = 250,
}: UsePlaygroundProps) {
  // Normalize initial files to PlaygroundFile dictionary
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

    const normEntry = cleanVirtualPath(entryPath);
    if (!files[normEntry]) {
      const firstKey = Object.keys(files)[0] || '/App.tsx';
      return {
        files,
        entryPath: firstKey,
        activePath: firstKey,
      };
    }

    return {
      files,
      entryPath: normEntry,
      activePath: normEntry,
    };
  }, [initialFiles, entryPath]);

  const [project, setProject] = React.useState<PlaygroundProject>(
    normalizedInitialProject
  );
  const [layout, setLayout] = React.useState<PlaygroundLayoutConfig>({
    orientation: 'horizontal',
    viewport: 'desktop',
    showConsole: false,
    showSidebar: true,
    isFullscreen: false,
  });

  const [compileErrors, setCompileErrors] = React.useState<
    { path: string; message: string }[]
  >([]);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Runner Bridge
  const bridge = useRunnerBridge();

  // Trigger Compilation and Execution
  const runProject = React.useCallback(() => {
    const result = compileVirtualProject(project.files, project.entryPath);

    if (!result.success) {
      setCompileErrors(result.errors);
      return;
    }

    setCompileErrors([]);
    bridge.execute(project.entryPath, result.modules);
  }, [project.files, project.entryPath, bridge]);

  const hasInitialRunRef = React.useRef(false);

  // Initial Auto-run when iframe is ready
  React.useEffect(() => {
    if (bridge.isIframeReady && !hasInitialRunRef.current) {
      hasInitialRunRef.current = true;
      runProject();
    }
  }, [bridge.isIframeReady, runProject]);

  // Debounced auto-run on file changes
  const scheduleAutoRun = React.useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      runProject();
    }, autoRunDebounceMs);
  }, [runProject, autoRunDebounceMs]);

  // File Mutators
  const updateFileContent = React.useCallback(
    (path: string, newContent: string) => {
      const normPath = cleanVirtualPath(path);
      setProject((prev) => {
        const existing = prev.files[normPath];
        if (!existing || existing.content === newContent) return prev;

        return {
          ...prev,
          files: {
            ...prev.files,
            [normPath]: {
              ...existing,
              content: newContent,
            },
          },
        };
      });

      scheduleAutoRun();
    },
    [scheduleAutoRun]
  );

  const addFile = React.useCallback((filePath: string, content = '// New file\n') => {
    const normPath = cleanVirtualPath(filePath);
    setProject((prev) => {
      if (prev.files[normPath]) return prev;
      return {
        ...prev,
        activePath: normPath,
        files: {
          ...prev.files,
          [normPath]: { path: normPath, content },
        },
      };
    });
  }, []);

  const deleteFile = React.useCallback((filePath: string) => {
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

      return {
        ...prev,
        activePath: nextActive,
        files: updatedFiles,
      };
    });
  }, []);

  const renameFile = React.useCallback((oldPath: string, newPath: string) => {
    const normOld = cleanVirtualPath(oldPath);
    const normNew = cleanVirtualPath(newPath);

    setProject((prev) => {
      if (!prev.files[normOld] || prev.files[normNew] || normOld === prev.entryPath)
        return prev;

      const fileData = prev.files[normOld];
      const updatedFiles = { ...prev.files };
      delete updatedFiles[normOld];
      updatedFiles[normNew] = { ...fileData, path: normNew };

      return {
        ...prev,
        activePath: prev.activePath === normOld ? normNew : prev.activePath,
        files: updatedFiles,
      };
    });
  }, []);

  const resetProject = React.useCallback(() => {
    hasInitialRunRef.current = false;
    setProject(normalizedInitialProject);
    bridge.clearLogs();
    bridge.rebootIframe();
  }, [normalizedInitialProject, bridge]);

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
    bridge,
    updateFileContent,
    addFile,
    deleteFile,
    renameFile,
    setActivePath: (path: string) =>
      setProject((prev) => ({ ...prev, activePath: cleanVirtualPath(path) })),
    resetProject,
    runProject,
    toggleConsole,
    toggleSidebar,
    toggleFullscreen,
    setIsFullscreen,
    setOrientation,
    setViewport,
  };
}
