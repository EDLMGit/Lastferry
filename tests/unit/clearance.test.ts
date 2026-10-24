import { test, expect } from 'vitest';
import { InstancedMesh, Matrix4, Mesh, Vector3 } from 'three';
import { ferry } from '../../src/scene/models';
import { berthHeading, initialHeading, planJourney, sampleJourney } from '../../src/scene/motion';
import { getLevelPaths, samplePath } from '../../src/scene/paths';
import { level, holdingPier, bellwater } from '../../src/levels/level';
import { sceneLayout } from '../../src/scene/layout';
import { buildCoastGeometry, createReedBeds, createShoreRocks } from '../../src/scene/shore';
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
test.each([level, holdingPier, bellwater])(
  '$id: full modeled ferry clears land and piers from all reachable headings, both berth sides and reverse departures',
  (level) => {
    const model = ferry();
    model.updateMatrixWorld(true);
    const points: P[] = [];
    model.traverse((o) => {
      if (o instanceof Mesh) {
        const position = o.geometry.getAttribute('position');
        for (let i = 0; i < position.count; i++) {
          const v = new Vector3().fromBufferAttribute(position, i).applyMatrix4(o.matrixWorld);
          points.push([v.x, v.z]);
        }
      }
    });
    const footprint = convex(points),
      exclusions = [
        ...level.world.islands.map((i) => ({ id: i.id, polygon: i.footprintXZ as P[] })),
        ...level.piers.map((p) => ({
          id: p.id,
          polygon: [
            [p.positionXZ[0] - p.width / 2, p.landAnchorXZ[1]],
            [p.positionXZ[0] + p.width / 2, p.landAnchorXZ[1]],
            [p.positionXZ[0] + p.width / 2, p.positionXZ[1]],
            [p.positionXZ[0] - p.width / 2, p.positionXZ[1]],
          ] as P[],
        })),
      ];
    const failures: string[] = [];
    const marginFailures: string[] = [];
    const samples = 1000;
    const paths = getLevelPaths(level);
    const reachable = new Map<string, number[]>();
    for (const node of level.nodes) {
      const headings: number[] = [];
      if (node.id === level.start.boatNodeId) headings.push(initialHeading(level));
      for (const edge of level.edges.filter((edge) => edge.nodes.includes(node.id))) {
        const path = paths.get(edge.id)!,
          incoming = samplePath(path, path.length, edge.nodes[0] === node.id).angle;
        headings.push(berthHeading(level, node.id, incoming) ?? incoming);
      }
      const berth = berthHeading(level, node.id, Math.PI / 2);
      if (berth !== null) headings.push(berth, berth - Math.PI);
      reachable.set(node.id, [
        ...new Set(headings.map((angle) => Math.atan2(Math.sin(angle), Math.cos(angle)))),
      ]);
    }
    for (const edge of level.edges)
      for (const reverse of [false, true]) {
        const path = paths.get(edge.id)!,
          from = edge.nodes[reverse ? 1 : 0],
          to = edge.nodes[reverse ? 0 : 1],
          incoming = samplePath(path, path.length, reverse).angle;
        for (const heading of reachable.get(from)!) {
          const plan = planJourney(path, heading, reverse, {
            fromBerth: berthHeading(level, from, heading) ?? undefined,
            toBerth: berthHeading(level, to, incoming) ?? undefined,
          });
          for (let frame = 0; frame <= samples; frame++) {
            const pose = sampleJourney(plan, frame / samples);
            const cos = Math.cos(pose.angle),
              sin = Math.sin(pose.angle);
            const hull = footprint.map(
              ([x, z]) =>
                [x * cos + z * sin + pose.position.x, z * cos - x * sin + pose.position.z] as P,
            );
            for (const exclusion of exclusions)
              if (overlaps(hull, exclusion.polygon))
                failures.push(
                  `${edge.id}/${reverse ? 'reverse' : 'forward'} from ${heading} frame ${frame}: ${exclusion.id}`,
                );
            const center: P = [pose.position.x, pose.position.z];
            for (const exclusion of exclusions) {
              const margin = Math.min(
                ...exclusion.polygon.map((p, i) =>
                  segmentDistance(center, p, exclusion.polygon[(i + 1) % exclusion.polygon.length]),
                ),
              );
              if (
                margin < level.world.requiredRouteClearance - 1e-6 ||
                inside(center, exclusion.polygon)
              )
                marginFailures.push(
                  `${edge.id}/${reverse ? 'reverse' : 'forward'} from ${heading} frame ${frame}: ${exclusion.id} margin ${margin}`,
                );
            }
          }
        }
      }
    expect(failures).toEqual([]);
    expect(marginFailures).toEqual([]);
  },
);

test.each([level, holdingPier, bellwater])(
  '$id: actual refined coasts, rocks and reeds stay inside the validated land envelope',
  (level) => {
    const failures: string[] = [];
    for (const island of level.world.islands) {
      const style = sceneLayout(level.id).islandStyles[island.id] ?? 'garden',
        coast = buildCoastGeometry(island, style),
        rocks = createShoreRocks(island, style),
        polygon = island.footprintXZ as P[];
      function check(v: Vector3, source: string) {
        const p: P = [v.x, v.z];
        if (
          !inside(p, polygon) &&
          Math.min(
            ...polygon.map((a, i) => segmentDistance(p, a, polygon[(i + 1) % polygon.length])),
          ) > 1e-6
        )
          failures.push(`${island.id}/${source}: ${p.join(',')}`);
      }
      const positions = coast.getAttribute('position');
      for (let i = 0; i < positions.count; i++)
        check(new Vector3().fromBufferAttribute(positions, i), 'coast vertex');
      const indices = coast.getIndex()!;
      for (let i = 0; i < indices.count; i += 3) {
        const triangle = [0, 1, 2].map((j) =>
          new Vector3().fromBufferAttribute(positions, indices.getX(i + j)),
        );
        for (let j = 0; j < 3; j++)
          for (const t of [0.25, 0.5, 0.75])
            check(
              new Vector3().lerpVectors(triangle[j], triangle[(j + 1) % 3], t),
              'coast triangle',
            );
      }
      const rockPositions = rocks.geometry.getAttribute('position'),
        matrix = new Matrix4();
      for (let instance = 0; instance < rocks.count; instance++) {
        rocks.getMatrixAt(instance, matrix);
        for (let i = 0; i < rockPositions.count; i++)
          check(
            new Vector3().fromBufferAttribute(rockPositions, i).applyMatrix4(matrix),
            `rock ${instance}`,
          );
      }
      if (style === 'reeds') {
        const reeds = createReedBeds(island);
        reeds.updateMatrixWorld(true);
        const vertex = new Vector3();
        reeds.traverse((mesh) => {
          if (!(mesh instanceof InstancedMesh)) return;
          const positions = mesh.geometry.getAttribute('position');
          for (let instance = 0; instance < mesh.count; instance++) {
            mesh.getMatrixAt(instance, matrix);
            for (let i = 0; i < positions.count; i++)
              check(
                vertex
                  .fromBufferAttribute(positions, i)
                  .applyMatrix4(matrix)
                  .applyMatrix4(mesh.matrixWorld),
                `${mesh.name} ${instance}`,
              );
          }
          mesh.geometry.dispose();
        });
      }
      coast.dispose();
      rocks.geometry.dispose();
    }
    expect(failures).toEqual([]);
  },
);
