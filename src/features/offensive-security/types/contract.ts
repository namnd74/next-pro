/**
 * ============================================================================
 * OFFENSIVE SECURITY ACADEMY - COMPETENCY CONTRACT TYPES (v3.0)
 * ============================================================================
 * Strictly adheres to the AI Execution Constitution:
 * - Capability-neutral (no offensive-only bias)
 * - Explicit RuntimeMode (no generated mocks)
 * - Negative assertions & remediation replay verification
 */

export type RuntimeMode =
  | 'webcontainer-node' // Authoritative in-browser Node HTTP & Scripting execution
  | 'browser-demo' // Pure UI demonstration without execution claims
  | 'telemetry-inspector' // Structured log, pcap, or configuration viewer (CodeMirror/DOM)
  | 'decision-lab' // Policy, scoping, ROE, or architecture trade-off lab
  | 'local-container' // Future local Docker container
  | 'external-platform'; // External cyber range

export type CapabilityType =
  | 'classify' // Risk classification, ROE boundary determination
  | 'configure' // Hardening configuration, firewall/permission tuning
  | 'diagnose' // Packet trace analysis, log triage, anomaly detection
  | 'exploit' // Vulnerability exploitation (Web, Node, API)
  | 'investigate' // Digital forensics, attack path reconstruction
  | 'remediate' // Code patch authoring, parameterization, mitigation
  | 'author_report' // Technical pentest reporting, CVD disclosure
  | 'decide'; // Trade-off decision under operational constraints

export interface ReplayResult {
  blocked: boolean;
  details: string;
  telemetryEmitted?: string[];
}

export interface CompetencyContract<TState = unknown> {
  lessonId: string;
  contractVersion: 'v3.0';
  runtimeMode: RuntimeMode;
  capability: CapabilityType;
  title: string;
  description: string;

  /**
   * Action boundaries and anti-shortcut constraints
   */
  allowedActions?: string[];
  prohibitedShortcuts?: Array<{
    description: string;
    test: (state: TState, eventHistory: string[]) => boolean;
  }>;

  /**
   * Primary capability evaluation
   */
  capabilityPredicate: (
    state: TState,
    eventHistory: string[]
  ) => boolean | Promise<boolean>;

  /**
   * Remediation verification: replaying the exploit to guarantee the fix holds
   */
  remediationCheck?: {
    description: string;
    applyPatch?: (state: TState) => Promise<TState>;
    replayAction: (state: TState) => Promise<ReplayResult>;
  };

  /**
   * Negative assertions: ensuring availability and uncompromised baseline invariants
   */
  negativeAssertions: Array<{
    description: string;
    test: (state: TState) => boolean | Promise<boolean>;
  }>;
}
