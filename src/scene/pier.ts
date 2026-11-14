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

function landingWidth(p: Level['piers'][number], distanceFromShore: number) {
  return p.width * (1 + 0.36 * (1 - distanceFromShore) ** 2 - 0.1 * distanceFromShore);
}

function compactPier(p: Level['piers'][number], stone: boolean) {
  const group = new Group();
  group.name = `pier-${p.id}`;
  const [x, tip] = p.positionXZ;
  const root = p.landAnchorXZ[1];
  const y = p.elevation * 0.18 + 0.011;
  const run = tip - root;
  const low = p.elevation === 1;
  const rows = Math.max(5, Math.ceil(run / (stone ? 0.25 : 0.18)));
  const pitch = run / rows;
  for (let row = 0; row < rows; row++) {
    const along = (row + 0.5) / rows;
    const width = landingWidth(p, along);
    const z = root + along * run;
    if (stone && along < 0.72) {
      const seam = row % 2 ? 0.12 : -0.14;
      for (const side of [-1, 1]) {
        const left = side < 0 ? -width / 2 : seam;
        const right = side < 0 ? seam : width / 2;
        box(group, row % 2 ? '#a3afa0' : '#879d92',
          [right - left - 0.012, 0.30, pitch - 0.008], [x + (right + left)/2, y - 0.15, z], 0.035);
      }
    } else {
      const timber = p.isDeliveryPier ? ['#bc8c55', '#c79b65'] : low ? ['#ac895b','#b79469'] : ['#bd915f','#c69d68'];
      box(group, timber[row % 2], [width, 0.085, pitch - 0.009], [x, y - 0.0425, z], 0.014);
    }
  }
  for (const side of [-1, 1]) {
    box(group, stone ? '#788b81' : '#795e42', [0.12, 0.13, run], [x + side*p.width*0.33, y-0.13, (tip+root)/2], 0.018);
    for (const along of [0.18, 0.84]) {
      const z = root + along * run;
      const px = x + side * (landingWidth(p, along) / 2 - 0.065);
      const pile = cylinder(group, '#766447', 0.07, 0.085, 0.95, [px, y - 0.43, z], 9);
      pile.userData.pierPile = true;
      cylinder(group, '#dac59d', 0.084, 0.081, 0.035, [px, y+0.061, z], 9);
    }
    if (!stone) {
      const brace = box(group, '#8d7553', [0.066, 0.076, run*0.53], [x+side*(p.width*0.44), y-0.24, root+0.52*run], 0.01);
      brace.rotation.x = side*0.22;
    }
  }
  if (p.isDeliveryPier) {
    const px = x - landingWidth(p, 0.18)*0.5;
    cylinder(group, '#735e43', 0.047, 0.058, 0.35, [px, y+0.18, root+0.17], 8);
    box(group, '#eac783', [0.14, 0.16, 0.14], [px,y+0.40,root+0.17], 0.026);
    box(group, '#59716b', [0.17, 0.045, 0.17], [px,y+0.498,root+0.17], 0.014);
  }
  return group;
}

const topOutlines = new WeakMap<Level['world']['islands'][number], number[][]>();
export function isWalkableAt(level: Level, pier: Level['piers'][number], x: number, z: number) {
  const [px, pz] = pier.positionXZ;
  const root = pier.landAnchorXZ[1];
  if (z >= root && z <= pz && Math.abs(x - px) <= landingWidth(pier, (z-root)/(pz-root))/2) return true;
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
