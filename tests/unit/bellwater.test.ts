import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import witnessData from '../../data/bellwater/witnesses.json';
import { bellwater as level, holdingPier } from '../../src/levels/level';
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

const sorted = (ids: string[]) => [...ids].sort();
const move = (to: string): Action => ({ type: 'move', to });
const wait: Action = { type: 'wait' };
const board = (...passengerIds: string[]): Action => ({ type: 'board', passengerIds });
const unload = (...passengerIds: string[]): Action => ({ type: 'unload', passengerIds });
const witnesses = witnessData.witnesses.map((w) => ({ ...w, actions: w.actions as Action[] }));
const deepOut = [move('west-buoy'), move('east-buoy'), move('low-pier')];
const shallowOut = [move('shallows'), move('low-pier')];

function conserved(s: State) {
  const ids = [...s.aboard, ...s.delivered, ...Object.values(s.waitingByPier).flat()];
  expect(sorted(ids)).toEqual(level.passengers.map((p) => p.id).sort());
  expect(new Set(ids).size).toBe(ids.length);
  expect(load(s, level)).toBeLessThanOrEqual(level.rules.capacity);
}

function run(actions: Action[], start = initial(level)): State {
  return actions.reduce((s, a) => {
    const before = structuredClone(s);
    expect(validate(s, a, level)).toBeNull();
    const proposed = preview(s, a, level);
    expect(s).toEqual(before);
    const after = reduce(s, a, level);
    expect(after).toEqual(proposed.state);
    conserved(after);
    return after;
  }, start);
}

describe('Bellwater Cove uses the production reducer', () => {
  test('authored graph, occupants, depths and tide schedule match the puzzle contract', () => {
    expect(level.rules).toEqual(holdingPier.rules);
    expect(level.nodes).toHaveLength(6);
    expect(level.edges).toHaveLength(6);
    expect(level.world.islands).toHaveLength(3);
    expect(level.piers).toHaveLength(3);
    expect(level.nodes.every((n) => n.baseDepth === 3)).toBe(true);
    expect(level.edges.every((e) => e.bidirectional)).toBe(true);
    expect(
      Object.fromEntries(level.edges.map((e) => [sorted(e.nodes).join('/'), e.baseDepth])),
    ).toEqual({
      'harbor/shallows': 1,
      'low-pier/shallows': 1,
      'harbor/west-buoy': 3,
      'east-buoy/west-buoy': 3,
      'east-buoy/low-pier': 3,
      'bell-pier/harbor': 2,
    });
    expect(Object.fromEntries(level.piers.map((p) => [p.id, p.elevation]))).toEqual({
      'harbor-pier': 3,
      'low-pier': 1,
      'bell-pier': 2,
    });
    expect(initial(level)).toMatchObject({
      boatNodeId: 'harbor',
      aboard: [],
      waitingByPier: { 'harbor-pier': [], 'low-pier': ['tansy', 'lark'], 'bell-pier': ['bram'] },
      delivered: [],
      turn: 0,
      tideLevel: 0,
    });
  });

  for (const witness of witnesses)
    test(`ten-action witness: ${witness.id}`, () => {
      const s = run(witness.actions);
      expect(s).toMatchObject(witness.expected);
      expect(sorted(s.delivered)).toEqual(sorted(level.objective.requiredPassengerIds));
    });

  test('boarding completes before both tide boundaries and complete Undo restores every snapshot', () => {
    const game = new Session(level),
      witness = witnesses.find((w) => w.id === 'deep-outward-shallow-return')!,
      snapshots = [structuredClone(game.state)];
    for (const a of witness.actions) {
      const before = structuredClone(game.state),
        proposed = preview(game.state, a, level);
      expect(game.state).toEqual(before);
      expect(game.commit(a)?.after).toEqual(proposed.state);
      game.finish();
      conserved(game.state);
      snapshots.push(structuredClone(game.state));
      if (game.state.turn === 4)
        expect(game.state).toMatchObject({
          tideLevel: 1,
          status: 'playing',
          aboard: ['tansy', 'lark'],
          waitingByPier: { 'low-pier': [] },
        });
      if (game.state.turn === 8)
        expect(game.state).toMatchObject({
          tideLevel: 2,
          status: 'playing',
          aboard: ['tansy', 'lark', 'bram'],
          waitingByPier: { 'bell-pier': [] },
        });
    }
    expect(game.state.status).toBe('won');
    for (let i = snapshots.length - 2; i >= 0; i--) {
      expect(game.undo()).toBe(true);
      expect(game.state).toEqual(snapshots[i]);
      conserved(game.state);
    }
    expect(game.restart()).toBe(true);
    expect(game.state).toEqual(initial(level));
  });

  test('the shallow return is blocked at action three and inspection does not become a paid wait', () => {
    const s = run([...shallowOut, board('tansy', 'lark')]),
      before = structuredClone(s),
      a = move('shallows');
    expect(s).toMatchObject({ turn: 3, tideLevel: 0 });
    expect(draft(s, level)).toBe(2);
    expect(preview(s, a, level).error).toContain('Too shallow');
    expect(previewCopy(s, a, level).error).toBe(
      'Boat needs depth 2. Passage has depth 1: too shallow.',
    );
    expect(reduce(s, a, level)).toBe(s);
    expect(s).toEqual(before);
    const risen = run([wait], s);
    expect(risen).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
    expect(validate(risen, a, level)).toBeNull();
    expect(run([a], risen).boatNodeId).toBe('shallows');
  });

  test('Bell first, deep both ways and early rabbit delivery miss their real boarding deadlines', () => {
    const bellFirst = run([move('bell-pier'), board('bram'), move('harbor'), move('west-buoy')]);
    expect(bellFirst).toMatchObject({
      turn: 4,
      status: 'lost',
      lossReason: { pierId: 'low-pier', passengerIds: ['tansy', 'lark'] },
    });
    const deepBoth = run([
      ...deepOut,
      board('tansy', 'lark'),
      move('east-buoy'),
      move('west-buoy'),
      move('harbor'),
      move('bell-pier'),
    ]);
    expect(deepBoth).toMatchObject({
      turn: 8,
      boatNodeId: 'bell-pier',
      status: 'lost',
      lossReason: { pierId: 'bell-pier', passengerIds: ['bram'] },
    });
    const homeAtSix = run(witnesses[0].actions.slice(0, 6));
    for (const ids of [['tansy'], ['lark'], ['tansy', 'lark']]) {
      const failed = run([unload(...ids), move('bell-pier')], homeAtSix);
      expect(failed).toMatchObject({
        turn: 8,
        status: 'lost',
        delivered: ids,
        lossReason: { pierId: 'bell-pier', passengerIds: ['bram'] },
      });
    }
  });

  test('critical subsets name the actual stranded rabbit and loss Undo permits safe boarding', () => {
    const game = new Session(level);
    for (const a of deepOut) {
      expect(game.commit(a)).not.toBeNull();
      game.finish();
    }
    const before = structuredClone(game.state);
    for (const [aboard, waiting] of [
      ['tansy', 'lark'],
      ['lark', 'tansy'],
    ]) {
      const text = previewCopy(before, board(aboard), level);
      expect(text.consequence).toContain(
        `${waiting === 'lark' ? 'Lark' : 'Tansy'} is still waiting at Low Pier when it floods.`,
      );
      expect(game.commit(board(aboard))?.after.status).toBe('lost');
      game.finish();
      expect(game.undo()).toBe(true);
      expect(game.state).toEqual(before);
    }
    expect(previewCopy(before, board('tansy', 'lark'), level).consequence).toBe(
      'Tansy and Lark board, then the tide rises. Both are safe aboard.',
    );
    expect(game.commit(board('tansy', 'lark'))?.after.status).toBe('playing');
    game.finish();
    conserved(game.state);
  });

  test('there is no compulsory Wait or late move cap after everyone is aboard', () => {
    const witness = witnesses[0];
    expect(witness.actions.some((a) => a.type === 'wait')).toBe(false);
    const home = run(witness.actions.slice(0, -1));
    expect(home).toMatchObject({ turn: 9, status: 'playing', aboard: ['tansy', 'lark', 'bram'] });
    const late = run([...Array<Action>(5).fill(wait), unload('tansy', 'lark', 'bram')], home);
    expect(late).toMatchObject({ turn: 15, tideLevel: 2, status: 'won' });
  });

  test('complete canonical reachability retains the route and pickup constraints', () => {
    const queue = [
        {
          s: initial(level),
          usedShallow: false,
          waited: false,
          firstMove: '',
          boardedBram: false,
          earlyDelivery: false,
        },
      ],
      seen = new Set<string>();
    let wins = 0,
      noShallowWins = 0,
      bellFirstWins = 0,
      earlyDeliveryWins = 0,
      noWaitWins = 0,
      waitedWins = 0,
      shortest = Infinity;
    const lastRise = Math.max(0, ...level.rules.tide.rises.map((r) => r.afterTurn));
    for (let i = 0; i < queue.length; i++) {
      const entry = queue[i],
        { s, ...flags } = entry;
      const key = JSON.stringify([
        Math.min(s.turn, lastRise),
        s.tideLevel,
        s.boatNodeId,
        sorted(s.aboard),
        Object.entries(s.waitingByPier)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([id, ids]) => [id, sorted(ids)]),
        sorted(s.delivered),
        s.status,
        flags,
      ]);
      if (seen.has(key)) continue;
      seen.add(key);
      conserved(s);
      if (s.status === 'won') {
        wins++;
        shortest = Math.min(shortest, s.turn);
        if (!flags.usedShallow) noShallowWins++;
        if (flags.firstMove === 'bell-pier') bellFirstWins++;
        if (flags.earlyDelivery) earlyDeliveryWins++;
        if (flags.waited) waitedWins++;
        else noWaitWins++;
        continue;
      }
      if (s.status === 'lost') continue;
      for (const a of legalActions(s, level))
        queue.push({
          s: reduce(s, a, level),
          usedShallow:
            flags.usedShallow ||
            (a.type === 'move' &&
              level.edges.some(
                (e) =>
                  e.baseDepth === 1 && e.nodes.includes(s.boatNodeId) && e.nodes.includes(a.to),
              )),
          waited: flags.waited || a.type === 'wait',
          firstMove: flags.firstMove || (a.type === 'move' ? a.to : ''),
          boardedBram: flags.boardedBram || (a.type === 'board' && a.passengerIds.includes('bram')),
          earlyDelivery:
            flags.earlyDelivery ||
            (a.type === 'unload' &&
              s.boatNodeId === 'harbor' &&
              !flags.boardedBram &&
              a.passengerIds.some((id) => ['tansy', 'lark'].includes(id))),
        });
    }
    const report = {
      canonicalStates: seen.size,
      winningStates: wins,
      shortestActions: shortest,
      noShallowWins,
      bellFirstWins,
      earlyDeliveryWins,
      noWaitWins,
      waitedWins,
      method:
        'Production reducer and legalActions, sorted passenger identities and pier keys, turn capped only after the final rise, monotonic path-history flags, no search horizon.',
    };
    console.log(JSON.stringify({ cove: level.id, ...report }));
    expect(wins).toBeGreaterThan(0);
    expect(shortest).toBe(10);
    expect(noShallowWins).toBe(0);
    expect(bellFirstWins).toBe(0);
    expect(earlyDeliveryWins).toBe(0);
    expect(noWaitWins).toBeGreaterThan(0);
    expect(waitedWins).toBeGreaterThan(0);
    if (process.env.LAST_FERRY_REVIEW_DIR) {
      mkdirSync(process.env.LAST_FERRY_REVIEW_DIR, { recursive: true });
      writeFileSync(
        `${process.env.LAST_FERRY_REVIEW_DIR}/bellwater-reachability.json`,
        JSON.stringify(report, null, 2),
      );
    }
  });
});
