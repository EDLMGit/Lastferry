import { describe, expect, it } from 'vitest';
import { endpointTargets } from '../../src/ui/cove-layout';
import { overlaps } from '../../src/ui/placement';

describe('endpoint target layout', () => {
  const bellwater = [
    { id: 'harbor', x: 158.29772, y: 208.87447 },
    { id: 'shallows', x: 286.72601, y: 221.8585 },
    { id: 'low-pier', x: 415.1543, y: 221.8585 },
    { id: 'west-buoy', x: 183.52471, y: 264.0566 },
    { id: 'east-buoy', x: 389.92732, y: 268.92562 },
    { id: 'bell-pier', x: 295.89946, y: 168.29937 },
  ];

  it('keeps the six short-phone endpoints individually reachable without moving them', () => {
    const targets = endpointTargets(bellwater);
    for (const [index, target] of targets.entries()) {
      expect((target.bounds.left + target.bounds.right) / 2).toBeCloseTo(bellwater[index].x);
      expect((target.bounds.top + target.bounds.bottom) / 2).toBeCloseTo(bellwater[index].y);
      expect(target.bounds.right - target.bounds.left).toBeGreaterThanOrEqual(44);
      expect(target.bounds.bottom - target.bounds.top).toBeGreaterThanOrEqual(44);
      for (const other of targets.slice(index + 1))
        expect(overlaps(target.bounds, other.bounds, 0), `${target.id}/${other.id}`).toBe(false);
    }
    expect(targets.filter((target) => target.size < 48).map((target) => target.id)).toEqual([
      'low-pier',
      'east-buoy',
    ]);
  });

  it('preserves larger targets when the same topology has more screen space', () => {
    const targets = endpointTargets(
      bellwater.map((point) => ({ ...point, x: point.x * 1.2, y: point.y * 1.2 })),
    );
    expect(targets.every((target) => target.size === 48)).toBe(true);
  });

  it('does not depend on node iteration order or mutate the projected inputs', () => {
    const input = structuredClone(bellwater);
    const forward = endpointTargets(input);
    const reversed = endpointTargets([...input].reverse()).reverse();
    expect(reversed).toEqual(forward);
    expect(input).toEqual(bellwater);
  });
});
