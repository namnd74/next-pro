'use client';

import * as React from 'react';
import {
  Code,
  CornerDownLeft,
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
  executeSqlQuery,
} from '../engines/sql-injection-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SqlLabViewProps {
  config: WorkbenchConfig;
  onExecution?: (result: SqlExecutionResult, query: string) => void;
}

export const SqlLabView: React.FC<SqlLabViewProps> = ({ config, onExecution }) => {
  const [db, setDb] = React.useState<SqlDatabase>(
    () => config.initialSqlDb || createDefaultSqlDatabase()
  );
  const [queryInput, setQueryInput] = React.useState(
    "SELECT * FROM users WHERE username = 'operator' AND is_active = true"
  );
  const [result, setResult] = React.useState<SqlExecutionResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<'results' | 'ast' | 'schema'>(
    'results'
  );

  const handleExecute = (): void => {
    if (!queryInput.trim()) return;
    const res = executeSqlQuery(queryInput, db);
    setResult(res);
    onExecution?.(res, queryInput);
  };

  const handleReset = (): void => {
    const fresh = config.initialSqlDb || createDefaultSqlDatabase();
    setDb(fresh);
    setQueryInput("SELECT * FROM users WHERE username = 'operator' AND is_active = true");
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Sample SQL Payloads */}
      {config.samplePayloads && config.samplePayloads.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Payload mẫu:
          </span>
          {config.samplePayloads.map((payload) => (
            <button
              key={payload}
              type="button"
              onClick={() => {
                setQueryInput(
                  `SELECT * FROM users WHERE username = '${payload}' AND is_active = true`
                );
              }}
              className="border-border/60 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/40 group text-foreground inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors"
            >
              <span>{payload}</span>
              <CornerDownLeft className="text-muted-foreground group-hover:text-primary h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* SQL Query Editor Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-2xl ring-1 ring-slate-800">
        <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">
              PostgreSQL Relational AST Query Console
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 gap-1 px-2 text-[10px] text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Reset DB
            </Button>
            <Button
              size="sm"
              onClick={handleExecute}
              className="h-7 gap-1.5 bg-cyan-600 px-3 text-xs font-medium text-white hover:bg-cyan-500"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              Execute Query
            </Button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-xs text-cyan-300 ring-cyan-500/30 outline-none focus:ring-1"
            placeholder="Nhập câu lệnh SQL hoặc payload kiểm thử injection..."
            spellCheck="false"
          />
        </div>

        {/* View Tabs */}
        <div className="mt-3 flex items-center justify-between border-b border-slate-800/60 pb-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
                activeTab === 'results'
                  ? 'bg-cyan-500/20 font-semibold text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Result Set {result ? `(${result.rowCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ast')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
                activeTab === 'ast'
                  ? 'bg-cyan-500/20 font-semibold text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              AST Parser Tokens
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
                activeTab === 'schema'
                  ? 'bg-cyan-500/20 font-semibold text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              Database Schema
            </button>
          </div>

          {result?.vulnerabilityTriggered && (
            <Badge className="animate-pulse gap-1 border-rose-500/40 bg-rose-950/60 text-[10px] text-rose-300">
              <ShieldAlert className="h-3 w-3" />
              {result.vulnerabilityTriggered}
            </Badge>
          )}
        </div>

        {/* Tab Content Panels */}
        <div className="mt-3 min-h-[160px]">
          {activeTab === 'results' && (
            <div>
              {result ? (
                result.success ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="border-b border-slate-800 bg-slate-900 text-slate-400">
                        <tr>
                          {result.columns.map((col) => (
                            <th key={col} className="px-3 py-1.5 font-medium">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {result.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/40">
                            {result.columns.map((col) => (
                              <td key={col} className="px-3 py-1.5">
                                {String(row[col] ?? 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3 font-mono text-xs text-rose-300">
                    {result.error}
                  </div>
                )
              ) : (
                <div className="flex h-32 items-center justify-center font-sans text-xs text-slate-500">
                  Nhập truy vấn và nhấn Execute Query để xem kết quả trả về từ database.
                </div>
              )}
            </div>
          )}

          {activeTab === 'ast' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Phân tích cây cú pháp (AST Tokenization) của câu lệnh đã thực thi:
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-800 bg-slate-900 p-3">
                {result?.injectedTokens?.map((tk, idx) => (
                  <span
                    key={idx}
                    className={`rounded px-2 py-0.5 font-mono text-[11px] ${
                      tk.type === 'operator'
                        ? 'border border-blue-700/50 bg-blue-900/60 text-blue-300'
                        : tk.type === 'injected'
                          ? 'animate-pulse border border-rose-500 bg-rose-900/80 font-bold text-rose-200'
                          : tk.type === 'comment'
                            ? 'border border-amber-700/50 bg-amber-900/60 text-amber-300 italic'
                            : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tk.token}
                  </span>
                )) || (
                  <span className="text-xs text-slate-500">
                    Chưa có dữ liệu AST. Hãy thực thi một câu lệnh.
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(db.tables).map(([tblName, tbl]) => (
                <div
                  key={tblName}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{tblName}</span>
                    <span className="text-[10px] text-slate-500">
                      {tbl.rows.length} rows
                    </span>
                  </div>
                  <div className="space-y-1">
                    {tbl.columns.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between text-[11px] text-slate-400"
                      >
                        <span>{c.name}</span>
                        <span className="font-mono text-[10px] text-slate-600">
                          {c.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
