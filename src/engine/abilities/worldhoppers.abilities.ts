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
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 4, isPermanent: true });
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
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 2, isPermanent: true });
    }
  }
  for (const card of loc.cards[enemyId]) {
    if (!card.isDestroyed) {
      patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: -1, isPermanent: true });
    }
  }

  return patches;
});

registerAbility('cultivation_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const ownerId = ctx.triggeringCard.ownerId;

  // AI: auto-pick highest-power ally
  if (ownerId === 'ai') {
    let bestCard = null;
    let bestPower = -1;
    for (const loc of ctx.gameState.locations) {
      for (const card of loc.cards['ai']) {
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
  }

  // Player: check if any other friendly cards exist to target
  const hasFriendlyTarget = ctx.gameState.locations.some((loc) =>
    loc.cards['player'].some((c) => !c.isDestroyed && c.instanceId !== ctx.triggeringCard.instanceId)
  );
  if (!hasFriendlyTarget) return [];

  // Request player to pick a target card
  return [{ type: 'request_card_target', abilityKey: 'cultivation_on_reveal', triggeringCardInstanceId: ctx.triggeringCard.instanceId, playerId: 'player' }];
});
registerAbility('harmony_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  const ownerId = ctx.triggeringCard.ownerId;
  const patches: GameStatePatch[] = [];
  for (const loc of ctx.gameState.locations) {
    for (const card of loc.cards[ownerId]) {
      if (!card.isDestroyed && card.instanceId !== ctx.triggeringCard.instanceId) {
        patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 1, isPermanent: false });
      }
    }
  }
  return patches;
});
