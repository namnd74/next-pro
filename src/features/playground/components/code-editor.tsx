'use client';

import * as React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
  className?: string;
}

// Custom High-Contrast Theme Overrides for Dark & Light modes
const highContrastDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#090d16 !important',
      color: '#f8fafc !important',
      fontSize: '13px',
    },
    '.cm-content': {
      caretColor: '#38bdf8',
      fontFamily:
        'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    '.cm-cursor': {
      borderLeftColor: '#38bdf8 !important',
      borderLeftWidth: '2px !important',
    },
    '.cm-gutters': {
      backgroundColor: '#070a12 !important',
      color: '#64748b !important',
      borderRight: '1px solid rgba(255, 255, 255, 0.08) !important',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(56, 189, 248, 0.15) !important',
      color: '#38bdf8 !important',
      fontWeight: 'bold',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.04) !important',
    },
    '.cm-selectionMatch': {
      backgroundColor: 'rgba(56, 189, 248, 0.25) !important',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(99, 102, 241, 0.35) !important',
    },
  },
  { dark: true }
);

const highContrastLightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#ffffff !important',
      color: '#0f172a !important',
      fontSize: '13px',
    },
    '.cm-content': {
      caretColor: '#2563eb',
      fontFamily:
        'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    '.cm-cursor': {
      borderLeftColor: '#2563eb !important',
      borderLeftWidth: '2px !important',
    },
    '.cm-gutters': {
      backgroundColor: '#f8fafc !important',
      color: '#94a3b8 !important',
      borderRight: '1px solid rgba(0, 0, 0, 0.08) !important',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(37, 99, 235, 0.1) !important',
      color: '#2563eb !important',
      fontWeight: 'bold',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(0, 0, 0, 0.03) !important',
    },
    '.cm-selectionMatch': {
      backgroundColor: 'rgba(37, 99, 235, 0.15) !important',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(37, 99, 235, 0.25) !important',
    },
  },
  { dark: false }
);

export function CodeEditor({
  code,
  onChange,
  onRun,
  readOnly = false,
  className = '',
}: CodeEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) === 'dark' : true;

  const extensions = React.useMemo(() => {
    const baseExtensions = [
      EditorView.lineWrapping,
      javascript({
        jsx: true,
        typescript: true,
      }),
    ];

    if (isDark) {
      return [...baseExtensions, oneDark, highContrastDarkTheme];
    }

    return [...baseExtensions, highContrastLightTheme];
  }, [isDark]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      onRun?.();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className={`h-full w-full overflow-hidden font-mono text-xs ${className}`}
    >
      <CodeMirror
        value={code}
        height="100%"
        theme={isDark ? 'dark' : 'light'}
        extensions={extensions}
        editable={!readOnly}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
          tabSize: 2,
        }}
        className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto [&_.cm-scroller]:font-mono"
      />
    </div>
  );
}
