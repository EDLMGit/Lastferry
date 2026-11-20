import { expect, test } from 'vitest';
import { besideOwner, atScreenEdge } from '../../src/ui/owned-control';
import { overlaps } from '../../src/ui/placement';

const bounds = { left: 8, right: 772, top: 8, bottom: 312 };
const boat = { left: 388, right: 461, top: 81, bottom: 136 };
const board = { width: 82, height: 44 };

test('the Board button touches the boat neighborhood even with a large empty area across the harbor', () => {
  const island = { left: 120, right: 365, top: 105, bottom: 216 };
  const box = besideOwner(board, boat, bounds, [island,boat]);
  expect(box).toBeTruthy();
  expect(overlaps(box!, boat, 6)).toBe(true);
  expect(overlaps(box!, island, 0)).toBe(false);
});

test('crowded or offscreen owners cannot produce a distant local button', () => {
  expect(besideOwner(board, boat, bounds, [{ left: 250, right: 580, top: 8, bottom: 208 }])).toBeNull();
  expect(besideOwner(board, { left: -280, right: -212, top: 55, bottom: 97 }, bounds, [])).toBeNull();
});

test('a fallback docks to an actual viewport edge clear of the corner controls', () => {
  const controls = [{ left: 8, top: 204, right: 190, bottom: 312 }, { left: 588, top: 240, right: 772, bottom: 312 }];
  const box = atScreenEdge({ width: 122, height: 66 }, bounds, controls, [boat]);
  expect(controls.some(c => overlaps(box,c,2))).toBe(false);
  expect(box.left === bounds.left || box.right === bounds.right || box.bottom === bounds.bottom || box.top === bounds.top).toBe(true);
});

test('a dock at the edge keeps a usable Harbor marker when the other corners contain controls', () => {
  const controls = [
    { left: 8, top: 8, right: 180, bottom: 88 },
    { left: 535, top: 8, right: 772, bottom: 55 },
    { left: 8, top: 260, right: 190, bottom: 312 },
    { left: 568, top: 241, right: 772, bottom: 312 },
  ];
  const harbor = { left: 332, top: 228, right: 380, bottom: 276 };
  const dock = atScreenEdge({ width: 184, height: 128 }, bounds, controls, [boat], [harbor]);
  expect([...controls, harbor].some(rect => overlaps(dock, rect, 2))).toBe(false);
});
