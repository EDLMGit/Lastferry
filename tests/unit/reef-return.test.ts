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
const greedy = plans.losingAlternatives[0].actions as Action[];
const homeFirst = plans.losingAlternatives[1].actions as Action[];
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

describe('Reef Return production rules', () => {
  for (const plan of plans.witnesses)
    test(`${plan.id} completes a six-space loaded return`, () => {
      const session = replay(plan.actions as Action[]);
      expect(session.state).toMatchObject({ turn: 9, tideLevel: 2, status: 'won' });
      expect(session.history[3]).toMatchObject({ tideLevel: 1, boatNodeId: 'quay' });
      expect(session.history[7].aboard).toHaveLength(4);
      expect(load(session.history[7], level)).toBe(6);
      while (session.history.length) {
        const snapshot = structuredClone(session.history.at(-1));
        expect(session.undo()).toBe(true);
        expect(session.state).toEqual(snapshot);
      }
      expect(session.state).toEqual(initial(level));
    });

  test('the same boat at Cairn Quay can cross on action eight and faces the opposite flow immediately afterward', () => {
    const session = replay(winning.slice(0, 7));
    const s = structuredClone(session.state);
    expect(passageFlow(reef, s.tideLevel)?.to).toBe('harbor');
    expect(passageError(s, 'harbor', level)).toBeNull();
    expect(preview(s, wait, level).state.lossReason?.code).toBe('RETURN_CUT_OFF');
    replay([wait], session);
    expect(session.state.lossReason?.passengerIds).toEqual(all);
    expect(passageFlow(reef, session.state.tideLevel)?.to).toBe('quay');
    expect(passageError(session.state, 'harbor', level)).toContain(
      'only from Harbor to Cairn Quay',
    );
    expect(session.commit(homeward)).toBeNull();
    expect(session.history).toHaveLength(8);
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(s);
    replay([homeward], session);
    expect(session.state).toMatchObject({ turn: 8, boatNodeId: 'harbor', status: 'playing' });
    expect(passageError(session.state, 'quay', level)).toBeNull();
    replay(
      Array.from({ length: 30 }, () => wait),
      session,
    );
    expect(replay(winning.slice(8), session).state).toMatchObject({ status: 'won', turn: 39 });
  });

  test('greedy loading fits the hull and outgoing route but the six-space return no longer fits the pool', () => {
    const session = replay(greedy.slice(0, 5));
    expect(load(session.state, level)).toBe(6);
    expect(session.state.status).toBe('playing');
    const back: Action = { type: 'move', to: 'quay' };
    expect(preview(session.state, back, level).error).toContain('depth 3 is below draft 4');
    expect(session.commit(back)).toBeNull();
    expect(firstWin(session.state)).toBeNull();
    replay(greedy.slice(5), session);
    expect(session.state).toMatchObject({
      status: 'lost',
      turn: 8,
      lossReason: { code: 'RETURN_CUT_OFF' },
    });
    expect(passageError(session.state, 'quay', level)).toBeNull();
    while (session.state.turn > 2) session.undo();
    expect(replay(winning.slice(2), session).state.status).toBe('won');
  });

  test('sailing just the first group home explains the missing second voyage immediately', () => {
    const session = replay(homeFirst.slice(0, 2));
    expect(preview(session.state, homeward, level).state.lossReason).toEqual({
      code: 'RETURN_CUT_OFF',
      edgeId: reef.id,
      passengerIds: ['birch', 'dot'],
    });
    replay([homeward], session);
    expect(session.state).toMatchObject({ status: 'lost', boatNodeId: 'harbor', turn: 3 });
    session.undo();
    expect(replay(winning.slice(2), session).state.status).toBe('won');
  });

  test('an actual open deep bypass would keep early delivery viable', () => {
    const detour = structuredClone(level);
    detour.edges.push({
      id: 'open-detour',
      nodes: ['pool', 'harbor'],
      bidirectional: true,
      baseDepth: 4,
      waypointsXZ: [],
    });
    const session = replay(homeFirst, new Session(detour));
    expect(session.state.status).toBe('playing');
    const detourRescue: Action[] = [
      { type: 'unload', passengerIds: ['heather', 'flick'] },
      { type: 'move', to: 'pool' },
      { type: 'board', passengerIds: ['birch', 'dot'] },
      homeward,
      { type: 'unload', passengerIds: ['birch', 'dot'] },
    ];
    expect(replay(detourRescue, session).state.status).toBe('won');
  });

  test('all legal subsets, routes and waits still require staging Heather and bringing the whole boat home', () => {
    const start = initial(level);
    expect(firstWin(start)).toBe(9);
    expect(
      firstWin(
        start,
        (s, a) =>
          !(a.type === 'unload' && s.boatNodeId === 'quay' && a.passengerIds.includes('heather')),
      ),
    ).toBeNull();
    expect(
      firstWin(start, (s, a) => !(a.type === 'move' && a.to === 'harbor' && load(s, level) === 6)),
    ).toBeNull();
    expect(firstWin(start, (_, a) => a.type !== 'board' || a.passengerIds.length === 1)).toBeNull();
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
