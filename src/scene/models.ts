import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const palette = {
  wool: '#fff1d7',
  hull: '#e5ad37',
  red: '#b94e3f',
  wood: '#ac784b',
  dark: '#263d43',
  sand: '#e5d4a8',
  grass: '#91a578',
  stone: '#84938a',
};
const materials = new Map<string, T.MeshStandardMaterial>();
export function mat(color: string) {
  if (!materials.has(color))
    materials.set(color, new T.MeshStandardMaterial({ color, roughness: 0.88 }));
  return materials.get(color)!;
}
export function mesh(g: T.BufferGeometry, color: string, parent: T.Object3D, x = 0, y = 0, z = 0) {
  const m = new T.Mesh(g, mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function box(
  parent: T.Object3D,
  color: string,
  size: number[],
  pos: number[],
  radius = 0.035,
) {
  return mesh(
    new RoundedBoxGeometry(size[0], size[1], size[2], 2, radius),
    color,
    parent,
    ...(pos as [number, number, number]),
  );
}
export function ball(parent: T.Object3D, color: string, pos: number[], scale: number[]) {
  const m = mesh(
    new T.SphereGeometry(1, 12, 8),
    color,
    parent,
    ...(pos as [number, number, number]),
  );
  m.scale.set(...(scale as [number, number, number]));
  return m;
}
export function cylinder(
  parent: T.Object3D,
  color: string,
  top: number,
  bottom: number,
  height: number,
  pos: number[],
  sides = 16,
) {
  return mesh(
    new T.CylinderGeometry(top, bottom, height, sides),
    color,
    parent,
    ...(pos as [number, number, number]),
  );
}
export function ferry() {
  const g = new T.Group();
  g.name = 'ferry-hull-and-deck';
  // Curved, tapered bow; bevels form a painted gunwale above the darker keel.
  const hull = new T.Shape();
  hull.moveTo(-0.43, -0.76);
  hull.quadraticCurveTo(-0.51, 0.25, -0.32, 0.72);
  hull.quadraticCurveTo(0, 1.04, 0.32, 0.72);
  hull.quadraticCurveTo(0.51, 0.25, 0.43, -0.76);
  hull.quadraticCurveTo(0, -0.89, -0.43, -0.76);
  function layer(depth: number, y: number, color: string, scale: number) {
    const geo = new T.ExtrudeGeometry(hull, {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.035,
      curveSegments: 20,
    });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, depth, 0);
    const m = mesh(geo, color, g, 0, y, 0);
    m.scale.set(scale, 1, scale);
  }
  layer(0.18, -0.19, '#824b35', 0.94);
  layer(0.26, -0.1, palette.hull, 1);
  layer(0.055, 0.17, '#f9d477', 1.03);
  layer(0.02, 0.225, '#be8a4e', 0.87);
  for (let i = 0; i < 7; i++)
    box(g, '#e0ac68', [0.68, 0.015, 0.018], [0, 0.25, -0.63 + i * 0.2], 0.006);
  box(g, palette.red, [0.7, 0.57, 0.54], [0, 0.51, -0.47], 0.05);
  box(g, '#df7557', [0.86, 0.1, 0.69], [0, 0.84, -0.47], 0.035);
  box(g, '#f4ca70', [0.46, 0.32, 0.02], [0, 0.56, -0.185], 0.02);
  for (const x of [-0.36, 0.36]) {
    box(g, '#f2c979', [0.018, 0.28, 0.3], [x, 0.58, -0.45], 0.01);
    box(g, '#684c36', [0.02, 0.32, 0.025], [x, 0.56, -0.45]);
  }
  box(g, '#6d543d', [0.028, 0.35, 0.023], [0, 0.56, -0.17]);
  cylinder(g, '#3a4a49', 0.065, 0.07, 0.45, [0.2, 0.99, -0.63]);
  cylinder(g, '#d5c9ab', 0.09, 0.09, 0.055, [0.2, 1.23, -0.63]);
  for (const x of [-0.46, 0.46]) {
    for (const z of [-0.55, 0.05, 0.6]) cylinder(g, '#f5d179', 0.024, 0.024, 0.24, [x, 0.38, z], 8);
    box(g, '#f5d179', [0.034, 0.035, 1.24], [x, 0.5, 0.04], 0.01);
  }
  for (const x of [-0.49, 0.49])
    for (const z of [-0.45, 0.45]) {
      const t = mesh(new T.TorusGeometry(0.105, 0.035, 7, 16), '#2c4248', g, x, 0.14, z);
      t.rotation.y = Math.PI / 2;
    }
  const life = mesh(new T.TorusGeometry(0.12, 0.032, 8, 20), palette.wool, g, -0.49, 0.51, -0.48);
  life.rotation.y = Math.PI / 2;
  cylinder(g, '#70513b', 0.014, 0.014, 0.47, [0, 1.05, -0.4], 8);
  const flag = box(g, '#f4d59b', [0.18, 0.1, 0.014], [0.08, 1.22, -0.4], 0.01);
  flag.rotation.z = -0.12;
  return g;
}
export function animal(species: string, variant = 0) {
  const g = new T.Group();
  g.name = species;
  const wool = variant ? '#b78d6c' : palette.wool;
  if (species === 'rabbit') {
    ball(g, wool, [0, 0.2, 0], [0.14, 0.2, 0.13]);
    ball(g, wool, [0, 0.4, 0.04], [0.135, 0.13, 0.12]);
    for (const x of [-0.085, 0.085]) {
      const ear = ball(g, wool, [x, 0.6, 0.04], [0.05, 0.19, 0.045]);
      ear.rotation.z = x * (variant ? 3 : 1.5);
      ball(g, '#d8a996', [x, 0.62, 0.079], [0.022, 0.11, 0.012]);
    }
    for (const x of [-0.075, 0.075]) {
      ball(g, wool, [x, 0.055, 0.07], [0.065, 0.05, 0.1]);
      ball(g, '#293e40', [x, 0.425, 0.137], [0.017, 0.02, 0.012]);
    }
    ball(g, '#ba7b6b', [0, 0.38, 0.16], [0.025, 0.018, 0.02]);
    ball(g, wool, [0, 0.18, -0.13], [0.065, 0.065, 0.065]);
  } else {
    for (const x of [-0.12, 0.12])
      for (const z of [-0.15, 0.15]) cylinder(g, '#5d6258', 0.037, 0.03, 0.16, [x, 0.08, z], 8);
    ball(g, palette.wool, [0, 0.3, 0], [0.24, 0.23, 0.3]);
    for (let i = 0; i < 18; i++) {
      const a = i * 2.4,
        y = 0.3 + Math.sin(i * 1.7) * 0.13;
      ball(
        g,
        i % 3 ? '#f5e7ce' : '#e7d8b8',
        [Math.cos(a) * 0.18, y, Math.sin(a) * 0.23],
        [0.11, 0.12, 0.11],
      );
    }
    ball(g, '#414d49', [0, 0.34, 0.29], [0.14, 0.16, 0.13]);
    for (const x of [-0.16, 0.16]) {
      ball(g, '#414d49', [x, 0.42, 0.23], [0.1, 0.045, 0.06]);
      ball(g, '#273d3f', [x * 0.48, 0.38, 0.4], [0.018, 0.023, 0.012]);
    }
    ball(g, palette.wool, [0, 0.48, 0.25], [0.12, 0.08, 0.1]);
  }
  return g;
}
export function pine(parent: T.Object3D, x: number, y: number, z: number, s: number) {
  const g = new T.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(s);
  parent.add(g);
  cylinder(g, '#79674b', 0.06, 0.1, 0.9, [0, 0.45, 0], 7);
  for (let i = 0; i < 4; i++) {
    const m = mesh(
      new T.ConeGeometry(0.52 - i * 0.09, 0.85, 7),
      ['#526e50', '#617e56', '#72915d', '#839d65'][i],
      g,
      0,
      0.65 + i * 0.32,
      0,
    );
    m.rotation.y = i * 0.6;
  }
}
export function lighthouse(parent: T.Object3D, x: number, y: number, z: number) {
  const g = new T.Group();
  g.name = 'lighthouse';
  g.position.set(x, y, z);
  parent.add(g);
  cylinder(g, '#b3b09b', 0.68, 0.8, 0.15, [0, 0.075, 0]);
  cylinder(g, '#eee3c6', 0.38, 0.62, 2.15, [0, 1.16, 0], 20);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3;
    box(
      g,
      '#cec7ae',
      [0.17, 0.11, 0.025],
      [Math.cos(a) * (0.58 - i * 0.025), 0.3 + i * 0.33, Math.sin(a) * (0.58 - i * 0.025)],
    );
  }
  box(g, '#765d44', [0.25, 0.48, 0.08], [0, 0.38, 0.56], 0.1);
  box(g, '#f0be63', [0.16, 0.28, 0.035], [0.12, 1.48, 0.445], 0.06);
  cylinder(g, '#a69b7c', 0.64, 0.64, 0.12, [0, 2.26, 0]);
  cylinder(g, '#f9cb70', 0.36, 0.36, 0.56, [0, 2.6, 0], 12);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    cylinder(g, '#705b43', 0.025, 0.025, 0.62, [Math.sin(a) * 0.4, 2.6, Math.cos(a) * 0.4], 6);
    cylinder(g, '#8b7050', 0.017, 0.017, 0.24, [Math.sin(a) * 0.58, 2.43, Math.cos(a) * 0.58], 6);
  }
  const ring = mesh(new T.TorusGeometry(0.59, 0.025, 6, 32), '#8b7050', g, 0, 2.55, 0);
  ring.rotation.x = Math.PI / 2;
  mesh(new T.ConeGeometry(0.66, 0.45, 16), palette.red, g, 0, 3.1, 0);
  cylinder(g, palette.red, 0.065, 0.07, 0.23, [0, 3.4, 0]);
  const lamp = new T.PointLight('#ffbf62', 2.5, 6, 2);
  lamp.position.y = 2.6;
  g.add(lamp);
}
