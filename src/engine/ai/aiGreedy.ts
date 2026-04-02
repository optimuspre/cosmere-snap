import type { GameState, PendingPlay } from '../../types/game.types';
import { canPlayCard, getCardCost } from '../cardPlacement';
import { scorePlay } from './aiScorer';

export function computeAiPlays(state: GameState): PendingPlay[] {
  const aiPlayer = state.players.ai;
  const hand = aiPlayer.hand;

  const candidates: Array<{ play: PendingPlay; score: number; cost: number }> = [];

  for (const card of hand) {
    for (let locIdx = 0; locIdx < 3; locIdx++) {
      if (!state.locations[locIdx].isRevealed) continue;
      const check = canPlayCard(state, card.instanceId, locIdx, 'ai');
      if (!check.valid) continue;
      const cost = getCardCost(state, card.instanceId, locIdx, 'ai');
      const score = scorePlay(state, card, locIdx);
      candidates.push({ play: { cardInstanceId: card.instanceId, locationIndex: locIdx }, score, cost });
    }
  }

  // Sort by score desc
  candidates.sort((a, b) => b.score - a.score);

  // Greedy knapsack: pick best plays within energy budget
  const chosen: PendingPlay[] = [];
  const usedCards = new Set<string>();
  let spent = 0;

  for (const { play, cost } of candidates) {
    if (usedCards.has(play.cardInstanceId)) continue;
    if (spent + cost <= aiPlayer.currentEnergy) {
      chosen.push(play);
      usedCards.add(play.cardInstanceId);
      spent += cost;
    }
  }

  return chosen;
}
