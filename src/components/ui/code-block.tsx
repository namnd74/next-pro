'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showCopyButton?: boolean;
}

const KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'default',
  'function',
  'const',
  'let',
  'var',
  'return',
  'if',
  'else',
  'switch',
  'case',
  'break',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'type',
  'interface',
  'extends',
  'implements',
  'class',
  'new',
  'typeof',
  'instanceof',
  'in',
  'of',
  'as',
]);

const HOOKS_AND_BUILTINS = new Set([
  'useState',
  'useEffect',
  'useRef',
  'useActionState',
  'useOptimistic',
  'useFormStatus',
  'useTransition',
  'useDeferredValue',
  'useContext',
  'useCallback',
  'useMemo',
  'use',
  'useId',
  'useImperativeHandle',
  'useLayoutEffect',
  'createContext',
  'startTransition',
  'revalidateTag',
  'revalidatePath',
  'fetch',
  'console',
]);

const LITERALS = new Set(['true', 'false', 'null', 'undefined']);

function highlightLine(line: string): React.ReactNode {
  const trimmed = line.trim();

  // 1. Comments
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return <span className="font-sans italic text-emerald-400/90">{line}</span>;
  }

  // 2. Directives
  if (
    trimmed === "'use client';" ||
    trimmed === "'use server';" ||
    trimmed === '"use client";' ||
    trimmed === '"use server";'
  ) {
    return <span className="font-bold text-amber-300">{line}</span>;
  }

  // 3. Tokenizer Regex
  // Matches: strings, JSX tags, words, numbers, operators
  const tokenRegex =
    /("[^"]*"|'[^']*'|`[^`]*`|<\/?[A-Za-z0-9_.-]+|=>|\b[A-Za-z_$][A-Za-z0-9_$]*\b|\b\d+\b|[{}()[\];,.:?!=&|+-/*<>])/g;

  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    const token = match[0];
    const index = match.index;

    // Add un-matched whitespace / symbols
    if (index > lastIndex) {
      tokens.push(line.slice(lastIndex, index));
    }

    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith('`') && token.endsWith('`'))
    ) {
      // String literal
      tokens.push(
        <span key={index} className="text-emerald-300">
          {token}
        </span>
      );
    } else if (token.startsWith('<') || token.startsWith('</')) {
      // JSX Tag name
      tokens.push(
        <span key={index} className="font-semibold text-sky-400">
          {token}
        </span>
      );
    } else if (KEYWORDS.has(token)) {
      // TS/JS Keyword
      tokens.push(
        <span key={index} className="font-semibold text-purple-400">
          {token}
        </span>
      );
    } else if (HOOKS_AND_BUILTINS.has(token)) {
      // React Hook / Built-in
      tokens.push(
        <span key={index} className="font-medium text-cyan-300">
          {token}
        </span>
      );
    } else if (LITERALS.has(token) || /^\d+$/.test(token)) {
      // Boolean / Number / Null
      tokens.push(
        <span key={index} className="font-medium text-amber-400">
          {token}
        </span>
      );
    } else if (/^[A-Z][A-Za-z0-9_]*$/.test(token)) {
      // Component name (PascalCase)
      tokens.push(
        <span key={index} className="font-semibold text-indigo-300">
          {token}
        </span>
      );
    } else {
      tokens.push(token);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push(line.slice(lastIndex));
  }

  return <>{tokens}</>;
}

export function CodeBlock({
  code,
  language = 'tsx',
  className = '',
  showCopyButton = true,
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const lines = React.useMemo(() => code.split('\n'), [code]);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-md dark:bg-black/80 ${className}`}
    >
      {/* Header bar if language specified */}
      {language && (
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 py-1.5 font-mono text-[10px] font-medium text-slate-400">
          <span className="uppercase tracking-wider text-slate-300">{language}</span>
          {showCopyButton && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              title="Copy code"
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Code content */}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
        <code className="block w-full">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="w-7 shrink-0 select-none text-right text-[11px] text-slate-600">
                {idx + 1}
              </span>
              <span className="flex-1 whitespace-pre">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
