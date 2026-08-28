'use client';

import * as React from 'react';
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  Palette,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import type { PlaygroundFile } from '../types';
import { cleanVirtualPath } from '../engine/module-resolver';

interface FileExplorerProps {
  files: Record<string, PlaygroundFile>;
  activePath: string;
  entryPath: string;
  onSelectFile: (path: string) => void;
  onAddFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onDeleteFile: (path: string) => void;
  className?: string;
}

interface TreeNode {
  name: string;
  fullPath: string;
  isFolder: boolean;
  file?: PlaygroundFile;
  children: Record<string, TreeNode>;
}

function buildFileTree(files: Record<string, PlaygroundFile>): TreeNode {
  const root: TreeNode = {
    name: 'src',
    fullPath: '/',
    isFolder: true,
    children: {},
  };

  for (const [path, file] of Object.entries(files)) {
    const cleanPath = path.replace(/^\//, '');
    const parts = cleanPath.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.children[part] = {
          name: part,
          fullPath: path,
          isFolder: false,
          file,
          children: {},
        };
      } else {
        if (!current.children[part]) {
          const folderFullPath = '/' + parts.slice(0, i + 1).join('/');
          current.children[part] = {
            name: part,
            fullPath: folderFullPath,
            isFolder: true,
            children: {},
          };
        }
        current = current.children[part];
      }
    }
  }

  return root;
}

export function FileExplorer({
  files,
  activePath,
  entryPath,
  onSelectFile,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  className = '',
}: FileExplorerProps) {
  const [isCreatingInFolder, setIsCreatingInFolder] = React.useState<string | null>(null);
  const [newFileName, setNewFileName] = React.useState('');
  const [renamingPath, setRenamingPath] = React.useState<string | null>(null);
  const [renamingValue, setRenamingValue] = React.useState('');
  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({
    '/': true,
    '/components': true,
    '/hooks': true,
    '/data': true,
  });

  const createInputRef = React.useRef<HTMLInputElement | null>(null);
  const renameInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isCreatingInFolder !== null && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [isCreatingInFolder]);

  React.useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renamingPath]);

  const tree = React.useMemo(() => buildFileTree(files), [files]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: prev[folderPath] === undefined ? false : !prev[folderPath],
    }));
  };

  const handleStartRename = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingPath(path);
    const basename = path.substring(path.lastIndexOf('/') + 1);
    setRenamingValue(basename);
  };

  const handleConfirmRename = () => {
    if (!renamingPath) return;
    const trimmed = renamingValue.trim();
    if (trimmed) {
      const dir = renamingPath.substring(0, renamingPath.lastIndexOf('/'));
      const newPath = cleanVirtualPath(`${dir}/${trimmed}`);
      if (newPath !== renamingPath) {
        onRenameFile(renamingPath, newPath);
      }
    }
    setRenamingPath(null);
    setRenamingValue('');
  };

  const handleStartCreate = (folderPath = '/') => {
    setIsCreatingInFolder(folderPath);
    setNewFileName('');
    // Auto-expand parent folder
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: true }));
  };

  const handleConfirmCreate = () => {
    if (isCreatingInFolder === null) return;
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreatingInFolder(null);
      return;
    }

    let fileName = trimmed;
    if (!fileName.includes('.')) {
      fileName = `${fileName}.tsx`;
    }

    const folderPrefix = isCreatingInFolder === '/' ? '' : isCreatingInFolder;
    const finalPath = cleanVirtualPath(`${folderPrefix}/${fileName}`);
    onAddFile(finalPath);
    setNewFileName('');
    setIsCreatingInFolder(null);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
      return <FileCode2 className="h-3.5 w-3.5 shrink-0 text-sky-400" />;
    }
    if (path.endsWith('.ts') || path.endsWith('.js')) {
      return <FileCode2 className="h-3.5 w-3.5 shrink-0 text-amber-400" />;
    }
    if (path.endsWith('.css')) {
      return <Palette className="h-3.5 w-3.5 shrink-0 text-pink-400" />;
    }
    if (path.endsWith('.json')) {
      return <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
    }
    return <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />;
  };

  const renderTree = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedFolders[node.fullPath] ?? true;

    if (node.isFolder) {
      // Sort folder children: folders first, then files
      const childrenEntries = Object.entries(node.children).sort(([, a], [, b]) => {
        if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
        return a.isFolder ? -1 : 1;
      });

      return (
        <div key={node.fullPath} className="space-y-0.5">
          {/* Folder Header Row */}
          <div
            onClick={() => toggleFolder(node.fullPath)}
            className="group flex cursor-pointer items-center justify-between rounded px-1.5 py-1 text-[11px] font-bold text-slate-300 transition-colors select-none hover:bg-slate-900/70"
            style={{ paddingLeft: `${depth * 10 + 6}px` }}
          >
            <div className="flex items-center gap-1 overflow-hidden">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              ) : (
                <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              )}
              <span className="truncate text-[11px] tracking-wider uppercase">
                {node.name}
              </span>
            </div>

            {/* Quick add file into this folder */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartCreate(node.fullPath);
              }}
              className="rounded p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-800 hover:text-slate-100"
              title={`Thêm file vào ${node.name}/`}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Children Items */}
          {isExpanded && (
            <div className="ml-2.5 space-y-0.5 border-l border-slate-800/60">
              {/* Inline input when creating a file inside this folder */}
              {isCreatingInFolder === node.fullPath && (
                <div
                  className="border-primary/50 my-0.5 flex items-center gap-1 rounded border bg-slate-900 px-2 py-1 text-[11px]"
                  style={{ marginLeft: `${(depth + 1) * 8}px` }}
                >
                  <FileCode2 className="text-primary h-3.5 w-3.5 shrink-0" />
                  <input
                    ref={createInputRef}
                    type="text"
                    placeholder="Component.tsx"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmCreate();
                      if (e.key === 'Escape') setIsCreatingInFolder(null);
                    }}
                    className="w-full bg-transparent font-mono text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmCreate}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingInFolder(null)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {childrenEntries.map(([, childNode]) => renderTree(childNode, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Node is a File
    const isActive = node.fullPath === activePath;
    const isEntry = node.fullPath === entryPath;
    const isRenaming = renamingPath === node.fullPath;

    if (isRenaming) {
      return (
        <div
          key={node.fullPath}
          className="border-primary/50 my-0.5 flex items-center gap-1 rounded border bg-slate-900 px-2 py-1 text-[11px]"
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
        >
          {getFileIcon(node.fullPath)}
          <input
            ref={renameInputRef}
            type="text"
            value={renamingValue}
            onChange={(e) => setRenamingValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmRename();
              if (e.key === 'Escape') setRenamingPath(null);
            }}
            className="w-full bg-transparent font-mono text-slate-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleConfirmRename}
            className="text-emerald-400"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setRenamingPath(null)}
            className="text-slate-400"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={node.fullPath}
        onClick={() => onSelectFile(node.fullPath)}
        className={`group flex cursor-pointer items-center justify-between rounded px-1.5 py-1 text-[11px] transition-colors select-none ${
          isActive
            ? 'bg-primary/15 text-primary border-primary border-l-2 font-semibold'
            : 'text-slate-300 hover:bg-slate-900/60 hover:text-white'
        }`}
        style={{ paddingLeft: `${depth * 10 + 6}px` }}
      >
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis">
          {getFileIcon(node.fullPath)}
          <span className="truncate">{node.name}</span>
          {isEntry && (
            <span className="bg-primary/20 py-0.2 text-primary shrink-0 rounded px-1 font-sans text-[8px] font-bold">
              main
            </span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => handleStartRename(node.fullPath, e)}
            className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            title="Đổi tên file"
          >
            <Edit3 className="h-3 w-3" />
          </button>

          {!isEntry && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(node.fullPath);
              }}
              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-rose-950 hover:text-rose-400"
              title="Xóa file"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`border-border/60 flex h-full w-56 flex-col border-r bg-slate-950/90 font-mono text-xs select-none ${className}`}
    >
      {/* Explorer Header */}
      <div className="border-border/40 flex items-center justify-between border-b px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        <span className="flex items-center gap-1.5">
          <Folder className="text-primary h-3.5 w-3.5" />
          <span>Explorer</span>
        </span>

        <button
          type="button"
          onClick={() => handleStartCreate('/')}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title="Tạo file mới ở thư mục gốc (src/)"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Recursive Folder & File Tree */}
      <div className="flex-1 space-y-0.5 overflow-y-auto p-1.5">
        {renderTree(tree, 0)}
      </div>
    </div>
  );
}
