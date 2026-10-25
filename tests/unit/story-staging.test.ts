import { expect, test, vi } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, OrthographicCamera, Scene } from 'three';
import { World } from '../../src/scene/world';
import { animal, ferry } from '../../src/scene/models';
import { storyCameraFrame, storyStage } from '../../src/scene/story-staging';
import { initial } from '../../src/game/rules';
import { holdingPier } from '../../src/levels/level';
import { restoredHarbor } from '../../src/campaign/presentation';
import { PresentationPoses } from '../../src/scene/poses';

const frame = (world: World) => ({
  left: world.camera.left,
  right: world.camera.right,
  top: world.camera.top,
  bottom: world.camera.bottom,
});
const pose = (object: Group) => ({
  position: object.position.toArray(),
  rotation: object.rotation.toArray(),
  children: object.children.map((part) => ({
    position: part.position.toArray(),
    quaternion: part.quaternion.toArray(),
  })),
});

function fixture(home = false) {
  const camera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.set(12, 14, 18);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const scene = new Scene();
  const harbor = new Group();
  const tower = new Mesh(new BoxGeometry(2.8, 5, 2.8), new MeshBasicMaterial());
  tower.position.set(-3, 2.5, -4);
  harbor.add(tower);
  const boatRoot = new Group();
  boatRoot.add(ferry());
  boatRoot.position.set(3, 0, 3);
  const moss = animal('sheep');
  const pip = animal('rabbit');
  const rue = animal('rabbit', 1);
  if (home) {
    moss.position.set(-3, 0.57, -1.5);
    pip.position.set(-3.5, 0.57, -1.2);
    rue.position.set(-3.1, 0.57, -1.4);
    scene.add(moss, pip, rue);
  } else {
    boatRoot.add(moss);
    pip.position.set(5, 0.17, -4);
    rue.position.set(5.4, 0.17, -4);
    scene.add(pip, rue);
  }
  scene.add(harbor, boatRoot);
  scene.updateMatrixWorld(true);
  const route = new Group(),
    hiddenRoute = new Group(),
    marker = new Group();
  hiddenRoute.visible = false;
  const world = Object.assign(Object.create(World.prototype), {
    host: { clientWidth: 320, clientHeight: 740 },
    camera,
    scene,
    home: { group: harbor },
    boatRoot,
    animals: new Map([
      ['sheep-1', moss],
      ['rabbit-1', pip],
      ['rabbit-2', rue],
    ]),
    state: home ? restoredHarbor(holdingPier) : initial(holdingPier),
    level: holdingPier,
    poses: new PresentationPoses(holdingPier),
    routes: new Map([
      ['visible', route],
      ['hidden', hiddenRoute],
    ]),
    markers: new Map([['marker', marker]]),
    viewBounds: { minX: -10, maxX: 10, minY: -5, maxY: 7 },
    measuredUsable: null,
    viewMode: 'play',
    viewPanned: false,
    viewLocation: null,
    viewFocus: null,
    viewScale: 1,
    storyFraming: true,
    storyJob: null,
    storyRestore: null,
    canonicalFrame: null,
    cameraRevision: 0,
    layoutRevision: 0,
    homecomingCameraFactor: 1,
    homecoming: { active: false },
    coastalWater: { setView: vi.fn() },
    onViewChange: vi.fn(),
    onArrival: vi.fn(),
    reduced: false,
    disposed: false,
  }) as World;
  world.setUsableRectangle({ left: 16, right: 304, top: 16, bottom: 520 });
  return { world, moss, pip, rue, route, hiddenRoute, marker };
}

test('opening has a finite recognizable nod and a real camera reveal, with an identical skipped endpoint', () => {
  expect(storyStage('opening', 950, false, false).nod).toBeGreaterThan(0.15);
  expect(storyStage('opening', 950, false, false).turn).toBeGreaterThan(0.15);
  expect(storyStage('opening', 0, false, false).beat).toBe('ferry');
  const middle = storyStage('opening', 3600, false, false);
  expect(middle.beat).toBe('light');
  expect(middle.widening).toBeGreaterThan(0.25);
  expect(middle.widening).toBeLessThan(0.75);
  expect(storyStage('opening', 7200, false, false)).toEqual(
    storyStage('opening', 100, true, false),
  );
  expect(storyStage('opening', 7200, false, false)).toMatchObject({
    beat: 'crossing',
    nod: 0,
    turn: 0,
    hop: 0,
    widening: 1,
    settled: true,
  });
});

test('short landscape uses two stable composed shots rather than camera motion through the acknowledgment', () => {
  expect(storyStage('opening', 0, false, true).widening).toBe(0);
  expect(storyStage('opening', 2100, false, true).widening).toBe(0);
  expect(storyStage('opening', 2200, false, true).widening).toBe(1);
  expect(storyStage('opening', 7000, false, true).widening).toBe(1);
  expect(storyStage('another-bell', 1750, false, true).widening).toBe(0);
  expect(storyStage('another-bell', 1800, false, true).widening).toBe(1);
});

test('Harbor has one bounded hop and turn, returning completely to rest before its endpoint', () => {
  const alive = storyStage('another-bell', 975, false, false);
  expect(alive.hop).toBeCloseTo(0.17);
  expect(alive.turn).toBeGreaterThan(0.9);
  expect(storyStage('another-bell', 4000, false, false)).toEqual(
    storyStage('another-bell', 975, true, false),
  );
  expect(storyStage('another-bell', 4000, false, false)).toMatchObject({
    beat: 'water',
    hop: 0,
    turn: 0,
    widening: 1,
    settled: true,
  });
});

test.each([
  [320, 740],
  [390, 844],
  [780, 320],
  [844, 390],
  [1440, 900],
])('authored framing protects its initial and final subjects at %s×%s', (width, height) => {
  const usable = {
    left: 16,
    right: width - 16,
    top: 16,
    bottom: height - (width < height ? 200 : 120),
  };
  const close = { minX: 1, maxX: 3, minY: 1, maxY: 3 };
  const wide = { minX: -4, maxX: 4, minY: -1, maxY: 6 };
  for (const [time, bounds] of [
    [0, close],
    [7200, wide],
  ] as const) {
    const shot = storyCameraFrame(
      close,
      wide,
      storyStage('opening', time, false, width > height && height <= 420),
      usable,
      width,
      height,
    );
    for (const [x, y] of [
      [bounds.minX, bounds.minY],
      [bounds.maxX, bounds.maxY],
    ]) {
      const px = ((x - shot.frame.left) / (shot.frame.right - shot.frame.left)) * width;
      const py = ((shot.frame.top - y) / (shot.frame.top - shot.frame.bottom)) * height;
      expect(px).toBeGreaterThanOrEqual(usable.left + 16 - 1e-8);
      expect(px).toBeLessThanOrEqual(usable.right - 16 + 1e-8);
      expect(py).toBeGreaterThanOrEqual(usable.top + 12 - 1e-8);
      expect(py).toBeLessThanOrEqual(usable.bottom - 12 + 1e-8);
    }
  }
});

test('actual Moss head meshes acknowledge once without moving deck feet or changing state/history, and clear restores all transforms', () => {
  const { world, moss, pip, rue, route, hiddenRoute, marker } = fixture();
  const before = {
    state: structuredClone(world.state),
    poses: world.poses.presentation(),
    camera: frame(world),
    moss: pose(moss),
    pip: pose(pip),
    rue: pose(rue),
  };
  world.presentStory('opening', 950, false);
  expect(moss.position.toArray()).toEqual(before.moss.position);
  expect(moss.rotation.y).toBeGreaterThan(0.15);
  expect(pose(moss).children).not.toEqual(before.moss.children);
  expect(moss.children.slice(0, 4).map((part) => part.position.toArray())).toEqual(
    before.moss.children.slice(0, 4).map((part) => part.position),
  );
  const first = pose(moss);
  world.presentStory('opening', 950, false);
  expect(pose(moss)).toEqual(first);
  expect(world.state).toEqual(before.state);
  expect(world.poses.presentation()).toEqual(before.poses);
  expect(route.visible).toBe(false);
  expect(marker.visible).toBe(false);
  world.clearStory();
  expect(pose(moss)).toEqual(before.moss);
  expect(pose(pip)).toEqual(before.pip);
  expect(pose(rue)).toEqual(before.rue);
  expect(frame(world)).toEqual(before.camera);
  expect(route.visible).toBe(true);
  expect(hiddenRoute.visible).toBe(false);
  expect(marker.visible).toBe(true);
  expect(world.onArrival).not.toHaveBeenCalled();
});

test('actual safe Harbor acknowledgment is temporary, does not reboard neighbors, and reduced/restored settlement is motionless', () => {
  const { world, pip, rue, moss } = fixture(true);
  const before = {
    state: structuredClone(world.state),
    pip: pose(pip),
    rue: pose(rue),
    moss: pose(moss),
  };
  world.presentStory('another-bell', 975, false);
  expect(pip.position.y - before.pip.position[1]).toBeCloseTo(0.17);
  expect(pip.rotation.y).not.toBe(0);
  expect(pose(rue)).toEqual(before.rue);
  expect(pose(moss)).toEqual(before.moss);
  expect(world.state).toEqual(before.state);
  world.presentStory('another-bell', 975, true);
  expect(pose(pip)).toEqual(before.pip);
  expect(world.storyPresentation().stage?.settled).toBe(true);
  const settled = frame(world);
  world.clearStory();
  world.reduced = true;
  world.presentStory('another-bell', 975, false);
  expect(frame(world)).toEqual(settled);
  expect(pose(pip)).toEqual(before.pip);
  expect(world.state).toEqual(before.state);
  expect(world.onArrival).not.toHaveBeenCalled();
});

test('Moss turns toward the orthographic viewer in deck-local coordinates at the Stone berth, then returns to its original heading', () => {
  const { world, moss } = fixture();
  world.boatRoot.rotation.y = Math.PI / 2;
  world.scene.updateMatrixWorld(true);
  const feetY = moss.children.slice(0, 4).map((part) => part.position.y);
  world.presentStory('opening', 1100, false);
  expect(moss.rotation.y).toBeLessThan(-0.5);
  expect(moss.rotation.y).toBeGreaterThanOrEqual(-0.6);
  expect(moss.children.slice(0, 4).map((part) => part.position.y)).toEqual(feetY);
  expect(world.boatRoot.rotation.y).toBe(Math.PI / 2);
  world.presentStory('opening', 7200, true);
  expect(moss.rotation.y).toBe(0);
  expect(world.boatRoot.rotation.y).toBe(Math.PI / 2);
});

test.each([
  [320, 740, 520],
  [780, 320, 210],
  [844, 390, 275],
])(
  'the Harbor close shot protects the full ferry and safe trio above the caption at %s×%s',
  (width, height, bottom) => {
    const { world } = fixture(true);
    Object.assign(world.host, { clientWidth: width, clientHeight: height });
    const usable = { left: 16, right: width - 16, top: 16, bottom };
    world.setUsableRectangle(usable);
    for (const elapsed of [0, 975]) {
      world.presentStory('another-bell', elapsed, false);
      const subjects = world
        .storyPresentation()
        .subjects.filter((subject) => subject.id !== 'lighthouse');
      expect(subjects.map((subject) => subject.id).sort()).toEqual([
        'ferry',
        'rabbit-1',
        'rabbit-2',
        'sheep-1',
      ]);
      for (const subject of subjects) {
        expect(subject.left).toBeGreaterThanOrEqual(usable.left + 12);
        expect(subject.right).toBeLessThanOrEqual(usable.right - 12);
        expect(subject.top).toBeGreaterThanOrEqual(usable.top + 12);
        expect(subject.bottom).toBeLessThanOrEqual(usable.bottom - 12);
      }
    }
  },
);
