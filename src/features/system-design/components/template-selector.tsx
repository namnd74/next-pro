'use client';

import * as React from 'react';
import { Sparkles, Download, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SYSTEM_TEMPLATES } from '../data/system-templates';
import { useSystemDesignStore } from '../stores/use-system-design-store';

export function TemplateSelector() {
  const activeTemplateId = useSystemDesignStore((s) => s.activeTemplateId);
  const loadTemplate = useSystemDesignStore((s) => s.loadTemplate);
  const exportDiagramJson = useSystemDesignStore((s) => s.exportDiagramJson);
  const importDiagramJson = useSystemDesignStore((s) => s.importDiagramJson);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleExport = () => {
    const json = exportDiagramJson();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDiagramJson(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 backdrop-blur-md">
      {/* Template Quick Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Senior Templates:
        </span>

        {SYSTEM_TEMPLATES.map((tpl) => {
          const isActive = activeTemplateId === tpl.id;
          return (
            <Button
              key={tpl.id}
              size="sm"
              variant={isActive ? 'default' : 'outline'}
              onClick={() => loadTemplate(tpl.id)}
              className={`h-8 text-xs ${
                isActive
                  ? 'shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>
                {tpl.title.split(' ')[0]} ({tpl.difficulty})
              </span>
            </Button>
          );
        })}
      </div>

      {/* JSON Import & Export */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 gap-1.5 text-xs"
        >
          <Upload className="h-3 w-3 text-muted-foreground" />
          <span>Import JSON</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          className="h-8 gap-1.5 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Download className="h-3 w-3 text-muted-foreground" />
              <span>Export Spec</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
