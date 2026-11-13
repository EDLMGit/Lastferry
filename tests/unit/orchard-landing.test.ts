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
import { orchardLanding as level, type Level } from '../../src/levels/level';

const sail = (to: string): Action => ({ type: 'move', to });
const board = (...passengerIds: string[]): Action => ({ type: 'board', passengerIds });
const unload = (...passengerIds: string[]): Action => ({ type: 'unload', passengerIds });
const wait: Action = { type: 'wait' };
const rescue = plans.witnesses[0].actions as Action[];
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

describe('Orchard Landing preparation, positioning and indivisible load', () => {
  test('winning witness crosses both reversals and restores every complete snapshot', () => {
    const session = replay(rescue);
    expect(session.state).toMatchObject({
      status: 'won',
      turn: 10,
      tideLevel: 2,
      boatNodeId: 'harbor',
    });
    expect(session.history[4]).toMatchObject({
      tideLevel: 1,
      boatNodeId: 'quay',
      aboard: ['sorrel'],
    });
    expect(session.history[7]).toMatchObject({ tideLevel: 2, boatNodeId: 'orchard' });
    expect(load(session.history[7], level)).toBe(6);
    expect(draft(session.history[7], level)).toBe(4);
    while (session.history.length) {
      const snapshot = structuredClone(session.history.at(-1));
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(snapshot);
    }
    expect(session.state).toEqual(initial(level));
  });

  test('both low-water pickup orders work, as does one early wait with a crossing exactly on the last inward action', () => {
    expect(
      replay([
        sail('quay'),
        board('pomme'),
        sail('steps'),
        board('sorrel'),
        sail('quay'),
        ...rescue.slice(5),
      ]).state.status,
    ).toBe('won');
    const justInTime = replay([wait, ...rescue.slice(0, 6)]);
    expect(justInTime.state).toMatchObject({
      tideLevel: 2,
      boatNodeId: 'orchard',
      aboard: ['sorrel', 'pomme'],
    });
    expect(replay(rescue.slice(6), justInTime).state.status).toBe('won');
  });

  test('all legal routes require a light departure, preparing both smaller neighbors, and crossing inward before the last reversal', () => {
    expect(firstWin(level)).toBe(10);
    expect(
      firstWin(
        level,
        (s, a) => !(a.type === 'move' && s.boatNodeId === 'orchard' && load(s, level) === 0),
      ),
    ).toBeNull();
    expect(
      firstWin(
        level,
        (s, a) =>
          !(
            a.type === 'move' &&
            a.to === 'orchard' &&
            s.aboard.includes('pomme') &&
            s.aboard.includes('sorrel')
          ),
      ),
    ).toBeNull();
    expect(
      firstWin(
        level,
        (s, a) => !(a.type === 'move' && s.boatNodeId === 'orchard' && load(s, level) === 6),
      ),
    ).toBeNull();
    expect(
      firstWin(level, (s, a) => !(a.type === 'move' && a.to === 'harbor' && load(s, level) > 4)),
    ).toBeNull();
    expect(
      firstWin(
        level,
        (s, a) => !(a.type === 'move' && (a.to === 'orchard' || s.boatNodeId === 'orchard')),
      ),
    ).toBeNull();
  });

  test('early deer, a small homeward delivery and prolonged waiting have actual failures; Undo can recover', () => {
    const firstDeer = replay([board('orin')]).state;
    expect(load(firstDeer, level)).toBe(3);
    expect(draft(firstDeer, level)).toBe(3);
    expect(passageError(firstDeer, 'quay', level)).toMatch(/depth 2 is below draft 3/);
    expect(firstWin(level, undefined, firstDeer)).toBeNull();
    const [deer, delivery, linger] = plans.losingAlternatives.map((plan) =>
      replay(plan.actions as Action[]),
    );
    expect(deer.state.lossReason).toEqual({
      code: 'PASSENGER_STRANDED',
      pierId: 'steps-pier',
      passengerIds: ['sorrel'],
    });
    expect(delivery.state.lossReason).toMatchObject({
      code: 'RETURN_CUT_OFF',
      passengerIds: ['orin'],
    });
    expect(linger.state.lossReason).toEqual(deer.state.lossReason);
    expect(delivery.undo()).toBe(true);
    expect(delivery.undo()).toBe(true);
    expect(replay(rescue.slice(5), delivery).state.status).toBe('won');
  });

  test('changing only Orin to two spaces allows taking him first and never returning to the orchard', () => {
    const light = structuredClone(level);
    light.passengers.find((p) => p.id === 'orin')!.slots = 2;
    const noReentry: AllowAction = (_, action) =>
      !(action.type === 'move' && action.to === 'orchard');
    expect(firstWin(level, noReentry)).toBeNull();
    expect(firstWin(light, noReentry)).toBe(9);
    const session = replay([board('orin')], new Session(light));
    expect(passageError(session.state, 'quay', light)).toBeNull();
    replay(
      [
        sail('quay'),
        sail('steps'),
        board('sorrel'),
        sail('quay'),
        board('pomme'),
        wait,
        sail('harbor'),
        unload(...roster),
      ],
      session,
    );
    expect(session.state.status).toBe('won');
  });

  test('each available selection retains its exact IDs, slot arithmetic and draft, including partial delivery and Undo', () => {
    const allAboard = replay(rescue.slice(0, -1));
    const atHome = structuredClone(allAboard.state);
    const choices = legalActions(atHome, level).filter(
      (action): action is Action & { type: 'unload'; passengerIds: string[] } =>
        action.type === 'unload',
    );
    expect(choices).toHaveLength(7);
    for (const choice of choices) {
      expect(allAboard.commit(choice)).toBeTruthy();
      allAboard.finish();
      const s = allAboard.state;
      const remaining = level.passengers.filter((p) => !choice.passengerIds.includes(p.id));
      const slots = remaining.reduce((sum, p) => sum + p.slots, 0);
      expect([...s.aboard].sort()).toEqual(remaining.map((p) => p.id).sort());
      expect([...s.delivered].sort()).toEqual([...choice.passengerIds].sort());
      expect(load(s, level)).toBe(slots);
      expect(draft(s, level)).toBe([1, 2, 2, 3, 3, 4, 4][slots]);
      expect(allAboard.undo()).toBe(true);
      expect(allAboard.state).toEqual(atHome);
    }
  });
});
