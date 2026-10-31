import { describe, expect, test } from 'vitest';
import { overlaps, placeActionCard } from '../../src/ui/placement';

describe('action preview placement', () => {
  const bounds = { left: 8, right: 836, top: 68, bottom: 382 };

  test.each([
    { left: 16, right: 112, top: 170, bottom: 218 },
    { left: 718, right: 828, top: 170, bottom: 218 },
    { left: 400, right: 480, top: 328, bottom: 376 },
  ])('flips beside an edge trigger without crossing the screen', (anchor) => {
    const card = placeActionCard(320, 220, bounds, anchor);
    expect(card.left).toBeGreaterThanOrEqual(bounds.left);
    expect(card.right).toBeLessThanOrEqual(bounds.right);
    expect(card.top).toBeGreaterThanOrEqual(bounds.top);
    expect(card.bottom).toBeLessThanOrEqual(bounds.bottom);
    expect(overlaps(card, anchor, 4)).toBe(false);
    const center = (anchor.left + anchor.right) / 2;
    expect(Math.max(card.left - center, 0, center - card.right)).toBeLessThan(120);
  });

  test('keeps a fitting preview at the same origin while subset text changes', () => {
    const anchor = { left: 40, right: 140, top: 200, bottom: 248 };
    const first = placeActionCard(320, 190, bounds, anchor);
    const next = placeActionCard(320, 230, bounds, anchor, { previous: first });
    expect([next.left, next.top]).toEqual([first.left, first.top]);
  });

  test('uses a reachable portrait bottom sheet when local floating space cannot fit', () => {
    const portrait = { left: 8, right: 352, top: 150, bottom: 732 };
    const card = placeActionCard(
      344,
      510,
      portrait,
      {
        left: 120,
        right: 240,
        top: 390,
        bottom: 438,
      },
      { portrait: true },
    );
    expect(card.layout).toBe('sheet');
    expect(card.bottom).toBe(portrait.bottom);
    expect(card.left).toBe(portrait.left);
  });

  test('prefers a nearby position that leaves the active boat visible', () => {
    const anchor = { left: 380, right: 460, top: 180, bottom: 228 };
    const boat = { left: 490, right: 580, top: 160, bottom: 240 };
    const card = placeActionCard(280, 200, bounds, anchor, { avoid: [boat] });
    expect(overlaps(card, boat)).toBe(false);
    expect(card.right).toBeLessThanOrEqual(anchor.left - 4);
  });

  test('constrains an oversized surface to the real visible bounds', () => {
    const short = { left: 12, right: 768, top: 70, bottom: 308 };
    const card = placeActionCard(344, 400, short, {
      left: 650,
      right: 752,
      top: 210,
      bottom: 258,
    });
    expect(card.layout).toBe('sheet');
    expect(card.right).toBe(short.right);
    expect(card.top).toBe(short.top);
    expect(card.bottom).toBe(short.bottom);
  });
});
