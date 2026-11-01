import { expect, test } from 'vitest';
import { Box3, DoubleSide, Group, Matrix4, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { twoShelters as level } from '../../src/levels/level';
import { getLevelPaths, samplePath } from '../../src/scene/paths';
import { createPassageBathymetry } from '../../src/scene/seabed';
import { CoastalWater } from '../../src/scene/water';
import { buildCoastGeometry } from '../../src/scene/shore';
import { createPier, createShelterGangway, updateShelterGangway } from '../../src/scene/pier';
import { animal, ferry, lighthouse } from '../../src/scene/models';
import { cottage, bellLandmark } from '../../src/scene/scenery';
import { hullDraftY, passengerScale } from '../../src/scene/ferry-profile';
import { passengerModelVariant } from '../../src/game/passenger-appearance';
import { shelterDeckSeat, shelterShoreSeat, shelterTransferPose } from '../../src/scene/two-shelters-seating';
import { sceneLayout } from '../../src/scene/layout';

function intersection(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
  const rx = b.x - a.x, rz = b.z - a.z, sx = d.x - c.x, sz = d.z - c.z;
  const denominator = rx * sz - rz * sx, qx = c.x - a.x, qz = c.z - a.z;
  if (Math.abs(denominator) < 1e-10) {
    if (Math.abs(qx * rz - qz * rx) > 1e-10) return null;
    const lengthSquared = rx * rx + rz * rz;
    const first = (qx * rx + qz * rz) / lengthSquared;
    const last = ((d.x - a.x) * rx + (d.z - a.z) * rz) / lengthSquared;
    const low = Math.max(0, Math.min(first, last)), high = Math.min(1, Math.max(first, last));
    return high - low > 1e-7 ? a.clone().lerp(b, (low + high) / 2) : null;
  }
  const t = (qx * sz - qz * sx) / denominator, u = (qx * rz - qz * rx) / denominator;
  return t >= -1e-8 && t <= 1 + 1e-8 && u >= -1e-8 && u <= 1 + 1e-8
    ? a.clone().lerp(b, t) : null;
}

test('Two Shelters canonical curved courses meet only at their named shared endpoint', () => {
  const paths = getLevelPaths(level), failures: string[] = [];
  for (let i = 0; i < level.edges.length; i++) for (let j = i + 1; j < level.edges.length; j++) {
    const a = level.edges[i], b = level.edges[j];
    const pa = paths.get(a.id)!.points, pb = paths.get(b.id)!.points;
    const shared = level.nodes.filter((node) => a.nodes.includes(node.id) && b.nodes.includes(node.id));
    for (let k = 1; k < pa.length; k++) for (let l = 1; l < pb.length; l++) {
      const at = intersection(pa[k - 1], pa[k], pb[l - 1], pb[l]);
      if (!at || shared.some((node) => Math.hypot(at.x - node.positionXZ[0], at.z - node.positionXZ[1]) < 1e-6)) continue;
      if (failures.length < 20) failures.push(`${a.id}/${b.id}: ${at.x},${at.z}`);
    }
    for (const edge of [a, b]) {
      const path = paths.get(edge.id)!;
      for (const portion of [0, 0.2, 0.5, 0.8, 1]) {
        const forward = samplePath(path, path.length * portion);
        const reverse = samplePath(path, path.length * (1 - portion), true);
        expect(forward.position.distanceTo(reverse.position)).toBeLessThan(1e-8);
      }
    }
  }
  expect(failures).toEqual([]);
});

test('Two Shelters real water has shallow channels, deep alternatives and node pockets independent of load', () => {
  const paths = getLevelPaths(level), field = createPassageBathymetry(level), water = new CoastalWater(level, paths);
  const unloaded = structuredClone(level);
  unloaded.start.aboard = [];
  unloaded.start.waitingByPier['low-pier'] = ['hazel', 'bracken'];
  const unloadedField = createPassageBathymetry(unloaded);
  const samples = level.edges.map((edge) => {
    const path = paths.get(edge.id)!, at = samplePath(path, path.length * 0.5).position;
    return { edge, at, bathymetry: field.sample(at.x, at.z), bed: water.seabed.sampleAuthored(at.x, at.z) };
  });
  for (const { edge, at, bathymetry, bed } of samples) {
    expect(unloadedField.sample(at.x, at.z)).toEqual(bathymetry);
    if (edge.baseDepth === 1) {
      expect(bathymetry.height, edge.id).toBeGreaterThan(-0.5);
      expect(bed.height, edge.id).toBeGreaterThan(-0.5);
    } else {
      expect(bathymetry.height, edge.id).toBeLessThan(-1.5);
      expect(bed.height, edge.id).toBeLessThan(-1.5);
    }
  }
  for (const node of level.nodes) {
    expect(field.sample(node.positionXZ[0], node.positionXZ[1]).height, node.id).toBeLessThan(-1.5);
    expect(water.seabed.sampleAuthored(node.positionXZ[0], node.positionXZ[1]).height, node.id).toBeLessThan(-1.5);
  }
  const mask = water.mask.texture.image.data!.slice(), seabed = water.seabed.texture.image.data!.slice();
  for (const tide of [0, 1, 2, 0]) {
    water.update(tide * level.world.waterYPerTideLevel, 4);
    expect(water.presentation().waterY).toBe(tide * 0.18);
    expect(water.mask.texture.image.data!.every((value, index) => value === mask[index])).toBe(true);
    expect(water.seabed.texture.image.data!.every((value, index) => value === seabed[index])).toBe(true);
  }
  water.dispose();
});

function shoreSupport(pier: typeof level.piers[number]) {
  const island = level.world.islands.find((island) => island.id === pier.islandId)!;
  const layout = sceneLayout(level.id);
  const ground = new Mesh(buildCoastGeometry(island, layout.islandStyles[island.id]), new MeshBasicMaterial({ side: DoubleSide }));
  const boards = createPier(pier, layout.stonePiers.includes(pier.id), false, true);
  const support = new Group();
  support.add(ground, boards);
  support.updateMatrixWorld(true);
  const ray = new Raycaster(), down = new Vector3(0, -1, 0);
  return {
    group: support,
    supported(point: Vector3, slatAllowance = 0) {
      return [[0, 0], [slatAllowance, 0], [-slatAllowance, 0], [0, slatAllowance], [0, -slatAllowance]].some(([x, z]) => {
        ray.set(new Vector3(point.x + x, point.y + 0.02, point.z + z), down);
        const contact = ray.intersectObject(support, true)[0];
        return !!contact && contact.point.y >= point.y - 0.08;
      });
    },
  };
}

test('every candidate foot has actual ordinary-pier or shore support at each landing, including all delivered neighbors', () => {
  const failures: string[] = [];
  for (const pier of level.piers) {
    const support = shoreSupport(pier);
    for (const passenger of level.passengers) for (const delivered of [false, true]) {
      const figure = animal(passenger.species, passengerModelVariant(level, passenger.id));
      figure.scale.set(...passengerScale(passenger.species));
      const seat = shelterShoreSeat(level, passenger.id, pier, delivered);
      figure.position.copy(seat);
      figure.updateMatrixWorld(true);
      let checked = 0;
      figure.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const vertices = object.geometry.getAttribute('position');
        for (let i = 0; i < vertices.count; i++) {
          const vertex = new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(object.matrixWorld);
          if (vertex.y > seat.y + 0.025) continue;
          checked++;
          if (!support.supported(vertex, 0.012) && failures.length < 30)
            failures.push(`${pier.id}/${passenger.id}/${delivered ? 'delivered' : 'waiting'}: ${vertex.toArray().join(',')}`);
        }
      });
      expect(checked).toBeGreaterThan(0);
    }
  }
  expect(failures).toEqual([]);
});

test('candidate lighthouse, cottage and refuge bell foundations rest on actual authored ground', () => {
  const failures: string[] = [];
  for (const landmark of sceneLayout(level.id).landmarks) {
    const pier = level.piers.find((pier) => pier.islandId === landmark.islandId)!;
    const support = shoreSupport(pier), group = new Group(), y = pier.elevation * 0.18;
    const [x, z] = landmark.positionXZ;
    if (landmark.kind === 'lighthouse') lighthouse(group, x, y, z);
    if (landmark.kind === 'cottage') cottage(group, [x, y, z]);
    if (landmark.kind === 'bell') bellLandmark(group, [x, y, z]);
    group.updateMatrixWorld(true);
    let checked = 0;
    group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const vertices = object.geometry.getAttribute('position');
      for (let i = 0; i < vertices.count; i++) {
        const vertex = new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(object.matrixWorld);
        if (vertex.y > y + 0.012) continue;
        checked++;
        if (!support.supported(vertex) && failures.length < 30)
          failures.push(`${landmark.kind}: ${vertex.toArray().join(',')}`);
      }
    });
    expect(checked).toBeGreaterThan(0);
  }
  expect(failures).toEqual([]);
});

test('candidate transfer soles stay over real pier, short gangway or ferry surfaces at both berth headings', () => {
  const failures: string[] = [];
  const feet = new Map(level.passengers.map((passenger) => {
    const figure = animal(passenger.species, passengerModelVariant(level, passenger.id));
    figure.scale.set(...passengerScale(passenger.species));
    figure.updateMatrixWorld(true);
    const points = new Map<string, Vector3>();
    figure.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const vertices = object.geometry.getAttribute('position');
      for (let i = 0; i < vertices.count; i++) {
        const point = new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(object.matrixWorld);
        if (point.y <= 0.025) points.set(point.toArray().map((n) => n.toFixed(4)).join(','), point);
      }
    });
    const sorted = [...points.values()].sort((a, b) => a.x - b.x || a.z - b.z);
    const cross = (a: Vector3, b: Vector3, c: Vector3) => (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
    const half = (values: Vector3[]) => {
      const outline: Vector3[] = [];
      for (const point of values) {
        while (outline.length > 1 && cross(outline.at(-2)!, outline.at(-1)!, point) <= 0) outline.pop();
        outline.push(point);
      }
      return outline.slice(0, -1);
    };
    return [passenger.id, [...half(sorted), ...half([...sorted].reverse())]] as const;
  }));
  const cases = [
    { id: 'hazel', aboard: ['hazel'] },
    { id: 'hazel', aboard: ['hazel', 'bracken'] },
    { id: 'bracken', aboard: ['hazel', 'bracken'] },
    { id: 'mica', aboard: ['mica'] },
  ];
  for (const pier of level.piers) {
    const support = shoreSupport(pier), boat = ferry(), gangway = createShelterGangway();
    const node = level.nodes.find((node) => node.id === pier.nodeId)!;
    support.group.add(boat, gangway);
    boat.matrixAutoUpdate = false;
    const ray = new Raycaster(), down = new Vector3(0, -1, 0);
    const meshes: { mesh: Mesh; bounds: Box3; moving: boolean }[] = [];
    support.group.traverse((mesh) => {
      if (!(mesh instanceof Mesh)) return;
      mesh.geometry.computeBoundingBox();
      meshes.push({ mesh, bounds: new Box3(), moving: mesh.parent === gangway });
    });
    const updateBounds = (movingOnly = false) => {
      for (const item of meshes)
        if (!movingOnly || item.moving)
          item.bounds.copy(item.mesh.geometry.boundingBox!).applyMatrix4(item.mesh.matrixWorld);
    };
    for (const heading of [-Math.PI / 2, Math.PI / 2]) for (const tide of [0, 1, 2].filter((tide) => tide < pier.elevation)) {
      for (const requiredDraft of [1, 2, 3]) for (const { id, aboard } of cases) for (const board of [false, true]) {
        const hull = new Matrix4().makeRotationY(heading).setPosition(node.positionXZ[0], tide * 0.18 + hullDraftY(requiredDraft), node.positionXZ[1]);
        boat.matrix.copy(hull);
        support.group.updateMatrixWorld(true);
        updateBounds();
        const seat = shelterDeckSeat(level, id, aboard).applyMatrix4(hull);
        const shore = shelterShoreSeat(level, id, pier);
        const marks = board ? [0, 0.12, 0.36, 0.5, 0.67, 0.81, 1] : [0, 0.1, 0.2, 0.34, 0.48, 0.85, 1];
        const samples = marks.flatMap((value, index) => index ? [(marks[index - 1] + value) / 2, value] : [value]);
        for (const progress of samples) {
          const pose = shelterTransferPose(level, id, aboard, pier, hull, board ? shore : seat, board ? seat : shore, board, heading, progress);
          updateShelterGangway(gangway, pose.bridge, pose.gate);
          updateBounds(true);
          const transform = new Matrix4().makeRotationY(pose.angle).setPosition(pose.position);
          for (const foot of feet.get(id)!) {
            const point = foot.clone().applyMatrix4(transform);
            const supported = [[0, 0], [0.012, 0], [-0.012, 0], [0, 0.012], [0, -0.012]].some(([x, z]) => {
              ray.set(new Vector3(point.x + x, point.y + 0.24, point.z + z), down);
              const candidates = meshes.filter(({ bounds }) =>
                point.x + x >= bounds.min.x && point.x + x <= bounds.max.x &&
                point.z + z >= bounds.min.z && point.z + z <= bounds.max.z &&
                bounds.max.y >= point.y - 0.24 && bounds.min.y <= point.y + 0.24,
              ).map(({ mesh }) => mesh);
              return ray.intersectObjects(candidates, false).some((hit) => Math.abs(point.y - hit.point.y) < 0.24);
            });
            if (!supported && failures.length < 20) failures.push(`${pier.id}/${id}/${aboard}/${heading}/tide${tide}/draft${requiredDraft}/${board}/${progress}: ${point.toArray()}`);
          }
        }
      }
    }
  }
  expect(failures).toEqual([]);
}, 30000);
