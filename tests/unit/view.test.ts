import { expect, test } from 'vitest';
import {
  clampViewFocus,
  overviewScale,
  unobscuredOverview,
  panViewFocus,
  phonePlayScale,
  usableViewRectangle,
  viewFrame,
} from '../../src/scene/view';

const network = { minX: -9, maxX: 10, minY: -5, maxY: 6 };

test('whole-cove fitting respects the same asymmetric usable rectangle at every phone orientation', () => {
  for (const [width, height, top, bottom] of [
    [844, 390, 70, 328],
    [780, 320, 62, 260],
    [390, 844, 140, 775],
    [360, 740, 145, 671],
  ]) {
    const usable = usableViewRectangle(width, height, { left: 12, top, right: width - 12, bottom });
    const focus = { x: 0.5, y: 0.5 };
    const scale = overviewScale(network, usable);
    const frame = viewFrame(width, height, usable, scale, focus);
    const project = (x: number, y: number) => ({
      x: ((x - frame.left) / (frame.right - frame.left)) * width,
      y: ((frame.top - y) / (frame.top - frame.bottom)) * height,
    });
    for (const x of [network.minX, network.maxX])
      for (const y of [network.minY, network.maxY]) {
        const point = project(x, y);
        expect(point.x).toBeGreaterThanOrEqual(usable.left - 1e-8);
        expect(point.x).toBeLessThanOrEqual(usable.right + 1e-8);
        expect(point.y).toBeGreaterThanOrEqual(usable.top - 1e-8);
        expect(point.y).toBeLessThanOrEqual(usable.bottom + 1e-8);
      }
  }
});

test('Overview uses horizontal slack around real corner controls without excluding an invisible top strip', () => {
  const bounds = { minX: -10, maxX: 10, minY: -6, maxY: 6 };
  const usable = { left: 8, right: 836, top: 8, bottom: 382 };
  const subjects = [
    { minX: 3, maxX: 5, minY: 4, maxY: 5.9 },
    { minX: -8, maxX: -6, minY: 0, maxY: 3 },
  ];
  const controls = [{ left: 500, right: 836, top: 8, bottom: 56 }];
  const result = unobscuredOverview(bounds, subjects, usable, controls);
  expect(result.scale).toBe(overviewScale(bounds, usable));
  expect(result.overlap).toBe(0);
  expect(result.displacement).toBeGreaterThan(0);
  const frame = viewFrame(844, 390, usable, result.scale, result.focus);
  const project = (x: number, y: number) => ({
    x: (x - frame.left) * result.scale,
    y: (frame.top - y) * result.scale,
  });
  for (const x of [bounds.minX, bounds.maxX])
    for (const y of [bounds.minY, bounds.maxY]) {
      const point = project(x, y);
      expect(point.x).toBeGreaterThanOrEqual(usable.left - 1e-7);
      expect(point.x).toBeLessThanOrEqual(usable.right + 1e-7);
      expect(point.y).toBeGreaterThanOrEqual(usable.top - 1e-7);
      expect(point.y).toBeLessThanOrEqual(usable.bottom + 1e-7);
    }
  expect(project(subjects[0].maxX, subjects[0].maxY).x).toBeLessThanOrEqual(controls[0].left - 6);
  expect(project(bounds.maxX, bounds.maxY).y).toBeCloseTo(usable.top);
});

test('Overview keeps its frame when subjects and persistent controls are unchanged, with bounded fallback for crowded corners', () => {
  const usable = { left: 8, right: 382, top: 8, bottom: 836 };
  const subjects = [{ minX: -2, maxX: 2, minY: 4, maxY: 6 }];
  const controls = [{ left: 8, right: 382, top: 8, bottom: 60 }];
  const first = unobscuredOverview(network, subjects, usable, controls);
  expect(
    unobscuredOverview(
      structuredClone(network),
      structuredClone(subjects),
      { ...usable },
      structuredClone(controls),
    ),
  ).toEqual(first);
  expect(first.overlap).toBe(0);
  expect(first.scale).toBe(overviewScale(network, usable));
  const full = unobscuredOverview(network, subjects, usable, [{ ...usable }]);
  expect(full.scale).toBeGreaterThanOrEqual(overviewScale(network, usable) * 0.92);
  expect(Object.values(full.focus).every(Number.isFinite)).toBe(true);
  expect(full.overlap).toBeGreaterThan(0);
});

test('Play magnifies the same ferry without reducing portrait to a whole-network postage stamp', () => {
  for (const [width, height] of [
    [844, 390],
    [780, 320],
    [390, 844],
    [360, 740],
  ]) {
    const usable = usableViewRectangle(width, height, {
      left: 12,
      top: 96,
      right: width - 12,
      bottom: height - 64,
    });
    const overview = overviewScale(network, usable);
    const play = phonePlayScale(network, usable);
    expect(play).toBeGreaterThanOrEqual(overview * 1.4);
    expect(1.5 * play).toBeGreaterThan(40);
  }
});

test('panning follows the dragged water and cannot escape the finite cove bounds', () => {
  const usable = { left: 10, top: 80, right: 830, bottom: 330 };
  const original = { x: 0.5, y: 0.5 };
  const dragged = panViewFocus(original, 40, -60, 40);
  expect(dragged).toEqual({ x: -0.5, y: -1 });
  const bounded = clampViewFocus(panViewFocus(original, 100000, -100000, 40), network, usable, 40);
  expect(bounded.x).toBe(0.5);
  expect(bounded.y).toBeCloseTo(network.minY + 0.625);
  expect(original).toEqual({ x: 0.5, y: 0.5 });
});

test('the usable rectangle clamps transient browser-bar measurements without invalid projection sizes', () => {
  const usable = usableViewRectangle(360, 280, { left: -100, top: 800, right: 999, bottom: 100 });
  expect(usable).toEqual({ left: 8, right: 352, top: 216, bottom: 264 });
  const scale = phonePlayScale(network, usable);
  const frame = viewFrame(360, 280, usable, scale, { x: 0.5, y: 0.5 });
  expect(Object.values(frame).every(Number.isFinite)).toBe(true);
  expect(frame.right).toBeGreaterThan(frame.left);
  expect(frame.top).toBeGreaterThan(frame.bottom);
});
