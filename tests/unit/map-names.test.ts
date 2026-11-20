import { expect, test } from 'vitest';
import { endpointTargets, placeCoveNames } from '../../src/ui/cove-layout';
import { overlaps, type Rectangle } from '../../src/ui/placement';

const bounds = { left: 0, right: 780, top: 0, bottom: 320 };
const stops = endpointTargets([
  { id: 'harbor', x: 164, y: 190 }, { id: 'high-quay', x: 327, y: 188 },
  { id: 'wide-berth', x: 456, y: 119 }, { id: 'outer', x: 214, y: 257 },
  { id: 'shell', x: 532, y: 259 },
]);
const names = stops.map(stop => ({ id: stop.id, width: 76, height: 20 }));
const distance = (x: number, y: number, rect: Rectangle) => Math.hypot(
  Math.max(rect.left - x, 0, x - rect.right), Math.max(rect.top - y, 0, y - rect.bottom),
);

test('Harbor and High Quay stay attached through pan, crowding and invalid cached placements', () => {
  const previous = new Map([['high-quay', 9999]]);
  const obstacles = [
    { left: 12, top: 267, right: 226, bottom: 311 },
    { left: 444, top: 266, right: 769, bottom: 311 },
    { left: 392, top: 75, right: 503, bottom: 102 },
  ];
  for (const shift of [0, -82, 88]) {
    const visible = endpointTargets(stops.map(s => ({ ...s, x: s.x + shift })));
    const { placed, anchors } = placeCoveNames(names, visible, bounds, obstacles, previous);
    expect(placed.size).toBe(5);
    for (const [id, rect] of placed) {
      const target = visible.find(s => s.id === id)!;
      expect(distance(target.x, target.y, rect)).toBe(15);
      for (const other of visible.filter(s => s.id !== id))
        expect(overlaps(rect, other.bounds, 2)).toBe(false);
      for (const [other, neighbor] of placed)
        if (other !== id) expect(overlaps(rect, neighbor, 2)).toBe(false);
    }
    expect(placeCoveNames(names, visible, bounds, obstacles, anchors).placed).toEqual(placed);
  }
});

test('when the only open space is across the cove the secondary label yields', () => {
  const occupied = { left: 225, top: 128, right: 430, bottom: 248 };
  const result = placeCoveNames(names, stops, bounds, [occupied], new Map([['high-quay', 1]]));
  expect(result.placed.has('high-quay')).toBe(false);
  expect(result.placed.has('harbor')).toBe(true);
});

test('a current name can sit beside the hull at the bottom edge on short phones', () => {
  const harbor = endpointTargets([{ id: 'harbor', x: 225, y: 281 }]);
  const hull = { left: 190, right: 262, top: 206, bottom: 276 };
  const result = placeCoveNames([{ id: 'harbor', width: 55, height: 21 }], harbor,
    { left: 8, right: 772, top: 8, bottom: 312 }, [hull], new Map());
  const name = result.placed.get('harbor')!;
  expect(distance(225, 281, name)).toBe(15);
  expect(overlaps(hull, name, 2)).toBe(false);
  expect(name.bottom).toBeLessThanOrEqual(312);
});
