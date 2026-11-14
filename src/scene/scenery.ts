import * as T from 'three';
import { ball, box, cylinder, mesh, palette, pine } from './models';
import type { Level } from '../levels/level';
import type { IslandStyle } from './layout';
import { createReedBeds, islandCenter } from './shore';

export function orchardTree(parent: T.Object3D, position: [number, number, number]) {
  const tree = new T.Group();
  tree.name = 'orchard-apple-tree';
  tree.position.set(...position);
  parent.add(tree);
  const branches = [
    { from: [0, -0.02, 0], to: [-0.10, 0.58, 0.01], foot: 0.16, tip: 0.11 },
    { from: [-0.10, 0.55, 0.01], to: [-0.47, 0.96, 0.04], foot: 0.11, tip: 0.062 },
    { from: [-0.08, 0.44, 0.01], to: [0.33, 0.81, 0.13], foot: 0.09, tip: 0.049 },
    { from: [-0.10, 0.56, 0.01], to: [0.06, 1.26, -0.14], foot: 0.09, tip: 0.046 },
  ];
  for (const branch of branches) {
    const base = new T.Vector3().fromArray(branch.from);
    const tip = new T.Vector3().fromArray(branch.to);
    const length = tip.distanceTo(base);
    const middle = base.clone().lerp(tip, 0.5);
    const wood = cylinder(tree, '#795f49', branch.tip, branch.foot, length, middle.toArray(), 8);
    wood.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), tip.sub(base).normalize());
  }
  for (const [x, y, z, size, color] of [
    [-0.47, 1.10, 0.04, 0.55, '#748b57'],
    [-0.14, 1.29, -0.13, 0.64, '#87995f'],
    [0.34, 1.12, 0.10, 0.54, '#96a465'],
    [0.02, 1.40, 0.09, 0.43, '#a4ad71'],
  ] as const) {
    const crown = mesh(new T.IcosahedronGeometry(1, 1), color, tree, x, y, z);
    crown.rotation.y = y * 2;
    crown.scale.set(size, size * 0.61, size * 0.80);
  }
  for (const [x, y, z, color] of [
    [-0.60, 0.99, 0.38, '#bb6249'],
    [-0.36, 1.10, 0.46, '#d09a51'],
    [-0.03, 1.30, 0.43, '#bf6748'],
    [0.26, 0.96, 0.45, '#bc5740'],
    [0.52, 1.08, 0.40, '#d39351'],
  ] as const) {
    ball(tree, color, [x, y, z], [0.094, 0.105, 0.092]);
  }
  return tree;
}

export function decorateOrchardIsland(
  group: T.Group, island: Level['world']['islands'][number], style: IslandStyle,
) {
  if (style === 'refuge') return decorateWideIsland(group, island, style);
  const { x, y: z } = islandCenter(island);
  const y = island.elevation * 0.18;
  if (style === 'quay') {
    const crate = new T.Group();
    crate.name = 'cider-quay-fruit-crate';
    crate.position.set(x + 1.26, y, z - 0.72);
    crate.rotation.y = 0.21;
    group.add(crate);
    box(crate, '#906d4b', [0.65, 0.065, 0.48], [0, 0.03, 0], 0.012);
    for (const side of [-1, 1]) {
      for (const height of [0.105, 0.224]) {
        box(crate, '#bf965e', [0.65, 0.094, 0.043], [0, height, side * 0.217], 0.009);
        box(crate, '#ad8256', [0.043, 0.094, 0.43], [side * 0.303, height, 0], 0.009);
      }
    }
    for (const [dx, dz] of [[-0.17, 0.06], [0.02, -0.06], [0.17, 0.06]]) {
      ball(crate, dx === 0.17 ? '#d39e55' : '#b96649', [dx, 0.238, dz], [0.09, 0.086, 0.082]);
    }
    return group;
  }
  if (style === 'spit') {
    const reeds = createReedBeds(island);
    reeds.scale.set(0.59, 1, 0.48);
    reeds.position.set(x * 0.41, 0, z * 0.52 - 0.61);
    group.add(reeds);
  }
  return group;
}

export function decorateWideIsland(
  group: T.Group,
  island: Level['world']['islands'][number],
  style: IslandStyle,
) {
  const center = islandCenter(island),
    cx = center.x,
    cz = center.y,
    height = island.elevation * 0.18;
  if (style === 'spit') {
    group.add(createReedBeds(island));
    for (const side of [-1, 1])
      for (let i = 0; i < 3; i++)
        ball(
          group,
          '#e5d5b0',
          [cx + side * (1.1 + i * 0.2), height + 0.025, cz + 0.8 - i * 0.13],
          [0.07, 0.025, 0.05],
        );
  } else {
    const treeX = style === 'refuge' ? cx + 2 : cx - 2;
    pine(group, treeX, height, cz - 0.65, style === 'quay' ? 0.58 : 0.52);
    for (const side of [-1, 1])
      for (let i = 0; i < 4; i++)
        ball(
          group,
          '#91a273',
          [cx + side * (1.9 + i * 0.07), height + 0.07, cz + 0.6 + i * 0.09],
          [0.035, 0.06, 0.035],
        );
  }
  return group;
}

export function decorateReefIsland(group: T.Group, island: Level['world']['islands'][number], style: IslandStyle) {
  const {x, y: z} = islandCenter(island);
  const y = island.elevation * 0.18;
  if (island.id === 'pool-island') {
    const fronds = createReedBeds(island);
    fronds.scale.set(0.69,1,0.55);
    fronds.position.set(x*(1-0.69),0,z*(1-0.55)-0.46);
    group.add(fronds);
    for (const [dx,dz] of [[0.95,-0.38],[1.22,-0.57],[-1.21,-0.26]]) {
      const shell = ball(group,'#e3cfa6',[x+dx,y+0.037,z+dz],[0.13,0.048,0.10]);
      shell.rotation.y = dx;
    }
    return group;
  }
  if (island.id === 'wrack-island') {
    const log = cylinder(group, '#a79470', 0.11, 0.15, 1.13, [x + 0.41, y + 0.13, z - 0.66], 8);
    log.rotation.set(0.17, -0.27, 1.49);
    const branch = cylinder(group, '#b6a580', 0.041, 0.082, 0.47, [x + 0.53, y + 0.23, z - 0.79], 7);
    branch.rotation.set(-0.85, 0.21, -0.55);
    for (const [dx, dz] of [[-0.86,-0.44],[0.92,-0.36],[0.3,-1.0]])
      for (let i = 0; i < 5; i++)
        ball(group, i % 2 ? '#abaf75' : '#85966b', [x + dx + i*0.052, y + 0.07, z + dz - i*0.028], [0.032, 0.12 + (i%3)*0.04, 0.04]);
    return group;
  }
  if (island.id === 'quay-island') {
    for (let tier = 0; tier < 3; tier++) {
      const radius = 0.36 - tier*0.074;
      const stone = mesh(new T.DodecahedronGeometry(1,0), tier % 2 ? '#9da697' : '#84958d', group, x+1.16-tier*0.04, y+0.11+tier*0.19, z-0.55);
      stone.scale.set(radius,radius*0.49,radius*0.8);
      stone.rotation.y = tier*0.85;
    }
    return group;
  }
  return decorateWideIsland(group,island,style);
}

export function cottage(parent: T.Object3D, position: [number, number, number]) {
  const house = new T.Group();
  house.name = 'cottage';
  house.position.set(...position);
  parent.add(house);
  box(house, '#c78155', [1.35, 0.9, 1.05], [0, 0.45, 0], 0.08);
  for (const x of [-0.42, 0.42]) box(house, '#f9d084', [0.24, 0.29, 0.03], [x, 0.52, 0.54]);
  box(house, '#754f3b', [0.27, 0.56, 0.05], [0, 0.29, 0.55]);
  const roof = new T.Shape();
  roof.moveTo(-0.82, 0);
  roof.lineTo(0, 0.58);
  roof.lineTo(0.82, 0);
  roof.closePath();
  const roofGeo = new T.ExtrudeGeometry(roof, {
    depth: 1.28,
    bevelEnabled: true,
    bevelSize: 0.03,
    bevelThickness: 0.03,
    bevelSegments: 2,
    steps: 1,
  });
  mesh(roofGeo, palette.red, house, 0, 0.9, -0.64);
  for (const x of [-0.42, 0.42])
    for (const y of [0.42, 0.62]) box(house, '#edc28c', [0.27, 0.025, 0.045], [x, y, 0.56]);
  box(house, '#ead5a6', [0.026, 0.32, 0.04], [-0.42, 0.52, 0.56]);
  box(house, '#93816a', [0.19, 0.6, 0.2], [0.43, 1.35, -0.25]);
  return house;
}

export function bellLandmark(parent: T.Object3D, position: [number, number, number]) {
  const g = new T.Group();
  g.name = 'bell-landmark';
  g.position.set(...position);
  parent.add(g);
  cylinder(g, '#83918b', 0.62, 0.7, 0.18, [0, 0.09, 0], 10);
  for (const x of [-0.45, 0.45]) {
    box(g, '#6e5e47', [0.13, 1.45, 0.15], [x, 0.84, 0], 0.035);
    box(g, '#b4a075', [0.18, 0.1, 0.2], [x, 1.43, 0], 0.02);
  }
  box(g, '#786448', [1.14, 0.16, 0.2], [0, 1.58, 0], 0.04);
  const roof = mesh(new T.ConeGeometry(0.83, 0.28, 4), '#936e4e', g, 0, 1.79, 0);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.5;
  cylinder(g, '#5a5848', 0.025, 0.025, 0.22, [0, 1.38, 0], 8);
  const profile = [
    [0.3, 0],
    [0.31, 0.075],
    [0.23, 0.12],
    [0.18, 0.37],
    [0.12, 0.47],
    [0.035, 0.5],
  ].map(([x, y]) => new T.Vector2(x, y));
  mesh(new T.LatheGeometry(profile, 20), '#bd9a4e', g, 0, 0.8, 0);
  cylinder(g, '#665535', 0.255, 0.255, 0.018, [0, 0.805, 0], 20);
  cylinder(g, '#6d5b3e', 0.025, 0.025, 0.32, [0, 0.79, 0], 8);
  ball(g, '#d0ab62', [0, 0.63, 0], [0.075, 0.085, 0.075]);
  return g;
}
export function driftwoodYard(parent: T.Object3D, position: [number, number, number]) {
  const group = new T.Group();
  group.name = 'driftwood-working-yard';
  group.position.set(...position);
  parent.add(group);
  for (const x of [-0.62, 0.62]) {
    for (const z of [-0.2, 0.2]) {
      const leg = box(group, '#72563e', [0.12, 0.53, 0.12], [x, 0.26, z], 0.025);
      leg.rotation.z = x > 0 ? -0.13 : 0.13;
    }
    box(group, '#b18b59', [0.19, 0.12, 0.68], [x, 0.48, 0], 0.025);
  }
  for (const z of [-0.19, 0, 0.19]) box(group, '#ccab74', [1.65, 0.095, 0.17], [0, 0.57, z], 0.025);
  box(group, '#977043', [1.32, 0.065, 0.13], [-0.07, 0.65, 0.05], 0.025).rotation.y = -0.12;
  for (let i = 0; i < 4; i++) {
    const beam = box(
      group,
      i % 2 ? '#b08a58' : '#c6a573',
      [0.2, 0.14, 1.02],
      [0.98 + (i % 2) * 0.19, 0.1 + Math.floor(i / 2) * 0.14, -0.12],
      0.035,
    );
    beam.rotation.y = 0.12;
  }
  for (const x of [-0.8, 0.8]) {
    box(group, '#766147', [0.12, 1.15, 0.13], [x, 0.57, -0.56], 0.03);
    box(group, '#cfb37f', [0.17, 0.06, 0.18], [x, 1.13, -0.56], 0.02);
  }
  box(group, '#aa8456', [1.86, 0.14, 0.18], [0, 1.06, -0.56], 0.035);
  for (let loop = 0; loop < 3; loop++) {
    const rope = mesh(
      new T.TorusGeometry(0.13 + loop * 0.027, 0.018, 6, 28),
      '#d8c395',
      group,
      -0.43,
      0.64 + loop * 0.014,
      -0.07,
    );
    rope.rotation.x = Math.PI / 2;
  }
  box(group, '#786346', [0.16, 0.065, 0.16], [0.6, 0.66, -0.14], 0.02);
  box(group, '#f4ce80', [0.11, 0.18, 0.11], [0.6, 0.78, -0.14], 0.02);
  cylinder(group, '#716048', 0.1, 0.08, 0.07, [0.6, 0.9, -0.14], 8);
  return group;
}

export function wideWaterfront(parent: T.Object3D, position: [number, number, number]) {
  const group = new T.Group();
  group.name = 'wide-berth-waterfront';
  group.scale.x = 0.8;
  group.position.set(...position);
  parent.add(group);
  for (const x of [-0.52, 0.52])
    for (const z of [-0.3, 0.3]) {
      box(group, '#776248', [0.09, 1.04, 0.09], [x, 0.52, z], 0.02);
      box(group, '#c4a777', [0.14, 0.06, 0.14], [x, 1.02, z], 0.018);
    }
  for (const z of [-0.3, 0.3]) box(group, '#a47d51', [1.2, 0.09, 0.12], [0, 0.96, z], 0.02);
  for (let index = 0; index < 6; index++) {
    const board = box(
      group,
      index % 2 ? '#b8694a' : '#a96045',
      [0.22, 0.07, 0.94],
      [-0.55 + index * 0.22, 1.12, 0],
      0.015,
    );
    board.rotation.x = -0.1;
  }
  for (const x of [-0.4, 0.4]) box(group, '#8c6c49', [0.09, 0.4, 0.36], [x, 0.2, 0], 0.02);
  box(group, '#c9a776', [1.0, 0.07, 0.4], [0, 0.43, 0], 0.025);
  for (let loop = 0; loop < 3; loop++) {
    const rope = mesh(
      new T.TorusGeometry(0.09 + loop * 0.018, 0.012, 6, 24),
      '#d9c395',
      group,
      -0.2,
      0.48 + loop * 0.011,
      0.03,
    );
    rope.rotation.x = Math.PI / 2;
  }
  box(group, '#796246', [0.12, 0.05, 0.12], [0.3, 0.5, -0.02], 0.015);
  box(group, '#f1cc82', [0.09, 0.13, 0.09], [0.3, 0.59, -0.02], 0.015);
  return group;
}
