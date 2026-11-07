import { expect, test } from 'vitest';
import { placeDriftwoodLabels } from '../../src/ui/driftwood-labels';
import { overlaps, type Rectangle } from '../../src/ui/placement';
const names = [
  { id: 'harbor', width: 147, height: 27 },
  { id: 'yard', width: 120, height: 27 },
  { id: 'mooring', width: 116, height: 27 },
  { id: 'bend', width: 117, height: 27 },
  { id: 'reeds', width: 111, height: 27 },
];
const stops = (coordinates: number[][]) =>
  coordinates.map(([x, y], index) => ({
    id: names[index].id,
    x,
    y,
    bounds: { left: x - 24, right: x + 24, top: y - 24, bottom: y + 24 },
  }));
const portrait = stops([
  [57, 449],
  [184, 402],
  [270, 453],
  [270, 526],
  [342, 516],
]);
function check(
  result: Map<string, Rectangle>,
  markers: ReturnType<typeof stops>,
  bounds: Rectangle,
) {
  expect(result.size).toBe(5);
  for (const [id, r] of result) {
    expect(r.left).toBeGreaterThanOrEqual(bounds.left);
    expect(r.right).toBeLessThanOrEqual(bounds.right);
    expect(r.top).toBeGreaterThanOrEqual(bounds.top);
    expect(r.bottom).toBeLessThanOrEqual(bounds.bottom);
    for (const other of markers)
      expect(overlaps(r, other.bounds, 2), `${id}/${other.id} marker`).toBe(false);
    for (const [otherId, other] of result)
      if (otherId !== id) expect(overlaps(r, other, 2), `${id}/${otherId} name`).toBe(false);
    const marker = markers.find((m) => m.id === id)!;
    expect(
      Math.hypot(
        Math.max(r.left - marker.x, 0, marker.x - r.right),
        Math.max(r.top - marker.y, 0, marker.y - r.bottom),
      ),
    ).toBeLessThan(120);
  }
}
test('crowded portrait names retain unambiguous short associations outside every marker target', () => {
  const bounds = { left: 8, right: 382, top: 148, bottom: 720 };
  const result = placeDriftwoodLabels(names, portrait, bounds, []);
  check(result, portrait, bounds);
  expect(placeDriftwoodLabels(names, portrait, bounds, [], result)).toEqual(result);
  const broken = new Map(result);
  broken.set('yard', result.get('mooring')!);
  check(placeDriftwoodLabels(names, portrait, bounds, [], broken), portrait, bounds);
});
test('short-landscape row candidates keep full names separate in the constrained control band', () => {
  const markers = stops([
    [191, 169],
    [335, 111],
    [433, 167],
    [433, 225],
    [514, 219],
  ]);
  const bounds = { left: 8, right: 772, top: 68, bottom: 258 };
  check(placeDriftwoodLabels(names, markers, bounds, []), markers, bounds);
});
