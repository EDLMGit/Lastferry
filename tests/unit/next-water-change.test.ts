import { describe, expect, it } from 'vitest';
import { initial, reduce, type Action } from '../../src/game/rules';
import { nextWaterChange } from '../../src/game/rescue-facts';
import { farShore, holdingPier, lanternReach, reefReturn } from '../../src/levels/level';
import holding from '../../data/experiments/holding-pier-solution.json';

describe('the next named water change', () => {
  it('shows the remaining actions on the occupied landing and clears it after boarding on the rise', () => {
    let state = initial(holdingPier);
    for (const [turn, action] of (holding.actions as Action[]).slice(0, 4).entries()) {
      expect(nextWaterChange(state, holdingPier)).toMatchObject({
        afterTurn: 4, remaining: 4 - turn, current: null,
        landings: [{ nodeId: 'rabbit-pier', waiting: ['rabbit-1', 'rabbit-2'] }],
      });
      state = reduce(state, action, holdingPier);
    }
    expect(nextWaterChange(state, holdingPier)).toMatchObject({ remaining: 4, afterTurn: 8, landings: [] });
    for (const action of (holding.actions as Action[]).slice(4, 8)) state = reduce(state, action, holdingPier);
    expect(state.status).toBe('playing');
    expect(nextWaterChange(state, holdingPier)).toBeNull();
  });

  it('connects each newly flooding landing and only an actual reversal to the same rise', () => {
    expect(nextWaterChange(initial(farShore), farShore)).toMatchObject({
      remaining: 6, current: { name: 'Far Reach', from: 'Far Bank', to: 'Tide Steps' },
      landings: [{ nodeId: 'steps', waiting: ['thistle', 'button'] }],
    });
    const high = { ...initial(reefReturn), turn: 8, tideLevel: 1 };
    const next = nextWaterChange(high, reefReturn)!;
    expect(next.landings.map(p => p.name)).toEqual(['Cairn Quay', 'Shell Pool']);
    expect(next.current?.to).toBe('Cairn Quay');
    expect(next.remaining).toBe(1);
  });

  it('identifies an empty landing with a dry winch and stops forecasting after a loss', () => {
    const start = initial(lanternReach);
    const change = nextWaterChange(start, lanternReach)!;
    expect(change.landings).toMatchObject([{ name: 'Signal Quay', waiting: [], winch: true }]);
    expect(change.current).toBeNull();
    expect(nextWaterChange({ ...start, bridgeOpen: true }, lanternReach)!.landings[0].winch).toBe(false);
    expect(nextWaterChange({ ...start, status: 'lost' }, lanternReach)).toBeNull();
  });
});
