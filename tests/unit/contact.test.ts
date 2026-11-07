import { expect, test } from 'vitest';
import * as T from 'three';
import { lighthouse, mat, ferry, palette } from '../../src/scene/models';
import { contactMaterial } from '../../src/scene/contact';
import { CrossingEffects } from '../../src/scene/effects';

test('lantern warmth stays scoped to its visible source and receivers with normal occlusion', () => {
  const shared = [mat('#eee3c6'), mat(palette.red), mat('#b7a580'), mat('#ffe8b6')];
  const original = shared.map((material) => ({
    color: material.color.clone(),
    emissive: material.emissive.clone(),
    intensity: material.emissiveIntensity,
    compile: material.onBeforeCompile,
  }));
  const home = lighthouse(new T.Group(), 0, 0.54, 0);
  const effects = new CrossingEffects(home);
  for (const object of [home.lens, home.core, home.tower, home.gallery, home.roof]) {
    expect(shared).not.toContain(object.material);
    expect(object.material.depthTest).toBe(true);
  }
  expect(effects.glow.material.depthTest).toBe(true);
  expect(home.core.material.emissiveIntensity).toBeGreaterThan(0);
  expect(home.lamp.castShadow).toBe(false);
  for (const [index, material] of shared.entries()) {
    expect(material.color).toEqual(original[index].color);
    expect(material.emissive).toEqual(original[index].emissive);
    expect(material.emissiveIntensity).toBe(original[index].intensity);
    expect(material.onBeforeCompile).toBe(original[index].compile);
  }
});

test('home light uses the explicit lens and world anchor and restores its baseline after a delivery', () => {
  const scene = new T.Group();
  scene.position.set(2, 0.3, -1);
  const home = lighthouse(scene, -6, 0.54, -3);
  const shared = mat('#f9cb70');
  const original = shared.emissiveIntensity;
  const effects = new CrossingEffects(home);
  const initial = effects.presentation().arrival;
  expect(
    effects.glow.position.distanceTo(home.anchor.getWorldPosition(new T.Vector3())),
  ).toBeLessThan(1e-8);
  expect(initial).toMatchObject({ active: false, intensity: 0, glowVisible: true });
  expect(initial.emissiveIntensity).toBeGreaterThan(0);
  expect(initial.glowOpacity).toBeGreaterThan(0);
  expect(home.lens.material).not.toBe(shared);
  effects.arrive(100, false);
  effects.update(200, new T.Vector3(), 0, false, 0.36, false);
  expect(effects.presentation().arrival.emissiveIntensity).toBeGreaterThan(
    initial.emissiveIntensity!,
  );
  effects.reset();
  expect(effects.presentation().arrival).toEqual(initial);
  expect(shared.emissiveIntensity).toBe(original);
  effects.arrive(300, true);
  effects.update(500, new T.Vector3(), 0, false, 0.36, true);
  const reduced = effects.presentation().arrival;
  effects.update(5000, new T.Vector3(), 0, false, 0.36, true);
  expect(effects.presentation().arrival).toEqual(reduced);
  effects.reset();
  expect(effects.presentation().arrival).toEqual(initial);
  effects.settle(false);
  expect(effects.presentation().arrival).toMatchObject({ active: false, resting: true });
  const settled = effects.presentation().arrival;
  effects.update(10000, new T.Vector3(), 0, false, 0.36, false);
  expect(effects.presentation().arrival).toEqual(settled);
  expect(settled.emissiveIntensity).toBeGreaterThan(initial.emissiveIntensity!);
  effects.reset();
  expect(effects.presentation().arrival).toEqual(initial);
});

test('contact materials stay isolated and share actual animated water height while the hull transform changes', () => {
  const source = mat('#e5ad37'),
    water = { value: 0 };
  const original = source.color.clone();
  const material = contactMaterial(source, water, 'hull');
  const shader = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <worldpos_vertex>',
    fragmentShader:
      '#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>',
  } as any;
  material.onBeforeCompile(shader, {} as T.WebGLRenderer);
  expect(material).not.toBe(source);
  expect(shader.uniforms.contactWaterY).toBe(water);
  for (const height of [0, 0.18, 0.36, 0.18, 0]) {
    water.value = height;
    expect(shader.uniforms.contactWaterY.value).toBe(height);
  }
  expect(shader.vertexShader).toContain('modelMatrix*vec4(transformed,1.)');
  expect(source.color).toEqual(original);
  const boat = ferry(),
    contacts: T.Object3D[] = [];
  boat.traverse((object) => {
    if (object.name === 'water-contact-hull') contacts.push(object);
  });
  expect(contacts).toHaveLength(2);
  const local = contacts[0].position.clone();
  boat.position.set(1, 0.28, -3);
  expect(contacts[0].getWorldPosition(new T.Vector3()).y).toBeCloseTo(local.y + 0.28);
  boat.position.y = -0.12;
  expect(contacts[0].getWorldPosition(new T.Vector3()).y).toBeCloseTo(local.y - 0.12);
  material.dispose();
});
