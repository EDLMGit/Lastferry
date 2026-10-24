import { expect, test } from 'vitest';
import * as T from 'three';
import { FerryWake, wakeLimits } from '../../src/scene/wake';

function runStraight(wake: FerryWake, step: number, until = 1200) {
  const position = new T.Vector3();
  wake.begin(0, position, Math.PI / 2);
  for (let time = step; time <= until; time += step) {
    position.set(time * 0.002, 0, 0);
    wake.update(time, position, Math.PI / 2, true, 0, false);
  }
}

test('wake depends on horizontal movement, not water elevation, hull draft or dock heading', () => {
  const wake = new FerryWake(),
    position = new T.Vector3();
  wake.begin(0, position, 0);
  for (let time = 20; time <= 400; time += 20) {
    position.y = time * 0.0009;
    wake.update(time, position, time * 0.01, true, position.y, false, -0.12);
  }
  expect(wake.presentation()).toMatchObject({
    emitting: false,
    visible: false,
    vertices: 0,
    points: [],
    strength: 0,
  });
  position.x = 0.2;
  wake.update(420, position, 0.9, true, 0.36, false, -0.12);
  expect(wake.count).toBeGreaterThan(0);
  for (const point of wake.presentation().points) {
    expect(point.position[0]).toBeCloseTo(point.center[0] - Math.sin(point.heading) * 0.72);
    expect(point.position[2]).toBeCloseTo(point.center[2] - Math.cos(point.heading) * 0.72);
    expect(point.position[1]).toBeCloseTo(point.center[1] + 0.018);
  }
  wake.update(440, position, 1.2, false, 0.4, false, -0.12);
  const view = wake.presentation();
  for (let i = 1; i < view.positions.length; i += 3)
    expect(view.positions[i]).toBeCloseTo(0.418, 6);
  expect(view.interaction.direction[0]).toBeCloseTo(Math.sin(1.2));
});

test('distance sampling is consistent across frame rates and retains world-space history', () => {
  const fine = new FerryWake(),
    coarse = new FerryWake();
  runStraight(fine, 10);
  runStraight(coarse, 80);
  expect(fine.count).toBe(coarse.count);
  const a = fine.presentation().points,
    b = coarse.presentation().points;
  for (let i = 0; i < a.length; i++) {
    expect(a[i].time).toBeCloseTo(b[i].time, 6);
    expect(a[i].position[0]).toBeCloseTo(b[i].position[0], 6);
    expect(a[i].position[2]).toBeCloseTo(b[i].position[2], 6);
  }
  const old = fine.pool[fine.first].position.clone();
  fine.update(1220, new T.Vector3(2.44, 0, 0.02), 1.5, true, 0.18, false);
  expect(fine.pool[fine.first].position).toEqual(old);
});

test('joined curved history and hull contacts stay finite inside a fixed resource budget', () => {
  const wake = new FerryWake(),
    geometry = wake.mesh.geometry,
    material = wake.mesh.material,
    attributes = Object.values(geometry.attributes).map((attribute) => attribute.array),
    pool = wake.pool.map((point) => point.position),
    position = new T.Vector3();
  wake.begin(0, position, 0);
  for (let time = 20; time <= 20000; time += 20) {
    const angle = time * 0.001;
    position.set(Math.sin(angle) * 2, 0, Math.cos(angle) * 2 - 2);
    wake.update(time, position, angle + Math.PI / 2, true, 0, false);
    expect(wake.count).toBeLessThanOrEqual(wakeLimits.capacity);
    expect(wake.vertices).toBeLessThanOrEqual((wakeLimits.capacity + 48) * 6);
  }
  expect(wake.mesh.geometry).toBe(geometry);
  expect(wake.mesh.material).toBe(material);
  Object.values(geometry.attributes).forEach((attribute, index) =>
    expect(attribute.array).toBe(attributes[index]),
  );
  wake.pool.forEach((point, index) => expect(point.position).toBe(pool[index]));
  const view = wake.presentation();
  expect(view.positions.every(Number.isFinite)).toBe(true);
  expect(view.opacity.every((value) => Number.isFinite(value) && value >= 0 && value <= 0.64)).toBe(
    true,
  );
  const points = view.points;
  let length = 0;
  for (let i = 1; i < points.length; i++)
    length += Math.hypot(
      points[i].position[0] - points[i - 1].position[0],
      points[i].position[2] - points[i - 1].position[2],
    );
  expect(length).toBeLessThanOrEqual(wakeLimits.length + 0.00001);
  for (let i = 0; i < wake.count; i++)
    expect(Math.hypot(wake.joins[i * 2], wake.joins[i * 2 + 1])).toBeLessThanOrEqual(1.000001);
});

test('normal docking retains a finite tail without joining it to a subsequent journey', () => {
  const wake = new FerryWake(),
    position = new T.Vector3(2.4, 0, 0);
  runStraight(wake, 20);
  wake.finish(1200);
  wake.update(1220, position, 0, false, 0, false);
  expect(wake.presentation()).toMatchObject({ emitting: false, visible: true, docking: true });
  const oldCount = wake.count,
    firstSegment = wake.presentation().points[0].segment;
  wake.begin(1220, position, 0);
  position.z = 0.2;
  wake.update(1240, position, 0, true, 0, false);
  const newView = wake.presentation(),
    segments = new Set(newView.points.map((point) => point.segment));
  expect(segments.size).toBe(2);
  expect(newView.points.at(-1)!.segment).not.toBe(firstSegment);
  const trailVertices = (wake.mesh.geometry.getAttribute('kind').array as Float32Array)
    .slice(0, wake.vertices)
    .filter((kind) => kind === 0).length;
  expect(trailVertices).toBe((wake.count - segments.size) * 6);
  expect(wake.count).toBeGreaterThan(oldCount);
  wake.finish(1240);
  for (let time = 1260; time <= 3200; time += 20) wake.update(time, position, 0, false, 0, false);
  expect(wake.presentation()).toMatchObject({
    visible: false,
    emitting: false,
    docking: false,
    vertices: 0,
    points: [],
    contactStrength: 0,
  });
});

test('reset, reduced motion and discontinuities clear wake and do not synthesize an arrival ripple', () => {
  const wake = new FerryWake(),
    position = new T.Vector3(2.4, 0, 0);
  for (const reason of ['reset', 'reduced', 'gap', 'teleport']) {
    runStraight(wake, 20);
    if (reason === 'reset') wake.clear();
    if (reason === 'reduced') wake.update(1220, position, 0, true, 0, true);
    if (reason === 'gap') wake.update(2000, position, 0, false, 0, false);
    if (reason === 'teleport') wake.update(1220, new T.Vector3(20, 0, 0), 0, false, 0, false);
    expect(wake.presentation()).toMatchObject({
      visible: false,
      vertices: 0,
      points: [],
      docking: false,
      contactStrength: 0,
    });
    expect(wake.interaction.strength).toBe(0);
  }
  wake.update(2020, position, 0, true, 0, false);
  expect(wake.count).toBe(0);
});

test('decorative wake keeps depth occlusion and never claims camera bounds or pointer hits', () => {
  const wake = new FerryWake();
  runStraight(wake, 20);
  expect(wake.mesh.material).toMatchObject({
    depthTest: true,
    depthWrite: false,
    forceSinglePass: true,
  });
  expect(wake.mesh.userData).toMatchObject({ decorative: true, excludeFromFrame: true });
  const ray = new T.Raycaster(new T.Vector3(1, 10, 0), new T.Vector3(0, -1, 0));
  expect(ray.intersectObject(wake.mesh)).toHaveLength(0);
});
