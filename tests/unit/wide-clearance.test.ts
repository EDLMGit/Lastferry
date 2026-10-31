import { expect, test } from 'vitest';
import { Mesh, Vector3 } from 'three';
import { wideBerth as level } from '../../src/levels/level';
import { animal, ferry } from '../../src/scene/models';
import { ferryProfile, deckSeat, passengerScale } from '../../src/scene/ferry-profile';
import { createPier } from '../../src/scene/pier';
import { sceneLayout } from '../../src/scene/layout';
import { passengerModelVariant } from '../../src/game/passenger-appearance';
import { getLevelPaths, samplePath } from '../../src/scene/paths';
import { berthHeading, initialHeading, planJourney, sampleJourney } from '../../src/scene/motion';

type P = [number, number];
const cross = (a: P, b: P, c: P) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function convex(points: P[]) {
  const sorted = points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const low: P[] = [],
    high: P[] = [];
  for (const p of sorted) {
    while (low.length >= 2 && cross(low.at(-2)!, low.at(-1)!, p) <= 0) low.pop();
    low.push(p);
  }
  for (const p of [...sorted].reverse()) {
    while (high.length >= 2 && cross(high.at(-2)!, high.at(-1)!, p) <= 0) high.pop();
    high.push(p);
  }
  return [...low.slice(0, -1), ...high.slice(0, -1)];
}
function inside(p: P, poly: P[]) {
  let odd = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i],
      b = poly[j];
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      odd = !odd;
  }
  return odd;
}
function intersects(a: P, b: P, c: P, d: P) {
  return cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
}
function overlaps(a: P[], b: P[]) {
  return (
    a.some((p) => inside(p, b)) ||
    b.some((p) => inside(p, a)) ||
    a.some((p, i) =>
      b.some((q, j) => intersects(p, a[(i + 1) % a.length], q, b[(j + 1) % b.length])),
    )
  );
}
function segmentDistance(p: P, a: P, b: P) {
  const x = b[0] - a[0],
    z = b[1] - a[1],
    span = x * x + z * z;
  const t = span ? Math.max(0, Math.min(1, ((p[0] - a[0]) * x + (p[1] - a[1]) * z) / span)) : 0;
  return Math.hypot(p[0] - a[0] - t * x, p[1] - a[1] - t * z);
}
test('Wide Berth occupied real modeled hull clears land and piers at every reachable heading in both directions', () => {
  const profile = ferryProfile(level),
    model = ferry(profile);
  for (const passenger of level.passengers) {
    const group = animal(passenger.species, passengerModelVariant(level, passenger.id));
    group.scale.set(...passengerScale(passenger.species));
    group.position.copy(deckSeat(level, passenger.id));
    model.add(group);
  }
  model.updateMatrixWorld(true);
  const vertices: P[] = [];
  model.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const attribute = o.geometry.getAttribute('position');
    for (let i = 0; i < attribute.count; i++) {
      const v = new Vector3().fromBufferAttribute(attribute, i).applyMatrix4(o.matrixWorld);
      vertices.push([v.x, v.z]);
    }
  });
  const footprint = convex(vertices),
    paths = getLevelPaths(level),
    failures: string[] = [],
    margins: string[] = [],
    contacts: Record<string, { count: number; position: number[]; angle: number }> = {};
  const exclusions = [
    ...level.world.islands.map((island) => ({ id: island.id, polygon: island.footprintXZ as P[] })),
  ];
  for (const pier of level.piers) {
    const group = createPier(pier, sceneLayout(level.id).stonePiers.includes(pier.id));
    group.updateMatrixWorld(true);
    let meshIndex = 0;
    group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const points: P[] = [],
        attribute = object.geometry.getAttribute('position');
      for (let i = 0; i < attribute.count; i++) {
        const v = new Vector3().fromBufferAttribute(attribute, i).applyMatrix4(object.matrixWorld);
        points.push([v.x, v.z]);
      }
      exclusions.push({ id: `${pier.id}/mesh${meshIndex++}`, polygon: convex(points) });
    });
  }
  const obstacles = exclusions.map((exclusion) => ({
    ...exclusion,
    bounds: {
      left: Math.min(...exclusion.polygon.map((p) => p[0])),
      right: Math.max(...exclusion.polygon.map((p) => p[0])),
      top: Math.min(...exclusion.polygon.map((p) => p[1])),
      bottom: Math.max(...exclusion.polygon.map((p) => p[1])),
    },
  }));
  const headings = new Map<string, number[]>();
  for (const node of level.nodes) {
    const angles: number[] = [];
    if (node.id === level.start.boatNodeId) angles.push(initialHeading(level));
    for (const edge of level.edges.filter((e) => e.nodes.includes(node.id))) {
      const path = paths.get(edge.id)!,
        angle = samplePath(path, path.length, edge.nodes[0] === node.id).angle;
      angles.push(berthHeading(level, node.id, angle) ?? angle);
    }
    const berth = berthHeading(level, node.id, Math.PI / 2);
    if (berth !== null) angles.push(berth, berth - Math.PI);
    headings.set(node.id, [...new Set(angles.map((a) => Math.atan2(Math.sin(a), Math.cos(a))))]);
  }
  for (const edge of level.edges)
    for (const reverse of [false, true]) {
      const path = paths.get(edge.id)!,
        from = edge.nodes[reverse ? 1 : 0],
        to = edge.nodes[reverse ? 0 : 1],
        incoming = samplePath(path, path.length, reverse).angle;
      for (const heading of headings.get(from)!) {
        const plan = planJourney(path, heading, reverse, {
          fromBerth: berthHeading(level, from, heading) ?? undefined,
          toBerth: berthHeading(level, to, incoming) ?? undefined,
          berthHold: profile.berthHold,
          berthTurn: profile.berthTurn,
        });
        for (let sample = 0; sample <= 1000; sample++) {
          const pose = sampleJourney(plan, sample / 1000),
            cos = Math.cos(pose.angle),
            sin = Math.sin(pose.angle);
          const hull = footprint.map(
            ([x, z]) =>
              [x * cos + z * sin + pose.position.x, z * cos - x * sin + pose.position.z] as P,
          );
          const hullBounds = {
            left: Math.min(...hull.map((p) => p[0])),
            right: Math.max(...hull.map((p) => p[0])),
            top: Math.min(...hull.map((p) => p[1])),
            bottom: Math.max(...hull.map((p) => p[1])),
          };
          for (const exclusion of obstacles) {
            const b = exclusion.bounds;
            const nearHull =
              hullBounds.left <= b.right &&
              hullBounds.right >= b.left &&
              hullBounds.top <= b.bottom &&
              hullBounds.bottom >= b.top;
            if (nearHull && overlaps(hull, exclusion.polygon)) {
              const key = `${edge.id}/${reverse ? 'reverse' : 'forward'}/${exclusion.id}`;
              contacts[key] ??= { count: 0, position: pose.position.toArray(), angle: pose.angle };
              contacts[key].count++;
            }
            if (nearHull && overlaps(hull, exclusion.polygon) && failures.length < 30)
              failures.push(
                `${edge.id}/${reverse ? 'reverse' : 'forward'} from${heading} sample${sample}: ${exclusion.id}`,
              );
            const center: P = [pose.position.x, pose.position.z];
            if (
              Math.hypot(
                Math.max(b.left - center[0], 0, center[0] - b.right),
                Math.max(b.top - center[1], 0, center[1] - b.bottom),
              ) > level.world.requiredRouteClearance
            )
              continue;
            const margin = Math.min(
              ...exclusion.polygon.map((p, i) =>
                segmentDistance(center, p, exclusion.polygon[(i + 1) % exclusion.polygon.length]),
              ),
            );
            if (
              (margin < level.world.requiredRouteClearance - 1e-6 ||
                inside(center, exclusion.polygon)) &&
              margins.length < 30
            )
              margins.push(`${edge.id} sample${sample}: ${exclusion.id} margin${margin}`);
          }
        }
      }
    }
  if (failures.length) console.log(JSON.stringify(contacts));
  expect(failures).toEqual([]);
  expect(margins).toEqual([]);
}, 20000);
