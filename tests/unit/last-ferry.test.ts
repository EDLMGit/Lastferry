import { describe, expect, it } from 'vitest';
import plans from '../../data/last-ferry/witnesses.json';
import { draft, initial, legalActions, load, preview, type Action, type State } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { lastFerry as level } from '../../src/levels/level';

const group = level.objective.requiredPassengerIds;
const home = (state: State): Action => ({ type: 'unload', passengerIds: [...state.aboard] });
const move = (to: string): Action => ({ type: 'move', to });

function commit(session: Session, action: Action) {
  const before = structuredClone(session.state);
  const outcome = preview(session.state, action, level);
  expect(session.state).toEqual(before);
  expect(outcome.error).toBeNull();
  expect(legalActions(before, level)).toContainEqual(action);
  expect(session.commit(action)?.after).toEqual(outcome.state);
  session.finish();
  expect(session.state.turn).toBe(before.turn + 1);
}

describe('Last Ferry pickup and passage home', () => {
  it('lets the rabbits cross Ribbon Cut on the first tide and offers the larger pair the deep way around', () => {
    for (const [index, destination, depth] of [[0, 'quilt', 2], [1, 'lace', 3]] as const) {
      const session = new Session(level);
      for (const action of plans.witnesses[index].actions.slice(0, 2)) commit(session, action as Action);
      expect(draft(session.state, level)).toBe(depth);
      expect(session.state.tideLevel).toBe(0);
      const direct = move(destination);
      if (depth === 2) {
        expect(preview(session.state, direct, level).error).toBeNull();
      } else {
        const before = structuredClone(session.state);
        expect(preview(session.state, direct, level).error).toContain('depth 2 is below draft 3');
        expect(session.commit(direct)).toBeNull();
        expect(session.state).toEqual(before);
        expect(preview(session.state, move('lantern'), level).error).toBeNull();
      }
    }
  });

  it.each(plans.witnesses)('takes the complete six-space group through Lantern Buoy on $id', plan => {
    const session = new Session(level);
    const actions = plan.actions as Action[];
    expect(actions).toHaveLength(plan.id === 'ribbon-cut' ? 7 : 8);
    const coast = actions.slice(0, -3);
    for (const action of coast) commit(session, action);
    expect(session.state.delivered).toEqual([]);
    expect([...session.state.aboard].sort()).toEqual([...group].sort());
    expect(load(session.state, level)).toBe(6);
    expect(draft(session.state, level)).toBe(4);
    expect(actions.slice(-3)).toEqual([move('lantern'), move('harbor'), home(session.state)]);
    for (const action of actions.slice(-3, -1)) {
      commit(session, action);
      expect(session.state.status).toBe('playing');
      expect(load(session.state, level)).toBe(6);
      expect(session.state.delivered).toEqual([]);
    }
    const docked = structuredClone(session.state);
    commit(session, actions.at(-1)!);
    expect(session.state.status).toBe('won');
    expect([...session.state.delivered].sort()).toEqual([...group].sort());
    expect(session.takeResult()).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(docked);
    commit(session, home(session.state));
    expect(session.takeResult()).toBeNull();
  });

  it('restores the action-four tide and keeps the loaded trip home open at the last water level', () => {
    for (const plan of plans.witnesses) {
      const actions = plan.actions as Action[];
      const session = new Session(level);
      for (const action of actions.slice(0, 3)) commit(session, action);
      const beforeRise = structuredClone(session.state);
      commit(session, actions[3]);
      expect(session.state.tideLevel).toBe(1);
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(beforeRise);
      for (const action of actions.slice(3, -3)) commit(session, action);
      const lastRise = level.rules.tide.rises.at(-1)!.afterTurn;
      while (session.state.turn <= lastRise) commit(session, { type: 'wait' });
      for (const action of actions.slice(-3)) commit(session, action);
      expect(session.state.status).toBe('won');
      expect(session.restart()).toBe(true);
      expect(session.state).toEqual(initial(level));
    }
  });
});
