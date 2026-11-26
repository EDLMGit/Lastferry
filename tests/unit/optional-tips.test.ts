import { describe, expect, test, vi } from 'vitest';
import widePlans from '../../data/wide-berth/witnesses.json';
import reefPlans from '../../data/reef-return/witnesses.json';
import { copy, initial, preview, reduce, type Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { holdingPier, reefReturn, wideBerth, type Level } from '../../src/levels/level';
import { locationFacts } from '../../src/ui/location';
import { forecastCopy, previewCopy, statusCopy } from '../../src/ui/presentation';
import { TipsPreference, tipsStorageKey } from '../../src/ui/tips-preference';
import { transferFacts, transferReceipt } from '../../src/ui/transfer';

function at(level: Level, actions: Action[], turn = actions.length) {
  return actions.slice(0, turn).reduce((state, action) => reduce(state, action, level), initial(level));
}

function memory(values = new Map<string, string>()) {
  return {
    values,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
  };
}

describe('optional tips preference', () => {
  test('fresh and existing players default Off without writing progress or a preference', () => {
    for (const stored of [undefined, 'invalid']) {
      const store = memory(new Map([['journey-fixture', 'completed coves']]));
      if (stored) store.values.set(tipsStorageKey, stored);
      const preference = new TipsPreference(store);
      expect(preference.enabled).toBe(false);
      expect(store.setItem).not.toHaveBeenCalled();
      expect(store.values.get('journey-fixture')).toBe('completed coves');
    }
  });

  test('both choices survive a new instance using only the independent preference key', () => {
    const store = memory(new Map([['journey-fixture', 'completed coves']]));
    const preference = new TipsPreference(store);
    preference.setEnabled(true);
    expect(new TipsPreference(store).enabled).toBe(true);
    preference.setEnabled(false);
    expect(new TipsPreference(store).enabled).toBe(false);
    expect(store.setItem.mock.calls.every(([key]) => key === tipsStorageKey)).toBe(true);
    expect(store.values.get('journey-fixture')).toBe('completed coves');
  });

  test('denied reads and writes still allow an in-session choice', () => {
    const store = {
      getItem() { throw new Error('Read denied'); },
      setItem() { throw new Error('Write denied'); },
    };
    const preference = new TipsPreference(store);
    expect(preference.enabled).toBe(false);
    preference.setEnabled(true);
    expect(preference.enabled).toBe(true);
    preference.setEnabled(false);
    expect(preference.enabled).toBe(false);
  });
});

describe('optional conclusions with factual inspection', () => {
  test('Wide hides the capacity conclusion and risk identity for a legal losing crossing', () => {
    const plan = widePlans.losingAlternatives.find(entry => entry.id === 'one-space-shuttle')!;
    const before = at(wideBerth, plan.actions as Action[], 3);
    const action: Action = { type: 'move', to: 'harbor' };
    const off = locationFacts(before, 'harbor', wideBerth, false);
    const on = locationFacts(before, 'harbor', wideBerth, true);
    expect(off).toMatchObject({ canSail: true, wouldLose: false, status: 'safe' });
    expect(on).toMatchObject({ canSail: true, wouldLose: true, status: 'loss' });
    expect(off.passage).toBe(on.passage);
    expect(off.passage).toContain('Passage has depth 2');
    expect(off.passage).toContain('Beacon Reef');
    expect(off.consequence).not.toMatch(/too much|homeward trip|ends|cut off/i);
    expect(on.consequence).toContain('homeward trip');
    expect(preview(before, action, wideBerth).state.lossReason?.code).toBe('RETURN_CAPACITY');
    const actual = statusCopy(reduce(before, action, wideBerth), wideBerth);
    expect(actual.detail).toContain('homeward trip');
    expect(actual.detail).toContain('Undo');
    expect(before.status).toBe('playing');
  });

  test('Reef retains the tide boundary but hides the future trapped-load conclusion', () => {
    const before = at(reefReturn, reefPlans.witnesses[0].actions as Action[], 8);
    const wait: Action = { type: 'wait' };
    const off = previewCopy(before, wait, reefReturn, false);
    const on = previewCopy(before, wait, reefReturn, true);
    expect(off.requirement).toBe(on.requirement);
    expect(off.requirement).toContain('depth 4');
    expect(off.consequence).toContain('tide rises');
    expect(off.consequence).not.toMatch(/no dry landing|cannot|ends|too deep|cut off/);
    expect(on.consequence).toContain('no dry landing');
    const actual = statusCopy(reduce(before, wait, reefReturn), reefReturn);
    expect(actual.detail).toContain('cannot reach a dry landing');
    expect(actual.detail).toContain('Undo');
    expect(forecastCopy(before, reefReturn).schedule).toEqual([
      { turn: 9, direction: 'Harbor → Cairn Quay', depth: 5, floods: ['Cairn Quay', 'Shell Pool'] },
    ]);
  });

  test.each(['wrack', 'harbor'])('a genuinely blocked %s passage is factual in both modes', stop => {
    const before = initial(reefReturn);
    const off = locationFacts(before, stop, reefReturn, false);
    const on = locationFacts(before, stop, reefReturn, true);
    expect(off.canSail).toBe(false);
    expect(off.passage).toBe(on.passage);
    expect(off.limitation).toBe(on.limitation);
    expect(off.status).toBe(stop === 'wrack' ? 'too-shallow' : 'against-current');
    expect(off.limitation).toMatch(stop === 'wrack' ? /needs depth 3.*depth 2/ : /Needle Reef flows only from Harbor to Cairn Quay/);
  });

  test('a proposed heavy mixed load keeps depth and choices but hides comparisons to other passages', () => {
    const before = at(reefReturn, reefPlans.witnesses[0].actions as Action[], 7);
    const action = { type: 'board' as const, passengerIds: ['heather', 'birch'] };
    const off = transferFacts(before, action, reefReturn, false);
    const on = transferFacts(before, action, reefReturn, true);
    expect(off).toMatchObject({ direct: false, error: null, depth: 'Needs depth 2 → 4', load: '6/6 spaces' });
    expect(off.label).toBe(on.label);
    expect(off.detail).not.toContain('too shallow');
    expect(on.detail).toContain('too shallow');
    const chosen = transferFacts(before, { type: 'board', passengerIds: ['heather'] }, reefReturn, false);
    expect(chosen.load).toBe('4/6 spaces');
    expect(chosen.detail).not.toContain('too shallow');
  });

  test('a legal losing transfer with one passenger stays direct when Tips are Off', () => {
    const before = at(wideBerth, widePlans.witnesses[1].actions as Action[], 3);
    expect(before.aboard).toEqual(['alder']);
    const action = { type: 'unload' as const, passengerIds: ['alder'] };
    expect(preview(before, action, wideBerth).state.lossReason?.code).toBe('RETURN_CAPACITY');
    expect(transferFacts(before, action, wideBerth, false).direct).toBe(true);
    expect(transferFacts(before, action, wideBerth, true).direct).toBe(false);
    const actual = reduce(before, action, wideBerth);
    expect(transferReceipt(before, actual, action, wideBerth).title).toBe('Alder ashore · 1 action used');
    expect(statusCopy(actual, wideBerth).detail).toContain('Undo');
  });

  test('changing a passenger subset recomputes advice without retaining the prior flood conclusion', () => {
    const before = at(holdingPier, [
      { type: 'unload', passengerIds: ['sheep-1'] },
      { type: 'move', to: 'shallows' },
      { type: 'move', to: 'rabbit-pier' },
    ]);
    const subset = { type: 'board' as const, passengerIds: ['rabbit-1'] };
    expect(transferFacts(before, subset, holdingPier, true).detail).toContain('ends the crossing');
    expect(transferFacts(before, subset, holdingPier, false).detail).not.toMatch(/Rue|ends the crossing/);
    const both = { type: 'board' as const, passengerIds: ['rabbit-1', 'rabbit-2'] };
    expect(transferFacts(before, both, holdingPier, true).detail).not.toContain('ends the crossing');
    expect(transferFacts(before, both, holdingPier, false).direct).toBe(false);
    expect(statusCopy(reduce(before, subset, holdingPier), holdingPier).headline).toContain('Rue');
  });
});

describe.each([
  { level: wideBerth, plans: widePlans },
  { level: reefReturn, plans: reefPlans },
])('$level.id actions and Undo ignore the preference', ({ level, plans }) => {
  test('winning and losing witnesses have identical snapshots under both settings', () => {
    for (const plan of [...plans.witnesses, ...plans.losingAlternatives]) {
      const snapshots = [false, true].map(enabled => {
        const preference = new TipsPreference(memory());
        preference.setEnabled(enabled);
        const session = new Session(level);
        const states = [copy(session.state)];
        for (const action of plan.actions as Action[]) {
          const before = copy(session.state);
          const history = copy(session.history);
          previewCopy(before, action, level, preference.enabled);
          if (action.type === 'move') locationFacts(before, action.to, level, preference.enabled);
          if (action.type === 'board' || action.type === 'unload') transferFacts(before, action, level, preference.enabled);
          expect(session.state).toEqual(before);
          expect(session.history).toEqual(history);
          expect(session.commit(action)).not.toBeNull();
          session.finish();
          states.push(copy(session.state));
        }
        for (const previous of states.slice(0, -1).reverse()) {
          expect(session.undo()).toBe(true);
          expect(session.state).toEqual(previous);
          expect(preference.enabled).toBe(enabled);
        }
        session.restart();
        expect(preference.enabled).toBe(enabled);
        expect(session.state).toEqual(initial(level));
        return states;
      });
      expect(snapshots[0]).toEqual(snapshots[1]);
    }
  });
});
