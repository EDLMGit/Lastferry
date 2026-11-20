import { expect, test } from 'vitest';
import * as T from 'three';
import { CrossingEffects } from '../../src/scene/effects';
import { lighthouse } from '../../src/scene/models';

function beamOf(effects: CrossingEffects) {
  return effects.sweep.children[0] as T.Mesh<T.BufferGeometry, T.ShaderMaterial>;
}

function ownedResources(effects: CrossingEffects) {
  const resources = new Set<T.BufferGeometry | T.Material | T.Texture>();
  for (const root of [effects.wake, effects.glow, effects.sweep])
    root.traverse((object) => {
      if (!(object instanceof T.Mesh || object instanceof T.Sprite)) return;
      if ('geometry' in object) resources.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        resources.add(material);
        for (const value of Object.values(material))
          if (value instanceof T.Texture) resources.add(value);
      }
    });
  return [...resources];
}

test('the light contributes one occluded transparent pass without intercepting a pointer ray', () => {
  const effects = new CrossingEffects(lighthouse(new T.Group(), 0, 0, 0)),
    beam = beamOf(effects);
  expect(effects.sweep.children).toHaveLength(1);
  expect(effects.sweep.userData.excludeFromFrame).toBe(true);
  expect(effects.sweep.userData.decorative).toBe(true);
  expect(beam.material).toMatchObject({
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    premultipliedAlpha: false,
    side: T.DoubleSide,
    forceSinglePass: true,
    toneMapped: true,
  });
  expect(effects.glow.material.blending).toBe(T.NormalBlending);
  expect(effects.glow.material.depthTest).toBe(true);
  expect(effects.glow.material.depthWrite).toBe(false);
  effects.arrive(0, false);
  effects.update(50, new T.Vector3(), 0, false, 0, false);
  expect(effects.glow.material.blending).toBe(T.AdditiveBlending);
  effects.sweep.updateMatrixWorld(true);
  const bounds = new T.Box3().setFromObject(beam),
    center = bounds.getCenter(new T.Vector3()),
    ray = new T.Raycaster(center.clone().add(new T.Vector3(0, 0, 10)), new T.Vector3(0, 0, -1));
  expect(ray.intersectObject(effects.sweep, true)).toHaveLength(0);
  effects.reset();
  expect(effects.glow.material.blending).toBe(T.NormalBlending);
  effects.settle(true);
  expect(effects.glow.material.blending).toBe(T.AdditiveBlending);
  effects.reset();
  expect(effects.glow.material.blending).toBe(T.NormalBlending);
});

test('the open shaft has continuous unit seam normals and remains attached to the glass source', () => {
  const parent = new T.Group();
  parent.position.set(3, 0.5, -2);
  parent.rotation.y = 0.35;
  const home = lighthouse(parent, -6, 0.54, -3),
    effects = new CrossingEffects(home),
    beam = beamOf(effects),
    positions = beam.geometry.getAttribute('position'),
    normals = beam.geometry.getAttribute('normal'),
    uv = beam.geometry.getAttribute('uv'),
    rings = new Map<number, number[]>();
  for (let i = 0; i < positions.count; i++) {
    const v = uv.getY(i);
    rings.set(v, [...(rings.get(v) ?? []), i]);
    expect(new T.Vector3().fromBufferAttribute(normals, i).length()).toBeCloseTo(1, 5);
  }
  expect(rings.size).toBeGreaterThan(2);
  const centers: { center: T.Vector3; radius: number }[] = [];
  for (const indices of rings.values()) {
    const first = indices.find((index) => uv.getX(index) === 0),
      last = indices.find((index) => uv.getX(index) === 1);
    expect(first).toBeDefined();
    expect(last).toBeDefined();
    expect(
      new T.Vector3()
        .fromBufferAttribute(normals, first!)
        .distanceTo(new T.Vector3().fromBufferAttribute(normals, last!)),
    ).toBeLessThan(1e-6);
    const vertices = indices
        .filter((index) => uv.getX(index) !== 1)
        .map((index) => new T.Vector3().fromBufferAttribute(positions, index)),
      center = vertices
        .reduce((sum, vertex) => sum.add(vertex), new T.Vector3())
        .divideScalar(vertices.length);
    centers.push({
      center,
      radius: Math.max(...vertices.map((vertex) => vertex.distanceTo(center))),
    });
  }
  effects.sweep.updateMatrixWorld(true);
  const source = centers
    .sort((a, b) => a.radius - b.radius)[0]
    .center.applyMatrix4(beam.matrixWorld);
  expect(source.distanceTo(home.lens.getWorldPosition(new T.Vector3()))).toBeLessThan(1e-6);
  expect(
    effects.glow.position.distanceTo(home.anchor.getWorldPosition(new T.Vector3())),
  ).toBeLessThan(1e-8);
  for (let i = 0; i < normals.count; i++) expect(Math.abs(normals.getY(i))).toBeLessThan(1 - 1e-6);
});

test('repeated arrivals, motion changes and settlement retain the same owned render resources', () => {
  const effects = new CrossingEffects(lighthouse(new T.Group(), 0, 0, 0)),
    beam = beamOf(effects),
    initial = ownedResources(effects),
    materialVersion = beam.material.version,
    boat = new T.Vector3();
  for (let cycle = 0; cycle < 12; cycle++) {
    const time = cycle * 1000;
    effects.arrive(time, false);
    effects.update(time + 50, boat, 0, false, 0, false);
    effects.update(time + 100, boat, 0, false, 0, true);
    effects.reset();
    expect(effects.sweep.visible).toBe(false);
    effects.settle(cycle % 2 === 0);
    effects.update(time + 150, boat, 0, false, 0, cycle % 2 === 0);
    const current = ownedResources(effects);
    expect(current).toHaveLength(initial.length);
    for (const [index, resource] of current.entries()) expect(resource).toBe(initial[index]);
    expect(beamOf(effects)).toBe(beam);
    expect(beam.material.version).toBe(materialVersion);
  }
  effects.reset();
  expect(effects.sweep.visible).toBe(false);
});
