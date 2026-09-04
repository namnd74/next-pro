import type { AttackActionPayload, TelemetryRecord } from './types';
import { generateTelemetryFromAttack } from './host-telemetry-adapter';

type TelemetryListener = (record: TelemetryRecord) => void;

class RuntimeTelemetryBus {
  private listeners: Set<TelemetryListener> = new Set();
  private history: TelemetryRecord[] = [];
  private unreadCount: number = 0;
  private readonly MAX_HISTORY = 150;

  constructor() {
    // Seed with 2 initial baseline enterprise telemetry events
    this.seedInitialBaseline();
  }

  private seedInitialBaseline() {
    const now = new Date(Date.now() - 15000).toISOString();
    this.history = [
      {
        id: 'init-auditd-1',
        timestamp: now,
        source: 'auditd',
        severity: 'informational',
        host: 'web01.corp.internal',
        processName: '/usr/sbin/sshd',
        commandLine: 'sshd: operator [priv]',
        user: 'operator',
        mitre: {
          tactic: 'Initial Access',
          tacticId: 'TA0001',
          techniqueId: 'T1078.003',
          techniqueName: 'Valid Accounts: Local Accounts',
        },
        rawLog: `type=USER_LOGIN msg=audit(${Math.floor(Date.now() / 1000) - 15}.012:101): pid=1204 uid=0 auid=1000 ses=2 msg='op=login acct="operator" exe="/usr/sbin/sshd" hostname=10.0.4.15 addr=10.0.4.15 terminal=pts/0 res=success'`,
        parsedFields: {
          action: 'USER_LOGIN',
          account: 'operator',
          remote_ip: '10.0.4.15',
          result: 'success',
        },
      },
    ];
  }

  public publishAttack(payload: AttackActionPayload): TelemetryRecord[] {
    const newRecords = generateTelemetryFromAttack(payload);

    for (const record of newRecords) {
      this.history.unshift(record);
      this.unreadCount++;

      if (this.history.length > this.MAX_HISTORY) {
        this.history.pop();
      }

      this.notifyListeners(record);
    }

    return newRecords;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(record: TelemetryRecord) {
    this.listeners.forEach((listener) => {
      try {
        listener(record);
      } catch (err) {
        console.error('Error notifying telemetry listener:', err);
      }
    });
  }

  public getHistory(): TelemetryRecord[] {
    return [...this.history];
  }

  public getUnreadCount(): number {
    return this.unreadCount;
  }

  public markAllRead(): void {
    this.unreadCount = 0;
  }

  public clearHistory(): void {
    this.history = [];
    this.unreadCount = 0;
  }
}

// Global Singleton Instance for client runtime
export const telemetryBus = new RuntimeTelemetryBus();
