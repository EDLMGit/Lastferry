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
) {
  if (width > bounds.right - bounds.left || height > bounds.bottom - bounds.top) return null;
  const candidates = [...preferred];
  const xs = [bounds.left, bounds.right - width];
  const ys = [bounds.top, bounds.bottom - height];
  for (const obstacle of obstacles) {
    xs.push(obstacle.left - width - 10, obstacle.right + 10);
    ys.push(obstacle.top - height - 10, obstacle.bottom + 10);
  }
  for (const y of ys) for (const x of xs) candidates.push([x, y]);
  for (const [x, y] of candidates) {
    const left = Math.max(bounds.left, Math.min(bounds.right - width, x));
    const top = Math.max(bounds.top, Math.min(bounds.bottom - height, y));
    const rectangle = { left, top, right: left + width, bottom: top + height };
    if (obstacles.every((obstacle) => !overlaps(rectangle, obstacle))) return rectangle;
  }
  return null;
}
