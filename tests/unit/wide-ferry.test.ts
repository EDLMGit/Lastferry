import { describe, expect, test } from 'vitest';
import { Box3, Matrix4, Mesh, Vector3 } from 'three';
import { animal, ferry } from '../../src/scene/models';
import {
  wideBerth,
  level as firstCrossing,
  holdingPier,
  bellwater,
  driftwoodYard,
} from '../../src/levels/level';
import {
  deckSeat,
  hullDraftY,
  ferryProfile,
  passengerScale,
  sampleWideTransfer,
  shoreSeat,
  smallFerryProfile,
  wideFerryProfile,
  wideTransferAngle,
  wideTransferPath,
  wideTransferProgress,
  wideTransferWindow,
  wideHullOutline,
} from '../../src/scene/ferry-profile';
import { draft, initial } from '../../src/game/rules';
import { settlingProgress, transitionPlan } from '../../src/scene/transitions';
import { FerryWake, wakeContactReach } from '../../src/scene/wake';
import { isWalkableAt } from '../../src/scene/pier';

const level = wideBerth;
const localBoxes = new Map(
  level.passengers.map((passenger) => {
    const figure = animal(passenger.species, passenger.appearance === 'rabbit-tan' ? 1 : 0);
    figure.scale.set(...passengerScale(passenger.species));
    return [passenger.id, new Box3().setFromObject(figure)];
  }),
);
const masks = Array.from({ length: 64 }, (_, mask) => mask);
const feet = new Map(level.passengers.map((passenger) => {
  const figure = animal(passenger.species, passenger.appearance === 'rabbit-tan' ? 1 : 0);
  figure.scale.set(...passengerScale(passenger.species));
  figure.updateMatrixWorld(true);
  const points: Vector3[] = [];
  figure.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const bounds = new Box3().setFromObject(object);
    if (bounds.min.y > 0.03 || bounds.max.y > 0.27) return;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const z of [bounds.min.z, bounds.max.z]) points.push(new Vector3(x, 0, z));
  });
  return [passenger.id, points] as const;
}));
const idsFor = (mask: number) =>
  level.passengers.filter((_, index) => mask & (1 << index)).map((p) => p.id);
const loadFor = (mask: number) =>
  level.passengers.filter((_, index) => mask & (1 << index)).reduce((sum, p) => sum + p.slots, 0);
const legal = masks.filter((mask) => loadFor(mask) <= 6);
const body = (id: string, position: Vector3, angle: number) =>
  localBoxes
    .get(id)!
    .clone()
    .applyMatrix4(new Matrix4().makeRotationY(angle).setPosition(position));
const overlaps = (a: Box3, b: Box3) =>
  a.min.x < b.max.x - 1e-6 &&
  a.max.x > b.min.x + 1e-6 &&
  a.min.y < b.max.y - 1e-6 &&
  a.max.y > b.min.y + 1e-6 &&
  a.min.z < b.max.z - 1e-6 &&
  a.max.z > b.min.z + 1e-6;

test('active-level profiles preserve all four original boats and provide a physical six-space deck', () => {
  for (const old of [firstCrossing, holdingPier, bellwater, driftwoodYard])
    expect(ferryProfile(old)).toBe(smallFerryProfile);
  expect(ferryProfile(level)).toBe(wideFerryProfile);
  const model = ferry(wideFerryProfile);
  const deck = model.children.filter((object) => object instanceof Mesh && object.geometry.type === 'ExtrudeGeometry');
  expect(deck.length).toBe(4);
  expect(model.children.some((object) => object.name === 'wide-cabin-obstacle')).toBe(true);
  expect(legal).toHaveLength(59);
  expect(ferry().name).toBe('ferry-hull-and-deck');
});

test('every capacity-legal roster uses stable automatic real-body seating without cabin, rail or passenger overlap', () => {
  const model = ferry(wideFerryProfile);
  model.updateMatrixWorld(true);
  const obstacles = model.children
    .filter((o) => o.name.includes('obstacle') || o.name === 'wide-cabin-roof')
    .map((o) => new Box3().setFromObject(o));
  const failures: string[] = [];
  expect(legal.some((mask) => idsFor(mask).length === 5 && loadFor(mask) === 6)).toBe(true);
  for (const mask of legal) {
    const ids = idsFor(mask),
      boxes = ids.map((id) => body(id, deckSeat(level, id), 0));
    for (let i = 0; i < boxes.length; i++) {
      if (obstacles.some((box) => overlaps(boxes[i], box)))
        failures.push(`${mask}:${ids[i]} obstacle`);
      for (let j = i + 1; j < boxes.length; j++)
        if (overlaps(boxes[i], boxes[j])) failures.push(`${mask}:${ids[i]}/${ids[j]}`);
    }
  }
  expect(failures).toEqual([]);
  const reversed = { ...level, passengers: [...level.passengers].reverse() };
  for (const p of level.passengers)
    expect(deckSeat(reversed, p.id).toArray()).toEqual(deckSeat(level, p.id).toArray());
});

test('six neighbors have supported compact land and quay positions with stable identity and no body overlap', () => {
  const failures: string[] = [];
  for (const pier of level.piers)
    for (const delivered of [false, true]) {
      const boxes = level.passengers.map((p) =>
        body(p.id, shoreSeat(level, p.id, pier, delivered), 0),
      );
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        const center = shoreSeat(level, level.passengers[i].id, pier, delivered);
        for (const foot of feet.get(level.passengers[i].id)!)
          if (!isWalkableAt(level, pier, center.x + foot.x, center.z + foot.z))
            failures.push(`${pier.id}:${i} unsupported actual foot ${foot.x}/${foot.z}`);
        for (let j = i + 1; j < boxes.length; j++)
          if (overlaps(box, boxes[j])) failures.push(`${pier.id}:${i}/${j}`);
      }
    }
  expect(failures).toEqual([]);
});

test('actual foot bounds remain supported by land, fitted landing, gangway and deck during every authored walking path', () => {
  for (const passenger of level.passengers) expect(feet.get(passenger.id)!.length).toBeGreaterThanOrEqual(8);
  const polygon = wideHullOutline().getPoints(80).map((p) => [p.x * 0.94, p.y * 0.94]);
  const inside = (x: number, z: number) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
    }
    return result;
  };
  const failures: string[] = [];
  for (const pier of level.piers)
    for (const heading of [Math.PI / 2, -Math.PI / 2])
      for (const tide of [0, 1, 2].filter((n) => n < pier.elevation))
        for (const required of [1, 2, 3, 4]) {
          const boat = level.nodes.find((n) => n.id === pier.nodeId)!;
          const matrix = new Matrix4().makeRotationY(heading).setPosition(boat.positionXZ[0], tide * 0.18 + hullDraftY(required), boat.positionXZ[1]);
          const inverse = matrix.clone().invert();
          for (const p of level.passengers)
            for (const board of [true, false]) {
              const land = shoreSeat(level, p.id, pier, !!pier.isDeliveryPier), deck = deckSeat(level, p.id).applyMatrix4(matrix);
              const path = wideTransferPath(level, p.id, pier, matrix, board ? land : deck, board ? deck : land, board);
              const bridge = path.gate.clone().sub(path.bridge), bridgeXZ = bridge.clone().setY(0), bridgeLength = bridgeXZ.length();
              for (let step = 0; step <= 60; step++) {
                const progress = step / 60, position = sampleWideTransfer(path.points, progress);
                const angle = wideTransferAngle(board, heading, progress, path.turnAt, path.turnStart, path.turnEnd);
                const actor = new Matrix4().makeRotationY(angle).setPosition(position);
                for (const foot of feet.get(p.id)!) {
                  const point = foot.clone().applyMatrix4(actor), local = point.clone().applyMatrix4(inverse), relative = point.clone().sub(path.bridge);
                  const q = relative.clone().setY(0).dot(bridgeXZ) / (bridgeLength * bridgeLength);
                  const cross = Math.abs(relative.x * bridgeXZ.z - relative.z * bridgeXZ.x) / bridgeLength;
                  const onBridge = q >= -0.001 && q <= 1.001 && cross <= 0.43 && Math.abs(point.y - (path.bridge.y + bridge.y * q)) < 0.13;
                  const onDeck = inside(local.x, local.z) && Math.abs(local.y - wideFerryProfile.deckY) < 0.13;
                  const onShore = isWalkableAt(level, pier, point.x, point.z) && Math.abs(point.y - pier.elevation * 0.18) < 0.08;
                  if (!onBridge && !onDeck && !onShore && failures.length < 16) failures.push(`${pier.id}:${heading}:tide${tide}:draft${required}:${p.id}:${board}:${step}:${point.toArray()}`);
                }
              }
            }
        }
  expect(failures).toEqual([]);
}, 60000);

test.each(
  level.piers.flatMap((pier) => [Math.PI / 2, -Math.PI / 2].map((heading) => ({ pier, heading }))),
)(
  '$pier.id / $heading: all legal transfer selections clear actual body/cabin/rail bounds',
  ({ pier, heading }) => {
    const failures: string[] = [];
    const boat = level.nodes.find((n) => n.id === pier.nodeId)!;
    const model = ferry(wideFerryProfile);
    model.updateMatrixWorld(true);
    const localObstacles = model.children
      .filter((o) => o.name.includes('obstacle') || o.name === 'wide-cabin-roof')
      .map((o) => new Box3().setFromObject(o));
    for (const board of [true, false])
      for (const before of legal)
        for (const selection of masks.filter((mask) => mask > 0)) {
          if (board ? (before & selection) !== 0 : (before & selection) !== selection) continue;
          const after = board ? before | selection : before & ~selection;
          if (loadFor(after) > 6) continue;
          const moving = idsFor(selection);
          for (const tide of [0, 1, 2].filter((tide) => tide < pier.elevation))
            for (let step = 0; step <= 50; step++) {
              const time = step / 50,
                k = time * time * (3 - 2 * time);
              const won = !board && !!pier.isDeliveryPier && after === 0;
              const plan = transitionPlan(
                { type: board ? 'board' : 'unload', passengerIds: moving },
                won,
                0,
                false,
              );
              const rawSettle = settlingProgress(time * plan.duration, plan),
                settle = rawSettle * rawSettle * (3 - 2 * rawSettle);
              const beforeY = hullDraftY(
                  draft({ ...initial(level), aboard: idsFor(before) }, level),
                ),
                afterY = hullDraftY(draft({ ...initial(level), aboard: idsFor(after) }, level));
              const hullY = beforeY + (afterY - beforeY) * settle;
              const matrix = new Matrix4()
                .makeRotationY(heading)
                .setPosition(boat.positionXZ[0], tide * 0.18 + hullY, boat.positionXZ[1]);
              const stationaryObstacles = localObstacles.map((box) =>
                box.clone().applyMatrix4(matrix),
              );
              const boxes = level.passengers.map((p, index) => {
                const aboard = !!(before & (1 << index)),
                  from = aboard
                    ? deckSeat(level, p.id).applyMatrix4(matrix)
                    : shoreSeat(level, p.id, pier, !board && !!pier.isDeliveryPier);
                if (!(selection & (1 << index)))
                  return { id: p.id, box: body(p.id, from, aboard ? heading : 0), deck: aboard };
                const destination = board
                  ? deckSeat(level, p.id).applyMatrix4(matrix)
                  : shoreSeat(level, p.id, pier, !board && !!pier.isDeliveryPier);
                const path = wideTransferPath(level, p.id, pier, matrix, from, destination, board),
                  progress = wideTransferProgress(moving, p.id, k, wideTransferWindow(won));
                const position = sampleWideTransfer(path.points, progress),
                  angle = wideTransferAngle(board, heading, progress, path.turnAt, path.turnStart, path.turnEnd);
                return {
                  id: p.id,
                  box: body(p.id, position, angle),
                  deck: progress > 0 && progress < 1,
                };
              });
              for (let i = 0; i < boxes.length; i++) {
                for (let j = i + 1; j < boxes.length; j++)
                  if (overlaps(boxes[i].box, boxes[j].box) && failures.length < 20)
                    failures.push(
                      `${board ? 'board' : 'unload'}:${before}/${selection}:tide${tide}:${step}:${boxes[i].id}/${boxes[j].id}`,
                    );
                if (
                  boxes[i].deck &&
                  stationaryObstacles.some((box) => overlaps(boxes[i].box, box)) &&
                  failures.length < 20
                )
                  failures.push(
                    `${board ? 'board' : 'unload'}:${before}/${selection}:${step}:${boxes[i].id} obstacle`,
                  );
              }
            }
        }
    expect(failures).toEqual([]);
  },
  60000,
);

test('draft four retains a dry attached deck and profile wake releases from actual displaced sides', () => {
  expect(wideFerryProfile.deckY + hullDraftY(4)).toBeCloseTo(0.065);
  for (const direction of [1, -1]) {
    const wake = new FerryWake(undefined, wideFerryProfile.wake);
    wake.begin(0, new Vector3(), 0);
    wake.update(200, new Vector3(0, 0, direction), 0, true, 0, false, -0.195);
    const point = wake.presentation().points[0];
    expect(point).toBeDefined();
    expect(Math.abs(point.position[2] - point.center[2])).toBeCloseTo(
      direction > 0 ? wideFerryProfile.wake.aft : wideFerryProfile.wake.fore,
      5,
    );
    wake.update(3000, new Vector3(0, 0, direction), 0, false, 0, true, -0.195);
    expect(wake.presentation().points).toEqual([]);
  }
});

test('wide releases touch the correct outside of actual rendered hull geometry across forward, backing and turning directions', () => {
  const model = ferry(wideFerryProfile);
  model.updateMatrixWorld(true);
  const points: [number, number][] = [];
  model.traverse((object) => {
    if (!(object instanceof Mesh) || object.geometry.type !== 'ExtrudeGeometry') return;
    const position = object.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i++) {
      const p = new Vector3().fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
      points.push([p.x, p.z]);
    }
  });
  const cross = (a: [number, number], b: [number, number], c: [number, number]) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const sorted = points.sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    low: [number, number][] = [],
    high: [number, number][] = [];
  for (const p of sorted) {
    while (low.length >= 2 && cross(low.at(-2)!, low.at(-1)!, p) <= 0) low.pop();
    low.push(p);
  }
  for (const p of [...sorted].reverse()) {
    while (high.length >= 2 && cross(high.at(-2)!, high.at(-1)!, p) <= 0) high.pop();
    high.push(p);
  }
  const hull = [...low.slice(0, -1), ...high.slice(0, -1)],
    failures: string[] = [];
  for (let step = 0; step < 32; step++) {
    const angle = (step * Math.PI) / 16,
      forward = Math.cos(angle),
      sideways = Math.sin(angle),
      radius = wakeContactReach(wideFerryProfile.wake, forward, sideways),
      point: [number, number] = [-sideways * radius, -forward * radius];
    const inside = hull.every((p, i) => cross(p, hull[(i + 1) % hull.length], point) >= -1e-6);
    if (inside) failures.push(`${step}:${point}`);
  }
  expect(failures).toEqual([]);
});

test('the final wide unload is visibly complete before the unchanged arrival cue boundary', () => {
  const ids = ['alder', 'poppy', 'wren', 'sorrel', 'finch'];
  const arrival = 0.72 * 0.72 * (3 - 2 * 0.72);
  expect(transitionPlan({ type: 'unload', passengerIds: ids }, true, 0, false).duration).toBe(900);
  for (const id of ids)
    expect(wideTransferProgress(ids, id, arrival, wideTransferWindow(true))).toBe(1);
});
