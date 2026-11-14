import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import witnessData from '../../data/driftwood-yard/witnesses.json';
import { driftwoodYard as level } from '../../src/levels/level';
import {
  draft,
  initial,
  legalActions,
  load,
  preview,
  reduce,
  validate,
  type Action,
  type State,
} from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { previewCopy } from '../../src/ui/presentation';

const witnesses = witnessData.witnesses.map((w) => ({ ...w, actions: w.actions as Action[] }));
const alternatives = witnessData.losingAlternatives.map((w) => ({
  ...w,
  actions: w.actions as Action[],
}));
const conserved = (state: State) => {
  const ids = [...state.aboard, ...state.delivered, ...Object.values(state.waitingByPier).flat()];
  expect([...ids].sort()).toEqual(level.passengers.map((p) => p.id).sort());
  expect(new Set(ids).size).toBe(ids.length);
  expect(load(state, level)).toBeLessThanOrEqual(4);
};
function replay(actions: Action[], start = initial(level)) {
  return actions.reduce((state, action) => {
    const before = structuredClone(state);
    expect(validate(state, action, level)).toBeNull();
    const proposed = preview(state, action, level);
    expect(state).toEqual(before);
    const next = reduce(state, action, level);
    expect(next).toEqual(proposed.state);
    expect(next.turn).toBe(state.turn + 1);
    conserved(next);
    return next;
  }, start);
}

describe('Driftwood Yard production level', () => {
  test('authored geometry completes the candidate without altering its mechanics', () => {
    expect(level.nodes).toHaveLength(5);
    expect(level.edges).toHaveLength(5);
    expect(level.world.islands).toHaveLength(4);
    expect(level.piers).toHaveLength(4);
    expect(level.rules.capacity).toBe(4);
    expect(level.rules.draftBands).toEqual([
      { maxLoad: 0, draft: 1 },
      { maxLoad: 2, draft: 2 },
      { maxLoad: 4, draft: 3 },
    ]);
    expect(level.rules.tide.rises).toEqual([
      { afterTurn: 7, level: 1 },
      { afterTurn: 11, level: 2 },
    ]);
    expect(level.nodes.every((n) => n.baseDepth === 3)).toBe(true);
    expect(level.edges.every((e) => e.bidirectional)).toBe(true);
    expect(Object.fromEntries(level.edges.map((e) => [e.id, e.baseDepth]))).toEqual({
      'harbor-yard': 2,
      'yard-mooring': 2,
      'harbor-mooring': 3,
      'mooring-bend': 1,
      'bend-reeds': 1,
    });
    expect(Object.fromEntries(level.piers.map((p) => [p.id, p.elevation]))).toEqual({
      'harbor-pier': 3,
      'yard-pier': 1,
      'mooring-pier': 3,
      'reeds-pier': 1,
    });
    for (const edge of level.edges) {
      expect(edge.waypointsXZ.length).toBeGreaterThan(2);
      expect(edge.waypointsXZ[0]).toEqual(
        level.nodes.find((n) => n.id === edge.nodes[0])!.positionXZ,
      );
      expect(edge.waypointsXZ.at(-1)).toEqual(
        level.nodes.find((n) => n.id === edge.nodes[1])!.positionXZ,
      );
    }
    for (const pier of level.piers) {
      expect(level.nodes.find((n) => n.id === pier.nodeId)?.pierId).toBe(pier.id);
      expect(level.world.islands.some((i) => i.id === pier.islandId)).toBe(true);
    }
    expect(level.passengers.map(({ id, species, slots }) => ({ id, species, slots }))).toEqual([
      { id: 'nell', species: 'beaver', slots: 2 },
      { id: 'fern', species: 'rabbit', slots: 1 },
      { id: 'oat', species: 'rabbit', slots: 1 },
    ]);
  });
  for (const witness of witnesses)
    test(`supplied witness ${witness.id}`, () => {
      const session = new Session(level),
        snapshots = [structuredClone(session.state)];
      for (const action of witness.actions) {
        const predicted = preview(session.state, action, level);
        expect(session.commit(action)?.after).toEqual(predicted.state);
        session.finish();
        conserved(session.state);
        snapshots.push(structuredClone(session.state));
        if (session.state.turn === 7)
          expect(session.state).toMatchObject({
            tideLevel: 1,
            status: 'playing',
            aboard: ['fern', 'oat'],
            waitingByPier: { 'reeds-pier': [], 'mooring-pier': ['nell'] },
          });
      }
      expect(session.state.status).toBe('won');
      expect(session.state.turn).toBe(witness.id === 'stage-nell-collect-group' ? 12 : 15);
      for (let index = snapshots.length - 2; index >= 0; index--) {
        expect(session.undo()).toBe(true);
        expect(session.state).toEqual(snapshots[index]);
      }
      expect(session.state).toEqual(initial(level));
    });
  for (const alternative of alternatives)
    test(`temptation ${alternative.id}`, () => {
      const result = replay(alternative.actions);
      expect(result).toMatchObject({ status: 'lost', turn: 7, tideLevel: 1 });
      const lost =
        alternative.id === 'deliver-nell-immediately'
          ? ['fern', 'oat']
          : alternative.id === 'only-one-rabbit-at-last-safe-boarding'
            ? ['oat']
            : ['nell'];
      expect(result.lossReason?.passengerIds).toEqual(lost);
    });
  test('rabbits-first loaded return rejects without mutation or cost; critical subsets warn correctly', () => {
    const start = replay(alternatives[1].actions.slice(0, 4));
    expect(draft(start, level)).toBe(2);
    const before = structuredClone(start),
      action: Action = { type: 'move', to: 'bend' };
    expect(preview(start, action, level).error).toContain('Too shallow');
    expect(reduce(start, action, level)).toBe(start);
    expect(start).toEqual(before);
    const critical = replay(witnesses[0].actions.slice(0, 6));
    expect(
      previewCopy(critical, { type: 'board', passengerIds: ['fern'] }, level).consequence,
    ).toContain('Oat is still waiting at Reed Landing when it floods.');
    expect(
      preview(critical, { type: 'board', passengerIds: ['fern', 'oat'] }, level).state,
    ).toMatchObject({ tideLevel: 1, status: 'playing', aboard: ['fern', 'oat'] });
  });
  test('all normalized reachable wins require temporarily staging Nell, without an artificial move budget', () => {
    const queue = [{ state: initial(level), staged: false }],
      seen = new Set<string>();
    let wins = 0,
      shortest = Infinity,
      bypassWins = 0;
    for (let index = 0; index < queue.length; index++) {
      const { state, staged } = queue[index];
      const key = JSON.stringify([
        Math.min(state.turn, 11),
        state.boatNodeId,
        state.tideLevel,
        [...state.aboard].sort(),
        [...state.delivered].sort(),
        Object.entries(state.waitingByPier).map(([id, ids]) => [id, [...ids].sort()]),
        state.status,
        staged,
      ]);
      if (seen.has(key)) continue;
      seen.add(key);
      conserved(state);
      if (state.status === 'won') {
        wins++;
        shortest = Math.min(shortest, state.turn);
        if (!staged) bypassWins++;
        continue;
      }
      if (state.status === 'lost') continue;
      for (const action of legalActions(state, level))
        queue.push({
          state: reduce(state, action, level),
          staged:
            staged ||
            (action.type === 'unload' &&
              state.boatNodeId === 'mooring' &&
              action.passengerIds.includes('nell')),
        });
    }
    const report = {
      levelId: level.id,
      normalizedStates: seen.size,
      wins,
      shortest,
      bypassWins,
      method:
        'Production legalActions/reduce. Turn normalized only after final rise. No search horizon or gameplay cap.',
    };
    expect(wins).toBeGreaterThan(0);
    expect(shortest).toBe(12);
    expect(bypassWins).toBe(0);
    console.log(JSON.stringify(report));
    if (process.env.LAST_FERRY_REVIEW_DIR) {
      mkdirSync(process.env.LAST_FERRY_REVIEW_DIR, { recursive: true });
      writeFileSync(
        `${process.env.LAST_FERRY_REVIEW_DIR}/production-reachability.json`,
        JSON.stringify(report, null, 2),
      );
    }
    const safe = replay(witnesses[0].actions.slice(0, -1));
    expect(
      replay([...Array<Action>(8).fill({ type: 'wait' }), witnesses[0].actions.at(-1)!], safe),
    ).toMatchObject({ status: 'won', turn: 20 });
  });
});
