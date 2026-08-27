'use client';

import * as React from 'react';
import {
  AlertTriangle,
  Database,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Table as TableIcon,
} from 'lucide-react';
import type { SqlDatabase, SqlExecutionResult, WorkbenchConfig } from '../types';
import {
  createDefaultSqlDatabase,
  executeSqlInjection,
} from '../engines/sql-injection-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SqlLabViewProps {
  config: WorkbenchConfig;
  onExecution?: (result: SqlExecutionResult, payload: string) => void;
}

export function SqlLabView({ config, onExecution }: SqlLabViewProps) {
  const [db] = React.useState<SqlDatabase>(
    () => config.initialSqlDb || createDefaultSqlDatabase()
  );
  const [payload, setPayload] = React.useState<string>('Sensor');
  const [templateQuery] = React.useState<string>(
    "SELECT * FROM products WHERE is_published = 1 AND title LIKE '%{{USER_INPUT}}%'"
  );
  const [executionResult, setExecutionResult] = React.useState<SqlExecutionResult | null>(
    null
  );
  const [activeSubTab, setActiveSubTab] = React.useState<'result' | 'schema'>('result');

  const handleExecute = (targetPayload: string = payload) => {
    const res = executeSqlInjection(targetPayload, templateQuery, db);
    setExecutionResult(res);
    onExecution?.(res, targetPayload);
  };

  React.useEffect(() => {
    handleExecute('Sensor');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Sample Payloads */}
      {config.samplePayloads && config.samplePayloads.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Payload mẫu:
          </span>
          {config.samplePayloads.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setPayload(sample);
                handleExecute(sample);
              }}
              className="border-border/60 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/40 group text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors"
            >
              <span>{sample}</span>
              <Play className="text-primary h-2.5 w-2.5 opacity-70" />
            </button>
          ))}
        </div>
      )}

      {/* Query Builder Card */}
      <Card className="glass-card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-sky-400" />
            <h3 className="text-foreground text-sm font-bold">
              SQL Query Interceptor & Engine
            </h3>
          </div>
          <Badge variant="info" className="text-[10px] uppercase">
            In-Memory Relational Engine
          </Badge>
        </div>

        {/* Template display */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300">
          <span className="text-slate-500 select-none">
            -- Backend Server Template Query:
          </span>
          <p className="mt-1 text-emerald-400">
            {templateQuery.split('{{USER_INPUT}}')[0]}
            <span className="border-b border-amber-400 bg-amber-500/20 px-1 font-bold text-amber-300">
              {payload || '{{USER_INPUT}}'}
            </span>
            {templateQuery.split('{{USER_INPUT}}')[1]}
          </p>
        </div>

        {/* Input & Action */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              placeholder="Nhập chuỗi tìm kiếm hoặc SQL Injection payload..."
              className="border-border/80 bg-background/80 text-foreground ring-primary/20 w-full rounded-xl border px-3.5 py-2 font-mono text-xs outline-none focus:ring-2"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => handleExecute()}
              size="sm"
              className="gap-1.5 text-xs font-bold"
            >
              <Play className="h-3.5 w-3.5" />
              Thực thi SQL
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPayload('');
                handleExecute('');
              }}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Sub Tabs: Execution Result vs Schema Inspector */}
      <div className="border-border/60 flex items-center justify-between border-b pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('result')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeSubTab === 'result'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            Kết quả Truy vấn ({executionResult?.rowCount ?? 0} dòng)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('schema')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeSubTab === 'schema'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Cơ sở Dữ liệu & Schema ({Object.keys(db.tables).length} bảng)
          </button>
        </div>
        {executionResult && (
          <span className="text-muted-foreground font-mono text-[11px]">
            {executionResult.executionTimeMs.toFixed(2)} ms
          </span>
        )}
      </div>

      {/* Vulnerability Alert Banner */}
      {executionResult?.vulnerabilityTriggered && (
        <div className="animate-in fade-in flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold tracking-wider text-rose-400 uppercase">
              Lỗ hổng được kích hoạt thành công:
            </span>
            <p className="text-xs leading-relaxed font-semibold">
              {executionResult.vulnerabilityTriggered}
            </p>
          </div>
        </div>
      )}

      {/* Main Table Result */}
      {activeSubTab === 'result' && (
        <div className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-lg">
          {executionResult?.error ? (
            <div className="flex items-start gap-2 bg-rose-950/20 p-4 font-mono text-xs text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{executionResult.error}</span>
            </div>
          ) : executionResult && executionResult.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-border/60 bg-muted/50 text-muted-foreground border-b font-semibold">
                  <tr>
                    {executionResult.columns.map((col) => (
                      <th key={col} className="px-4 py-2.5 font-mono text-[11px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-border/40 divide-y font-mono text-[11.5px]">
                  {executionResult.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                      {executionResult.columns.map((col) => (
                        <td
                          key={col}
                          className="text-foreground px-4 py-2 whitespace-nowrap"
                        >
                          {typeof row[col] === 'boolean'
                            ? row[col]
                              ? 'true'
                              : 'false'
                            : String(row[col] ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground p-8 text-center text-xs">
              Không có dữ liệu trả về cho truy vấn này.
            </div>
          )}
        </div>
      )}

      {/* Schema Inspector Tab */}
      {activeSubTab === 'schema' && (
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(db.tables).map((table) => (
            <Card key={table.name} className="glass-card space-y-2 p-3.5">
              <div className="border-border/50 flex items-center justify-between border-b pb-1.5">
                <span className="text-primary font-mono text-xs font-extrabold">
                  table: {table.name}
                </span>
                <Badge variant="outline" className="text-[9px]">
                  {table.rows.length} rows
                </Badge>
              </div>
              <ul className="text-muted-foreground space-y-1 font-mono text-[11px]">
                {table.columns.map((c) => (
                  <li key={c.name} className="flex justify-between">
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-500">{c.type}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
