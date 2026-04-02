import type { World, CardInstance } from './card.types';
import type { PlayerId } from './game.types';

export type LocationEffectKey =
  | 'max_3_cards'
  | 'radiants_plus1'
  | 'radiants_plus2'
  | 'last_player_plus2'
  | 'all_minus1'
  | 'power_per_world'
  | 'on_reveal_twice'
  | 'cost_minus1'
  | 'spren_plus2'
  | 'draw_extra'
  | 'nullify_all_abilities'
  | 'awakeners_extra_trigger'
  | 'destroy_lowest_end_of_turn'
  | 'enter_plus1'
  | null;

export interface LocationDefinition {
  id: string;
  name: string;
  world: World | 'cognitive-realm';
  effectKey: LocationEffectKey;
  effectText: string;
  artKey: string;
  flavorText?: string;
}

export interface LocationState {
  definitionId: string;
  isRevealed: boolean;
  revealedOnTurn: number | null;
  cards: {
    player: CardInstance[];
    ai: CardInstance[];
  };
  powerTotals: {
    player: number;
    ai: number;
  };
  winner: PlayerId | 'tie' | null;
  isLockedFor: PlayerId | null;
  maxCardsOverride: number | null;
  lastPlayedBy: PlayerId | null;
}
