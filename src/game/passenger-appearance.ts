import type { Level } from '../levels/level';

export type PortraitKey = 'rabbit-cream' | 'rabbit-tan' | 'sheep-wool' | 'beaver-brown';

export type PassengerAppearance = {
  species: string;
  speciesOrdinal: number;
  portraitKey: PortraitKey | null;
};

export function resolvePassengerAppearance(level: Level, id: string): PassengerAppearance | null {
  const passenger = level.passengers.find((passenger) => passenger.id === id);
  if (!passenger) return null;
  const speciesOrdinal = level.passengers
    .filter((candidate) => candidate.species === passenger.species)
    .findIndex((candidate) => candidate.id === id);
  const explicit = (passenger as { appearance?: string }).appearance;
  const portraitKey: PortraitKey | null = explicit && validPortrait(explicit) ? explicit : passenger.species === 'rabbit'
    ? speciesOrdinal === 0 ? 'rabbit-cream' : 'rabbit-tan'
    : passenger.species === 'sheep' ? 'sheep-wool' : passenger.species === 'beaver' ? 'beaver-brown' : null;
  return { species: passenger.species, speciesOrdinal, portraitKey };
}

function validPortrait(value: string): value is PortraitKey {
  return ['rabbit-cream', 'rabbit-tan', 'sheep-wool', 'beaver-brown'].includes(value);
}

export function passengerModelVariant(level: Level, id: string): number {
  const appearance = resolvePassengerAppearance(level, id);
  if (!appearance) throw new Error(`Unknown passenger: ${id}`);
  if (appearance.species === 'rabbit')
    return appearance.portraitKey === 'rabbit-cream' ? 0 : Math.max(1, appearance.speciesOrdinal);
  return appearance.speciesOrdinal;
}
