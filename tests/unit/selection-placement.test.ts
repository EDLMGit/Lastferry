import { describe, expect, test } from 'vitest';
import { overlaps, placeLocalCard } from '../../src/ui/placement';

describe('nearby selection placement', () => {
  test('chooses a nearby clear position instead of an otherwise valid distant screen corner', () => {
    const boat = { left: 355, right: 445, top: 180, bottom: 255 };
    const hud = { left: 8, right: 772, top: 4, bottom: 62 };
    const bounds = { left: 8, right: 772, top: 8, bottom: 382 };
    const card = placeLocalCard(110, 44, bounds, [boat, hud], [[345, 220]], [345, 220]);
    expect(card).not.toBeNull();
    expect(overlaps(card!, boat)).toBe(false);
    expect(overlaps(card!, hud)).toBe(false);
    expect(Math.hypot(card!.left - 345, card!.top - 220)).toBeLessThan(90);
  });

  test('retains all protected bounds after clamping a preferred position beyond the viewport', () => {
    const obstacles = [
      { left: 480, right: 772, top: 320, bottom: 382 },
      { left: 35, right: 210, top: 95, bottom: 265 },
      { left: 240, right: 300, top: 230, bottom: 290 },
    ];
    const bounds = { left: 8, right: 772, top: 70, bottom: 382 };
    const card = placeLocalCard(224, 160, bounds, obstacles, [[800, 400]], [265, 300]);
    expect(card).not.toBeNull();
    for (const obstacle of obstacles) expect(overlaps(card!, obstacle)).toBe(false);
    expect(card!.left).toBeGreaterThanOrEqual(bounds.left);
    expect(card!.right).toBeLessThanOrEqual(bounds.right);
    expect(card!.top).toBeGreaterThanOrEqual(bounds.top);
    expect(card!.bottom).toBeLessThanOrEqual(bounds.bottom);
  });
});
