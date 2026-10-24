import { describe, expect, test } from 'vitest';
import { bellwater, holdingPier } from '../../src/levels/level';
import type { Action } from '../../src/game/rules';
import { getLevelPaths } from '../../src/scene/paths';
import {
  journeyProgress,
  restrainedTiming,
  settlingProgress,
  slowerTiming,
  transitionPlan,
} from '../../src/scene/transitions';
import { overlaps, placeLocalCard } from '../../src/ui/placement';

describe('journey presentation policy', () => {
  test('short and long canonical courses finish before their own recovery with a bounded tide phase', () => {
    const lengths = [holdingPier, bellwater].flatMap((level) =>
      [...getLevelPaths(level).values()].map((path) => path.length),
    );
    const plans = lengths.map((length) =>
      transitionPlan({ type: 'move', to: 'destination' }, false, length, false),
    );
    expect(Math.max(...plans.map((plan) => plan.duration))).toBeGreaterThan(2700);
    expect(Math.max(...plans.map((plan) => plan.duration))).toBeLessThanOrEqual(3000);
    expect(Math.min(...plans.map((plan) => plan.duration))).toBeGreaterThanOrEqual(1600);
    expect(Math.min(...plans.map((plan) => plan.duration))).toBeLessThan(1950);
    for (const plan of plans) {
      expect(plan.tideDuration).toBeLessThan(plan.duration / 2);
      expect(plan.recoveryDelay - plan.duration).toBeGreaterThanOrEqual(900);
      expect(plan.recoveryDelay - plan.duration).toBeLessThanOrEqual(1100);
    }
    const move = { type: 'move', to: 'destination' } as const;
    expect(transitionPlan(move, false, lengths[0], true).duration).toBeLessThan(50);
    expect(transitionPlan({ type: 'wait' }, false, 0, false).duration).toBeLessThan(600);
    expect(
      transitionPlan({ type: 'unload', passengerIds: ['moss'] }, true, 0, false).duration,
    ).toBeLessThan(plans[0].duration);
  });

  test('calmer sailing leaves Reduced, transfers and visible delivery timing unchanged', () => {
    const actions: Action[] = [
      { type: 'move', to: 'destination' },
      { type: 'wait' },
      { type: 'board', passengerIds: ['pip'] },
      { type: 'unload', passengerIds: ['pip'] },
    ];
    for (const action of actions) {
      expect(transitionPlan(action, true, 9, true, slowerTiming)).toEqual(
        transitionPlan(action, true, 9, true, restrainedTiming),
      );
      if (action.type !== 'move')
        expect(transitionPlan(action, true, 9, false, slowerTiming)).toEqual(
          transitionPlan(action, true, 9, false, restrainedTiming),
        );
    }
  });

  test('distance progresses monotonically with a steady middle and symmetric gentle ends', () => {
    const samples = Array.from({ length: 101 }, (_, index) => journeyProgress(index / 100));
    expect(samples[0]).toBe(0);
    expect(samples.at(-1)).toBe(1);
    for (let index = 1; index < samples.length; index++) {
      expect(samples[index]).toBeGreaterThan(samples[index - 1]);
      expect(samples[index]).toBeCloseTo(1 - samples[100 - index], 10);
    }
    const delta = (t: number) => journeyProgress(t + 0.01) - journeyProgress(t);
    expect(delta(0)).toBeLessThan(delta(0.1));
    expect(delta(0.1)).toBeLessThan(delta(0.4));
    expect(delta(0.3)).toBeCloseTo(delta(0.6), 10);
    expect(delta(0.99)).toBeCloseTo(delta(0), 10);
    expect(journeyProgress(-1)).toBe(0);
    expect(journeyProgress(2)).toBe(1);
  });

  test('the bounded settling phase completes with a long crossing rather than stretching across it', () => {
    const plan = transitionPlan({ type: 'move', to: 'east-buoy' }, false, 9, false);
    expect(settlingProgress(plan.duration / 2, plan)).toBe(0);
    expect(settlingProgress(plan.duration - plan.tideDuration / 2, plan)).toBeCloseTo(0.5);
    expect(settlingProgress(plan.duration, plan)).toBe(1);
    expect(settlingProgress(plan.recoveryDelay, plan)).toBe(1);
    const transfer = transitionPlan({ type: 'board', passengerIds: ['pip'] }, false, 0, false);
    expect(settlingProgress(transfer.duration / 2, transfer)).toBeCloseTo(0.5);
    const reduced = transitionPlan({ type: 'wait' }, false, 0, true);
    expect(settlingProgress(reduced.duration, reduced)).toBe(1);
  });
});

describe('local card placement', () => {
  test('rejects a preferred position that overlaps the loaded ferry after viewport clamping', () => {
    const bounds = { left: 12, top: 90, right: 1428, bottom: 810 };
    const ferry = { left: 1180, top: 600, right: 1420, bottom: 780 };
    const hud = { left: 12, top: 90, right: 500, bottom: 160 };
    const card = placeLocalCard(300, 160, bounds, [ferry, hud], [[1440, 780]]);
    expect(card).not.toBeNull();
    expect(overlaps(card!, ferry)).toBe(false);
    expect(overlaps(card!, hud)).toBe(false);
    expect(card!.left).toBeGreaterThanOrEqual(bounds.left);
    expect(card!.right).toBeLessThanOrEqual(bounds.right);
    expect(card!.top).toBeGreaterThanOrEqual(bounds.top);
    expect(card!.bottom).toBeLessThanOrEqual(bounds.bottom);
  });

  test('reports no full-size fit and permits a compact fallback without hiding obstacles', () => {
    const bounds = { left: 0, top: 0, right: 500, bottom: 300 };
    const obstacle = { left: 200, top: 0, right: 500, bottom: 300 };
    expect(placeLocalCard(220, 120, bounds, [obstacle], [[0, 0]])).toBeNull();
    const compact = placeLocalCard(180, 120, bounds, [obstacle], [[0, 0]]);
    expect(compact).not.toBeNull();
    expect(overlaps(compact!, obstacle)).toBe(false);
  });
});
