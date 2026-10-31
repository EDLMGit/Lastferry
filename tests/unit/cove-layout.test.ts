import { describe, expect, it } from 'vitest';
import { endpointTargets, clearCurrentEndpoint } from '../../src/ui/cove-layout';
import { overlaps } from '../../src/ui/placement';

describe('endpoint target layout', () => {
  it('keeps the current hit and focus area outside the boat in narrow and wide views', () => {
    for (const bounds of [
      { left: 8, right: 382, top: 142, bottom: 730 },
      { left: 8, right: 772, top: 70, bottom: 260 },
    ]) {
      const boat = { left: 120, right: 260, top: bounds.top + 30, bottom: bounds.bottom - 30 };
      const original = { id: 'harbor', x: 190, y: (boat.top + boat.bottom) / 2 };
      const moved = clearCurrentEndpoint(original, boat, bounds);
      const hit = endpointTargets([moved])[0];
      expect(overlaps(hit.bounds, boat, 6)).toBe(false);
      expect(hit.size).toBeGreaterThanOrEqual(44);
      expect(moved.id).toBe(original.id);
      expect(clearCurrentEndpoint(original, boat, bounds)).toEqual(moved);
      expect(original.x).toBe(190);
    }
  });
  it('keeps the crowded Reed Landing cue clear of the real Shallow Bend return target', () => {
    const points = [
      { id: 'harbor', x: 281.54668777059334, y: 175.36167748273215 },
      { id: 'yard', x: 381.0532905399925, y: 143.923975326556 },
      { id: 'mooring', x: 448.57562813351325, y: 177.87669365522623 },
      { id: 'bend', x: 448.57562813351325, y: 228.17701710510812 },
      { id: 'reeds', x: 505.43654400174137, y: 220.6319685876258 },
    ];
    const original = structuredClone(points);
    const boat = {
      left: 489.23905376771336,
      right: 522.6418971558663,
      top: 195.13264401612832,
      bottom: 231.02695351926786,
    };
    const bounds = { left: 8, right: 772, top: 70, bottom: 256 };
    const otherHits = endpointTargets(points.slice(0, -1)).map((target) => target.bounds);
    const moved = clearCurrentEndpoint(points[4], boat, bounds, otherHits);
    const targets = endpointTargets([...points.slice(0, -1), moved]);
    const current = targets[4];
    expect(moved.id).toBe('reeds');
    expect(overlaps(current.bounds, boat, 6)).toBe(false);
    expect(current.bounds.left).toBeGreaterThanOrEqual(bounds.left);
    expect(current.bounds.right).toBeLessThanOrEqual(bounds.right);
    expect(current.bounds.top).toBeGreaterThanOrEqual(bounds.top);
    expect(current.bounds.bottom).toBeLessThanOrEqual(bounds.bottom);
    for (const [index, target] of targets.slice(0, -1).entries()) {
      expect(target.x).toBe(points[index].x);
      expect(target.y).toBe(points[index].y);
      expect(target.size).toBeGreaterThanOrEqual(44);
      expect(overlaps(current.bounds, target.bounds, 4), target.id).toBe(false);
    }
    expect(clearCurrentEndpoint(points[4], boat, bounds, [...otherHits].reverse())).toEqual(moved);
    expect(points).toEqual(original);
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
