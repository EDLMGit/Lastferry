import { Group, Matrix4, Vector3 } from 'three';
import type { Level } from '../levels/level';
import { box, cylinder } from './models';
import { islandCenter, shoreContour } from './shore';

export function createPier(
  p: Level['piers'][number],
  stone: boolean,
  compact = false,
  broadStep = false,
) {
  if (compact) return compactPier(p, stone);
  const group = new Group();
  group.name = `pier-${p.id}`;
  const [x, z] = p.positionXZ,
    end = p.landAnchorXZ[1],
    y = p.elevation * 0.18 - 0.06;
  for (let i = 0; i < 9; i++)
    box(
      group,
      stone ? (i % 2 ? '#a9b6ac' : '#899d97') : i % 2 ? '#c09560' : '#b78b58',
      [p.width, 0.09, 0.14],
      [x, y, z + ((end - z) * i) / 8],
      0.015,
    );
  for (const px of [x - p.width / 2, x + p.width / 2])
    for (const pz of [z + 0.02, end]) {
      const pile = cylinder(group, '#79644a', 0.065, 0.07, 0.83, [px, y - 0.27, pz], 9);
      pile.userData.pierPile = true;
      cylinder(group, '#dbc799', 0.075, 0.075, 0.055, [px, y + 0.17, pz], 9);
    }
  box(
    group,
    '#b68f5b',
    [broadStep ? p.width : 0.35, 0.055, broadStep ? 0.65 : 0.49],
    [x, y - 0.015, z + (broadStep ? 0.33 : 0.25)],
    0.015,
  );
  cylinder(group, '#655b43', 0.025, 0.025, 0.65, [x + 0.36, y + 0.33, z - 0.1], 7);
  box(group, '#f5cb77', [0.13, 0.19, 0.13], [x + 0.36, y + 0.68, z - 0.1]);
  return group;
}

export function createShelterGangway() {
  const group = new Group();
  group.name = 'shelter-wooden-gangway';
  for (const side of [-1, 1])
    box(group, '#816446', [0.055, 0.06, 1], [side * 0.29, -0.065, 0], 0.008);
  for (let plank = 0; plank < 8; plank++)
    box(
      group,
      plank % 2 ? '#c09560' : '#b78b58',
      [0.68, 0.055, 0.118],
      [0, -0.0275, -0.4375 + plank * 0.125],
      0.006,
    );
  return group;
}

export function updateShelterGangway(group: Group, bridge: Vector3, gate: Vector3) {
  const direction = gate.clone().sub(bridge);
  group.position.copy(bridge).add(gate).multiplyScalar(0.5);
  group.scale.z = direction.length() + 0.42;
  const forward = direction.normalize();
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), forward).normalize();
  const normal = new Vector3().crossVectors(forward, right).normalize();
  group.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(right, normal, forward));
  group.updateMatrixWorld(true);
}

function compactPier(p: Level['piers'][number], stone: boolean) {
  const group = new Group();
  group.name = `pier-${p.id}`;
  const [x, z] = p.positionXZ,
    end = p.landAnchorXZ[1],
    y = p.elevation * 0.18 - 0.06,
    run = Math.abs(end - z),
    center = (z + end) / 2,
    stemWidth = 1.8,
    headDepth = 0.45;
  if (stone) {
    box(group, '#879b93', [stemWidth, 0.28, run], [x, y - 0.11, center], 0.04);
    box(group, '#879b93', [p.width, 0.28, headDepth], [x, y - 0.11, z - headDepth / 2], 0.04);
    for (const side of [-1, 1])
      for (let row = 0; row < 3; row++)
        box(
          group,
          row % 2 ? '#a5b3a4' : '#96a79d',
          [stemWidth / 2 - 0.012, 0.05, run / 3 - 0.012],
          [x + (side * stemWidth) / 4, y + 0.025, end + (run * (row + 0.5)) / 3],
          0.014,
        );
    for (const side of [-1, 1])
      box(
        group,
        '#a5b3a4',
        [(p.width - stemWidth) / 2 - 0.012, 0.05, headDepth - 0.012],
        [x + (side * (p.width + stemWidth)) / 4, y + 0.025, z - headDepth / 2],
        0.014,
      );
  } else {
    const count = Math.ceil(run / 0.16),
      pitch = run / count;
    box(group, '#816446', [stemWidth - 0.12, 0.08, run], [x, y - 0.08, center], 0.015);
    box(
      group,
      '#816446',
      [p.width - 0.08, 0.08, headDepth],
      [x, y - 0.08, z - headDepth / 2],
      0.015,
    );
    for (let row = 0; row < count; row++)
      box(
        group,
        row % 2 ? '#c6a170' : '#bd935d',
        [stemWidth, 0.09, pitch - 0.012],
        [x, y, end + pitch * (row + 0.5)],
        0.009,
      );
    for (const side of [-1, 1])
      for (let row = 0; row < 3; row++)
        box(
          group,
          row % 2 ? '#c6a170' : '#bd935d',
          [(p.width - stemWidth) / 2, 0.09, headDepth / 3 - 0.012],
          [
            x + (side * (p.width + stemWidth)) / 4,
            y,
            z - headDepth + ((row + 0.5) * headDepth) / 3,
          ],
          0.009,
        );
    for (const [px, pz] of [
      [x - p.width / 2 + 0.04, z - 0.04],
      [x + p.width / 2 - 0.04, z - 0.04],
      [x - stemWidth / 2 + 0.04, end + 0.04],
      [x + stemWidth / 2 - 0.04, end + 0.04],
    ]) {
      const front = pz > center;
      const pile = cylinder(
        group,
        '#79644a',
        0.065,
        0.07,
        front ? 0.5 : 0.7,
        [px, y - (front ? 0.21 : 0.24), pz],
        9,
      );
      pile.userData.pierPile = true;
      cylinder(
        group,
        '#dbc799',
        0.075,
        0.075,
        front ? 0.025 : 0.055,
        [px, y + (front ? 0.03 : 0.13), pz],
        9,
      );
    }
  }
  return group;
}

const topOutlines = new WeakMap<Level['world']['islands'][number], number[][]>();
export function isWalkableAt(level: Level, pier: Level['piers'][number], x: number, z: number) {
  const [px, pz] = pier.positionXZ;
  if (Math.abs(x - px) <= pier.width / 2 && z >= pz - 0.45 && z <= pz) return true;
  if (
    Math.abs(x - px) <= 0.9 &&
    z >= Math.min(pz, pier.landAnchorXZ[1]) &&
    z <= Math.max(pz, pier.landAnchorXZ[1])
  )
    return true;
  const island = level.world.islands.find((island) => island.id === pier.islandId)!;
  let outline = topOutlines.get(island);
  if (!outline) {
    const center = islandCenter(island);
    outline = shoreContour(island).map((p) => [
      center.x + (p.x - center.x) * 0.84,
      center.y + (p.y - center.y) * 0.84,
    ]);
    topOutlines.set(island, outline);
  }
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i],
      b = outline[j];
    if (a[1] > z !== b[1] > z && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0])
      inside = !inside;
  }
  return inside;
}
