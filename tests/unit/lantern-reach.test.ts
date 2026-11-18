import { describe, expect, it } from 'vitest';
import { checkCurrents, lanternReach as level, holdingPier } from '../../src/levels/level';
import { draft, initial, legalActions, load, passageError, passageFlow, preview, reduce, validate, type Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import plans from '../../data/lantern-reach/witnesses.json';

const open: Action = { type: 'open-bridge' };
const move = (to: string): Action => ({ type: 'move', to });

function play(session: Session, actions: Action[]) {
  for (const action of actions) {
    const before = structuredClone(session.state);
    expect(legalActions(before, level)).toContainEqual(action);
    const proposed = preview(session.state, action, level);
    expect(proposed.error).toBeNull();
    expect(session.state).toEqual(before);
    expect(session.commit(action)?.after).toEqual(proposed.state);
    expect(session.state.turn).toBe(before.turn + 1);
    session.finish();
    expect([...session.state.aboard, ...session.state.delivered, ...Object.values(session.state.waitingByPier).flat()].sort())
      .toEqual([...level.objective.requiredPassengerIds].sort());
  }
}

describe('Lantern Reach swing bridge', () => {
  it('locks exactly its passage in both directions and binds the control to the dry signal quay', () => {
    const s = reduce(initial(level), move('signal'), level);
    expect(s.bridgeOpen).toBe(false);
    expect(legalActions(s, level)).toContainEqual(open);
    expect(passageError(s, 'harbor', level)).toMatch(/Lantern Bridge is closed.*Signal Quay/);
    expect(passageError({ ...s, boatNodeId: 'harbor' }, 'signal', level)).toMatch(/Lantern Bridge is closed/);
    expect(passageError(s, 'wick', level)).toBeNull();
    for (const node of level.nodes.filter(n => n.id !== 'signal')) {
      const away = { ...s, boatNodeId: node.id };
      expect(legalActions(away, level)).not.toContainEqual(open);
      expect(reduce(away, open, level)).toBe(away);
      expect(validate(away, open, level)).toContain('Signal Quay');
    }
    const floodedQuay = structuredClone(level);
    floodedQuay.piers.find(p => p.id === level.bridge!.signalPierId)!.elevation = s.tideLevel;
    expect(validate(s, open, floodedQuay)).toMatch(/flooded/);
    expect(reduce(s, open, floodedQuay)).toBe(s);
  });

  it('changes no prior level state or action set and refuses missing bridge references', () => {
    const old = initial(holdingPier);
    expect(Object.hasOwn(old, 'bridgeOpen')).toBe(false);
    expect(legalActions(old, holdingPier)).not.toContainEqual(open);
    expect(reduce(old, open, holdingPier)).toBe(old);
    for (const broken of [{ edgeId: 'absent' }, { signalPierId: 'absent' }]) {
      expect(() => checkCurrents({ ...level, bridge: { ...level.bridge!, ...broken } })).toThrow(/swing bridge/);
    }
  });

  it('previews without a history entry and applies one opening before the scheduled rise', () => {
    const session = new Session(level);
    const shortcut = plans.witnesses[0].actions as Action[];
    play(session, [shortcut[0], { type: 'wait' }]);
    const before = structuredClone(session.state);
    expect(before).toMatchObject({ turn: 2, tideLevel: 0, boatNodeId: 'signal', bridgeOpen: false });
    const proposed = preview(before, open, level);
    expect(proposed.error).toBeNull();
    expect(proposed.state).toEqual({ ...before, turn: 3, tideLevel: 1, bridgeOpen: true });
    expect(session.history).toHaveLength(2);
    expect(session.commit(open)?.after).toEqual(proposed.state);
    expect(session.commit(open)).toBeNull();
    expect(session.undo()).toBe(false);
    session.finish();
    expect(validate(session.state, open, level)).toMatch(/already open/);
    expect(session.commit(open)).toBeNull();
    expect(session.history).toHaveLength(3);
    expect(passageError(session.state, 'harbor', level)).toBeNull();
    play(session, [move('harbor')]);
    expect(passageError(session.state, 'signal', level)).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(proposed.state);
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(before);
    play(session, [open]);
    expect(session.restart()).toBe(true);
    expect(session.state).toEqual(initial(level));
    expect(session.history).toHaveLength(0);
    expect(session.successfulUndos).toBe(0);
  });

  it.each(plans.witnesses)('replays $id, including actual final Undo and unscored redelivery', plan => {
    const session = new Session(level);
    const actions = plan.actions as Action[];
    play(session, actions.slice(0, -1));
    const before = structuredClone(session.state);
    play(session, actions.slice(-1));
    expect(session.state).toMatchObject({status: 'won', bridgeOpen: plan.id === 'signal-first', turn: plan.id === 'signal-first' ? 13 : 17});
    expect(session.takeResult()).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(before);
    play(session, actions.slice(-1));
    expect(session.state.status).toBe('won');
    expect(session.takeResult()).toBeNull();
  });

  it('distinguishes a single-rabbit first load from boarding the whole pier', () => {
    const race = level.edges.find(edge => edge.current)!;
    const session = new Session(level);
    play(session, plans.witnesses[1].actions.slice(0,3) as Action[]);
    expect(session.state).toMatchObject({turn: 3, tideLevel: 1, bridgeOpen: false, boatNodeId: 'east-float'});
    expect(load(session.state, level)).toBe(6);
    expect(draft(session.state, level)).toBe(4);
    expect(session.state.waitingByPier['wick-pier']).toEqual(['ember']);
    expect(passageFlow(race, 1)?.from).toBe('wick');
    expect(passageFlow(race, 2)?.from).toBe('east-float');
    expect(passageFlow(race, 3)?.from).toBe('wick');
    session.restart();
    const wrong = plans.losingAlternatives[1].actions as Action[];
    play(session, wrong.slice(0,2));
    expect(load(session.state, level)).toBe(4);
    expect(validate(session.state, {type:'board', passengerIds:['sorbus']}, level)).toMatch(/needs 7/);
    play(session, wrong.slice(2));
    expect(session.state.lossReason).toEqual({code: 'PASSENGER_STRANDED', pierId: 'east-pier', passengerIds: ['sorbus']});
  });

  it('restores the decisive Wick state after the missed pickup and tide reversal', () => {
    const session = new Session(level);
    const mistake = plans.losingAlternatives[0].actions as Action[];
    play(session, mistake.slice(0,6));
    const fork = structuredClone(session.state);
    expect(fork).toMatchObject({turn:6, boatNodeId:'wick', bridgeOpen:true, aboard:[], delivered:['flax']});
    expect(fork.waitingByPier['east-pier']).toEqual(['sorbus']);
    expect(fork.waitingByPier['wick-pier']).toEqual(['tallow','ember']);
    play(session, mistake.slice(6,7));
    expect(session.state).toMatchObject({turn:7, status:'playing', aboard:['tallow','ember']});
    const beforeLoss = structuredClone(session.state);
    play(session, mistake.slice(7));
    expect(session.state).toMatchObject({turn:8, status:'lost', tideLevel:2,
      lossReason:{code:'PASSENGER_STRANDED',pierId:'east-pier',passengerIds:['sorbus']}});
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(beforeLoss);
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(fork);
    play(session, plans.witnesses[0].actions.slice(6,8) as Action[]);
    expect(session.state).toMatchObject({turn:8, status:'playing', tideLevel:2, aboard:['sorbus']});
  });
});
