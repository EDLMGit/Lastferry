import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { level } from '../../src/levels/level';
import {
  copy,
  draft,
  initial,
  load,
  preview,
  reduce,
  validate,
  type Action,
  type State,
} from '../../src/game/rules';
import { Session } from '../../src/game/session';
const move = (to: string): Action => ({ type: 'move', to }),
  wait: Action = { type: 'wait' },
  board: Action = { type: 'board', passengerIds: ['sheep-1'] };
function run(actions: Action[], s = initial()) {
  for (const a of actions) {
    expect(validate(s, a)).toBeNull();
    s = reduce(s, a);
    conserved(s);
  }
  return s;
}
function conserved(s: State) {
  expect([...s.aboard, ...s.delivered, ...Object.values(s.waitingByPier).flat()].sort()).toEqual(
    level.passengers.map((p) => p.id).sort(),
  );
  expect(load(s)).toBeLessThanOrEqual(4);
}
describe('independent game reducer', () => {
  for (const file of readdirSync('data/replays'))
    test(`supplied witness ${file}`, () => {
      const r = JSON.parse(readFileSync(`data/replays/${file}`, 'utf8'));
      const s = run(r.actions);
      for (const [key, value] of Object.entries(r.expected))
        expect(s[key as keyof State]).toEqual(value);
    });
  test('preview is free, copied and agrees with commit', () => {
    const game = new Session();
    const original = copy(game.state);
    for (const a of [move('sheep-pier'), move('outer-south'), wait]) {
      const p = preview(game.state, a);
      if (!p.error) expect(p.state).toEqual(reduce(game.state, a));
      p.state.aboard.length = 0;
    }
    expect(game.state).toEqual(original);
    expect(game.history).toHaveLength(0);
  });
  test('depth is checked before the rise; exact equality is safe', () => {
    let s = run([move('sheep-pier'), board, wait]);
    expect(s.turn).toBe(3);
    expect(draft(s)).toBe(3);
    expect(reduce(s, move('cut'))).toBe(s);
    s = run([wait], s);
    expect(s.tideLevel).toBe(1);
    s = run([move('cut')], s);
    expect(s.turn).toBe(5);
  });
  test('draft bands 0, 1, 2, 3, 4 occupied spaces', () => {
    for (const [ids, want] of [
      [[], 1],
      [['rabbit-1'], 2],
      [['rabbit-1', 'rabbit-2'], 2],
      [['rabbit-1', 'sheep-1'], 3],
      [['rabbit-1', 'rabbit-2', 'sheep-1'], 3],
    ] as [string[], number][]) {
      expect(draft({ ...initial(), aboard: ids })).toBe(want);
    }
  });
  test('last safe boarding precedes flood; no post-rescue deadline', () => {
    let s = run([move('sheep-pier'), ...Array(6).fill(wait), board]);
    expect(s).toMatchObject({ turn: 8, tideLevel: 2, status: 'playing' });
    s = run(
      [
        ...Array(5).fill(wait),
        move('cut'),
        move('harbor'),
        { type: 'unload', passengerIds: [...s.aboard] },
      ],
      s,
    );
    expect(s.status).toBe('won');
    expect(s.turn).toBe(16);
  });
  test('arrival at turn eight is too late', () => {
    const s = run([...Array(7).fill(wait), move('sheep-pier')]);
    expect(s.status).toBe('lost');
    expect(s.waitingByPier['sheep-pier']).toEqual(['sheep-1']);
  });
  test('unloading at turn eight can cause loss and preview reveals it', () => {
    const s = run([move('sheep-pier'), board, ...Array(5).fill(wait)]);
    const a: Action = { type: 'unload', passengerIds: ['rabbit-1'] };
    expect(validate(s, a)).toBeNull();
    expect(preview(s, a).state.status).toBe('lost');
  });
  test('invalid actions are atomic and never saved', () => {
    const g = new Session();
    for (const a of [
      move('cut'),
      move('outer-east'),
      { type: 'board', passengerIds: [] },
      { type: 'unload', passengerIds: ['rabbit-1'] },
    ] as Action[]) {
      expect(g.commit(a)).toBeNull();
      expect(g.state).toEqual(initial());
      expect(g.history).toHaveLength(0);
    }
    g.commit(move('sheep-pier'));
    g.finish();
    const before = copy(g.state);
    for (const ids of [[], ['sheep-1', 'sheep-1'], ['rabbit-1'], ['unknown']]) {
      expect(g.commit({ type: 'board', passengerIds: ids })).toBeNull();
      expect(g.state).toEqual(before);
    }
    expect(g.history).toHaveLength(1);
  });
  test('capacity and berth guards with synthetic data only', () => {
    const l = copy(level);
    l.passengers.push({ id: 'synthetic-rabbit', species: 'rabbit', slots: 1 });
    const s = run([move('sheep-pier')]);
    s.waitingByPier['sheep-pier'].push('synthetic-rabbit');
    expect(
      validate(s, { type: 'board', passengerIds: ['sheep-1', 'synthetic-rabbit'] }, l),
    ).toContain('four');
    l.nodes.find((n) => n.id === 'sheep-pier')!.baseDepth = 2;
    expect(validate(s, board, l)).toContain('berth');
    expect(
      validate(initial(), move('sheep-pier'), {
        ...l,
        nodes: l.nodes.map((n) => (n.id === 'sheep-pier' ? { ...n, baseDepth: 1 } : n)),
      }),
    ).toContain('berth');
  });
  test('all controls lock during presentation; undo restores tide and terminal snapshots', () => {
    const g = new Session();
    for (let i = 0; i < 4; i++) {
      const before = copy(g.state);
      expect(g.commit(wait)).not.toBeNull();
      expect(g.commit(wait)).toBeNull();
      expect(g.undo()).toBe(false);
      expect(g.restart()).toBe(false);
      g.finish();
      if (i === 3) {
        expect(g.state.tideLevel).toBe(1);
        g.undo();
        expect(g.state).toEqual(before);
        g.commit(wait);
        g.finish();
      }
    }
    for (let i = 0; i < 4; i++) {
      g.commit(wait);
      g.finish();
    }
    expect(g.state.status).toBe('lost');
    expect(g.commit(wait)).toBeNull();
    g.undo();
    expect(g.state).toMatchObject({ turn: 7, tideLevel: 1, status: 'playing', lossReason: null });
    expect(g.restart()).toBe(true);
    expect(g.state).toEqual(initial());
    expect(g.history).toHaveLength(0);
  });
  test('win undo and alternate branch conserve passengers', () => {
    const g = new Session();
    const r = JSON.parse(readFileSync('data/replays/full-boat-detour.json', 'utf8'));
    for (const a of r.actions) {
      g.commit(a);
      g.finish();
    }
    expect(g.state.status).toBe('won');
    g.undo();
    conserved(g.state);
    expect(g.state).toMatchObject({ status: 'playing', turn: 6, delivered: [] });
    g.commit(wait);
    g.finish();
    conserved(g.state);
    g.commit({ type: 'unload', passengerIds: [...g.state.aboard] });
    g.finish();
    expect(g.state.status).toBe('won');
  });
});
