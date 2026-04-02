import { produce } from 'immer';
import type { GameState } from '../../types/game.types';
import { computeAiPlays } from './aiGreedy';

export function runAiTurn(state: GameState): GameState {
  const plays = computeAiPlays(state);
  return produce(state, (draft) => {
    draft.players.ai.pendingPlays = plays;
  });
}
