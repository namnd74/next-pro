import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MockInterviewResult, InterviewQuestion } from '../types';

interface InterviewStoreState {
  bookmarkedQuestionIds: string[];
  completedBugHuntIds: string[];
  mockSessionHistory: MockInterviewResult[];
  customQuestions: InterviewQuestion[];

  // Actions
  toggleBookmark: (id: string) => void;
  markBugHuntSolved: (id: string) => void;
  saveMockResult: (result: MockInterviewResult) => void;
  addCustomQuestion: (question: InterviewQuestion) => void;
  importQuestionsFromJson: (questions: InterviewQuestion[]) => void;
  resetInterviewProgress: () => void;
}

export const useInterviewStore = create<InterviewStoreState>()(
  persist(
    (set) => ({
      bookmarkedQuestionIds: [],
      completedBugHuntIds: [],
      mockSessionHistory: [],
      customQuestions: [],

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

      addCustomQuestion: (question) =>
        set((state) => ({
          customQuestions: [question, ...state.customQuestions],
        })),

      importQuestionsFromJson: (questions) =>
        set((state) => {
          const existingIds = new Set(state.customQuestions.map((q) => q.id));
          const newUniqueQuestions = questions.filter((q) => !existingIds.has(q.id));
          return {
            customQuestions: [...newUniqueQuestions, ...state.customQuestions],
          };
        }),

      resetInterviewProgress: () =>
        set({
          bookmarkedQuestionIds: [],
          completedBugHuntIds: [],
          mockSessionHistory: [],
          customQuestions: [],
        }),
    }),
    {
      name: 'nextpro-interview-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
