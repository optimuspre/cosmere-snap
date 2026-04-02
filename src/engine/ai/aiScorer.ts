import type { GameState } from '../../types/game.types';
import type { CardInstance } from '../../types/card.types';
import { CARD_REGISTRY } from '../../data/cards';

export function scorePlay(
  state: GameState,
  card: CardInstance,
  locationIndex: number
): number {
  const def = CARD_REGISTRY.get(card.definitionId);
  if (!def) return 0;

  let score = def.basePower;

  const loc = state.locations[locationIndex];
  const aiPower = loc.powerTotals.ai;
  const playerPower = loc.powerTotals.player;

  // Pressure: prefer locations where AI is behind
  if (aiPower < playerPower) score += 3;
  else if (aiPower > playerPower + 5) score -= 1; // don't overstack won locations

  // Synergy bonuses
  score += synergiesBonus(state, card, locationIndex);

  return score;
}

function synergiesBonus(state: GameState, card: CardInstance, locationIndex: number): number {
  const def = CARD_REGISTRY.get(card.definitionId);
  if (!def) return 0;

  const loc = state.locations[locationIndex];
  const aiCards = loc.cards.ai;

  // Syl: bonus if Kaladin is already here
  if (def.id === 'syl') {
    if (aiCards.some((c) => c.definitionId === 'kaladin_stormblessed')) return 3;
  }
  // Elend: bonus if Vin is here
  if (def.id === 'elend_venture') {
    if (aiCards.some((c) => c.definitionId === 'vin')) return 2;
  }
  // Galladon: bonus if Raoden is here
  if (def.id === 'galladon') {
    if (aiCards.some((c) => c.definitionId === 'raoden')) return 2;
  }

  return 0;
}
