import { produce } from 'immer';
import type { GameState } from '../types/game.types';
import { CARD_REGISTRY } from '../data/cards';
import { LOCATION_REGISTRY } from '../data/locations';
import { applyPatches } from './patchApplier';
import { resolveAllOngoing } from './abilityResolver';
import type { GameStatePatch } from '../types/ability.types';

function resetToPermanentBase(state: GameState): GameState {
  return produce(state, (draft) => {
    for (const loc of draft.locations) {
      for (const pid of ['player', 'ai'] as const) {
        for (const card of loc.cards[pid]) {
          const def = CARD_REGISTRY.get(card.definitionId);
          if (!def) continue;
          card.currentPower =
            def.basePower +
            card.powerModifiers
              .filter((m) => m.isPermanent)
              .reduce((sum, m) => sum + m.amount, 0);
        }
      }
    }
  });
}

function applyLocationPassives(state: GameState): GameStatePatch[] {
  const patches: GameStatePatch[] = [];

  for (let locIdx = 0; locIdx < state.locations.length; locIdx++) {
    const loc = state.locations[locIdx];
    if (!loc.isRevealed) continue;
    const locDef = LOCATION_REGISTRY.get(loc.definitionId);
    if (!locDef) continue;

    for (const pid of ['player', 'ai'] as const) {
      for (const card of loc.cards[pid]) {
        const def = CARD_REGISTRY.get(card.definitionId);
        if (!def || card.isDestroyed) continue;

        if (locDef.effectKey === 'radiants_plus1' && def.tags.includes('radiant')) {
          patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 1, isPermanent: false });
        }
        if (locDef.effectKey === 'radiants_plus2' && def.tags.includes('radiant')) {
          patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 2, isPermanent: false });
        }
        if (locDef.effectKey === 'spren_plus2' && def.tags.includes('spren')) {
          patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 2, isPermanent: false });
        }
        if (locDef.effectKey === 'all_minus1') {
          patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: -1, isPermanent: false });
        }
      }

      // T'Telir: +1 per distinct world on your side
      if (locDef.effectKey === 'power_per_world') {
        const worlds = new Set(
          loc.cards[pid]
            .map((c) => CARD_REGISTRY.get(c.definitionId)?.world)
            .filter(Boolean)
        );
        const bonus = worlds.size;
        for (const card of loc.cards[pid]) {
          if (!card.isDestroyed) {
            patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: bonus, isPermanent: false });
          }
        }
      }
    }
  }

  return patches;
}

export function recalculateAllPowers(state: GameState): GameState {
  let s = resetToPermanentBase(state);
  const ongoingPatches = resolveAllOngoing(s);
  s = applyPatches(s, ongoingPatches);
  const locationPatches = applyLocationPassives(s);
  s = applyPatches(s, locationPatches);
  return updatePowerTotals(s);
}

export function updatePowerTotals(state: GameState): GameState {
  return produce(state, (draft) => {
    for (const loc of draft.locations) {
      for (const pid of ['player', 'ai'] as const) {
        loc.powerTotals[pid] = loc.cards[pid]
          .filter((c) => !c.isDestroyed)
          .reduce((sum, c) => sum + c.currentPower, 0);
      }
    }
  });
}
