import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState } from '../types/game.types';
import type { World } from '../types/card.types';
import { getInitializedGame, revealTurn, endTurn } from '../engine/gameLoop';
import { addPendingPlay, removePendingPlay } from '../engine/cardPlacement';
import { applyPatches } from '../engine/patchApplier';
import { runAiTurn } from '../engine/ai/aiPlayer';

const ALL_WORLDS: World[] = ['roshar', 'scadrial-era1', 'scadrial-era2', 'nalthis', 'sel', 'cosmere-wide'];

interface GameStore {
  gameState: GameState;
  gameStarted: boolean;
  selectedWorlds: World[];
  revealedOpponentHand: boolean;
  startGame: (worlds: World[]) => void;
  playCard: (cardInstanceId: string, locationIndex: number) => void;
  removePlay: (cardInstanceId: string) => void;
  endPlayerTurn: () => void;
  runRevealAndEndTurn: () => void;
  resolveCardTarget: (targetInstanceId: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    gameState: getInitializedGame(),
    gameStarted: false,
    selectedWorlds: ALL_WORLDS,
    revealedOpponentHand: false,

    startGame: (worlds) => {
      set((draft) => {
        draft.selectedWorlds = worlds;
        draft.gameState = getInitializedGame(worlds);
        draft.gameStarted = true;
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

        // If a card-target ability is waiting for player input, pause before endTurn
        if (s.pendingTargetSelection?.type === 'card' && s.pendingTargetSelection.playerId === 'player') {
          draft.gameState = s;
          return;
        }

        s = endTurn(s);
        draft.gameState = s;
      });
    },

    resolveCardTarget: (targetInstanceId: string) => {
      set((draft) => {
        const pending = draft.gameState.pendingTargetSelection;
        if (!pending || pending.type !== 'card') return;

        let s = draft.gameState as GameState;
        if (pending.abilityKey === 'cultivation_on_reveal') {
          s = applyPatches(s, [{ type: 'modify_power', targetInstanceId, amount: 3, isPermanent: true }]);
          s = applyPatches(s, [{ type: 'log_event', event: { turn: s.turn, type: 'ability_triggered', message: `✨ Cultivation: gave +3 permanent power to a friendly card` } }]);
        }
        s = { ...s, pendingTargetSelection: null };
        s = endTurn(s);
        draft.gameState = s;
      });
    },

    resetGame: () => {
      set((draft) => {
        draft.gameState = getInitializedGame(draft.selectedWorlds);
        draft.revealedOpponentHand = false;
      });
    },
  }))
);
