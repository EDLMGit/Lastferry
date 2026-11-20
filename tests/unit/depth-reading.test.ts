import { describe, expect, it } from 'vitest';
import { initial, reduce, validate, type Action } from '../../src/game/rules';
import { farShore, holdingPier, type Level } from '../../src/levels/level';
import { depthReading } from '../../src/ui/depth-reading';
import { ferryInstrument } from '../../src/ui/crossing-instruments';
import { previewCopy } from '../../src/ui/presentation';
import farPlans from '../../data/far-shore/witnesses.json';

function play(level: Level, actions: Action[]) {
  return actions.reduce((state, action) => reduce(state, action, level), initial(level));
}

describe('ferry and water at the current, selected and projected locations', () => {
  it('fills one plank per space and names everyone in the Harbor reading', () => {
    const harbor = play(holdingPier, [
      { type: 'unload', passengerIds: ['sheep-1'] }, { type: 'move', to: 'shallows' },
      { type: 'move', to: 'rabbit-pier' }, { type: 'board', passengerIds: ['rabbit-1', 'rabbit-2'] },
      { type: 'move', to: 'shallows' }, { type: 'move', to: 'stone' },
      { type: 'board', passengerIds: ['sheep-1'] }, { type: 'move', to: 'harbor' },
    ]);
    const gauge = ferryInstrument(harbor, holdingPier);
    expect(gauge.markup.match(/class="deck-slot occupied"/g)).toHaveLength(4);
    expect(gauge.markup).toContain('0/3 home');
    expect(gauge.summary).toContain('4 of 4 deck spaces occupied. Pip, Rue and Moss aboard. Boat needs depth 3. Water here is 5 deep.');
    const starting = ferryInstrument(initial(holdingPier), holdingPier);
    expect(starting.markup.match(/class="deck-slot occupied"/g)).toHaveLength(2);
    expect(starting.markup.match(/class="deck-slot"/g)).toHaveLength(2);
    const deer = play(farShore, farPlans.witnesses[0].actions.slice(0, 8) as Action[]);
    const six = ferryInstrument(deer, farShore);
    expect(six.markup.match(/class="deck-slot occupied"/g)).toHaveLength(4);
    expect(six.markup.match(/class="deck-slot"/g)).toHaveLength(2);
    expect(six.details).toContain('Button and Rowan aboard');
  });
  it('distinguishes Moss’s current berth from the shallower passage and an equal-depth route', () => {
    const state = initial(holdingPier);
    expect(depthReading(state, holdingPier)).toMatchObject({ scope: 'here', load: 2, capacity: 4, needed: 2, water: 3 });
    expect(depthReading(state, holdingPier, { type: 'move', to: 'shallows' }))
      .toMatchObject({ scope: 'crossing', needed: 2, passage: 1, berth: 3, water: 1, limit: 'passage' });
    expect(depthReading(state, holdingPier, { type: 'move', to: 'harbor' }))
      .toMatchObject({ passage: 3, berth: 3, water: 3, limit: 'both' });
  });

  it('reads the receiving berth and the selected load before a scheduled rise', () => {
    const state = play(holdingPier, [
      { type: 'unload', passengerIds: ['sheep-1'] }, { type: 'move', to: 'shallows' }, { type: 'move', to: 'rabbit-pier' },
    ]);
    const before = structuredClone(state);
    const action: Action = { type: 'board', passengerIds: ['rabbit-1', 'rabbit-2'] };
    expect(depthReading(state, holdingPier, action))
      .toMatchObject({ load: 2, needed: 2, water: 3, scope: 'board' });
    expect(previewCopy(state, action, holdingPier, false).consequence).toBe('Pip and Rue board, then the tide rises and floods Rabbit Pier.');
    expect(previewCopy(state, { type: 'board', passengerIds: ['rabbit-1'] }, holdingPier, false).consequence).toBe('Pip boards, then the tide rises and floods Rabbit Pier.');
    expect(depthReading(state, holdingPier, { type: 'board', passengerIds: [] })).toMatchObject({ load: 0, needed: 1, water: 3 });
    const next = reduce(state, action, holdingPier);
    expect(depthReading(next, holdingPier)).toMatchObject({ needed: 2, water: 4 });
    expect(state).toEqual(before);
  });

  it('uses the shallower arrival basin when the passage can admit the loaded boat', () => {
    const level = structuredClone(holdingPier);
    level.nodes.find(node => node.id === 'harbor')!.baseDepth = 1;
    const state = initial(level);
    const action: Action = { type: 'move', to: 'harbor' };
    expect(validate(state, action, level)).toContain('berth');
    expect(depthReading(state, level, action)).toMatchObject({ needed: 2, water: 1, passage: 3, berth: 1, limit: 'berth' });
  });

  it('compares Rowan’s two projected loads on the exact same real tide at Rush', () => {
    const board: Action = { type: 'board', passengerIds: ['rowan'] };
    const wrong = play(farShore, farPlans.losingAlternatives[0].actions.slice(0, 7) as Action[]);
    const right = play(farShore, farPlans.witnesses[0].actions.slice(0, 7) as Action[]);
    expect(depthReading(wrong, farShore, board)).toMatchObject({ needed: 4, water: 3, load: 5, capacity: 6 });
    expect(validate(wrong, board, farShore)).toMatch(/berth/);
    expect(depthReading(right, farShore, board)).toMatchObject({ needed: 3, water: 3, load: 4, capacity: 6 });
    expect(validate(right, board, farShore)).toBeNull();
  });

  it('shows an over-capacity choice without assigning a draft to an unsupported load', () => {
    const start = initial(farShore);
    const state = { ...start, aboard: ['thistle', 'button', 'peat'] };
    expect(depthReading(state, farShore, { type: 'board', passengerIds: ['rowan'] }))
      .toMatchObject({ load: 7, capacity: 6, needed: null });
  });
});
