import type { LocationDefinition } from '../../types';

export const rosharLocations: LocationDefinition[] = [
  {
    id: 'shattered_plains',
    name: 'The Shattered Plains',
    world: 'roshar',
    effectKey: 'max_3_cards',
    effectText: 'Each side can only play up to 3 cards here.',
    artKey: 'shattered_plains',
    flavorText: 'An endless maze of plateaus.',
  },
  {
    id: 'urithiru',
    name: 'Urithiru',
    world: 'roshar',
    effectKey: 'radiants_plus1',
    effectText: 'Radiant cards here have +1 Power.',
    artKey: 'urithiru',
    flavorText: 'Home of the Knights Radiant.',
  },
  {
    id: 'roshar_open_sky',
    name: 'Roshar (Open Sky)',
    world: 'roshar',
    effectKey: 'radiants_plus2',
    effectText: 'Radiant cards here have +2 Power.',
    artKey: 'roshar_sky',
    flavorText: 'Highstorm country.',
  },
  {
    id: 'kharbranth',
    name: 'Kharbranth',
    world: 'roshar',
    effectKey: 'draw_extra',
    effectText: 'When revealed, both players draw an extra card.',
    artKey: 'kharbranth',
    flavorText: 'The City of Bells.',
  },
  {
    id: 'horneater_peaks',
    name: 'Horneater Peaks',
    world: 'roshar',
    effectKey: 'nullify_all_abilities',
    effectText: 'Cards here have no abilities.',
    artKey: 'horneater_peaks',
    flavorText: 'Rock\'s homeland. The Peaks nullify all.',
  },
];
