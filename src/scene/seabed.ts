import * as T from 'three';
import type { Level } from '../levels/level';
import { islandCenter, shoreContour, shoreTop } from './shore';

export const seabedHeightRange = new T.Vector2(-2.2, 0.72);

const hash = (x: number, z: number) => {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const blend = (value: number) => value * value * (3 - 2 * value);
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
function segmentDistance(x: number, z: number, a: T.Vector2, b: T.Vector2) {
  const dx = b.x - a.x,
    dz = b.y - a.y;
  const f = T.MathUtils.clamp(
    ((x - a.x) * dx + (z - a.y) * dz) / Math.max(1e-9, dx * dx + dz * dz),
    0,
    1,
  );
  return Math.hypot(x - a.x - dx * f, z - a.y - dz * f);
}
function inside(x: number, z: number, points: T.Vector2[]) {
  let odd = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (a.y > z !== b.y > z && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) odd = !odd;
  }
  return odd;
}

export function createSeabedField(level: Level, bounds: T.Vector4, size = 256) {
  const coasts = level.world.islands.map((island) => ({
    points: shoreContour(island, 0.98),
    top: shoreTop(island),
    center: islandCenter(island),
  }));
  const patches = coasts.flatMap(({ center }, i) => [
    {
      x: center.x + 0.7,
      z: center.y + 2.2,
      rx: 1.35,
      rz: 0.64,
      turn: -0.28 + i * 0.27,
      rock: false,
    },
    { x: center.x - 1.2, z: center.y + 1.65, rx: 0.6, rz: 0.46, turn: 0.6 + i * 0.41, rock: true },
  ]);
  const sand = new T.Color('#c2bb95'),
    ground = new T.Color('#81978b'),
    stone = new T.Color('#60786f');
  const color = new T.Color(),
    data = new Uint8Array(size * size * 4);
  let minimumHeight = Infinity,
    maximumHeight = -Infinity;
  const sampleAuthored = (x: number, z: number) => {
    let height = seabedHeightRange.x,
      shoreDistance = Infinity,
      landColor = 0;
    for (const coast of coasts) {
      let distance = Infinity;
      for (let k = 0; k < coast.points.length; k++)
        distance = Math.min(
          distance,
          segmentDistance(x, z, coast.points[k], coast.points[(k + 1) % coast.points.length]),
        );
      const land = inside(x, z, coast.points);
      if (land) landColor = Math.max(landColor, T.MathUtils.smoothstep(distance, 0.08, 0.4) * 0.8);
      shoreDistance = Math.min(shoreDistance, distance);
      const candidate = land
        ? T.MathUtils.lerp(-0.025, coast.top, T.MathUtils.smoothstep(distance, 0, 0.3))
        : -0.025 - distance * 0.24 - distance * distance * 0.07;
      height = Math.max(height, candidate);
    }
    let sandForm = 0,
      rockForm = 0;
    for (const patch of patches) {
      const dx = x - patch.x,
        dz = z - patch.z;
      const qx = (Math.cos(patch.turn) * dx + Math.sin(patch.turn) * dz) / patch.rx;
      const qz = (-Math.sin(patch.turn) * dx + Math.cos(patch.turn) * dz) / patch.rz;
      const form = Math.exp(-((qx + Math.sin(qz * 2.7) * 0.18) ** 2 + qz * qz) * 1.8);
      if (patch.rock) rockForm = Math.max(rockForm, form);
      else sandForm = Math.max(sandForm, form);
    }
    const grain = noise(x * 2.5, z * 2.5);
    if (height < -0.025)
      height = Math.min(
        -0.04,
        height + sandForm * 0.065 + rockForm * 0.14 + (noise(x * 0.8, z * 0.8) - 0.5) * 0.025,
      );
    height = T.MathUtils.clamp(height, seabedHeightRange.x, seabedHeightRange.y);
    const rockEdge = T.MathUtils.smoothstep(rockForm, 0.18, 0.8);
    color
      .copy(ground)
      .lerp(sand, Math.max(landColor, sandForm * 0.88))
      .lerp(stone, rockEdge * 0.88);
    const shade = 0.84 + grain * 0.12 + sandForm * 0.1 + rockForm * 0.03;
    color.multiplyScalar(shade);
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
