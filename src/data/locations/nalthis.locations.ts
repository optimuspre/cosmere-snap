import type { LocationDefinition } from '../../types';

export const nalthisLocations: LocationDefinition[] = [
  {
    id: 'ttelir',
    name: "T'Telir",
    world: 'nalthis',
    effectKey: 'power_per_world',
    effectText: 'Each player gains +1 Power here per distinct world represented on their side.',
    artKey: 'ttelir',
    flavorText: 'City of color and life.',
  },
  {
    id: 'nalthis_loc',
    name: 'Nalthis',
    world: 'nalthis',
    effectKey: 'awakeners_extra_trigger',
    effectText: 'Awakener cards trigger their On Reveal ability twice.',
    artKey: 'nalthis',
    flavorText: 'A world saturated with Breath.',
  },
];
