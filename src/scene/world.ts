import * as T from 'three';
import { level as baseline, type Level } from '../levels/level';
import { draft, edgeTo, type State, type Action } from '../game/rules';
import { animal, ball, box, cylinder, ferry, lighthouse, mat, mesh, pine } from './models';
import { sampleJourney, type JourneyPlan } from './motion';
import { PresentationPoses } from './poses';
import {
  clampViewFocus,
  overviewScale,
  panViewFocus,
  phonePlayScale,
  usableViewRectangle,
  viewFrame,
  type ViewBounds,
  type ViewPoint,
  type ViewRectangle,
} from './view';
import {
  bridgeBowOffset,
  deckEntryZ,
  firstRabbitDeckZ,
  sampleDeckTransfer,
  transferHeading,
} from './deck-transfer';
import { sceneLayout, type SceneLayout } from './layout';
import { bellLandmark, cottage } from './scenery';
import { getLevelPaths, type CanonicalPath } from './paths';
import { Shores, createReedBeds } from './shore';
import { CoastalWater } from './water';
import { CrossingEffects } from './effects';
import { contactMaterial } from './contact';
import { TransferTimeline, type TransferCue } from './transfer';
import {
  acknowledgmentPose,
  HomecomingTimeline,
  rectanglesOverlap,
  type HomecomingRectangle,
} from './homecoming';
import {
  journeyTiming,
  settlingProgress,
  transitionPlan,
  type JourneyTiming,
  type TransitionPlan,
  type CompletionReason,
} from './transitions';
const V = (p: number[], y = 0) => new T.Vector3(p[0], y, p[1]);
const smooth = (t: number) => t * t * (3 - 2 * t);
type TransferPresentation = {
  id: number;
  timeline: TransferTimeline;
  completion: CompletionReason | null;
};
export class World {
  scene = new T.Scene();
  camera = new T.OrthographicCamera();
  renderer: T.WebGLRenderer;
  boatRoot = new T.Group();
  hull = ferry();
  animals = new Map<string, T.Group>();
  passengerAnchors = new Map<string, T.Object3D>();
  markers = new Map<string, T.Group>();
  routes = new Map<string, T.Line>();
  navigationCurrent = '';
  navigationSelected: string | null = null;
  navigationEmphasis: string | null = null;
  placeObjects = new Map<string, T.Object3D[]>();
  pickTargets: { id: string; kind: string; object: T.Object3D }[] = [];
  nonInteractivePlaces: T.Object3D[] = [];
  framePoints: T.Vector3[] = [];
  ferryEnvelope = { radius: 0, bottom: 0, top: 0 };
  raycaster = new T.Raycaster();
  forecast = new T.Group();
  water: T.Mesh;
  shadow: T.Mesh;
  state: State;
  layout: SceneLayout;
  paths: Map<string, CanonicalPath>;
  poses: PresentationPoses;
  shores: Shores;
  coastalWater: CoastalWater;
  effects: CrossingEffects;
  home!: ReturnType<typeof lighthouse>;
  contactMeshes: T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>[] = [];
  journeyFrame: { progress: number; distance: number; tangent: T.Vector3 } | null = null;
  reduced = false;
  homecoming = new HomecomingTimeline();
  completionBounds: HomecomingRectangle | null = null;
  canonicalFrame: HomecomingRectangle | null = null;
  homecomingCameraFactor = 1;
  homecomingCameraTarget = 1;
  homecomingCameraFallback = 'ordinary';
  homecomingCameraSuppressed = false;
  cameraRevision = 0;
  layoutRevision = 0;
  layoutWaterY = Number.NaN;
  onViewChange: () => void = () => {};
  onFrame: () => void = () => {};
  viewMode: 'play' | 'overview' = 'play';
  viewPanned = false;
  viewLocation: string | null = null;
  measuredUsable: ViewRectangle | null = null;
  viewBounds: ViewBounds | null = null;
  viewFocus: ViewPoint | null = null;
  viewScale = 1;
  layoutStaticBounds = new Map<string, T.Box3>();
  layoutAnimalBounds = new Map<string, T.Box3>();
  layoutHullBounds = new T.Box3();
  homecomingFocus = new T.Vector2();
  timing: JourneyTiming = journeyTiming;
  disposed = false;
  frameRequest = 0;
  resizeObserver: ResizeObserver;
  onPresentationStart: (action: Action) => void = () => {};
  onArrival: () => void = () => {};
  onTransferContact: (contact: TransferCue) => void = () => {};
  transferSequence = 0;
  transferHistory: TransferPresentation[] = [];
  transition: null | {
    before: State;
    after: State;
    action: Action;
    start: number;
    duration: number;
    tideDuration: number;
    started: boolean;
    done: (reason: CompletionReason) => void;
    positions: Map<string, T.Vector3>;
    path: CanonicalPath | null;
    edgeId: string | null;
    reverse: boolean;
    journey: JourneyPlan | null;
    fromHullY: number;
    transfer: TransferPresentation | null;
  } = null;
  frame = 0;
  lastTime = 0;
  onSelect: (id: string) => void = () => {};
  onCurrent: () => void = () => {};
  onClear: () => void = () => {};
  constructor(
    public host: HTMLElement,
    state: State,
    public level: Level = baseline,
  ) {
    this.state = state;
    this.layout = sceneLayout(this.level.id);
    this.paths = getLevelPaths(this.level);
    this.poses = new PresentationPoses(this.level);
    this.renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFShadowMap;
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    host.append(this.renderer.domElement);
    this.renderer.domElement.setAttribute(
      'aria-label',
      `${this.level.title}. Use the labeled waypoint controls to navigate.`,
    );
    const light = this.layout.light;
    this.scene.background = new T.Color(light?.background ?? '#245f70');
    this.scene.add(new T.HemisphereLight(light?.sky ?? '#fff1dc', light?.ground ?? '#5f8c9a', 1.9));
    const sun = new T.DirectionalLight(light?.sun ?? '#ffe0af', 2.4);
    sun.position.set(...(light?.sunPosition ?? [-8, 16, 7]));
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -13,
      right: 13,
      top: 13,
      bottom: -13,
      near: 1,
      far: 45,
    });
    sun.shadow.normalBias = 0.035;
    sun.shadow.bias = -0.0003;
    this.scene.add(sun);
    this.coastalWater = new CoastalWater(this.level, this.paths);
    this.coastalWater.setLighting(
      sun.position,
      new T.Color(light?.sky ?? '#fff1dc'),
      new T.Color(light?.sun ?? '#ffe0af'),
    );
    this.water = this.coastalWater.mesh;
    this.scene.add(this.water);
    this.shadow = new T.Mesh(
      new T.PlaneGeometry(40, 40),
      new T.ShadowMaterial({ color: '#123c41', opacity: 0.16 }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.008;
    this.shadow.receiveShadow = true;
    this.scene.add(this.shadow);
    this.shores = new Shores(this.level, this.layout.islandStyles);
    this.hull.traverse((object) => {
      if (object instanceof T.Mesh && object.name === 'water-contact-hull') {
        object.material = contactMaterial(object.material, this.shores.water, 'hull');
        this.contactMeshes.push(object);
      }
    });
    this.scene.add(this.shores.group, this.shores.contacts);
    for (const island of this.level.world.islands) {
      const node = this.level.piers.find((pier) => pier.islandId === island.id)?.nodeId;
      const decoration = this.island(island);
      const shore = this.shores.entries.find((entry) => entry.island.id === island.id)!;
      if (node) {
        this.registerPlace(node, 'island', shore.mesh, shore.rocks, decoration);
      } else this.nonInteractivePlaces.push(shore.mesh, shore.rocks, decoration);
    }
    for (const p of this.level.piers) {
      const group = new T.Group();
      group.name = `pier-${p.id}`;
      this.scene.add(group);
      const [x, z] = p.positionXZ,
        end = p.landAnchorXZ[1],
        y = p.elevation * 0.18 - 0.06;
      for (let i = 0; i < 9; i++)
        box(
          group,
          this.layout.stonePiers.includes(p.id)
            ? i % 2
              ? '#a9b6ac'
              : '#899d97'
            : i % 2
              ? '#c09560'
              : '#b78b58',
          [p.width, 0.09, 0.14],
          [x, y, z + ((end - z) * i) / 8],
          0.015,
        );
      for (const px of [x - p.width / 2, x + p.width / 2])
        for (const pz of [z + 0.02, end]) {
          const pile = cylinder(group, '#79644a', 0.065, 0.07, 0.83, [px, y - 0.27, pz], 9);
          if (
            p.id === this.level.objective.deliveryPierId ||
            p.id === this.level.piers.find((pier) => pier.elevation < 3)?.id
          ) {
            pile.name = `water-contact-${p.id}`;
            pile.material = contactMaterial(
              pile.material as T.MeshStandardMaterial,
              this.shores.water,
              'pile',
            );
            this.contactMeshes.push(pile as T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>);
          }
          cylinder(group, '#dbc799', 0.075, 0.075, 0.055, [px, y + 0.17, pz], 9);
        }
      box(group, '#b68f5b', [0.35, 0.055, 0.49], [x, y - 0.015, z + 0.25], 0.015);
      cylinder(group, '#655b43', 0.025, 0.025, 0.65, [x + 0.36, y + 0.33, z - 0.1], 7);
      box(group, '#f5cb77', [0.13, 0.19, 0.13], [x + 0.36, y + 0.68, z - 0.1]);
      this.registerPlace(p.nodeId, 'pier', group);
    }
    for (const landmark of this.layout.landmarks) {
      const island = this.level.world.islands.find((island) => island.id === landmark.islandId)!;
      const [x, z] = landmark.positionXZ;
      const y = island.elevation * 0.18;
      const node = this.level.piers.find((pier) => pier.islandId === island.id)?.nodeId;
      if (landmark.kind === 'lighthouse') {
        const model = lighthouse(this.scene, x, y, z);
        const delivery = this.level.piers.find(
          (pier) => pier.id === this.level.objective.deliveryPierId,
        )!;
        if (island.id === delivery.islandId) this.home = model;
        if (node) this.registerPlace(node, 'landmark', model.group);
      } else {
        const model =
          landmark.kind === 'cottage'
            ? cottage(this.scene, [x, y, z])
            : bellLandmark(this.scene, [x, y, z]);
        if (node) this.registerPlace(node, 'landmark', model);
      }
    }
    for (const e of this.level.edges) {
      const pts = this.paths.get(e.id)!.points.map((p) => p.clone().setY(0.035));
      const geom = new T.BufferGeometry().setFromPoints(pts);
      const line = new T.Line(
        geom,
        new T.LineDashedMaterial({
          color: e.baseDepth < 3 ? '#b4d9c4' : '#89b8ba',
          dashSize: 0.09,
          gapSize: 0.16,
          transparent: true,
          opacity: 0.48,
        }),
      );
      line.computeLineDistances();
      this.scene.add(line);
      this.routes.set(e.id, line);
    }
    for (const n of this.level.nodes) {
      const g = new T.Group();
      g.position.copy(V(n.positionXZ, 0.05));
      this.scene.add(g);
      this.markers.set(n.id, g);
      const ring = mesh(new T.TorusGeometry(0.25, 0.025, 6, 36), '#f3db9a', g);
      ring.name = 'stop-ring';
      ring.rotation.x = Math.PI / 2;
      const halo = mesh(new T.TorusGeometry(0.37, 0.025, 6, 36), '#ffe09a', g);
      halo.name = 'selection-ring';
      halo.rotation.x = Math.PI / 2;
      const current = mesh(new T.TorusGeometry(0.44, 0.014, 6, 36), '#fff1d7', g);
      current.name = 'current-ring';
      current.rotation.x = Math.PI / 2;
      const blocked = new T.Group();
      blocked.name = 'blocked-cross';
      g.add(blocked);
      for (const angle of [-Math.PI / 4, Math.PI / 4]) {
        const bar = box(blocked, '#dca180', [0.34, 0.024, 0.045], [0, 0.01, 0], 0.008);
        bar.rotation.y = angle;
      }
      const remote = new T.LineLoop(
        new T.BufferGeometry().setFromPoints([
          V([0, -0.2]),
          V([0.2, 0]),
          V([0, 0.2]),
          V([-0.2, 0]),
        ]),
        new T.LineBasicMaterial({ color: '#8fada9', transparent: true, opacity: 0.65 }),
      );
      remote.name = 'nonadjacent-diamond';
      g.add(remote);
      if (!n.pierId && n.id !== 'cut') {
        cylinder(g, '#e2bf70', 0.055, 0.13, 0.2, [0, 0.07, 0], 10);
        cylinder(g, '#eee2bc', 0.025, 0.025, 0.25, [0, 0.28, 0], 7);
      }
      this.registerPlace(n.id, 'waypoint', g);
    }
    this.effects = new CrossingEffects(this.home, this.coastalWater.mask);
    this.scene.add(this.effects.wake, this.effects.glow, this.effects.sweep);
    this.forecast = this.shores.forecast;
    this.scene.add(this.forecast);
    this.boatRoot.add(this.hull);
    this.scene.add(this.boatRoot);
    for (const p of this.level.passengers) {
      const anchor = new T.Object3D();
      anchor.name = `deck-anchor-${p.id}`;
      const index = this.speciesIndex(p.id);
      anchor.position.set(
        ...((p.species === 'rabbit'
          ? index === 0
            ? [-0.22, 0.26, firstRabbitDeckZ]
            : [0.22, 0.26, 0.3]
          : [0, 0.26, 0.69]) as [number, number, number]),
      );
      this.hull.add(anchor);
      this.passengerAnchors.set(p.id, anchor);
      const g = animal(p.species, index);
      g.name = p.id;
      g.scale.set(
        p.species === 'rabbit' ? 1.25 : 1.15,
        p.species === 'rabbit' ? 1.65 : 1.5,
        p.species === 'rabbit' ? 1.25 : 1.15,
      );
      this.scene.add(g);
      this.animals.set(p.id, g);
    }
    this.sync(state);
    this.prepareFrame();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    this.renderer.domElement.addEventListener('click', (ev) => {
      if (this.transition || this.state.status !== 'playing') return;
      ev.stopPropagation();
      const bounds = host.getBoundingClientRect();
      const id = this.pickAt(ev.clientX - bounds.left, ev.clientY - bounds.top);
      if (id === this.state.boatNodeId) this.onCurrent();
      else if (id) this.onSelect(id);
      else this.onClear();
    });
    this.renderer.domElement.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault();
      this.cancel();
      this.clearMovement();
      this.settleHomecoming('context-loss');
    });
    this.frameRequest = requestAnimationFrame((t) => this.tick(t));
  }
  island(island: Level['world']['islands'][number]) {
    const group = new T.Group();
    group.name = `island-decoration-${island.id}`;
    this.scene.add(group);
    const points = island.footprintXZ,
      cx = points.reduce((a, p) => a + p[0], 0) / points.length,
      cz = points.reduce((a, p) => a + p[1], 0) / points.length;
    const height = island.elevation * 0.18;
    const style = this.layout.islandStyles[island.id] ?? 'garden';
    if (style === 'crag') {
      const rock = mesh(
        new T.DodecahedronGeometry(0.85, 0),
        '#87988d',
        group,
        -0.45,
        height + 0.25,
        2.5,
      );
      rock.scale.set(1.1, 0.85, 0.9);
      rock.rotation.y = 0.4;
      pine(group, 0.7, height, 2.5, 1.05);
      pine(group, -1.1, height, 2.7, 0.55);
    } else if (style === 'reeds') {
      group.add(createReedBeds(island));
      for (const x of [-0.8, 0.9])
        ball(group, '#c3ba93', [cx + x, height - 0.07, cz], [0.6, 0.045, 0.34]);
    } else if (style === 'rocky') {
      pine(group, cx - 1.05, height, cz - 0.35, 0.68);
      pine(group, cx + 1.02, height, cz - 0.3, 0.43);
    } else {
      pine(group, cx - 1.05, height, cz - 0.28, 0.85);
      pine(group, cx + 0.92, height, cz - 0.55, 0.65);
      for (let i = 0; i < 7; i++)
        box(
          group,
          '#d7c59d',
          [0.38, 0.035, 0.23],
          [cx + Math.sin(i * 0.7) * 0.12, height + 0.045, cz + 0.45 + i * 0.12],
          0.05,
        );
    }
    for (let i = 0; i < (style === 'reeds' || style === 'rocky' ? 10 : 25); i++) {
      const a = i * 2.399,
        r = 0.48 + (i % 5) * 0.17,
        x = cx + Math.cos(a) * r * 1.3,
        z = cz + Math.sin(a) * r * 0.7;
      if (style !== 'crag' && Math.abs(x - cx) < 0.68) continue;
      ball(group, i % 4 ? '#91a273' : '#f0e8c8', [x, height + 0.11, z], [0.045, 0.09, 0.045]);
    }
    if (style === 'garden')
      for (const side of [-1, 1]) {
        const x = cx + side * 1.05,
          z = cz + 0.25;
        ball(group, '#6f8b59', [x, height + 0.18, z], [0.3, 0.2, 0.23]);
        for (let j = 0; j < 5; j++) {
          const a = j * 2.4;
          ball(
            group,
            '#f5e9c5',
            [x + Math.sin(a) * 0.24, height + 0.3, z + Math.cos(a) * 0.17],
            [0.035, 0.035, 0.035],
          );
        }
        box(group, '#a37546', [0.24, 0.23, 0.24], [x, height + 0.11, cz + 0.65]);
        box(group, '#d1ae74', [0.25, 0.027, 0.027], [x, height + 0.2, cz + 0.78]);
      }
    return group;
  }
  setForecast(visible: boolean, tide: number) {
    this.forecast.visible = visible;
    this.shores.preview(visible, tide);
  }
  registerPlace(id: string, kind: string, ...objects: T.Object3D[]) {
    const existing = this.placeObjects.get(id) ?? [];
    for (const object of objects) {
      object.userData.locationId = id;
      object.userData.locationKind = kind;
      this.pickTargets.push({ id, kind, object });
      existing.push(object);
    }
    this.placeObjects.set(id, existing);
  }
  rectangle(objects: T.Object3D[]) {
    const bounds = new T.Box3();
    for (const object of objects) bounds.expandByObject(object);
    const points: T.Vector3[] = [];
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z])
          points.push(new T.Vector3(x, y, z).project(this.camera));
    const xs = points.map((p) => ((p.x + 1) * this.host.clientWidth) / 2),
      ys = points.map((p) => ((1 - p.y) * this.host.clientHeight) / 2);
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  }
  placeBounds(id: string) {
    return this.rectangle(this.placeObjects.get(id) ?? [this.markers.get(id)!]);
  }
  pickAt(x: number, y: number) {
    return this.pickDetailAt(x, y)?.id ?? null;
  }
  pickDetailAt(x: number, y: number): { id: string; kind: string } | null {
    this.scene.updateMatrixWorld(true);
    const boat = this.rectangle([this.boatRoot]);
    if (x >= boat.left - 4 && x <= boat.right + 4 && y >= boat.top - 4 && y <= boat.bottom + 4)
      return { id: this.state.boatNodeId, kind: 'ferry' };
    this.raycaster.setFromCamera(
      new T.Vector2((x / this.host.clientWidth) * 2 - 1, 1 - (y / this.host.clientHeight) * 2),
      this.camera,
    );
    const intersections = this.raycaster.intersectObjects(
      [...this.pickTargets.map((target) => target.object), ...this.nonInteractivePlaces],
      true,
    );
    for (const hit of intersections) {
      let object: T.Object3D | null = hit.object;
      while (object && !object.userData.locationId) object = object.parent;
      return object
        ? { id: object.userData.locationId as string, kind: object.userData.locationKind as string }
        : null;
    }
    let nearest: string | null = null,
      distance = 22;
    for (const node of this.level.nodes) {
      const p = this.project(node.positionXZ),
        d = Math.hypot(p.x - x, p.y - y);
      if (d < distance) {
        nearest = node.id;
        distance = d;
      }
    }
    return nearest ? { id: nearest, kind: 'waypoint' } : null;
  }
  prepareFrame() {
    this.scene.updateMatrixWorld(true);
    const inverseHull = this.hull.matrixWorld.clone().invert();
    let radius = 0,
      low = Infinity,
      high = -Infinity;
    const measure = (root: T.Object3D, origin?: T.Vector3, anchor?: T.Vector3) => {
      root.traverse((object) => {
        if (!(object instanceof T.Mesh)) return;
        if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
        const box = object.geometry.boundingBox!;
        for (const x of [box.min.x, box.max.x])
          for (const y of [box.min.y, box.max.y])
            for (const z of [box.min.z, box.max.z]) {
              const point = new T.Vector3(x, y, z).applyMatrix4(object.matrixWorld);
              if (origin && anchor) point.sub(origin).add(anchor);
              else point.applyMatrix4(inverseHull);
              radius = Math.max(radius, Math.hypot(point.x, point.z));
              low = Math.min(low, point.y);
              high = Math.max(high, point.y);
            }
      });
    };
    measure(this.hull);
    for (const [id, animal] of this.animals)
      if (!this.state.aboard.includes(id))
        measure(
          animal,
          animal.getWorldPosition(new T.Vector3()),
          this.passengerAnchors.get(id)!.position,
        );
    const offsets = this.level.rules.draftBands.map((band) => 0.03 - (band.draft - 1) * 0.075);
    const maximumWater =
      Math.max(
        this.level.rules.tide.initialLevel,
        ...this.level.rules.tide.rises.map((rise) => rise.level),
      ) * this.level.world.waterYPerTideLevel;
    this.ferryEnvelope = {
      radius: radius + 0.02,
      bottom: low + Math.min(...offsets) - 0.012,
      top: high + maximumWater + Math.max(...offsets) + 0.012,
    };
    const add = (bounds: T.Box3) => {
      if (bounds.isEmpty()) return;
      for (const x of [bounds.min.x, bounds.max.x])
        for (const y of [bounds.min.y, bounds.max.y])
          for (const z of [bounds.min.z, bounds.max.z])
            this.framePoints.push(new T.Vector3(x, y, z));
    };
    for (const object of this.scene.children) {
      if (
        object === this.water ||
        object === this.shadow ||
        object === this.boatRoot ||
        object === this.forecast ||
        object.userData.excludeFromFrame ||
        [...this.animals.values()].includes(object as T.Group) ||
        [...this.markers.values()].includes(object as T.Group) ||
        [...this.routes.values()].includes(object as T.Line)
      )
        continue;
      add(new T.Box3().setFromObject(object));
    }
    for (const path of this.paths.values())
      for (const point of path.points)
        add(
          new T.Box3(
            new T.Vector3(
              point.x - this.ferryEnvelope.radius,
              this.ferryEnvelope.bottom,
              point.z - this.ferryEnvelope.radius,
            ),
            new T.Vector3(
              point.x + this.ferryEnvelope.radius,
              this.ferryEnvelope.top,
              point.z + this.ferryEnvelope.radius,
            ),
          ),
        );
    for (const pier of this.level.piers)
      add(
        new T.Box3(
          V(
            [pier.landAnchorXZ[0] - 0.75, Math.min(pier.positionXZ[1], pier.landAnchorXZ[1]) - 0.5],
            pier.elevation * 0.18,
          ),
          V(
            [
              pier.landAnchorXZ[0] + 0.85,
              Math.max(pier.positionXZ[1], pier.landAnchorXZ[1]) + 0.35,
            ],
            pier.elevation * 0.18 + 1.35,
          ),
        ),
      );
    for (const node of this.level.nodes)
      this.layoutStaticBounds.set(
        node.id,
        new T.Box3().setFromObject(
          this.placeObjects.get(node.id)?.[0] ?? this.markers.get(node.id)!,
        ),
      );
    for (const [id, objects] of this.placeObjects) {
      const bounds = new T.Box3();
      for (const object of objects) bounds.union(new T.Box3().setFromObject(object));
      this.layoutStaticBounds.set(id, bounds);
    }
    this.layoutStaticBounds.set('lighthouse', new T.Box3().setFromObject(this.home.group));
    const bell = this.scene.getObjectByName('bell-landmark');
    if (bell) this.layoutStaticBounds.set('bell', new T.Box3().setFromObject(bell));
    this.layoutHullBounds = this.localGeometryBounds(this.hull, new Set(this.animals.values()));
    for (const [id, animal] of this.animals)
      this.layoutAnimalBounds.set(id, this.localGeometryBounds(animal));
  }
  project(p: number[], height = this.water.position.y + 0.04) {
    const v = V(p, height).project(this.camera);
    return {
      x: ((v.x + 1) * this.host.clientWidth) / 2,
      y: ((1 - v.y) * this.host.clientHeight) / 2,
    };
  }
  private localGeometryBounds(root: T.Object3D, excluded = new Set<T.Object3D>()) {
    const bounds = new T.Box3(),
      inverse = root.matrixWorld.clone().invert();
    root.traverse((object) => {
      if (!(object instanceof T.Mesh)) return;
      for (
        let parent: T.Object3D | null = object;
        parent && parent !== root;
        parent = parent.parent
      )
        if (excluded.has(parent)) return;
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      const source = object.geometry.boundingBox!;
      for (const x of [source.min.x, source.max.x])
        for (const y of [source.min.y, source.max.y])
          for (const z of [source.min.z, source.max.z])
            bounds.expandByPoint(
              new T.Vector3(x, y, z).applyMatrix4(object.matrixWorld).applyMatrix4(inverse),
            );
    });
    return bounds;
  }
  private projectBounds(bounds: T.Box3, transform?: T.Matrix4) {
    const points: T.Vector3[] = [];
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new T.Vector3(x, y, z);
          if (transform) point.applyMatrix4(transform);
          points.push(point.project(this.camera));
        }
    const xs = points.map((point) => ((point.x + 1) * this.host.clientWidth) / 2);
    const ys = points.map((point) => ((1 - point.y) * this.host.clientHeight) / 2);
    const left = Math.min(...xs),
      right = Math.max(...xs),
      top = Math.min(...ys),
      bottom = Math.max(...ys);
    return { left, right, top, bottom, width: right - left, height: bottom - top };
  }
  layoutFrameStatus() {
    this.scene.updateMatrixWorld(true);
    const passengers = [...this.animals].map(([id, animal]) => ({
      id,
      ...this.projectBounds(this.layoutAnimalBounds.get(id)!, animal.matrixWorld),
    }));
    const hull = this.projectBounds(this.layoutHullBounds, this.hull.matrixWorld);
    const aboard = passengers.filter(({ id }) => this.state.aboard.includes(id));
    const boat = {
      left: Math.min(hull.left, ...aboard.map((animal) => animal.left)),
      right: Math.max(hull.right, ...aboard.map((animal) => animal.right)),
      top: Math.min(hull.top, ...aboard.map((animal) => animal.top)),
      bottom: Math.max(hull.bottom, ...aboard.map((animal) => animal.bottom)),
    };
    return {
      boat,
      passengers,
      lighthouse: this.projectBounds(this.layoutStaticBounds.get('lighthouse')!),
      bell: this.layoutStaticBounds.has('bell')
        ? this.projectBounds(this.layoutStaticBounds.get('bell')!)
        : null,
      places: this.level.nodes.map(({ id }) => ({
        id,
        ...this.projectBounds(this.layoutStaticBounds.get(id)!),
      })),
      nodes: this.level.nodes.map((node) => ({ id: node.id, ...this.project(node.positionXZ) })),
    };
  }
  private usableRectangle() {
    return usableViewRectangle(this.host.clientWidth, this.host.clientHeight, this.measuredUsable);
  }
  setUsableRectangle(rectangle: ViewRectangle) {
    if (
      this.measuredUsable &&
      (Object.keys(rectangle) as (keyof ViewRectangle)[]).every(
        (key) => Math.abs(rectangle[key] - this.measuredUsable![key]) < 0.5,
      )
    )
      return;
    this.measuredUsable = { ...rectangle };
    this.reframeView();
  }
  setViewMode(mode: 'play' | 'overview') {
    this.viewMode = mode;
    this.viewPanned = false;
    this.viewLocation = null;
    this.viewFocus = null;
    this.reframeView();
    this.onViewChange();
  }
  backToBoat() {
    this.setViewMode('play');
  }
  panByPixels(deltaX: number, deltaY: number) {
    if (!this.viewBounds || !this.viewFocus || this.homecoming.active || this.transition) return;
    this.viewFocus = panViewFocus(this.viewFocus, deltaX, deltaY, this.viewScale);
    this.viewPanned = true;
    this.viewLocation = null;
    this.reframeView();
    this.onViewChange();
  }
  frameLocation(id: string) {
    if (this.viewMode === 'overview' || this.viewLocation === id || this.transition) return;
    const node = this.level.nodes.find((node) => node.id === id);
    if (!node) return;
    const screen = this.project(node.positionXZ),
      usable = this.usableRectangle();
    if (
      screen.x >= usable.left + 36 &&
      screen.x <= usable.right - 36 &&
      screen.y >= usable.top + 36 &&
      screen.y <= usable.bottom - 36
    )
      return;
    const focus = V(node.positionXZ).applyMatrix4(this.camera.matrixWorldInverse);
    this.viewFocus = { x: focus.x, y: focus.y + 0.8 };
    this.viewLocation = id;
    this.viewPanned = false;
    this.reframeView();
  }
  viewStatus() {
    return {
      mode: this.viewMode,
      panned: this.viewPanned,
      focused: this.viewLocation,
      revision: this.cameraRevision,
      scale: this.viewScale,
      usable: this.usableRectangle(),
      bounds: this.viewBounds ? { ...this.viewBounds } : null,
      focus: this.viewFocus ? { ...this.viewFocus } : null,
    };
  }
  private activeViewFocus() {
    const point = this.boatRoot.position.clone();
    point.y = 0;
    point.applyMatrix4(this.camera.matrixWorldInverse);
    return { x: point.x, y: point.y + 0.8 };
  }
  private viewChanged() {
    this.camera.updateProjectionMatrix();
    this.coastalWater.setView(this.camera);
    this.cameraRevision++;
    this.layoutRevision++;
    this.onViewChange();
  }
  private reframeView() {
    if (!this.viewBounds) return;
    const width = this.host.clientWidth,
      height = this.host.clientHeight;
    let usable = this.usableRectangle();
    const phone = width <= 1000 && height <= 1000;
    const overview = overviewScale(this.viewBounds, usable);
    this.viewScale =
      this.viewMode === 'play' && phone ? phonePlayScale(this.viewBounds, usable) : overview;
    let focus = this.viewFocus;
    let harborFrame = false;
    if (this.viewMode === 'overview' && !this.viewPanned)
      focus = {
        x: (this.viewBounds.minX + this.viewBounds.maxX) / 2,
        y: (this.viewBounds.minY + this.viewBounds.maxY) / 2,
      };
    else if (!this.viewPanned && !this.viewLocation) focus = this.activeViewFocus();
    if (!phone && this.viewMode === 'play' && !this.viewPanned && !this.viewLocation)
      focus = {
        x: (this.viewBounds.minX + this.viewBounds.maxX) / 2,
        y: (this.viewBounds.minY + this.viewBounds.maxY) / 2,
      };
    if (
      phone &&
      this.viewMode === 'play' &&
      this.state.status === 'won' &&
      !this.transition &&
      !this.viewPanned &&
      !this.viewLocation
    ) {
      harborFrame = true;
      if (this.completionBounds) {
        const card = this.completionBounds;
        const left = { ...usable, right: Math.min(usable.right, card.left - 12) };
        const above = { ...usable, bottom: Math.min(usable.bottom, card.top - 12) };
        const right = { ...usable, left: Math.max(usable.left, card.right + 12) };
        const below = { ...usable, top: Math.max(usable.top, card.bottom + 12) };
        const candidates = [left, right, above, below].filter(
          (rect) => rect.right - rect.left >= 140 && rect.bottom - rect.top >= 140,
        );
        if (candidates.length)
          usable = candidates.sort(
            (a, b) =>
              (b.right - b.left) * (b.bottom - b.top) - (a.right - a.left) * (a.bottom - a.top),
          )[0];
      }
      this.scene.updateMatrixWorld(true);
      const subjects = new T.Box3().setFromObject(this.home.group);
      subjects.union(new T.Box3().setFromObject(this.boatRoot));
      for (const animal of this.animals.values())
        subjects.union(new T.Box3().setFromObject(animal));
      const points: T.Vector3[] = [];
      for (const x of [subjects.min.x, subjects.max.x])
        for (const y of [subjects.min.y, subjects.max.y + 0.2])
          for (const z of [subjects.min.z, subjects.max.z])
            points.push(new T.Vector3(x, y, z).applyMatrix4(this.camera.matrixWorldInverse));
      const local = new T.Box3().setFromPoints(points);
      const bounds = { minX: local.min.x, maxX: local.max.x, minY: local.min.y, maxY: local.max.y };
      this.viewScale = Math.min(this.viewScale, overviewScale(bounds, usable));
      focus = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
    }
    focus = harborFrame
      ? focus!
      : clampViewFocus(focus ?? this.activeViewFocus(), this.viewBounds, usable, this.viewScale);
    this.viewFocus = focus;
    const frame = viewFrame(width, height, usable, this.viewScale, focus);
    const changed =
      !this.canonicalFrame ||
      (Object.keys(frame) as (keyof ViewRectangle)[]).some(
        (key) => Math.abs(frame[key] - this.canonicalFrame![key]) > 1e-7,
      );
    if (!changed) return;
    this.canonicalFrame = frame;
    Object.assign(this.camera, frame);
    this.homecomingCameraFactor = 1;
    this.viewChanged();
    if (this.homecoming.active) {
      this.fitHomecomingCamera();
      if (!this.homecoming.finite) this.applyHomecomingCamera(this.homecomingCameraTarget);
    }
  }
  resize() {
    const w = this.host.clientWidth,
      h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    let anchor: T.Vector3 | null = null;
    if (this.viewPanned && this.viewFocus) {
      anchor = new T.Vector3(this.viewFocus.x, this.viewFocus.y, -1).applyMatrix4(
        this.camera.matrixWorld,
      );
      const direction = this.camera.getWorldDirection(new T.Vector3());
      if (Math.abs(direction.y) > 0.001) anchor.addScaledVector(direction, -anchor.y / direction.y);
    }
    this.camera.near = 0.1;
    this.camera.far = 100;
    const smallLandscape = matchMedia('(max-height: 480px) and (min-width: 701px)').matches;
    this.camera.position.set(
      ...(smallLandscape && this.layout.landscapeCameraPosition
        ? this.layout.landscapeCameraPosition
        : this.layout.cameraPosition),
    );
    this.camera.lookAt(0, 0, 0.05);
    this.camera.updateMatrixWorld(true);
    if (this.viewLocation) {
      const node = this.level.nodes.find((node) => node.id === this.viewLocation)!;
      const point = V(node.positionXZ).applyMatrix4(this.camera.matrixWorldInverse);
      this.viewFocus = { x: point.x, y: point.y + 0.8 };
    } else if (anchor) {
      anchor.applyMatrix4(this.camera.matrixWorldInverse);
      this.viewFocus = { x: anchor.x, y: anchor.y };
    }
    const points = this.framePoints.map((point) =>
      point.clone().applyMatrix4(this.camera.matrixWorldInverse),
    );
    const bounds = new T.Box3().setFromPoints(points);
    this.viewBounds = {
      minX: bounds.min.x,
      maxX: bounds.max.x,
      minY: bounds.min.y,
      maxY: bounds.max.y,
    };
    this.reframeView();
  }
  setReducedMotion(reduced: boolean) {
    if (this.reduced === reduced) return;
    this.reduced = reduced;
    if (reduced) {
      if (this.transition) this.cancel();
      this.clearMovement();
      this.homecomingCameraSuppressed = true;
      this.settleHomecoming('reduced-motion');
      this.restoreCamera();
    }
    this.coastalWater.update(this.water.position.y, reduced ? 0 : this.lastTime * 0.001);
  }
  setCompletionBounds(bounds: HomecomingRectangle | null) {
    const previous = this.completionBounds;
    this.completionBounds = bounds ? { ...bounds } : null;
    if (
      this.homecoming.active &&
      (previous?.left !== bounds?.left ||
        previous?.right !== bounds?.right ||
        previous?.top !== bounds?.top ||
        previous?.bottom !== bounds?.bottom)
    ) {
      this.reframeView();
      this.fitHomecomingCamera();
      if (!this.homecoming.finite) this.applyHomecomingCamera(this.homecomingCameraTarget);
    }
  }
  restoreCamera() {
    if (!this.canonicalFrame) return;
    const changed =
      this.camera.left !== this.canonicalFrame.left ||
      this.camera.right !== this.canonicalFrame.right ||
      this.camera.top !== this.canonicalFrame.top ||
      this.camera.bottom !== this.canonicalFrame.bottom;
    Object.assign(this.camera, this.canonicalFrame);
    this.homecomingCameraFactor = 1;
    if (changed) {
      this.viewChanged();
    }
  }
  resetHomecoming() {
    this.homecoming.reset();
    this.homecomingCameraSuppressed = false;
    this.homecomingCameraTarget = 1;
    this.homecomingCameraFallback = 'ordinary';
    this.completionBounds = null;
    this.restoreCamera();
  }
  beginHomecoming(time: number) {
    if (!this.homecoming.start(time, this.reduced)) return;
    this.homecomingCameraSuppressed = this.reduced;
    this.fitHomecomingCamera();
  }
  private fitHomecomingCamera() {
    this.homecomingCameraTarget = 1;
    if (!this.canonicalFrame || !this.homecoming.active) return;
    if (this.reduced || this.homecomingCameraSuppressed) {
      this.homecomingCameraFallback = this.reduced ? 'reduced-motion' : 'settled-without-replay';
      return;
    }
    if (this.viewMode === 'overview') {
      this.homecomingCameraFallback = 'whole-cove';
      return;
    }
    if (this.host.clientHeight <= 320) {
      this.homecomingCameraFallback = 'short-phone';
      return;
    }
    if (!this.completionBounds) {
      this.homecomingCameraFallback = 'awaiting-card';
      return;
    }
    this.scene.updateMatrixWorld(true);
    const boxes = [this.home.group, this.boatRoot, ...this.animals.values()].map((object) =>
      new T.Box3().setFromObject(object),
    );
    for (const box of boxes.slice(2)) box.max.y += 0.2;
    const harbor = new T.Box3();
    for (const box of boxes) harbor.union(box);
    const focus = harbor.getCenter(new T.Vector3()).applyMatrix4(this.camera.matrixWorldInverse);
    this.homecomingFocus.set(focus.x, focus.y);
    const candidate = this.camera.clone();
    const w = this.host.clientWidth,
      h = this.host.clientHeight,
      usable = this.usableRectangle();
    for (const factor of [1.09, 1.07, 1.05, 1.03, 1.015]) {
      this.assignHomecomingFrame(candidate, factor);
      candidate.updateProjectionMatrix();
      const fits = boxes.every((box) => {
        const points: T.Vector3[] = [];
        for (const x of [box.min.x, box.max.x])
          for (const y of [box.min.y, box.max.y])
            for (const z of [box.min.z, box.max.z])
              points.push(new T.Vector3(x, y, z).project(candidate));
        const projected = {
          left: Math.min(...points.map((point) => ((point.x + 1) * w) / 2)),
          right: Math.max(...points.map((point) => ((point.x + 1) * w) / 2)),
          top: Math.min(...points.map((point) => ((1 - point.y) * h) / 2)),
          bottom: Math.max(...points.map((point) => ((1 - point.y) * h) / 2)),
        };
        return (
          projected.left >= usable.left &&
          projected.right <= usable.right &&
          projected.top >= usable.top &&
          projected.bottom <= usable.bottom &&
          !rectanglesOverlap(projected, this.completionBounds!, 10)
        );
      });
      if (fits) {
        this.homecomingCameraTarget = factor;
        this.homecomingCameraFallback = factor === 1.09 ? 'none' : 'clamped-to-fit';
        return;
      }
    }
    this.homecomingCameraFallback = 'card-or-subject-fit';
  }
  private assignHomecomingFrame(camera: T.OrthographicCamera, factor: number) {
    if (!this.canonicalFrame) return;
    const base = this.canonicalFrame,
      width = (base.right - base.left) / factor,
      height = (base.top - base.bottom) / factor,
      centerX =
        this.homecomingFocus.x + ((base.left + base.right) / 2 - this.homecomingFocus.x) / factor,
      centerY =
        this.homecomingFocus.y + ((base.top + base.bottom) / 2 - this.homecomingFocus.y) / factor;
    camera.left = centerX - width / 2;
    camera.right = centerX + width / 2;
    camera.top = centerY + height / 2;
    camera.bottom = centerY - height / 2;
  }
  private applyHomecomingCamera(factor: number) {
    if (factor === this.homecomingCameraFactor) return;
    this.assignHomecomingFrame(this.camera, factor);
    this.homecomingCameraFactor = factor;
    this.viewChanged();
  }
  settleHomecoming(reason = 'recovery') {
    if (this.homecoming.finite && this.homecomingCameraTarget === 1)
      this.homecomingCameraSuppressed = true;
    this.homecoming.settle(reason);
    for (const [id, animal] of this.animals) {
      if (!this.state.delivered.includes(id)) continue;
      animal.position.copy(this.passengerPos(id, this.state));
      animal.rotation.set(0, 0, 0);
    }
    if (this.homecoming.active) {
      this.fitHomecomingCamera();
      this.applyHomecomingCamera(this.reduced ? 1 : this.homecomingCameraTarget);
    }
  }
  private updateHomecoming(time: number) {
    if (!this.homecoming.active || this.state.status !== 'won') return;
    this.homecoming.update(time);
    const elapsed = this.homecoming.elapsed(time);
    for (const [id, animal] of this.animals) {
      if (!this.state.delivered.includes(id)) continue;
      animal.position.copy(this.passengerPos(id, this.state));
      animal.rotation.set(0, 0, 0);
      if (this.homecoming.finite && !this.reduced) {
        const passenger = this.level.passengers.find((passenger) => passenger.id === id)!;
        const pose = acknowledgmentPose(
          passenger.species,
          this.level.passengers.indexOf(passenger),
          elapsed,
        );
        animal.position.y += pose.height;
        animal.rotation.x = pose.pitch;
      }
    }
    if (this.homecomingCameraSuppressed || this.reduced) this.applyHomecomingCamera(1);
    else {
      const progress = this.homecoming.finite ? smooth(Math.min(1, elapsed / 1000)) : 1;
      this.applyHomecomingCamera(1 + (this.homecomingCameraTarget - 1) * progress);
    }
  }
  speciesIndex(id: string) {
    const passenger = this.level.passengers.find((passenger) => passenger.id === id)!;
    return this.level.passengers
      .filter((p) => p.species === passenger.species)
      .findIndex((p) => p.id === id);
  }
  passengerPos(id: string, s: State) {
    if (s.aboard.includes(id)) {
      return this.passengerAnchors.get(id)!.getWorldPosition(new T.Vector3());
    }
    if (s.delivered.includes(id)) {
      const i = this.level.passengers.findIndex((p) => p.id === id);
      const p = this.level.piers.find((p) => p.id === this.level.objective.deliveryPierId)!;
      return new T.Vector3(
        p.landAnchorXZ[0] - 0.45 + i * 0.42,
        p.elevation * 0.18 + 0.03,
        p.landAnchorXZ[1] + 0.05 - i * 0.21,
      );
    }
    const p = this.level.piers.find((p) => s.waitingByPier[p.id].includes(id))!;
    const i = s.waitingByPier[p.id].indexOf(id);
    return new T.Vector3(
      p.positionXZ[0] +
        (this.layout.centeredWaitingPairs && s.waitingByPier[p.id].length > 1
          ? i % 2
            ? 0.21
            : -0.21
          : (i % 2) * 0.23),
      p.elevation * 0.18 - 0.005,
      p.positionXZ[1] - 0.12 - Math.floor(i / 2) * 0.3,
    );
  }
  draftY(s: State) {
    return 0.03 - (draft(s, this.level) - 1) * 0.075;
  }
  clearMovement() {
    this.effects.clearMovement();
  }
  sync(s: State, preserveEffects = false) {
    this.state = s;
    if (!preserveEffects) this.resetHomecoming();
    this.coastalWater.update(s.tideLevel * 0.18, this.reduced ? 0 : this.lastTime * 0.001);
    this.shores.update(this.water.position.y);
    this.setForecast(false, s.tideLevel);
    if (!preserveEffects) this.effects.reset();
    if (s.status === 'won' && !preserveEffects) {
      this.effects.settle(this.reduced);
      this.homecoming.restore();
      this.homecomingCameraSuppressed = true;
      this.homecomingCameraFallback = 'restored';
    }
    this.coastalWater.setHarbor(this.effects.glow.position, this.effects.arrivalIntensity);
    this.shadow.position.y = this.water.position.y + 0.008;
    const n = this.level.nodes.find((n) => n.id === s.boatNodeId)!;
    this.boatRoot.position.copy(V(n.positionXZ, s.tideLevel * 0.18));
    this.boatRoot.rotation.y = this.poses.heading;
    this.hull.position.y = this.draftY(s);
    for (const [id, g] of this.animals) {
      if (s.aboard.includes(id)) {
        this.passengerAnchors.get(id)!.add(g);
        g.position.set(0, 0, 0);
      } else {
        this.scene.add(g);
        g.position.copy(this.passengerPos(id, s));
      }
      g.rotation.set(0, 0, 0);
    }
    this.indicate(s);
    this.reframeView();
  }
  indicate(s: State, selected?: string, emphasis?: string) {
    const focus = emphasis ?? selected;
    const selectedEdge = focus ? edgeTo(s, focus, this.level) : undefined;
    this.navigationCurrent = s.boatNodeId;
    this.navigationSelected = selected && this.markers.has(selected) ? selected : null;
    this.navigationEmphasis = emphasis && this.markers.has(emphasis) ? emphasis : null;
    for (const [id, g] of this.markers) {
      const e = edgeTo(s, id, this.level);
      const status =
        id === s.boatNodeId
          ? 'current'
          : !e
            ? 'nonadjacent'
            : e.baseDepth + s.tideLevel < draft(s, this.level)
              ? 'too-shallow'
              : 'available';
      const active = id === this.navigationSelected;
      g.visible = true;
      const color =
        active || id === emphasis
          ? '#ffe09a'
          : status === 'too-shallow'
            ? '#d19272'
            : status === 'current'
              ? '#fff1d7'
              : '#cce2d6';
      const ring = g.getObjectByName('stop-ring') as T.Mesh;
      ring.material = mat(color);
      ring.visible = status !== 'nonadjacent';
      g.getObjectByName('selection-ring')!.visible = active;
      g.getObjectByName('current-ring')!.visible = status === 'current';
      g.getObjectByName('blocked-cross')!.visible = status === 'too-shallow';
      g.getObjectByName('nonadjacent-diamond')!.visible = status === 'nonadjacent';
      g.userData.navigationStatus = status;
      g.userData.selected = active;
      g.userData.emphasized = id === emphasis;
      g.scale.setScalar(active ? 1.15 : 1);
      g.position.y = s.tideLevel * 0.18 + 0.04;
    }
    for (const [id, line] of this.routes) {
      const e = this.level.edges.find((e) => e.id === id)!;
      line.position.y = s.tideLevel * 0.18;
      const m = line.material as T.LineDashedMaterial;
      const highlighted = selectedEdge?.id === id;
      line.userData.highlighted = highlighted;
      m.opacity = highlighted
        ? 1
        : selectedEdge
          ? 0.2
          : e.nodes.includes(s.boatNodeId)
            ? 0.85
            : 0.3;
      m.dashSize = highlighted ? 0.35 : 0.09;
      m.gapSize = highlighted ? 0.055 : 0.16;
      m.color.set(
        highlighted
          ? '#ffe09a'
          : e.baseDepth + s.tideLevel < draft(s, this.level)
            ? '#dca180'
            : '#a6d3cc',
      );
    }
  }
  plan(before: State, after: State, action: Action) {
    const edge = action.type === 'move' ? edgeTo(before, action.to, this.level) : undefined;
    return transitionPlan(
      action,
      after.status === 'won',
      edge ? this.paths.get(edge.id)!.length : 0,
      this.reduced,
      this.timing,
    );
  }
  animate(
    before: State,
    after: State,
    action: Action,
    done: (reason: CompletionReason) => void,
    planned: TransitionPlan = this.plan(before, after, action),
  ) {
    this.cancel();
    this.state = after;
    this.viewPanned = false;
    this.viewLocation = null;
    this.viewFocus = null;
    const positions = new Map(
      [...this.animals].map(([id, g]) => [id, g.getWorldPosition(new T.Vector3())]),
    );
    for (const [id, g] of this.animals)
      if (before.aboard.includes(id) && !after.aboard.includes(id)) this.scene.attach(g);
    let path: CanonicalPath | null = null;
    let edgeId: string | null = null;
    let reverse = false;
    if (action.type === 'move') {
      const edge = edgeTo(before, action.to, this.level)!;
      edgeId = edge.id;
      reverse = edge.nodes[0] !== before.boatNodeId;
      path = this.paths.get(edge.id)!;
      this.effects.beginMovement(
        performance.now(),
        this.boatRoot.position,
        this.boatRoot.rotation.y,
      );
    }
    this.journeyFrame = path
      ? {
          progress: 0,
          distance: 0,
          tangent: sampleJourney(this.poses.journey!, 0).tangent,
        }
      : null;
    const timeline = TransferTimeline.create(before, after, action, this.reduced);
    const transfer = timeline ? { id: ++this.transferSequence, timeline, completion: null } : null;
    if (transfer) {
      this.transferHistory.push(transfer);
      if (this.transferHistory.length > 12) this.transferHistory.shift();
    }
    this.transition = {
      before,
      after,
      action,
      start: performance.now(),
      duration: planned.duration,
      tideDuration: planned.tideDuration,
      started: false,
      done,
      positions,
      path,
      edgeId,
      reverse,
      journey: this.poses.journey,
      fromHullY: this.hull.position.y,
      transfer,
    };
    this.reframeView();
  }
  cancel(reason: CompletionReason = 'cancelled') {
    if (this.transition) {
      const t = this.transition;
      t.transfer?.timeline.cancel();
      this.transition = null;
      this.journeyFrame = null;
      let completion = reason;
      try {
        this.sync(t.after);
        this.renderer.render(this.scene, this.camera);
      } catch {
        completion = 'error';
      } finally {
        if (t.transfer) t.transfer.completion = completion;
        t.done(completion);
      }
    }
  }
  tick(time: number) {
    if (this.disposed) return;
    this.frame++;
    this.lastTime = time;
    if (this.transition) {
      const tr = this.transition;
      if (!tr.started) {
        tr.started = true;
        this.onPresentationStart(tr.action);
      }
      const t = Math.min(1, (time - tr.start) / tr.duration),
        k = smooth(t),
        tideProgress = smooth(settlingProgress(time - tr.start, tr));
      this.water.position.y = T.MathUtils.lerp(
        tr.before.tideLevel * 0.18,
        tr.after.tideLevel * 0.18,
        tideProgress,
      );
      if (tr.path) {
        const pose = sampleJourney(tr.journey!, t);
        this.boatRoot.position.copy(pose.position);
        this.boatRoot.rotation.y = pose.angle;
        this.journeyFrame = { progress: t, distance: pose.distance, tangent: pose.tangent };
      }
      this.boatRoot.position.y = this.water.position.y;
      this.hull.position.y = T.MathUtils.lerp(tr.fromHullY, this.draftY(tr.after), tideProgress);
      for (const [id, g] of this.animals) {
        const dest = this.passengerPos(id, tr.after);
        if (tr.before.aboard.includes(id) && tr.after.aboard.includes(id)) continue;
        if (tr.before.aboard.includes(id) !== tr.after.aboard.includes(id)) {
          const pier = this.level.piers.find((p) => p.nodeId === tr.before.boatNodeId)!;
          const passenger = this.level.passengers.find((passenger) => passenger.id === id)!;
          const offset =
            passenger.species === 'rabbit' ? (this.speciesIndex(id) ? 0.07 : -0.07) : 0;
          const bridge = new T.Vector3(
            pier.positionXZ[0] +
              T.MathUtils.clamp(
                Math.sin(this.boatRoot.rotation.y) * bridgeBowOffset + offset,
                -pier.width / 2,
                pier.width / 2,
              ),
            pier.elevation * 0.18 - 0.005,
            pier.positionXZ[1] + 0.46,
          );
          const land = new T.Vector3(
            pier.positionXZ[0] + offset,
            pier.elevation * 0.18 + 0.025,
            pier.landAnchorXZ[1] + 0.15,
          );
          const board = tr.after.aboard.includes(id);
          const side = Math.sign(this.hull.worldToLocal(bridge.clone()).x) || 1;
          const gate = this.hull.localToWorld(new T.Vector3(side * 0.51, 0.26, deckEntryZ));
          const corridor = this.hull.localToWorld(new T.Vector3(0, 0.26, deckEntryZ));
          g.position.copy(
            sampleDeckTransfer(board, tr.positions.get(id)!, bridge, gate, corridor, land, dest, k),
          );
          g.rotation.y = transferHeading(board, this.boatRoot.rotation.y, k);
          if (!this.reduced) {
            g.position.y += Math.sin(t * Math.PI * 4) ** 2 * 0.055;
            if (tr.after.status !== 'won' && tr.after.delivered.includes(id) && t > 0.72)
              g.rotation.x = Math.sin(((t - 0.72) / 0.28) * Math.PI * 2) * 0.12;
          }
        } else {
          g.position.copy(dest);
        }
      }
      this.shadow.position.y = this.water.position.y + 0.008;
      const contact = tr.transfer?.timeline.advance(t);
      if (contact) this.onTransferContact(contact);
      if (tr.after.status === 'won' && t > 0.72 && this.effects.arrivalStarted === null) {
        this.effects.arrive(time, this.reduced);
        this.onArrival();
      }
      if (t === 1) {
        if (tr.path) this.effects.finishMovement(time);
        if (tr.transfer) tr.transfer.completion = 'complete';
        this.transition = null;
        this.journeyFrame = null;
        this.sync(tr.after, true);
        if (tr.after.status === 'won') this.beginHomecoming(time);
        tr.done('complete');
      }
    } else {
      this.hull.position.y =
        this.draftY(this.state) + (this.reduced ? 0 : Math.sin(time * 0.0018) * 0.012);
    }
    if (this.transition?.path && this.viewMode === 'play') this.reframeView();
    this.updateHomecoming(time);
    this.shores.update(this.water.position.y);
    for (const route of this.routes.values()) route.position.y = this.water.position.y;
    for (const marker of this.markers.values()) marker.position.y = this.water.position.y + 0.04;
    if (this.layoutWaterY !== this.water.position.y) {
      this.layoutWaterY = this.water.position.y;
      this.layoutRevision++;
      this.onViewChange();
    }
    this.onFrame();
    this.effects.update(
      time,
      this.boatRoot.position,
      this.boatRoot.rotation.y,
      !!this.transition?.path,
      this.water.position.y,
      this.reduced,
      this.hull.position.y,
    );
    this.coastalWater.setHarbor(this.effects.glow.position, this.effects.arrivalIntensity);
    this.coastalWater.update(this.water.position.y, this.reduced ? 0 : time * 0.001);
    this.renderer.render(this.scene, this.camera);
    this.frameRequest = requestAnimationFrame((t) => this.tick(t));
  }
  transferPresentation() {
    const history = this.transferHistory.map(({ id, timeline, completion }) => ({
      id,
      ...timeline.presentation(),
      completion,
    }));
    return { sequence: this.transferSequence, last: history.at(-1) ?? null, history };
  }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameRequest);
    this.resizeObserver.disconnect();
    this.scene.remove(this.water);
    this.coastalWater.dispose();
    const geometries = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>(),
      textures = new Set<T.Texture>();
    this.scene.traverse((object) => {
      if (object instanceof T.Mesh || object instanceof T.Line || object instanceof T.Sprite) {
        if ('geometry' in object) geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material])
          materials.add(material);
      }
    });
    for (const material of materials) {
      for (const value of Object.values(material))
        if (value instanceof T.Texture) textures.add(value);
      material.dispose();
    }
    for (const geometry of geometries) geometry.dispose();
    for (const texture of textures) texture.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
  metrics() {
    return {
      frames: this.frame,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      webgl: this.renderer.getContext().getParameter(this.renderer.getContext().VERSION),
      pixelRatio: this.renderer.getPixelRatio(),
      resources: {
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures,
        programs: this.renderer.info.programs?.length ?? 0,
        sweepObjects: this.effects.sweep.children.length,
      },
    };
  }
  homecomingPresentation() {
    return {
      active: this.homecoming.active,
      finite: this.homecoming.finite,
      startedAt: this.homecoming.startedAt,
      celebrations: this.homecoming.celebrations,
      settled: this.homecoming.settled,
      reason: this.homecoming.reason,
      motionReduced: this.reduced,
      animalOffsets: [...this.animals].map(([id, animal]) => ({
        id,
        position: this.state.delivered.includes(id)
          ? animal.position.clone().sub(this.passengerPos(id, this.state)).toArray()
          : [0, 0, 0],
        rotation: [animal.rotation.x, animal.rotation.y, animal.rotation.z],
      })),
      camera: {
        factor: this.homecomingCameraFactor,
        targetFactor: this.homecomingCameraTarget,
        fallback: this.homecomingCameraFallback,
        revision: this.cameraRevision,
        base: this.canonicalFrame ? { ...this.canonicalFrame } : null,
        current: {
          left: this.camera.left,
          right: this.camera.right,
          top: this.camera.top,
          bottom: this.camera.bottom,
        },
        completionBounds: this.completionBounds ? { ...this.completionBounds } : null,
      },
      sweep: this.effects.presentation().arrival.sweep,
      resources: this.metrics().resources,
    };
  }
  environmentPresentation() {
    const material = this.water.material as T.ShaderMaterial;
    return {
      waterY: this.water.position.y,
      waterUniformY: material.uniforms.waterY.value as number,
      waterTime: material.uniforms.time.value as number,
      maskSize: [
        this.coastalWater.mask.texture.image.width,
        this.coastalWater.mask.texture.image.height,
      ],
      shallowSegments: this.coastalWater.mask.shallowSegments,
      reducedMotion: this.reduced,
      shores: this.shores.presentation(),
      contacts: {
        waterY: this.shores.water.value,
        meshes: this.contactMeshes.map((mesh) => {
          const position = mesh.getWorldPosition(new T.Vector3());
          return {
            name: mesh.name,
            worldY: position.y,
            localWaterY: this.shores.water.value - position.y,
          };
        }),
      },
      forecast: {
        visible: this.forecast.visible,
        tideY: this.shores.forecastY,
        groups: this.forecast.children.map((group) => ({
          name: group.name,
          visible: group.visible,
          contours: group.children.map((object) => ({
            name: object.name,
            positions: Array.from(
              ((object as T.Line).geometry.getAttribute('position') as T.BufferAttribute).array,
            ),
          })),
        })),
      },
      ...this.effects.presentation(),
      water: this.coastalWater.presentation(),
    };
  }
  journeyPresentation() {
    const transition = this.transition;
    return {
      boatWorldPosition: this.boatRoot.getWorldPosition(new T.Vector3()).toArray(),
      boatHeading: this.boatRoot.rotation.y,
      pose: this.poses.presentation(),
      active:
        transition?.path && this.journeyFrame
          ? {
              edgeId: transition.edgeId,
              reverse: transition.reverse,
              progress: this.journeyFrame.progress,
              distance: this.journeyFrame.distance,
              pathLength: transition.path.length,
              duration: transition.duration,
              elapsed: Math.max(0, this.lastTime - transition.start),
              tideDuration: transition.tideDuration,
              tideProgress: settlingProgress(this.lastTime - transition.start, transition),
              tangent: this.journeyFrame.tangent.toArray(),
            }
          : null,
      routeBuffers: [...this.routes].map(([id, route]) => ({
        id,
        pointsXYZ: Array.from((route.geometry.getAttribute('position') as T.BufferAttribute).array),
        position: route.position.toArray(),
        canonicalPoints: this.paths.get(id)!.points.map((point) => point.toArray()),
      })),
    };
  }
  passengerPresentation() {
    return [...this.animals].map(([id, g]) => {
      const position = g.getWorldPosition(new T.Vector3());
      return {
        id,
        position: position.toArray(),
        parent: g.parent?.name,
        deckLocalFoot: this.hull.worldToLocal(position.clone()).toArray(),
      };
    });
  }
  navigationPresentation() {
    return {
      currentNode: this.navigationCurrent,
      selectedDestination: this.navigationSelected,
      emphasizedDestination: this.navigationEmphasis,
      routes: [...this.routes].map(([id, route]) => {
        const material = route.material as T.LineDashedMaterial;
        return {
          id,
          nodes: [...this.level.edges.find((edge) => edge.id === id)!.nodes],
          highlighted: route.userData.highlighted === true,
          dashSize: material.dashSize,
          gapSize: material.gapSize,
        };
      }),
      markers: [...this.markers].map(([id, marker]) => ({
        id,
        worldPosition: marker.getWorldPosition(new T.Vector3()).toArray(),
        status: marker.userData.navigationStatus as string,
        selected: marker.userData.selected === true,
        shape:
          marker.userData.navigationStatus === 'current'
            ? 'double ring'
            : marker.userData.navigationStatus === 'too-shallow'
              ? 'crossed ring'
              : marker.userData.navigationStatus === 'nonadjacent'
                ? 'diamond'
                : 'open ring',
      })),
    };
  }
  frameStatus() {
    const rectangle = (object: T.Object3D) => this.rectangle([object]);
    const envelope = this.framePoints.map((point) => point.clone().project(this.camera));
    return {
      view: this.viewStatus(),
      canvas: {
        width: this.host.clientWidth,
        height: this.host.clientHeight,
        bufferWidth: this.renderer.domElement.width,
        bufferHeight: this.renderer.domElement.height,
      },
      camera: {
        left: this.camera.left,
        right: this.camera.right,
        top: this.camera.top,
        bottom: this.camera.bottom,
        position: this.camera.position.toArray(),
        projection: this.camera.projectionMatrix.toArray(),
        inverse: this.camera.matrixWorldInverse.toArray(),
      },
      envelope: {
        left: Math.min(...envelope.map((point) => ((point.x + 1) * this.host.clientWidth) / 2)),
        right: Math.max(...envelope.map((point) => ((point.x + 1) * this.host.clientWidth) / 2)),
        top: Math.min(...envelope.map((point) => ((1 - point.y) * this.host.clientHeight) / 2)),
        bottom: Math.max(...envelope.map((point) => ((1 - point.y) * this.host.clientHeight) / 2)),
        points: this.framePoints.length,
        ferry: { ...this.ferryEnvelope },
      },
      boat: rectangle(this.boatRoot),
      lighthouse: rectangle(this.scene.getObjectByName('lighthouse')!),
      lantern: rectangle(this.home.lens),
      lanternCore: rectangle(this.home.core),
      bell: this.scene.getObjectByName('bell-landmark')
        ? rectangle(this.scene.getObjectByName('bell-landmark')!)
        : null,
      passengers: [...this.animals].map(([id, g]) => ({ id, ...rectangle(g) })),
      nodes: this.level.nodes.map((n) => ({ id: n.id, ...this.project(n.positionXZ) })),
      places: this.level.nodes.map((node) => ({ id: node.id, ...this.placeBounds(node.id) })),
      pickTargets: [
        ...this.pickTargets.map(({ id, kind, object }) => {
          const bounds = rectangle(object);
          return {
            id,
            kind,
            ...bounds,
            x: (bounds.left + bounds.right) / 2,
            y: (bounds.top + bounds.bottom) / 2,
          };
        }),
        { id: this.state.boatNodeId, kind: 'ferry', ...rectangle(this.boatRoot) },
      ],
      nonInteractivePlaces: this.nonInteractivePlaces.map((object) => rectangle(object)),
    };
  }
}
