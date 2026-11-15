import { describe, expect, test } from 'vitest';
import rawLevel from '../../data/ternhaven.level.json';
import plans from '../../data/ternhaven/witnesses.json';
import { draft, initial, legalActions, load, passageError, passageFlow, preview, reduce,
  type Action, type State } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { checkCurrents, type Level } from '../../src/levels/level';

const level = checkCurrents(rawLevel);
const roster = [...level.objective.requiredPassengerIds].sort();
const witnesses = plans.witnesses.map(p => p.actions as Action[]);
const mistakes = plans.losingAlternatives.map(p => p.actions as Action[]);
const move = (to: string): Action => ({ type: 'move', to });
const board = (...passengerIds: string[]): Action => ({ type: 'board', passengerIds });
const unload = (...passengerIds: string[]): Action => ({ type: 'unload', passengerIds });
const isUnload = (action: Action): action is Action & { type: 'unload'; passengerIds: string[] } =>
  action.type === 'unload';

function replay(actions: Action[], session = new Session(level)) {
  for (const action of actions) {
    const before = structuredClone(session.state);
    const p = preview(session.state, action, session.level);
    expect(p.error).toBeNull();
    expect(session.state).toEqual(before);
    expect(session.commit(action)?.after).toEqual(p.state);
    session.finish();
    expect(session.state.turn).toBe(before.turn + 1);
    expect([...session.state.aboard, ...session.state.delivered,
      ...Object.values(session.state.waitingByPier).flat()].sort()).toEqual(roster);
  }
  return session;
}

function firstWin(l: Level, start = initial(l), allow: (s: State, a: Action) => boolean = () => true) {
  const boundary = l.rules.tide.rises.at(-1)!.afterTurn;
  const key = (s: State) => JSON.stringify([Math.min(s.turn, boundary), s.tideLevel,
    s.boatNodeId, s.status, s.lossReason, [...s.aboard].sort(), [...s.delivered].sort(),
    l.piers.map(p => [...s.waitingByPier[p.id]].sort())]);
  const queue = [start];
  const known = new Set([key(start)]);
  for (const state of queue) {
    if (state.status === 'won') return state.turn;
    for (const action of legalActions(state, l)) {
      if (!allow(state, action)) continue;
      const next = reduce(state, action, l);
      const id = key(next);
      if (known.has(id)) continue;
      known.add(id);
      queue.push(next);
    }
  }
  return null;
}

describe('Ternhaven placement, approach and return', () => {
  test('the production minimum is thirteen, with distinct high and deep-low fourteen-action rescues', () => {
    expect(firstWin(level)).toBe(13);
    for (const [index, actions] of witnesses.entries()) {
      const session = replay(actions);
      expect(session.state).toMatchObject({ status: 'won', tideLevel: 2,
        turn: index === 2 ? 13 : 14, boatNodeId: 'harbor' });
      expect(session.result).toMatchObject({ coveId: 'ternhaven', revision: 1,
        actions: index === 2 ? 13 : 14, successfulUndos: 0, lanterns: 3 });
      const won = structuredClone(session.state);
      expect(session.undo()).toBe(true);
      expect(session.state.status).toBe('playing');
      replay(actions.slice(-1), session);
      expect(session.state).toEqual(won);
      expect(session.successfulUndos).toBe(1);
      expect(session.result).toMatchObject({ lanterns: 2, successfulUndos: 1 });
    }
  });

  test('the initial subset and current boundary force an early sheep delivery, without restricting legal subsets', () => {
    const atHigh = replay(witnesses[0].slice(0, 1)).state;
    expect(legalActions(atHigh, level).filter(a => a.type === 'unload')).toHaveLength(7);
    for (const action of legalActions(atHigh, level).filter(isUnload)) {
      const after = reduce(atHigh, action, level);
      expect(firstWin(level, after)).toBe([...action.passengerIds].sort().join() === 'fennel,juniper' ? 14 : null);
    }
    const session = replay(witnesses[0].slice(0, 3));
    expect(session.state).toMatchObject({ turn: 3, tideLevel: 0, aboard: ['sedge'] });
    const current = level.edges.find(e => e.current)!;
    expect(passageFlow(current, 0)).toMatchObject({ from: 'fork', to: 'harbor' });
    replay([move('harbor')], session);
    expect(session.state).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
    expect(passageFlow(current, 1)).toMatchObject({ from: 'harbor', to: 'fork' });
    expect(session.undo()).toBe(true);
    expect(session.state).toMatchObject({ turn: 3, tideLevel: 0, boatNodeId: 'fork' });
    replay(witnesses[0].slice(3), session);
    expect(session.state.status).toBe('won');
  });

  test('boarding Willow at the low-first boundary precedes flooding, and the full return must use the deep link', () => {
    const session = replay(witnesses[1].slice(0, 9));
    expect(session.state).toMatchObject({ turn: 9, tideLevel: 1, boatNodeId: 'reeds' });
    expect(load(session.state, level)).toBe(4);
    const before = structuredClone(session.state);
    replay([board('willow')], session);
    expect(session.state).toMatchObject({ turn: 10, tideLevel: 2, status: 'playing' });
    expect(load(session.state, level)).toBe(6);
    expect(draft(session.state, level)).toBe(4);
    expect(passageError(session.state, 'fork', level)).toMatch(/depth 3 is below draft 4/);
    expect(passageError(session.state, 'low', level)).toBeNull();
    expect(passageFlow(level.edges.find(e => e.current)!, 2)).toMatchObject({ from: 'fork', to: 'harbor' });
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(before);
    expect(session.successfulUndos).toBe(1);
    replay(witnesses[1].slice(9), session);
    expect(session.state.status).toBe('won');
  });

  test('the legal low-bank return via the buoy loses all continuations before the flood is reported', () => {
    const session = replay(mistakes[0].slice(0, 8));
    expect(firstWin(level, session.state)).toBe(13);
    const goodDecision = structuredClone(session.state);
    replay([move('fork')], session);
    expect(session.state).toMatchObject({ turn: 9, status: 'playing' });
    expect(firstWin(level, session.state)).toBeNull();
    replay([move('low')], session);
    expect(session.state.lossReason).toMatchObject({ code: 'PASSENGER_STRANDED', pierId: 'low-pier' });
    expect(session.undo()).toBe(true);
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(goodDecision);
    replay(witnesses[2].slice(8), session);
    expect(session.state).toMatchObject({ status: 'won', turn: 13 });
  });

  test('a tempting early subset is reversible at the real decision, preserving exact history', () => {
    const session = replay(mistakes[1].slice(0, 2));
    expect(session.state.status).toBe('playing');
    expect(firstWin(level, session.state)).toBeNull();
    replay([move('fork')], session);
    expect(passageError(session.state, 'harbor', level)).toMatch(/depth 2 is below draft 3/);
    replay(mistakes[1].slice(3), session);
    expect(session.state.lossReason).toMatchObject({ code: 'RETURN_CAPACITY', offshoreSlots: 8, homewardTrips: 1 });
    while (session.state.turn > 1) expect(session.undo()).toBe(true);
    expect(session.state).toEqual(replay(witnesses[0].slice(0, 1)).state);
    expect(session.successfulUndos).toBe(3);
    replay(witnesses[0].slice(1), session);
    expect(session.state.status).toBe('won');
    expect(session.restart()).toBe(true);
    expect(session.successfulUndos).toBe(0);
    expect(session.history).toEqual([]);
    expect(session.state).toEqual(initial(level));
  });

  test('location elevation and initial passage depth independently rescue the otherwise failed plans', () => {
    const raised = structuredClone(level);
    raised.piers.find(p => p.id === 'low-pier')!.elevation = 3;
    const lowSession = replay(mistakes[0], new Session(raised));
    expect(lowSession.state).toMatchObject({ status: 'playing', turn: 10 });
    replay([board('fennel', 'juniper'), move('fork'), move('harbor'),
      unload('fennel', 'juniper', 'willow')], lowSession);
    expect(lowSession.state).toMatchObject({ status: 'won', turn: 14 });
    const deeper = structuredClone(level);
    deeper.edges.find(e => e.current)!.baseDepth = 3;
    const loadSession = replay(mistakes[1].slice(0, 2), new Session(deeper));
    expect(firstWin(deeper, loadSession.state)).toBe(14);
    replay([move('fork'), move('harbor'), unload('fennel', 'sedge'), move('fork'),
      move('reeds'), board('willow'), move('fork'), move('high'), board('juniper'),
      move('fork'), move('harbor'), unload('juniper', 'willow')], loadSession);
    expect(loadSession.state).toMatchObject({ status: 'won', turn: 14 });
  });

  test('parking, waiting and collecting everybody first do not bypass the connected decisions', () => {
    expect(firstWin(level, initial(level), (s, a) => !(a.type === 'unload' && s.boatNodeId !== 'harbor'))).toBeNull();
    expect(firstWin(level, initial(level), (s, a) => !(a.type === 'unload' && s.boatNodeId === 'harbor' &&
      !s.delivered.length && s.aboard.length < level.passengers.length))).toBeNull();
    expect(firstWin(level, initial(level), (s, a) => !(a.type === 'board' && s.tideLevel < 2))).toBeNull();
    for (const [ends, expected] of [['fork,reeds', 14], ['low,reeds', 14]] as const)
      expect(firstWin(level, initial(level), (s, a) => !(a.type === 'move' &&
        [s.boatNodeId, a.to].sort().join() === ends))).toBe(expected);
  });

  test('all final passenger subsets retain their true costs and are reversible before or after victory', () => {
    const session = replay(witnesses[0].slice(0, -1));
    const before = structuredClone(session.state);
    const choices = legalActions(before, level).filter(isUnload);
    expect(choices).toHaveLength(7);
    for (const action of choices) {
      replay([action], session);
      expect(session.state.delivered).toEqual(['sedge', ...action.passengerIds]);
      expect(load(session.state, level)).toBe(level.passengers.filter(p => before.aboard.includes(p.id)
        && !action.passengerIds.includes(p.id)).reduce((n, p) => n + p.slots, 0));
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(before);
    }
  });
});
