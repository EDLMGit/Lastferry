import * as T from 'three';
import type { Level } from '../levels/level';
import { islandCenter, shoreContour, shoreTop } from './shore';

export const seabedHeightRange = new T.Vector2(-2.2, 0.72);

export function prepareContour(points: T.Vector2[]) {
  const segments = points.map((a, i) => {
    const b = points[(i + 1) % points.length],
      dx = b.x - a.x,
      dz = b.y - a.y;
    return {
      x: a.x,
      z: a.y,
      dx,
      dz,
      inverseLength: 1 / Math.max(1e-9, dx * dx + dz * dz),
      minX: Math.min(a.x, b.x),
      maxX: Math.max(a.x, b.x),
      minZ: Math.min(a.y, b.y),
      maxZ: Math.max(a.y, b.y),
    };
  });
  const bounds = new T.Box2().setFromPoints(points);
  return {
    bounds,
    sample(x: number, z: number) {
      let squared = Infinity,
        land = false;
      for (const s of segments) {
        const px = x - s.x,
          pz = z - s.z;
        if (z >= s.minZ && z < s.maxZ && x < s.x + (s.dx * pz) / s.dz) land = !land;
        const bx = Math.max(s.minX - x, 0, x - s.maxX),
          bz = Math.max(s.minZ - z, 0, z - s.maxZ);
        if (bx * bx + bz * bz >= squared) continue;
        const t = Math.max(0, Math.min(1, (px * s.dx + pz * s.dz) * s.inverseLength));
        const qx = px - s.dx * t,
          qz = pz - s.dz * t;
        squared = Math.min(squared, qx * qx + qz * qz);
      }
      return { distance: Math.sqrt(squared), land };
    },
  };
}

const blend = (value: number) => value * value * (3 - 2 * value);
const smooth = T.MathUtils.smoothstep;
const hash = (x: number, z: number) => {
  let value = Math.imul(x, 374761393) + Math.imul(z, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
};
function noise(x: number, z: number) {
  const ix = Math.floor(x),
    iz = Math.floor(z),
    fx = blend(x - ix),
    fz = blend(z - iz);
  return T.MathUtils.lerp(
    T.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), fx),
    T.MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), fx),
    fz,
  );
}

export function createSeabedField(level: Level, bounds: T.Vector4, size = 256) {
  const coasts = level.world.islands.map((island, i) => {
    const points = shoreContour(island, 0.98);
    return {
      points,
      contour: prepareContour(points),
      top: shoreTop(island),
      center: islandCenter(island),
      sandy: island.elevation === 1,
      phase: i * 1.7,
    };
  });
  const patches = coasts.flatMap((coast, i) => {
    const front = coast.points.reduce((a, b) => (a.y > b.y ? a : b));
    const side = coast.points.reduce((a, b) => (a.x > b.x ? a : b));
    const placements = coast.sandy
      ? [
          { x: front.x - 0.48, z: front.y + 0.4, rx: 1.15, rz: 0.38, turn: -0.52, rock: false },
          { x: side.x - 0.32, z: side.y + 0.28, rx: 0.72, rz: 0.34, turn: 0.65, rock: true },
          {
            x: coast.center.x - 0.45,
            z: coast.center.y + 0.15,
            rx: 0.8,
            rz: 0.3,
            turn: -0.3,
            rock: true,
          },
        ]
      : [
          {
            x: front.x + (i % 2 ? 0.45 : -0.5),
            z: front.y + 0.35,
            rx: 0.8,
            rz: 0.29,
            turn: i % 2 ? 0.35 : -0.48,
            rock: i % 2 === 1,
          },
          { x: side.x + 0.18, z: side.y + 0.25, rx: 0.6, rz: 0.27, turn: 0.85, rock: true },
        ];
    return placements.map((patch) => ({
      ...patch,
      cosine: Math.cos(patch.turn),
      sine: Math.sin(patch.turn),
    }));
  });
  const sand = new T.Color('#c7bb91'),
    ground = new T.Color('#7b9284'),
    stone = new T.Color('#536b67');
  const color = new T.Color(),
    data = new Uint8Array(size * size * 4);
  let minimumHeight = Infinity,
    maximumHeight = -Infinity;
  const sampleAuthored = (x: number, z: number) => {
    let height = seabedHeightRange.x,
      shoreDistance = Infinity,
      landColor = 0,
      groundStone = 0;
    const broad = noise(x * 1.15, z * 1.15);
    for (const coast of coasts) {
      const box = coast.contour.bounds;
      if (x < box.min.x - 2.5 || x > box.max.x + 2.5 || z < box.min.y - 2.5 || z > box.max.y + 2.5)
        continue;
      const { distance, land } = coast.contour.sample(x, z);
      shoreDistance = Math.min(shoreDistance, distance);
      const dx = x - coast.center.x,
        dz = z - coast.center.y;
      const pocket = smooth(dz - dx * 0.45, -0.3, 1.1);
      const width = 0.1 + pocket * (coast.sandy ? 0.28 : 0.17) + broad * 0.1;
      const outside = Math.max(0, distance - width);
      const candidate = land
        ? T.MathUtils.lerp(-0.025, coast.top, smooth(distance, 0, 0.3))
        : -0.025 - distance * 0.8 - outside * outside * 2;
      height = Math.max(height, candidate);
      if (land) {
        const interior = smooth(distance, 0.04, 0.3);
        const sweep = smooth(dz + dx * 0.42 + (broad - 0.5) * 0.6, -0.45, 0.55);
        landColor = Math.max(
          landColor,
          interior * (coast.sandy ? 0.36 + sweep * 0.58 : 0.18 + sweep * 0.4),
        );
        groundStone = Math.max(groundStone, interior * (1 - sweep) * (coast.sandy ? 0.28 : 0.48));
      }
    }
    let sandForm = 0,
      rockForm = 0,
      facet = 0;
    for (const patch of patches) {
      const dx = x - patch.x,
        dz = z - patch.z;
      if (Math.abs(dx) > patch.rx + patch.rz || Math.abs(dz) > patch.rx + patch.rz) continue;
      const qx = (patch.cosine * dx + patch.sine * dz) / patch.rx;
      const qz = (-patch.sine * dx + patch.cosine * dz) / patch.rz;
      const edge = patch.rock
        ? Math.max(Math.abs(qx) * 0.88 + Math.abs(qz) * 0.35, Math.abs(qz) + qx * 0.16)
        : Math.abs(qz + qx * qx * 0.24) / Math.max(0.25, 0.85 - qx * 0.32) +
          Math.pow(Math.abs(qx), 4) * 0.48;
      const form = 1 - smooth(edge + (broad - 0.5) * 0.12, 0.7, 1.02);
      if (patch.rock) {
        rockForm = Math.max(rockForm, form);
        facet = Math.max(facet, form * smooth(qz + qx * 0.45, -0.1, 0.15));
      } else sandForm = Math.max(sandForm, form);
    }
    if (height < -0.025) height = Math.min(-0.04, height + sandForm * 0.13 + rockForm * 0.12);
    height = T.MathUtils.clamp(height, seabedHeightRange.x, seabedHeightRange.y);
    color
      .copy(ground)
      .lerp(sand, Math.max(landColor, sandForm * 0.72))
      .lerp(stone, Math.max(groundStone, rockForm * 0.92));
    color.multiplyScalar(0.86 + broad * 0.16 + noise(x * 3, z * 3) * 0.025 + facet * 0.16);
    return {
      height,
      color: color.toArray() as [number, number, number],
      shoreDistance,
      sandForm,
      rockForm,
    };
  };
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const sample = sampleAuthored(
        bounds.x + ((i + 0.5) / size) * bounds.z,
        bounds.y + ((j + 0.5) / size) * bounds.w,
      );
      const index = (j * size + i) * 4;
      data[index] = Math.round(T.MathUtils.clamp(sample.color[0], 0, 1) * 255);
      data[index + 1] = Math.round(T.MathUtils.clamp(sample.color[1], 0, 1) * 255);
      data[index + 2] = Math.round(T.MathUtils.clamp(sample.color[2], 0, 1) * 255);
      data[index + 3] = Math.round(
        ((sample.height - seabedHeightRange.x) / (seabedHeightRange.y - seabedHeightRange.x)) * 255,
      );
      minimumHeight = Math.min(minimumHeight, sample.height);
      maximumHeight = Math.max(maximumHeight, sample.height);
    }
  const texture = new T.DataTexture(data, size, size, T.RGBAFormat);
  texture.colorSpace = T.NoColorSpace;
  texture.magFilter = T.LinearFilter;
  texture.minFilter = T.LinearFilter;
  texture.needsUpdate = true;
  return {
    texture,
    bounds: bounds.clone(),
    heightRange: seabedHeightRange.clone(),
    bytes: data.byteLength,
    minimumHeight,
    maximumHeight,
    patches,
    sampleAuthored,
  };
}
