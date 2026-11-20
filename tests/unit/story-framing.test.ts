import { expect, test, vi } from 'vitest';
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector2,
  Vector3,
} from 'three';
import { World } from '../../src/scene/world';
import { sceneLayout } from '../../src/scene/layout';
import { initial } from '../../src/game/rules';
import { holdingPier } from '../../src/levels/level';
import { ferryProfile } from '../../src/scene/ferry-profile';
import { HomecomingTimeline } from '../../src/scene/homecoming';
import {
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
    level: holdingPier,
    layout: sceneLayout(holdingPier.id),
    neighborhoodFrames: new Map(),
    zoomStep: 0,
    overviewObstacles: [],
    overviewSubjects: [],
    layoutStaticBounds: new Map(holdingPier.nodes.map(node => [
      node.id, new Box3(
        new Vector3(node.positionXZ[0] - 1, 0, node.positionXZ[1] - 1),
        new Vector3(node.positionXZ[0] + 1, 1.2, node.positionXZ[1] + 1),
      ),
    ])),
    ferryEnvelope: { radius: 1.2, top: 1.4, bottom: -0.1 },
    profile: ferryProfile(holdingPier),
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

test('leaving a story restores the same local play frame and scale', () => {
  const usable = { left: 12, right: 832, top: 80, bottom: 330 };
  const { world } = fixture(844, 390, usable);
  const frame = viewFrame(844, 390, usable, world.viewScale, world.viewFocus!);
  expect(world.canonicalFrame).toEqual(frame);
  world.setStoryFraming(true);
  expect(world.canonicalFrame).not.toEqual(frame);
  world.setStoryFraming(false);
  expect(world.canonicalFrame).toEqual(frame);
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

test.each([[390, 844], [780, 320], [320, 740]])(
  'a centered arrival keeps the whole safe Harbor frame stable at %s×%s and restores ordinary play',
  (width, height) => {
    const usable = { left: 12, right: width - 12, top: 12, bottom: height - 12 };
    const { world, home, boatRoot, moss, remote } = fixture(width, height, usable);
    const ordinaryFrame = { ...world.canonicalFrame };
    const playing = structuredClone(world.state);
    remote.position.set(-2.3, 0.7, -3.2);
    Object.assign(world, { homecoming: new HomecomingTimeline(), reduced: true,
      homecomingCameraSuppressed: false, homecomingFocus: new Vector2(),
      completionBounds: null, completionLayout: 'side' });
    world.state = { ...playing, status: 'won', boatNodeId: 'harbor', aboard: [],
      delivered: [...holdingPier.objective.requiredPassengerIds],
      waitingByPier: Object.fromEntries(holdingPier.piers.map(pier => [pier.id, []])) };
    world.homecoming.start(100, true);
    const internals = world as unknown as {
      reframeView(): void;
      fitHomecomingCamera(): void;
      applyHomecomingCamera(factor: number): void;
    };
    const card = { left: 28, right: width - 28, top: height * 0.2, bottom: height * 0.8 };
    world.setCompletionBounds(card, 'centered');
    const settled = { ...world.canonicalFrame };
    const revision = world.cameraRevision;
    expect(world.homecomingCameraFactor).toBe(1);
    world.setCompletionBounds(card, 'centered');
    expect(world.cameraRevision).toBe(revision);
    world.setCompletionBounds({ left: width / 2, right: width - 20, top: 40, bottom: height - 40 }, 'centered');
    expect(world.canonicalFrame).toEqual(settled);
    expect(world.cameraRevision).toBe(revision);
    world.reduced = false;
    internals.fitHomecomingCamera();
    internals.applyHomecomingCamera(world.homecomingCameraTarget);
    if (height <= 320) expect(world.homecomingCameraTarget).toBe(1);
    for (const object of [home, boatRoot, moss, remote]) {
      const box = new Box3().setFromObject(object);
      for (const x of [box.min.x, box.max.x])
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z]) {
            const point = new Vector3(x, y, z).project(world.camera);
            expect((point.x + 1) * width / 2).toBeGreaterThanOrEqual(usable.left - 1e-7);
            expect((point.x + 1) * width / 2).toBeLessThanOrEqual(usable.right + 1e-7);
            expect((1 - point.y) * height / 2).toBeGreaterThanOrEqual(usable.top - 1e-7);
            expect((1 - point.y) * height / 2).toBeLessThanOrEqual(usable.bottom + 1e-7);
          }
    }
    world.state = playing;
    world.resetHomecoming();
    internals.reframeView();
    expect(world.canonicalFrame).toEqual(ordinaryFrame);
    expect(world.completionBounds).toBeNull();
    expect(world.completionLayout).toBe('side');
    expect(world.homecoming.active).toBe(false);
    expect(world.homecomingCameraFactor).toBe(1);
  },
);
