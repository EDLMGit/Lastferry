import { describe, expect, test } from 'vitest';
import { initial, reduce, type Action, type State } from '../../src/game/rules';
import {
  bellwater,
  holdingPier,
  level as baseline,
  levelNames,
  nodeName,
  passengerLabel,
  passengerName,
  type Level,
} from '../../src/levels/level';
import {
  actionCostCopy,
  actionLabel,
  forecastCopy,
  objectiveCopy,
  passageCopy,
  passengerList,
  pierSafetyCopy,
  previewCopy,
  statusCopy,
} from '../../src/ui/presentation';

function run(actions: Action[], l: Level = holdingPier): State {
  return actions.reduce((s, a) => reduce(s, a, l), initial(l));
}

const atRabbits = () =>
  run([
    { type: 'unload', passengerIds: ['sheep-1'] },
    { type: 'move', to: 'shallows' },
    { type: 'move', to: 'rabbit-pier' },
  ]);

describe('plain action and consequence presentation', () => {
  test('uses level-owned names and keeps the original residents and fallbacks', () => {
    expect(levelNames(bellwater)).toEqual({
      nodeNames: {
        harbor: 'Harbor',
        shallows: 'Shallows',
        'low-pier': 'Low Pier',
        'west-buoy': 'West Buoy',
        'east-buoy': 'East Buoy',
        'bell-pier': 'Bell Pier',
      },
      passengerNames: { tansy: 'Tansy · rabbit', lark: 'Lark · rabbit', bram: 'Bram · sheep' },
    });
    expect(passengerList(['tansy', 'lark', 'bram'], bellwater)).toBe('Tansy, Lark and Bram');
    expect(passengerLabel('sheep-1', holdingPier)).toBe('Moss · sheep');
    expect(passengerName('rabbit-1', baseline)).toBe('Pip');
    expect(passengerName('unknown', bellwater)).toBe('unknown');
    expect(nodeName('unknown', bellwater)).toBe('unknown');
    const renamed = structuredClone(holdingPier);
    renamed.names = { nodes: { stone: 'Quiet Pier' }, passengers: { 'sheep-1': 'Fern' } };
    expect(
      actionLabel(initial(renamed), { type: 'unload', passengerIds: ['sheep-1'] }, renamed),
    ).toBe('Let Fern ashore');
    expect(passageCopy(initial(renamed), 'stone', renamed)).toBe('You are at Quiet Pier.');
    expect(passengerName('sheep-1', holdingPier)).toBe('Moss');
  });

  test('Bellwater deadlines, forecasts and transfer previews use its residents and stops', () => {
    const start = initial(bellwater);
    expect(objectiveCopy(start, bellwater)).toEqual({
      headline: 'Bring Tansy, Lark and Bram to Harbor',
      progress: 'Home 0/3',
    });
    expect(statusCopy(start, bellwater).headline).toBe('Low Pier floods in 4 actions.');
    expect(statusCopy(start, bellwater).detail).toContain('Bram waits at Bell Pier.');
    const atLow = run(
      [
        { type: 'move', to: 'west-buoy' },
        { type: 'move', to: 'east-buoy' },
        { type: 'move', to: 'low-pier' },
      ],
      bellwater,
    );
    expect(actionLabel(atLow, { type: 'board', passengerIds: ['tansy', 'lark'] }, bellwater)).toBe(
      'Board Tansy and Lark',
    );
    expect(
      previewCopy(atLow, { type: 'board', passengerIds: ['tansy'] }, bellwater).consequence,
    ).toBe(
      'Tansy boards, then the tide rises. Lark is still waiting at Low Pier when it floods. This ends the crossing.',
    );
    const rescued = reduce(atLow, { type: 'board', passengerIds: ['tansy', 'lark'] }, bellwater);
    expect(statusCopy(rescued, bellwater).headline).toBe('Bell Pier floods in 4 actions.');
    expect(statusCopy(rescued, bellwater).detail).toContain('Tansy and Lark are safe aboard.');
    expect(forecastCopy(rescued, bellwater).detail).toContain('Low Pier is flooded and empty.');
    expect(forecastCopy(rescued, bellwater).detail).toContain(
      'Bell Pier will flood at the next rise; Bram is waiting there.',
    );
    const home = run(
      [
        { type: 'move', to: 'west-buoy' },
        { type: 'move', to: 'east-buoy' },
        { type: 'move', to: 'low-pier' },
        { type: 'board', passengerIds: ['tansy', 'lark'] },
        { type: 'move', to: 'shallows' },
        { type: 'move', to: 'harbor' },
      ],
      bellwater,
    );
    expect(actionLabel(home, { type: 'unload', passengerIds: ['tansy'] }, bellwater)).toBe(
      'Deliver Tansy',
    );
    expect(
      previewCopy(home, { type: 'unload', passengerIds: ['tansy'] }, bellwater).consequence,
    ).toBe('Tansy will be safe at Harbor.');
  });

  test('derives the objective and required-passenger progress from each cove', () => {
    for (const l of [holdingPier, baseline]) {
      const s = initial(l);
      expect(objectiveCopy(s, l)).toEqual({
        headline: 'Bring all three passengers to Harbor',
        progress: 'Home 0/3',
      });
      s.delivered = ['rabbit-1', 'unrequired-passenger'];
      expect(objectiveCopy(s, l).progress).toBe('Home 1/3');
    }
    const altered = structuredClone(holdingPier);
    altered.objective.deliveryPierId = 'stone-pier';
    altered.objective.requiredPassengerIds = ['sheep-1'];
    expect(objectiveCopy(initial(altered), altered)).toEqual({
      headline: 'Bring one passenger to Stone Pier',
      progress: 'Home 0/1',
    });
  });

  test('uses passenger names and direct current-depth comparisons', () => {
    const s = initial(holdingPier);
    expect(passengerList(['rabbit-1', 'rabbit-2'])).toBe('Pip and Rue');
    expect(passengerList(['rabbit-1', 'rabbit-2', 'sheep-1'])).toBe('Pip, Rue and Moss');
    expect(actionLabel(s, { type: 'unload', passengerIds: ['sheep-1'] }, holdingPier)).toBe(
      'Let Moss ashore',
    );
    expect(passageCopy(s, 'shallows', holdingPier)).toBe(
      'Boat needs depth 2. Passage has depth 1: too shallow.',
    );
    expect(passageCopy(s, 'stone', holdingPier)).toBe('You are at Stone Pier.');
    expect(passageCopy(s, 'rabbit-pier', holdingPier)).toContain('No direct passage');
    expect(actionCostCopy(holdingPier)).toBe(
      'Sailing, boarding, unloading and waiting each cost 1 action. Inspection is free.',
    );
  });

  test('unloading previews the lighter boat and actual safe waiting place without mutation', () => {
    const s = initial(holdingPier),
      before = structuredClone(s);
    const copy = previewCopy(s, { type: 'unload', passengerIds: ['sheep-1'] }, holdingPier);
    expect(copy.error).toBeNull();
    expect(copy.requirement).toBe('After unloading: boat needs depth 1.');
    expect(copy.consequence).toBe(
      'Moss will wait at Stone Pier. Stone Pier stays safe through all tide rises.',
    );
    expect(s).toEqual(before);
  });

  test('explains immediate boarding order and distinguishes losing passenger subsets', () => {
    const s = atRabbits();
    const both = previewCopy(
      s,
      { type: 'board', passengerIds: ['rabbit-1', 'rabbit-2'] },
      holdingPier,
    );
    expect(both.consequence).toBe('Pip and Rue board, then the tide rises. Both are safe aboard.');
    expect(both.requirement).toBe('After boarding: boat needs depth 2.');
    const pip = previewCopy(s, { type: 'board', passengerIds: ['rabbit-1'] }, holdingPier);
    expect(pip.consequence).toBe(
      'Pip boards, then the tide rises. Rue is still waiting at Rabbit Pier when it floods. This ends the crossing.',
    );
    const rue = previewCopy(s, { type: 'board', passengerIds: ['rabbit-2'] }, holdingPier);
    expect(rue.consequence).toContain('Pip is still waiting at Rabbit Pier');
    const nobody = previewCopy(s, { type: 'board', passengerIds: [] }, holdingPier);
    expect(nobody.error).toBe('Select at least one passenger.');
    expect(nobody.consequence).toBe('');
    expect(nobody.requirement).toBe('');
    expect(s.turn).toBe(3);
    expect(s.tideLevel).toBe(0);
    expect(s.waitingByPier['rabbit-pier']).toHaveLength(2);
  });

  test('keeps blocked inspection reasons without repeating the dialog inspection label', () => {
    const s = initial(holdingPier),
      before = structuredClone(s),
      blocked = previewCopy(s, { type: 'move', to: 'shallows' }, holdingPier);
    expect(blocked.error).toBe('Boat needs depth 2. Passage has depth 1: too shallow.');
    expect(blocked.consequence).toBe('');
    expect(blocked.requirement).toBe('');
    expect(s).toEqual(before);
  });

  test('prioritizes the remaining action window, then replaces urgency with rescued-passenger facts', () => {
    expect(statusCopy(initial(holdingPier), holdingPier)).toMatchObject({
      headline: 'Rabbit Pier floods in 4 actions.',
      urgent: true,
    });
    const dry = atRabbits();
    const critical = statusCopy(dry, holdingPier);
    expect(critical.headline).toBe('Rabbit Pier floods in 1 action.');
    expect(critical.detail).toContain('The tide rises after your next action.');
    const rescued = reduce(
      dry,
      { type: 'board', passengerIds: ['rabbit-1', 'rabbit-2'] },
      holdingPier,
    );
    const safe = statusCopy(rescued, holdingPier);
    expect(safe.headline).toBe('Pip and Rue are safe aboard.');
    expect(safe.detail).toContain('Moss waits safely at Stone Pier.');
    expect(safe.urgent).toBe(false);
    const forecast = forecastCopy(rescued, holdingPier);
    expect(forecast.detail).toContain('Rabbit Pier is flooded and empty.');
    expect(forecast.detail).not.toContain('Rabbit Pier will flood');
    const loss = reduce(dry, { type: 'board', passengerIds: ['rabbit-1'] }, holdingPier);
    expect(statusCopy(loss, holdingPier).detail).toBe(
      'Undo earlier moves, or restart to try a different plan.',
    );
  });

  test('derives timing and safe waiting from authored tide thresholds', () => {
    const altered = structuredClone(holdingPier);
    altered.rules.tide.rises[0].afterTurn = 6;
    expect(statusCopy(initial(altered), altered).headline).toBe('Rabbit Pier floods in 6 actions.');
    expect(pierSafetyCopy(initial(altered), 'rabbit-pier', altered)).toBe(
      'Rabbit Pier floods in 6 actions.',
    );
    const s = initial(altered);
    s.turn = 5;
    expect(forecastCopy(s, altered).headline).toBe('The tide rises after your next action.');
  });

  test('preserves baseline boarding and exact depth equality information', () => {
    const s = run([{ type: 'move', to: 'sheep-pier' }], baseline);
    const copy = previewCopy(s, { type: 'board', passengerIds: ['sheep-1'] }, baseline);
    expect(copy.error).toBeNull();
    expect(copy.requirement).toBe('After boarding: boat needs depth 3.');
    expect(copy.consequence).toMatch(
      /Moss will be aboard\. Passage to Shallow cut has depth 2: too shallow\./i,
    );
    expect(passageCopy(initial(baseline), 'harbor', baseline)).toBe(
      'Boat needs depth 2. Passage has depth 2: enough depth.',
    );
  });
});
