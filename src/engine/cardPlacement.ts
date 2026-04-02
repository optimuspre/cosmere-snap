import { produce } from 'immer';
import type { GameState, PlayerId } from '../types/game.types';
import { CARD_REGISTRY } from '../data/cards';
import { LOCATION_REGISTRY } from '../data/locations';
import { DEFAULT_MAX_CARDS_PER_LOCATION } from '../data/constants';

export function getShadesmarCostReduction(state: GameState, locationIndex: number): number {
  const loc = state.locations[locationIndex];
  const locDef = LOCATION_REGISTRY.get(loc.definitionId);
  return locDef?.effectKey === 'cost_minus1' ? 1 : 0;
}

export function getCardCost(
  state: GameState,
  cardInstanceId: string,
  locationIndex: number,
  playerId: PlayerId
): number {
  const card = state.players[playerId].hand.find((c) => c.instanceId === cardInstanceId);
  if (!card) return 999;
  const def = CARD_REGISTRY.get(card.definitionId);
  if (!def) return 999;

  let cost = def.cost;
  cost -= getShadesmarCostReduction(state, locationIndex);
  if (state.players[playerId].hasEnergyDiscount) cost -= 1;
  return Math.max(0, cost);
}

export function canPlayCard(
  state: GameState,
  cardInstanceId: string,
  locationIndex: number,
  playerId: PlayerId
): { valid: boolean; reason?: string } {
  const player = state.players[playerId];
  const card = player.hand.find((c) => c.instanceId === cardInstanceId);
  if (!card) return { valid: false, reason: 'Card not in hand' };

  const loc = state.locations[locationIndex];
  if (!loc.isRevealed) return { valid: false, reason: 'Location not yet revealed' };
  if (loc.isLockedFor === playerId) return { valid: false, reason: 'Location is locked for you' };

  const max = loc.maxCardsOverride ?? DEFAULT_MAX_CARDS_PER_LOCATION;
  if (loc.cards[playerId].length >= max) return { valid: false, reason: 'Location is full' };

  const cost = getCardCost(state, cardInstanceId, locationIndex, playerId);
  if (player.currentEnergy < cost) return { valid: false, reason: 'Not enough energy' };

  if (player.pendingPlays.some((p) => p.cardInstanceId === cardInstanceId)) {
    return { valid: false, reason: 'Card already played this turn' };
  }

  return { valid: true };
}

export function addPendingPlay(
  state: GameState,
  cardInstanceId: string,
  locationIndex: number,
  playerId: PlayerId
): GameState {
  const check = canPlayCard(state, cardInstanceId, locationIndex, playerId);
  if (!check.valid) return state;

  const cost = getCardCost(state, cardInstanceId, locationIndex, playerId);

  return produce(state, (draft) => {
    draft.players[playerId].pendingPlays.push({ cardInstanceId, locationIndex });
    draft.players[playerId].currentEnergy -= cost;
    if (draft.players[playerId].hasEnergyDiscount) {
      draft.players[playerId].hasEnergyDiscount = false;
    }
  });
}

export function removePendingPlay(
  state: GameState,
  cardInstanceId: string,
  playerId: PlayerId
): GameState {
  const play = state.players[playerId].pendingPlays.find(
    (p) => p.cardInstanceId === cardInstanceId
  );
  if (!play) return state;

  const cost = getCardCost(state, cardInstanceId, play.locationIndex, playerId);

  return produce(state, (draft) => {
    draft.players[playerId].pendingPlays = draft.players[playerId].pendingPlays.filter(
      (p) => p.cardInstanceId !== cardInstanceId
    );
    draft.players[playerId].currentEnergy += cost;
  });
}

export function commitPendingPlays(state: GameState, playerId: PlayerId): GameState {
  let s = state;

  for (const play of s.players[playerId].pendingPlays) {
    const handIdx = s.players[playerId].hand.findIndex(
      (c) => c.instanceId === play.cardInstanceId
    );
    if (handIdx === -1) continue;

    s = produce(s, (draft) => {
      const [card] = draft.players[playerId].hand.splice(handIdx, 1);
      card.locationIndex = play.locationIndex;
      card.isRevealed = true;
      card.turnsOnBoard = 0;

      // Yolen: enter with +1 permanent
      const locDef = LOCATION_REGISTRY.get(draft.locations[play.locationIndex].definitionId);
      if (locDef?.effectKey === 'enter_plus1') {
        card.currentPower += 1;
        card.powerModifiers.push({ sourceId: 'yolen', amount: 1, isPermanent: true, turnsRemaining: null });
      }

      draft.locations[play.locationIndex].cards[playerId].push(card);
      draft.locations[play.locationIndex].lastPlayedBy = playerId;
    });
  }

  return produce(s, (draft) => {
    draft.players[playerId].pendingPlays = [];
  });
}
