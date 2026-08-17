'use client';

import * as React from 'react';
import {
  Bold,
  Italic,
  Code,
  List,
  Heading2,
  Sparkles,
  Eye,
  Edit3,
  Trash2,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Gõ câu trả lời của bạn tại đây...',
  disabled = false,
  minHeight = '180px',
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const wordCount = React.useMemo(() => {
    return value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [value]);

  const charCount = value.length;

  // Insert markdown tag at cursor position or selection
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (disabled || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length + (selectedText ? 0 : 4)
      );
    }, 0);
  };

  const insertTemplate = (templateType: 'pitch' | 'code') => {
    if (disabled) return;
    let templateText = '';
    if (templateType === 'pitch') {
      templateText = `**1. Elevator Pitch (30 giây):**\nTrả lời ngắn gọn bản chất cốt lõi...\n\n**2. Deep Dive Architecture:**\nPhân tích chi tiết cơ chế hoạt động bên dưới...\n\n**3. Code Minh Họa:**\n\`\`\`tsx\n// Viết mã nguồn minh họa ở đây\n\`\`\``;
    } else {
      templateText = `\`\`\`tsx\n// Code snippet\nfunction Solution() {\n  return <div>Code example</div>;\n}\n\`\`\``;
    }

    const newValue = value ? `${value}\n\n${templateText}` : templateText;
    onChange(newValue);
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        insertFormatting('**', '**');
      } else if (e.key === 'i') {
        e.preventDefault();
        insertFormatting('*', '*');
      } else if (e.key === 'e') {
        e.preventDefault();
        insertFormatting('`', '`');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      insertFormatting('  ', '');
    }
  };

  // Simple Markdown Renderer for Preview Mode
  const renderPreviewHtml = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="italic text-muted-foreground">Chưa có nội dung để xem trước...</p>
      );
    }

    // Process blocks: Code blocks, headers, lists, bold, italic
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${idx}`}
              className="my-2 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 dark:bg-black/80"
            >
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={idx} className="mt-3 font-bold text-foreground">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3 key={idx} className="mt-4 text-base font-bold text-foreground">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <p key={idx} className="font-bold text-foreground">
            {line.slice(2, -2)}
          </p>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="ml-4 list-disc text-xs text-foreground/90">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-xs leading-relaxed text-foreground">
            {line}
          </p>
        );
      }
    });

    return <div className="space-y-1.5">{elements}</div>;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/80 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPreview}
            onClick={() => insertFormatting('**', '**')}
            className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPreview}
            onClick={() => insertFormatting('*', '*')}
            className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPreview}
            onClick={() => insertFormatting('`', '`')}
            className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            title="Inline Code (Ctrl+E)"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPreview}
            onClick={() => insertFormatting('```tsx\n', '\n```')}
            className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            title="Code Block"
          >
            <FileCode className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPreview}
            onClick={() => insertFormatting('- ')}
            className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPreview}
            onClick={() => insertFormatting('### ')}
            className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            title="Heading"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>

          <div className="mx-1 h-4 w-[1px] bg-border/60" />

          {/* Preset templates */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isPreview}
            onClick={() => insertTemplate('pitch')}
            className="h-7 gap-1 rounded-lg px-2 text-[11px] font-medium"
            title="Chèn mẫu cấu trúc Senior Pitch"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Mẫu Senior Pitch</span>
          </Button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {value.length > 0 && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-destructive"
              title="Xóa tất cả"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            type="button"
            variant={isPreview ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-semibold"
          >
            {isPreview ? (
              <>
                <Edit3 className="h-3 w-3" />
                <span>Sửa Text</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                <span>Xem Trước</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-3">
        {isPreview ? (
          <div
            style={{ minHeight }}
            className="rounded-xl border border-border/40 bg-secondary/20 p-4 font-sans text-xs sm:text-sm"
          >
            {renderPreviewHtml(value)}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full resize-y bg-transparent font-sans text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
          />
        )}
      </div>

      {/* Footer Stats Bar */}
      <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Phím tắt: Ctrl+B (In đậm), Ctrl+I (In nghiêng), Tab (Lùi dòng)</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-[10px]">
            {wordCount} words
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            {charCount} chars
          </Badge>
        </div>
      </div>
    </div>
  );
}
