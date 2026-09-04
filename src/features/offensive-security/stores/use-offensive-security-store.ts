import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LastVisitedLesson {
  trackSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  title: string;
  updatedAt: number;
}

interface OffensiveSecurityState {
  /** Academy lesson IDs completed after passing decision lab + quiz or objectives */
  completedAcademyLessonIds: string[];
  /** Last visited lesson for Smart Resume Banner */
  lastVisitedLesson?: LastVisitedLesson;

  // Actions
  completeAcademyLesson: (lessonId: string) => void;
  setLastVisitedLesson: (lesson: Omit<LastVisitedLesson, 'updatedAt'>) => void;
  resetOffensiveSecurityProgress: () => void;
}

export const useOffensiveSecurityStore = create<OffensiveSecurityState>()(
  persist(
    (set) => ({
      completedAcademyLessonIds: [],
      lastVisitedLesson: undefined,

      completeAcademyLesson: (lessonId) =>
        set((state) => ({
          completedAcademyLessonIds: state.completedAcademyLessonIds.includes(lessonId)
            ? state.completedAcademyLessonIds
            : [...state.completedAcademyLessonIds, lessonId],
        })),

      setLastVisitedLesson: (lesson) =>
        set({
          lastVisitedLesson: {
            ...lesson,
            updatedAt: Date.now(),
          },
        }),

      resetOffensiveSecurityProgress: () =>
        set({
          completedAcademyLessonIds: [],
          lastVisitedLesson: undefined,
        }),
    }),
    {
      name: 'nextpro-offensive-security-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
