import { describe, expect, test } from 'vitest';
import { Box3, Group, InstancedMesh, Matrix4, Mesh, Vector3 } from 'three';
import { wideBerth, reefReturn, orchardLanding } from '../../src/levels/level';
import { animal, ferry, lighthouse } from '../../src/scene/models';
import {
  ferryProfile,
  deckSeat,
  passengerScale,
  shoreSeat,
  hullDraftY,
  wideTransferPath,
  sampleWideTransfer,
  wideTransferAngle,
} from '../../src/scene/ferry-profile';
import { createPier, isWalkableAt } from '../../src/scene/pier';
import { sceneLayout } from '../../src/scene/layout';
import { islandCenter, shoreContour, createShoreRocks } from '../../src/scene/shore';
import { createReefPassage } from '../../src/scene/reef';
import { cottage, decorateOrchardIsland, decorateReefIsland, decorateWideIsland, orchardTree, wideWaterfront } from '../../src/scene/scenery';
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
describe.each([wideBerth, reefReturn, orchardLanding])('$title physical clearances', (level) => {
test('occupied real modeled hull clears land and piers at every reachable heading in both directions', () => {
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
  const obstacles3D: [string, Group][] = level.piers.map((pier) => [
    pier.id, createPier(pier, sceneLayout(level.id).stonePiers.includes(pier.id), true),
  ]);
  for (const edge of level.edges.filter((e) => e.current))
    obstacles3D.push([edge.id, createReefPassage(paths.get(edge.id)!).rocks]);
  for (const [id, group] of obstacles3D) {
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
      exclusions.push({ id: `${id}/mesh${meshIndex++}`, polygon: convex(points) });
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

test('distinct authored shores retain valid center-fan top support without filled water notches', () => {
  const outlines = new Set<string>();
  for (const island of level.world.islands) {
    const center = islandCenter(island),
      contour = shoreContour(island),
      signed = contour.map((p, i) =>
        cross(
          [center.x, center.y],
          [p.x, p.y],
          [contour[(i + 1) % contour.length].x, contour[(i + 1) % contour.length].y],
        ),
      );
    expect(signed.every((n) => n > 0) || signed.every((n) => n < 0)).toBe(true);
    outlines.add(
      JSON.stringify(
        island.footprintXZ.map(([x, z]) => [
          Number((x - center.x).toFixed(3)),
          Number((z - center.y).toFixed(3)),
        ]),
      ),
    );
  }
  expect(outlines.size).toBe(4);
});

test('compact waiting groups and actual transfer bodies clear each rendered shore prop', () => {
  const failures: string[] = [],
    layout = sceneLayout(level.id);
  for (const pier of level.piers) {
    const island = level.world.islands.find((i) => i.id === pier.islandId)!,
      style = layout.islandStyles[island.id],
      group = new Group();
    if (level.id === 'orchard-landing') decorateOrchardIsland(group, island, style);
    else if (level.id === 'reef-return') decorateReefIsland(group, island, style);
    else decorateWideIsland(group, island, style);
    group.add(createShoreRocks(island, style));
    for (const landmark of layout.landmarks.filter((l) => l.islandId === island.id)) {
      const [x, z] = landmark.positionXZ;
      if (landmark.kind === 'lighthouse') lighthouse(group, x, island.elevation * 0.18, z);
      if (landmark.kind === 'cottage') cottage(group, [x, island.elevation * 0.18, z]);
      if (landmark.kind === 'waterfront') wideWaterfront(group, [x, island.elevation * 0.18, z]);
      if (landmark.kind === 'orchard') orchardTree(group, [x, island.elevation * 0.18, z]);
    }
    group.updateMatrixWorld(true);
    const props: { name: string; bounds: Box3 }[] = [];
    group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.geometry.computeBoundingBox();
      const base = object.geometry.boundingBox!;
      if (object instanceof InstancedMesh) {
        for (let i = 0; i < object.count; i++) {
          const matrix = new Matrix4();
          object.getMatrixAt(i, matrix);
          props.push({
            name: `${object.name}/${i}`,
            bounds: base.clone().applyMatrix4(object.matrixWorld.clone().multiply(matrix)),
          });
        }
      } else
        props.push({
          name: object.name || object.geometry.type,
          bounds: base.clone().applyMatrix4(object.matrixWorld),
        });
    });
    const node = level.nodes.find((n) => n.id === pier.nodeId)!;
    for (const passenger of level.passengers) {
      const figure = animal(passenger.species, passengerModelVariant(level, passenger.id));
      figure.scale.set(...passengerScale(passenger.species));
      const local = new Box3().setFromObject(figure);
      const inspect = (position: Vector3, angle: number, stage: string) => {
        const b = local
          .clone()
          .applyMatrix4(new Matrix4().makeRotationY(angle).setPosition(position));
        for (const p of props)
          if (
            b.min.x < p.bounds.max.x - 0.015 &&
            b.max.x > p.bounds.min.x + 0.015 &&
            b.min.y < p.bounds.max.y - 0.015 &&
            b.max.y > p.bounds.min.y + 0.015 &&
            b.min.z < p.bounds.max.z - 0.015 &&
            b.max.z > p.bounds.min.z + 0.015 &&
            failures.length < 50
          )
            failures.push(`${pier.id}/${passenger.id}/${stage}/${p.name}`);
      };
      for (const delivered of [false, true])
        inspect(
          shoreSeat(level, passenger.id, pier, delivered),
          0,
          delivered ? 'delivered' : 'waiting',
        );
      for (const heading of [-Math.PI / 2, Math.PI / 2])
        for (const tide of [0, 1, 2].filter((value) => value < pier.elevation))
          for (const requiredDraft of [1, 2, 3, 4])
            for (const board of [true, false]) {
              const hull = new Matrix4()
                  .makeRotationY(heading)
                  .setPosition(
                    new Vector3(
                      node.positionXZ[0],
                      tide * 0.18 + hullDraftY(requiredDraft),
                      node.positionXZ[1],
                    ),
                  ),
                shore = shoreSeat(level, passenger.id, pier, !board && !!pier.isDeliveryPier),
                seat = deckSeat(level, passenger.id).applyMatrix4(hull),
                route = wideTransferPath(
                  level,
                  passenger.id,
                  pier,
                  hull,
                  board ? shore : seat,
                  board ? seat : shore,
                  board,
                );
              for (let frame = 0; frame <= 100; frame++) {
                const progress = frame / 100;
                inspect(
                  sampleWideTransfer(route.points, progress),
                  wideTransferAngle(
                    board,
                    heading,
                    progress,
                    route.turnAt,
                    route.turnStart,
                    route.turnEnd,
                  ),
                  `${board ? 'board' : 'unload'}/${heading}/tide${tide}/draft${requiredDraft}/${frame}`,
                );
              }
            }
    }
  }
  expect(failures).toEqual([]);
});

test('landmark foundations and trunks stand on the actual smoothed shore top', () => {
  const failures: string[] = [];
  for (const landmark of sceneLayout(level.id).landmarks) {
    const pier = level.piers.find((p) => p.islandId === landmark.islandId)!,
      island = level.world.islands.find((i) => i.id === landmark.islandId)!,
      height = island.elevation * 0.18,
      group = new Group(),
      [x, z] = landmark.positionXZ;
    if (landmark.kind === 'lighthouse') lighthouse(group, x, height, z);
    if (landmark.kind === 'cottage') cottage(group, [x, height, z]);
    if (landmark.kind === 'waterfront') wideWaterfront(group, [x, height, z]);
    if (landmark.kind === 'orchard') orchardTree(group, [x, height, z]);
    group.updateMatrixWorld(true);
    group.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const positions = o.geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        const v = new Vector3().fromBufferAttribute(positions, i).applyMatrix4(o.matrixWorld);
        if (v.y <= height + 0.01 && !isWalkableAt(level, pier, v.x, v.z) && failures.length < 20)
          failures.push(`${landmark.kind}:${v.x.toFixed(3)}/${v.z.toFixed(3)}`);
      }
    });
  }
  expect(failures).toEqual([]);
});
});
