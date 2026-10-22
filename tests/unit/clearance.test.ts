import { test, expect } from 'vitest';
import { Mesh, Vector3 } from 'three';
import { ferry } from '../../src/scene/models';
import { sampleJourney } from '../../src/scene/motion';
import { level, holdingPier, bellwater } from '../../src/levels/level';
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
test.each([level, holdingPier, bellwater])(
  '$id: actual modeled ferry footprint clears all land and pier decks along both directions and yaw turns',
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
    const samples = level.id === 'bellwater' ? 1000 : 100;
    for (const edge of level.edges)
      for (const reverse of [false, true]) {
        const path = (reverse ? [...edge.waypointsXZ].reverse() : edge.waypointsXZ).map(
          (p) => new Vector3(p[0], 0, p[1]),
        );
        for (let frame = 0; frame <= samples; frame++) {
          const pose = sampleJourney(path, frame / samples);
          const hull = footprint.map(([x, z]) => {
            const v = new Vector3(x, 0, z)
              .applyAxisAngle(new Vector3(0, 1, 0), pose.angle)
              .add(pose.position);
            return [v.x, v.z] as P;
          });
          for (const exclusion of exclusions)
            if (overlaps(hull, exclusion.polygon))
              failures.push(
                `${edge.id}/${reverse ? 'reverse' : 'forward'} frame ${frame}: ${exclusion.id}`,
              );
        }
      }
    expect(failures).toEqual([]);
  },
);
