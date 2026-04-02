import { registerAbility } from '../abilityResolver';
import type { AbilityContext, GameStatePatch } from '../../types/ability.types';
import type { PowerModifier } from '../../types/card.types';

registerAbility('raoden_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const patches: GameStatePatch[] = [];
  for (const card of loc.cards[ctx.triggeringCard.ownerId]) {
    if (!card.isDestroyed) {
      // Remove all negative modifiers (restore to permanent base)
      const negatives = card.powerModifiers.filter((m: PowerModifier) => !m.isPermanent && m.amount < 0);
      const totalRestore = negatives.reduce((sum: number, m: PowerModifier) => sum + Math.abs(m.amount), 0);
      if (totalRestore > 0) {
        patches.push({ type: 'modify_power', targetInstanceId: card.instanceId, amount: totalRestore, isPermanent: false });
      }
      // Remove negative status effects
      patches.push({ type: 'remove_status', targetInstanceId: card.instanceId, effectType: 'trapped' });
    }
  }
  return patches;
});

registerAbility('sarene_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  // Reveal opponent's hand — purely informational; no power patches needed
  // The UI reads from game state; we just log the event
  return [{
    type: 'log_event',
    event: {
      turn: ctx.gameState.turn,
      type: 'ability_triggered',
      message: `Sarene reveals the opponent's hand!`,
    },
  }];
});

registerAbility('galladon_on_reveal', (ctx: AbilityContext): GameStatePatch[] => {
  const loc = ctx.gameState.locations[ctx.locationIndex];
  const hasRaoden = loc.cards[ctx.triggeringCard.ownerId].some(
    (c) => c.definitionId === 'raoden' && !c.isDestroyed
  );
  if (!hasRaoden) return [];
  return [{ type: 'modify_power', targetInstanceId: ctx.triggeringCard.instanceId, amount: 2, isPermanent: false }];
});
