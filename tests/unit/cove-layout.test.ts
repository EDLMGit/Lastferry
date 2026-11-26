import { describe, expect, it } from 'vitest';
import { endpointTargets, placeCoveTargets } from '../../src/ui/cove-layout';
import { overlaps } from '../../src/ui/placement';

describe('endpoint target layout', () => {
  it('keeps a cue on its real endpoint when the ferry or controls occupy every local position', () => {
    const viewport = { left: 0, top: 0, right: 780, bottom: 320 };
    const points = [{ id: 'high-quay', x: 490, y: 170 }, { id: 'harbor', x: 355, y: 175 }];
    const obstacles = [
      { left: 420, right: 570, top: 100, bottom: 240 },
      { left: 200, right: 490, top: 120, bottom: 240 },
    ];
    const first = placeCoveTargets(points, viewport, obstacles, [obstacles[0]]);
    for (const [index, target] of first.entries()) {
      expect(Math.hypot(target.x - points[index].x, target.y - points[index].y)).toBeLessThanOrEqual(26);
      expect(target.size).toBeGreaterThanOrEqual(44);
    }
    expect(first[0].onFigure).toBe(true);
    expect(placeCoveTargets(points, viewport, obstacles, [obstacles[0]])).toEqual(first);
    const offscreen = placeCoveTargets([{ id: 'harbor', x: -4, y: 160 }], viewport, [], []);
    expect(offscreen[0]).toMatchObject({ onscreen: false, x: -4, y: 160 });
  });
  it('protects passengers and leaves an unobstructed neighboring endpoint in place', () => {
    const points = [{ id: 'reeds', x: 520, y: 210 }, { id: 'bend', x: 452, y: 214 }];
    const faces = [{ left: 506, top: 181, right: 533, bottom: 212 }];
    const viewport = { left: 0, top: 0, right: 780, bottom: 320 };
    const [reeds, bend] = placeCoveTargets(points, viewport, [], faces);
    expect(reeds.onFigure).toBe(false);
    expect(overlaps(reeds.bounds, bend.bounds, 0)).toBe(false);
    expect(bend).toMatchObject(points[1]);
  });
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
