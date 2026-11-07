import { overlaps, placeLocalCard, type Rectangle } from './placement';

export type Endpoint = { id: string; x: number; y: number };
export type EndpointTarget = Endpoint & { size: number; bounds: Rectangle };

export function clearCurrentEndpoint(
  point: Endpoint,
  boat: Rectangle,
  bounds: Rectangle,
  otherTargets: readonly Rectangle[] = [],
): Endpoint {
  const gap = 36;
  const candidates = [
    { x: point.x, y: boat.bottom + gap },
    { x: boat.right + gap, y: point.y },
    { x: boat.left - gap, y: point.y },
    { x: point.x, y: boat.top - gap },
  ];
  const obstacles = [boat, ...otherTargets];
  const clear = placeLocalCard(
    48,
    48,
    bounds,
    obstacles,
    candidates.map(({ x, y }) => [x - 24, y - 24]),
    [point.x - 24, point.y - 24],
  );
  if (clear) return { ...point, x: clear.left + 24, y: clear.top + 24 };
  const score = (p: { x: number; y: number }) => {
    const outside =
      Math.max(0, bounds.left + 24 - p.x) +
      Math.max(0, p.x + 24 - bounds.right) +
      Math.max(0, bounds.top + 24 - p.y) +
      Math.max(0, p.y + 24 - bounds.bottom);
    const hit = { left: p.x - 24, right: p.x + 24, top: p.y - 24, bottom: p.y + 24 };
    const blocked = obstacles.filter((obstacle) => overlaps(hit, obstacle, 4)).length;
    return blocked * 100000 + outside * 100 + Math.hypot(p.x - point.x, p.y - point.y);
  };
  return { ...point, ...candidates.sort((a, b) => score(a) - score(b))[0] };
}

export function endpointTargets(points: readonly Endpoint[]): EndpointTarget[] {
  const square = ({ x, y }: Endpoint, size: number): Rectangle => ({
    left: x - size / 2,
    right: x + size / 2,
    top: y - size / 2,
    bottom: y + size / 2,
  });
  const preferred = points.map((point) => square(point, 48));
  return points.map((point, index) => {
    const size = preferred.some(
      (other, otherIndex) => index !== otherIndex && overlaps(preferred[index], other, 0),
    )
      ? 44
      : 48;
    return { ...point, size, bounds: square(point, size) };
  });
}
