import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QuizResultRecord } from '../types';

interface LearningState {
  completedLessonIds: string[];
  quizScores: Record<string, QuizResultRecord>;
  streakDays: number;
  lastActiveDate: string;
  activeTrackId: string | null;
  activeDomain: 'react' | 'nextjs';

  // Actions
  markLessonCompleted: (lessonId: string) => void;
  saveQuizResult: (lessonId: string, result: QuizResultRecord) => void;
  setActiveTrack: (trackId: string | null) => void;
  setActiveDomain: (domain: 'react' | 'nextjs') => void;
  recordDailyActivity: () => void;
  resetProgress: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      completedLessonIds: [],
      quizScores: {},
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      activeTrackId: 'track-react-19',
      activeDomain: 'react',

      markLessonCompleted: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
        })),

      saveQuizResult: (lessonId, result) => {
        set((state) => ({
          quizScores: {
            ...state.quizScores,
            [lessonId]: result,
          },
          completedLessonIds:
            result.passed && !state.completedLessonIds.includes(lessonId)
              ? [...state.completedLessonIds, lessonId]
              : state.completedLessonIds,
        }));
        get().recordDailyActivity();
      },

      setActiveTrack: (trackId) => set({ activeTrackId: trackId }),
      setActiveDomain: (domain) => set({ activeDomain: domain }),

      recordDailyActivity: () => {
        const today = new Date().toISOString().split('T')[0];
        const last = get().lastActiveDate;

        if (last === today) return;

        const lastDate = new Date(last);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          set((state) => ({
            streakDays: state.streakDays + 1,
            lastActiveDate: today,
          }));
        } else {
          set({
            streakDays: 1,
            lastActiveDate: today,
          });
        }
      },

      resetProgress: () =>
        set({
          completedLessonIds: [],
          quizScores: {},
          streakDays: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
        }),
    }),
    {
      name: 'nextpro-learning-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
