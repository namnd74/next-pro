/**
 * ============================================================================
 * OFFENSIVE SECURITY ACADEMY - HEADLESS COMPETENCY SESSION CONTROLLER (v3.0)
 * ============================================================================
 * Decoupled state machine managing the competency session lifecycle
 * completely outside React components for strict, deterministic testing.
 *
 * Implements:
 * IDLE -> INITIALIZING_RUNTIME -> CAPABILITY_ACTIVE -> EVIDENCE_CAPTURED
 *      -> REMEDIATION_PENDING -> REPLAY_VERIFICATION -> PRACTICE_COMPLETED
 */

import type { CompetencyContract, ReplayResult } from '../types/contract';
import {
  type EvidenceEnvelope,
  type EvidenceEvent,
  computeIntegrityDigest,
} from '../types/evidence';

export type SessionState =
  | 'IDLE'
  | 'INITIALIZING_RUNTIME'
  | 'CAPABILITY_ACTIVE'
  | 'EVIDENCE_CAPTURED'
  | 'REMEDIATION_PENDING'
  | 'REPLAY_VERIFICATION'
  | 'PRACTICE_COMPLETED'
  | 'ATTEMPT_FAILED';

export class CompetencySessionController<TState = unknown> {
  private contract: CompetencyContract<TState>;
  private state: SessionState = 'IDLE';
  private eventLog: EvidenceEvent[] = [];
  private deterministicSeed: string;
  private remediationResult?: ReplayResult;

  constructor(contract: CompetencyContract<TState>, seed?: string) {
    this.contract = contract;
    this.deterministicSeed =
      seed || `seed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  public getState(): SessionState {
    return this.state;
  }

  public getEventLog(): ReadonlyArray<EvidenceEvent> {
    return this.eventLog;
  }

  public startSession(): void {
    if (this.state !== 'IDLE') {
      throw new Error(`Cannot start session from state: ${this.state}`);
    }
    this.state = 'INITIALIZING_RUNTIME';
    this.recordEvent(
      'SESSION_INITIALIZED',
      undefined,
      `Runtime: ${this.contract.runtimeMode}`
    );
    this.state = 'CAPABILITY_ACTIVE';
  }

  public recordEvent(
    action: string,
    target?: string,
    outputSnippet?: string,
    stateDigest?: string
  ): void {
    this.eventLog.push({
      timestamp: Date.now(),
      action,
      target,
      outputSnippet: outputSnippet?.slice(0, 300),
      stateDigest,
    });
  }

  /**
   * Evaluates the primary capability against the contract predicate.
   */
  public async evaluateCapability(currentState: TState): Promise<boolean> {
    if (this.state !== 'CAPABILITY_ACTIVE') {
      return false;
    }

    // Check prohibited shortcuts (anti-cheat)
    if (this.contract.prohibitedShortcuts) {
      const actions = this.eventLog.map((e) => e.action);
      for (const shortcut of this.contract.prohibitedShortcuts) {
        if (shortcut.test(currentState, actions)) {
          this.recordEvent(
            'PROHIBITED_SHORTCUT_TRIGGERED',
            undefined,
            shortcut.description
          );
          this.state = 'ATTEMPT_FAILED';
          return false;
        }
      }
    }

    const actions = this.eventLog.map((e) => e.action);
    const passed = await Promise.resolve(
      this.contract.capabilityPredicate(currentState, actions)
    );

    if (passed) {
      this.recordEvent('CAPABILITY_EVALUATED_PASS');
      this.state = this.contract.remediationCheck
        ? 'REMEDIATION_PENDING'
        : 'EVIDENCE_CAPTURED';
      return true;
    }

    return false;
  }

  /**
   * Executes remediation replay to ensure vulnerability is patched without regressions.
   */
  public async verifyRemediation(patchedState: TState): Promise<ReplayResult> {
    if (this.state !== 'REMEDIATION_PENDING') {
      throw new Error(`Cannot verify remediation from state: ${this.state}`);
    }

    if (!this.contract.remediationCheck) {
      return {
        blocked: true,
        details: 'No remediation replay declared for this capability.',
      };
    }

    this.state = 'REPLAY_VERIFICATION';
    this.recordEvent('REMEDIATION_REPLAY_STARTED');

    const result = await this.contract.remediationCheck.replayAction(patchedState);
    this.remediationResult = result;

    if (result.blocked) {
      // Replay was blocked successfully -> Vulnerability mitigated!
      // Check negative assertions (availability)
      let negativePassed = true;
      for (const neg of this.contract.negativeAssertions) {
        const passed = await Promise.resolve(neg.test(patchedState));
        if (!passed) {
          negativePassed = false;
          this.recordEvent('NEGATIVE_ASSERTION_FAILED', undefined, neg.description);
          break;
        }
      }

      if (negativePassed) {
        this.recordEvent('REPLAY_VERIFIED_PASS', undefined, result.details);
        this.state = 'EVIDENCE_CAPTURED';
      } else {
        this.state = 'ATTEMPT_FAILED';
      }
    } else {
      this.recordEvent('REPLAY_FAILED_REGRESSION', undefined, result.details);
      this.state = 'REMEDIATION_PENDING';
    }

    return result;
  }

  /**
   * Packages the session into a canonical EvidenceEnvelope with Web Crypto SHA-256 digest.
   */
  public async exportEvidenceEnvelope(): Promise<EvidenceEnvelope> {
    if (this.state === 'EVIDENCE_CAPTURED') {
      this.state = 'PRACTICE_COMPLETED';
    }

    // Deterministic payload excludes wall-clock milliseconds to ensure reproducible replay verification
    const payloadToHash = JSON.stringify({
      lessonId: this.contract.lessonId,
      seed: this.deterministicSeed,
      events: this.eventLog.map(
        (e, idx) => `${idx}:${e.action}:${e.target || ''}:${e.stateDigest || ''}`
      ),
    });

    const localIntegrityDigest = await computeIntegrityDigest(payloadToHash);

    return {
      schemaVersion: 'v3.0',
      lessonId: this.contract.lessonId,
      contractVersion: this.contract.contractVersion,
      deterministicSeed: this.deterministicSeed,
      timestamp: Date.now(),
      runtimeMode: this.contract.runtimeMode,
      eventLog: [...this.eventLog],
      localIntegrityDigest,
      integrityDigest: localIntegrityDigest,
      remediationResult: this.remediationResult
        ? {
            replayedAt: Date.now(),
            blocked: this.remediationResult.blocked,
            details: this.remediationResult.details,
          }
        : undefined,
      completionStatus:
        this.state === 'PRACTICE_COMPLETED' ? 'PRACTICE_COMPLETED' : 'ATTEMPT_FAILED',
    };
  }
}
