import { describe, expect, test } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { holdingPier as level } from '../../src/levels/level';
import {
  initial,
  reduce,
  preview,
  validate,
  legalActions,
  draft,
  type Action,
  type State,
} from '../../src/game/rules';
import { Session } from '../../src/game/session';
const witness = JSON.parse(readFileSync('data/experiments/holding-pier-solution.json', 'utf8'));
const move = (to: string): Action => ({ type: 'move', to });
const wait: Action = { type: 'wait' };
function run(actions: Action[]) {
  let s = initial(level);
  for (const a of actions) {
    expect(validate(s, a, level)).toBeNull();
    s = reduce(s, a, level);
  }
  return s;
}
function conserved(s: State) {
  expect([...s.aboard, ...s.delivered, ...Object.values(s.waitingByPier).flat()].sort()).toEqual([
    'rabbit-1',
    'rabbit-2',
    'sheep-1',
  ]);
}
describe('The Holding Pier uses the actual application reducer', () => {
  test('nine-action designer witness, both tide boundaries and complete Undo', () => {
    const game = new Session(level),
      snapshots = [structuredClone(game.state)];
    for (const a of witness.actions) {
      const before = structuredClone(game.state),
        proposed = preview(game.state, a, level);
      expect(game.state).toEqual(before);
      expect(proposed.error).toBeNull();
      expect(game.commit(a)?.after).toEqual(proposed.state);
      game.finish();
      conserved(game.state);
      snapshots.push(structuredClone(game.state));
      expect(game.state.tideLevel).toBe(game.state.turn < 4 ? 0 : game.state.turn < 8 ? 1 : 2);
      if (game.state.turn === 4) {
        expect(game.state.waitingByPier['rabbit-pier']).toEqual([]);
        expect(draft(game.state, level)).toBe(2);
      }
    }
    expect(game.state).toMatchObject(witness.expected);
    for (let i = snapshots.length - 2; i >= 0; i--) {
      expect(game.undo()).toBe(true);
      expect(game.state).toEqual(snapshots[i]);
    }
    expect(game.restart()).toBe(true);
    expect(game.state).toEqual(initial(level));
  });
  test('home first and waiting for deeper water both lose on action four', () => {
    const home = run([
      move('harbor'),
      { type: 'unload', passengerIds: ['sheep-1'] },
      move('stone'),
      move('shallows'),
    ]);
    const delayed = run([wait, wait, wait, wait]);
    for (const s of [home, delayed])
      expect(s).toMatchObject({
        turn: 4,
        tideLevel: 1,
        status: 'lost',
        lossReason: { pierId: 'rabbit-pier', passengerIds: ['rabbit-1', 'rabbit-2'] },
      });
    const before = run([wait, wait, wait]);
    expect(reduce(before, move('shallows'), level)).toBe(before); // A future rise cannot validate this move.
  });
  test('shortest rescue is nine actions, or twelve when both rabbits arrive while Moss waits at Stone', () => {
    // After the last rise, turns >=8 have identical futures. This is a finite
    // complete search, not a horizon-limited search. Undo only revisits these states.
    const queue = [{ s: initial(level), held: false, keptPromise: true }],
      seen = new Set<string>();
    let wins = 0,
      bypasses = 0,
      shortest = Infinity,
      shortestRequest = Infinity;
    for (let i = 0; i < queue.length; i++) {
      const { s, held, keptPromise } = queue[i];
      const key = JSON.stringify([
        Math.min(s.turn, 8),
        s.tideLevel,
        s.boatNodeId,
        [...s.aboard].sort(),
        Object.entries(s.waitingByPier).map(([id, ids]) => [id, [...ids].sort()]),
        [...s.delivered].sort(),
        s.status,
        held,
        keptPromise,
      ]);
      if (seen.has(key)) continue;
      seen.add(key);
      conserved(s);
      if (s.status === 'won') {
        wins++;
        shortest = Math.min(shortest, s.turn);
        if (keptPromise) shortestRequest = Math.min(shortestRequest, s.turn);
        if (!held) bypasses++;
        continue;
      }
      if (s.status === 'lost') continue;
      for (const a of legalActions(s, level)) {
        const next = reduce(s, a, level);
        const rabbitArrived = next.delivered.some(id =>
          (id === 'rabbit-1' || id === 'rabbit-2') && !s.delivered.includes(id));
        queue.push({
          s: next,
          keptPromise: keptPromise && (!rabbitArrived || next.waitingByPier['stone-pier'].includes('sheep-1')),
          held:
            held ||
            (s.boatNodeId === 'stone' && a.type === 'unload' && a.passengerIds.includes('sheep-1')),
        });
      }
    }
    console.log(
      JSON.stringify({
        experiment: 'holding-pier',
        canonicalStates: seen.size,
        winningStates: wins,
        bypassWins: bypasses,
        shortestActions: shortest,
        shortestRequest,
      }),
    );
    expect(wins).toBeGreaterThan(0);
    expect(bypasses).toBe(0);
    expect(shortest).toBe(9);
    expect(shortestRequest).toBe(12);
    if (process.env.LAST_FERRY_REVIEW_DIR) {
      mkdirSync(process.env.LAST_FERRY_REVIEW_DIR, { recursive: true });
      writeFileSync(
        `${process.env.LAST_FERRY_REVIEW_DIR}/reachability.json`,
        JSON.stringify(
          {
            canonicalStates: seen.size,
            winningStates: wins,
            bypassWins: bypasses,
            shortestActions: shortest,
            shortestRequest,
            method:
              'Actual reducer and legalActions; turn canonicalized only after final rise, no search horizon.',
          },
          null,
          2,
        ),
      );
    }
  });
});
