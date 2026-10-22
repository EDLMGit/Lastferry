import { expect, test } from 'vitest';
import { NoColorSpace, OrthographicCamera, Vector2, Vector3 } from 'three';
import { bellwater, holdingPier, level } from '../../src/levels/level';
import { getLevelPaths } from '../../src/scene/paths';
import { CoastalWater } from '../../src/scene/water';
import { islandCenter } from '../../src/scene/shore';
import { prepareContour } from '../../src/scene/seabed';

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
  const fields = [water.mask.texture.image.data, water.seabed.texture.image.data];
  const snapshots = fields.map((field) => Array.from(field!));
  const stone = water.seabed.patches.find((patch) => patch.rock && Math.abs(patch.x - low.x) < 1)!;
  const stoneSample = water.seabed.sampleAuthored(stone.x, stone.z);
  const sand = water.seabed.patches.find((patch) => !patch.rock && Math.abs(patch.x - low.x) < 2)!;
  const sandSample = water.seabed.sampleAuthored(sand.x, sand.z);
  expect(stoneSample.rockForm).toBeGreaterThan(0.8);
  expect(sandSample.sandForm).toBeGreaterThan(0.8);
  expect(stoneSample.color[0]).toBeLessThan(sandSample.color[0] * 0.65);
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
  expect(water.mask.texture.image.data).toBe(fields[0]);
  expect(water.seabed.texture.image.data).toBe(fields[1]);
  expect(fields.map((field) => Array.from(field!))).toEqual(snapshots);
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

test('prepared contour preserves signed coast classification and exact corner/edge distances', () => {
  const contour = prepareContour([
    new Vector2(-2, -1),
    new Vector2(2, -1),
    new Vector2(2, 1),
    new Vector2(-2, 1),
  ]);
  expect(contour.sample(0, 0)).toEqual({ land: true, distance: 1 });
  expect(contour.sample(0, 1.3).land).toBe(false);
  expect(contour.sample(0, 1.3).distance).toBeCloseTo(0.3);
  expect(contour.sample(3, 2)).toEqual({ land: false, distance: Math.SQRT2 });
  expect(contour.sample(-2, 0).distance).toBe(0);
});
