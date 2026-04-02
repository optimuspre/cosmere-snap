import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState } from '../types/game.types';
import { getInitializedGame, revealTurn, endTurn } from '../engine/gameLoop';
import { addPendingPlay, removePendingPlay } from '../engine/cardPlacement';
import { runAiTurn } from '../engine/ai/aiPlayer';

interface GameStore {
  gameState: GameState;
  revealedOpponentHand: boolean;
  initGame: () => void;
  playCard: (cardInstanceId: string, locationIndex: number) => void;
  removePlay: (cardInstanceId: string) => void;
  endPlayerTurn: () => void;
  runRevealAndEndTurn: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    gameState: getInitializedGame(),
    revealedOpponentHand: false,

    initGame: () => {
      set((draft) => {
        draft.gameState = getInitializedGame();
        draft.revealedOpponentHand = false;
      });
    },

    playCard: (cardInstanceId, locationIndex) => {
      set((draft) => {
        draft.gameState = addPendingPlay(draft.gameState, cardInstanceId, locationIndex, 'player');
      });
    },

    removePlay: (cardInstanceId) => {
      set((draft) => {
        draft.gameState = removePendingPlay(draft.gameState, cardInstanceId, 'player');
      });
    },

    endPlayerTurn: () => {
      set((draft) => {
        draft.gameState.phase = 'ai_thinking';
      });
      // AI runs asynchronously via useAITurn hook
    },

    runRevealAndEndTurn: () => {
      set((draft) => {
        let s = runAiTurn(draft.gameState);
        s = revealTurn(s);

        // Check for Khriss/Sarene log events to show opponent hand
        const hasReveal = s.eventLog.some(
          (e) => e.message.includes("opponent's hand") && e.turn === s.turn
        );
        if (hasReveal) draft.revealedOpponentHand = true;

        s = endTurn(s);
        draft.gameState = s;
      });
    },

    resetGame: () => {
      set((draft) => {
        draft.gameState = getInitializedGame();
        draft.revealedOpponentHand = false;
      });
    },
  }))
);
