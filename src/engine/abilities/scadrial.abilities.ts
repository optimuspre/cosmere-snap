import { registerAbility, resolveOnReveal } from '../abilityResolver';
import type { AbilityContext, GameStatePatch } from '../../types/ability.types';
import { CARD_REGISTRY } from '../../data/cards';
import { pickRandom } from '../../utils/random';

registerAbility('vin_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed);
  if (enemies.length === 0) return [];
  const target = pickRandom(enemies);
  // Move to a random other location
  const otherLocs = [0, 1, 2].filter((i) => i !== ctx.locationIndex);
  const dest = pickRandom(otherLocs);
  return [{ type: 'move_card', targetInstanceId: target.instanceId, fromLocation: ctx.locationIndex, toLocation: dest }];
});

registerAbility('kelsier_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  return [{ type: 'set_immune', targetInstanceId: ctx.triggeringCard.instanceId }];
});

registerAbility('sazed_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const patches: GameStatePatch[] = [
    { type: 'draw_card', playerId: ctx.triggeringCard.ownerId, count: 2 },
  ];
  // Ongoing power_lock is handled by sazed_ongoing
  return patches;
});

registerAbility('sazed_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  // No patches needed — power_locked status is applied on reveal separately
  // The patchApplier respects power_locked when applying negative modify_power
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const patches: GameStatePatch[] = [];
  for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
    if (!card.isDestroyed && !card.statusEffects.some((s) => s.type === 'power_locked')) {
      patches.push({ type: 'set_status', targetInstanceId: card.instanceId, effect: { type: 'power_locked' } });
    }
  }
  return patches;
});

registerAbility('elend_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const vin = loc.cards[ctx.triggeringCard.ownerId].find(
    (c) => c.definitionId === 'vin' && !c.isDestroyed
  );
  if (!vin) return [];
  return [{ type: 'modify_power', targetInstanceId: vin.instanceId, amount: 2, isPermanent: false }];
});

registerAbility('marsh_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed);
  if (enemies.length === 0) return [];
  const highest = enemies.reduce((max, c) => (c.currentPower > max.currentPower ? c : max));
  return [{ type: 'modify_power', targetInstanceId: highest.instanceId, amount: -3, isPermanent: false }];
});

registerAbility('spook_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  let count = 0;
  for (const loc of ctx.gameState.locations) {
    for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
      const def = CARD_REGISTRY.get(card.definitionId);
      if (def?.tags.includes('mistborn') && !card.isDestroyed && card.instanceId !== ctx.triggeringCard.instanceId) count++;
    }
  }
  if (count === 0) return [];
  return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: count, isPermanent: false }];
});

registerAbility('tensoon_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  // Copy On Reveal of another card at this location (same owner)
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const others = loc.cards[ctx.triggeringCard.ownerId].filter(
    (c) => c.instanceId !== ctx.triggeringCard.instanceId && !c.isDestroyed
  );
  if (others.length === 0) return [];
  const target = pickRandom(others);
  const def = CARD_REGISTRY.get(target.definitionId);
  if (!def?.abilityKey || def.abilityTrigger !== 'on_reveal') return [];
  return resolveOnReveal(ctx.triggeringCard, ctx.locationIndex, ctx.gameState);
});

// Era 2
registerAbility('wax_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  // AI: move to location where AI is behind; Player: handled by pendingTargetSelection
  if (ctx.triggeringCard.ownerId === 'ai') {
    let targetLoc = -1;
    let maxDeficit = -999;
    for (let i = 0; i < 3; i++) {
      if (i === ctx.locationIndex) continue;
      const deficit = ctx.gameState.locations[i].powerTotals.player - ctx.gameState.locations[i].powerTotals.ai;
      if (deficit > maxDeficit) { maxDeficit = deficit; targetLoc = i; }
    }
    if (targetLoc === -1) return [];
    return [{ type: 'move_card', targetInstanceId: ctx.triggeringCard.instanceId, fromLocation: ctx.locationIndex, toLocation: targetLoc }];
  }
  // For player: we just move to location 0 or 2 (simple fallback — UI handles target selection separately)
  const dest = ctx.locationIndex === 0 ? 2 : 0;
  return [{ type: 'move_card', targetInstanceId: ctx.triggeringCard.instanceId, fromLocation: ctx.locationIndex, toLocation: dest }];
});

registerAbility('wayne_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  // +1 per card played here this turn — we approximate as total cards minus Wayne himself
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const others = loc.cards[ctx.triggeringCard.ownerId].filter(
    (c) => c.instanceId !== ctx.triggeringCard.instanceId && !c.isDestroyed
  );
  if (others.length === 0) return [];
  return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: others.length, isPermanent: false }];
});

registerAbility('marasi_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  // Apply trapped status to the enemy's next card — we mark the location by adding a trapped status
  // to an existing enemy card as a proxy; for simplicity, debuff their lowest-power non-trapped enemy
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed);
  if (enemies.length === 0) return [];
  // Reduce the weakest enemy by 2
  const weakest = enemies.reduce((min, c) => (c.currentPower < min.currentPower ? c : min));
  return [{ type: 'modify_power', targetInstanceId: weakest.instanceId, amount: -2, isPermanent: false }];
});

registerAbility('breeze_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed);
  if (enemies.length === 0) return [];
  const strongest = enemies.reduce((max, c) => (c.currentPower > max.currentPower ? c : max));
  return [{ type: 'modify_power', targetInstanceId: strongest.instanceId, amount: -2, isPermanent: false }];
});

registerAbility('ham_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const allOthers = [
    ...loc.cards['player'].filter((c) => c.instanceId !== ctx.triggeringCard.instanceId && !c.isDestroyed),
    ...loc.cards['ai'].filter((c) => !c.isDestroyed),
  ];
  if (allOthers.length === 0) return [];
  return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: allOthers.length, isPermanent: false }];
});

registerAbility('steris_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  return [{ type: 'draw_card', playerId: ctx.triggeringCard.ownerId, count: 1 }];
});
