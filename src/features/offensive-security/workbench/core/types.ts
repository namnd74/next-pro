/**
 * Core Types for Offensive Security Academy Lab Runtimes & Scenarios.
 * Follows Interface Segregation Principle (ISP) and Clean Architecture.
 */

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  hostId: string;
}

export type RuntimeEventType =
  | 'PROCESS_EXEC'
  | 'NETWORK_CONN'
  | 'VFS_MUTATE'
  | 'AUTH_ATTEMPT'
  | 'SECRET_ACCESSED'
  | 'OBJECTIVE_SATISFIED';

export interface RuntimeEvent {
  id: string;
  type: RuntimeEventType;
  timestamp: number;
  hostId: string;
  payload: Record<string, unknown>;
}

export interface VirtualService {
  port: number;
  name: string;
  protocol: 'tcp' | 'udp';
  banner?: string;
  status: 'open' | 'filtered' | 'closed';
}

export interface VirtualHost {
  id: string;
  hostname: string;
  ip: string;
  os: 'linux' | 'windows' | 'network-device';
  services: VirtualService[];
  env?: Record<string, string>;
}

export interface RuntimeSnapshot {
  schemaVersion: number;
  lessonVersion?: string;
  timestamp: number;
  vfs?: unknown;
  hosts?: VirtualHost[];
  history?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Universal Interface for any Lab Runtime (POSIX Simulator, WebContainer, WASM, or x86).
 */
export interface LabRuntime {
  execute(command: string, hostId?: string): Promise<ExecutionResult>;
  reset(): Promise<void>;
  getState(): unknown;
  snapshot(): Promise<RuntimeSnapshot>;
  restore(snapshot: RuntimeSnapshot): Promise<void>;
}

export interface RuntimeEventSubscriber {
  (event: RuntimeEvent): void;
}
