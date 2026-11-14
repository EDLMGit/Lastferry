import { describe, expect, test } from 'vitest';
import { wideBerth as level, type Level } from '../../src/levels/level';
import witnessData from '../../data/wide-berth/witnesses.json';
import {
  currentHomeBank,
  draft,
  initial,
  legalActions,
  load,
  passageFlow,
  passageError,
  preview,
  reduce,
  type Action,
  type State,
} from '../../src/game/rules';
import { Session } from '../../src/game/session';

const plans = witnessData.witnesses.map((w) => ({ ...w, actions: w.actions as Action[] }));
const failures = witnessData.losingAlternatives.map((w) => ({
  ...w,
  actions: w.actions as Action[],
}));
const current = level.edges.find((e) => e.current)!;
const home: Action = { type: 'move', to: 'harbor' };
const wait: Action = { type: 'wait' };
const all = level.objective.requiredPassengerIds;

function replay(actions: Action[], session = new Session(level)) {
  for (const action of actions) {
    const before = structuredClone(session.state);
    const predicted = preview(session.state, action, session.level);
    expect(predicted.error).toBeNull();
    expect(session.state).toEqual(before);
    expect(session.commit(action)?.after).toEqual(predicted.state);
    expect(session.commit(action)).toBeNull();
    session.finish();
    const s = session.state;
    expect(s.turn).toBe(before.turn + 1);
    expect([...s.aboard, ...s.delivered, ...Object.values(s.waitingByPier).flat()].sort()).toEqual(
      [...all].sort(),
    );
    expect(load(s, session.level)).toBeLessThanOrEqual(6);
  }
  return session;
}

function firstWin(allowed: (s: State, a: Action) => boolean = () => true) {
  const finalTide = level.rules.tide.rises.at(-1)!.afterTurn;
  const key = (s: State) =>
    JSON.stringify([
      Math.min(s.turn, finalTide),
      s.boatNodeId,
      [...s.aboard].sort(),
      [...s.delivered].sort(),
      level.piers.map((p) => [...s.waitingByPier[p.id]].sort()),
    ]);
  const start = initial(level),
    queue = [start],
    seen = new Set([key(start)]);
  for (let i = 0; i < queue.length; i++) {
    const s = queue[i];
    for (const action of legalActions(s, level)) {
      if (!allowed(s, action)) continue;
      const next = reduce(s, action, level);
      if (next.status === 'won') return next.turn;
      if (next.status !== 'playing') continue;
      const id = key(next);
      if (!seen.has(id)) {
        seen.add(id);
        queue.push(next);
      }
    }
  }
  return null;
}

describe('Wide Berth: shallow first trip, outward tide and full final crossing', () => {
  for (const [i, plan] of plans.entries())
    test(plan.id, () => {
      const session = replay(plan.actions);
      expect(session.state.status).toBe('won');
      expect(session.state.turn).toBe([12, 14][i]);
      expect(session.history[3]).toMatchObject({ boatNodeId: 'high-quay', tideLevel: 0 });
      expect(load(session.history[3], level)).toBe(2);
      expect(session.history[4]).toMatchObject({ boatNodeId: 'harbor', tideLevel: 1 });
      const finalDeparture = session.history.at(-2)!;
      expect(finalDeparture.boatNodeId).toBe('high-quay');
      expect(load(finalDeparture, level)).toBe(6);
      if (i === 1) expect(finalDeparture.aboard).toHaveLength(5);
      while (session.history.length) {
        const snapshot = structuredClone(session.history.at(-1));
        expect(session.undo()).toBe(true);
        expect(session.state).toEqual(snapshot);
      }
      expect(session.state).toEqual(initial(level));
    });

  for (const plan of failures)
    test(plan.id, () => {
      const session = replay(plan.actions);
      expect(session.state.status).toBe('lost');
      expect(session.state.turn).toBe(plan.actions.length);
      const before = structuredClone(session.history.at(-1));
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(before);
    });

  test('permission, depth and the missed opening are derived before the tide, then entirely restored by Undo', () => {
    const session = replay(plans[0].actions.slice(0, 2));
    const full = structuredClone(session.state);
    expect(passageFlow(current, 0)?.to).toBe('harbor');
    expect(currentHomeBank(level, current)).toBe('harbor');
    expect(passageError(full, 'harbor', level)).toContain('depth 2 is below draft 4');
    expect(session.commit(home)).toBeNull();
    expect(session.state).toEqual(full);
    replay(plans[0].actions.slice(2, 3), session);
    const last = structuredClone(session.state);
    expect(draft(last, level)).toBe(2);
    expect(passageError(last, 'harbor', level)).toBeNull();
    expect(preview(last, wait, level).state.lossReason).toMatchObject({
      code: 'RETURN_CAPACITY',
      edgeId: current.id,
      offshoreSlots: 8,
      homewardTrips: 1,
    });
    replay([wait], session);
    expect(passageError(session.state, 'harbor', level)).toContain('from Harbor to High Quay');
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(last);
    replay(plans[0].actions.slice(3), session);
    expect(session.state.status).toBe('won');
  });

  test('one early rabbit leaves seven offshore slots; parking the full group leaves eight', () => {
    for (const [index, slots] of [
      [0, 8],
      [1, 7],
      [2, 8],
    ]) {
      const { state } = replay(failures[index].actions);
      expect(state.lossReason).toMatchObject({
        code: 'RETURN_CAPACITY',
        homewardTrips: 1,
        offshoreSlots: slots,
      });
    }
    const fork = replay(plans[0].actions.slice(0, 10));
    expect(passageFlow(current, fork.state.tideLevel)?.to).toBe('harbor');
    const group = fork.state.aboard;
    replay([{ type: 'unload', passengerIds: [group[0]] }, home], fork);
    expect(fork.state.lossReason).toMatchObject({
      code: 'RETURN_CUT_OFF',
      passengerIds: [group[0]],
    });
  });

  test('deep outer branch serves the pickup banks; restoring the old bypass restores a safe-parking victory', () => {
    expect(
      level.edges
        .filter((e) => e.nodes.includes('outer-buoy'))
        .map((e) => e.nodes.find((id) => id !== 'outer-buoy'))
        .sort(),
    ).toEqual(['high-quay', 'shell-landing']);
    const detour: Level = structuredClone(level);
    detour.edges.push({
      id: 'old-ocean-bypass',
      nodes: ['outer-buoy', 'harbor'],
      baseDepth: 4,
      bidirectional: true,
      waypointsXZ: [],
    });
    expect(
      currentHomeBank(
        detour,
        detour.edges.find((e) => e.current)!,
      ),
    ).toBeUndefined();
    const session = replay(failures[0].actions, new Session(detour));
    const shell = ['sorrel', 'finch'];
    const move = (to: string): Action => ({ type: 'move', to });
    replay(
      [
        move('shell-landing'),
        { type: 'board', passengerIds: shell },
        move('high-quay'),
        { type: 'unload', passengerIds: shell },
      ],
      session,
    );
    expect(session.state.waitingByPier['high-quay-pier']).toHaveLength(6);
    replay(
      Array.from({ length: 100 }, () => wait),
      session,
    );
    for (const subset of [['alder', 'clover', 'wren', 'poppy'], shell]) {
      replay(
        [{ type: 'board', passengerIds: subset }, home, { type: 'unload', passengerIds: subset }],
        session,
      );
      if (session.state.status !== 'won') replay([move('outer-buoy'), move('high-quay')], session);
    }
    expect(session.state.status).toBe('won');
  });

  test('no winning path parks through the opening, makes repeated small trips, or skips splitting at High Quay', () => {
    expect(firstWin()).toBe(12);
    expect(
      firstWin(
        (s, a) =>
          !(a.type === 'move' && a.to === 'harbor' && s.tideLevel === 0 && load(s, level) === 2),
      ),
    ).toBeNull();
    expect(
      firstWin((s, a) => !(a.type === 'move' && a.to === 'harbor' && load(s, level) === 6)),
    ).toBeNull();
    expect(firstWin((s, a) => !(a.type === 'unload' && s.boatNodeId === 'high-quay'))).toBeNull();
  });

  test('the full load can wait at the quay after both the light delivery and Shell pickup were solved', () => {
    const session = replay(plans[0].actions.slice(0, 10));
    replay(
      Array.from({ length: 100 }, () => wait),
      session,
    );
    expect(replay(plans[0].actions.slice(10), session).state.status).toBe('won');
  });

  test('over-capacity is rejected; the complete six-neighbor roster still supports all draft bands', () => {
    const session = new Session(level),
      ids = level.passengers.map((p) => p.id);
    for (const p of level.piers)
      session.state.waitingByPier[p.id] = p.nodeId === 'high-quay' ? [...ids] : [];
    session.state.boatNodeId = 'high-quay';
    const before = structuredClone(session.state);
    expect(preview(before, { type: 'board', passengerIds: ids }, level).error).toContain('needs 8');
    expect(session.commit({ type: 'board', passengerIds: ids })).toBeNull();
    expect(session.state).toEqual(before);
    const bands = new Map<number, number>();
    for (const action of legalActions(session.state, level)) {
      if (action.type !== 'board') continue;
      const next = reduce(session.state, action, level);
      bands.set(load(next, level), draft(next, level));
    }
    expect([...bands].sort(([a], [b]) => a - b)).toEqual([
      [1, 2],
      [2, 2],
      [3, 3],
      [4, 3],
      [5, 4],
      [6, 4],
    ]);
  });
});
