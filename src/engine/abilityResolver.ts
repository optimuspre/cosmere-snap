import type { AbilityResolver, AbilityContext, GameStatePatch } from '../types/ability.types';
import type { GameState } from '../types/game.types';
import type { CardInstance } from '../types/card.types';
import { CARD_REGISTRY } from '../data/cards';
import { LOCATION_REGISTRY } from '../data/locations';

const ABILITY_REGISTRY = new Map<string, AbilityResolver>();

export function registerAbility(key: string, resolver: AbilityResolver): void {
  ABILITY_REGISTRY.set(key, resolver);
}

function isNullified(state: GameState, locationIndex: number): boolean {
  const loc = state.locations[locationIndex];
  const locDef = LOCATION_REGISTRY.get(loc.definitionId);
  return locDef?.effectKey === 'nullify_all_abilities';
}

export function resolveOnReveal(
  card: CardInstance,
  locationIndex: number,
  state: GameState
): GameStatePatch[] {
  const def = CARD_REGISTRY.get(card.definitionId);
  if (!def?.abilityKey || def.abilityTrigger !== 'on_reveal') return [];
  if (isNullified(state, locationIndex)) return [];

  const resolver = ABILITY_REGISTRY.get(def.abilityKey);
  if (!resolver) return [];

  const ctx: AbilityContext = { triggeringCard: card, locationIndex, gameState: state };
  const patches = resolver(ctx);

  // Elantris / Nalthis double trigger
  const locDef = LOCATION_REGISTRY.get(state.locations[locationIndex].definitionId);
  const isAwakener = def.tags.includes('awakener');
  if (
    locDef?.effectKey === 'on_reveal_twice' ||
    (locDef?.effectKey === 'awakeners_extra_trigger' && isAwakener)
  ) {
    return [...patches, ...resolver(ctx)];
  }

  return patches;
}

export function resolveAllOngoing(state: GameState): GameStatePatch[] {
  const patches: GameStatePatch[] = [];
  for (let locIdx = 0; locIdx < 3; locIdx++) {
    if (isNullified(state, locIdx)) continue;
    const loc = state.locations[locIdx];
    for (const pid of ['player', 'ai'] as const) {
      for (const card of loc.cards[pid]) {
        if (card.isDestroyed) continue;
        const def = CARD_REGISTRY.get(card.definitionId);
        if (def?.abilityTrigger === 'ongoing' && def.abilityKey) {
          const resolver = ABILITY_REGISTRY.get(def.abilityKey);
          if (resolver) {
            patches.push(
              ...resolver({ triggeringCard: card, locationIndex: locIdx, gameState: state })
            );
          }
        }
      }
    }
  }
  return patches;
}

export function resolveEndOfTurnAbilities(state: GameState): GameStatePatch[] {
  const patches: GameStatePatch[] = [];
  for (let locIdx = 0; locIdx < 3; locIdx++) {
    const loc = state.locations[locIdx];
    for (const pid of ['player', 'ai'] as const) {
      for (const card of loc.cards[pid]) {
        if (card.isDestroyed) continue;
        const def = CARD_REGISTRY.get(card.definitionId);
        // End-of-turn effects (Lift, Nightblood) are keyed specially
        if (def?.abilityKey?.endsWith('_end_of_turn')) {
          const resolver = ABILITY_REGISTRY.get(def.abilityKey);
          if (resolver) {
            patches.push(
              ...resolver({ triggeringCard: card, locationIndex: locIdx, gameState: state })
            );
          }
        }
      }
    }
  }
  return patches;
}
