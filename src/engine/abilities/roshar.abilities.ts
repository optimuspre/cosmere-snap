import { registerAbility } from '../abilityResolver';
import type { AbilityContext, GameStatePatch } from '../../types/ability.types';
import { CARD_REGISTRY } from '../../data/cards';

registerAbility('adolin_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const opponentId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[opponentId].filter((c) => !c.isDestroyed);
  if (enemies.length === 0) return [];
  const weakest = enemies.reduce((min, c) => (c.currentPower < min.currentPower ? c : min));
  return [{ type: 'destroy_card', targetInstanceId: weakest.instanceId }];
});

registerAbility('kaladin_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  return loc.cards[ctx.triggeringCard.ownerId]
    .filter((c) => c.instanceId !== ctx.triggeringCard.instanceId && !c.isDestroyed)
    .map((c) => ({
      type: 'modify_power' as const,
      targetInstanceId: c.instanceId,
      amount: 1,
      isPermanent: true,
    }));
});

registerAbility('syl_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const kaladin = loc.cards[ctx.triggeringCard.ownerId].find(
    (c) => c.definitionId === 'kaladin_stormblessed' && !c.isDestroyed
  );
  if (!kaladin) return [];
  return [{ type: 'modify_power', targetInstanceId: kaladin.instanceId, amount: 3, isPermanent: false }];
});

registerAbility('dalinar_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const patches: GameStatePatch[] = [];
  for (let i = 0; i < 3; i++) {
    if (i === ctx.locationIndex) continue;
    const loc = ctx.gameState.locations[i];
    for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
      if (!card.isDestroyed) {
        patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: 1, isPermanent: true });
      }
    }
  }
  return patches;
});

registerAbility('szeth_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  // Find location with highest enemy power
  let maxPower = -1;
  let targetLoc = -1;
  for (let i = 0; i < 3; i++) {
    if (i === ctx.locationIndex) continue;
    const enemyPower = ctx.gameState.locations[i].powerTotals[
      ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player'
    ];
    if (enemyPower > maxPower) {
      maxPower = enemyPower;
      targetLoc = i;
    }
  }
  if (targetLoc === -1) return [];
  return [{
    type: 'move_card',
    targetInstanceId: ctx.triggeringCard.instanceId,
    fromLocation: ctx.locationIndex,
    toLocation: targetLoc,
  }];
});

registerAbility('jasnah_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const enemies = loc.cards[enemyId].filter((c) => !c.isDestroyed && !c.isImmune);
  if (enemies.length === 0) return [];
  const target = enemies[Math.floor(Math.random() * enemies.length)];
  return [{ type: 'destroy_card', targetInstanceId: target.instanceId }];
});

registerAbility('lift_end_of_turn', (ctx: AbilityContext): GameStatePatch[] => {
  return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: 1, isPermanent: true }];
});

registerAbility('moash_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const allies = loc.cards[ctx.triggeringCard.ownerId].filter(
    (c) => c.instanceId !== ctx.triggeringCard.instanceId && !c.isDestroyed && !c.isImmune
  );
  if (allies.length === 0) return [];
  const sacrifice = allies[Math.floor(Math.random() * allies.length)];
  return [
    { type: 'destroy_card', targetInstanceId: sacrifice.instanceId },
    { type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: sacrifice.currentPower, isPermanent: true },
  ];
});

registerAbility('renarin_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  const turns = ctx.triggeringCard.turnsOnBoard;
  if (turns <= 0) return [];
  return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: turns, isPermanent: false }];
});

registerAbility('shallan_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  return [{ type: 'draw_card', playerId: ctx.triggeringCard.ownerId, count: 2 }];
});

registerAbility('pattern_ongoing', (ctx: AbilityContext): GameStatePatch[] => {
  const ownerId = ctx.triggeringCard.ownerId;
  for (const loc of ctx.gameState.locations) {
    const shallan = loc.cards[ownerId].find((c) => c.definitionId === 'shallan_davar' && !c.isDestroyed);
    if (shallan) {
      return [{ type: 'modify_power', targetInstanceId: shallan.instanceId, amount: 3, isPermanent: false }];
    }
  }
  return [];
});

registerAbility('eshonai_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const enemyId = ctx.triggeringCard.ownerId === 'player' ? 'ai' : 'player';
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const myPower = loc.powerTotals[ctx.triggeringCard.ownerId];
  const enemyPower = loc.powerTotals[enemyId];
  if (enemyPower > myPower) {
    return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: 4, isPermanent: true }];
  }
  return [];
});

registerAbility('bridge_four_soldier_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  let count = 0;
  for (const loc of ctx.gameState.locations) {
    for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
      const def = CARD_REGISTRY.get(card.definitionId);
      if (def?.tags.includes('bridge_four') && !card.isDestroyed) count++;
    }
  }
  if (count >= 3) {
    return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: 2, isPermanent: true }];
  }
  return [];
});
