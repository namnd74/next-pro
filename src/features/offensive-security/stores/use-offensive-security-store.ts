import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OffensiveSecurityState {
  /** Vector đã được "launch attack" (đã thấy hậu quả) */
  launchedVectorIds: string[];
  /** Vector đã được vá thành công bằng defense patch */
  patchedVectorIds: string[];
  /** Academy lesson chỉ hoàn thành sau khi pass decision lab + quiz */
  completedAcademyLessonIds: string[];

  // Actions
  launchVector: (vectorId: string) => void;
  patchVector: (vectorId: string) => void;
  completeAcademyLesson: (lessonId: string) => void;
  resetOffensiveSecurityProgress: () => void;
}

export const useOffensiveSecurityStore = create<OffensiveSecurityState>()(
  persist(
    (set) => ({
      launchedVectorIds: [],
      patchedVectorIds: [],
      completedAcademyLessonIds: [],

      launchVector: (vectorId) =>
        set((state) => ({
          launchedVectorIds: state.launchedVectorIds.includes(vectorId)
            ? state.launchedVectorIds
            : [...state.launchedVectorIds, vectorId],
        })),

      patchVector: (vectorId) =>
        set((state) => ({
          patchedVectorIds: state.patchedVectorIds.includes(vectorId)
            ? state.patchedVectorIds
            : [...state.patchedVectorIds, vectorId],
        })),

      completeAcademyLesson: (lessonId) =>
        set((state) => ({
          completedAcademyLessonIds: state.completedAcademyLessonIds.includes(lessonId)
            ? state.completedAcademyLessonIds
            : [...state.completedAcademyLessonIds, lessonId],
        })),

      resetOffensiveSecurityProgress: () =>
        set({
          launchedVectorIds: [],
          patchedVectorIds: [],
          completedAcademyLessonIds: [],
        }),
    }),
    {
      name: 'nextpro-offensive-security-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
