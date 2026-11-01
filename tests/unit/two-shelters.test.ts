import { describe, expect, test } from 'vitest';
import witnessData from '../../data/two-shelters/witnesses.json';
import { twoShelters as level } from '../../src/levels/level';
import {
  initial, legalActions, load, preview, reduce, validate,
  type Action, type State,
} from '../../src/game/rules';
import { Session } from '../../src/game/session';

const witnesses = witnessData.witnesses.map((w) => ({ ...w, actions: w.actions as Action[] }));
const alternatives = witnessData.losingAlternatives.map((w) => ({ ...w, actions: w.actions as Action[] }));

function conserved(state: State) {
  const ids = [...state.aboard, ...state.delivered, ...Object.values(state.waitingByPier).flat()];
  expect([...ids].sort()).toEqual(level.passengers.map((p) => p.id).sort());
  expect(new Set(ids).size).toBe(ids.length);
  expect(load(state, level)).toBeLessThanOrEqual(4);
}

function replay(actions: Action[], start = initial(level)) {
  return actions.reduce((state, action) => {
    const before = structuredClone(state);
    const prediction = preview(state, action, level);
    expect(prediction.error).toBeNull();
    expect(state).toEqual(before);
    const next = reduce(state, action, level);
    expect(next).toEqual(prediction.state);
    expect(next.turn).toBe(state.turn + 1);
    conserved(next);
    return next;
  }, start);
}

function canWin(start: State, allowed: (state: State, action: Action) => boolean = () => true) {
  const finalRise = level.rules.tide.rises.at(-1)!.afterTurn;
  const key = (s: State) => JSON.stringify([
    Math.min(s.turn, finalRise), s.boatNodeId, s.tideLevel,
    [...s.aboard].sort(), [...s.delivered].sort(),
    Object.entries(s.waitingByPier).map(([id, ids]) => [id, [...ids].sort()]), s.status,
  ]);
  const queue = [start], seen = new Set([key(start)]);
  for (let index = 0; index < queue.length; index++) {
    const state = queue[index];
    if (state.status === 'won') return true;
    if (state.status === 'lost') continue;
    for (const action of legalActions(state, level)) {
      if (!allowed(state, action)) continue;
      const next = reduce(state, action, level), id = key(next);
      if (!seen.has(id)) {
        seen.add(id);
        queue.push(next);
      }
    }
  }
  return false;
}

describe('Two Shelters production candidate', () => {
  for (const witness of witnesses) test(`complete rescue and complete Undo: ${witness.id}`, () => {
    const session = new Session(level), snapshots = [structuredClone(session.state)];
    for (const action of witness.actions) {
      const prediction = preview(session.state, action, level);
      expect(prediction.error).toBeNull();
      expect(session.commit(action)?.after).toEqual(prediction.state);
      expect(session.undo()).toBe(false);
      session.finish();
      conserved(session.state);
      snapshots.push(structuredClone(session.state));
      if (session.state.turn === 4) {
        expect(session.state.tideLevel).toBe(1);
        expect(session.state.status).toBe('playing');
        expect(session.state.waitingByPier['reeds-pier']).toEqual([]);
        expect([...session.state.aboard].sort()).toEqual(['mica']);
      }
    }
    expect(session.state.status).toBe('won');
    expect(session.state.turn).toBe(witness.id === 'high-mixed-first' ? 12 : 11);
    for (let index = snapshots.length - 2; index >= 0; index--) {
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(snapshots[index]);
    }
    expect(session.state).toEqual(initial(level));
  });

  for (const alternative of alternatives) test(`real losing alternative: ${alternative.id}`, () => {
    const result = replay(alternative.actions);
    const greed = alternative.id === 'low-greedy-retrieval';
    expect(result.status).toBe('lost');
    expect(result.turn).toBe(greed ? 9 : 4);
    expect(result.lossReason).toEqual({
      code: 'PASSENGER_STRANDED', pierId: greed ? 'low-pier' : 'reeds-pier',
      passengerIds: greed ? ['bracken'] : ['mica'],
    });
  });

  test('lightening only one larger neighbor does not open the shallow pickup; failed attempts stay free', () => {
    for (const state of [initial(level), replay([{ type: 'unload', passengerIds: ['hazel'] }])]) {
      const before = structuredClone(state), action: Action = { type: 'move', to: 'reeds' };
      expect(validate(state, action, level)).toContain('Too shallow');
      expect(preview(state, action, level).error).toContain('Too shallow');
      expect(reduce(state, action, level)).toBe(state);
      expect(state).toEqual(before);
    }
  });

  test('the low shelter must be retrieved before flooding; the same mixed pickup is safe at the high refuge', () => {
    const low = replay(witnesses[0].actions.slice(0, 5));
    expect(preview(low, { type: 'board', passengerIds: ['hazel', 'bracken'] }, level).error).toContain('4 spaces');
    for (const passenger of ['hazel', 'bracken']) {
      const greedy = replay([{ type: 'board', passengerIds: [passenger] }], low);
      expect(greedy.status).toBe('playing');
      expect(canWin(greedy)).toBe(false);
    }
    const lastSafe = replay(witnesses[0].actions.slice(0, 8));
    expect(preview(lastSafe, { type: 'board', passengerIds: ['hazel', 'bracken'] }, level).state).toMatchObject({
      turn: 9, tideLevel: 2, status: 'playing', waitingByPier: { 'low-pier': [] },
    });
    expect(preview(lastSafe, { type: 'board', passengerIds: ['hazel'] }, level).state).toMatchObject({
      turn: 9, status: 'lost', lossReason: { passengerIds: ['bracken'] },
    });
    const high = replay(witnesses[1].actions.slice(0, 9));
    expect(high).toMatchObject({ turn: 9, tideLevel: 2, status: 'playing', waitingByPier: { 'refuge-pier': ['bracken'] } });
    expect(replay(witnesses[1].actions.slice(9), high).status).toBe('won');
  });

  test('no complete rescue bypasses temporary non-Harbor unloading, with no arbitrary search deadline', () => {
    expect(canWin(initial(level), (state, action) => !(action.type === 'unload' && state.boatNodeId !== 'harbor'))).toBe(false);
  });
});
