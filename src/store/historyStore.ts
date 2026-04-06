import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { World } from '../types/card.types';

export interface GameResult {
  id: string;
  date: string;
  result: 'win' | 'loss' | 'tie';
  worlds: World[];
  turn: number;
}

interface HistoryStore {
  results: GameResult[];
  addResult: (r: Omit<GameResult, 'id' | 'date'>) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      results: [],
      addResult: (r) =>
        set((s) => ({
          results: [
            { ...r, id: Date.now().toString(), date: new Date().toISOString() },
            ...s.results,
          ],
        })),
      clearHistory: () => set({ results: [] }),
    }),
    { name: 'cosmere-clash-history' }
  )
);
