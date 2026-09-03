import type { FileSystemTree } from '@webcontainer/api';

export type WebContainerStatus =
  | 'idle'
  | 'checking'
  | 'booting'
  | 'mounting'
  | 'installing'
  | 'starting'
  | 'ready'
  | 'error'
  | 'unsupported';

export type WebContainerUnsupportedReason =
  'MISSING_HEADERS' | 'UNSUPPORTED_BROWSER' | 'SERVER_UNSUPPORTED';

export interface WebContainerGuardResult {
  supported: boolean;
  reason?: WebContainerUnsupportedReason;
  message?: string;
}

export interface WebContainerServerInfo {
  port: number;
  url: string;
}

export interface WebContainerBootOptions {
  files?: FileSystemTree;
  autoStartDevServer?: boolean;
  devServerCommand?: string[];
}
