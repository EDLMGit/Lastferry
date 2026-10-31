import { expect, test, vi } from 'vitest';
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
} from 'three';
import { World } from '../../src/scene/world';
import { initial } from '../../src/game/rules';
import { holdingPier } from '../../src/levels/level';
import {
  clampViewFocus,
  phonePlayScale,
  overviewScale,
  viewFrame,
  type ViewRectangle,
} from '../../src/scene/view';

function fixture(width: number, height: number, usable: ViewRectangle) {
  const camera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.set(12, 14, 18);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const scene = new Scene();
  const home = new Group();
  const tower = new Mesh(new BoxGeometry(2.8, 5, 2.8), new MeshBasicMaterial());
  tower.position.set(-3, 2.5, -4);
  home.add(tower);
  const boatRoot = new Group();
  boatRoot.position.set(3, 0, 3);
  const hull = new Mesh(new BoxGeometry(2, 1.2, 3), new MeshBasicMaterial());
  const moss = new Mesh(new BoxGeometry(0.8, 1.5, 0.8), new MeshBasicMaterial());
  moss.position.set(0, 1.2, 0.5);
  boatRoot.add(hull, moss);
  const remote = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
  remote.position.set(1000, 0, 1000);
  scene.add(home, boatRoot, remote);
  scene.updateMatrixWorld(true);
  const world = Object.assign(Object.create(World.prototype), {
    host: { clientWidth: width, clientHeight: height },
    camera,
    scene,
    home: { group: home },
    boatRoot,
    animals: new Map([
      ['sheep-1', moss],
      ['rabbit-1', remote],
    ]),
    state: initial(holdingPier),
    viewBounds: { minX: -10, maxX: 10, minY: -5, maxY: 7 },
    measuredUsable: null,
    viewMode: 'play',
    viewPanned: false,
    viewLocation: null,
    viewFocus: null,
    viewScale: 1,
    storyFraming: false,
    canonicalFrame: null,
    cameraRevision: 0,
    layoutRevision: 0,
    homecomingCameraFactor: 1,
    homecoming: { active: false },
    coastalWater: { setView: vi.fn() },
    onViewChange: vi.fn(),
  }) as World;
  world.setUsableRectangle(usable);
  return { world, home, boatRoot, moss, remote };
}

function assertContained(world: World, object: Group | Mesh, usable: ViewRectangle) {
  const bounds = new Box3().setFromObject(object);
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new Vector3(x, y, z).project(world.camera);
        const px = ((point.x + 1) * world.host.clientWidth) / 2;
        const py = ((1 - point.y) * world.host.clientHeight) / 2;
        expect(px).toBeGreaterThanOrEqual(usable.left + 12 - 1e-8);
        expect(px).toBeLessThanOrEqual(usable.right - 12 + 1e-8);
        expect(py).toBeGreaterThanOrEqual(usable.top + 12 - 1e-8);
        expect(py).toBeLessThanOrEqual(usable.bottom - 12 + 1e-8);
      }
}

test.each([
  [780, 320, { left: 440, right: 768, top: 12, bottom: 308 }],
  [844, 390, { left: 440, right: 832, top: 12, bottom: 378 }],
  [320, 740, { left: 12, right: 308, top: 12, bottom: 410 }],
  [390, 844, { left: 12, right: 378, top: 12, bottom: 510 }],
  [1440, 900, { left: 500, right: 1428, top: 12, bottom: 888 }],
] as const)(
  'opt-in story framing contains the lighthouse roof, hull and aboard silhouette at %s×%s',
  (width, height, usable) => {
    const { world, home, boatRoot, moss, remote } = fixture(width, height, usable);
    const normal = { ...world.canonicalFrame };
    const state = structuredClone(world.state);
    world.setStoryFraming(true);
    assertContained(world, home, usable);
    assertContained(world, boatRoot, usable);
    assertContained(world, moss, usable);
    expect(world.state).toEqual(state);
    expect(world.viewScale).toBeGreaterThan(15);
    const framed = { ...world.canonicalFrame };
    remote.position.set(-5000, 0, -5000);
    world.setStoryFraming(true);
    expect(world.canonicalFrame).toEqual(framed);
    world.setStoryFraming(false);
    expect(world.canonicalFrame).toEqual(normal);
  },
);

test('normal play keeps its original full-network calculation until story framing is explicitly enabled', () => {
  const usable = { left: 12, right: 832, top: 80, bottom: 330 };
  const { world } = fixture(844, 390, usable);
  const scale = phonePlayScale(world.viewBounds!, usable);
  const boat = world.boatRoot.position.clone();
  boat.y = 0;
  boat.applyMatrix4(world.camera.matrixWorldInverse);
  const focus = clampViewFocus({ x: boat.x, y: boat.y + 0.8 }, world.viewBounds!, usable, scale);
  expect(world.canonicalFrame).toEqual(viewFrame(844, 390, usable, scale, focus));
  expect(world.viewScale).toBe(scale);
  expect(scale).toBeGreaterThan(overviewScale(world.viewBounds!, usable));
  world.setStoryFraming(false);
  expect(world.canonicalFrame).toEqual(viewFrame(844, 390, usable, scale, focus));
});

test('arrival camera callbacks cannot zoom beyond a story composition', () => {
  const usable = { left: 440, right: 768, top: 12, bottom: 308 };
  const { world, home, boatRoot } = fixture(780, 320, usable);
  world.setStoryFraming(true);
  const frame = { ...world.canonicalFrame };
  const callback = (world as unknown as { applyHomecomingCamera(factor: number): void })
    .applyHomecomingCamera;
  callback.call(world, 1.12);
  expect(world.homecomingCameraFactor).toBe(1);
  expect(world.canonicalFrame).toEqual(frame);
  assertContained(world, home, usable);
  assertContained(world, boatRoot, usable);
});
