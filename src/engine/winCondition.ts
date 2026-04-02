import { produce } from 'immer';
import type { GameState, PlayerId } from '../types/game.types';

export function computeLocationWinners(state: GameState): GameState {
  return produce(state, (draft) => {
    for (const loc of draft.locations) {
      const p = loc.powerTotals.player;
      const a = loc.powerTotals.ai;
      if (p > a) loc.winner = 'player';
      else if (a > p) loc.winner = 'ai';
      else loc.winner = 'tie';
    }
  });
}

export function computeGameWinner(state: GameState): PlayerId | 'tie' {
  let playerWins = 0;
  let aiWins = 0;
  for (const loc of state.locations) {
    if (loc.winner === 'player') playerWins++;
    else if (loc.winner === 'ai') aiWins++;
  }
  if (playerWins > aiWins) return 'player';
  if (aiWins > playerWins) return 'ai';
  // Tiebreaker: total power
  const playerTotal = state.locations.reduce((s, l) => s + l.powerTotals.player, 0);
  const aiTotal = state.locations.reduce((s, l) => s + l.powerTotals.ai, 0);
  if (playerTotal > aiTotal) return 'player';
  if (aiTotal > playerTotal) return 'ai';
  return 'tie';
}
