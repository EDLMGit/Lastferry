import { Box3, Group, MathUtils, MeshStandardMaterial, Object3D, TorusGeometry, Vector3 } from 'three';
import { box, cylinder, mesh } from './models';
import { samplePath, type CanonicalPath } from './paths';

const timber = '#a97648';
const iron = '#355658';
const brass = '#d5a859';
const stone = '#86978d';

export function signalStation(parent: Object3D, position: [number, number, number]) {
  const group = new Group();
  group.position.set(...position);
  group.name = 'signal-quay-winch';
  parent.add(group);
  box(group, stone, [0.83, 0.21, 0.73], [0, 0.09, 0], 0.085);
  box(group, iron, [0.57, 0.65, 0.38], [0, 0.48, 0], 0.07);
  const wheel = new Group();
  wheel.position.set(0, 0.78, 0.25);
  group.add(wheel);
  mesh(new TorusGeometry(0.32, 0.041, 7, 18), brass, wheel);
  for (const angle of [0, Math.PI / 3, -Math.PI / 3])
    box(wheel, '#9b793e', [0.61, 0.047, 0.054], [0, 0, 0], 0.009).rotation.z = angle;
  cylinder(group, iron, 0.07, 0.09, 1.15, [0, 1.12, -0.1], 8);
  cylinder(group, brass, 0.17, 0.13, 0.08, [0, 1.66, -0.1], 8);
  cylinder(group, '#ffd58a', 0.14, 0.14, 0.27, [0, 1.82, -0.1], 8);
  cylinder(group, iron, 0.04, 0.22, 0.15, [0, 2.03, -0.1], 8);
  return group;
}

function bridgeHead(parent: Group, x: number, hinge: boolean) {
  const group = new Group();
  group.position.x = x;
  parent.add(group);
  const direction = hinge ? -1 : 1;
  box(group, '#607d79', [0.89, 1.04, 0.99], [0.05 * direction, 0, 0], 0.13);
  box(group, stone, [0.93, 0.2, 1.01], [0.08 * direction, 0.54, 0], 0.065);
  for (const z of [-0.5, 0.5]) {
    cylinder(group, '#715b42', 0.073, 0.1, 1.37, [0.28 * direction, 0.24, z], 9);
    cylinder(group, '#d5b681', 0.084, 0.084, 0.06, [0.28 * direction, 0.89, z], 9);
  }
  if (hinge) {
    cylinder(group, iron, 0.45, 0.5, 0.13, [0, 0.70, 0], 20);
    cylinder(group, brass, 0.32, 0.35, 0.10, [0, 0.79, 0], 18);
  } else {
    for (const z of [-0.28, 0.28])
      box(group, iron, [0.44, 0.19, 0.15], [0, 0.73, z], 0.03);
  }
}

export function createSwingBridge(path: CanonicalPath, beam: number) {
  const root = new Group();
  root.name = 'swing-bridge';
  const crossing = samplePath(path, path.length * 0.36);
  root.position.copy(crossing.position);
  root.rotation.y = crossing.angle;
  const halfSpan = beam / 2 + 1.02;
  const span = halfSpan * 2;
  bridgeHead(root, -halfSpan, true);
  bridgeHead(root, halfSpan, false);

  const leaf = new Group();
  leaf.name = 'pivoting-walkway';
  leaf.position.x = -halfSpan;
  root.add(leaf);
  const end = span + 0.16;
  const tail = -0.39;
  const length = end - tail;
  const middle = (tail + end) / 2;
  for (const z of [-0.29, 0.29])
    box(leaf, iron, [length, 0.18, 0.12], [middle, 0.89, z], 0.028);
  const boards = Math.ceil(length / 0.23);
  const pitch = length / boards;
  const geometry = box(leaf, timber, [pitch - 0.014, 0.087, 0.73], [tail + pitch / 2, 1.012, 0], 0.012);
  for (let i = 1; i < boards; i++) {
    const board = geometry.clone();
    board.position.x += i * pitch;
    leaf.add(board);
  }
  for (const z of [-0.36, 0.36]) {
    const stations = [tail + 0.10, middle, end - 0.10];
    for (const x of stations)
      box(leaf, iron, [0.085, 0.52, 0.089], [x, 1.22, z], 0.015);
    box(leaf, '#cb9560', [length, 0.077, 0.09], [middle, 1.49, z], 0.022);
    for (let i = 1; i < stations.length; i++) {
      const run = stations[i] - stations[i - 1];
      const strut = box(leaf, '#61817a', [Math.hypot(run, 0.42), 0.055, 0.055],
        [(stations[i] + stations[i - 1]) / 2, 1.23, z], 0.008);
      strut.rotation.z = Math.atan2(i === 1 ? 0.42 : -0.42, run);
    }
  }
  cylinder(leaf, brass, 0.13, 0.14, 0.08, [0, 1.09, 0], 12);

  const lampX = -halfSpan - 0.30;
  const lampZ = -0.43;
  cylinder(root, iron, 0.091, 0.12, 1.10, [lampX, 1.20, lampZ], 8);
  cylinder(root, brass, 0.17, 0.13, 0.08, [lampX, 1.76, lampZ], 8);
  const glass = cylinder(root, brass, 0.135, 0.135, 0.25, [lampX, 1.92, lampZ], 8);
  const lampMaterial = new MeshStandardMaterial({ roughness: 0.46, emissiveIntensity: 0.34 });
  glass.material = lampMaterial;
  cylinder(root, iron, 0.045, 0.225, 0.16, [lampX, 2.13, lampZ], 8);

  const flag = new Group();
  flag.position.set(lampX, 1.52, lampZ + 0.03);
  root.add(flag);
  box(flag, '#ba6451', [0.48, 0.12, 0.075], [-0.23, 0, 0], 0.025);
  box(flag, '#f4dfac', [0.09, 0.125, 0.08], [-0.37, 0, 0], 0.018);
  let progress = 0;
  function setProgress(value: number) {
    progress = MathUtils.clamp(value, 0, 1);
    const turn = MathUtils.smootherstep(progress, 0.07, 0.95);
    leaf.rotation.y = -turn * Math.PI / 2;
    flag.rotation.z = -MathUtils.smoothstep(progress, 0, 0.32) * Math.PI * 0.33;
    const light = progress >= 0.95 ? '#b2e0b4' : '#ffc477';
    lampMaterial.color.set(light);
    lampMaterial.emissive.set(light);
  }
  const sweepBounds = new Box3();
  for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
    setProgress(phase);
    sweepBounds.expandByObject(root);
  }
  setProgress(0);
  return {
    root, leaf, sweepBounds, setProgress,
    presentation: () => ({
      progress, angle: leaf.rotation.y,
      pivot: leaf.getWorldPosition(new Vector3()).toArray(),
      tip: leaf.localToWorld(new Vector3(end, 1.01, 0)).toArray(),
    }),
  };
}
