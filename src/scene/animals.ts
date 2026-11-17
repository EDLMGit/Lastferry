import * as T from 'three';

type Triplet = [number, number, number];
type Profile = 'oval' | 'pear' | 'cheek' | 'leaf' | 'bean' | 'fleece' | 'sole' | 'paddle';
type Paint = { color: string; under?: string; inset?: string };

const clay = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 });
const forms = new Map<string, T.BufferGeometry>();
const models = new Map<string, T.Group>();
const smooth = T.MathUtils.smoothstep;

function shaped(x: number, y: number, z: number, profile: Profile) {
  const point = new T.Vector3(x, y, z);
  if (profile === 'pear') {
    point.x *= 1 - 0.23 * y;
    point.z = z * (1 - 0.14 * y) + 0.14 * y;
  } else if (profile === 'cheek') {
    point.x *= 1 - 0.11 * y;
    point.z = z * (1 - 0.11 * y) - 0.08 * y;
  } else if (profile === 'leaf') {
    point.x *= 0.99 - 0.22 * y - 0.15 * y * y;
    point.z = z * (0.94 - 0.19 * y) - 0.17 * y * y;
  } else if (profile === 'bean') {
    point.x *= 1 - 0.17 * y;
    point.z += 0.18 * y * y;
  } else if (profile === 'sole') {
    point.y = y < 0 ? -1 + (1 + y) ** 1.48 : y;
    point.z += 0.11 * (1 - y * y);
  } else if (profile === 'fleece') {
    const ripple = 1 + 0.047 * Math.cos(10.4 * x + 1.2 * z) * Math.cos(10 * y - 1.7 * x) * Math.cos(8 * z + 0.55);
    point.multiplyScalar(ripple);
    point.y += 0.025 * (1 - y * y);
  } else if (profile === 'paddle') {
    point.z *= 1 + 0.12 * x;
  }
  return point;
}

function form(profile: Profile, paint: Paint, rings: number) {
  const key = [profile, paint.color, paint.under, paint.inset, rings].join(':');
  const cached = forms.get(key);
  if (cached) return cached;
  const geometry = new T.SphereGeometry(1, rings, Math.max(6, Math.round(rings * 0.62)));
  const positions = geometry.getAttribute('position'), normals = geometry.getAttribute('normal');
  const surface = new T.Color(paint.color), underside = new T.Color(paint.under ?? paint.color);
  const inset = new T.Color(paint.inset ?? paint.color), colors = [];
  const orient = (point: T.Vector3) => shaped(point.x, point.y, point.z, profile);
  for (let index = 0; index < positions.count; index++) {
    const unit = new T.Vector3().fromBufferAttribute(positions, index);
    const { x, y, z } = unit;
    const tangent = new T.Vector3().crossVectors(Math.abs(y) > 0.9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 1, 0), unit).normalize();
    const across = new T.Vector3().crossVectors(unit, tangent);
    const derivative = (direction: T.Vector3) => orient(unit.clone().addScaledVector(direction, 0.002).normalize())
      .sub(orient(unit.clone().addScaledVector(direction, -0.002).normalize()));
    const normal = derivative(tangent).cross(derivative(across)).normalize();
    const point = orient(unit);
    positions.setXYZ(index, point.x, point.y, point.z);
    normals.setXYZ(index, normal.x, normal.y, normal.z);
    const color = underside.clone().lerp(surface, smooth(y + 0.18 * z, -0.94, 0.3));
    if (paint.inset && z > 0) {
      const edge = (x / 0.57) ** 2 + ((y - 0.06) / 0.77) ** 2;
      color.lerp(inset, 1 - smooth(edge, 0.55, 1.04));
    }
    if (profile === 'paddle') {
      const groove = Math.max(Math.cos(8.4 * (x + z)), Math.cos(8.4 * (x - z)));
      color.multiplyScalar(1 - 0.37 * smooth(Math.abs(y), 0.33, 0.69) * smooth(groove, 0.67, 0.98));
    }
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  forms.set(key, geometry);
  return geometry;
}

function piece(parent: T.Object3D, name: string, color: string | Paint, position: Triplet, scale: Triplet, profile: Profile = 'oval', rings = 14) {
  const object = new T.Mesh(form(profile, typeof color === 'string' ? { color } : color, rings), clay);
  object.name = name;
  object.position.set(...position);
  object.scale.set(...scale);
  object.castShadow = object.receiveShadow = true;
  parent.add(object);
  return object;
}

function eyes(parent: T.Object3D, x: number, y: number, z: number, radius: number, yaw = 0.38, lid = '#ad8668') {
  for (const side of [-1, 1]) {
    const socket = piece(parent, 'soft-eyelid', lid, [side * x, y + radius * 0.08, z - radius * 0.17],
      [radius * 1.19, radius * 1.32, radius * 0.56], 'cheek', 12);
    socket.rotation.y = side * yaw;
    const eye = piece(parent, 'painted-eye', { color: '#423637', under: '#211e26' }, [side * x, y, z],
      [radius, radius * 1.18, radius * 0.58], 'oval', 10);
    eye.rotation.y = side * yaw;
    piece(parent, 'eye-glint', '#fff3d9', [side * (x + radius * 0.11) - radius * 0.21, y + radius * 0.44, z + radius * 0.54],
      [radius * 0.29, radius * 0.30, radius * 0.18], 'oval', 8);
  }
}

function finishEar(ear: T.Mesh) {
  const contour = ear.geometry.clone();
  contour.scale(ear.scale.x, ear.scale.y, ear.scale.z);
  contour.applyQuaternion(ear.quaternion);
  ear.geometry = contour;
  ear.scale.setScalar(1);
  ear.quaternion.identity();
}

function rabbit(root: T.Group, tan: boolean) {
  const coat = tan ? '#bc906d' : '#f5e3c6', cream = tan ? '#e9c69c' : '#fff1d8';
  const shade = tan ? '#ad7d61' : '#d9b995';
  piece(root, 'rabbit-body', { color: coat, under: shade }, [0, 0.202, -0.009], [0.136, 0.193, 0.123], 'pear', 16);
  piece(root, 'rabbit-brush', cream, [0, 0.153, -0.137], [0.063, 0.06, 0.057], 'cheek');
  for (const side of [-1, 1]) {
    piece(root, 'rabbit-foot', { color: coat, under: shade }, [side * 0.074, 0.046, 0.064], [0.063, 0.046, 0.095], 'sole');
    const paw = piece(root, 'rabbit-forepaw', { color: coat, under: cream }, [side * 0.07, 0.211, 0.089], [0.039, 0.071, 0.037], 'bean', 12);
    paw.rotation.z = side * -0.36;
  }
  piece(root, 'rabbit-head', { color: coat, under: shade }, [0, 0.409, 0.038], [0.139, 0.133, 0.119], 'cheek', 20);
  piece(root, 'rabbit-lip', '#b68474', [0, 0.354, 0.152], [0.022, 0.015, 0.01], 'cheek', 10);
  for (const side of [-1, 1]) {
    const ear = piece(root, 'rabbit-ear', { color: coat, under: shade, inset: tan ? '#d59187' : '#df9e98' },
      [side * (tan ? 0.074 : 0.064), 0.613, 0.021], [0.056, side === -1 ? 0.17 : 0.18, 0.038], 'leaf', 20);
    ear.rotation.set(side === -1 ? -0.045 : 0.07, side * 0.12, -side * (tan ? (side === 1 ? 0.39 : 0.29) : (side === 1 ? 0.20 : 0.10)));
    finishEar(ear);
    piece(root, 'rabbit-muzzle', cream, [side * 0.032, 0.37, 0.132], [0.048, 0.037, 0.042], 'cheek', 14);
  }
  eyes(root, 0.069, 0.435, 0.14, 0.025, 0.38, tan ? '#d4ad89' : '#e2c6a3');
  piece(root, 'rabbit-nose', '#ae7063', [0, 0.389, 0.162], [0.024, 0.0165, 0.016], 'bean', 12).rotation.z = Math.PI;
}

function sheep(root: T.Group) {
  const wool = { color: '#fff1d9', under: '#ddc7a7' }, face = { color: '#645c52', under: '#434446' };
  for (const side of [-1, 1]) for (const front of [-1, 1]) {
    piece(root, 'sheep-foot', face, [side * 0.123, 0.063, front * 0.15], [0.043, 0.063, 0.047], 'sole', 12);
  }
  for (const side of [-1, 1]) for (const front of [-1, 1])
    piece(root, 'sheep-shank', { color: '#847969', under: '#625b56' }, [side * 0.122, 0.156, front * 0.147], [0.042, 0.099, 0.043], 'bean', 12);
  piece(root, 'sheep-fleece', wool, [0, 0.312, -0.021], [0.264, 0.218, 0.291], 'fleece', 28);
  piece(root, 'sheep-tail', wool, [0, 0.286, -0.287], [0.081, 0.082, 0.051], 'bean');
  for (const side of [-1, 1]) {
    piece(root, 'sheep-shoulder-lock', wool, [side * 0.147, 0.385, 0.094], [0.104, 0.112, 0.114], 'bean', 14);
    piece(root, 'sheep-haunch-lock', wool, [side * 0.137, 0.362, -0.186], [0.099, 0.112, 0.096], 'cheek', 14);
  }
  const head = new T.Group();
  head.name = 'sheep-head';
  head.position.set(0, 0.351, 0.264);
  root.add(head);
  piece(head, 'sheep-mask', face, [0, -0.002, 0.011], [0.14, 0.145, 0.119], 'cheek', 20);
  piece(head, 'sheep-muzzle', { color: '#827366', under: '#665a54' }, [0, -0.047, 0.093], [0.092, 0.057, 0.055], 'cheek', 16);
  piece(head, 'sheep-nose', '#453e3b', [0, -0.026, 0.139], [0.041, 0.019, 0.014], 'bean', 12).rotation.z = Math.PI;
  eyes(head, 0.073, 0.039, 0.107, 0.026, 0.38, '#867765');
  for (const side of [-1, 1]) {
    const ear = piece(head, 'sheep-ear', { color: '#645c52', under: '#464345', inset: '#a18272' },
      [side * 0.169, 0.063, -0.008], [0.054, 0.101, 0.044], 'leaf', 16);
    ear.rotation.z = -side * 1.92;
    finishEar(ear);
  }
  for (const [x, y, z, size] of [[-0.071, 0.127, 0.009, 0.075], [0.011, 0.146, 0.02, 0.085], [0.083, 0.119, 0.005, 0.066]]) {
    const curl = piece(head, 'sheep-forelock', wool, [x, y, z], [size, size * 0.74, size * 0.95], 'bean', 16);
    curl.rotation.z = 0.3;
  }
}

function beaver(root: T.Group) {
  const coat = { color: '#a47855', under: '#815940' }, muzzle = '#d9b58a', dark = '#72513f';
  const tail = new T.Group();
  tail.name = 'beaver-flat-tail';
  tail.position.set(0.148, 0.192, -0.037);
  tail.rotation.set(-0.74, -0.16, 1.26);
  root.add(tail);
  piece(tail, 'tail-paddle', { color: '#91694f', under: '#775646' }, [0, 0, -0.011], [0.155, 0.031, 0.111], 'paddle', 24);
  for (const side of [-1, 1]) {
    piece(root, 'beaver-foot', dark, [side * 0.113, 0.044, 0.044], [0.072, 0.044, 0.093], 'sole');
  }
  piece(root, 'beaver-body', coat, [0, 0.249, -0.009], [0.181, 0.222, 0.156], 'pear', 18);
  piece(root, 'beaver-bib', muzzle, [0, 0.26, 0.119], [0.107, 0.118, 0.047], 'pear');
  piece(root, 'beaver-head', coat, [0, 0.46, 0.041], [0.177, 0.144, 0.142], 'cheek', 20);
  for (const side of [-1, 1]) {
    piece(root, 'beaver-ear', { color: '#a47855', inset: '#725140' }, [side * 0.14, 0.568, 0.033], [0.055, 0.059, 0.04], 'oval', 16);
    const paw = piece(root, 'beaver-paw', { color: '#986e50', under: dark }, [side * 0.133, 0.259, 0.111], [0.055, 0.083, 0.053], 'bean');
    paw.rotation.z = -side * 0.38;
    piece(root, 'beaver-incisor', '#fff1c9', [side * 0.0185, 0.363, 0.189], [0.017, 0.025, 0.011], 'sole', 10);
    piece(root, 'beaver-cheek', muzzle, [side * 0.056, 0.407, 0.169], [0.07, 0.052, 0.046], 'cheek');
  }
  eyes(root, 0.09, 0.491, 0.164, 0.026, 0.4, '#bc916d');
  piece(root, 'beaver-nose', '#4e3b32', [0, 0.445, 0.204], [0.051, 0.028, 0.03], 'bean', 14).rotation.z = Math.PI;
}

function antlerStem(parent: T.Object3D, points: Triplet[], radii: number[]) {
  const sides = 8, vertices: number[] = [], indices: number[] = [];
  const path = points.map(point => new T.Vector3(...point));
  for (let ring = 0; ring < path.length; ring++) {
    const tangent = path[Math.min(ring + 1, path.length - 1)].clone().sub(path[Math.max(0, ring - 1)]).normalize();
    const across = new T.Vector3().crossVectors(tangent, new T.Vector3(0, 0, 1)).normalize();
    const up = new T.Vector3().crossVectors(tangent, across);
    for (let side = 0; side < sides; side++) {
      const angle = side * Math.PI * 2 / sides;
      vertices.push(...path[ring].clone().addScaledVector(across, Math.cos(angle) * radii[ring]).addScaledVector(up, Math.sin(angle) * radii[ring]).toArray());
      if (ring === 0) continue;
      const a = (ring - 1) * sides + side, b = (ring - 1) * sides + (side + 1) % sides;
      indices.push(a, b, b + sides, a, b + sides, a + sides);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const color = new T.Color('#845e40');
  geometry.setAttribute('color', new T.Float32BufferAttribute(vertices.map((_, index) => color.toArray()[index % 3]), 3));
  const stem = new T.Mesh(geometry, clay);
  stem.castShadow = stem.receiveShadow = true;
  parent.add(stem);
}

function deer(root: T.Group) {
  const coat = { color: '#bd7951', under: '#a16447' }, honey = '#efcfa2', sepia = '#574239';
  for (const side of [-1, 1]) for (const front of [-1, 1]) {
    const x = side * 0.118, z = front * 0.155;
    piece(root, 'deer-leg', coat, [x, 0.176, z], [0.052, 0.143, 0.056], 'bean', 12);
    piece(root, 'deer-hoof', sepia, [x, 0.039, z + 0.011], [0.051, 0.039, 0.064], 'sole', 12);
  }
  piece(root, 'deer-body', coat, [0, 0.336, -0.03], [0.194, 0.17, 0.251], 'oval', 18);
  piece(root, 'deer-tail', honey, [0, 0.407, -0.24], [0.064, 0.084, 0.062], 'leaf').rotation.x = -0.56;
  const neck = piece(root, 'deer-neck', coat, [0, 0.477, 0.104], [0.126, 0.217, 0.122], 'pear', 18);
  neck.rotation.x = 0.20;
  piece(root, 'deer-bib', honey, [0, 0.467, 0.196], [0.082, 0.127, 0.049], 'leaf').rotation.x = 0.25;
  piece(root, 'deer-face', { color: '#c88960', under: '#ac704e' }, [0, 0.645, 0.16], [0.159, 0.143, 0.15], 'cheek', 20);
  piece(root, 'deer-muzzle', { color: '#f6ddb6', under: '#ddbc94' }, [0, 0.594, 0.265], [0.108, 0.073, 0.095], 'cheek', 18);
  piece(root, 'deer-nose', sepia, [0, 0.626, 0.346], [0.052, 0.03, 0.031], 'bean', 14).rotation.z = Math.PI;
  eyes(root, 0.098, 0.669, 0.277, 0.031, 0.42, '#edc599');
  for (const side of [-1, 1]) {
    const ear = piece(root, 'deer-ear', { color: '#c78658', under: '#a6694b', inset: '#f2c8a5' }, [side * 0.163, 0.734, 0.119], [0.064, 0.115, 0.043], 'leaf', 20);
    ear.rotation.set(-0.08, side * 0.12, -side * 0.88);
    finishEar(ear);
    for (const [y, z] of [[0.388, -0.145], [0.424, -0.059], [0.37, -0.077]]) {
      const breadth = 0.194 * Math.sqrt(1 - ((y - 0.336) / 0.17) ** 2 - ((z + 0.03) / 0.251) ** 2);
      piece(root, 'deer-spot', honey, [side * breadth, y, z], [0.009, 0.019, 0.028], 'oval', 10);
    }
    const antler = new T.Group();
    antler.name = 'deer-antler';
    root.add(antler);
    antlerStem(antler, [[side * 0.082, 0.747, 0.126], [side * 0.106, 0.81, 0.107], [side * 0.136, 0.853, 0.089], [side * 0.18, 0.904, 0.067], [side * 0.185, 0.921, 0.065], [side * 0.185, 0.926, 0.065]], [0.028, 0.026, 0.024, 0.016, 0.009, 0]);
    antlerStem(antler, [[side * 0.121, 0.833, 0.099], [side * 0.115, 0.866, 0.129], [side * 0.119, 0.897, 0.148], [side * 0.119, 0.902, 0.15]], [0.022, 0.017, 0.009, 0]);
  }
}

export function animal(species: string, variant = 0) {
  const key = species === 'rabbit' && variant ? 'tan-rabbit' : species;
  const cached = models.get(key);
  if (cached) return cached.clone();
  const root = new T.Group();
  root.name = species;
  if (species === 'rabbit') rabbit(root, variant !== 0);
  else if (species === 'deer') deer(root);
  else if (species === 'beaver') beaver(root);
  else sheep(root);
  models.set(key, root);
  return root.clone();
}
