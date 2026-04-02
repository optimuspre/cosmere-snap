import type { LocationDefinition } from '../../types';

export const shadesmarLocations: LocationDefinition[] = [
  {
    id: 'shadesmar',
    name: 'Shadesmar',
    world: 'cognitive-realm',
    effectKey: 'cost_minus1',
    effectText: 'Cards cost 1 less Energy to play here.',
    artKey: 'shadesmar',
    flavorText: 'The Cognitive Realm — a mirror of the Physical.',
  },
  {
    id: 'lasting_integrity',
    name: 'Lasting Integrity',
    world: 'cognitive-realm',
    effectKey: 'spren_plus2',
    effectText: 'Spren cards here have +2 Power.',
    artKey: 'lasting_integrity',
    flavorText: 'Fortress of the honorspren.',
  },
  {
    id: 'braize',
    name: 'Braize',
    world: 'cosmere-wide',
    effectKey: 'destroy_lowest_end_of_turn',
    effectText: "At the end of each turn, each player's lowest-Power card here is destroyed.",
    artKey: 'braize',
    flavorText: 'The Void. Prison of the Heralds.',
  },
  {
    id: 'yolen',
    name: 'Yolen',
    world: 'cosmere-wide',
    effectKey: 'enter_plus1',
    effectText: 'Cards played here enter with +1 Power.',
    artKey: 'yolen',
    flavorText: 'The origin world. Where it all began.',
  },
];
