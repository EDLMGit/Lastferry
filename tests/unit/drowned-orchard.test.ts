import { describe, expect, it } from 'vitest';
import { drownedOrchard as level } from '../../src/levels/level';
import { draft, initial, legalActions, passageError, passageFlow, preview, type Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import plans from '../../data/drowned-orchard/witnesses.json';

const reach = level.edges.find(edge => edge.current)!;
const boat = (actions: Action[], session = new Session(level)) => {
  for (const action of actions) {
    const before = structuredClone(session.state), next = preview(before, action, level);
    expect(next.error).toBeNull();
    expect(session.state).toEqual(before);
    expect(session.commit(action)?.after).toEqual(next.state);
    session.finish();
    expect([...session.state.aboard, ...session.state.delivered, ...Object.values(session.state.waitingByPier).flat()].sort())
      .toEqual([...level.objective.requiredPassengerIds].sort());
  }
  return session;
};

describe('the two homeward crossings in Drowned Orchard', () => {
  it('starts afloat with dry waiting animals, a flooded through-stop and only one turning passage', () => {
    const s = initial(level);
    expect(s).toMatchObject({turn:0,tideLevel:1,boatNodeId:'orchard',aboard:[],delivered:[]});
    expect(level.edges.filter(e=>e.current)).toHaveLength(1);
    for (const p of level.piers) if (s.waitingByPier[p.id].length) expect(p.elevation).toBeGreaterThan(s.tideLevel);
    expect(level.piers.find(p=>p.id==='quay-pier')!.elevation).toBeLessThanOrEqual(s.tideLevel);
    expect(level.start.waitingByPier['quay-pier']).toEqual([]);
    expect(level.nodes.every(n=>n.baseDepth+s.tideLevel>=draft(s,level))).toBe(true);
  });

  it.each(plans.witnesses)('plays $id without scoring; terminal Undo restores the same final trip', plan => {
    const actions = plan.actions as Action[], session = boat(actions.slice(0,-1)), before = structuredClone(session.state);
    boat(actions.slice(-1),session);
    const won = structuredClone(session.state);
    expect(won).toMatchObject({turn:13,boatNodeId:'harbor',status:'won'});
    expect(session.result).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(before);
    boat(actions.slice(-1),session);
    expect(session.state).toEqual(won);
    expect(session.takeResult()).toBeNull();
    expect(session.successfulUndos).toBe(1);
  });

  it('resolves each boundary move under the old direction and Undo restores direction, cargo and clock together', () => {
    const path = plans.witnesses[0].actions as Action[];
    const session = new Session(level);
    for (const [i,a] of path.entries()) {
      const before = structuredClone(session.state);
      boat([a],session);
      if (i!==4 && i!==8) continue;
      expect(a.type).toBe('move');
      expect(before.boatNodeId).toBe(passageFlow(reach,before.tideLevel)!.from);
      expect(session.state.boatNodeId).toBe(passageFlow(reach,session.state.tideLevel)!.from);
      expect(session.undo()).toBe(true);
      expect(session.state).toEqual(before);
      boat([a],session);
      expect(session.state.tideLevel).toBe(before.tideLevel+1);
    }
    expect(session.successfulUndos).toBe(2);
    expect(session.state.status).toBe('won');
  });

  it('exposes all three Steps subsets: rescuing Sloe alone stays playing until actually crossing seven spaces out of reach', () => {
    const wrong = plans.losingAlternatives[0].actions as Action[], session = boat(wrong.slice(0,1)), save = structuredClone(session.state);
    expect(legalActions(save,level).filter(a=>a.type==='board')).toHaveLength(3);
    boat(wrong.slice(1,2),session);expect(session.state.status).toBe('playing');
    boat(wrong.slice(2),session);
    expect(session.state.lossReason).toMatchObject({code:'RETURN_CAPACITY',offshoreSlots:7,homewardTrips:1});
    while(session.state.turn>1) expect(session.undo()).toBe(true);
    expect(session.state).toEqual(save);
    boat((plans.witnesses[0].actions as Action[]).slice(1),session);
    expect(session.state.status).toBe('won');expect(session.successfulUndos).toBe(3);
  });

  it('the paired Step pickup cannot cross the sill until one passenger stays safely on Orchard Landing', () => {
    const p = plans.witnesses[0].actions as Action[], session = boat(p.slice(0,3));
    expect(draft(session.state,level)).toBe(3);
    expect(passageError(session.state,'quay',level)).toContain('Too shallow');
    boat(p.slice(3,4),session);
    expect(session.state.waitingByPier['orchard-pier']).toContain('sloe');
    expect(draft(session.state,level)).toBe(2);
    expect(passageError(session.state,'quay',level)).toBeNull();
  });
});
