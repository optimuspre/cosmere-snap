import type { CardInstance } from './card.types';
import type { LocationState } from './location.types';

export type PlayerId = 'player' | 'ai';

export type GamePhase =
  | 'menu'
  | 'player_action'
  | 'ai_thinking'
  | 'revealing'
  | 'end_of_turn'
  | 'game_over';

export interface PendingPlay {
  cardInstanceId: string;
  locationIndex: number;
}

export interface PlayerState {
  id: PlayerId;
  deck: CardInstance[];
  hand: CardInstance[];
  currentEnergy: number;
  maxEnergy: number;
  pendingPlays: PendingPlay[];
  hasEnergyDiscount: boolean;
}

export type GameEventType =
  | 'card_played'
  | 'card_revealed'
  | 'ability_triggered'
  | 'power_changed'
  | 'card_moved'
  | 'card_destroyed'
  | 'location_revealed'
  | 'turn_ended'
  | 'game_ended';

export interface GameEvent {
  id: string;
  turn: number;
  type: GameEventType;
  message: string;
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  locations: LocationState[];
  players: {
    player: PlayerState;
    ai: PlayerState;
  };
  eventLog: GameEvent[];
  winner: PlayerId | 'tie' | null;
  pendingTargetSelection: {
    cardInstanceId: string;
    type: 'location' | 'card';
    playerId: PlayerId;
    abilityKey: string;
  } | null;
}
