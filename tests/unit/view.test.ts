import { expect, test } from 'vitest';
import {
  clampViewFocus,
  overviewScale,
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
