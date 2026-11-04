import { describe, expect, test } from 'vitest';
import plans from '../../data/reef-return/witnesses.json';
import { initial, reduce, type Action } from '../../src/game/rules';
import { reefReturn as level } from '../../src/levels/level';
import { locationFacts } from '../../src/ui/location';
import { forecastCopy, previewCopy, statusCopy } from '../../src/ui/presentation';

const voyage = plans.witnesses[0].actions as Action[];
const at = (turn: number) => voyage.slice(0, turn).reduce((s, a) => reduce(s, a, level), initial(level));

describe('Reef Return forecast, inspection and pre-commit warnings', () => {
  test('forecasts the actual reversal even when the intervening rise keeps the same direction', () => {
    const start = forecastCopy(at(0), level);
    expect(start.current?.direction).toBe('Needle Reef flows from Cairn Quay to Harbor.');
    expect(start.current?.next).toBe('After 8 actions, it turns toward Cairn Quay.');
    expect(statusCopy(at(0), level).headline).toContain('Wrack Pier floods in 3 actions');
    expect(forecastCopy(at(3), level).current?.next).toBe('After 5 actions, it turns toward Cairn Quay.');
    const before = at(7);
    expect(forecastCopy(before, level).current?.next).toBe('After your next action, it turns toward Cairn Quay.');
    expect(locationFacts(before, 'harbor', level)).toMatchObject({ canSail: true, wouldLose: false });
    expect(previewCopy(before, voyage[7], level).consequence).toContain('Then Needle Reef turns toward Cairn Quay.');
    expect(forecastCopy(at(8), level).current?.direction).toBe('Needle Reef flows from Harbor to Cairn Quay.');
    expect(before.turn).toBe(7);
  });

  test('names the people left behind by an early crossing and by waiting through the last homeward tide', () => {
    const early = locationFacts(at(2), 'harbor', level);
    expect(early).toMatchObject({ canSail: true, wouldLose: true });
    expect(early.consequence).toContain('This action will cut Birch and Dot off from Harbor.');
    expect(early.consequence).toContain('after the homeward current ends');
    const wait = { type: 'wait' } as const;
    expect(previewCopy(at(7), wait, level).consequence).toContain('After this action, Needle Reef will flow away from Harbor');
    const lost = reduce(at(7), wait, level);
    const after = statusCopy(lost, level);
    for (const passenger of level.passengers) expect(after.headline).toContain(level.names!.passengers![passenger.id]);
    expect(after.detail).toContain('Undo');
    expect(after.detail).toContain('Needle Reef flows away from Harbor and will not turn again.');
    expect(locationFacts(lost, 'harbor', level)).toMatchObject({ status: 'against-current', canSail: false });
    expect(locationFacts(lost, 'pool', level)).toMatchObject({ status: 'safe', canSail: false });
  });
});
