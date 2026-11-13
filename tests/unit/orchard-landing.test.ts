import { describe, expect, test } from 'vitest';
import plans from '../../data/orchard-landing/witnesses.json';
import {
  draft,
  initial,
  legalActions,
  load,
  passageError,
  preview,
  reduce,
  type Action,
  type State,
} from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { orchardLanding as level, wideBerth, type Level } from '../../src/levels/level';

const sail = (to: string): Action => ({ type: 'move', to });
const unload = (...passengerIds: string[]): Action => ({ type: 'unload', passengerIds });
const wait: Action = { type: 'wait' };
const rescue = plans.witnesses[0].actions as Action[];
const returnToSteps = plans.witnesses[1].actions as Action[];
const wrongDelivery = plans.losingAlternatives[0].actions as Action[];
const roster = [...level.objective.requiredPassengerIds].sort();

function replay(actions: Action[], session = new Session(level)) {
  for (const action of actions) {
    const before = structuredClone(session.state);
    const prediction = preview(session.state, action, session.level);
    expect(prediction.error).toBeNull();
    expect(session.state).toEqual(before);
    expect(session.commit(action)?.after).toEqual(prediction.state);
    session.finish();
    const state = session.state;
    expect(
      [...state.aboard, ...state.delivered, ...Object.values(state.waitingByPier).flat()].sort(),
    ).toEqual(roster);
    expect(state.turn).toBe(before.turn + 1);
  }
  return session;
}

type AllowAction = (state: State, action: Action) => boolean;

function firstWin(l: Level, allow: AllowAction = () => true, start = initial(l)) {
  const lastRise = l.rules.tide.rises.at(-1)!.afterTurn;
  function key(state: State) {
    return JSON.stringify([
      Math.min(state.turn, lastRise),
      state.boatNodeId,
      state.status,
      [...state.aboard].sort(),
      [...state.delivered].sort(),
      l.piers.map((pier) => [...state.waitingByPier[pier.id]].sort()),
    ]);
  }
  const queue = [start];
  const seen = new Set([key(start)]);
  for (const state of queue) {
    if (state.status === 'won') return state.turn;
    if (state.status === 'lost') continue;
    for (const action of legalActions(state, l)) {
      if (!allow(state, action)) continue;
      const next = reduce(state, action, l);
      const id = key(next);
      if (!seen.has(id)) {
        queue.push(next);
        seen.add(id);
      }
    }
  }
  return null;
}

describe('Orchard Landing delivery and escort', () => {
  test('staging at the quay saves one action over returning for the rabbit at the steps', () => {
    expect(firstWin(level)).toBe(12);
    expect(firstWin(level, (s, a) => !(a.type === 'unload' && s.boatNodeId !== 'harbor'))).toBe(13);
    for (const [actions, turn] of [[rescue, 12], [returnToSteps, 13]] as const) {
      const session = replay(actions);
      expect(session.state).toMatchObject({ status: 'won', turn, tideLevel: 2 });
      while (session.history.length) {
        const snapshot = structuredClone(session.history.at(-1));
        expect(session.undo()).toBe(true);
        expect(session.state).toEqual(snapshot);
      }
      expect(session.state).toEqual(initial(level));
    }
  });

  test('all rescues deliver Pomme first, carry Medlar inward alone and return with Orin and Medlar', () => {
    const firstDelivery: AllowAction = (s, a) =>
      !(s.boatNodeId === 'harbor' && s.delivered.length === 0 &&
        a.type === 'unload' && a.passengerIds.length === 1 && a.passengerIds.includes('pomme'));
    const entersWithEscort: AllowAction = (s, a) =>
      !(a.type === 'move' && a.to === 'orchard' && s.aboard.length === 1 && s.aboard.includes('medlar'));
    const leavesWithPair: AllowAction = (s, a) =>
      !(a.type === 'move' && s.boatNodeId === 'orchard' && s.aboard.length === 2 &&
        s.aboard.includes('orin') && s.aboard.includes('medlar'));
    for (const allow of [firstDelivery, entersWithEscort, leavesWithPair])
      expect(firstWin(level, allow)).toBeNull();
  });

  test('both unload choices at the quay are legal, but delivering the rabbit dooms the later escort', () => {
    const session = replay(rescue.slice(0, 2));
    const decision = structuredClone(session.state);
    expect(passageError(decision, 'harbor', level)).toMatch(/depth 2 is below draft 3/);
    for (const passenger of ['medlar', 'pomme']) {
      const next = preview(decision, unload(passenger), level);
      expect(next.error).toBeNull();
      expect(next.state.status).toBe('playing');
      expect(firstWin(level, undefined, next.state)).toBe(passenger === 'medlar' ? 12 : null);
    }
    replay(wrongDelivery.slice(2, 9), session);
    expect(session.state).toMatchObject({
      turn: 9, boatNodeId: 'orchard', status: 'playing', delivered: ['medlar'],
      tideLevel: 1, aboard: ['pomme', 'orin'],
    });
    expect(draft(session.state, level)).toBe(4);
    expect(passageError(session.state, 'quay', level)).toMatch(/depth 3 is below draft 4/);
    replay(wrongDelivery.slice(9), session);
    expect(session.state.lossReason).toMatchObject({ code: 'RETURN_CUT_OFF', edgeId: 'orchard-quay' });
    while (session.state.turn > decision.turn) expect(session.undo()).toBe(true);
    expect(session.state).toEqual(decision);
    expect(replay(rescue.slice(2), session).state.status).toBe('won');
  });

  test('the last outward crossing is possible with four slots, including on its last action', () => {
    const atOrchard = replay(rescue.slice(0, 9));
    expect(atOrchard.state.tideLevel).toBe(1);
    expect(load(atOrchard.state, level)).toBe(4);
    expect(draft(atOrchard.state, level)).toBe(3);
    replay([wait, wait, sail('quay')], atOrchard);
    expect(atOrchard.state).toMatchObject({ turn: 12, boatNodeId: 'quay', status: 'playing', tideLevel: 2 });
    expect(replay([wait, wait, sail('harbor'), unload('medlar', 'orin')], atOrchard).state.status).toBe('won');
    expect(firstWin(level, undefined, replay([wait]).state)).toBe(13);
    expect(firstWin(level, undefined, replay([wait, wait]).state)).toBeNull();
  });

  test('the same rabbit-first delivery wins when only Orin changes from three spaces to two', () => {
    const lighter = structuredClone(level);
    lighter.passengers.find(p => p.id === 'orin')!.slots = 2;
    const session = replay(wrongDelivery.slice(0, 9), new Session(lighter));
    expect(load(session.state, lighter)).toBe(4);
    expect(draft(session.state, lighter)).toBe(3);
    expect(passageError(session.state, 'quay', lighter)).toBeNull();
    expect(replay([sail('quay'), sail('harbor'), unload('orin', 'pomme')], session).state.status).toBe('won');
    expect(firstWin(lighter)).toBe(12);
  });

  test('the opening Harbor depth requires a partition, and the final direction prevents waiting for deeper water', () => {
    const bothFirst: AllowAction = (s, a) =>
      !(s.boatNodeId === 'harbor' && s.delivered.length === 0 &&
        a.type === 'unload' && a.passengerIds.length < 2);
    expect(firstWin(level, bothFirst)).toBeNull();
    const widerHarbor = structuredClone(level);
    widerHarbor.edges.find(edge => edge.id === 'harbor-quay')!.baseDepth++;
    expect(firstWin(widerHarbor, bothFirst)).toBe(12);
    const stillWater = structuredClone(level);
    const reach = stillWater.edges.find(edge => edge.current)!;
    delete reach.current;
    reach.bidirectional = true;
    const stranded = replay(wrongDelivery.slice(0, 9), new Session(stillWater));
    expect(firstWin(stillWater, undefined, stranded.state)).toBe(15);
  });

  test('the final Harbor subsets keep exact passenger identities and costs through delivery and Undo', () => {
    const session = replay(rescue.slice(0, -1));
    const home = structuredClone(session.state);
    const choices = legalActions(home, level).filter(
      (a): a is Action & { type: 'unload'; passengerIds: string[] } => a.type === 'unload');
    expect(choices).toHaveLength(3);
    for (const choice of choices) {
      replay([choice], session);
      expect(session.state.delivered).toEqual(['pomme', ...choice.passengerIds]);
      const remaining = level.passengers.filter(p => home.aboard.includes(p.id) && !choice.passengerIds.includes(p.id));
      expect([...session.state.aboard].sort()).toEqual(remaining.map(p => p.id).sort());
      expect(load(session.state, level)).toBe(remaining.reduce((total, p) => total + p.slots, 0));
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(home);
    }
    expect(level.names?.passengers?.medlar).toBe('Medlar');
    expect(level.passengers.find(p => p.id === 'medlar')?.appearance).toBe('rabbit-tan');
    expect(wideBerth.names?.passengers?.sorrel).toBe('Sorrel');
    expect(wideBerth.passengers.find(p => p.id === 'sorrel')?.appearance).toBe('rabbit-cream');
  });
});
