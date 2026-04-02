import type { CardInstance } from '../types/card.types';
import type { PlayerId } from '../types/game.types';
import { ALL_CARDS, CARD_REGISTRY } from '../data/cards';
import { shuffle, pickNRandom } from '../utils/random';
import { generateId } from '../utils/idGenerator';
import { DECK_SIZE } from '../data/constants';

export function buildDeck(ownerId: PlayerId): CardInstance[] {
  const selected = pickNRandom(ALL_CARDS, DECK_SIZE);
  return shuffle(
    selected.map((def) => createCardInstance(def.id, ownerId))
  );
}

export function createCardInstance(definitionId: string, ownerId: PlayerId): CardInstance {
  const def = CARD_REGISTRY.get(definitionId);
  if (!def) throw new Error(`Unknown card definition: ${definitionId}`);
  return {
    instanceId: generateId('card'),
    definitionId,
    ownerId,
    currentPower: def.basePower,
    powerModifiers: [],
    locationIndex: null,
    isRevealed: false,
    isDestroyed: false,
    isImmune: false,
    statusEffects: [],
    turnsOnBoard: 0,
  };
}
