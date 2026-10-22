import * as T from 'three';
import { ball, box, cylinder, mesh, palette } from './models';

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

export function reedClump(parent: T.Object3D, x: number, y: number, z: number, phase: number) {
  const g = new T.Group();
  g.position.set(x, y, z);
  parent.add(g);
  for (let i = 0; i < 5; i++) {
    const angle = phase + i * 2.4;
    const height = 0.25 + (i % 3) * 0.08;
    const stem = cylinder(
      g,
      i % 2 ? '#8d9660' : '#647f5e',
      0.009,
      0.018,
      height,
      [Math.cos(angle) * 0.065, height / 2, Math.sin(angle) * 0.045],
      5,
    );
    stem.rotation.z = Math.sin(angle) * 0.15;
    if (i % 2 === 0)
      cylinder(
        g,
        '#927252',
        0.027,
        0.027,
        0.09,
        [Math.cos(angle) * 0.07, height, Math.sin(angle) * 0.045],
        6,
      );
  }
}
