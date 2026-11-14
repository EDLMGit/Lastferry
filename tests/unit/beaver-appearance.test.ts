import { describe, expect, test } from 'vitest';
import * as T from 'three';
import { animal } from '../../src/scene/models';
import { passengerModelVariant, resolvePassengerAppearance } from '../../src/game/passenger-appearance';
import { level, type Level } from '../../src/levels/level';

const yard: Level = {
  ...level,
  passengers: [
    { id: 'nell', species: 'beaver', slots: 2, appearance: 'beaver-brown' },
    { id: 'fern', species: 'rabbit', slots: 1, appearance: 'rabbit-cream' },
    { id: 'oat', species: 'rabbit', slots: 1, appearance: 'rabbit-tan' },
  ],
};

describe('Nell and the new neighbors', () => {
  test('explicit new appearances survive full passenger-array reorder while placement keeps full ordinals', () => {
    for (const passengers of [yard.passengers, [...yard.passengers].reverse(), [yard.passengers[2], yard.passengers[0], yard.passengers[1]]]) {
      const cove = { ...yard, passengers };
      expect(resolvePassengerAppearance(cove, 'nell')?.portraitKey).toBe('beaver-brown');
      expect(resolvePassengerAppearance(cove, 'fern')?.portraitKey).toBe('rabbit-cream');
      expect(resolvePassengerAppearance(cove, 'oat')?.portraitKey).toBe('rabbit-tan');
      expect(passengerModelVariant(cove, 'fern')).toBe(0);
      expect(passengerModelVariant(cove, 'oat')).toBeGreaterThan(0);
      for (const id of ['fern', 'oat'])
        expect(resolvePassengerAppearance(cove, id)?.speciesOrdinal).toBe(passengers.filter((p) => p.species === 'rabbit').findIndex((p) => p.id === id));
    }
  });

  test('beaver has a real broad flat tail and compact foot-contact body, distinct from wool geometry', () => {
    const beaver = animal('beaver');
    const tail = beaver.getObjectByName('beaver-flat-tail');
    expect(tail).toBeDefined();
    const tailBody = tail!.children[0] as T.Mesh;
    expect(tailBody.scale.x).toBeGreaterThan(tailBody.scale.y * 4);
    expect(tailBody.scale.z).toBeGreaterThan(tailBody.scale.y * 3);
    const bounds = new T.Box3().setFromObject(beaver), size = bounds.getSize(new T.Vector3());
    expect(bounds.min.y).toBeGreaterThan(-0.01);
    expect(size.x).toBeLessThan(0.56);
    expect(size.z).toBeLessThan(0.58);
    expect(size.y).toBeGreaterThan(0.6);
    expect(animal('sheep').getObjectByName('beaver-flat-tail')).toBeUndefined();
  });
});
