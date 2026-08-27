export type WorkbenchMode = 'terminal' | 'sql' | 'http' | 'packet';

export interface VfsFile {
  type: 'file';
  name: string;
  content: string;
  mode: number; // e.g. 0o644, 0o755, 0o4755 (SUID)
  owner: string;
  group: string;
  size?: number;
  mtime?: string;
}

export interface VfsDirectory {
  type: 'dir';
  name: string;
  mode: number; // e.g. 0o755
  owner: string;
  group: string;
  children: Record<string, VfsNode>;
  mtime?: string;
}

export type VfsNode = VfsFile | VfsDirectory;

export interface VfsState {
  root: VfsDirectory;
  cwd: string;
  user: {
    uid: number;
    gid: number;
    username: string;
    groups: string[];
  };
  env: Record<string, string>;
  history: string[];
}

export interface TerminalExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  updatedState: VfsState;
}

export interface SqlColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface SqlTable {
  name: string;
  columns: SqlColumn[];
  rows: Array<Record<string, unknown>>;
}

export interface SqlDatabase {
  tables: Record<string, SqlTable>;
}

export interface SqlExecutionResult {
  success: boolean;
  queryExecuted: string;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  injectedTokens?: Array<{
    token: string;
    type: 'base' | 'injected' | 'comment' | 'operator';
  }>;
  vulnerabilityTriggered?: string;
}

export interface HttpHeader {
  key: string;
  value: string;
}

export interface HttpRequestState {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  url: string;
  headers: HttpHeader[];
  rawHeaders: string;
  body: string;
}

export interface HttpResponseState {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  durationMs: number;
}

export interface PacketHeaderInfo {
  layer: 'Ethernet' | 'IPv4' | 'TCP' | 'Application';
  title: string;
  fields: Array<{ name: string; value: string; description: string; hex?: string }>;
}

export interface WorkbenchObjective {
  id: string;
  title: string;
  description: string;
  hint?: string;
  isComplete: (context: {
    vfs?: VfsState;
    lastCommand?: string;
    lastResult?: TerminalExecutionResult;
    sqlDb?: SqlDatabase;
    lastSqlResult?: SqlExecutionResult;
    lastHttpRes?: HttpResponseState;
    lastHttpReq?: HttpRequestState;
  }) => boolean;
}

export interface WorkbenchConfig {
  id: string;
  lessonId: string;
  title: string;
  summary: string;
  mode: WorkbenchMode;
  availableModes?: WorkbenchMode[];
  instructions: string[];
  initialVfs?: VfsDirectory;
  initialSqlDb?: SqlDatabase;
  initialHttpRequest?: HttpRequestState;
  sampleCommands?: string[];
  samplePayloads?: string[];
  objectives: WorkbenchObjective[];
}
