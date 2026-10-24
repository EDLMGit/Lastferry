import { expect, test } from 'vitest';
import * as T from 'three';
import { FerryWake, wakeLimits } from '../../src/scene/wake';

function runStraight(wake: FerryWake, step: number, until = 1200, heading = Math.PI / 2) {
  const position = new T.Vector3();
  wake.begin(0, position, heading);
  for (let time = step; time <= until; time += step) {
    position.set(time * 0.002, 0, 0);
    wake.update(time, position, heading, true, 0, false);
  }
}

function releaseData(wake: FerryWake) {
  return wake.presentation().points.map(({ evolution: _, ...point }) => point);
}

test('water elevation, hull draft and in-place steering produce no travel crest', () => {
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
  position.x = 0.4;
  wake.update(420, position, 0.9, true, 0.36, false, -0.12);
  const release = releaseData(wake);
  expect(release.length).toBeGreaterThan(0);
  for (const point of release) {
    expect(point.direction).toEqual([1, 0, 0]);
    expect(point.position[0]).toBeLessThan(point.center[0]);
    expect(point.position[1]).toBeCloseTo(point.center[1] + 0.018);
  }
  wake.update(500, position, 1.2, false, 0.4, false, -0.12);
  const view = wake.presentation();
  expect(releaseData(wake)).toEqual(release);
  for (let i = 1; i < view.positions.length; i += 3)
    expect(view.positions[i]).toBeCloseTo(0.418, 6);
});

test('stable distance releases agree across frame rates and keep birth data immutable', () => {
  const fine = new FerryWake(),
    coarse = new FerryWake();
  runStraight(fine, 10);
  runStraight(coarse, 80);
  expect(fine.count).toBe(coarse.count);
  const a = releaseData(fine),
    b = releaseData(coarse);
  expect(a.length).toBeGreaterThan(2);
  for (let i = 0; i < a.length; i++) {
    expect(a[i].id).toBe(b[i].id);
    expect(a[i].time).toBeCloseTo(b[i].time, 6);
    expect(a[i].position[0]).toBeCloseTo(b[i].position[0], 6);
    expect(a[i].position[2]).toBeCloseTo(b[i].position[2], 6);
  }
  fine.update(1220, new T.Vector3(2.44, 0, 0.02), 1.5, true, 0.18, false);
  expect(releaseData(fine).slice(0, a.length)).toEqual(a);
});

test('released crests spread on their own when the ferry turns and takes a new route', () => {
  const resting = new FerryWake(),
    turning = new FerryWake(),
    stop = new T.Vector3(2.4, 0, 0);
  runStraight(resting, 20);
  runStraight(turning, 20);
  const birth = releaseData(resting),
    original = resting.presentation().points;
  resting.finish(1200);
  turning.finish(1200);
  turning.begin(1200, stop, Math.PI / 2);
  for (let time = 1220; time <= 1600; time += 20) {
    resting.update(time, stop, Math.PI / 2, false, 0.18, false);
    turning.update(
      time,
      new T.Vector3(2.4, 0.18, (time - 1200) * 0.003),
      Math.PI / 2 - (time - 1200) * 0.004,
      true,
      0.18,
      false,
    );
  }
  const idleEvents = resting.presentation().points,
    movingEvents = turning.presentation().points,
    ids = birth.map((point) => point.id);
  expect(releaseData(resting)).toEqual(birth);
  expect(movingEvents.filter((point) => ids.includes(point.id))).toEqual(idleEvents);
  expect(new Set(movingEvents.map((point) => point.segment)).size).toBe(2);
  for (const point of idleEvents) {
    const old = original.find((sample) => sample.id === point.id)!;
    expect(point.evolution.width).toBeGreaterThan(old.evolution.width);
    expect(point.evolution.x).toBeLessThan(old.evolution.x);
    expect(point.evolution.waterY).toBeCloseTo(0.198);
  }
  expect(turning.vertices).toBeLessThanOrEqual(turning.count * wakeLimits.sections * 6);
});

test('backing movement releases from the displaced-water side rather than the nominal stern', () => {
  const wake = new FerryWake();
  runStraight(wake, 20, 1200, -Math.PI / 2);
  for (const point of wake.presentation().points) {
    expect(point.heading).toBe(-Math.PI / 2);
    expect(point.direction).toEqual([1, 0, 0]);
    expect(point.position[0]).toBeCloseTo(point.center[0] - 0.76, 6);
    expect(point.position[2]).toBeCloseTo(point.center[2], 6);
  }
});

test('repeated curved releases stay finite in one fixed mesh and event pool', () => {
  const wake = new FerryWake(),
    geometry = wake.mesh.geometry,
    material = wake.mesh.material,
    attributes = Object.values(geometry.attributes).map((attribute) => attribute.array),
    pool = wake.pool.map((point) => [point.position, point.center, point.direction]),
    position = new T.Vector3();
  wake.begin(0, position, 0);
  for (let time = 20; time <= 20000; time += 20) {
    const angle = time * 0.001;
    position.set(Math.sin(angle) * 2, 0, Math.cos(angle) * 2 - 2);
    wake.update(time, position, angle + Math.PI / 2, true, 0, false);
    expect(wake.count).toBeLessThanOrEqual(wakeLimits.capacity);
    expect(wake.vertices).toBeLessThanOrEqual(wakeLimits.capacity * wakeLimits.sections * 6);
  }
  expect(wake.mesh.geometry).toBe(geometry);
  expect(wake.mesh.material).toBe(material);
  Object.values(geometry.attributes).forEach((attribute, index) =>
    expect(attribute.array).toBe(attributes[index]),
  );
  wake.pool.forEach((point, index) => {
    expect(point.position).toBe(pool[index][0]);
    expect(point.center).toBe(pool[index][1]);
    expect(point.direction).toBe(pool[index][2]);
  });
  const view = wake.presentation();
  expect(view.positions.every(Number.isFinite)).toBe(true);
  expect(view.opacity.every((value) => Number.isFinite(value) && value >= 0 && value <= 0.58)).toBe(
    true,
  );
  for (const point of view.points)
    expect(Math.hypot(point.direction[0], point.direction[2])).toBeCloseTo(1, 6);
});

test('arrival uses only finite residual water without reintroducing a hull contact or peak-strength pulse', () => {
  const wake = new FerryWake(),
    position = new T.Vector3(2.4, 0, 0);
  runStraight(wake, 20);
  const before = wake.presentation();
  wake.finish(1200);
  wake.update(1220, position, 0, false, 0, false);
  const after = wake.presentation();
  expect(after).toMatchObject({
    emitting: false,
    visible: true,
    docking: false,
    contactStrength: 0,
  });
  expect(after.points).toHaveLength(before.points.length);
  expect(after.points.map((point) => point.time)).toEqual(before.points.map((point) => point.time));
  expect(Math.max(...after.opacity)).toBeLessThanOrEqual(Math.max(...before.opacity));
  for (let time = 1240; time <= 3200; time += 20) wake.update(time, position, 0, false, 0, false);
  expect(wake.presentation()).toMatchObject({
    visible: false,
    emitting: false,
    vertices: 0,
    points: [],
    strength: 0,
  });
});

test('reset, reduced motion and discontinuities clear all released water without an arrival flourish', () => {
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

test('released crests keep coast masking, depth occlusion and no camera or pointer influence', () => {
  const texture = new T.Texture(),
    bounds = new T.Vector4(-4, -5, 12, 13),
    wake = new FerryWake({ texture, bounds });
  runStraight(wake, 20);
  expect(wake.mesh.material).toMatchObject({
    depthTest: true,
    depthWrite: false,
    forceSinglePass: true,
  });
  expect(wake.mesh.material.uniforms.coast.value).toBe(texture);
  expect(wake.mesh.material.uniforms.field.value).toBe(bounds);
  expect(wake.mesh.userData).toMatchObject({ decorative: true, excludeFromFrame: true });
  const ray = new T.Raycaster(new T.Vector3(1, 10, 0), new T.Vector3(0, -1, 0));
  expect(ray.intersectObject(wake.mesh)).toHaveLength(0);
});
