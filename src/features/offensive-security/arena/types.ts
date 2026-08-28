import type { VfsState } from '../workbench/types';

export type ArenaChallengeCategory =
  'cve-labs' | 'bug-bounty' | 'zero-day' | 'active-directory';

export type ArenaSeverity = 'critical' | 'high' | 'medium';

export type OperatorToolType = 'repeater' | 'terminal' | 'diff' | 'memory';

export type TargetBoxStage = 'recon' | 'foothold' | 'privesc' | 'pwned';

export interface CodeDiffFile {
  filename: string;
  language: string;
  vulnerableCode: string;
  patchedCode: string;
  vulnerableLineStart: number;
  vulnerableLineEnd: number;
  rootCauseExplanation: string;
  taintSink: string;
}

export interface MemoryDumpConfig {
  baseAddress: string;
  regionName: string;
  rawHexLines: Array<{
    offset: string;
    hex: string;
    ascii: string;
    isSecretOffset?: boolean;
    tag?: string;
  }>;
  secretPayload: string;
  hint: string;
}

export interface HttpRepeaterConfig {
  defaultMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  defaultUrl: string;
  defaultRawHeaders: string;
  defaultBody: string;
  targetEndpoint: string;
  vulnerableEndpointPattern?: string;
  simulatedResponses: {
    baseResponse: {
      statusCode: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
    };
    exploitedResponse: {
      statusCode: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
      proofFlag: string;
    };
  };
}

export interface ArenaTerminalPreset {
  hostname: string;
  ip: string;
  user: string;
  initialDirectory: string;
  sampleCommands: string[];
  bannerText: string;
}

export interface ArenaWriteup {
  title: string;
  vulnerabilityOverview: string;
  rootCauseAnalysis: string;
  exploitChainWalkthrough: string[];
  weaponizedPoC: string;
  remediationSnippet: string;
  cvssVector: string;
}

export interface HintLadderItem {
  level: 0 | 1 | 2 | 3;
  name: string;
  penaltyPercent: number; // 0%, 10%, 20%, 40%
  hintText: string;
  isUnlocked?: boolean;
}

export interface ArenaChallenge {
  id: string;
  title: string;
  cveCode?: string;
  category: ArenaChallengeCategory;
  severity: ArenaSeverity;
  cvssScore: number;
  bountyReward: number; // in USD $
  xpReward: number;
  estimatedMinutes: number;
  targetHost: string;
  targetPort: number;
  tagline: string;
  scenarioBriefing: string;
  keyObjectives: string[];
  expectedFlag: string; // Defaults to root flag or main proof
  userFlag?: string; // Low-priv user flag
  rootFlag?: string; // Root takeover flag
  hints?: HintLadderItem[];
  firstBloodHolder: {
    handle: string;
    timeRecord: string;
  };
  supportedTools: OperatorToolType[];
  defaultTool: OperatorToolType;
  repeaterConfig?: HttpRepeaterConfig;
  diffConfig?: CodeDiffFile;
  memoryConfig?: MemoryDumpConfig;
  terminalConfig?: ArenaTerminalPreset;
  writeup: ArenaWriteup;
}

export interface TargetBoxSession {
  challengeId: string;
  stage: TargetBoxStage;
  currentHost: string;
  vfsState: VfsState;
  activeUser: string;
  userFlagFound: boolean;
  rootFlagFound: boolean;
  userFlag: string;
  rootFlag: string;
  availableShellSession?: {
    user: string;
    host: string;
    port: number;
    cwd: string;
  };
}

export interface ArenaRival {
  id: string;
  rank: number;
  handle: string;
  avatarText: string;
  avatarBg: string;
  title: string;
  categorySpecialty: string;
  solvedCount: number;
  firstBloods: number;
  totalBounty: number;
  totalXp: number;
  badge: string;
}

export interface LiveActivityFeedItem {
  id: string;
  timestampMinutesAgo: number;
  rivalHandle: string;
  challengeTitle: string;
  bountyWon: number;
  isFirstBlood?: boolean;
}

export interface ArenaUserState {
  solvedChallengeIds: string[];
  unlockedWriteupIds: string[];
  totalBounty: number;
  totalXp: number;
  flagsCapturedCount: number;
  firstBloodsCount: number;
  currentStreakDays: number;
  lastSolvedAt: string | null;
  historySubmissions: Array<{
    challengeId: string;
    flagSubmitted: string;
    timestamp: string;
    isSuccess: boolean;
    bountyEarned: number;
    xpEarned: number;
  }>;
}
