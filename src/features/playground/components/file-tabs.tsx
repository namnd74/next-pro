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
    <div className="border-border/50 bg-muted/40 no-scrollbar flex items-center gap-1 overflow-x-auto border-b px-2 py-1.5 select-none">
      {fileList.map((file) => {
        const isActive = file.path === activePath;
        const isEntry = file.path === entryPath;
        const displayName = file.path.replace(/^\//, '');
        const status = fileStatusMap[file.path] || 'clean';

        return (
          <div
            key={file.path}
            onClick={() => onSelectFile(file.path)}
            className={`group flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors ${
              isActive
                ? 'bg-background text-foreground border-border/80 font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground border-transparent'
            }`}
          >
            <FileCode2
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
              <span
                className="text-[10px] font-bold text-amber-400"
                title="File đã chỉnh sửa so với đề bài"
              >
                ●
              </span>
            )}

            {status === 'added' && (
              <span
                className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400"
                title="File do bạn tự tạo mới"
              >
                [U]
              </span>
            )}

            {isEntry && (
              <span className="bg-primary/10 py-0.2 text-primary rounded px-1 font-sans text-[9px] font-bold">
                entry
              </span>
            )}

            {!isEntry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.path);
                }}
                className="hover:text-destructive rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                title="Xóa file"
              >
                <X className="h-3 w-3" />
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
            placeholder="Filename.tsx"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-foreground w-28 bg-transparent text-xs focus:outline-none"
          />
          <button
            type="button"
            onClick={handleConfirmAdd}
            className="p-0.5 text-emerald-500 hover:text-emerald-400"
            title="Thêm file"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewFileName('');
            }}
            className="text-muted-foreground hover:text-destructive p-0.5"
            title="Hủy"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="text-muted-foreground hover:bg-background/60 hover:text-foreground flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors"
          title="Tạo file mới"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="font-sans text-[11px]">Thêm file</span>
        </button>
      )}
    </div>
  );
}
