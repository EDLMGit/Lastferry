import { expect, test } from 'vitest';
import { Box3, Group, Matrix4, Mesh, Plane, Vector3 } from 'three';
import { holdingPier, twoShelters as level } from '../../src/levels/level';
import { animal, ferry } from '../../src/scene/models';
import { passengerScale, deckSeat } from '../../src/scene/ferry-profile';
import {
  shelterAnchorDuring,
  shelterDeckSeat,
  shelterShoreSeat,
  shelterTransferPose,
  shelterTransferProgress,
} from '../../src/scene/two-shelters-seating';

type Solid = { box: Box3; points: Vector3[]; planes: Plane[] };
function solids(group: ReturnType<typeof animal>) {
  group.updateMatrixWorld(true);
  const result: Solid[] = [];
  group.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const attribute = object.geometry.getAttribute('position'),
      indices = object.geometry.index;
    const points = Array.from({ length: attribute.count }, (_, index) =>
      new Vector3().fromBufferAttribute(attribute, index).applyMatrix4(object.matrixWorld),
    );
    const planes: Plane[] = [];
    for (let i = 0; i < (indices?.count ?? attribute.count); i += 3) {
      const vertices = [0, 1, 2].map((j) => points[indices ? indices.getX(i + j) : i + j]);
      const plane = new Plane().setFromCoplanarPoints(vertices[0], vertices[1], vertices[2]);
      if (plane.normal.lengthSq() > 0.5) planes.push(plane);
    }
    result.push({ box: new Box3().setFromPoints(points), points, planes });
  });
  return result;
}
const shapes = new Map(
  level.passengers.map((passenger, index) => {
    const group = animal(passenger.species, index === 3 ? 1 : 0);
    group.scale.set(...passengerScale(passenger.species));
    return [passenger.id, solids(group)] as const;
  }),
);
const boat = ferry();
const cabin = boat.children.filter(
  (object) => object instanceof Mesh && object.position.y > 0.4 && object.position.z < -0.1,
);
const obstacles = cabin.flatMap((object) => {
  const group = new Group();
  group.add(object.clone());
  return solids(group);
});
function transformed(id: string, position: Vector3, angle = 0) {
  const matrix = new Matrix4().makeRotationY(angle).setPosition(position);
  return shapes.get(id)!.map((solid) => ({
    box: solid.box.clone().applyMatrix4(matrix),
    points: solid.points.map((point) => point.clone().applyMatrix4(matrix)),
    planes: solid.planes.map((plane) => plane.clone().applyMatrix4(matrix)),
  }));
}
function intersects(a: Solid[], b: Solid[]) {
  for (const [first, second] of [
    [a, b],
    [b, a],
  ])
    for (const mesh of first)
      for (const other of second) {
        if (!mesh.box.intersectsBox(other.box)) continue;
        for (const point of mesh.points)
          if (
            other.box.containsPoint(point) &&
            other.planes.every((plane) => plane.distanceToPoint(point) < -1e-5)
          )
            return true;
      }
  return false;
}
const rosters = Array.from({ length: 8 }, (_, mask) =>
  level.passengers.filter((_, index) => mask & (1 << index)),
)
  .filter((passengers) => passengers.reduce((sum, passenger) => sum + passenger.slots, 0) <= 4)
  .map((passengers) => passengers.map((passenger) => passenger.id));

test('every legal four-space roster retains full animal geometry with separated seating', () => {
  const failures: string[] = [];
  for (const aboard of rosters)
    for (let index = 0; index < aboard.length; index++) {
      const id = aboard[index],
        current = transformed(id, shelterDeckSeat(level, id, aboard));
      for (const other of aboard.slice(index + 1))
        if (intersects(current, transformed(other, shelterDeckSeat(level, other, aboard))))
          failures.push(`${aboard}:${id}/${other}`);
    }
  expect(failures).toEqual([]);
  const reordered = { ...level, passengers: [...level.passengers].reverse() };
  for (const aboard of rosters)
    for (const id of aboard)
      expect(shelterDeckSeat(reordered, id, aboard).toArray()).toEqual(
        shelterDeckSeat(level, id, aboard).toArray(),
      );
  expect(shelterDeckSeat(level, 'bracken', ['bracken']).toArray()).toEqual(
    deckSeat(level, 'bracken').toArray(),
  );
  expect(shelterDeckSeat(level, 'bracken', ['hazel', 'bracken']).z).toBe(0.045);
  for (const id of ['hazel', 'mica'])
    expect(shelterDeckSeat(level, id, [id]).toArray()).toEqual(deckSeat(level, id).toArray());
});

test('both large neighbors clear the unchanged cabin and roof on their actual geometry', () => {
  for (const id of ['hazel', 'bracken'])
    expect(
      intersects(transformed(id, shelterDeckSeat(level, id, ['hazel', 'bracken'])), obstacles),
      id,
    ).toBe(false);
});

test('three waiting neighbors occupy compact supported pier rows without body overlap', () => {
  const pier = { ...holdingPier.piers[1], width: 1.4, positionXZ: [0, 0], landAnchorXZ: [0, -1.2] };
  const ids = level.passengers.map((passenger) => passenger.id);
  for (const delivered of [false, true])
    for (let i = 0; i < ids.length; i++) {
      const position = shelterShoreSeat(level, ids[i], pier, delivered),
        current = transformed(ids[i], position);
      for (const other of ids.slice(i + 1))
        expect(
          intersects(current, transformed(other, shelterShoreSeat(level, other, pier, delivered))),
          `${ids[i]}/${other}`,
        ).toBe(false);
      for (const solid of shapes.get(ids[i])!) {
        if (solid.box.min.y > 0.03 || solid.box.max.y > 0.27) continue;
        for (const point of solid.points) {
          const foot = point.clone().add(position);
          expect(Math.abs(foot.x)).toBeLessThanOrEqual(0.7);
          expect(foot.z).toBeGreaterThanOrEqual(-1.2);
          expect(foot.z).toBeLessThanOrEqual(0.07);
        }
      }
    }
});

test('automatic foredeck shift is deterministic, bounded and restored from state', () => {
  for (const [before, after] of [
    [['bracken'], ['hazel', 'bracken']],
    [['hazel', 'bracken'], ['bracken']],
  ]) {
    expect(shelterAnchorDuring(level, 'bracken', before, after, 0).toArray()).toEqual(
      shelterDeckSeat(level, 'bracken', before).toArray(),
    );
    expect(shelterAnchorDuring(level, 'bracken', before, after, 1).toArray()).toEqual(
      shelterDeckSeat(level, 'bracken', after).toArray(),
    );
    for (let i = 0; i <= 100; i++) {
      const point = shelterAnchorDuring(level, 'bracken', before, after, i / 100);
      expect(point.z).toBeGreaterThanOrEqual(0.045 - 1e-8);
      expect(point.z).toBeLessThanOrEqual(0.69);
      expect(point.y).toBe(0.26);
    }
  }
});

test.each(
  [Math.PI / 2, -Math.PI / 2].flatMap((heading) =>
    [-0.12, 0.135, 0.39].map((hullY) => ({ heading, hullY })),
  ),
)(
  'all legal selected transfers avoid occupants at heading $heading / hull height $hullY',
  ({ heading, hullY }) => {
    const axis = new Vector3(0, 1, 0);
    const world = (point: Vector3) =>
      point
        .clone()
        .applyAxisAngle(axis, heading)
        .add(new Vector3(0, hullY, 0));
    const local = (point: Vector3) =>
      point
        .clone()
        .sub(new Vector3(0, hullY, 0))
        .applyAxisAngle(axis, -heading);
    const failures: string[] = [];
    const pier = {
      ...holdingPier.piers[1],
      width: 1.4,
      positionXZ: [0, -1.3],
      landAnchorXZ: [0, -2.5],
    };
    for (const before of rosters)
      for (const after of rosters) {
        const added = after.filter((id) => !before.includes(id)),
          removed = before.filter((id) => !after.includes(id));
        if ((!added.length && !removed.length) || (added.length && removed.length)) continue;
        const board = !!added.length,
          selected = board ? added : removed;
        const stationary = before.filter((id) => after.includes(id));
        for (let step = 0; step <= 30; step++) {
          const progress = step / 30;
          const residents = stationary.map(
            (id) =>
              [
                id,
                transformed(id, shelterAnchorDuring(level, id, before, after, progress)),
              ] as const,
          );
          for (const passenger of level.passengers)
            if (!before.includes(passenger.id) && !after.includes(passenger.id))
              residents.push([
                passenger.id,
                transformed(
                  passenger.id,
                  local(shelterShoreSeat(level, passenger.id, pier)),
                  -heading,
                ),
              ]);
          const moving: (readonly [string, Solid[]])[] = [];
          for (const id of selected) {
            const p = shelterTransferProgress(level, id, before, after, progress),
              seat = shelterDeckSeat(level, id, board ? after : before);
            const destination = world(seat);
            const shore = shelterShoreSeat(level, id, pier);
            const matrix = new Matrix4().makeRotationY(heading).setPosition(0, hullY, 0);
            const pose = shelterTransferPose(
              level,
              id,
              board ? after : before,
              pier,
              matrix,
              board ? shore : destination,
              board ? destination : shore,
              board,
              heading,
              p,
            );
            const current = transformed(id, local(pose.position), pose.angle - heading);
            if (intersects(current, obstacles) && failures.length < 8)
              failures.push(`cabin ${before}->${after}:${step}:${id}`);
            moving.push([id, current]);
            for (const [otherId, other] of residents)
              if (intersects(current, other) && failures.length < 8)
                failures.push(`${before}->${after}:${step}:${id}/${otherId}`);
          }
          for (let a = 0; a < moving.length; a++)
            for (let b = a + 1; b < moving.length; b++)
              if (intersects(moving[a][1], moving[b][1]) && failures.length < 8)
                failures.push(
                  `selected ${before}->${after}:${step}:${moving[a][0]}/${moving[b][0]}`,
                );
        }
      }
    expect(failures).toEqual([]);
  },
  60000,
);
