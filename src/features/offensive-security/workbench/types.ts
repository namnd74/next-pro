export type WorkbenchMode =
  | 'terminal'
  | 'sql'
  | 'http'
  | 'packet'
  | 'cyber-range'
  | 'telemetry'
  | 'telemetry-inspector'
  | 'decision-lab'
  | 'ad-graph'
  | 'memory-exploit';

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

// --- Cyber Range & Multi-Host Topology Types ---

export type HostRole =
  'attacker' | 'victim-web' | 'victim-db' | 'victim-dc' | 'gateway' | 'siem' | 'git';

export type HostCompromiseStatus =
  | 'unscanned' // Hidden in fog of war / Dimmed
  | 'discovered' // Alive / ICMP ping response
  | 'scanned' // Ports & services fingerprinted via Nmap
  | 'foothold' // User shell obtained (e.g. www-data)
  | 'compromised'; // Root / SYSTEM full takeover

export interface CyberRangeService {
  port: number;
  protocol: 'tcp' | 'udp';
  name: string;
  version: string;
  state: 'open' | 'closed' | 'filtered';
  banner?: string;
  vulns?: string[];
}

export interface CyberRangeHost {
  id: string;
  hostname: string;
  ip: string;
  mac: string;
  subnet: string;
  os: string;
  role: HostRole;
  status: HostCompromiseStatus;
  services: CyberRangeService[];
  vfsState: VfsState;
  activeUser: string;
  position: { x: number; y: number };
}

export interface TopologyLink {
  id: string;
  sourceHostId: string;
  targetHostId: string;
  trafficType?: 'scan' | 'http' | 'exploit' | 'idle';
  isPulsing?: boolean;
}

export type DualTerminalLayoutMode = 'split-horizontal' | 'split-vertical' | 'tabs';

export interface CyberTelemetryEvent {
  id: string;
  timestamp: string;
  sourceHostId: string;
  targetHostId?: string;
  sourceIp: string;
  targetIp?: string;
  type: 'recon' | 'traffic' | 'auth-failure' | 'foothold' | 'privesc' | 'alert';
  message: string;
  rawPayload?: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
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
  rangeHosts?: Record<string, CyberRangeHost>;
  activeHostId?: string;
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
  targetHost?: string;
  instructions: string[];
  initialVfs?: VfsDirectory;
  initialSqlDb?: SqlDatabase;
  initialHttpRequest?: HttpRequestState;
  initialHosts?: Record<string, CyberRangeHost>;
  sampleCommands?: string[];
  samplePayloads?: string[];
  objectives: WorkbenchObjective[];
}
