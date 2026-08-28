'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ArenaChallengeCategory,
  ArenaSeverity,
  OperatorToolType,
  ArenaUserState,
  TargetBoxSession,
  TargetBoxStage,
} from '../types';
import { ARENA_CHALLENGES } from '../data/arena-challenges';
import { createTargetBoxVfs } from '../data/arena-box-factory';
import { executeBashCommand } from '../../workbench/engines/virtual-posix-engine';
import type { TerminalExecutionResult } from '../../workbench/types';

interface ArenaStoreState {
  // Navigation & Filtering
  selectedChallengeId: string;
  activeTool: OperatorToolType;
  selectedCategory: ArenaChallengeCategory | 'all';
  selectedSeverity: ArenaSeverity | 'all';
  searchQuery: string;

  // Modals & Writeup State
  activeWriteupModalChallengeId: string | null;

  // Target Box Interactive Sessions (In-Memory POSIX VFS states per challenge)
  targetBoxSessions: Record<string, TargetBoxSession>;
  pendingShellNotification: {
    challengeId: string;
    user: string;
    host: string;
    port: number;
    message: string;
  } | null;

  // Persisted User Progress State
  userState: ArenaUserState;

  // Actions
  selectChallenge: (challengeId: string) => void;
  setActiveTool: (tool: OperatorToolType) => void;
  setCategory: (category: ArenaChallengeCategory | 'all') => void;
  setSeverity: (severity: ArenaSeverity | 'all') => void;
  setSearchQuery: (query: string) => void;
  openWriteupModal: (challengeId: string) => void;
  closeWriteupModal: () => void;

  // Target Box Operations
  getOrCreateTargetSession: (challengeId: string) => TargetBoxSession;
  executeTerminalCommand: (
    challengeId: string,
    command: string
  ) => TerminalExecutionResult;
  triggerFootholdExploit: (challengeId: string) => void;
  attachShellSession: (challengeId: string) => void;
  dismissShellNotification: () => void;

  submitFlag: (
    challengeId: string,
    flag: string
  ) => {
    isSuccess: boolean;
    flagType?: 'user' | 'root';
    message: string;
    bountyEarned: number;
    xpEarned: number;
  };

  resetProgress: () => void;
}

const INITIAL_USER_STATE: ArenaUserState = {
  solvedChallengeIds: [],
  unlockedWriteupIds: [],
  totalBounty: 0,
  totalXp: 0,
  flagsCapturedCount: 0,
  firstBloodsCount: 0,
  currentStreakDays: 1,
  lastSolvedAt: null,
  historySubmissions: [],
};

export const useArenaStore = create<ArenaStoreState>()(
  persist(
    (set, get) => ({
      selectedChallengeId: ARENA_CHALLENGES[0]?.id ?? 'cve-2023-4966-citrix-bleed',
      activeTool: 'repeater',
      selectedCategory: 'all',
      selectedSeverity: 'all',
      searchQuery: '',
      activeWriteupModalChallengeId: null,
      targetBoxSessions: {},
      pendingShellNotification: null,
      userState: INITIAL_USER_STATE,

      selectChallenge: (challengeId: string) => {
        const challenge = ARENA_CHALLENGES.find((c) => c.id === challengeId);
        // Ensure session is initialized
        get().getOrCreateTargetSession(challengeId);
        set({
          selectedChallengeId: challengeId,
          activeTool: challenge?.defaultTool ?? 'repeater',
        });
      },

      setActiveTool: (tool: OperatorToolType) => set({ activeTool: tool }),
      setCategory: (category) => set({ selectedCategory: category }),
      setSeverity: (severity) => set({ selectedSeverity: severity }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      openWriteupModal: (challengeId: string) =>
        set({ activeWriteupModalChallengeId: challengeId }),
      closeWriteupModal: () => set({ activeWriteupModalChallengeId: null }),

      getOrCreateTargetSession: (challengeId: string): TargetBoxSession => {
        const existing = get().targetBoxSessions[challengeId];
        if (existing) return existing;

        const challenge = ARENA_CHALLENGES.find((c) => c.id === challengeId);
        const vfs = createTargetBoxVfs(challengeId);
        const newSession: TargetBoxSession = {
          challengeId,
          stage: 'recon',
          currentHost: challenge?.targetHost ?? '10.0.4.10',
          vfsState: vfs,
          activeUser: 'operator',
          userFlagFound: false,
          rootFlagFound: false,
          userFlag: challenge?.userFlag ?? 'OS_0DAY{user_flag}',
          rootFlag:
            challenge?.rootFlag ?? challenge?.expectedFlag ?? 'OS_0DAY{root_flag}',
        };

        set((state) => ({
          targetBoxSessions: {
            ...state.targetBoxSessions,
            [challengeId]: newSession,
          },
        }));

        return newSession;
      },

      executeTerminalCommand: (
        challengeId: string,
        command: string
      ): TerminalExecutionResult => {
        const session = get().getOrCreateTargetSession(challengeId);
        const result = executeBashCommand(command, session.vfsState);

        // Check if command elevated to root
        let nextStage: TargetBoxStage = session.stage;
        const isRoot = result.updatedState.user.uid === 0;

        if (isRoot && session.stage !== 'pwned') {
          nextStage = 'privesc';
        }

        // Check if output contains user flag or root flag
        let userFlagFound = session.userFlagFound;
        let rootFlagFound = session.rootFlagFound;

        if (session.userFlag && result.stdout.includes(session.userFlag.trim())) {
          userFlagFound = true;
          if (nextStage === 'recon') nextStage = 'foothold';
        }

        if (session.rootFlag && result.stdout.includes(session.rootFlag.trim())) {
          rootFlagFound = true;
          nextStage = 'pwned';
        }

        const updatedSession: TargetBoxSession = {
          ...session,
          stage: nextStage,
          vfsState: result.updatedState,
          activeUser: result.updatedState.user.username,
          userFlagFound,
          rootFlagFound,
        };

        set((state) => ({
          targetBoxSessions: {
            ...state.targetBoxSessions,
            [challengeId]: updatedSession,
          },
        }));

        return result;
      },

      triggerFootholdExploit: (challengeId: string) => {
        const session = get().getOrCreateTargetSession(challengeId);
        const challenge = ARENA_CHALLENGES.find((c) => c.id === challengeId);

        // Switch VFS context to low-priv foothold (www-data or operator in /var/www/html)
        const updatedVfs = {
          ...session.vfsState,
          cwd: '/home/operator',
          user: {
            uid: 1000,
            gid: 1000,
            username: 'operator',
            groups: ['operator', 'users'],
          },
        };

        const updatedSession: TargetBoxSession = {
          ...session,
          stage: 'foothold',
          vfsState: updatedVfs,
          activeUser: 'operator',
          availableShellSession: {
            user: 'operator',
            host: challenge?.targetHost ?? '10.0.4.10',
            port: challenge?.targetPort ?? 443,
            cwd: '/home/operator',
          },
        };

        set((state) => ({
          targetBoxSessions: {
            ...state.targetBoxSessions,
            [challengeId]: updatedSession,
          },
          pendingShellNotification: {
            challengeId,
            user: 'operator',
            host: challenge?.targetHost ?? '10.0.4.10',
            port: challenge?.targetPort ?? 443,
            message: `[+] Exploit Succeeded! Incoming reverse shell session received from ${challenge?.targetHost}:${challenge?.targetPort}.`,
          },
        }));
      },

      attachShellSession: (_challengeId: string) => {
        set({
          activeTool: 'terminal',
          pendingShellNotification: null,
        });
      },

      dismissShellNotification: () => set({ pendingShellNotification: null }),

      submitFlag: (challengeId: string, rawFlag: string) => {
        const challenge = ARENA_CHALLENGES.find((c) => c.id === challengeId);
        if (!challenge) {
          return {
            isSuccess: false,
            message: 'Thử thách không tồn tại trong hệ thống.',
            bountyEarned: 0,
            xpEarned: 0,
          };
        }

        const cleanInput = rawFlag.trim();
        const expectedRoot = (challenge.rootFlag ?? challenge.expectedFlag).trim();
        const expectedUser = (challenge.userFlag ?? '').trim();
        const isAlreadySolved = get().userState.solvedChallengeIds.includes(challengeId);

        if (cleanInput === expectedRoot) {
          const bountyEarned = isAlreadySolved ? 0 : challenge.bountyReward;
          const xpEarned = isAlreadySolved ? 0 : challenge.xpReward;

          set((state) => {
            const newSolved = isAlreadySolved
              ? state.userState.solvedChallengeIds
              : [...state.userState.solvedChallengeIds, challengeId];

            const newUnlockedWriteups = state.userState.unlockedWriteupIds.includes(
              challengeId
            )
              ? state.userState.unlockedWriteupIds
              : [...state.userState.unlockedWriteupIds, challengeId];

            // Update session stage to pwned
            const currentSess = state.targetBoxSessions[challengeId];
            const updatedSessions = currentSess
              ? {
                  ...state.targetBoxSessions,
                  [challengeId]: {
                    ...currentSess,
                    stage: 'pwned' as TargetBoxStage,
                    rootFlagFound: true,
                  },
                }
              : state.targetBoxSessions;

            return {
              targetBoxSessions: updatedSessions,
              userState: {
                ...state.userState,
                solvedChallengeIds: newSolved,
                unlockedWriteupIds: newUnlockedWriteups,
                totalBounty: state.userState.totalBounty + bountyEarned,
                totalXp: state.userState.totalXp + xpEarned,
                flagsCapturedCount: isAlreadySolved
                  ? state.userState.flagsCapturedCount
                  : state.userState.flagsCapturedCount + 1,
                lastSolvedAt: new Date().toISOString(),
                historySubmissions: [
                  {
                    challengeId,
                    flagSubmitted: cleanInput,
                    timestamp: new Date().toISOString(),
                    isSuccess: true,
                    bountyEarned,
                    xpEarned,
                  },
                  ...state.userState.historySubmissions,
                ],
              },
            };
          });

          return {
            isSuccess: true,
            flagType: 'root',
            message: isAlreadySolved
              ? 'Root Flag chính xác! Bạn đã kiểm soát cỗ máy này trước đó.'
              : `👑 FULL ROOT PWNED! Bạn đã chiếm quyền kiểm soát toàn bộ cỗ máy và nhận được $${bountyEarned.toLocaleString()} Bounty!`,
            bountyEarned,
            xpEarned,
          };
        } else if (expectedUser && cleanInput === expectedUser) {
          const userBounty = Math.round(challenge.bountyReward * 0.4);
          const userXp = Math.round(challenge.xpReward * 0.4);

          set((state) => {
            const currentSess = state.targetBoxSessions[challengeId];
            const updatedSessions = currentSess
              ? {
                  ...state.targetBoxSessions,
                  [challengeId]: {
                    ...currentSess,
                    userFlagFound: true,
                    stage: (currentSess.stage === 'recon'
                      ? 'foothold'
                      : currentSess.stage) as TargetBoxStage,
                  },
                }
              : state.targetBoxSessions;

            return {
              targetBoxSessions: updatedSessions,
              userState: {
                ...state.userState,
                totalBounty: state.userState.totalBounty + userBounty,
                totalXp: state.userState.totalXp + userXp,
                flagsCapturedCount: state.userState.flagsCapturedCount + 1,
                historySubmissions: [
                  {
                    challengeId,
                    flagSubmitted: cleanInput,
                    timestamp: new Date().toISOString(),
                    isSuccess: true,
                    bountyEarned: userBounty,
                    xpEarned: userXp,
                  },
                  ...state.userState.historySubmissions,
                ],
              },
            };
          });

          return {
            isSuccess: true,
            flagType: 'user',
            message: `🎯 USER FOOTHOLD ĐÃ XÁC NHẬN! Bạn nhận được $${userBounty.toLocaleString()} Bounty (+${userXp} XP). Hãy tiếp tục khảo sát nội bộ để leo quyền lên ROOT!`,
            bountyEarned: userBounty,
            xpEarned: userXp,
          };
        } else {
          set((state) => ({
            userState: {
              ...state.userState,
              historySubmissions: [
                {
                  challengeId,
                  flagSubmitted: cleanInput,
                  timestamp: new Date().toISOString(),
                  isSuccess: false,
                  bountyEarned: 0,
                  xpEarned: 0,
                },
                ...state.userState.historySubmissions,
              ],
            },
          }));

          return {
            isSuccess: false,
            message:
              'Flag không chính xác! Hãy kiểm tra lại tệp cờ trích xuất trong máy ảo.',
            bountyEarned: 0,
            xpEarned: 0,
          };
        }
      },

      resetProgress: () => set({ userState: INITIAL_USER_STATE, targetBoxSessions: {} }),
    }),
    {
      name: 'offsec-arena-state-v1',
      partialize: (state) => ({ userState: state.userState }),
    }
  )
);
