import { registerAbility } from '../abilityResolver';
import type { AbilityContext, GameStatePatch } from '../../types/ability.types';
import { pickRandom } from '../../utils/random';
import { CARD_REGISTRY } from '../../data/cards';

registerAbility('vasher_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const allCards = [
    ...loc.cards.player.filter((c) => !c.isDestroyed),
    ...loc.cards.ai.filter((c) => !c.isDestroyed),
  ].filter((c) => c.instanceId !== ctx.triggeringCard.instanceId && !c.isImmune);

  if (allCards.length === 0) return [];
  const highest = allCards.reduce((max, c) => (c.currentPower > max.currentPower ? c : max));
  return [{ type: 'destroy_card', targetInstanceId: highest.instanceId }];
});

registerAbility('lightsong_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const patches: GameStatePatch[] = [];

  // Lose 2 power on all friendly cards here
  for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
    if (!card.isDestroyed) {
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: -2, isPermanent: false });
    }
  }

  // Gain 5 power at another location (AI picks best; for player we pick random)
  const otherLocs = [0, 1, 2].filter((i) => i !== ctx.locationIndex);
  const ownerId = ctx.triggeringCard.ownerId;
  let targetLoc: number;
  if (ownerId === 'ai') {
    targetLoc = otherLocs.reduce((best, i) => {
      const deficit = ctx.gameState.locations[i].powerTotals.player - ctx.gameState.locations[i].powerTotals.ai;
      const bestDeficit = ctx.gameState.locations[best].powerTotals.player - ctx.gameState.locations[best].powerTotals.ai;
      return deficit > bestDeficit ? i : best;
    });
  } else {
    targetLoc = pickRandom(otherLocs);
  }

  for (const card of ctx.gameState.locations[targetLoc].cards[ownerId]) {
    if (!card.isDestroyed) {
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 5, isPermanent: false });
    }
  }

  return patches;
});

registerAbility('vivenna_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed);
  if (enemies.length === 0) return [];
  const target = pickRandom(enemies);
  return [{ type: 'modify_power', targetInstanceId: target.instanceId, amount: -3, isPermanent: false }];
});

registerAbility('nightblood_end_of_turn', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const patches: GameStatePatch[] = [];

  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed && !c.isImmune);
  if (enemies.length > 0) {
    const highestEnemy = enemies.reduce((max, c) => (c.currentPower > max.currentPower ? c : max));
    patches.push({ type: 'destroy_card', targetInstanceId: highestEnemy.instanceId });
  }

  const allies = loc.cards[ctx.triggeringCard.ownerId].filter(
    (c) => !c.isDestroyed && !c.isImmune && c.instanceId !== ctx.triggeringCard.instanceId
  );
  if (allies.length > 0) {
    const highestAlly = allies.reduce((max, c) => (c.currentPower > max.currentPower ? c : max));
    patches.push({ type: 'destroy_card', targetInstanceId: highestAlly.instanceId });
  }

  return patches;
});
registerAbility('siri_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const ownerId = ctx.triggeringCard.ownerId;
  const patches: GameStatePatch[] = [];
  for (const loc of ctx.gameState.locations) {
    for (const card of loc.cards[ownerId]) {
      if (!card.isDestroyed && card.instanceId !== ctx.triggeringCard.instanceId) {
        const def = CARD_REGISTRY.get(card.definitionId);
        if (def?.world === 'nalthis') {
          patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 1, isPermanent: false });
        }
      }
    }
  }
  return patches;
});

registerAbility('denth_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed && !c.isImmune);
  if (enemies.length === 0) return [];
  const weakest = enemies.reduce((min, c) => (c.currentPower < min.currentPower ? c : min));
  return [
    { type: 'destroy_card', targetInstanceId: weakest.instanceId },
    { type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: -2, isPermanent: true },
  ];
});
