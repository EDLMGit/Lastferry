import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { bellwater, holdingPier, level, type Level } from '../../src/levels/level';
import { buildPath, getLevelPaths, samplePath } from '../../src/scene/paths';
import { sampleJourney } from '../../src/scene/motion';

const point = (x: number, z: number) => new Vector3(x, 0, z);
const cross = (a: Vector3, b: Vector3, c: Vector3) =>
  (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
function pointDistance(p: Vector3, a: Vector3, b: Vector3) {
  const d = b.clone().sub(a),
    span = d.lengthSq();
  const t = span ? Math.max(0, Math.min(1, p.clone().sub(a).dot(d) / span)) : 0;
  return p.distanceTo(a.clone().addScaledVector(d, t));
}
function segmentDistance(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
  if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return 0;
  return Math.min(
    pointDistance(a, c, d),
    pointDistance(b, c, d),
    pointDistance(c, a, b),
    pointDistance(d, a, b),
  );
}
function networkProblems(l: Level) {
  const paths = getLevelPaths(l),
    problems: string[] = [];
  for (let x = 0; x < l.edges.length; x++) {
    const edge = l.edges[x],
      a = paths.get(edge.id)!;
    let selfContact = false;
    for (let i = 1; i < a.points.length && !selfContact; i++)
      for (let j = i + 2; j < a.points.length; j++)
        if (segmentDistance(a.points[i - 1], a.points[i], a.points[j - 1], a.points[j]) < 0.02) {
          selfContact = true;
          break;
        }
    if (selfContact) problems.push(`${edge.id} contacts itself`);
    for (const node of l.nodes.filter((n) => !edge.nodes.includes(n.id))) {
      const p = point(node.positionXZ[0], node.positionXZ[1]);
      if (
        a.points
          .slice(1)
          .some((b, i) => pointDistance(p, a.points[i], b) < l.world.requiredRouteClearance)
      )
        problems.push(`${edge.id} touches unrelated stop ${node.id}`);
    }
    for (let y = x + 1; y < l.edges.length; y++) {
      const other = l.edges[y],
        b = paths.get(other.id)!;
      const shared = l.nodes
        .filter((n) => edge.nodes.includes(n.id) && other.nodes.includes(n.id))
        .map((n) => point(n.positionXZ[0], n.positionXZ[1]));
      let contact = false;
      for (let i = 1; i < a.points.length && !contact; i++)
        for (let j = 1; j < b.points.length; j++) {
          if (
            shared.some((p) =>
              [a.points[i - 1], a.points[i], b.points[j - 1], b.points[j]].every(
                (q) => q.distanceTo(p) <= 0.6,
              ),
            )
          )
            continue;
          if (segmentDistance(a.points[i - 1], a.points[i], b.points[j - 1], b.points[j]) < 0.02) {
            contact = true;
            break;
          }
        }
      if (contact) problems.push(`${edge.id} contacts ${other.id} away from a shared junction`);
    }
  }
  return problems;
}

describe('canonical curved courses', () => {
  test.each([level, holdingPier, bellwater])(
    '$id caches finite paths with exact endpoints and uniform distance samples',
    (l) => {
      const paths = getLevelPaths(l);
      expect(getLevelPaths(l)).toBe(paths);
      for (const edge of l.edges) {
        const path = paths.get(edge.id)!;
        const from = l.nodes.find((n) => n.id === edge.nodes[0])!,
          to = l.nodes.find((n) => n.id === edge.nodes[1])!;
        expect(path.points[0].toArray()).toEqual([from.positionXZ[0], 0, from.positionXZ[1]]);
        expect(path.points.at(-1)!.toArray()).toEqual([to.positionXZ[0], 0, to.positionXZ[1]]);
        expect(path.points[0].toArray()).toEqual([
          edge.waypointsXZ[0][0],
          0,
          edge.waypointsXZ[0][1],
        ]);
        expect(path.points.at(-1)!.toArray()).toEqual([
          edge.waypointsXZ.at(-1)![0],
          0,
          edge.waypointsXZ.at(-1)![1],
        ]);
        expect(path.length).toBeGreaterThan(0);
        expect(path.points.flatMap((p) => p.toArray()).every(Number.isFinite)).toBe(true);
        const gaps = path.distances.slice(1).map((d, i) => d - path.distances[i]);
        expect(Math.max(...gaps)).toBeLessThanOrEqual(0.05001);
        expect(Math.min(...gaps) / Math.max(...gaps)).toBeGreaterThan(0.985);
        const before = path.points.map((p) => p.toArray());
        for (let i = 0; i <= 100; i++) {
          const distance = (path.length * i) / 100,
            forward = samplePath(path, distance),
            reverse = samplePath(path, path.length - distance, true);
          expect(forward.position.distanceTo(reverse.position)).toBeLessThan(1e-8);
          expect(forward.tangent.dot(reverse.tangent)).toBeCloseTo(-1, 9);
          expect(forward.distance).toBeCloseTo(distance, 9);
        }
        expect(path.points.map((p) => p.toArray())).toEqual(before);
      }
    },
  );

  test('local rounding stays inside the corner envelope without excursions or heading jumps', () => {
    const controls = [point(-2, 0), point(0, 0), point(0, 2)],
      before = controls.map((p) => p.toArray());
    const path = buildPath(controls);
    expect(path.points.every((p) => p.x >= -2 && p.x <= 0 && p.z >= 0 && p.z <= 2)).toBe(true);
    expect(path.points.some((p) => p.x < 0 && p.x > -0.5 && p.z > 0 && p.z < 0.5)).toBe(true);
    const angles = Array.from(
      { length: 1001 },
      (_, i) => samplePath(path, (path.length * i) / 1000).angle,
    );
    expect(Math.max(...angles.slice(1).map((a, i) => Math.abs(a - angles[i])))).toBeLessThan(0.04);
    expect(controls.map((p) => p.toArray())).toEqual(before);
  });

  test('handles empty, repeated and zero-length controls safely and rejects nonfinite controls', () => {
    for (const controls of [[], [point(3, 4)], [point(3, 4), point(3, 4)]]) {
      const path = buildPath(controls);
      for (const reverse of [false, true]) {
        const sample = samplePath(path, NaN, reverse);
        expect(
          [
            ...sample.position.toArray(),
            ...sample.tangent.toArray(),
            sample.angle,
            sample.distance,
          ].every(Number.isFinite),
        ).toBe(true);
        expect(path.length).toBe(0);
      }
    }
    expect(buildPath([point(0, 0), point(0, 0), point(1, 0)]).length).toBeCloseTo(1, 9);
    expect(() => buildPath([point(NaN, 0)])).toThrow('finite');
  });

  test.each([level, holdingPier, bellwater])(
    '$id journeys keep eased distance, continuous steering and exact broadside docking in both directions',
    (l) => {
      for (const path of getLevelPaths(l).values())
        for (const reverse of [false, true]) {
          const poses = Array.from({ length: 1001 }, (_, i) =>
            sampleJourney(path, i / 1000, Math.PI / 2, reverse),
          );
          expect(poses[0].angle).toBe(Math.PI / 2);
          expect(poses.at(-1)!.angle).toBe(Math.PI / 2);
          expect(
            poses[0].position.distanceTo(path.points[reverse ? path.points.length - 1 : 0]),
          ).toBeLessThan(1e-9);
          expect(
            poses.at(-1)!.position.distanceTo(path.points[reverse ? 0 : path.points.length - 1]),
          ).toBeLessThan(1e-9);
          for (let i = 1; i < poses.length; i++) {
            const before = poses[i - 1],
              after = poses[i],
              expected = after.distance - before.distance;
            expect(after.position.distanceTo(before.position) / expected).toBeGreaterThan(0.97);
            expect(after.position.distanceTo(before.position) / expected).toBeLessThanOrEqual(
              1.00001,
            );
            expect(Math.abs(after.angle - before.angle)).toBeLessThan(0.16);
            if (Math.min(after.distance, path.length - after.distance) <= 0.45)
              expect(after.angle).toBe(Math.PI / 2);
          }
        }
    },
  );

  test('steering stays continuous through the angle wrap and degenerate journeys remain finite', () => {
    const path = buildPath([point(0, 0), point(0.1, -2), point(-0.1, -4), point(-0.2, -6)]);
    expect(path.headings.some((a) => a > Math.PI)).toBe(true);
    for (const reverse of [false, true]) {
      const poses = Array.from({ length: 1001 }, (_, i) =>
        sampleJourney(path, i / 1000, Math.PI / 2, reverse),
      );
      expect(
        Math.max(...poses.slice(1).map((p, i) => Math.abs(p.angle - poses[i].angle))),
      ).toBeLessThan(0.05);
      for (let i = 0; i < poses.length; i++)
        expect(
          poses[i].position.distanceTo(
            sampleJourney(path, 1 - i / 1000, Math.PI / 2, !reverse).position,
          ),
        ).toBeLessThan(1e-8);
    }
    const pointPath = buildPath([point(3, 4), point(3, 4)]);
    expect(sampleJourney(pointPath, NaN, 2.3).angle).toBe(2.3);
    expect(sampleJourney(pointPath, 0.5).position.toArray()).toEqual([3, 0, 4]);
    expect(sampleJourney(path, -2).position.distanceTo(path.points[0])).toBe(0);
    expect(sampleJourney(path, 2).position.distanceTo(path.points.at(-1)!)).toBe(0);
  });

  test.each([level, holdingPier, bellwater])(
    '$id actual curved network has no extra junction or unrelated-stop contact',
    (l) => {
      expect(networkProblems(l)).toEqual([]);
    },
  );

  test('network validation detects strict crossings and coincident stretches', () => {
    expect(segmentDistance(point(-1, 0), point(1, 0), point(0, -1), point(0, 1))).toBe(0);
    expect(segmentDistance(point(-1, 0), point(1, 0), point(0, 0), point(2, 0))).toBe(0);
    const loop = structuredClone(holdingPier);
    loop.nodes = [
      { id: 'a', positionXZ: [-2, 0], baseDepth: 3 },
      { id: 'b', positionXZ: [2, 0], baseDepth: 3 },
    ];
    loop.edges = [
      {
        id: 'loop',
        nodes: ['a', 'b'],
        baseDepth: 3,
        bidirectional: true,
        waypointsXZ: [
          [-2, 0],
          [2, 2],
          [-2, 2],
          [2, 0],
        ],
      },
    ];
    expect(networkProblems(loop)).toContain('loop contacts itself');
  });
});
