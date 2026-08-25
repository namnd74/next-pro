'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AiLearningState {
  completedLessonSlugs: string[];
  markLessonCompleted: (lessonSlug: string) => void;
  resetProgress: () => void;
}

export const useAiLearningStore = create<AiLearningState>()(
  persist(
    (set) => ({
      completedLessonSlugs: [],
      markLessonCompleted: (lessonSlug) =>
        set((state) => ({
          completedLessonSlugs: state.completedLessonSlugs.includes(lessonSlug)
            ? state.completedLessonSlugs
            : [...state.completedLessonSlugs, lessonSlug],
        })),
      resetProgress: () => set({ completedLessonSlugs: [] }),
    }),
    {
      name: 'nextpro-ai-learning-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
