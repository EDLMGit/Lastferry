import { describe, expect, test } from 'vitest';
import { resolvePassengerAppearance } from '../../src/game/passenger-appearance';
import { initial, reduce, type Action } from '../../src/game/rules';
import { bellwater, holdingPier, level, type Level } from '../../src/levels/level';
import { World } from '../../src/scene/world';

describe('passenger appearance identity', () => {
  test.each([
    [level, 'rabbit-1', 'rabbit', 0, 'rabbit-cream'],
    [level, 'rabbit-2', 'rabbit', 1, 'rabbit-tan'],
    [level, 'sheep-1', 'sheep', 0, 'sheep-wool'],
    [holdingPier, 'rabbit-1', 'rabbit', 0, 'rabbit-cream'],
    [holdingPier, 'rabbit-2', 'rabbit', 1, 'rabbit-tan'],
    [holdingPier, 'sheep-1', 'sheep', 0, 'sheep-wool'],
    [bellwater, 'tansy', 'rabbit', 0, 'rabbit-cream'],
    [bellwater, 'lark', 'rabbit', 1, 'rabbit-tan'],
    [bellwater, 'bram', 'sheep', 0, 'sheep-wool'],
  ] as const)('%s / %s keeps its full-level appearance', (cove, id, species, speciesOrdinal, portraitKey) => {
    const before = structuredClone(cove);
    expect(resolvePassengerAppearance(cove, id)).toEqual({ species, speciesOrdinal, portraitKey });
    expect(World.prototype.speciesIndex.call({ level: cove } as World, id)).toBe(speciesOrdinal);
    expect(cove).toEqual(before);
  });

  test.each([
    [holdingPier, ['rabbit-2'], ['rabbit-2', 'sheep-1', 'rabbit-1']],
    [bellwater, ['lark'], ['lark', 'bram', 'tansy']],
  ] as const)('%s singleton and reordered offers do not change identity', (cove, alone, reordered) => {
    for (const ids of [alone, reordered, [...reordered].reverse()]) {
      const appearances = ids.map((id) => [id, resolvePassengerAppearance(cove, id)] as const);
      expect(appearances.find(([id]) => id === alone[0])?.[1]).toEqual({
        species: 'rabbit', speciesOrdinal: 1, portraitKey: 'rabbit-tan',
      });
    }
  });

  test.each([
    [holdingPier, 'rabbit-1', 'rabbit-2', [
      { type: 'unload', passengerIds: ['sheep-1'] },
      { type: 'move', to: 'shallows' },
      { type: 'move', to: 'rabbit-pier' },
      { type: 'board', passengerIds: ['rabbit-1', 'rabbit-2'] },
      { type: 'move', to: 'shallows' },
      { type: 'move', to: 'stone' },
      { type: 'board', passengerIds: ['sheep-1'] },
      { type: 'move', to: 'harbor' },
    ]],
    [bellwater, 'tansy', 'lark', [
      { type: 'move', to: 'shallows' },
      { type: 'move', to: 'low-pier' },
      { type: 'board', passengerIds: ['tansy', 'lark'] },
      { type: 'move', to: 'east-buoy' },
      { type: 'move', to: 'west-buoy' },
      { type: 'move', to: 'harbor' },
    ]],
  ] as [Level, string, string, Action[]][])('%s partial delivery retains the tan rabbit', (cove, first, remaining, actions) => {
    const atHarbor = actions.reduce((state, action) => reduce(state, action, cove), initial(cove));
    const partial = reduce(atHarbor, { type: 'unload', passengerIds: [first] }, cove);
    expect(partial.delivered).toContain(first);
    expect(partial.aboard).toContain(remaining);
    expect(partial.aboard.map((id) => resolvePassengerAppearance(cove, id))
      .find((appearance) => appearance?.species === 'rabbit')).toEqual({
        species: 'rabbit', speciesOrdinal: 1, portraitKey: 'rabbit-tan',
      });
  });

  test('full ordinals beyond the supplied variants remain available to world consumers', () => {
    const cove: Level = {
      ...level,
      passengers: [
        { ...level.passengers[0], id: 'rabbit-a', species: 'rabbit' },
        { ...level.passengers[0], id: 'sheep-a', species: 'sheep' },
        { ...level.passengers[0], id: 'rabbit-b', species: 'rabbit' },
        { ...level.passengers[0], id: 'rabbit-c', species: 'rabbit' },
        { ...level.passengers[0], id: 'sheep-b', species: 'sheep' },
        { ...level.passengers[0], id: 'rabbit-d', species: 'rabbit' },
      ],
    };
    for (const [id, ordinal] of [['rabbit-a', 0], ['rabbit-b', 1], ['rabbit-c', 2], ['rabbit-d', 3], ['sheep-b', 1]] as const) {
      const appearance = resolvePassengerAppearance(cove, id)!;
      expect(appearance.speciesOrdinal).toBe(ordinal);
      expect(World.prototype.speciesIndex.call({ level: cove } as World, id)).toBe(ordinal);
      expect(appearance.portraitKey).toBe(id.startsWith('sheep') ? 'sheep-wool' : ordinal ? 'rabbit-tan' : 'rabbit-cream');
    }
  });

  test('unknown IDs and future species explicitly have no portrait', () => {
    expect(resolvePassengerAppearance(level, 'unknown')).toBeNull();
    expect(() => World.prototype.speciesIndex.call({ level } as World, 'unknown')).toThrow('Unknown passenger');
    const cove: Level = { ...level, passengers: [{ ...level.passengers[0], id: 'future', species: 'otter' }] };
    expect(resolvePassengerAppearance(cove, 'future')).toEqual({
      species: 'otter', speciesOrdinal: 0, portraitKey: null,
    });
  });
});
