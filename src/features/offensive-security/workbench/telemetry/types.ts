export type TelemetryEventSource =
  'auditd' | 'sysmon' | 'zeek' | 'suricata' | 'waf' | 'edr';

export type TelemetrySeverity = 'informational' | 'low' | 'medium' | 'high' | 'critical';

export interface MitreAttackMapping {
  tactic: string;
  tacticId: string;
  techniqueId: string;
  techniqueName: string;
  subTechnique?: string;
}

export interface SigmaRuleMatch {
  id: string;
  title: string;
  level: 'informational' | 'low' | 'medium' | 'high' | 'critical';
  status: 'experimental' | 'test' | 'stable';
  author: string;
  detectionYaml: string;
  remediationHint: string;
}

export interface TelemetryRecord {
  id: string;
  timestamp: string; // ISO 8601
  source: TelemetryEventSource;
  severity: TelemetrySeverity;
  host: string;
  processName?: string;
  commandLine?: string;
  user?: string;
  mitre: MitreAttackMapping;
  rawLog: string;
  parsedFields: Record<string, string | number | boolean>;
  sigmaRuleMatch?: SigmaRuleMatch;
}

export interface AttackActionPayload {
  mode: 'terminal' | 'sql' | 'http' | 'packet' | 'network';
  rawCommand?: string;
  host?: string;
  target?: string;
  user?: string;
  exitCode?: number;
  metadata?: Record<string, unknown>;
}
