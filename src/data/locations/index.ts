import type { LocationDefinition } from '../../types';
import { rosharLocations } from './roshar.locations';
import { scadrialLocations } from './scadrial.locations';
import { nalthisLocations } from './nalthis.locations';
import { selLocations } from './sel.locations';
import { shadesmarLocations } from './shadesmar.locations';

export const ALL_LOCATIONS: LocationDefinition[] = [
  ...rosharLocations,
  ...scadrialLocations,
  ...nalthisLocations,
  ...selLocations,
  ...shadesmarLocations,
];

export const LOCATION_REGISTRY = new Map<string, LocationDefinition>(
  ALL_LOCATIONS.map((l) => [l.id, l])
);
