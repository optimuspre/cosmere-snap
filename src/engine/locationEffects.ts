import type { GameState } from '../types/game.types';
import type { GameStatePatch } from '../types/ability.types';
import { LOCATION_REGISTRY } from '../data/locations';
import { applyPatches } from './patchApplier';

export function applyRevealEffects(state: GameState, locationIndex: number): GameState {
  const loc = state.locations[locationIndex];
  const locDef = LOCATION_REGISTRY.get(loc.definitionId);
  if (!locDef) return state;

  const patches: GameStatePatch[] = [];

  if (locDef.effectKey === 'max_3_cards') {
    patches.push({ type: 'set_max_cards', locationIndex, max: 3 });
  }
  if (locDef.effectKey === 'draw_extra') {
    patches.push({ type: 'draw_card', playerId: 'player', count: 1 });
    patches.push({ type: 'draw_card', playerId: 'ai', count: 1 });
  }

  return applyPatches(state, patches);
}

export function applyBraizeEffect(state: GameState): GameState {
  const patches: GameStatePatch[] = [];

  for (let locIdx = 0; locIdx < 3; locIdx++) {
    const loc = state.locations[locIdx];
    const locDef = LOCATION_REGISTRY.get(loc.definitionId);
    if (locDef?.effectKey !== 'destroy_lowest_end_of_turn') continue;

    for (const pid of ['player', 'ai'] as const) {
      const alive = loc.cards[pid].filter((c) => !c.isDestroyed);
      if (alive.length === 0) continue;
      const lowest = alive.reduce((min, c) => (c.currentPower < min.currentPower ? c : min));
      patches.push({ type: 'destroy_card', targetInstanceId: lowest.instanceId });
    }
  }

  return applyPatches(state, patches);
}

export function applyWellOfAscensionEffect(state: GameState): GameState {
  const patches: GameStatePatch[] = [];

  for (let locIdx = 0; locIdx < 3; locIdx++) {
    const loc = state.locations[locIdx];
    const locDef = LOCATION_REGISTRY.get(loc.definitionId);
    if (locDef?.effectKey !== 'last_player_plus2') continue;
    if (!loc.lastPlayedBy) continue;

    const lastPid = loc.lastPlayedBy;
    for (const card of loc.cards[lastPid]) {
      if (!card.isDestroyed) {
        patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 2, isPermanent: false });
      }
    }
  }

  return applyPatches(state, patches);
}
