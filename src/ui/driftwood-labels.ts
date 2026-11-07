import { overlaps, placeLocalCard, type Rectangle } from './placement';

type Stop = { id: string; x: number; y: number; bounds: Rectangle };
type Name = { id: string; width: number; height: number };
const inside = (r: Rectangle, bounds: Rectangle) =>
  r.left >= bounds.left &&
  r.right <= bounds.right &&
  r.top >= bounds.top &&
  r.bottom <= bounds.bottom;
const leaderLength = (r: Rectangle, stop: Stop) =>
  Math.hypot(
    Math.max(r.left - stop.x, 0, stop.x - r.right),
    Math.max(r.top - stop.y, 0, stop.y - r.bottom),
  );

export function placeDriftwoodLabels(
  names: Name[],
  stops: Stop[],
  bounds: Rectangle,
  figures: Rectangle[],
  previous = new Map<string, Rectangle>(),
) {
  const obstacles = stops.map((stop) => stop.bounds);
  const cached = names.map((name) => previous.get(name.id));
  if (
    cached.every(
      (r, index) =>
        r &&
        inside(r, bounds) &&
        r.right - r.left === names[index].width &&
        r.bottom - r.top === names[index].height &&
        leaderLength(
          r,
          stops.find((s) => s.id === names[index].id)!,
        ) <= 120 &&
        ![
          ...obstacles,
          ...figures,
          ...cached.slice(0, index).filter((r): r is Rectangle => !!r),
        ].some((other) => overlaps(r, other, 2)),
    )
  )
    return new Map(names.map((name, index) => [name.id, cached[index]!]));
  const result = new Map<string, Rectangle>();
  for (const name of names) {
    const stop = stops.find((s) => s.id === name.id)!;
    const preferred: [number, number][] = [];
    for (const gap of [6, 20, 36, 60, 88]) {
      preferred.push(
        [stop.x - name.width / 2, stop.bounds.top - name.height - gap],
        [stop.x - name.width / 2, stop.bounds.bottom + gap],
        [stop.bounds.left - name.width - gap, stop.y - name.height / 2],
        [stop.bounds.right + gap, stop.y - name.height / 2],
        [stop.bounds.left - name.width - gap, stop.bounds.top - name.height - gap],
        [stop.bounds.right + gap, stop.bounds.top - name.height - gap],
        [stop.bounds.left - name.width - gap, stop.bounds.bottom + gap],
        [stop.bounds.right + gap, stop.bounds.bottom + gap],
      );
    }
    const avoid = [...obstacles, ...result.values()];
    const anchor: [number, number] = [stop.x - name.width / 2, stop.y - name.height / 2];
    const choice =
      placeLocalCard(name.width, name.height, bounds, [...avoid, ...figures], preferred, anchor) ??
      placeLocalCard(name.width, name.height, bounds, avoid, preferred, anchor);
    if (choice) result.set(name.id, choice);
  }
  return result;
}
