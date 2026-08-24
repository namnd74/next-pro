import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RedTeamState {
  /** Vector đã được "launch attack" (đã thấy hậu quả) */
  launchedVectorIds: string[];
  /** Vector đã được vá thành công bằng defense patch */
  patchedVectorIds: string[];

  // Actions
  launchVector: (vectorId: string) => void;
  patchVector: (vectorId: string) => void;
  resetRedTeamProgress: () => void;
}

export const useRedTeamStore = create<RedTeamState>()(
  persist(
    (set) => ({
      launchedVectorIds: [],
      patchedVectorIds: [],

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

      resetRedTeamProgress: () =>
        set({
          launchedVectorIds: [],
          patchedVectorIds: [],
        }),
    }),
    {
      name: 'nextpro-red-team-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
