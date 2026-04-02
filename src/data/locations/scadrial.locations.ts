import type { LocationDefinition } from '../../types';

export const scadrialLocations: LocationDefinition[] = [
  {
    id: 'well_of_ascension',
    name: 'The Well of Ascension',
    world: 'scadrial-era1',
    effectKey: 'last_player_plus2',
    effectText: 'The last player to play a card here each turn gains +2 Power.',
    artKey: 'well_of_ascension',
    flavorText: 'The power at the heart of the world.',
  },
  {
    id: 'pits_of_hathsin',
    name: 'The Pits of Hathsin',
    world: 'scadrial-era1',
    effectKey: 'all_minus1',
    effectText: 'All cards here have -1 Power.',
    artKey: 'pits_hathsin',
    flavorText: 'Where atium geodes are harvested.',
  },
  {
    id: 'final_empire',
    name: 'The Final Empire',
    world: 'scadrial-era1',
    effectKey: null,
    effectText: 'No special effect.',
    artKey: 'final_empire',
    flavorText: 'The Lord Ruler\'s domain.',
  },
];
