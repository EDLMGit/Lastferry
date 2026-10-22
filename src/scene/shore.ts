import * as T from 'three';
import type { Level } from '../levels/level';
import type { IslandStyle } from './layout';

type Island = Level['world']['islands'][number];
export const shoreTop = (island: Island) => island.elevation * 0.18 - 0.005;
export function islandCenter(island: Island) {
  const points = island.footprintXZ;
  return new T.Vector2(
    points.reduce((sum, p) => sum + p[0], 0) / points.length,
    points.reduce((sum, p) => sum + p[1], 0) / points.length,
  );
}
export function shoreContour(island: Island, scale = 1) {
  const center = islandCenter(island);
  const points = island.footprintXZ.map(
    ([x, z]) => new T.Vector2(center.x + (x - center.x) * scale, center.y + (z - center.y) * scale),
  );
  const shape = new T.Shape();
  const first = points[0].clone().lerp(points[1], 0.5);
  shape.moveTo(first.x, first.y);
  for (let i = 1; i <= points.length; i++) {
    const a = points[i % points.length],
      b = points[(i + 1) % points.length];
    const middle = a.clone().lerp(b, 0.5);
    shape.quadraticCurveTo(a.x, a.y, middle.x, middle.y);
  }
  return shape.getPoints(6).slice(0, -1);
}
const profile = (island: Island) => [
  [0.9, -0.16],
  [0.98, -0.025],
  [0.94, 0.04],
  [0.84, shoreTop(island)],
];
export function contactScale(island: Island, waterY: number) {
  const levels = profile(island);
  if (waterY >= shoreTop(island)) return null;
  for (let i = 1; i < levels.length; i++)
    if (waterY <= levels[i][1])
      return T.MathUtils.lerp(
        levels[i - 1][0],
        levels[i][0],
        T.MathUtils.clamp((waterY - levels[i - 1][1]) / (levels[i][1] - levels[i - 1][1]), 0, 1),
      );
  return levels.at(-1)![0];
}
export function buildCoastGeometry(island: Island, style: IslandStyle = 'garden') {
  const contour = shoreContour(island),
    center = islandCenter(island),
    positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const tones = [
    '#9da58d',
    '#aab29a',
    '#d6c8a3',
    style === 'reeds' ? '#c4bc91' : style === 'rocky' ? '#98a18a' : '#91a578',
  ];
  for (const [ring, [scale, y]] of profile(island).entries()) {
    const color = new T.Color(tones[ring]);
    for (const point of contour) {
      positions.push(
        center.x + (point.x - center.x) * scale,
        y,
        center.y + (point.y - center.y) * scale,
      );
      colors.push(color.r, color.g, color.b);
    }
  }
  const count = contour.length;
  for (let ring = 0; ring < 3; ring++)
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count,
        a = ring * count + i,
        b = ring * count + next,
        c = (ring + 1) * count + i,
        d = (ring + 1) * count + next;
      indices.push(a, c, b, b, c, d);
    }
  positions.push(center.x, shoreTop(island), center.y);
  const topColor = new T.Color(tones[3]);
  colors.push(topColor.r, topColor.g, topColor.b);
  for (let i = 0; i < count; i++)
    indices.push(count * 4, count * 3 + ((i + 1) % count), count * 3 + i);
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
export function shoreRockPlacements(island: Island, style: IslandStyle = 'garden') {
  const center = islandCenter(island),
    points = island.footprintXZ;
  const count = style === 'reeds' ? 2 : style === 'rocky' ? 5 : 3;
  return Array.from({ length: count }, (_, i) => {
    const a = points[(i * 2 + 1) % points.length],
      b = points[(i * 2 + 2) % points.length];
    const radius = style === 'reeds' ? 0.2 + i * 0.035 : 0.29 + (i % 3) * 0.065;
    return {
      position: new T.Vector3(
        center.x + ((a[0] + b[0]) / 2 - center.x) * 0.63,
        island.elevation * 0.18 + radius * 0.06,
        center.y + ((a[1] + b[1]) / 2 - center.y) * 0.63,
      ),
      scale: new T.Vector3(
        radius * (i % 2 ? 1.15 : 0.9),
        radius * (i % 2 ? 0.64 : 0.9),
        radius * 0.8,
      ),
      rotation: new T.Euler(0.13 * i, 0.8 + i * 1.1, 0.1),
    };
  });
}
export function createShoreRocks(
  island: Island,
  style: IslandStyle = 'garden',
  material?: T.Material,
) {
  const placements = shoreRockPlacements(island, style);
  const geometry = new T.DodecahedronGeometry(1, 0);
  geometry.setAttribute(
    'color',
    new T.Float32BufferAttribute(
      new Float32Array(geometry.getAttribute('position').count * 3).fill(1),
      3,
    ),
  );
  const rocks = new T.InstancedMesh(
    geometry,
    material ?? new T.MeshStandardMaterial({ roughness: 1 }),
    placements.length,
  );
  rocks.name = `shore-rocks-${island.id}`;
  rocks.userData.islandId = island.id;
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  const transform = new T.Object3D();
  placements.forEach((placement, i) => {
    transform.position.copy(placement.position);
    transform.rotation.copy(placement.rotation);
    transform.scale.copy(placement.scale);
    transform.updateMatrix();
    rocks.setMatrixAt(i, transform.matrix);
    rocks.setColorAt(i, new T.Color(i % 2 ? '#89988e' : '#a5ae9b'));
  });
  rocks.computeBoundingBox();
  rocks.computeBoundingSphere();
  return rocks;
}
export function createReedBeds(island: Island) {
  const center = islandCenter(island),
    contour = shoreContour(island),
    stems: T.Matrix4[] = [],
    heads: T.Matrix4[] = [];
  const transform = new T.Object3D();
  for (const patch of [0.12, 0.43, 0.77]) {
    const index = Math.floor(contour.length * patch);
    for (let clump = -1; clump <= 1; clump++) {
      const point = contour[(index + clump * 2 + contour.length) % contour.length];
      const x = center.x + (point.x - center.x) * 0.74,
        z = center.y + (point.y - center.y) * 0.74;
      for (let stem = 0; stem < 5; stem++) {
        const angle = stem * 2.4 + patch * 8,
          height = 0.23 + ((stem + clump + 4) % 3) * 0.075;
        transform.position.set(
          x + Math.cos(angle) * 0.065,
          island.elevation * 0.18 + height / 2,
          z + Math.sin(angle) * 0.045,
        );
        transform.rotation.set(0, angle, Math.sin(angle) * 0.13);
        transform.scale.set(1, height, 1);
        transform.updateMatrix();
        stems.push(transform.matrix.clone());
        if (stem % 2 === 0) {
          transform.position.y = island.elevation * 0.18 + height;
          transform.scale.set(1, 1, 1);
          transform.updateMatrix();
          heads.push(transform.matrix.clone());
        }
      }
    }
  }
  const group = new T.Group();
  group.name = `reed-beds-${island.id}`;
  for (const [name, matrices, geometry, color] of [
    ['stems', stems, new T.CylinderGeometry(0.009, 0.017, 1, 5), '#72885c'],
    ['seed-heads', heads, new T.CylinderGeometry(0.024, 0.024, 0.09, 6), '#987959'],
  ] as [string, T.Matrix4[], T.BufferGeometry, string][]) {
    const mesh = new T.InstancedMesh(
      geometry,
      new T.MeshStandardMaterial({ color, roughness: 1 }),
      matrices.length,
    );
    mesh.name = name;
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
    group.add(mesh);
  }
  return group;
}
export class Shores {
  group = new T.Group();
  contacts: T.LineSegments;
  forecast = new T.Group();
  water = { value: 0 };
  forecastY: number | null = null;
  lastY = Number.NaN;
  entries: {
    island: Island;
    mesh: T.Mesh;
    rocks: T.InstancedMesh;
    contour: T.Vector2[];
    center: T.Vector2;
  }[] = [];
  constructor(level: Level, styles: Record<string, IslandStyle>) {
    this.group.name = 'coastal-ground';
    const material = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.coastWaterY = this.water;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float coastHeight;')
        .replace(
          '#include <worldpos_vertex>',
          '#include <worldpos_vertex>\nvec4 coastPosition=vec4(transformed,1.);\n#ifdef USE_INSTANCING\ncoastPosition=instanceMatrix*coastPosition;\n#endif\ncoastHeight=(modelMatrix*coastPosition).y;',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float coastWaterY;varying float coastHeight;',
        )
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\nfloat wet=1.-smoothstep(coastWaterY+.015,coastWaterY+.12,coastHeight);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.67,.76,.72),wet*.68);',
        );
    };
    material.customProgramCacheKey = () => 'coast-wetness-1';
    for (const island of level.world.islands) {
      const style = styles[island.id] ?? 'garden';
      const mesh = new T.Mesh(buildCoastGeometry(island, style), material);
      mesh.name = `shore-${island.id}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const rocks = createShoreRocks(island, style, material);
      this.group.add(mesh, rocks);
      this.entries.push({
        island,
        mesh,
        rocks,
        contour: shoreContour(island),
        center: islandCenter(island),
      });
    }
    const capacity = this.entries.reduce(
      (sum, entry) => sum + shoreContour(entry.island).length * 2 + 100,
      0,
    );
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      'position',
      new T.Float32BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(T.DynamicDrawUsage),
    );
    geometry.setDrawRange(0, 0);
    this.contacts = new T.LineSegments(
      geometry,
      new T.LineBasicMaterial({
        color: '#b6c9bc',
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    );
    this.contacts.name = 'shore-contact';
    this.contacts.userData.excludeFromFrame = true;
    this.contacts.frustumCulled = false;
    this.forecast.name = 'coast-forecast';
    this.forecast.userData.excludeFromFrame = true;
    for (const tide of [0, 1, 2]) {
      const group = new T.Group();
      group.name = `forecast-tide-${tide}`;
      for (const { island } of this.entries) {
        const y = tide * 0.18,
          scale = contactScale(island, y);
        if (scale === null) continue;
        const points = shoreContour(island, scale).map((p) => new T.Vector3(p.x, y + 0.013, p.y));
        const line = new T.LineLoop(
          new T.BufferGeometry().setFromPoints(points),
          new T.LineBasicMaterial({
            color: '#e9c879',
            transparent: true,
            opacity: 0.62,
            depthWrite: false,
          }),
        );
        line.name = `forecast-${island.id}`;
        group.add(line);
      }
      group.visible = false;
      this.forecast.add(group);
    }
  }
  update(waterY: number) {
    if (waterY === this.lastY) return;
    this.lastY = waterY;
    this.water.value = waterY;
    const positions = this.contacts.geometry.getAttribute('position') as T.BufferAttribute;
    let count = 0;
    for (const [index, { island, contour, center }] of this.entries.entries()) {
      const scale = contactScale(island, waterY);
      if (scale === null) continue;
      for (let i = 0; i < contour.length; i++) {
        if ((i + index * 7) % 19 > 3) continue;
        const a = contour[i],
          b = contour[(i + 1) % contour.length];
        positions.setXYZ(
          count++,
          center.x + (a.x - center.x) * scale,
          waterY + 0.012,
          center.y + (a.y - center.y) * scale,
        );
        positions.setXYZ(
          count++,
          center.x + (b.x - center.x) * scale,
          waterY + 0.012,
          center.y + (b.y - center.y) * scale,
        );
      }
    }
    positions.needsUpdate = true;
    this.contacts.geometry.setDrawRange(0, count);
    this.contacts.visible = count > 0;
  }
  preview(visible: boolean, tide: number) {
    this.forecastY = visible ? tide * 0.18 : null;
    this.forecast.children.forEach((group, i) => {
      group.visible = visible && i === tide;
    });
  }
  presentation() {
    return {
      waterY: this.water.value,
      contactVertices: this.contacts.geometry.drawRange.count,
      contactPositions: Array.from(
        (this.contacts.geometry.getAttribute('position') as T.BufferAttribute).array.slice(
          0,
          this.contacts.geometry.drawRange.count * 3,
        ),
      ),
      forecastY: this.forecastY,
      islands: this.entries.map(({ island, mesh, rocks }) => ({
        id: island.id,
        surfaceY: shoreTop(island),
        mode:
          this.water.value >= shoreTop(island)
            ? 'submerged'
            : this.water.value > 0.04
              ? 'wet'
              : 'exposed',
        submergedFraction: 1 - ((contactScale(island, this.water.value) ?? 0) / 0.98) ** 2,
        contactVisible: contactScale(island, this.water.value) !== null,
        contactScale: contactScale(island, this.water.value),
        geometryVertices: mesh.geometry.getAttribute('position').count,
        rockCount: rocks.count,
      })),
    };
  }
}
