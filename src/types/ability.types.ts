import type { CardInstance } from './card.types';
import type { PlayerId, GameState } from './game.types';
import type { StatusEffect } from './card.types';
import type { GameEvent } from './game.types';

export interface AbilityContext {
  triggeringCard: CardInstance;
  locationIndex: number;
  gameState: GameState;
}

export type GameStatePatch =
  | { type: 'modify_power'; targetInstanceId: string; amount: number; isPermanent: boolean }
  | { type: 'move_card'; targetInstanceId: string; fromLocation: number; toLocation: number }
  | { type: 'destroy_card'; targetInstanceId: string }
  | { type: 'draw_card'; playerId: PlayerId; count: number }
  | { type: 'set_energy'; playerId: PlayerId; delta: number }
  | { type: 'set_status'; targetInstanceId: string; effect: StatusEffect }
  | { type: 'remove_status'; targetInstanceId: string; effectType: string }
  | { type: 'lock_location'; locationIndex: number; lockedFor: PlayerId }
  | { type: 'set_max_cards'; locationIndex: number; max: number }
  | { type: 'set_immune'; targetInstanceId: string }
  | { type: 'set_energy_discount'; playerId: PlayerId; value: boolean }
  | { type: 'set_last_played'; locationIndex: number; playerId: PlayerId }
  | { type: 'log_event'; event: Omit<GameEvent, 'id'> }
  | { type: 'request_card_target'; abilityKey: string; triggeringCardInstanceId: string; playerId: PlayerId };

export type AbilityResolver = (ctx: AbilityContext) => GameStatePatch[];
