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
