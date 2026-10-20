import * as T from 'three';
import { level } from '../levels/level';
import { draft, edgeTo, type State, type Action } from '../game/rules';
import { animal, ball, box, cylinder, ferry, lighthouse, mat, mesh, palette, pine } from './models';
import { sampleJourney } from './motion';
const V = (p: number[], y = 0) => new T.Vector3(p[0], y, p[1]);
const smooth = (t: number) => t * t * (3 - 2 * t);
export class World {
  scene = new T.Scene();
  camera = new T.OrthographicCamera();
  renderer: T.WebGLRenderer;
  boatRoot = new T.Group();
  hull = ferry();
  animals = new Map<string, T.Group>();
  markers = new Map<string, T.Group>();
  routes = new Map<string, T.Line>();
  forecast = new T.Group();
  water: T.Mesh;
  shadow: T.Mesh;
  state: State;
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  transition: null | {
    before: State;
    after: State;
    action: Action;
    start: number;
    duration: number;
    done: () => void;
    positions: Map<string, T.Vector3>;
    path: T.Vector3[];
    fromAngle: number;
  } = null;
  frame = 0;
  lastTime = 0;
  onSelect: (id: string) => void = () => {};
  constructor(
    public host: HTMLElement,
    state: State,
  ) {
    this.state = state;
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
      'Three-dimensional first cove. Use the labeled waypoint controls to navigate.',
    );
    this.scene.background = new T.Color('#245f70');
    this.scene.add(new T.HemisphereLight('#fff1dc', '#5f8c9a', 1.8));
    const sun = new T.DirectionalLight('#ffe0af', 2.8);
    sun.position.set(-8, 16, 7);
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
    const waterMat = new T.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `varying vec3 world; void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,
      fragmentShader: `varying vec3 world;uniform float time;
    float line(vec2 p,vec2 a,vec2 b){vec2 ab=b-a;return length(p-a-clamp(dot(p-a,ab)/dot(ab,ab),0.,1.)*ab);}
    void main(){vec2 p=world.xz;float d=min(min(line(p,vec2(-6.,0.),vec2(-3.,.2)),line(p,vec2(-3.,.2),vec2(0.,-1.))),min(line(p,vec2(0.,-1.),vec2(3.,.2)),line(p,vec2(3.,.2),vec2(6.,0.))));
    float bank=exp(-d*d/.9)*.7;float n=sin(p.x*1.8+p.y*2.3)*sin(p.y*3.1-p.x*.7);vec3 c=mix(vec3(.12,.31,.38),vec3(.32,.65,.62),clamp(bank+n*.045,0.,1.));float ripple=smoothstep(.94,1.,sin(p.x*16.+p.y*24.+sin(p.x*2.)*2.+time*.7)*sin(p.y*11.-p.x*3.+time*.3));c+=ripple*.10;gl_FragColor=vec4(c,1.);}`,
    });
    this.water = new T.Mesh(new T.PlaneGeometry(200, 200), waterMat);
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
    this.shadow = new T.Mesh(
      new T.PlaneGeometry(40, 40),
      new T.ShadowMaterial({ color: '#123c41', opacity: 0.2 }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.008;
    this.shadow.receiveShadow = true;
    this.scene.add(this.shadow);
    for (const island of level.world.islands) this.island(island);
    for (const p of level.piers) {
      const [x, z] = p.positionXZ,
        end = p.landAnchorXZ[1],
        y = p.elevation * 0.18 - 0.06;
      for (let i = 0; i < 9; i++)
        box(
          this.scene,
          i % 2 ? '#c09560' : '#b78b58',
          [p.width, 0.09, 0.14],
          [x, y, z + ((end - z) * i) / 8],
          0.015,
        );
      for (const px of [x - p.width / 2, x + p.width / 2])
        for (const pz of [z + 0.02, end]) {
          cylinder(this.scene, '#79644a', 0.065, 0.07, 0.83, [px, y - 0.27, pz], 9);
          cylinder(this.scene, '#dbc799', 0.075, 0.075, 0.055, [px, y + 0.17, pz], 9);
        }
      box(this.scene, '#b68f5b', [0.35, 0.055, 0.49], [x, y - 0.015, z + 0.25], 0.015); // boarding gangway
      cylinder(this.scene, '#655b43', 0.025, 0.025, 0.65, [x + 0.36, y + 0.33, z - 0.1], 7);
      box(this.scene, '#f5cb77', [0.13, 0.19, 0.13], [x + 0.36, y + 0.68, z - 0.1]);
    }
    lighthouse(this.scene, -6.15, 0.54, -3.25);
    const house = new T.Group();
    house.position.set(6.3, 0.36, -3.25);
    this.scene.add(house);
    box(house, '#c78155', [1.35, 0.9, 1.05], [0, 0.45, 0], 0.08);
    for (const x of [-0.42, 0.42]) box(house, '#f9d084', [0.24, 0.29, 0.03], [x, 0.52, 0.54]);
    box(house, '#754f3b', [0.27, 0.56, 0.05], [0, 0.29, 0.55]);
    const roof = new T.Shape();
    roof.moveTo(-0.82, 0);
    roof.lineTo(0, 0.58);
    roof.lineTo(0.82, 0);
    roof.closePath();
    const roofGeo = new T.ExtrudeGeometry(roof, {
      depth: 1.28,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 2,
      steps: 1,
    });
    mesh(roofGeo, palette.red, house, 0, 0.9, -0.64);
    for (const x of [-0.42, 0.42])
      for (const y of [0.42, 0.62]) box(house, '#edc28c', [0.27, 0.025, 0.045], [x, y, 0.56]);
    box(house, '#ead5a6', [0.026, 0.32, 0.04], [-0.42, 0.52, 0.56]);
    box(house, '#93816a', [0.19, 0.6, 0.2], [0.43, 1.35, -0.25]);
    for (const e of level.edges) {
      const pts = e.waypointsXZ.map((p) => V(p, 0.035));
      const geom = new T.BufferGeometry().setFromPoints(pts);
      const line = new T.Line(
        geom,
        new T.LineDashedMaterial({
          color: e.baseDepth === 2 ? '#b4d9c4' : '#89b8ba',
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
    for (const n of level.nodes) {
      const g = new T.Group();
      g.position.copy(V(n.positionXZ, 0.05));
      this.scene.add(g);
      this.markers.set(n.id, g);
      const ring = mesh(new T.TorusGeometry(0.25, 0.025, 6, 36), '#f3db9a', g);
      ring.rotation.x = Math.PI / 2;
      if (!n.pierId && n.id !== 'cut') {
        cylinder(g, '#e2bf70', 0.055, 0.13, 0.2, [0, 0.07, 0], 10);
        cylinder(g, '#eee2bc', 0.025, 0.025, 0.25, [0, 0.28, 0], 7);
      }
    }
    // Sparse broken foam accents hugging the three authored footprints.
    for (const island of level.world.islands) {
      const points = island.footprintXZ;
      const cx = points.reduce((n, p) => n + p[0], 0) / points.length,
        cz = points.reduce((n, p) => n + p[1], 0) / points.length;
      for (let i = 0; i < points.length; i++) {
        const a = points[i],
          b = points[(i + 1) % points.length];
        for (let j = 0; j < 8; j++) {
          const t = j / 8,
            x = a[0] + (b[0] - a[0]) * t,
            z = a[1] + (b[1] - a[1]) * t;
          const v = new T.Vector2(x - cx, z - cz).normalize();
          const foam = box(
            this.scene,
            '#a2cfca',
            [0.09 + (j % 3) * 0.04, 0.009, 0.025],
            [x + v.x * 0.035, 0.025, z + v.y * 0.035],
            0.005,
          );
          foam.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]) + Math.PI / 2;
        }
      }
    }
    this.scene.add(this.forecast);
    this.makeForecast();
    this.boatRoot.add(this.hull);
    this.scene.add(this.boatRoot);
    for (const p of level.passengers) {
      const g = animal(p.species, p.id === 'rabbit-2' ? 1 : 0);
      g.name = p.id;
      this.scene.add(g);
      this.animals.set(p.id, g);
    }
    this.sync(state);
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
    this.renderer.domElement.addEventListener('click', (ev) => {
      const bounds = host.getBoundingClientRect();
      let closest: string | undefined,
        dist = 32;
      for (const n of level.nodes) {
        const p = this.project(n.positionXZ);
        const d = Math.hypot(p.x - (ev.clientX - bounds.left), p.y - (ev.clientY - bounds.top));
        if (d < dist) {
          closest = n.id;
          dist = d;
        }
      }
      if (closest) this.onSelect(closest);
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
  island(island: (typeof level.world.islands)[number]) {
    const points = island.footprintXZ,
      cx = points.reduce((a, p) => a + p[0], 0) / points.length,
      cz = points.reduce((a, p) => a + p[1], 0) / points.length;
    const height = island.elevation * 0.18;
    for (const [scale, y, color] of [
      [0.98, -0.15, '#d9c79b'],
      [0.94, 0.02, '#86958a'],
      [0.89, height - 0.18, '#e0cfa7'],
      [0.83, height - 0.17, palette.grass],
    ] as [number, number, string][]) {
      const shape = new T.Shape();
      const ps = points.map(
        (p) => new T.Vector2(cx + (p[0] - cx) * scale, -cz - (p[1] - cz) * scale),
      );
      const first = ps[0].clone().lerp(ps[1], 0.5);
      shape.moveTo(first.x, first.y);
      for (let i = 1; i <= ps.length; i++) {
        const a = ps[i % ps.length],
          b = ps[(i + 1) % ps.length];
        const m = a.clone().lerp(b, 0.5);
        shape.quadraticCurveTo(a.x, a.y, m.x, m.y);
      }
      shape.closePath();
      const geo = new T.ExtrudeGeometry(shape, {
        depth: 0.14,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.015,
        bevelThickness: 0.025,
        curveSegments: 8,
      });
      geo.rotateX(-Math.PI / 2);
      mesh(geo, color, this.scene, 0, y, 0);
    }
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      const x = cx + ((a[0] + b[0]) / 2 - cx) * 0.77,
        z = cz + ((a[1] + b[1]) / 2 - cz) * 0.77;
      const r = mesh(
        new T.DodecahedronGeometry(0.4, 0),
        i % 2 ? '#748780' : '#929e8c',
        this.scene,
        x,
        height + 0.04,
        z,
      );
      r.scale.set(0.85, 0.7 + (i % 3) * 0.23, 0.75);
      r.rotation.set(i * 0.8, i * 0.9, 0.2);
    }
    if (island.id === 'central-rock') {
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
    for (let i = 0; i < 25; i++) {
      const a = i * 2.399,
        r = 0.48 + (i % 5) * 0.17,
        x = cx + Math.cos(a) * r * 1.3,
        z = cz + Math.sin(a) * r * 0.7;
      if (island.id !== 'central-rock' && Math.abs(x - cx) < 0.68) continue;
      ball(this.scene, i % 4 ? '#91a273' : '#f0e8c8', [x, height + 0.11, z], [0.045, 0.09, 0.045]);
    }
    if (island.id !== 'central-rock')
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
  makeForecast() {
    for (const island of level.world.islands) {
      const pts = island.footprintXZ.map((p) => V(p, 0.195));
      pts.push(pts[0].clone());
      const line = new T.Line(
        new T.BufferGeometry().setFromPoints(pts),
        new T.LineDashedMaterial({ color: '#ffe3a2', dashSize: 0.13, gapSize: 0.09 }),
      );
      line.computeLineDistances();
      this.forecast.add(line);
    }
    this.forecast.visible = false;
  }
  setForecast(visible: boolean, tide: number) {
    this.forecast.visible = visible;
    this.forecast.position.y = (tide - 1) * 0.18;
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
    const smallLandscape = matchMedia('(max-height: 480px) and (min-width: 701px)').matches;
    const span = Math.max(smallLandscape ? 12.4 : 13.2, 20.3 / aspect);
    this.camera.left = (-span * aspect) / 2;
    this.camera.right = (span * aspect) / 2;
    this.camera.top = span / 2;
    this.camera.bottom = -span / 2;
    this.camera.near = 0.1;
    this.camera.far = 100;
    this.camera.position.set(7, 34, 23);
    this.camera.lookAt(0, 0, 0.05);
    this.camera.updateProjectionMatrix();
  }
  passengerPos(
    id: string,
    s: State,
    boatPos = this.boatRoot.position,
    angle = this.boatRoot.rotation.y,
  ) {
    const water = s.tideLevel * 0.18;
    if (s.aboard.includes(id)) {
      const anchor =
        id === 'rabbit-1'
          ? [-0.22, 0.26, 0.02]
          : id === 'rabbit-2'
            ? [0.22, 0.26, 0.22]
            : [0, 0.26, 0.59];
      const v = new T.Vector3(...(anchor as [number, number, number]));
      v.applyAxisAngle(new T.Vector3(0, 1, 0), angle);
      return v.add(boatPos).add(new T.Vector3(0, this.draftY(s), 0));
    }
    if (s.delivered.includes(id)) {
      const i = level.passengers.findIndex((p) => p.id === id);
      return new T.Vector3(-6.45 + i * 0.42, 0.57, -2.05 - i * 0.21);
    }
    const p = level.piers.find((p) => s.waitingByPier[p.id].includes(id))!;
    const i = s.waitingByPier[p.id].indexOf(id);
    return new T.Vector3(
      p.positionXZ[0] + (i % 2) * 0.23,
      p.elevation * 0.18 - 0.005,
      p.positionXZ[1] - 0.28 - Math.floor(i / 2) * 0.3,
    );
  }
  draftY(s: State) {
    return 0.03 - (draft(s) - 1) * 0.075;
  }
  sync(s: State) {
    this.state = s;
    this.water.position.y = s.tideLevel * 0.18;
    this.shadow.position.y = this.water.position.y + 0.008;
    const n = level.nodes.find((n) => n.id === s.boatNodeId)!;
    this.boatRoot.position.copy(V(n.positionXZ, s.tideLevel * 0.18));
    this.boatRoot.rotation.y = Math.PI / 2;
    this.hull.position.y = this.draftY(s);
    for (const [id, g] of this.animals) {
      g.position.copy(this.passengerPos(id, s));
      g.rotation.set(0, s.aboard.includes(id) ? Math.PI / 2 : 0, 0);
    }
    this.indicate(s);
  }
  indicate(s: State, selected?: string) {
    for (const [id, g] of this.markers) {
      const e = edgeTo(s, id);
      g.visible = id !== s.boatNodeId;
      const color =
        id === selected
          ? '#ffe09a'
          : e && e.baseDepth + s.tideLevel < draft(s)
            ? '#d19272'
            : '#cce2d6';
      (g.children[0] as T.Mesh).material = mat(color);
      g.scale.setScalar(id === selected ? 1.3 : 1);
      g.position.y = s.tideLevel * 0.18 + 0.04;
    }
    for (const [id, line] of this.routes) {
      const e = level.edges.find((e) => e.id === id)!;
      line.position.y = s.tideLevel * 0.18;
      const m = line.material as T.LineDashedMaterial;
      m.opacity = e.nodes.includes(s.boatNodeId) ? 0.85 : 0.3;
      m.color.set(e.baseDepth + s.tideLevel < draft(s) ? '#dca180' : '#a6d3cc');
    }
  }
  animate(before: State, after: State, action: Action, done: () => void) {
    this.cancel();
    this.state = after;
    const positions = new Map([...this.animals].map(([id, g]) => [id, g.position.clone()]));
    let path: T.Vector3[] = [];
    if (action.type === 'move') {
      const edge = edgeTo(before, action.to)!;
      const points =
        edge.nodes[0] === before.boatNodeId ? edge.waypointsXZ : [...edge.waypointsXZ].reverse();
      path = points.map((p) => V(p, before.tideLevel * 0.18));
    }
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
      fromAngle: this.boatRoot.rotation.y,
    };
  }
  cancel() {
    if (this.transition) {
      const t = this.transition;
      this.transition = null;
      this.sync(t.after);
      this.renderer.render(this.scene, this.camera);
      t.done();
    }
  }
  tick(time: number) {
    this.frame++;
    this.lastTime = time;
    const waterMat = this.water.material as T.ShaderMaterial;
    waterMat.uniforms.time.value = this.reduced ? 0 : time * 0.001;
    if (this.transition) {
      const tr = this.transition;
      const t = Math.min(1, (time - tr.start) / tr.duration),
        k = smooth(t);
      this.water.position.y = T.MathUtils.lerp(
        tr.before.tideLevel * 0.18,
        tr.after.tideLevel * 0.18,
        k,
      );
      if (tr.path.length) {
        const pose = sampleJourney(tr.path, t, tr.fromAngle);
        this.boatRoot.position.copy(pose.position);
        this.boatRoot.rotation.y = pose.angle;
      }
      this.boatRoot.position.y = this.water.position.y;
      this.hull.position.y = T.MathUtils.lerp(this.draftY(tr.before), this.draftY(tr.after), k);
      for (const [id, g] of this.animals) {
        const dest = this.passengerPos(id, tr.after);
        if (tr.before.aboard.includes(id) && tr.after.aboard.includes(id)) {
          g.position.copy(dest);
          g.rotation.y = this.boatRoot.rotation.y;
        } else if (tr.before.aboard.includes(id) !== tr.after.aboard.includes(id)) {
          const pier = level.piers.find((p) => p.nodeId === tr.before.boatNodeId)!;
          const offset = id === 'rabbit-1' ? -0.07 : id === 'rabbit-2' ? 0.07 : 0;
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
      if (t === 1) {
        this.transition = null;
        this.sync(tr.after);
        tr.done();
      }
    } else if (!this.reduced) {
      this.hull.position.y = this.draftY(this.state) + Math.sin(time * 0.0018) * 0.012;
    }
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
}
