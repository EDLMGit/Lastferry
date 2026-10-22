import { expect, test } from 'vitest';
import { NoColorSpace, OrthographicCamera, Vector3 } from 'three';
import { bellwater, holdingPier, level } from '../../src/levels/level';
import { getLevelPaths } from '../../src/scene/paths';
import { CoastalWater } from '../../src/scene/water';
import { islandCenter } from '../../src/scene/shore';

test.each([level, holdingPier, bellwater])(
  '$id decorative seabed represents coast, apron and genuinely deep open water without changing authored data',
  (cove) => {
    const before = structuredClone(cove),
      water = new CoastalWater(cove, getLevelPaths(cove));
    const field = water.seabed,
      bounds = water.mask.bounds;
    const land = cove.world.islands[0],
      center = islandCenter(land);
    const landSample = field.sampleAuthored(center.x, center.y);
    const deepSample = field.sampleAuthored(bounds.x + bounds.z - 0.1, bounds.y + bounds.w - 0.1);
    expect(landSample.height).toBeCloseTo(land.elevation * 0.18 - 0.005);
    expect(deepSample.height).toBeLessThan(-1.5);
    const apronSamples = field.patches.map((patch) => field.sampleAuthored(patch.x, patch.z));
    expect(apronSamples.some((sample) => sample.height < -0.04 && sample.height > -0.9)).toBe(true);
    const data = field.texture.image.data!;
    const heights = new Set(Array.from(data).filter((_, i) => i % 4 === 3));
    expect(heights.size).toBeGreaterThan(40);
    expect(field.texture.colorSpace).toBe(NoColorSpace);
    expect(data.length).toBe(field.texture.image.width * field.texture.image.height * 4);
    expect(field.minimumHeight).toBeGreaterThanOrEqual(field.heightRange.x);
    expect(field.maximumHeight).toBeLessThanOrEqual(field.heightRange.y);
    expect(cove).toEqual(before);
    water.dispose();
  },
);

test('actual water level controls the transition from low ground to submerged ground while Harbor remains exposed', () => {
  const water = new CoastalWater(bellwater, getLevelPaths(bellwater));
  const low = islandCenter(bellwater.world.islands.find((island) => island.id === 'low-island')!);
  const harbor = islandCenter(
    bellwater.world.islands.find((island) => island.id === 'lighthouse-island')!,
  );
  const lowHeight = water.seabed.sampleAuthored(low.x, low.y).height;
  const harborHeight = water.seabed.sampleAuthored(harbor.x, harbor.y).height;
  water.update(0, 5);
  expect(water.presentation().waterY - lowHeight).toBeLessThan(0);
  water.update(0.18, 8);
  expect(water.presentation().waterY - lowHeight).toBeGreaterThan(0);
  water.update(0.36, 10);
  expect(water.presentation().waterY - harborHeight).toBeLessThan(0);
  water.update(0, 0);
  expect(water.presentation().waterY - lowHeight).toBeLessThan(0);
  expect(water.presentation().time).toBe(0);
  water.dispose();
});

test('orthographic reflection uses one world-space view direction and live Harbor transforms', () => {
  const water = new CoastalWater(holdingPier, getLevelPaths(holdingPier));
  const camera = new OrthographicCamera(-10, 10, 10, -10);
  camera.position.set(0, 30, 30);
  camera.lookAt(0, 0, 0);
  water.setView(camera);
  const first = water.presentation().viewDirection;
  expect(first[0]).toBeCloseTo(0);
  expect(first[1]).toBeCloseTo(Math.SQRT1_2);
  expect(first[2]).toBeCloseTo(Math.SQRT1_2);
  camera.position.add(new Vector3(8, 8, 8));
  water.setView(camera);
  expect(water.presentation().viewDirection).toEqual(first);
  water.setHarbor(new Vector3(-6, 3.1, -3), 0.7);
  expect(water.presentation()).toMatchObject({ lampPosition: [-6, 3.1, -3], arrival: 0.7 });
  water.setHarbor(new Vector3(-6, 3.1, -3), 0);
  expect(water.presentation().arrival).toBe(0);
  water.dispose();
});

test('water teardown releases each owned material, geometry and texture exactly once', () => {
  const water = new CoastalWater(holdingPier, getLevelPaths(holdingPier));
  const counts = [0, 0, 0, 0];
  for (const [index, resource] of [
    water.mesh.geometry,
    water.mesh.material,
    water.mask.texture,
    water.seabed.texture,
  ].entries())
    (
      resource as { addEventListener: (name: string, callback: () => void) => void }
    ).addEventListener('dispose', () => counts[index]++);
  water.dispose();
  water.dispose();
  expect(counts).toEqual([1, 1, 1, 1]);
});
