import { expect, test } from 'vitest';
import { PanGesture } from '../../src/ui/pan-gesture';
import { visibleViewport, insetRectangle } from '../../src/ui/viewport';

test('a tap remains a tap while a drag owns its final click even outside the initial surface', () => {
  const gesture = new PanGesture();
  gesture.start(1, 100, 100);
  expect(gesture.move(1, 105, 103)).toBeNull();
  expect(gesture.end(1)).toBe(false);
  gesture.start(2, 100, 100);
  expect(gesture.move(2, 112, 100)).toEqual({ x: 12, y: 0 });
  expect(gesture.move(2, 240, 180)).toEqual({ x: 128, y: 80 });
  expect(gesture.end(2)).toBe(true);
});

test('a second pointer cancels panning and suppresses accidental taps until both are released', () => {
  const gesture = new PanGesture();
  gesture.start(1, 10, 10);
  expect(gesture.start(2, 20, 20)).toBe(false);
  expect(gesture.move(1, 150, 50)).toBeNull();
  expect(gesture.end(1)).toBe(true);
  expect(gesture.end(2)).toBe(true);
  gesture.start(3, 30, 30);
  expect(gesture.end(3)).toBe(false);
});

test('pointer cancellation cannot become a location tap', () => {
  const gesture = new PanGesture();
  gesture.start(1, 10, 10);
  expect(gesture.end(1, true)).toBe(true);
});

test('usable bounds apply viewport offsets and safe insets once', () => {
  const viewport = visibleViewport(
    { width: 360, height: 600, offsetLeft: 12, offsetTop: 35 },
    390,
    844,
  );
  expect(viewport).toEqual({ left: 12, top: 35, right: 372, bottom: 635 });
  expect(insetRectangle(viewport, { left: 3, right: 4, top: 5, bottom: 20 })).toEqual({
    left: 23,
    top: 48,
    right: 360,
    bottom: 607,
  });
  expect(visibleViewport(null, 844, 390)).toEqual({ left: 0, top: 0, right: 844, bottom: 390 });
});
