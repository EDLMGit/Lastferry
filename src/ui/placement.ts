export type Rectangle = { left: number; top: number; right: number; bottom: number };

export function overlaps(a: Rectangle, b: Rectangle, gap = 8) {
  return !(
    a.right + gap <= b.left ||
    a.left - gap >= b.right ||
    a.bottom + gap <= b.top ||
    a.top - gap >= b.bottom
  );
}

export function placeLocalCard(
  width: number,
  height: number,
  bounds: Rectangle,
  obstacles: Rectangle[],
  preferred: [number, number][],
  anchor?: [number, number],
) {
  if (width > bounds.right - bounds.left || height > bounds.bottom - bounds.top) return null;
  const candidates = [...preferred];
  const xs = [bounds.left, bounds.right - width, ...preferred.map(([x]) => x)];
  const ys = [bounds.top, bounds.bottom - height, ...preferred.map(([, y]) => y)];
  for (const obstacle of obstacles) {
    xs.push(obstacle.left - width - 10, obstacle.right + 10);
    ys.push(obstacle.top - height - 10, obstacle.bottom + 10);
  }
  for (const y of ys) for (const x of xs) candidates.push([x, y]);
  let nearest: Rectangle | null = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const [x, y] of candidates) {
    const left = Math.max(bounds.left, Math.min(bounds.right - width, x));
    const top = Math.max(bounds.top, Math.min(bounds.bottom - height, y));
    const rectangle = { left, top, right: left + width, bottom: top + height };
    if (obstacles.some((obstacle) => overlaps(rectangle, obstacle))) continue;
    if (!anchor) return rectangle;
    const cost = Math.hypot(left - anchor[0], top - anchor[1]);
    if (cost < distance) {
      nearest = rectangle;
      distance = cost;
    }
  }
  return nearest;
}

export type ActionCardPlacement = Rectangle & { layout: 'floating' | 'sheet' };

export function placeActionCard(
  width: number,
  height: number,
  bounds: Rectangle,
  anchor: Rectangle,
  options: { portrait?: boolean; previous?: Rectangle | null; avoid?: Rectangle[] } = {},
): ActionCardPlacement {
  const availableWidth = Math.max(0, bounds.right - bounds.left),
    availableHeight = Math.max(0, bounds.bottom - bounds.top),
    fittedWidth = Math.min(width, availableWidth),
    fittedHeight = Math.min(height, availableHeight),
    centerX = (anchor.left + anchor.right) / 2,
    centerY = (anchor.top + anchor.bottom) / 2,
    gap = 10;
  const clamp = (left: number, top: number, layout: 'floating' | 'sheet') => {
    left = Math.max(bounds.left, Math.min(bounds.right - fittedWidth, left));
    top = Math.max(bounds.top, Math.min(bounds.bottom - fittedHeight, top));
    return { left, top, right: left + fittedWidth, bottom: top + fittedHeight, layout };
  };
  const previous = options.previous;
  if (
    previous &&
    previous.left >= bounds.left &&
    previous.left + fittedWidth <= bounds.right &&
    previous.top >= bounds.top &&
    previous.top + fittedHeight <= bounds.bottom
  )
    return clamp(previous.left, previous.top, 'floating');
  const candidates = [
    clamp(centerX - fittedWidth / 2, anchor.bottom + gap, 'floating'),
    clamp(centerX - fittedWidth / 2, anchor.top - fittedHeight - gap, 'floating'),
    clamp(anchor.right + gap, centerY - fittedHeight / 2, 'floating'),
    clamp(anchor.left - fittedWidth - gap, centerY - fittedHeight / 2, 'floating'),
  ];
  const clear = candidates.filter((candidate) => !overlaps(candidate, anchor, 4));
  if (clear.length && width <= availableWidth && height <= availableHeight) {
    const distance = (candidate: Rectangle) =>
      Math.hypot(
        Math.max(candidate.left - centerX, 0, centerX - candidate.right),
        Math.max(candidate.top - centerY, 0, centerY - candidate.bottom),
      );
    const score = (candidate: Rectangle) =>
      distance(candidate) + (options.avoid?.some((item) => overlaps(candidate, item)) ? 160 : 0);
    return clear.sort((a, b) => score(a) - score(b))[0];
  }
  if (options.portrait)
    return clamp(centerX - fittedWidth / 2, bounds.bottom - fittedHeight, 'sheet');
  const nearLeft = centerX < (bounds.left + bounds.right) / 2;
  return clamp(
    nearLeft ? bounds.left : bounds.right - fittedWidth,
    centerY - fittedHeight / 2,
    'sheet',
  );
}
