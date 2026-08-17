import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MockInterviewResult } from '../types';

interface InterviewStoreState {
  bookmarkedQuestionIds: string[];
  completedBugHuntIds: string[];
  mockSessionHistory: MockInterviewResult[];

  // Actions
  toggleBookmark: (id: string) => void;
  markBugHuntSolved: (id: string) => void;
  saveMockResult: (result: MockInterviewResult) => void;
  resetInterviewProgress: () => void;
}

export const useInterviewStore = create<InterviewStoreState>()(
  persist(
    (set) => ({
      bookmarkedQuestionIds: [],
      completedBugHuntIds: [],
      mockSessionHistory: [],

      toggleBookmark: (id) =>
        set((state) => ({
          bookmarkedQuestionIds: state.bookmarkedQuestionIds.includes(id)
            ? state.bookmarkedQuestionIds.filter((qId) => qId !== id)
            : [...state.bookmarkedQuestionIds, id],
        })),

      markBugHuntSolved: (id) =>
        set((state) => ({
          completedBugHuntIds: Array.from(new Set([...state.completedBugHuntIds, id])),
        })),

      saveMockResult: (result) =>
        set((state) => ({
          mockSessionHistory: [result, ...state.mockSessionHistory],
        })),

      resetInterviewProgress: () =>
        set({
          bookmarkedQuestionIds: [],
          completedBugHuntIds: [],
          mockSessionHistory: [],
        }),
    }),
    {
      name: 'nextpro-interview-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
