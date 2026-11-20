import { describe, expect, it } from 'vitest';
import plans from '../../data/far-shore/witnesses.json';
import { draft, initial, load, passageError, preview, validate, type Action, type State } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { farShore } from '../../src/levels/level';

const rescue = plans.witnesses[0].actions as Action[];
const mistake = plans.losingAlternatives[0].actions as Action[];
const boardDeer: Action = { type: 'board', passengerIds: ['rowan'] };

function play(session: Session, actions: Action[]) {
  for (const action of actions) {
    expect(session.commit(action)).not.toBeNull();
    session.finish();
  }
}

function loaded(state: State, id: string) {
  return { ...state, aboard: [...state.aboard, id] };
}

describe('Far Shore receiving berth', () => {
  it('permits either individual daylight delivery but the combined party draws too much for the home channel', () => {
    for (const id of ['thistle', 'button']) {
      const session = new Session(farShore);
      play(session, [{ type: 'board', passengerIds: [id] }]);
      expect(passageError(session.state, 'harbor', farShore)).toBeNull();
    }
    const together = new Session(farShore);
    play(together, [{ type: 'board', passengerIds: ['thistle', 'button'] }]);
    expect(passageError(together.state, 'harbor', farShore)).toMatch(/depth 2 is below draft 3/);
  });

  it('distinguishes capacity from receiving depth at the exact same landing and tide', () => {
    for (const [actions, expectedLoad, expectedDraft] of [
      [rescue, 4, 3],
      [mistake, 5, 4],
    ] as const) {
      const session = new Session(farShore);
      play(session, actions.slice(0, 7));
      const before = structuredClone(session.state);
      expect(before).toMatchObject({ turn: 7, tideLevel: 1, boatNodeId: 'rush', status: 'playing' });
      expect(load(loaded(before, 'rowan'), farShore)).toBe(expectedLoad);
      expect(draft(loaded(before, 'rowan'), farShore)).toBe(expectedDraft);
      expect(farShore.nodes.find(node => node.id === 'rush')!.baseDepth + before.tideLevel).toBe(3);
      const result = preview(session.state, boardDeer, farShore);
      expect(session.state).toEqual(before);
      if (expectedDraft === 4) {
        expect(result.error).toMatch(/berth/);
        expect(session.commit(boardDeer)).toBeNull();
        expect(session.history).toHaveLength(7);
        expect(session.state).toEqual(before);
      } else {
        expect(result.error).toBeNull();
        expect(result.state).toMatchObject({ status: 'playing', turn: 8, tideLevel: 2, aboard: ['button', 'rowan'] });
        expect(result.state.waitingByPier['rush-pier']).toEqual([]);
      }
    }
  });

  it('recovers from Rowan’s flooded berth all the way to the original passenger choice', () => {
    const session = new Session(farShore);
    const snapshots = [structuredClone(session.state)];
    for (const action of mistake) {
      play(session, [action]);
      snapshots.push(structuredClone(session.state));
    }
    expect(session.state.lossReason).toEqual({ code: 'PASSENGER_STRANDED', pierId: 'rush-pier', passengerIds: ['rowan'] });
    for (const snapshot of snapshots.slice(0, -1).reverse()) {
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(snapshot);
    }
    expect(session.state).toEqual(initial(farShore));
    play(session, rescue.slice(0, -1));
    const arrival = structuredClone(session.state);
    play(session, rescue.slice(-1));
    expect(session.state).toMatchObject({ status: 'won', turn: 13, delivered: ['thistle', 'button', 'rowan', 'peat'] });
    expect(session.takeResult()).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(arrival);
    play(session, rescue.slice(-1));
    expect(session.takeResult()).toBeNull();
    expect(session.restart()).toBe(true);
    expect(session.state).toEqual(initial(farShore));
  });

  it('lets the heavier party rescue when only the receiving basin gains one unit', () => {
    const deeper = structuredClone(farShore);
    deeper.nodes.find(node => node.id === 'rush')!.baseDepth++;
    const session = new Session(deeper);
    play(session, mistake.slice(0, 7));
    expect(validate(session.state, boardDeer, deeper)).toBeNull();
    play(session, [
      boardDeer, { type: 'move', to: 'bank' }, { type: 'board', passengerIds: ['peat'] },
      { type: 'move', to: 'steps' }, { type: 'move', to: 'harbor' },
      { type: 'unload', passengerIds: ['thistle', 'rowan', 'peat'] },
    ]);
    expect(session.state).toMatchObject({ status: 'won', turn: 13 });
  });
});
