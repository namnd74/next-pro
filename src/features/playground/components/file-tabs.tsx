'use client';

import * as React from 'react';
import { Plus, X, FileCode2, Check } from 'lucide-react';
import type { PlaygroundFile } from '../types';
import type { FileChangeStatus } from '@/lib/storage/platform-db';
import { cleanVirtualPath } from '../engines/react-lite';

interface FileTabsProps {
  files: Record<string, PlaygroundFile>;
  activePath: string;
  entryPath: string;
  fileStatusMap?: Record<string, FileChangeStatus>;
  onSelectFile: (path: string) => void;
  onAddFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}

export function FileTabs({
  files,
  activePath,
  entryPath,
  fileStatusMap = {},
  onSelectFile,
  onAddFile,
  onDeleteFile,
}: FileTabsProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const fileList = React.useMemo(() => Object.values(files), [files]);

  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleConfirmAdd = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsAdding(false);
      return;
    }

    // Auto-append .tsx if no extension provided
    let finalName = trimmed;
    if (!finalName.includes('.')) {
      finalName = `${finalName}.tsx`;
    }

    const normPath = cleanVirtualPath(finalName);
    onAddFile(normPath);
    setNewFileName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewFileName('');
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Open files"
      className="border-border/50 bg-muted/40 no-scrollbar flex items-center gap-1 overflow-x-auto border-b px-2 py-1.5 select-none"
    >
      {fileList.map((file) => {
        const isActive = file.path === activePath;
        const isEntry = file.path === entryPath;
        const displayName = file.path.replace(/^\//, '');
        const status = fileStatusMap[file.path] || 'clean';

        return (
          <div
            key={file.path}
            className={`group flex items-center rounded-lg border font-mono text-xs transition-colors ${
              isActive
                ? 'bg-background text-foreground border-border/80 font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground border-transparent'
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectFile(file.path)}
              className="focus-visible:ring-primary flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 focus-visible:ring-2 focus-visible:outline-none"
            >
              <FileCode2
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${
                  status === 'modified'
                    ? 'text-amber-400'
                    : status === 'added'
                      ? 'text-emerald-400'
                      : isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                }`}
              />
              <span
                className={
                  status === 'modified'
                    ? 'text-amber-400'
                    : status === 'added'
                      ? 'text-emerald-400'
                      : ''
                }
              >
                {displayName}
              </span>

              {/* Git-like status badges */}
              {status === 'modified' && (
                <span className="text-[10px] font-bold text-amber-400" title="Modified">
                  ●
                </span>
              )}

              {status === 'added' && (
                <span
                  className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400"
                  title="Untracked"
                >
                  [U]
                </span>
              )}

              {isEntry && (
                <span className="bg-primary/10 py-0.2 text-primary rounded px-1 font-sans text-[9px] font-bold">
                  entry
                </span>
              )}
            </button>

            {!isEntry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.path);
                }}
                className="hover:text-destructive focus-visible:ring-primary flex min-h-11 min-w-11 items-center justify-center rounded opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:outline-none [@media(hover:none)]:opacity-100"
                title="Close file"
                aria-label={`Close file ${displayName}`}
              >
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}

      {/* Add New File Section */}
      {isAdding ? (
        <div className="bg-background border-primary/50 flex items-center gap-1 rounded-lg border px-2 py-0.5 font-mono text-xs">
          <input
            ref={inputRef}
            type="text"
            aria-label="New file name"
            placeholder="Filename.tsx"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-foreground w-28 bg-transparent text-xs focus:outline-none"
          />
          <button
            type="button"
            onClick={handleConfirmAdd}
            className="focus-visible:ring-primary flex min-h-11 min-w-11 items-center justify-center rounded text-emerald-500 hover:text-emerald-400 focus-visible:ring-2 focus-visible:outline-none"
            title="Add file"
            aria-label="Confirm add file"
          >
            <Check aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewFileName('');
            }}
            className="text-muted-foreground hover:text-destructive focus-visible:ring-primary flex min-h-11 min-w-11 items-center justify-center rounded focus-visible:ring-2 focus-visible:outline-none"
            title="Cancel"
            aria-label="Cancel add file"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="text-muted-foreground hover:bg-background/60 hover:text-foreground focus-visible:ring-primary flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
          title="New file"
        >
          <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="font-sans text-[11px]">New file</span>
        </button>
      )}
    </div>
  );
}
