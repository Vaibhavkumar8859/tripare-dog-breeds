import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllBreeds, fetchGroups, withRetry } from '../api/dogApi';
import type { Breed, Group } from '../api/types';

interface BreedState {
  breeds: Breed[];
  groups: Group[];
  lastSynced: number | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;

  loadBreeds: (force?: boolean) => Promise<void>;
  setOnline: (online: boolean) => void;
  clearError: () => void;
}

export const useBreedStore = create<BreedState>()(
  persist(
    (set, get) => ({
      breeds: [],
      groups: [],
      lastSynced: null,
      isLoading: false,
      error: null,
      isOnline: true,

      setOnline: (online) => set({ isOnline: online }),

      clearError: () => set({ error: null }),

      loadBreeds: async (force = false) => {
        const { breeds, isLoading } = get();
        // Skip if already loading or we have data and not forcing
        if (isLoading) return;
        if (breeds.length > 0 && !force) {
          // Background refresh if online
          if (get().isOnline) {
            try {
              const [freshBreeds, groups] = await Promise.all([
                withRetry(fetchAllBreeds),
                withRetry(fetchGroups),
              ]);
              set({
                breeds: freshBreeds,
                groups,
                lastSynced: Date.now(),
                error: null,
              });
            } catch {
              // Silent background failure – keep cached data
            }
          }
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const [freshBreeds, groups] = await Promise.all([
            withRetry(fetchAllBreeds),
            withRetry(fetchGroups),
          ]);
          set({
            breeds: freshBreeds,
            groups,
            lastSynced: Date.now(),
            isLoading: false,
            error: null,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Failed to sync breeds';
          set({
            isLoading: false,
            error: message,
            // Keep any existing cached breeds
          });
        }
      },
    }),
    {
      name: 'dog-breeds-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        breeds: state.breeds,
        groups: state.groups,
        lastSynced: state.lastSynced,
      }),
    }
  )
);
