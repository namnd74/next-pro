'use client';

import * as React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  code,
  onChange,
  onRun,
  readOnly = false,
  className = '',
}: CodeEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || theme) === 'dark';

  const extensions = React.useMemo(() => {
    return [
      EditorView.lineWrapping,
      javascript({
        jsx: true,
        typescript: true,
      }),
    ];
  }, []);

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
