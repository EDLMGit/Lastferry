import { describe, expect, test } from 'vitest';
import plans from '../../data/ternhaven/witnesses.json';
import { storyCoves, practiceCoves } from '../../src/campaign/registry';
import { JOURNEY_STORAGE_KEY } from '../../src/campaign/progress';
import { lastFerry, ternhaven } from '../../src/levels/level';
import { type Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { MasteryStore, MASTERY_STORAGE_KEY, masteryTargets, resultFor,
  type MasteryResult } from '../../src/game/mastery';

const acceptedBefore = {
  'first-crossing': { revision: 1, target: 8 },
  'holding-pier': { revision: 1, target: 9 },
  bellwater: { revision: 1, target: 10 },
  'driftwood-yard': { revision: 1, target: 12 },
  'two-shelters': { revision: 1, target: 12 },
  'wide-berth': { revision: 1, target: 14 },
  'reef-return': { revision: 1, target: 11 },
  'orchard-landing': { revision: 1, target: 13 },
};

function play(actions: Action[], session = new Session(ternhaven)) {
  for (const action of actions) {
    expect(session.commit(action)).not.toBeNull();
    session.finish();
  }
  return session;
}

function backing(raw: string | null = null) {
  const values = new Map<string, string>();
  if (raw !== null) values.set(MASTERY_STORAGE_KEY, raw);
  const writes: string[] = [];
  const owner = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem(key: string, value: string) { writes.push(key); values.set(key, value); },
  };
  return { owner, values, writes };
}

describe('accepted Ternhaven arrival scoring', () => {
  test('only Ternhaven target 14 revision 1 joins the eight accepted ratings', () => {
    expect(masteryTargets).toEqual({ ...acceptedBefore, ternhaven: { revision: 1, target: 14 } });
    expect(practiceCoves).toHaveLength(13);
    expect(storyCoves).toHaveLength(12);
    expect(storyCoves.at(-1)?.level).toBe(lastFerry);
  });

  test.each(plans.witnesses)('$id earns three, terminal Undo redelivery earns two and acceptance is once', plan => {
    const storage = backing();
    const store = new MasteryStore(() => storage.owner);
    const actions = plan.actions as Action[];
    const session = play(actions.slice(0, -1));
    expect(session.result).toBeNull();
    expect(session.commit(actions.at(-1)!)).not.toBeNull();
    expect(session.result).toBeNull();
    expect(session.takeResult()).toBeNull();
    session.finish();
    expect(session.result).toEqual(resultFor('ternhaven', actions.length, 0));
    expect(session.result?.lanterns).toBe(3);
    expect(storage.writes).toEqual([]);
    expect(store.best('ternhaven')).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.result).toBeNull();
    play(actions.slice(-1), session);
    expect(session.result).toEqual(resultFor('ternhaven', actions.length, 1));
    expect(session.result?.lanterns).toBe(2);
    expect(storage.writes).toEqual([]);
    expect(store.accept(session.takeResult())).toBe(true);
    expect(session.takeResult()).toBeNull();
    expect(store.best('ternhaven')).toEqual(resultFor('ternhaven', actions.length, 1));
    expect(storage.writes).toEqual([MASTERY_STORAGE_KEY]);
    expect(new MasteryStore(() => storage.owner).best('ternhaven')).toEqual(store.best('ternhaven'));
  });

  test('every older accepted best stays readable without backfilling a Ternhaven result', () => {
    const old = Object.fromEntries(Object.entries(acceptedBefore).map(([id, target]) =>
      [id + '@1', resultFor(id, target.target, 0)!]));
    const raw = '\n' + JSON.stringify({ version: 1, results: old }, null, 2) + '\n';
    const storage = backing(raw);
    const journey = '\n' + JSON.stringify({ version: 1, completed: ['holding-pier', 'bellwater'],
      acknowledgedScenes: ['opening', 'another-bell'], checkpoint: { kind: 'complete' } }, null, 2);
    storage.values.set(JOURNEY_STORAGE_KEY, journey);
    const store = new MasteryStore(() => storage.owner);
    for (const result of Object.values(old)) expect(store.best(result.coveId)).toEqual(result);
    expect(store.best('ternhaven')).toBeNull();
    expect(storage.writes).toEqual([]);
    expect(storage.values.get(MASTERY_STORAGE_KEY)).toBe(raw);
    const oldWon = play(plans.witnesses[0].actions as Action[]).state;
    const restored = new Session(ternhaven);
    restored.state = structuredClone(oldWon);
    restored.finish();
    expect(restored.result).toBeNull();
    expect(store.accept(restored.takeResult())).toBe(false);
    expect(storage.values.get(MASTERY_STORAGE_KEY)).toBe(raw);
    const fresh = play(plans.witnesses[2].actions as Action[]);
    expect(store.best('ternhaven')).toBeNull();
    expect(storage.writes).toEqual([]);
    expect(store.accept(fresh.takeResult())).toBe(true);
    const saved = JSON.parse(storage.values.get(MASTERY_STORAGE_KEY)!);
    expect(saved.results).toEqual({ ...old, 'ternhaven@1': resultFor('ternhaven', 13, 0) });
    expect(storage.values.get(JOURNEY_STORAGE_KEY)).toBe(journey);
    expect(storage.writes).toEqual([MASTERY_STORAGE_KEY]);
  });

  test('current one and two lantern rescues never borrow a better accepted three-lantern best', () => {
    const oldBest = resultFor('ternhaven', 13, 0)!;
    const raw = JSON.stringify({ version: 1, results: { 'ternhaven@1': oldBest } });
    const storage = backing(raw);
    const store = new MasteryStore(() => storage.owner);
    const actions = plans.witnesses[0].actions as Action[];
    const slow = play([...actions.slice(0, -1), { type: 'wait' }, actions.at(-1)!]);
    expect(slow.result).toMatchObject({ actions: 15, successfulUndos: 0, lanterns: 1 });
    expect(store.best('ternhaven')).toEqual(oldBest);
    expect(store.accept(slow.takeResult())).toBe(false);
    const withUndo = play(actions);
    expect(withUndo.undo()).toBe(true);
    play(actions.slice(-1), withUndo);
    expect(withUndo.result).toMatchObject({ actions: 14, successfulUndos: 1, lanterns: 2 });
    expect(store.accept(withUndo.takeResult())).toBe(false);
    expect(store.best('ternhaven')).toEqual(oldBest);
    expect(storage.values.get(MASTERY_STORAGE_KEY)).toBe(raw);
    expect(storage.writes).toEqual([]);
  });

  test('historical scoring revisions and a failed save remain honest after registration', () => {
    const future: MasteryResult = { coveId: 'ternhaven', revision: 2, actions: 13, successfulUndos: 0, lanterns: 3 };
    const storage = backing(JSON.stringify({ version: 1, results: { 'ternhaven@2': future } }));
    const store = new MasteryStore(() => storage.owner);
    expect(store.best('ternhaven')).toBeNull();
    expect(store.accept(future)).toBe(false);
    const fresh = play(plans.witnesses[2].actions as Action[]).takeResult();
    expect(store.accept(fresh)).toBe(true);
    expect(JSON.parse(storage.values.get(MASTERY_STORAGE_KEY)!).results['ternhaven@2']).toEqual(future);
    const unavailable = new MasteryStore(() => ({ getItem: () => null,
      setItem: () => { throw new Error('Storage full'); } }));
    expect(unavailable.accept(fresh)).toBe(true);
    expect(unavailable.best('ternhaven')).toEqual(fresh);
    expect(unavailable.persistent).toBe(false);
    expect(unavailable.issue).toContain('this visit');
  });
});
