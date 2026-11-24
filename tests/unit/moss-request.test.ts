import { describe, expect, test } from 'vitest';
import ordinary from '../../data/experiments/holding-pier-solution.json';
import { JOURNEY_STORAGE_KEY, JourneyProgress } from '../../src/campaign/progress';
import { HarborEntryStore, HARBOR_LOG_KEY } from '../../src/game/moss-request';
import type { Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { holdingPier } from '../../src/levels/level';

const route = ordinary.actions as Action[];
const rabbits = ['rabbit-1', 'rabbit-2'];
const moss = ['sheep-1'];
const move = (to: string): Action => ({ type: 'move', to });
const unload = (passengerIds: string[]): Action => ({ type: 'unload', passengerIds });
const board = (passengerIds: string[]): Action => ({ type: 'board', passengerIds });
const firstDelivery = [...route.slice(0, 6), move('harbor'), unload(rabbits)];
const returnForMoss = [move('stone'), board(moss), move('harbor'), unload(moss)];
function play(session: Session, actions: Action[]) {
  for (const action of actions) {
    expect(session.commit(action)).not.toBeNull();
    session.finish();
  }
}

describe('Moss’s request as a promise about the surviving trip', () => {
  test('both rabbits arrive on eight while Moss waits at Stone; the committed twelve-action win qualifies', () => {
    const session = new Session(holdingPier);
    play(session, firstDelivery);
    expect(session.state).toMatchObject({ turn: 8, delivered: rabbits, waitingByPier: { 'stone-pier': moss } });
    expect(session.fulfillsMossRequest).toBe(false);
    play(session, returnForMoss);
    expect(session.result).toMatchObject({ actions: 12, lanterns: 1 });
    expect(session.fulfillsMossRequest).toBe(true);
    expect(session.undo()).toBe(true);
    expect(session.fulfillsMossRequest).toBe(false);
    play(session, [{ type: 'wait' }, unload(moss)]);
    expect(session.fulfillsMossRequest).toBe(true);
    session.takeResult();
    expect(session.fulfillsMossRequest).toBe(false);
  });

  test('undo removes the qualifying delivery and a new branch delivering from the same boat earns only its rating', () => {
    const session = new Session(holdingPier);
    play(session, firstDelivery);
    expect(session.undo()).toBe(true);
    expect(session.state).toMatchObject({ turn: 7, delivered: [], aboard: rabbits });
    play(session, [move('stone'), board(moss), move('harbor'), unload(rabbits), unload(moss)]);
    expect(session.result).not.toBeNull();
    expect(session.fulfillsMossRequest).toBe(false);
    const ordinarySession = new Session(holdingPier);
    play(ordinarySession, route);
    expect(ordinarySession.result?.lanterns).toBe(3);
    expect(ordinarySession.fulfillsMossRequest).toBe(false);
  });

  test('separate unloads qualify only if Moss waits at Stone for both', () => {
    const session = new Session(holdingPier);
    play(session, [...firstDelivery.slice(0, -1), unload([rabbits[0]]), { type: 'wait' }, unload([rabbits[1]]), ...returnForMoss]);
    expect(session.fulfillsMossRequest).toBe(true);
    session.restart();
    play(session, [...route.slice(0, -1), unload([rabbits[0]]), move('stone'), unload(moss), move('harbor'), unload([rabbits[1]]), ...returnForMoss]);
    expect(session.result).not.toBeNull();
    expect(session.fulfillsMossRequest).toBe(false);
  });
});

function memory() {
  const values = new Map<string, string>();
  const writes: string[] = [];
  return {
    values, writes,
    getItem: (key: string) => values.get(key) ?? null,
    setItem(key: string, value: string) { values.set(key, value); writes.push(key); },
  };
}

describe('Harbor keepsakes and the detour checkpoint', () => {
  test('separate stores merge the two entries, recognize repeats, and preserve both across relaunch', () => {
    const storage = memory();
    const a = new HarborEntryStore(() => storage), b = new HarborEntryStore(() => storage);
    a.keep('rue-lantern');
    expect(a.mossEarned).toBe(false);
    b.keep('moss-own-crossing');
    a.keep('moss-own-crossing');
    b.keep('moss-own-crossing');
    expect(storage.writes).toEqual([HARBOR_LOG_KEY, HARBOR_LOG_KEY]);
    const restored = new HarborEntryStore(() => storage);
    expect(restored.holdingRescued && restored.mossEarned).toBe(true);
  });

  test('failed and silent writes stay usable in this visit and can retry the same entry', () => {
    for (const fail of ['reject', 'silent']) {
      const storage = memory();
      const write = storage.setItem.bind(storage);
      storage.setItem = () => { if (fail === 'reject') throw Error('Quota'); };
      const log = new HarborEntryStore(() => storage);
      log.keep('moss-own-crossing');
      expect(log.mossEarned).toBe(true);
      expect(log.issue).toContain('visit');
      expect(storage.values.has(HARBOR_LOG_KEY)).toBe(false);
      storage.setItem = write;
      log.keep('moss-own-crossing');
      expect(log.issue).toBeNull();
      expect(new HarborEntryStore(() => storage).mossEarned).toBe(true);
    }
  });

  test('an unreadable or newer record is never replaced by a retry', () => {
    for (const raw of ['{', '{"version":2,"entries":["unknown"]}']) {
      const storage = memory();
      storage.values.set(HARBOR_LOG_KEY, raw);
      const log = new HarborEntryStore(() => storage);
      expect(log.issue).toContain('visit');
      log.keep('moss-own-crossing');
      log.retry();
      expect(log.mossEarned).toBe(true);
      expect(storage.values.get(HARBOR_LOG_KEY)).toBe(raw);
      expect(storage.writes).toEqual([]);
    }
  });

  test('a failed detour checkpoint stays provisional; a written but unconfirmed checkpoint retries exactly once', () => {
    for (const writeBeforeFailure of [true, false]) {
      const storage = memory();
      const journey = new JourneyProgress(() => storage);
      journey.replace();
      journey.acknowledge('opening');
      const old = storage.values.get(JOURNEY_STORAGE_KEY);
      const write = storage.setItem.bind(storage);
      storage.setItem = (key, value) => {
        if (writeBeforeFailure) write(key, value);
        throw Error('Access failed');
      };
      expect(journey.accept('holding-pier', 'won', true)).toBe(false);
      expect(journey.snapshot.record?.completed).toEqual([]);
      if (!writeBeforeFailure) expect(storage.values.get(JOURNEY_STORAGE_KEY)).toBe(old);
      storage.setItem = write;
      expect(journey.accept('holding-pier', 'won', true)).toBe(true);
      expect(storage.writes).toHaveLength(3);
      expect(new JourneyProgress(() => storage).snapshot.record?.checkpoint).toEqual({ kind: 'scene', id: 'another-bell' });
    }
  });
});
