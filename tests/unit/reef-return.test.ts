import { describe, expect, test } from 'vitest';
import plans from '../../data/reef-return/witnesses.json';
import {
  initial,
  legalActions,
  load,
  passageError,
  passageFlow,
  preview,
  reduce,
  type Action,
  type State,
} from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { checkCurrents, reefReturn as level } from '../../src/levels/level';

const all = level.objective.requiredPassengerIds;
const winning = plans.witnesses[0].actions as Action[];
const split = plans.witnesses[1].actions as Action[];
const missedWindow = plans.losingAlternatives[0].actions as Action[];
const missedPickup = plans.losingAlternatives[1].actions as Action[];
const board = (...passengerIds: string[]): Action => ({ type: 'board', passengerIds });
const unload = (...passengerIds: string[]): Action => ({ type: 'unload', passengerIds });
const sail = (to: string): Action => ({ type: 'move', to });
const homeward: Action = { type: 'move', to: 'harbor' };
const wait: Action = { type: 'wait' };
const reef = level.edges.find((edge) => edge.current)!;

function replay(actions: Action[], session = new Session(level)) {
  for (const action of actions) {
    const before = structuredClone(session.state);
    const predicted = preview(before, action, session.level);
    expect(predicted.error).toBeNull();
    expect(session.state).toEqual(before);
    expect(session.commit(action)?.after).toEqual(predicted.state);
    expect(session.state.turn).toBe(before.turn + 1);
    session.finish();
    const s = session.state;
    expect([...s.aboard, ...s.delivered, ...Object.values(s.waitingByPier).flat()].sort()).toEqual(
      [...all].sort(),
    );
    expect(load(s, level)).toBeLessThanOrEqual(6);
  }
  return session;
}

function firstWin(start: State, allowed: (s: State, a: Action) => boolean = () => true) {
  const lastChange = level.rules.tide.rises.at(-1)!.afterTurn;
  const key = (s: State) =>
    JSON.stringify([
      Math.min(s.turn, lastChange),
      s.boatNodeId,
      s.status,
      [...s.aboard].sort(),
      [...s.delivered].sort(),
      level.piers.map((p) => [...s.waitingByPier[p.id]].sort()),
    ]);
  const queue = [start],
    seen = new Set([key(start)]);
  for (let index = 0; index < queue.length; index++) {
    const s = queue[index];
    if (s.status === 'won') return s.turn;
    if (s.status !== 'playing') continue;
    for (const a of legalActions(s, level)) {
      if (!allowed(s, a)) continue;
      const next = reduce(s, a, level),
        id = key(next);
      if (!seen.has(id)) {
        seen.add(id);
        queue.push(next);
      }
    }
  }
  return null;
}

describe('Repaired Reef Return production rules', () => {
  for (const [index, plan] of plans.witnesses.entries())
    test(`${plan.id} replays every action and restores every snapshot in reverse`, () => {
      const session = replay(plan.actions as Action[]);
      expect(session.state).toMatchObject({
        turn: index === 0 ? 10 : 11,
        tideLevel: 2,
        status: 'won',
      });
      while (session.history.length) {
        const snapshot = structuredClone(session.history.at(-1));
        expect(session.undo()).toBe(true);
        expect(session.state).toEqual(snapshot);
      }
      expect(session.state).toEqual(initial(level));
    });

  test('the full return gathers both rabbits through the inner shoal; the relay delivers five spaces and approaches the other rabbit from Harbor', () => {
    const gathered = replay(winning.slice(0, 6)).state;
    expect(gathered.boatNodeId).toBe('pool');
    expect([...gathered.aboard].sort()).toEqual(['dot', 'flick']);
    expect([...gathered.waitingByPier['quay-pier']].sort()).toEqual(['birch', 'heather']);
    const loadAtReef = replay(winning.slice(0, 8)).state;
    expect(load(loadAtReef, level)).toBe(6);
    const relay = replay(split.slice(0, 7)).state;
    expect(relay.boatNodeId).toBe('harbor');
    expect([...relay.delivered].sort()).toEqual(['birch', 'dot', 'heather']);
    expect(relay.waitingByPier['pool-pier']).toEqual(['flick']);
    const lastPickup = replay(split.slice(0, 9)).state;
    expect(lastPickup).toMatchObject({ boatNodeId: 'pool', tideLevel: 2, aboard: ['flick'] });
    expect(passageError(lastPickup, 'harbor', level)).toBeNull();
  });

  test('the deep reef opens after Dot boards, then the loaded boat must commit its last homeward crossing before the second rise', () => {
    expect(passageFlow(reef, initial(level).tideLevel)?.from).toBe('harbor');
    const firstRise = replay(winning.slice(0, 3));
    expect(passageFlow(reef, firstRise.state.tideLevel)?.to).toBe('harbor');
    expect(firstRise.undo()).toBe(true);
    expect(passageFlow(reef, firstRise.state.tideLevel)?.to).toBe('quay');
    const session = replay(missedWindow.slice(0, -1));
    const before = structuredClone(session.state);
    expect(passageError(before, 'harbor', level)).toBeNull();
    expect(preview(before, wait, level).state.lossReason?.code).toBe('RETURN_DEPTH');
    replay([wait], session);
    expect(session.state.lossReason).toEqual({
      code: 'RETURN_DEPTH',
      edgeId: reef.id,
      passengerIds: all,
      draft: 4,
    });
    expect(passageError(session.state, 'harbor', level)).toContain(
      'only from Harbor to Cairn Quay',
    );
    expect(passageError(session.state, 'pool', level)).toContain('depth 3 is below draft 4');
    expect(session.commit(homeward)).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(before);
    replay([homeward, ...Array.from({ length: 30 }, () => wait), unload(...all)], session);
    expect(session.state).toMatchObject({ status: 'won', turn: 40 });
  });

  test('parking everyone at the quay or prioritizing a delivery over the last pickup has an actual consequence', () => {
    const parked = replay([...winning.slice(0, 7), unload('dot', 'flick')]);
    expect([...parked.state.waitingByPier['quay-pier']].sort()).toEqual([...all].sort());
    expect(firstWin(parked.state)).toBeNull();
    replay([wait], parked);
    expect(parked.state.lossReason).toMatchObject({
      code: 'PASSENGER_STRANDED',
      pierId: 'quay-pier',
    });
    const missed = replay(missedPickup);
    expect(missed.state.lossReason).toEqual({
      code: 'PASSENGER_STRANDED',
      pierId: 'pool-pier',
      passengerIds: ['flick'],
    });
    expect(missed.undo()).toBe(true);
    expect(replay(split.slice(8), missed).state.status).toBe('won');
  });

  test('only a permanent lack of a reachable dry landing strands the heavy boat', () => {
    const shelf = structuredClone(level);
    shelf.piers.find((p) => p.nodeId === 'wrack')!.elevation = 3;
    const session = replay(missedWindow, new Session(shelf));
    expect(session.state).toMatchObject({ status: 'playing', tideLevel: 2, boatNodeId: 'quay' });
    expect(passageError(session.state, 'pool', shelf)).toContain('depth 3 is below draft 4');
    const early = ['dot', 'flick'],
      late = ['heather', 'birch'];
    replay(
      [
        sail('wrack'),
        unload(...late),
        sail('quay'),
        sail('pool'),
        homeward,
        unload(...early),
        sail('pool'),
        sail('quay'),
        sail('wrack'),
        board(...late),
        sail('quay'),
        sail('pool'),
        homeward,
        unload(...late),
      ],
      session,
    );
    expect(session.state.status).toBe('won');
  });

  test('enumerating every legal subset and path rules out collecting without staging, small ferries and bypassing the reef', () => {
    const start = initial(level);
    expect(firstWin(start)).toBe(10);
    expect(
      firstWin(start, (s, a) => !(a.type === 'unload' && s.boatNodeId !== 'harbor')),
    ).toBeNull();
    expect(
      firstWin(start, (s, a) => !(a.type === 'move' && a.to === 'harbor' && load(s, level) > 4)),
    ).toBeNull();
    expect(
      firstWin(
        start,
        (s, a) => !(a.type === 'move' && a.to === 'harbor' && s.boatNodeId === 'quay'),
      ),
    ).toBeNull();
    expect(
      firstWin(start, (s, a) => !(a.type === 'move' && a.to === 'harbor' && load(s, level) === 6)),
    ).toBe(11);
    const splitOpening = replay(split.slice(0, 4)).state;
    expect(
      firstWin(
        splitOpening,
        (s, a) =>
          !(
            a.type === 'move' &&
            a.to === 'harbor' &&
            s.waitingByPier['pool-pier'].includes('flick')
          ),
      ),
    ).toBeNull();
  });

  test('a cove with a second current cannot silently blame the first passage for a cutoff', () => {
    const malformed = structuredClone(level);
    const edge = malformed.edges.find((entry) => !entry.current)!;
    edge.bidirectional = false;
    edge.current = {
      name: 'A second current',
      phases: reef.current!.phases.map(({ tideLevel }) => ({
        tideLevel,
        from: edge.nodes[0],
        to: edge.nodes[1],
      })),
    };
    expect(() => checkCurrents(malformed)).toThrow(/Only one current passage/);
  });

  test('authored current phases cover every tide exactly once with two real endpoints', () => {
    for (const variant of ['missing', 'duplicate', 'outside', 'same', 'conflict']) {
      const malformed = structuredClone(level),
        edge = malformed.edges.find((e) => e.current)!;
      const phases = edge.current!.phases;
      if (variant === 'missing') phases.pop();
      if (variant === 'duplicate') phases[2].tideLevel = phases[1].tideLevel;
      if (variant === 'outside') phases[2].from = 'pool';
      if (variant === 'same') phases[2].from = phases[2].to;
      if (variant === 'conflict') edge.bidirectional = true;
      expect(() => checkCurrents(malformed)).toThrow(/current schedule/);
    }
  });
});
