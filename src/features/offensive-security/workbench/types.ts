export type WorkbenchMode = 'terminal' | 'sql' | 'http' | 'packet';

// POSIX Virtual Filesystem (VFS) Types
export interface VfsFile {
  type: 'file';
  name: string;
  content: string;
  mode: number; // Octal permissions e.g. 0o644, 0o755, 0o4755 (SUID)
  owner: string;
  group: string;
  size?: number;
  mtime?: string;
}

export interface VfsDirectory {
  type: 'dir';
  name: string;
  mode: number; // Octal permissions e.g. 0o755, 0o700
  owner: string;
  group: string;
  children: Record<string, VfsNode>;
  mtime?: string;
}

export type VfsNode = VfsFile | VfsDirectory;

export interface VfsUserContext {
  uid: number;
  gid: number;
  username: string;
  groups: string[];
}

export interface VfsState {
  root: VfsDirectory;
  cwd: string;
  user: VfsUserContext;
  env: Record<string, string>;
  history: string[];
}

export interface TerminalExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  updatedState: VfsState;
}

// SQL Engine & AST Types
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

export interface SqlInjectedToken {
  token: string;
  type: 'base' | 'injected' | 'comment' | 'operator';
}

export interface SqlExecutionResult {
  success: boolean;
  queryExecuted: string;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  injectedTokens?: SqlInjectedToken[];
  vulnerabilityTriggered?: string;
}

// HTTP Repeater & Packet Decoder Types
export interface HttpHeader {
  key: string;
  value: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface HttpRequestState {
  method: HttpMethod;
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

export interface PacketHeaderField {
  name: string;
  value: string;
  description: string;
  hex?: string;
}

export interface PacketHeaderInfo {
  layer: 'Ethernet' | 'IPv4' | 'TCP' | 'Application';
  title: string;
  fields: PacketHeaderField[];
}

// Workbench Objectives & Config
export interface ObjectiveVerificationContext {
  vfs?: VfsState;
  lastCommand?: string;
  lastResult?: TerminalExecutionResult;
  sqlDb?: SqlDatabase;
  lastSqlResult?: SqlExecutionResult;
  lastHttpRes?: HttpResponseState;
  lastHttpReq?: HttpRequestState;
}

export interface WorkbenchObjective {
  id: string;
  title: string;
  description: string;
  hint?: string;
  isComplete: (context: ObjectiveVerificationContext) => boolean;
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
