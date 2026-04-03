export type World =
  | 'roshar'
  | 'scadrial-era1'
  | 'scadrial-era2'
  | 'nalthis'
  | 'sel'
  | 'cosmere-wide';

export type AbilityTrigger = 'on_reveal' | 'ongoing' | 'passive';

export type AbilityTag =
  | 'radiant'
  | 'mistborn'
  | 'allomancer'
  | 'feruchemist'
  | 'awakener'
  | 'spren'
  | 'worldhopper'
  | 'bridge_four'
  | 'lightweaver'
  | 'listener';

export interface CardDefinition {
  id: string;
  name: string;
  world: World;
  cost: number;
  basePower: number;
  abilityTrigger: AbilityTrigger | null;
  abilityText: string;
  abilityKey: string | null;
  tags: AbilityTag[];
  artKey: string;
  flavorText?: string;
}

export type StatusEffect =
  | { type: 'trapped'; powerReduction: number }
  | { type: 'power_locked' }
  | { type: 'silenced' }
  | { type: 'cost_reduced'; amount: number };

export interface PowerModifier {
  sourceId: string;
  amount: number;
  isPermanent: boolean;
  turnsRemaining: number | null;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  ownerId: 'player' | 'ai';
  currentPower: number;
  powerModifiers: PowerModifier[];
  locationIndex: number | null;
  isRevealed: boolean;
  isDestroyed: boolean;
  isImmune: boolean;
  statusEffects: StatusEffect[];
  turnsOnBoard: number;
}
