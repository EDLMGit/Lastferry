import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { arrangementForState, companionCells, companionNote } from '../../src/audio/arrangement';
import { occupiedPierDeadline } from '../../src/game/rescue-facts';
import { initial, preview, reduce, type Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { level, holdingPier, bellwater, type Level } from '../../src/levels/level';
import { score } from '../../src/audio/score';

const holding = JSON.parse(readFileSync('data/experiments/holding-pier-solution.json', 'utf8'))
  .actions as Action[];
const bell = JSON.parse(readFileSync('data/bellwater/witnesses.json', 'utf8')).witnesses[1]
  .actions as Action[];
function states(l: Level, actions: Action[]) {
  const result = [initial(l)];
  for (const action of actions) result.push(reduce(result.at(-1)!, action, l));
  return result;
}

describe('rescue arrangements follow committed passenger safety', () => {
  test('Holding exact-boundary boarding removes threat but safe holding is not homeward', () => {
    const s = states(holdingPier, holding);
    expect(s.map((state) => arrangementForState(state, holdingPier))).toEqual([
      'ordinary',
      'ordinary',
      'deadline',
      'deadline',
      'ordinary',
      'ordinary',
      'ordinary',
      'homeward',
      'homeward',
      'won',
    ]);
    expect(occupiedPierDeadline(s[3], holdingPier)?.actions).toBe(1);
    expect(occupiedPierDeadline(s[4], holdingPier)).toBeNull();
    expect(s[4].waitingByPier['stone-pier']).toContain('sheep-1');
  });

  test('Bellwater boarding at actions four and eight removes the right deadline', () => {
    const s = states(bellwater, bell);
    expect(occupiedPierDeadline(s[3], bellwater)?.actions).toBe(1);
    expect(occupiedPierDeadline(s[4], bellwater)).toMatchObject({
      actions: 4,
      pier: { id: 'bell-pier' },
    });
    expect(arrangementForState(s[4], bellwater)).toBe('ordinary');
    expect(arrangementForState(s[6], bellwater)).toBe('deadline');
    expect(arrangementForState(s[7], bellwater)).toBe('deadline');
    expect(occupiedPierDeadline(s[8], bellwater)).toBeNull();
    expect(arrangementForState(s[8], bellwater)).toBe('homeward');
    expect(arrangementForState(s[9], bellwater)).toBe('homeward');
    expect(arrangementForState(s[10], bellwater)).toBe('won');
  });

  test('First Crossing ignores its harmless first rise; previews and idle do not alter committed facts', () => {
    const game = new Session(level);
    for (let i = 0; i < 4; i++) {
      game.commit({ type: 'wait' });
      game.finish();
    }
    const before = structuredClone(game.state);
    expect(occupiedPierDeadline(before, level)?.actions).toBe(4);
    expect(arrangementForState(before, level)).toBe('ordinary');
    for (let i = 0; i < 100; i++) {
      preview(game.state, { type: 'wait' }, level);
      preview(game.state, { type: 'move', to: 'invalid' }, level);
      expect(arrangementForState(game.state, level)).toBe('ordinary');
    }
    expect(game.state).toEqual(before);
  });

  test('terminal precedence and Undo restore homeward or the occupied-pier deadline', () => {
    const game = new Session(holdingPier);
    for (const action of holding) {
      game.commit(action);
      game.finish();
    }
    expect(arrangementForState(game.state, holdingPier)).toBe('won');
    game.undo();
    expect(arrangementForState(game.state, holdingPier)).toBe('homeward');
    game.restart();
    for (let i = 0; i < 4; i++) {
      game.commit({ type: 'wait' });
      game.finish();
    }
    expect(arrangementForState(game.state, holdingPier)).toBe('lost');
    game.undo();
    expect(arrangementForState(game.state, holdingPier)).toBe('deadline');
  });

  test('every companion cell fits its chord and opens on a shared pitch across long pad releases', () => {
    for (let i = 0; i < score.harmonies.length; i++) {
      const chord = score.harmonies[i].notes.map((n) => n % 12);
      const previous = score.harmonies[(i + 9) % 10].notes.map((n) => n % 12);
      for (const pitch of companionCells[i]) expect(chord).toContain(pitch % 12);
      expect(previous).toContain(companionCells[i][0] % 12);
      for (let offset = 0; offset < 8; offset++) {
        const note = companionNote(i * 8 + offset, 'homeward')!;
        expect(chord).toContain(note.note % 12);
        if (offset < 3) expect(previous).toContain(note.note % 12);
        if (offset >= 6)
          expect(score.harmonies[(i + 1) % 10].notes.map((n) => n % 12)).toContain(note.note % 12);
      }
    }
  });
});
