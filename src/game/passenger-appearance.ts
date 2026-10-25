import type { Level } from '../levels/level';

export type PortraitKey = 'rabbit-cream' | 'rabbit-tan' | 'sheep-wool';

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
  const portraitKey = passenger.species === 'rabbit'
    ? speciesOrdinal === 0 ? 'rabbit-cream' : 'rabbit-tan'
    : passenger.species === 'sheep' ? 'sheep-wool' : null;
  return { species: passenger.species, speciesOrdinal, portraitKey };
}
