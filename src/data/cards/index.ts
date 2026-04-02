import type { CardDefinition } from '../../types';
import { rosharCards } from './roshar.cards';
import { scadrialEra1Cards } from './scadrial-era1.cards';
import { scadrialEra2Cards } from './scadrial-era2.cards';
import { nalthisCards } from './nalthis.cards';
import { selCards } from './sel.cards';
import { worldhopperCards } from './worldhoppers.cards';

export const ALL_CARDS: CardDefinition[] = [
  ...rosharCards,
  ...scadrialEra1Cards,
  ...scadrialEra2Cards,
  ...nalthisCards,
  ...selCards,
  ...worldhopperCards,
];

export const CARD_REGISTRY = new Map<string, CardDefinition>(
  ALL_CARDS.map((c) => [c.id, c])
);
