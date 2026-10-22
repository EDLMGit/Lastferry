import * as T from 'three';
import type { Level } from '../levels/level';
import type { CanonicalPath } from './paths';
import { shoreContour } from './shore';
import { createSeabedField } from './seabed';
import { sceneLayout } from './layout';
import { waterVertexShader, waterFragmentShader } from './water-shader';

export type WaterTuning = {
  deepColor: string;
  shallowColor: string;
  pearlColor: string;
  amberColor: string;
  absorption: number;
  normalScale: number;
  normalSpeed: number;
  normalStrength: number;
  sheenWidth: number;
  sheenStrength: number;
  depthStrength: number;
  shallowContrast: number;
  distortion: number;
  warmStrength: number;
  warmWidth: number;
  warmTail: number;
};

export const waterPresets: Record<'luminous' | 'restrained', WaterTuning> = {
  luminous: {
    deepColor: '#123e55',
    shallowColor: '#3e7e88',
    pearlColor: '#bbd8e2',
    amberColor: '#ffbf62',
    absorption: 1.35,
    normalScale: 1,
    normalSpeed: 1,
    normalStrength: 0.095,
    sheenWidth: 4.7,
    sheenStrength: 0.9,
    depthStrength: 1.05,
    shallowContrast: 1,
    distortion: 0.75,
    warmStrength: 0.28,
    warmWidth: 0.24,
    warmTail: 4.5,
  },
  restrained: {
    deepColor: '#153f53',
    shallowColor: '#4d8e91',
    pearlColor: '#b6d2df',
    amberColor: '#ffc673',
    absorption: 1.4,
    normalScale: 0.9,
    normalSpeed: 0.85,
    normalStrength: 0.075,
    sheenWidth: 4.7,
    sheenStrength: 0.72,
    depthStrength: 1.05,
    shallowContrast: 0.8,
    distortion: 0.58,
    warmStrength: 0.22,
    warmWidth: 0.2,
    warmTail: 3.2,
  },
};

const distance = (x: number, z: number, a: T.Vector2, b: T.Vector2) => {
  const dx = b.x - a.x,
    dz = b.y - a.y;
  const t = T.MathUtils.clamp(
    ((x - a.x) * dx + (z - a.y) * dz) / Math.max(1e-9, dx * dx + dz * dz),
    0,
    1,
  );
  return Math.hypot(x - a.x - dx * t, z - a.y - dz * t);
};
function inside(x: number, z: number, points: T.Vector2[]) {
  let odd = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (a.y > z !== b.y > z && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) odd = !odd;
  }
  return odd;
}
export function coastalMask(level: Level, paths: Map<string, CanonicalPath>) {
  const bounds = new T.Box2();
  for (const island of level.world.islands)
    for (const p of island.footprintXZ) bounds.expandByPoint(new T.Vector2(p[0], p[1]));
  for (const path of paths.values())
    for (const p of path.points) bounds.expandByPoint(new T.Vector2(p.x, p.z));
  bounds.expandByScalar(4);
  const coasts = level.world.islands.map((island) => ({
    points: shoreContour(island, 0.98),
    height: island.elevation * 0.18,
  }));
  const shallow = level.edges
    .filter((edge) => edge.baseDepth < 3)
    .flatMap((edge) => {
      const points = paths.get(edge.id)!.points.filter((_, i) => i % 5 === 0);
      const last = paths.get(edge.id)!.points.at(-1)!;
      if (points.at(-1) !== last) points.push(last);
      return points.slice(1).map((b, i) => ({
        a: new T.Vector2(points[i].x, points[i].z),
        b: new T.Vector2(b.x, b.z),
        strength: edge.baseDepth === 1 ? 1 : 0.5,
      }));
    });
  const size = 256,
    data = new Uint8Array(size * size * 4),
    span = bounds.getSize(new T.Vector2());
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const x = bounds.min.x + ((i + 0.5) / size) * span.x,
        z = bounds.min.y + ((j + 0.5) / size) * span.y;
      let bank = 0,
        shore = 0,
        landHeight = 0,
        land = 0,
        nearestCoast = Number.POSITIVE_INFINITY;
      for (const segment of shallow) {
        const d = distance(x, z, segment.a, segment.b);
        const width = 1.2 + 0.3 * Math.sin(x * 0.73 - z * 0.91);
        bank = Math.max(bank, Math.exp(-(d * d) / (width * width)) * segment.strength);
      }
      for (const coast of coasts) {
        const isLand = inside(x, z, coast.points);
        let d = 100;
        for (let k = 0; k < coast.points.length; k++)
          d = Math.min(
            d,
            distance(x, z, coast.points[k], coast.points[(k + 1) % coast.points.length]),
          );
        shore = Math.max(shore, Math.exp(-(d * d) / 1.1));
        if (d < nearestCoast) {
          nearestCoast = d;
          landHeight = coast.height;
        }
        land = Math.max(land, T.MathUtils.smoothstep(isLand ? d : -d, -0.18, 0.18));
      }
      const index = (j * size + i) * 4;
      data[index] = Math.round(bank * 255);
      data[index + 1] = Math.round(shore * 255);
      data[index + 2] = Math.round((landHeight / 0.72) * 255);
      data[index + 3] = Math.round(land * 255);
    }
  const texture = new T.DataTexture(data, size, size, T.RGBAFormat);
  texture.colorSpace = T.NoColorSpace;
  texture.magFilter = T.LinearFilter;
  texture.minFilter = T.LinearFilter;
  texture.needsUpdate = true;
  return {
    texture,
    bounds: new T.Vector4(bounds.min.x, bounds.min.y, span.x, span.y),
    shallowSegments: shallow.length,
  };
}
export class CoastalWater {
  mesh: T.Mesh;
  mask: ReturnType<typeof coastalMask>;
  seabed: ReturnType<typeof createSeabedField>;
  tuning: WaterTuning = { ...waterPresets.luminous };
  disposed = false;
  view = new T.Vector3();
  constructor(level: Level, paths: Map<string, CanonicalPath>) {
    this.mask = coastalMask(level, paths);
    this.seabed = createSeabedField(level, this.mask.bounds);
    const layout = sceneLayout(level.id),
      light = layout.light,
      lighthouse = layout.landmarks.find((landmark) => landmark.kind === 'lighthouse')!,
      island = level.world.islands.find((island) => island.id === lighthouse.islandId)!;
    const material = new T.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterY: { value: 0 },
        coast: { value: this.mask.texture },
        substrate: { value: this.seabed.texture },
        field: { value: this.mask.bounds },
        heightRange: { value: this.seabed.heightRange },
        viewDirection: { value: new T.Vector3(0, 34, 24).normalize() },
        sunDirection: { value: new T.Vector3(...(light?.sunPosition ?? [-8, 16, 7])).normalize() },
        skyColor: { value: new T.Color(light?.sky ?? '#fff1dc') },
        sunColor: { value: new T.Color(light?.sun ?? '#ffe0af') },
        lampPosition: {
          value: new T.Vector3(
            lighthouse.positionXZ[0],
            island.elevation * 0.18 + 2.6,
            lighthouse.positionXZ[1],
          ),
        },
        arrival: { value: 0 },
        sheenCenter: {
          value: level.id === 'bellwater' ? new T.Vector2(0.3, 2.8) : new T.Vector2(0.9, 2.2),
        },
        ...Object.fromEntries(
          Object.entries(this.tuning).map(([name, value]) => [
            name,
            { value: typeof value === 'string' ? new T.Color(value) : value },
          ]),
        ),
      },
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
    });
    this.mesh = new T.Mesh(new T.PlaneGeometry(200, 200), material);
    this.mesh.name = 'coastal-water';
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.userData.excludeFromFrame = true;
  }
  update(waterY: number, time: number) {
    this.mesh.position.y = waterY;
    const material = this.mesh.material as T.ShaderMaterial;
    material.uniforms.waterY.value = waterY;
    material.uniforms.time.value = time;
  }
  setView(camera: T.Camera) {
    camera.getWorldDirection(this.view).negate();
    const material = this.mesh.material as T.ShaderMaterial;
    material.uniforms.viewDirection.value.copy(this.view);
  }
  setHarbor(position: T.Vector3, arrivalIntensity: number) {
    const material = this.mesh.material as T.ShaderMaterial;
    material.uniforms.lampPosition.value.copy(position);
    material.uniforms.arrival.value = arrivalIntensity;
  }
  setLighting(sunDirection: T.Vector3, skyColor?: T.Color, sunColor?: T.Color) {
    const material = this.mesh.material as T.ShaderMaterial;
    material.uniforms.sunDirection.value.copy(sunDirection).normalize();
    if (skyColor) material.uniforms.skyColor.value.copy(skyColor);
    if (sunColor) material.uniforms.sunColor.value.copy(sunColor);
  }
  configure(patch: Partial<WaterTuning>) {
    const material = this.mesh.material as T.ShaderMaterial;
    for (const key of Object.keys(this.tuning) as (keyof WaterTuning)[]) {
      const value = patch[key];
      if (value === undefined) continue;
      if (typeof value === 'string') material.uniforms[key].value.set(value);
      else if (Number.isFinite(value)) material.uniforms[key].value = value;
      else continue;
      Object.assign(this.tuning, { [key]: value });
    }
  }
  presentation() {
    const material = this.mesh.material as T.ShaderMaterial;
    return {
      time: material.uniforms.time.value as number,
      waterY: material.uniforms.waterY.value as number,
      viewDirection: (material.uniforms.viewDirection.value as T.Vector3).toArray(),
      lampPosition: (material.uniforms.lampPosition.value as T.Vector3).toArray(),
      arrival: material.uniforms.arrival.value as number,
      tuning: { ...this.tuning },
      substrate: {
        size: [this.seabed.texture.image.width, this.seabed.texture.image.height],
        heightRange: this.seabed.heightRange.toArray(),
        minimumHeight: this.seabed.minimumHeight,
        maximumHeight: this.seabed.maximumHeight,
        bytes: this.seabed.bytes,
        patchCount: this.seabed.patches.length,
        colorSpace: this.seabed.texture.colorSpace,
      },
      renderPasses: 1,
      reflectionTargets: 0,
      dataBytes: this.seabed.bytes + (this.mask.texture.image.data?.byteLength ?? 0),
      disposed: this.disposed,
    };
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.mesh.geometry.dispose();
    (this.mesh.material as T.ShaderMaterial).dispose();
    this.mask.texture.dispose();
    this.seabed.texture.dispose();
  }
}
