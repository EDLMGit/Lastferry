import * as T from 'three';
import { level as baseline, type Level } from '../levels/level';
import { draft, edgeTo, type State, type Action } from '../game/rules';
import { animal, ball, box, cylinder, ferry, lighthouse, mat, mesh, pine } from './models';
import { sampleJourney } from './motion';
import { sceneLayout, type SceneLayout } from './layout';
import { bellLandmark, cottage } from './scenery';
import { getLevelPaths, type CanonicalPath } from './paths';
import { Shores, createReedBeds } from './shore';
import { CoastalWater } from './water';
import { CrossingEffects } from './effects';
const V = (p: number[], y = 0) => new T.Vector3(p[0], y, p[1]);
const smooth = (t: number) => t * t * (3 - 2 * t);
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
  forecast = new T.Group();
  water: T.Mesh;
  shadow: T.Mesh;
  state: State;
  layout: SceneLayout;
  paths: Map<string, CanonicalPath>;
  shores: Shores;
  coastalWater: CoastalWater;
  effects: CrossingEffects;
  journeyFrame: { progress: number; distance: number; tangent: T.Vector3 } | null = null;
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  transition: null | {
    before: State;
    after: State;
    action: Action;
    start: number;
    duration: number;
    done: () => void;
    positions: Map<string, T.Vector3>;
    path: CanonicalPath | null;
    edgeId: string | null;
    reverse: boolean;
    fromAngle: number;
    fromHullY: number;
  } = null;
  frame = 0;
  lastTime = 0;
  onSelect: (id: string) => void = () => {};
  onCurrent: () => void = () => {};
  constructor(
    public host: HTMLElement,
    state: State,
    public level: Level = baseline,
  ) {
    this.state = state;
    this.layout = sceneLayout(this.level.id);
    this.paths = getLevelPaths(this.level);
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
    this.scene.add(this.shores.group, this.shores.contacts);
    for (const island of this.level.world.islands) this.island(island);
    for (const p of this.level.piers) {
      const [x, z] = p.positionXZ,
        end = p.landAnchorXZ[1],
        y = p.elevation * 0.18 - 0.06;
      for (let i = 0; i < 9; i++)
        box(
          this.scene,
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
          cylinder(this.scene, '#79644a', 0.065, 0.07, 0.83, [px, y - 0.27, pz], 9);
          cylinder(this.scene, '#dbc799', 0.075, 0.075, 0.055, [px, y + 0.17, pz], 9);
        }
      box(this.scene, '#b68f5b', [0.35, 0.055, 0.49], [x, y - 0.015, z + 0.25], 0.015);
      cylinder(this.scene, '#655b43', 0.025, 0.025, 0.65, [x + 0.36, y + 0.33, z - 0.1], 7);
      box(this.scene, '#f5cb77', [0.13, 0.19, 0.13], [x + 0.36, y + 0.68, z - 0.1]);
    }
    for (const landmark of this.layout.landmarks) {
      const island = this.level.world.islands.find((island) => island.id === landmark.islandId)!;
      const [x, z] = landmark.positionXZ;
      const y = island.elevation * 0.18;
      if (landmark.kind === 'lighthouse') lighthouse(this.scene, x, y, z);
      else if (landmark.kind === 'cottage') cottage(this.scene, [x, y, z]);
      else bellLandmark(this.scene, [x, y, z]);
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
    }
    this.effects = new CrossingEffects(this.scene.getObjectByName('lighthouse')!);
    this.scene.add(this.effects.wake, this.effects.glow);
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
            ? [-0.22, 0.26, -0.02]
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
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
    this.renderer.domElement.addEventListener('click', (ev) => {
      if (this.transition || this.state.status !== 'playing') return;
      const bounds = host.getBoundingClientRect();
      const point = { x: ev.clientX - bounds.left, y: ev.clientY - bounds.top };
      const boatBounds = new T.Box3().setFromObject(this.boatRoot);
      const boatCorners: T.Vector3[] = [];
      for (const x of [boatBounds.min.x, boatBounds.max.x])
        for (const y of [boatBounds.min.y, boatBounds.max.y])
          for (const z of [boatBounds.min.z, boatBounds.max.z])
            boatCorners.push(new T.Vector3(x, y, z).project(this.camera));
      const boatX = boatCorners.map((p) => ((p.x + 1) * host.clientWidth) / 2);
      const boatY = boatCorners.map((p) => ((1 - p.y) * host.clientHeight) / 2);
      if (
        point.x >= Math.min(...boatX) - 6 &&
        point.x <= Math.max(...boatX) + 6 &&
        point.y >= Math.min(...boatY) - 6 &&
        point.y <= Math.max(...boatY) + 6
      ) {
        this.onCurrent();
        return;
      }
      const currentPier = this.level.piers.find((pier) => pier.nodeId === this.state.boatNodeId);
      if (currentPier) {
        const corners = [
          V(
            [currentPier.positionXZ[0] - currentPier.width / 2, currentPier.positionXZ[1] + 0.5],
            currentPier.elevation * 0.18,
          ),
          V(
            [currentPier.positionXZ[0] + currentPier.width / 2, currentPier.landAnchorXZ[1]],
            currentPier.elevation * 0.18,
          ),
        ].map((p) => p.project(this.camera));
        const xs = corners.map((p) => ((p.x + 1) * host.clientWidth) / 2);
        const ys = corners.map((p) => ((1 - p.y) * host.clientHeight) / 2);
        if (
          point.x >= Math.min(...xs) - 6 &&
          point.x <= Math.max(...xs) + 6 &&
          point.y >= Math.min(...ys) - 6 &&
          point.y <= Math.max(...ys) + 6
        ) {
          this.onCurrent();
          return;
        }
      }
      let closest: string | undefined,
        dist = 32;
      for (const n of this.level.nodes) {
        const p = this.project(n.positionXZ);
        const d = Math.hypot(p.x - point.x, p.y - point.y);
        if (d < dist) {
          closest = n.id;
          dist = d;
        }
      }
      if (closest === this.state.boatNodeId) this.onCurrent();
      else if (closest) this.onSelect(closest);
    });
    this.renderer.domElement.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault();
      this.cancel();
    });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reduced = e.matches;
    });
    requestAnimationFrame((t) => this.tick(t));
  }
  island(island: Level['world']['islands'][number]) {
    const points = island.footprintXZ,
      cx = points.reduce((a, p) => a + p[0], 0) / points.length,
      cz = points.reduce((a, p) => a + p[1], 0) / points.length;
    const height = island.elevation * 0.18;
    const style = this.layout.islandStyles[island.id] ?? 'garden';
    if (style === 'crag') {
      const rock = mesh(
        new T.DodecahedronGeometry(0.85, 0),
        '#87988d',
        this.scene,
        -0.45,
        height + 0.25,
        2.5,
      );
      rock.scale.set(1.1, 0.85, 0.9);
      rock.rotation.y = 0.4;
      pine(this.scene, 0.7, height, 2.5, 1.05);
      pine(this.scene, -1.1, height, 2.7, 0.55);
    } else if (style === 'reeds') {
      this.scene.add(createReedBeds(island));
      for (const x of [-0.8, 0.9])
        ball(this.scene, '#c3ba93', [cx + x, height - 0.07, cz], [0.6, 0.045, 0.34]);
    } else if (style === 'rocky') {
      pine(this.scene, cx - 1.05, height, cz - 0.35, 0.68);
      pine(this.scene, cx + 1.02, height, cz - 0.3, 0.43);
    } else {
      pine(this.scene, cx - 1.05, height, cz - 0.28, 0.85);
      pine(this.scene, cx + 0.92, height, cz - 0.55, 0.65);
      for (let i = 0; i < 7; i++)
        box(
          this.scene,
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
      ball(this.scene, i % 4 ? '#91a273' : '#f0e8c8', [x, height + 0.11, z], [0.045, 0.09, 0.045]);
    }
    if (style === 'garden')
      for (const side of [-1, 1]) {
        const x = cx + side * 1.05,
          z = cz + 0.25;
        ball(this.scene, '#6f8b59', [x, height + 0.18, z], [0.3, 0.2, 0.23]);
        for (let j = 0; j < 5; j++) {
          const a = j * 2.4;
          ball(
            this.scene,
            '#f5e9c5',
            [x + Math.sin(a) * 0.24, height + 0.3, z + Math.cos(a) * 0.17],
            [0.035, 0.035, 0.035],
          );
        }
        box(this.scene, '#a37546', [0.24, 0.23, 0.24], [x, height + 0.11, cz + 0.65]);
        box(this.scene, '#d1ae74', [0.25, 0.027, 0.027], [x, height + 0.2, cz + 0.78]);
      }
  }
  setForecast(visible: boolean, tide: number) {
    this.forecast.visible = visible;
    this.shores.preview(visible, tide);
  }
  project(p: number[]) {
    const v = V(p, 0.06).project(this.camera);
    return {
      x: ((v.x + 1) * this.host.clientWidth) / 2,
      y: ((1 - v.y) * this.host.clientHeight) / 2,
    };
  }
  resize() {
    const w = this.host.clientWidth,
      h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    const aspect = w / h;
    const span = Math.max(13.2, 20.3 / aspect);
    this.camera.left = (-span * aspect) / 2;
    this.camera.right = (span * aspect) / 2;
    this.camera.top = span / 2;
    this.camera.bottom = -span / 2;
    this.camera.near = 0.1;
    this.camera.far = 100;
    const smallLandscape = matchMedia('(max-height: 480px) and (min-width: 701px)').matches;
    this.camera.position.set(
      ...(smallLandscape && this.layout.landscapeCameraPosition
        ? this.layout.landscapeCameraPosition
        : this.layout.cameraPosition),
    );
    this.camera.lookAt(0, 0, 0.05);
    {
      this.scene.updateMatrixWorld(true);
      this.camera.updateMatrixWorld(true);
      const points: T.Vector3[] = [];
      const corners = (b: T.Box3) => {
        if (b.isEmpty()) return;
        for (const x of [b.min.x, b.max.x])
          for (const y of [b.min.y, b.max.y])
            for (const z of [b.min.z, b.max.z])
              points.push(new T.Vector3(x, y, z).applyMatrix4(this.camera.matrixWorldInverse));
      };
      for (const object of this.scene.children) {
        if (
          object === this.water ||
          object === this.shadow ||
          object === this.boatRoot ||
          object === this.forecast ||
          object.userData.excludeFromFrame ||
          [...this.animals.values()].includes(object as T.Group)
        )
          continue;
        corners(new T.Box3().setFromObject(object));
      }
      for (const node of this.level.nodes)
        corners(
          new T.Box3(
            V([node.positionXZ[0] - 1.25, node.positionXZ[1] - 1.25], 0),
            V([node.positionXZ[0] + 1.25, node.positionXZ[1] + 1.25], 2),
          ),
        );
      const bounds = new T.Box3().setFromPoints(points),
        center = bounds.getCenter(new T.Vector3()),
        size = bounds.getSize(new T.Vector3());
      const scale = Math.min((w - 24) / size.x, (h - 20) / size.y);
      this.camera.left = center.x - w / scale / 2;
      this.camera.right = center.x + w / scale / 2;
      this.camera.top = center.y + h / scale / 2;
      this.camera.bottom = center.y - h / scale / 2;
    }
    this.camera.updateProjectionMatrix();
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
  sync(s: State, preserveEffects = false) {
    this.state = s;
    this.coastalWater.update(s.tideLevel * 0.18, this.reduced ? 0 : this.lastTime * 0.001);
    this.shores.update(this.water.position.y);
    this.setForecast(false, s.tideLevel);
    if (!preserveEffects) this.effects.reset();
    if (s.status === 'won') this.effects.arrive(this.lastTime, this.reduced);
    this.shadow.position.y = this.water.position.y + 0.008;
    const n = this.level.nodes.find((n) => n.id === s.boatNodeId)!;
    this.boatRoot.position.copy(V(n.positionXZ, s.tideLevel * 0.18));
    this.boatRoot.rotation.y = Math.PI / 2;
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
  }
  indicate(s: State, selected?: string) {
    const selectedEdge = selected ? edgeTo(s, selected, this.level) : undefined;
    this.navigationCurrent = s.boatNodeId;
    this.navigationSelected = selectedEdge ? selected! : null;
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
      const color = active
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
  animate(before: State, after: State, action: Action, done: () => void) {
    this.cancel();
    this.state = after;
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
    }
    this.journeyFrame = path
      ? {
          progress: 0,
          distance: 0,
          tangent: sampleJourney(path, 0, this.boatRoot.rotation.y, reverse).tangent,
        }
      : null;
    this.transition = {
      before,
      after,
      action,
      start: performance.now(),
      duration: this.reduced
        ? 30
        : action.type === 'move'
          ? 780
          : action.type === 'unload' && after.status === 'won'
            ? 900
            : 520,
      done,
      positions,
      path,
      edgeId,
      reverse,
      fromAngle: this.boatRoot.rotation.y,
      fromHullY: this.hull.position.y,
    };
  }
  cancel() {
    if (this.transition) {
      const t = this.transition;
      this.transition = null;
      this.journeyFrame = null;
      this.sync(t.after);
      this.renderer.render(this.scene, this.camera);
      t.done();
    }
  }
  tick(time: number) {
    this.frame++;
    this.lastTime = time;
    if (this.transition) {
      const tr = this.transition;
      const t = Math.min(1, (time - tr.start) / tr.duration),
        k = smooth(t);
      this.water.position.y = T.MathUtils.lerp(
        tr.before.tideLevel * 0.18,
        tr.after.tideLevel * 0.18,
        k,
      );
      if (tr.path) {
        const pose = sampleJourney(tr.path, t, tr.fromAngle, tr.reverse);
        this.boatRoot.position.copy(pose.position);
        this.boatRoot.rotation.y = pose.angle;
        this.journeyFrame = { progress: t, distance: pose.distance, tangent: pose.tangent };
      }
      this.boatRoot.position.y = this.water.position.y;
      this.hull.position.y = T.MathUtils.lerp(tr.fromHullY, this.draftY(tr.after), k);
      for (const [id, g] of this.animals) {
        const dest = this.passengerPos(id, tr.after);
        if (tr.before.aboard.includes(id) && tr.after.aboard.includes(id)) continue;
        if (tr.before.aboard.includes(id) !== tr.after.aboard.includes(id)) {
          const pier = this.level.piers.find((p) => p.nodeId === tr.before.boatNodeId)!;
          const passenger = this.level.passengers.find((passenger) => passenger.id === id)!;
          const offset =
            passenger.species === 'rabbit' ? (this.speciesIndex(id) ? 0.07 : -0.07) : 0;
          const bridge = new T.Vector3(
            pier.positionXZ[0] + offset,
            pier.elevation * 0.18 - 0.005,
            pier.positionXZ[1] + 0.46,
          );
          const land = new T.Vector3(
            pier.positionXZ[0] + offset,
            pier.elevation * 0.18 + 0.025,
            pier.landAnchorXZ[1] + 0.15,
          );
          const way = tr.after.aboard.includes(id)
            ? [tr.positions.get(id)!, bridge, dest]
            : [tr.positions.get(id)!, bridge, land, dest];
          const f = k * (way.length - 1),
            i = Math.min(way.length - 2, Math.floor(f));
          g.position.lerpVectors(way[i], way[i + 1], f - i);
          g.rotation.y = 0;
          if (!this.reduced) {
            g.position.y += Math.sin(t * Math.PI * 4) ** 2 * 0.055;
            if (tr.after.delivered.includes(id) && t > 0.72)
              g.rotation.x = Math.sin(((t - 0.72) / 0.28) * Math.PI * 2) * 0.12;
          }
        } else {
          g.position.copy(dest);
        }
      }
      this.shadow.position.y = this.water.position.y + 0.008;
      if (tr.after.status === 'won' && t > 0.7) this.effects.arrive(time, this.reduced);
      if (t === 1) {
        this.transition = null;
        this.journeyFrame = null;
        this.sync(tr.after, true);
        tr.done();
      }
    } else {
      this.hull.position.y =
        this.draftY(this.state) + (this.reduced ? 0 : Math.sin(time * 0.0018) * 0.012);
    }
    this.coastalWater.update(this.water.position.y, this.reduced ? 0 : time * 0.001);
    this.shores.update(this.water.position.y);
    for (const route of this.routes.values()) route.position.y = this.water.position.y;
    for (const marker of this.markers.values()) marker.position.y = this.water.position.y + 0.04;
    this.effects.update(
      time,
      this.boatRoot.position,
      this.boatRoot.rotation.y,
      !!this.transition?.path,
      this.water.position.y,
      this.reduced,
    );
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((t) => this.tick(t));
  }
  metrics() {
    return {
      frames: this.frame,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      webgl: this.renderer.getContext().getParameter(this.renderer.getContext().VERSION),
      pixelRatio: this.renderer.getPixelRatio(),
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
    };
  }
  journeyPresentation() {
    const transition = this.transition;
    return {
      boatWorldPosition: this.boatRoot.getWorldPosition(new T.Vector3()).toArray(),
      boatHeading: this.boatRoot.rotation.y,
      active:
        transition?.path && this.journeyFrame
          ? {
              edgeId: transition.edgeId,
              reverse: transition.reverse,
              progress: this.journeyFrame.progress,
              distance: this.journeyFrame.distance,
              pathLength: transition.path.length,
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
    const rectangle = (object: T.Object3D) => {
      const b = new T.Box3().setFromObject(object),
        points: T.Vector3[] = [];
      for (const x of [b.min.x, b.max.x])
        for (const y of [b.min.y, b.max.y])
          for (const z of [b.min.z, b.max.z])
            points.push(new T.Vector3(x, y, z).project(this.camera));
      const xs = points.map((p) => ((p.x + 1) * this.host.clientWidth) / 2),
        ys = points.map((p) => ((1 - p.y) * this.host.clientHeight) / 2);
      return {
        left: Math.min(...xs),
        right: Math.max(...xs),
        top: Math.min(...ys),
        bottom: Math.max(...ys),
        height: Math.max(...ys) - Math.min(...ys),
      };
    };
    return {
      canvas: { width: this.host.clientWidth, height: this.host.clientHeight },
      boat: rectangle(this.boatRoot),
      lighthouse: rectangle(this.scene.getObjectByName('lighthouse')!),
      bell: this.scene.getObjectByName('bell-landmark')
        ? rectangle(this.scene.getObjectByName('bell-landmark')!)
        : null,
      passengers: [...this.animals].map(([id, g]) => ({ id, ...rectangle(g) })),
      nodes: this.level.nodes.map((n) => ({ id: n.id, ...this.project(n.positionXZ) })),
    };
  }
}
