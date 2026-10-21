import { describe, expect, test } from 'vitest';
import { initial, reduce, type Action, type State } from '../../src/game/rules';
import { holdingPier, level as baseline, type Level } from '../../src/levels/level';
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
