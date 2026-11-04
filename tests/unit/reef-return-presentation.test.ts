import { describe, expect, test } from 'vitest';
import plans from '../../data/reef-return/witnesses.json';
import { initial, reduce, type Action } from '../../src/game/rules';
import { reefReturn as level, wideBerth } from '../../src/levels/level';
import { locationFacts } from '../../src/ui/location';
import { forecastCopy, previewCopy, statusCopy } from '../../src/ui/presentation';

const voyage = plans.witnesses[0].actions as Action[];
const at = (turn: number) =>
  voyage.slice(0, turn).reduce((s, a) => reduce(s, a, level), initial(level));

describe('Reef Return route and forecast after repair', () => {
  test('from the opening frame each reef forecast discloses both turns, depths and every newly flooded landing', () => {
    expect(forecastCopy(initial(wideBerth), wideBerth).schedule).toEqual([
      { turn: 4, direction: 'Harbor → High Quay', depth: 3, floods: ['Wide Berth'] },
      { turn: 10, direction: 'High Quay → Harbor', depth: 4, floods: ['Shell Landing'] },
    ]);
    expect(forecastCopy(at(0), level).schedule).toEqual([
      { turn: 3, direction: 'Cairn Quay → Harbor', depth: 4, floods: ['Wrack Pier'] },
      { turn: 9, direction: 'Harbor → Cairn Quay', depth: 5, floods: ['Cairn Quay', 'Shell Pool'] },
    ]);
    expect(forecastCopy(at(3), level).schedule.map(phase => phase.turn)).toEqual([9]);
    expect(forecastCopy(at(9), level).schedule).toEqual([]);
  });

  test('free forecast and inspection track both current boundaries and the last legal loaded crossing', () => {
    expect(forecastCopy(at(0), level).current?.direction).toBe(
      'Needle Reef flows from Harbor to Cairn Quay.',
    );
    expect(forecastCopy(at(0), level).current?.next).toBe(
      'After 3 actions, it turns toward Harbor.',
    );
    expect(statusCopy(at(0), level).headline).toContain('Wrack Pier floods in 3 actions');
    expect(locationFacts(at(0), 'harbor', level)).toMatchObject({
      status: 'against-current',
      canSail: false,
    });
    expect(forecastCopy(at(3), level).current?.next).toBe(
      'After 6 actions, it turns toward Cairn Quay.',
    );
    expect(forecastCopy(at(8), level).current?.next).toBe(
      'After your next action, it turns toward Cairn Quay.',
    );
    expect(locationFacts(at(8), 'harbor', level)).toMatchObject({
      canSail: true,
      wouldLose: false,
    });
    expect(previewCopy(at(8), voyage[8], level).consequence).toContain(
      'Then Needle Reef turns toward Cairn Quay.',
    );
    expect(forecastCopy(at(9), level).current?.direction).toBe(
      'Needle Reef flows from Harbor to Cairn Quay.',
    );
  });

  test('a late Wait describes the future tonnage cutoff before it happens and present conditions afterward', () => {
    const before = at(8);
    const wait = { type: 'wait' } as const;
    const warning = previewCopy(before, wait, level);
    expect(warning.error).toBeNull();
    expect(warning.consequence).toContain('will need depth 4');
    expect(warning.consequence).toContain('no dry landing');
    expect(before.status).toBe('playing');
    const after = reduce(before, wait, level);
    expect(after.lossReason?.code).toBe('RETURN_DEPTH');
    expect(statusCopy(after, level).detail).toContain('needs depth 4');
    expect(statusCopy(after, level).detail).toContain('Undo');
    expect(locationFacts(after, 'harbor', level)).toMatchObject({
      status: 'against-current',
      canSail: false,
    });
    expect(locationFacts(after, 'pool', level)).toMatchObject({
      status: 'too-shallow',
      canSail: false,
    });
    expect(locationFacts(after, 'wrack', level)).toMatchObject({ status: 'safe', canSail: false });
  });
});
