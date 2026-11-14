import { smallFerryProfile, wideHullOutline, type FerryProfile } from './ferry-profile.ts';
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
export function ferry(profile: FerryProfile = smallFerryProfile) {
  if (profile.id === 'six-space') return wideFerry(profile);
  const g = new T.Group();
  g.name = 'ferry-hull-and-deck';
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
    if (y < 0) m.name = 'water-contact-hull';
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
    for (const z of [-0.55, -0.35, 0.65])
      cylinder(g, '#f5d179', 0.024, 0.024, 0.24, [x, 0.38, z], 8);
    box(g, '#f5d179', [0.034, 0.035, 0.24], [x, 0.5, -0.46], 0.01);
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
function wideFerry(profile: FerryProfile) {
  const group = new T.Group();
  group.name = 'ferry-six-space-hull-and-deck';
  const outline = wideHullOutline();
  const rim = outline.getSpacedPoints(64).slice(0, -1);
  function sheer(z: number) {
    return 0.09 * Math.max(0, (z - 0.6) / 1.38) ** 2 + 0.035 * Math.max(0, -z - 0.75) ** 2;
  }
  function shell(lower: number, upper: number, lowWidth: number, highWidth: number, lowLength: number, highLength: number, color: string) {
    const vertices: number[] = [];
    const point = (p: T.Vector2, width: number, length: number, y: number) =>
      [p.x * width, y + sheer(p.y), p.y * length];
    for (let i = 0; i < rim.length; i++) {
      const a = rim[i], b = rim[(i + 1) % rim.length];
      const a0 = point(a, lowWidth, lowLength, lower), b0 = point(b, lowWidth, lowLength, lower);
      const a1 = point(a, highWidth, highLength, upper), b1 = point(b, highWidth, highLength, upper);
      vertices.push(...a0, ...b0, ...a1, ...b0, ...b1, ...a1);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const skin = mesh(geometry, color, group);
    skin.name = 'water-contact-hull';
    return skin;
  }
  shell(-0.34, -0.115, 0.39, 0.72, 0.76, 0.89, '#734835');
  shell(-0.115, 0.045, 0.72, 0.89, 0.89, 0.96, '#aa672f');
  shell(0.045, 0.32, 0.89, 1, 0.96, 1, '#e6ac38');
  shell(0.32, 0.384, 1, 1.025, 1, 1.015, '#f6dc9b');
  shell(0.384, 0.62, 1.025, 1.02, 1.015, 1.01, '#e3a632');
  shell(0.62, 0.635, 1.02, 0.94, 1.01, 0.94, '#ffcf72');
  function deckSurface(sx: number, sz: number, y: number, color: string) {
    const surface = new T.ShapeGeometry(outline, 36);
    surface.rotateX(Math.PI / 2);
    surface.scale(sx, 1, sz);
    const object = mesh(surface, color, group, 0, y, 0);
    object.material = new T.MeshStandardMaterial({ color, roughness: 0.9, side: T.DoubleSide });
    return object;
  }
  deckSurface(1.017, 1.008, profile.deckY - 0.009, '#edbb60');
  deckSurface(0.90, 0.90, profile.deckY, '#ceaa73').name = 'passenger-deck';
  const forecap = new T.Shape();
  forecap.moveTo(-0.57, 1.64);
  forecap.quadraticCurveTo(-0.42, 1.86, 0, 1.975);
  forecap.quadraticCurveTo(0.42, 1.86, 0.57, 1.64);
  forecap.quadraticCurveTo(0, 1.73, -0.57, 1.64);
  const capGeometry = new T.ExtrudeGeometry(forecap, {depth:0.046, bevelEnabled:true, bevelSize:0.018, bevelThickness:0.014, bevelSegments:2, curveSegments:12});
  capGeometry.rotateX(Math.PI/2);
  mesh(capGeometry,'#f2c670',group,0,profile.deckY+0.073,0);
  cylinder(group,'#655947',0.039,0.046,0.086,[0,profile.deckY+0.133,1.83],8);
  for (let row = 0; row < 8; row++) {
    const z = -0.86 + 0.32 * row;
    const width = z > 1.25 ? 0.96 : z > 0.95 ? 1.22 : 1.4;
    const join = box(group, '#b58b59', [width, 0.008, 0.012], [0, profile.deckY + 0.009, z], 0.002);
    join.castShadow = false;
  }
  const cabin = box(group, '#b85342', [1.23, 0.96, 0.70], [0, 1.097, -1.408], 0.105);
  cabin.name = 'wide-cabin-obstacle';
  box(group, '#e7c58f', [1.235, 0.065, 0.704], [0, 0.924, -1.408], 0.025);
  const gable = new T.Shape();
  gable.moveTo(-0.704, 0);
  gable.quadraticCurveTo(-0.72, 0.04, -0.68, 0.082);
  gable.quadraticCurveTo(0, 0.34, 0.68, 0.082);
  gable.quadraticCurveTo(0.72, 0.04, 0.704, 0);
  gable.lineTo(-0.704, 0);
  const roofGeometry = new T.ExtrudeGeometry(gable, { depth: 1.01, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.025, bevelSegments: 2, curveSegments: 14 });
  const roof = mesh(roofGeometry, '#bb5340', group, 0, 1.564, -1.83);
  roof.name = 'wide-cabin-roof';
  const ridge = box(group, '#cc694d', [0.06,0.04,1.00], [0,1.772,-1.325],0.014);
  ridge.name = 'wheelhouse-ridge';
  for (const side of [-1, 1]) {
    box(group, '#f6dc9a', [0.036, 0.43, 0.52], [side * 0.616, 1.244, -1.39], 0.027);
    box(group, '#426163', [0.038, 0.344, 0.428], [side * 0.634, 1.249, -1.39], 0.024);
    box(group, '#e7c37a', [0.041, 0.342, 0.028], [side * 0.64, 1.249, -1.39], 0.008);
    box(group, '#f5d79c', [0.395, 0.37, 0.03], [side * 0.225, 1.244, -1.052], 0.025);
    box(group, '#4f7170', [0.317, 0.28, 0.032], [side * 0.225, 1.249, -1.043], 0.021);
    for (const [start, end, x] of [[-1.40, -0.97, 0.86], [1.03, 1.24, 0.835]]) {
      for (const z of [start, end]) {
        const post = cylinder(group, '#e9bd70', 0.025, 0.031, 0.2, [side * x, 0.722, z], 8);
        post.name = 'wide-rail-obstacle';
      }
      const rail = box(group, '#f3d295', [0.046, 0.044, end - start], [side * x, 0.822, (start + end)/2], 0.015);
      rail.name = 'wide-rail-obstacle';
    }
    for (const z of [-0.94, 0.73]) {
      const fender = mesh(new T.TorusGeometry(0.1, 0.036, 7, 16), '#304448', group, side * 0.89, 0.33, z);
      fender.rotation.y = Math.PI/2;
    }
  }
  cylinder(group, '#36494a', 0.07, 0.086, 0.32, [0.25, 1.81, -1.57]);
  cylinder(group, '#eee2bc', 0.083, 0.085, 0.062, [0.25, 1.915, -1.57]);
  cylinder(group, '#534b42', 0.101, 0.101, 0.044, [0.25, 1.96, -1.57]);
  for (const side of [-1, 1]) {
    const ring = mesh(new T.TorusGeometry(0.102, 0.034, 8, 20), '#f4e8c8', group, side * 0.619, 0.81, -1.42);
    ring.rotation.y = Math.PI/2;
  }
  cylinder(group, '#70513b', 0.014, 0.014, 0.34, [-0.25, 1.79, -1.26], 8);
  box(group, '#f4cf72', [0.17, 0.09, 0.015], [-0.17, 1.91, -1.26], 0.014).rotation.z = -0.12;
  group.userData.ferryProfile = profile.id;
  return group;
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
  } else if (species === 'deer') {
    const coat = '#b86f43', flank = '#c88955', cream = '#f3d8a6', hoof = '#594439';
    for (const side of [-1, 1]) {
      for (const fore of [-1, 1]) {
        const x = side * 0.118, z = fore * 0.155;
        ball(g, coat, [x, 0.17, z], [0.052, 0.135, 0.054]);
        ball(g, hoof, [x, 0.04, z + 0.012], [0.052, 0.04, 0.069]).name = 'deer-hoof';
      }
    }
    ball(g, coat, [0, 0.332, -0.025], [0.195, 0.173, 0.25]);
    ball(g, flank, [0, 0.374, -0.115], [0.186, 0.148, 0.16]);
    const tail = ball(g, cream, [0, 0.409, -0.242], [0.062, 0.091, 0.065]);
    tail.rotation.x = -0.55;
    const neck = ball(g, coat, [0, 0.478, 0.12], [0.134, 0.202, 0.139]);
    neck.rotation.x = 0.24;
    ball(g, cream, [0, 0.475, 0.222], [0.088, 0.157, 0.053]);
    ball(g, flank, [0, 0.637, 0.157], [0.164, 0.153, 0.159]);
    ball(g, cream, [0, 0.592, 0.272], [0.111, 0.080, 0.098]);
    ball(g, '#483b34', [0, 0.622, 0.352], [0.064, 0.042, 0.035]);
    for (const side of [-1, 1]) {
      const ear = ball(g, coat, [side * 0.165, 0.73, 0.128], [0.064, 0.115, 0.055]);
      ear.rotation.z = -side * 0.88;
      const inner = ball(g, '#dfad86', [side * 0.166, 0.735, 0.158], [0.04, 0.081, 0.029]);
      inner.rotation.z = ear.rotation.z;
      ball(g, '#303736', [side * 0.11, 0.661, 0.267], [0.029, 0.034, 0.02]);
      ball(g, '#fff0cf', [side * 0.107, 0.673, 0.283], [0.008, 0.008, 0.005]);
      for (const [y, z] of [[0.398, -0.14], [0.417, -0.048], [0.36, -0.095]])
        ball(g, cream, [side * 0.168, y, z], [0.019, 0.023, 0.029]);
      const antler = new T.Group();
      antler.name = 'deer-antler';
      g.add(antler);
      const base = new T.Vector3(side * 0.087, 0.753, 0.128);
      const fork = new T.Vector3(side * 0.131, 0.837, 0.104);
      const tips = [new T.Vector3(side * 0.19, 0.915, 0.069), new T.Vector3(side * 0.119, 0.903, 0.148)];
      for (const [from, to, bottom, top] of [[base, fork, 0.031, 0.028], ...tips.map(tip => [fork, tip, 0.027, 0.017])] as [T.Vector3,T.Vector3,number,number][]) {
        const direction = to.clone().sub(from);
        const segment = cylinder(antler, '#765236', top, bottom, direction.length(), from.clone().lerp(to, 0.5).toArray(), 8);
        segment.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
        ball(antler, '#765236', to.toArray(), [top, top, top]);
      }
    }
  } else if (species === 'beaver') {
    const fur = '#8e6848',
      muzzle = '#c3a47a',
      tailColor = '#5b4438';
    const tail = new T.Group();
    tail.name = 'beaver-flat-tail';
    tail.position.set(0.1, 0.18, 0.02);
    tail.rotation.x = -0.6;
    tail.rotation.y = 0.35;
    g.add(tail);
    ball(tail, tailColor, [0, 0.01, -0.065], [0.16, 0.035, 0.12]);
    for (const x of [-0.06, 0.06]) {
      const seam = box(tail, '#765747', [0.008, 0.008, 0.12], [x, 0.044, -0.065], 0.003);
      seam.rotation.y = x > 0 ? -0.24 : 0.24;
    }
    for (const x of [-0.115, 0.115]) ball(g, '#684b37', [x, 0.045, 0.045], [0.075, 0.045, 0.1]);
    ball(g, fur, [0, 0.245, 0], [0.19, 0.23, 0.17]);
    ball(g, muzzle, [0, 0.235, 0.13], [0.125, 0.145, 0.055]);
    ball(g, fur, [0, 0.45, 0.045], [0.185, 0.155, 0.15]);
    for (const x of [-0.145, 0.145]) {
      ball(g, fur, [x, 0.565, 0.025], [0.06, 0.065, 0.045]);
      ball(g, '#b18a64', [x, 0.57, 0.062], [0.035, 0.038, 0.012]);
      const paw = ball(g, fur, [x, 0.26, 0.14], [0.06, 0.1, 0.065]);
      paw.rotation.z = x > 0 ? 0.35 : -0.35;
      ball(g, '#263d43', [x * 0.56, 0.475, 0.177], [0.019, 0.022, 0.013]);
    }
    for (const x of [-0.058, 0.058]) ball(g, muzzle, [x, 0.407, 0.178], [0.075, 0.055, 0.045]);
    ball(g, '#3f352d', [0, 0.44, 0.212], [0.057, 0.035, 0.024]);
    for (const x of [-0.018, 0.018])
      box(g, '#f3e4bf', [0.03, 0.033, 0.014], [x, 0.366, 0.202], 0.005);
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
  const tower = cylinder(g, '#eee3c6', 0.38, 0.62, 2.15, [0, 1.16, 0], 20);
  tower.material = (tower.material as T.MeshStandardMaterial).clone();
  tower.material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 lanternSurface;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nlanternSurface=position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 lanternSurface;')
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\nfloat lanternSpill=smoothstep(.55,1.,lanternSurface.y)*smoothstep(-.05,.38,lanternSurface.z);diffuseColor.rgb*=mix(vec3(1.),vec3(1.1,.95,.72),lanternSpill*.5);',
      );
  };
  tower.material.customProgramCacheKey = () => 'lantern-upper-spill-1';
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
  const gallery = cylinder(g, '#b7a580', 0.6, 0.6, 0.12, [0, 2.26, 0]);
  gallery.material = (gallery.material as T.MeshStandardMaterial).clone();
  gallery.material.emissive.set('#c68a3e');
  gallery.material.emissiveIntensity = 0.1;
  const lens = cylinder(g, '#e6a44f', 0.355, 0.355, 0.59, [0, 2.6, 0], 16);
  lens.name = 'home-lens';
  lens.material = (lens.material as T.MeshStandardMaterial).clone();
  lens.material.emissive.set('#ffd391');
  lens.material.emissiveIntensity = 0.72;
  lens.material.roughness = 0.55;
  const core = cylinder(g, '#ffe8b6', 0.125, 0.125, 0.34, [0, 2.51, 0.32], 12);
  core.name = 'lantern-core';
  core.material = (core.material as T.MeshStandardMaterial).clone();
  core.material.emissive.set('#ffe1a0');
  core.material.emissiveIntensity = 1.1;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    cylinder(g, '#665441', 0.025, 0.025, 0.66, [Math.sin(a) * 0.4, 2.6, Math.cos(a) * 0.4], 6);
    cylinder(g, '#8b7050', 0.017, 0.017, 0.24, [Math.sin(a) * 0.58, 2.43, Math.cos(a) * 0.58], 6);
  }
  const ring = mesh(new T.TorusGeometry(0.59, 0.025, 6, 32), '#8b7050', g, 0, 2.55, 0);
  ring.rotation.x = Math.PI / 2;
  const roof = mesh(new T.ConeGeometry(0.61, 0.4, 16), palette.red, g, 0, 3.18, 0);
  roof.material = (roof.material as T.MeshStandardMaterial).clone();
  roof.material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float lanternUnderside;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nlanternUnderside=step(.8,-normal.y);',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float lanternUnderside;')
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.58,.34,.12),lanternUnderside*.7);',
      );
  };
  roof.material.customProgramCacheKey = () => 'lantern-roof-spill-1';
  cylinder(g, palette.red, 0.065, 0.07, 0.23, [0, 3.4, 0]);
  const lamp = new T.PointLight('#ffbf62', 2.5, 3.4, 2);
  lamp.position.set(0, 2.54, 0.45);
  g.add(lamp);
  return { group: g, lens, lamp, anchor: lamp, core, tower, gallery, roof };
}
