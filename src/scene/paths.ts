import { Vector3 } from 'three';
import type { Level } from '../levels/level';

export type CanonicalPath = {
  points: Vector3[];
  distances: number[];
  headings: number[];
  length: number;
};

const cache = new WeakMap<Level, Map<string, CanonicalPath>>();
const gap = 0.05;
const epsilon = 1e-9;

function atDistance(points: Vector3[], distances: number[], distance: number) {
  let low = 0,
    high = distances.length - 1;
  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2);
    if (distances[mid] <= distance) low = mid;
    else high = mid;
  }
  const span = distances[high] - distances[low];
  const fraction = span > epsilon ? (distance - distances[low]) / span : 0;
  return {
    low,
    high,
    fraction,
    position: new Vector3().lerpVectors(points[low], points[high], fraction),
  };
}

function arcLengths(points: Vector3[]) {
  const distances = [0];
  for (let i = 1; i < points.length; i++)
    distances.push(distances[i - 1] + points[i].distanceTo(points[i - 1]));
  return distances;
}

export function buildPath(controls: readonly Vector3[]): CanonicalPath {
  const clean: Vector3[] = [];
  for (const p of controls) {
    if (![p.x, p.y, p.z].every(Number.isFinite)) throw new Error('Route controls must be finite.');
    if (!clean.length || p.distanceTo(clean.at(-1)!) > epsilon) clean.push(p.clone());
  }
  if (!clean.length) clean.push(new Vector3());
  if (clean.length === 1) return { points: clean, distances: [0], headings: [0], length: 0 };
  const dense = [clean[0].clone()];
  function line(to: Vector3) {
    const from = dense.at(-1)!,
      count = Math.max(1, Math.ceil(from.distanceTo(to) / 0.035));
    for (let j = 1; j <= count; j++) dense.push(new Vector3().lerpVectors(from, to, j / count));
  }
  for (let i = 1; i < clean.length - 1; i++) {
    const previous = clean[i - 1],
      corner = clean[i],
      next = clean[i + 1];
    const trim = Math.min(0.75, previous.distanceTo(corner) * 0.25, corner.distanceTo(next) * 0.25);
    const entry = corner.clone().add(previous.clone().sub(corner).normalize().multiplyScalar(trim));
    const exit = corner.clone().add(next.clone().sub(corner).normalize().multiplyScalar(trim));
    line(entry);
    const count = Math.max(16, Math.ceil((trim * 2) / 0.025));
    for (let j = 1; j <= count; j++) {
      const t = j / count;
      dense.push(
        entry
          .clone()
          .multiplyScalar((1 - t) ** 2)
          .addScaledVector(corner, 2 * t * (1 - t))
          .addScaledVector(exit, t * t),
      );
    }
  }
  line(clean.at(-1)!);
  const denseDistances = arcLengths(dense),
    total = denseDistances.at(-1)!;
  const count = Math.max(1, Math.ceil(total / gap));
  const points = Array.from(
    { length: count + 1 },
    (_, i) => atDistance(dense, denseDistances, (total * i) / count).position,
  );
  points[0].copy(clean[0]);
  points[count].copy(clean.at(-1)!);
  const distances = arcLengths(points),
    headings: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const direction = points[Math.min(i + 1, count)].clone().sub(points[Math.max(0, i - 1)]);
    const raw = Math.atan2(direction.x, direction.z),
      last = headings.at(-1);
    headings.push(
      last === undefined ? raw : last + Math.atan2(Math.sin(raw - last), Math.cos(raw - last)),
    );
  }
  return { points, distances, headings, length: distances.at(-1)! };
}

export function getLevelPaths(level: Level): Map<string, CanonicalPath> {
  let paths = cache.get(level);
  if (!paths) {
    paths = new Map(
      level.edges.map((edge) => [
        edge.id,
        buildPath(edge.waypointsXZ.map(([x, z]) => new Vector3(x, 0, z))),
      ]),
    );
    cache.set(level, paths);
  }
  return paths;
}

export function samplePath(path: CanonicalPath, distance: number, reverse = false) {
  const traveled = Number.isFinite(distance) ? Math.max(0, Math.min(path.length, distance)) : 0;
  if (path.length <= epsilon)
    return {
      position: path.points[0].clone(),
      tangent: new Vector3(0, 0, reverse ? -1 : 1),
      angle: reverse ? Math.PI : 0,
      distance: traveled,
    };
  const sample = atDistance(
    path.points,
    path.distances,
    reverse ? path.length - traveled : traveled,
  );
  const angle =
    path.headings[sample.low] +
    (path.headings[sample.high] - path.headings[sample.low]) * sample.fraction +
    (reverse ? Math.PI : 0);
  return {
    position: sample.position,
    tangent: new Vector3(Math.sin(angle), 0, Math.cos(angle)),
    angle,
    distance: traveled,
  };
}
