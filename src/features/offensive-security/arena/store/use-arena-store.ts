'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ArenaChallengeCategory,
  ArenaSeverity,
  OperatorToolType,
  ArenaUserState,
} from '../types';
import { ARENA_CHALLENGES } from '../data/arena-challenges';

interface ArenaStoreState {
  // Navigation & Filtering
  selectedChallengeId: string;
  activeTool: OperatorToolType;
  selectedCategory: ArenaChallengeCategory | 'all';
  selectedSeverity: ArenaSeverity | 'all';
  searchQuery: string;

  // Modals & Writeup State
  activeWriteupModalChallengeId: string | null;

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

  submitFlag: (
    challengeId: string,
    flag: string
  ) => {
    isSuccess: boolean;
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
      userState: INITIAL_USER_STATE,

      selectChallenge: (challengeId: string) => {
        const challenge = ARENA_CHALLENGES.find((c) => c.id === challengeId);
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
        const expected = challenge.expectedFlag.trim();
        const isAlreadySolved = get().userState.solvedChallengeIds.includes(challengeId);

        if (cleanInput === expected) {
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

            return {
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
            message: isAlreadySolved
              ? 'Flag chính xác! Bạn đã giải bài này trước đó.'
              : `CƯỚP CỜ THÀNH CÔNG! Bạn nhận được $${bountyEarned.toLocaleString()} Bounty và +${xpEarned} XP!`,
            bountyEarned,
            xpEarned,
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
            message: 'Flag không chính xác! Hãy kiểm tra lại kết quả trích xuất payload.',
            bountyEarned: 0,
            xpEarned: 0,
          };
        }
      },

      resetProgress: () => set({ userState: INITIAL_USER_STATE }),
    }),
    {
      name: 'offsec-arena-state-v1',
      partialize: (state) => ({ userState: state.userState }),
    }
  )
);
