/**
 * ============================================================================
 * OFFENSIVE SECURITY ACADEMY - EVIDENCE ENVELOPE (v3.0)
 * ============================================================================
 * Implements client-side integrity hashing via Web Crypto standard API.
 * Explicitly scoped as local learning progress (PRACTICE_COMPLETED),
 * never claiming server-side certification authority without an external reviewer.
 */

export interface EvidenceEvent {
  timestamp: number;
  action: string;
  target?: string;
  outputSnippet?: string;
  stateDigest?: string;
}

export interface EvidenceEnvelope {
  schemaVersion: 'v3.0';
  lessonId: string;
  contractVersion: 'v3.0';
  deterministicSeed: string;
  timestamp: number;
  runtimeMode: string;

  /**
   * Ordered trace of events during the attempt
   */
  eventLog: EvidenceEvent[];

  /**
   * Client-side SHA-256 integrity checksum computed across canonical JSON of (lessonId + seed + event sequence).
   * Explicitly scoped as local tamper-evidence; does not claim third-party certification authority.
   */
  localIntegrityDigest: string;
  integrityDigest?: string;

  /**
   * Result of remediation replay (if applicable to this capability)
   */
  remediationResult?: {
    replayedAt: number;
    blocked: boolean;
    details: string;
  };

  /**
   * Progress outcome: strictly local self-paced learning progress
   */
  completionStatus: 'PRACTICE_COMPLETED' | 'ATTEMPT_FAILED';
}

/**
 * Computes a SHA-256 integrity digest using standard Web Crypto API.
 * Never uses hand-rolled or custom cryptographic implementations.
 */
export async function computeIntegrityDigest(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for Node.js test environments without global crypto
  try {
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha256').update(data).digest('hex');
  } catch {
    throw new Error(
      'Standard Web Crypto API or node:crypto is required for integrity hashing.'
    );
  }
}
