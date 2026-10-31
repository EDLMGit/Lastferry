import { describe, expect, test } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { wideBerth as level } from '../../src/levels/level';
import proposal from '../../LAST_FERRY_WIDE_BERTH_PACKAGE/design/wide-proof/wide-berth-mechanics.proposal.json';
import witnessData from '../../data/wide-berth/witnesses.json';
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

const plans = witnessData.witnesses.map((w) => ({ ...w, actions: w.actions as Action[] }));
const failures = witnessData.losingAlternatives.map((w) => ({
  ...w,
  actions: w.actions as Action[],
}));
const conserved = (state: State) => {
  const ids = [...state.aboard, ...state.delivered, ...Object.values(state.waitingByPier).flat()];
  expect([...ids].sort()).toEqual(level.passengers.map((p) => p.id).sort());
  expect(new Set(ids).size).toBe(ids.length);
  expect(load(state, level)).toBeLessThanOrEqual(6);
};
const replay = (actions: Action[], start = initial(level)) =>
  actions.reduce((before, action) => {
    const copy = structuredClone(before),
      predicted = preview(before, action, level);
    expect(validate(before, action, level)).toBeNull();
    expect(before).toEqual(copy);
    const after = reduce(before, action, level);
    expect(after).toEqual(predicted.state);
    expect(after.turn).toBe(before.turn + 1);
    conserved(after);
    return after;
  }, start);

describe('actual authored Wide Berth', () => {
  test('complete geometry retains the exact non-spatial proposal and ordered draft coverage', () => {
    expect(level.rules).toEqual(proposal.rules);
    expect(
      level.nodes.map(({ id, baseDepth, pierId }) => ({
        id,
        baseDepth,
        ...(pierId ? { pierId } : {}),
      })),
    ).toEqual(proposal.nodes);
    expect(
      level.edges.map(({ id, nodes, baseDepth, bidirectional }) => ({
        id,
        nodes,
        baseDepth,
        bidirectional,
      })),
    ).toEqual(proposal.edges);
    expect(
      level.piers.map(({ id, nodeId, elevation, isDeliveryPier }) => ({
        id,
        nodeId,
        elevation,
        isDeliveryPier,
      })),
    ).toEqual(proposal.piers);
    expect(level.passengers).toEqual(proposal.passengers);
    expect(level.start).toEqual(proposal.start);
    expect(level.objective).toEqual(proposal.objective);
    expect(level.world.islands).toHaveLength(4);
    for (const edge of level.edges) {
      expect(edge.waypointsXZ.length).toBeGreaterThan(2);
      expect(edge.waypointsXZ[0]).toEqual(
        level.nodes.find((n) => n.id === edge.nodes[0])!.positionXZ,
      );
      expect(edge.waypointsXZ.at(-1)).toEqual(
        level.nodes.find((n) => n.id === edge.nodes[1])!.positionXZ,
      );
    }
    const byLoad = new Map<number, number>();
    for (let mask = 0; mask < 64; mask++) {
      const aboard = level.passengers.filter((_, i) => mask & (1 << i)).map((p) => p.id);
      const state = { ...initial(level), aboard };
      for (const ids of Object.values(state.waitingByPier))
        for (let i = ids.length - 1; i >= 0; i--) if (aboard.includes(ids[i])) ids.splice(i, 1);
      if (load(state, level) <= 6) byLoad.set(load(state, level), draft(state, level));
    }
    expect([...byLoad].sort(([a], [b]) => a - b)).toEqual([
      [0, 1],
      [1, 2],
      [2, 2],
      [3, 3],
      [4, 3],
      [5, 4],
      [6, 4],
    ]);
  });
  for (const [i, plan] of plans.entries())
    test(`production witness ${plan.id}`, () => {
      const session = new Session(level),
        snapshots = [structuredClone(session.state)];
      let maxSpaces = 0,
        maxBodies = 0;
      for (const action of plan.actions) {
        const predicted = preview(session.state, action, level);
        expect(predicted.error).toBeNull();
        expect(session.commit(action)?.after).toEqual(predicted.state);
        const busy = structuredClone(session.state),
          history = session.history.length;
        expect(session.commit(action)).toBeNull();
        expect(session.state).toEqual(busy);
        expect(session.history).toHaveLength(history);
        session.finish();
        conserved(session.state);
        snapshots.push(structuredClone(session.state));
        maxSpaces = Math.max(maxSpaces, load(session.state, level));
        maxBodies = Math.max(maxBodies, session.state.aboard.length);
      }
      expect(session.state).toMatchObject({ status: 'won', turn: [13, 14, 17, 16][i] });
      expect(maxSpaces).toBe(6);
      if (i === 2) expect(maxBodies).toBe(5);
      for (let index = snapshots.length - 2; index >= 0; index--) {
        expect(session.undo()).toBe(true);
        expect(session.state).toEqual(snapshots[index]);
      }
      expect(session.state).toEqual(initial(level));
      expect(session.history).toEqual([]);
    });
  for (const plan of failures)
    test(`production losing branch ${plan.id}`, () => {
      const state = replay(plan.actions);
      expect(state.status).toBe('lost');
      expect(state.turn).toBe(plan.actions.length);
      expect(state.lossReason?.passengerIds.length).toBeGreaterThan(0);
      const session = new Session(level);
      for (const action of plan.actions) {
        expect(session.commit(action)).not.toBeNull();
        session.finish();
      }
      expect(session.undo()).toBe(true);
      expect(session.state.status).toBe('playing');
    });
  test('current-depth rejection never anticipates the rise, costs nothing, and unloading only one rabbit stays draft four', () => {
    const fork = replay(plans[0].actions.slice(0, 4));
    for (const before of [fork, replay([{ type: 'wait' }], fork)]) {
      const session = new Session(level);
      session.state = structuredClone(before);
      const copy = structuredClone(session.state),
        action: Action = { type: 'move', to: 'harbor' };
      expect(preview(before, action, level).error).toBeTruthy();
      expect(session.commit(action)).toBeNull();
      expect(session.state).toEqual(copy);
      expect(session.history).toEqual([]);
      expect(session.busy).toBe(false);
    }
    const five = replay([{ type: 'unload', passengerIds: ['poppy'] }], fork);
    expect(load(five, level)).toBe(5);
    expect(draft(five, level)).toBe(4);
    expect(preview(five, { type: 'move', to: 'shell-landing' }, level).error).toBeTruthy();
    const atNine = replay(
      [{ type: 'wait' }, { type: 'wait' }, { type: 'wait' }, { type: 'wait' }, { type: 'wait' }],
      fork,
    );
    expect(atNine.turn).toBe(9);
    expect(atNine.tideLevel).toBe(1);
    expect(preview(atNine, { type: 'move', to: 'harbor' }, level).error).toBeTruthy();
    expect(reduce(atNine, { type: 'move', to: 'harbor' }, level)).toBe(atNine);
  });
  test('boarding on a flood action saves a complete group; arrival and incomplete selections produce the real losses', () => {
    const early = replay([{ type: 'wait' }, { type: 'wait' }, ...plans[0].actions.slice(0, 2)]);
    expect(early.turn).toBe(4);
    const board = plans[0].actions[2];
    expect(preview(early, board, level).state).toMatchObject({
      turn: 5,
      tideLevel: 1,
      status: 'playing',
    });
    expect(
      preview(early, { type: 'board', passengerIds: ['alder', 'poppy', 'wren'] }, level).state
        .lossReason?.passengerIds,
    ).toContain('clover');
    const late = replay(plans[0].actions.slice(0, 9));
    expect(late).toMatchObject({ turn: 9, boatNodeId: 'shell-landing', tideLevel: 1 });
    expect(preview(late, plans[0].actions[9], level).state).toMatchObject({
      turn: 10,
      tideLevel: 2,
      status: 'playing',
    });
    const subset = preview(late, { type: 'board', passengerIds: ['sorrel'] }, level);
    expect(subset.state.lossReason?.passengerIds).toEqual(['finch']);
    expect(
      previewCopy(late, { type: 'board', passengerIds: ['sorrel'] }, level).consequence,
    ).toContain('Finch is still waiting at Shell Landing when it floods');
    const arrival = replay(failures[0].actions);
    expect(arrival).toMatchObject({ turn: 10, status: 'lost', boatNodeId: 'shell-landing' });
  });
  test('all six may wait safely at High Quay; overcapacity rejection and five-body selection are independent of packing', () => {
    const actions: Action[] = [
      ...plans[0].actions.slice(0, 4),
      { type: 'unload', passengerIds: ['alder', 'clover', 'poppy', 'wren'] },
      { type: 'move', to: 'shell-landing' },
      { type: 'board', passengerIds: ['sorrel', 'finch'] },
      { type: 'move', to: 'high-quay' },
      { type: 'unload', passengerIds: ['sorrel', 'finch'] },
    ];
    const state = replay(actions);
    expect(state.waitingByPier['high-quay-pier']).toHaveLength(6);
    const session = new Session(level);
    session.state = structuredClone(state);
    expect(
      session.commit({ type: 'board', passengerIds: level.passengers.map((p) => p.id) }),
    ).toBeNull();
    expect(session.state).toEqual(state);
    expect(session.busy).toBe(false);
    expect(session.history).toEqual([]);
    const selected = ['alder', 'poppy', 'wren', 'sorrel', 'finch'];
    const after = session.commit({ type: 'board', passengerIds: selected })!.after;
    expect(after.turn).toBe(state.turn + 1);
    expect(load(after, level)).toBe(6);
    expect(after.aboard).toHaveLength(5);
    session.finish();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(state);
  });
  test('production reachability retains both branches and every surviving first-rise path has carried six', () => {
    const bound = 26,
      queue = [{ state: initial(level), carriedSix: false }],
      seen = new Set<string>();
    let cutoffs = 0,
      wins = 0,
      losses = 0,
      shortest = Infinity,
      maxLoad = 0,
      maxBodies = 0,
      firstRiseWithoutSix = 0;
    for (let i = 0; i < queue.length; i++) {
      const { state, carriedSix } = queue[i];
      const key = JSON.stringify([
        Math.min(state.turn, 10),
        state.boatNodeId,
        state.tideLevel,
        [...state.aboard].sort(),
        [...state.delivered].sort(),
        Object.entries(state.waitingByPier).map(([id, ids]) => [id, [...ids].sort()]),
        state.status,
        carriedSix,
      ]);
      if (seen.has(key)) continue;
      seen.add(key);
      maxLoad = Math.max(maxLoad, load(state, level));
      maxBodies = Math.max(maxBodies, state.aboard.length);
      if (state.status === 'won') {
        wins++;
        shortest = Math.min(shortest, state.turn);
        continue;
      }
      if (state.status === 'lost') {
        losses++;
        continue;
      }
      if (state.turn >= 5 && !carriedSix) firstRiseWithoutSix++;
      if (state.turn >= bound) {
        cutoffs++;
        continue;
      }
      for (const action of legalActions(state, level)) {
        const next = reduce(state, action, level);
        queue.push({ state: next, carriedSix: carriedSix || load(next, level) === 6 });
      }
    }
    expect(wins).toBeGreaterThan(0);
    expect(shortest).toBe(13);
    expect(cutoffs).toBe(0);
    expect(firstRiseWithoutSix).toBe(0);
    expect(maxLoad).toBe(6);
    expect(maxBodies).toBe(5);
    const paths = ['data/wide-berth.level.json', 'src/game/rules.ts', 'src/game/session.ts'];
    const report = {
      level: level.id,
      normalizedStates: seen.size,
      terminalWins: wins,
      terminalLosses: losses,
      shortest,
      maxLoad,
      maxBodies,
      firstRiseWithoutSix,
      bound,
      cutoffs,
      method:
        'Actual legalActions/reduce; membership sorted, turn normalized after final rise10, carried-six history preserved. Bound is search only, never a game limit.',
      sourceIdentities: Object.fromEntries(
        paths.map((p) => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]),
      ),
    };
    console.log(JSON.stringify(report));
    if (process.env.LAST_FERRY_REVIEW_DIR) {
      mkdirSync(process.env.LAST_FERRY_REVIEW_DIR, { recursive: true });
      writeFileSync(
        `${process.env.LAST_FERRY_REVIEW_DIR}/production-reachability.json`,
        JSON.stringify(report, null, 2),
      );
    }
  }, 20000);
});
