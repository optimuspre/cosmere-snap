import { registerAbility } from '../abilityResolver';
import type { AbilityContext, GameStatePatch } from '../../types/ability.types';
import { pickRandom } from '../../utils/random';

registerAbility('hoid_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  return [
    { type: 'draw_card', playerId: ctx.triggeringCard.ownerId, count: 2 },
    { type: 'set_energy_discount', playerId: ctx.triggeringCard.ownerId, value: true },
  ];
});

registerAbility('khriss_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  return [{
    type: 'log_event',
    event: {
      turn: ctx.gameState.turn,
      type: 'ability_triggered',
      message: `Khriss reveals all cards in the opponent's hand!`,
    },
  }];
});

registerAbility('nightwatcher_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const patches: GameStatePatch[] = [];

  // Give enemy +4 power at a random location
  const locs = [0, 1, 2];
  const targetLoc = pickRandom(locs);
  for (const card of ctx.gameState.locations[targetLoc].cards[enemyId]) {
    if (!card.isDestroyed) {
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 4, isPermanent: false });
    }
  }

  // Destroy a random enemy card here
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed && !c.isImmune);
  if (enemies.length > 0) {
    const target = pickRandom(enemies);
    patches.push({ type: 'destroy_card', targetInstanceId: target.instanceId });
  }

  return patches;
});

registerAbility('odium_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const patches: GameStatePatch[] = [];

  for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
    if (!card.isDestroyed && card.instanceId !== ctx.triggeringCard.instanceId) {
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 2, isPermanent: false });
    }
  }
  for (const card of loc.cards[enemyId]) {
    if (!card.isDestroyed) {
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: -1, isPermanent: false });
    }
  }

  return patches;
});

registerAbility('cultivation_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  // Give +3 permanent power to the highest-base-power ally in play
  let bestCard = null;
  let bestPower = -1;
  for (const loc of ctx.gameState.locations) {
    for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
      if (!card.isDestroyed && card.instanceId !== ctx.triggeringCard.instanceId) {
        if (card.currentPower > bestPower) {
          bestPower = card.currentPower;
          bestCard = card;
        }
      }
    }
  }
  if (!bestCard) return [];
  return [{ type: 'modify_power', targetInstanceId: bestCard.instanceId, amount: 3, isPermanent: true }];
});
