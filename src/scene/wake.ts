import * as T from 'three';

export type WakeCoast = { texture: T.Texture; bounds: T.Vector4 };

export const wakeLimits = { capacity: 96, lifetime: 1800, length: 3.6, spacing: 0.055 };

type WakePoint = {
  position: T.Vector3;
  center: T.Vector3;
  time: number;
  angle: number;
  strength: number;
  distance: number;
  segment: number;
};

export class FerryWake {
  mesh: T.Mesh<T.BufferGeometry, T.ShaderMaterial>;
  interaction = { position: new T.Vector3(), direction: new T.Vector3(0, 0, 1), strength: 0 };
  readonly pool: WakePoint[] = Array.from({ length: wakeLimits.capacity }, () => ({
    position: new T.Vector3(),
    center: new T.Vector3(),
    time: 0,
    angle: 0,
    strength: 0,
    distance: 0,
    segment: 0,
  }));
  readonly joins = new Float32Array(wakeLimits.capacity * 2);
  count = 0;
  first = 0;
  segment = 0;
  emitting = false;
  active = false;
  previous = new T.Vector3();
  previousAngle = 0;
  previousTime: number | null = null;
  previousWater = 0;
  carried = 0;
  travelled = 0;
  speed = 0;
  strength = 0;
  peakStrength = 0;
  dockingStarted: number | null = null;
  dockingStrength = 0;
  contactStrength = 0;
  vertices = 0;

  constructor(coast?: WakeCoast) {
    const capacity = (wakeLimits.capacity + 48) * 6,
      geometry = new T.BufferGeometry();
    geometry.setAttribute(
      'position',
      new T.Float32BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(T.DynamicDrawUsage),
    );
    for (const name of ['fade', 'lateral', 'distance', 'age', 'kind'])
      geometry.setAttribute(
        name,
        new T.Float32BufferAttribute(new Float32Array(capacity), 1).setUsage(T.DynamicDrawUsage),
      );
    geometry.setDrawRange(0, 0);
    const material = new T.ShaderMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false,
      side: T.DoubleSide,
      forceSinglePass: true,
      uniforms: {
        pearl: { value: new T.Color('#d3e7df') },
        body: { value: new T.Color('#3b8889') },
        coast: { value: coast?.texture ?? null },
        field: { value: coast?.bounds ?? new T.Vector4(0, 0, 1, 1) },
        hasCoast: { value: coast ? 1 : 0 },
        waterY: { value: 0 },
      },
      vertexShader: `attribute float fade;attribute float lateral;attribute float distance;attribute float age;attribute float kind;
        varying float alpha;varying float side;varying float along;varying float old;varying float layer;varying vec2 worldXZ;
        void main(){
          alpha=fade;side=lateral;along=distance;old=age;layer=kind;worldXZ=position.xz;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        }`,
      fragmentShader: `uniform vec3 pearl;uniform vec3 body;uniform sampler2D coast;uniform vec4 field;uniform float hasCoast;uniform float waterY;
        varying float alpha;varying float side;varying float along;varying float old;varying float layer;varying vec2 worldXZ;
        void main(){
          float feather=1.-smoothstep(.78,1.,abs(side));
          float rhythm=.12+.88*smoothstep(-.3,.75,sin(along*7.1+side*1.2));
          float crestCenter=.66+.045*sin(along*3.8+old*.7);
          float crest=(1.-smoothstep(.065,.22,abs(abs(side)-crestCenter)))*rhythm;
          float center=(1.-smoothstep(.05,.67,abs(side)))*.15;
          float coverage=(center+crest*.85)*feather;
          vec3 color=mix(body,pearl,crest);
          if(layer>.5){
            coverage=(1.-smoothstep(.1,1.,abs(side)))*(.72+.28*sin(along*2.4));
            color=pearl;
          }
          float wet=1.;
          if(hasCoast>.5){
            vec4 land=texture2D(coast,clamp((worldXZ-field.xy)/field.zw,0.,1.));
            wet=1.-land.a*smoothstep(waterY+.004,waterY+.025,land.b*.72);
          }
          gl_FragColor=vec4(color,alpha*coverage*wet);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new T.Mesh(geometry, material);
    this.mesh.name = 'ferry-wake';
    this.mesh.userData.excludeFromFrame = true;
    this.mesh.userData.decorative = true;
    this.mesh.frustumCulled = false;
    this.mesh.raycast = () => {};
    this.mesh.visible = false;
  }

  private point(index: number) {
    return this.pool[(this.first + index) % wakeLimits.capacity];
  }

  clear() {
    this.count = 0;
    this.first = 0;
    this.emitting = false;
    this.active = false;
    this.previousTime = null;
    this.carried = 0;
    this.travelled = 0;
    this.speed = 0;
    this.strength = 0;
    this.peakStrength = 0;
    this.dockingStarted = null;
    this.dockingStrength = 0;
    this.contactStrength = 0;
    this.interaction.strength = 0;
    this.vertices = 0;
    this.mesh.geometry.setDrawRange(0, 0);
    this.mesh.visible = false;
  }

  begin(time: number, position: T.Vector3, angle = this.previousAngle) {
    this.segment++;
    this.active = true;
    this.emitting = false;
    this.previous.copy(position);
    this.previousAngle = angle;
    this.previousTime = time;
    this.previousWater = position.y;
    this.carried = 0;
    this.speed = 0;
    this.strength = 0;
    this.peakStrength = 0;
    this.dockingStarted = null;
    this.dockingStrength = 0;
    this.interaction.strength = 0;
  }

  finish(time: number) {
    if (this.active && this.peakStrength > 0.05) {
      this.dockingStarted = time;
      this.dockingStrength = Math.min(0.26, this.peakStrength * 0.32);
    }
    this.active = false;
    this.emitting = false;
    this.speed = 0;
    this.strength = 0;
  }

  private emit(
    time: number,
    x: number,
    z: number,
    angle: number,
    waterY: number,
    distance: number,
  ) {
    if (this.count === wakeLimits.capacity) {
      this.first = (this.first + 1) % wakeLimits.capacity;
      this.count--;
    }
    const point = this.point(this.count++);
    point.center.set(x, waterY, z);
    point.position.set(x - Math.sin(angle) * 0.72, waterY + 0.018, z - Math.cos(angle) * 0.72);
    point.time = time;
    point.angle = angle;
    point.strength = this.strength;
    point.distance = distance;
    point.segment = this.segment;
  }

  update(
    time: number,
    position: T.Vector3,
    angle: number,
    moving: boolean,
    waterY: number,
    reduced: boolean,
    hullY = 0,
  ) {
    if (reduced || !Number.isFinite(time + position.x + position.z + angle + waterY + hullY)) {
      this.clear();
      return;
    }
    if (moving && !this.active) this.begin(time, position, angle);
    if (!moving && this.active) this.finish(time);
    const elapsed = this.previousTime === null ? 0 : time - this.previousTime,
      dx = position.x - this.previous.x,
      dz = position.z - this.previous.z,
      horizontal = Math.hypot(dx, dz);
    if (elapsed < 0 || elapsed > 300 || horizontal > 2.5) {
      this.clear();
      if (moving) this.begin(time, position, angle);
    } else if (moving && elapsed > 0 && horizontal > 0.00001) {
      this.speed = horizontal / (elapsed * 0.001);
      this.strength = T.MathUtils.smoothstep(this.speed, 0.08, 1.5) * 0.64;
      this.peakStrength = Math.max(this.peakStrength, this.strength);
      this.emitting = this.strength > 0.001;
      let remaining = horizontal,
        used = 0;
      while (this.carried + remaining >= wakeLimits.spacing) {
        const step = wakeLimits.spacing - this.carried;
        used += step;
        remaining -= step;
        const fraction = used / horizontal;
        this.emit(
          time - elapsed * (1 - fraction),
          this.previous.x + dx * fraction,
          this.previous.z + dz * fraction,
          this.previousAngle + (angle - this.previousAngle) * fraction,
          this.previousWater + (waterY - this.previousWater) * fraction,
          this.travelled + used,
        );
        this.carried = 0;
      }
      this.carried += remaining;
      this.travelled += horizontal;
    } else {
      this.emitting = false;
      this.speed = 0;
      this.strength = 0;
    }
    this.previous.copy(position);
    this.previousAngle = angle;
    this.previousTime = time;
    this.previousWater = waterY;
    while (this.count && time - this.point(0).time > wakeLimits.lifetime) {
      this.first = (this.first + 1) % wakeLimits.capacity;
      this.count--;
    }
    let length = 0;
    for (let i = this.count - 2; i >= 0; i--) {
      const a = this.point(i),
        b = this.point(i + 1);
      if (a.segment === b.segment)
        length += Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z);
      if (length > wakeLimits.length) {
        this.first = (this.first + i + 1) % wakeLimits.capacity;
        this.count -= i + 1;
        break;
      }
    }
    let settling = 0;
    if (this.dockingStarted !== null) {
      settling = T.MathUtils.clamp((time - this.dockingStarted) / 650, 0, 1);
      if (settling === 1) {
        this.dockingStarted = null;
        this.dockingStrength = 0;
      }
    }
    this.contactStrength = this.strength * 0.5 + this.dockingStrength * (1 - settling) ** 2;
    this.interaction.position.set(position.x, waterY, position.z);
    this.interaction.direction.set(Math.sin(angle), 0, Math.cos(angle));
    this.interaction.strength = this.strength + this.dockingStrength * (1 - settling) ** 2;
    this.mesh.material.uniforms.waterY.value = waterY;
    this.vertices = 0;
    this.buildTrail(time, waterY);
    if (this.contactStrength > 0.001) {
      const swell = settling * 0.18,
        width = 0.51 - Math.min(0.05, hullY * 0.15);
      this.contact(position, angle, waterY, width, 0.9, -1.43, 1.43, this.contactStrength, 0, 0);
      this.contact(
        position,
        angle,
        waterY,
        0.25 + swell,
        0.19 + swell * 0.7,
        -Math.PI,
        Math.PI,
        this.contactStrength * 0.58,
        -0.76,
        1,
      );
    }
    for (const attribute of Object.values(this.mesh.geometry.attributes))
      attribute.needsUpdate = true;
    this.mesh.geometry.setDrawRange(0, this.vertices);
    this.mesh.visible = this.vertices > 0;
  }

  private vertex(
    x: number,
    y: number,
    z: number,
    alpha: number,
    side: number,
    distance: number,
    age: number,
    kind: number,
  ) {
    const geometry = this.mesh.geometry,
      index = this.vertices++;
    geometry.getAttribute('position').setXYZ(index, x, y, z);
    geometry.getAttribute('fade').setX(index, alpha);
    geometry.getAttribute('lateral').setX(index, side);
    geometry.getAttribute('distance').setX(index, distance);
    geometry.getAttribute('age').setX(index, age);
    geometry.getAttribute('kind').setX(index, kind);
  }

  private buildTrail(time: number, waterY: number) {
    for (let i = 0; i < this.count; i++) {
      const current = this.point(i),
        previous = i && this.point(i - 1).segment === current.segment ? this.point(i - 1) : current,
        next =
          i + 1 < this.count && this.point(i + 1).segment === current.segment
            ? this.point(i + 1)
            : current,
        dx = next.position.x - previous.position.x,
        dz = next.position.z - previous.position.z,
        length = Math.hypot(dx, dz) || 1;
      this.joins[i * 2] = -dz / length;
      this.joins[i * 2 + 1] = dx / length;
    }
    for (let i = 1; i < this.count; i++) {
      const a = this.point(i - 1),
        b = this.point(i);
      if (a.segment !== b.segment) continue;
      const ageA = T.MathUtils.clamp((time - a.time) / wakeLimits.lifetime, 0, 1),
        ageB = T.MathUtils.clamp((time - b.time) / wakeLimits.lifetime, 0, 1),
        widthA = 0.36 + ageA * 0.28,
        widthB = 0.36 + ageB * 0.28,
        ax = this.joins[(i - 1) * 2] * widthA,
        az = this.joins[(i - 1) * 2 + 1] * widthA,
        bx = this.joins[i * 2] * widthB,
        bz = this.joins[i * 2 + 1] * widthB,
        fadeA = a.strength * (1 - ageA) ** 0.9,
        fadeB = b.strength * (1 - ageB) ** 0.9,
        y = waterY + 0.018;
      this.vertex(a.position.x + ax, y, a.position.z + az, fadeA, 1, a.distance, ageA, 0);
      this.vertex(a.position.x - ax, y, a.position.z - az, fadeA, -1, a.distance, ageA, 0);
      this.vertex(b.position.x + bx, y, b.position.z + bz, fadeB, 1, b.distance, ageB, 0);
      this.vertex(a.position.x - ax, y, a.position.z - az, fadeA, -1, a.distance, ageA, 0);
      this.vertex(b.position.x - bx, y, b.position.z - bz, fadeB, -1, b.distance, ageB, 0);
      this.vertex(b.position.x + bx, y, b.position.z + bz, fadeB, 1, b.distance, ageB, 0);
    }
  }

  private contact(
    position: T.Vector3,
    angle: number,
    waterY: number,
    width: number,
    reach: number,
    start: number,
    end: number,
    strength: number,
    offset: number,
    seed: number,
  ) {
    const sine = Math.sin(angle),
      cosine = Math.cos(angle);
    for (let i = 0; i < 24; i++) {
      const a = start + ((end - start) * i) / 24,
        b = start + ((end - start) * (i + 1)) / 24;
      for (let j = 0; j < 6; j++) {
        const front = j === 2 || j === 4 || j === 5,
          outer = j === 0 || j === 2 || j === 5,
          theta = front ? b : a,
          side = outer ? 1 : -1,
          x = Math.sin(theta) * (width + side * 0.065),
          z = Math.cos(theta) * (reach + side * 0.065) + offset,
          endFade = seed ? 1 : Math.sin(((theta - start) / (end - start)) * Math.PI) ** 0.6;
        this.vertex(
          position.x + x * cosine + z * sine,
          waterY + 0.018,
          position.z - x * sine + z * cosine,
          strength * endFade,
          side,
          theta + seed,
          0,
          1,
        );
      }
    }
  }

  presentation() {
    const geometry = this.mesh.geometry;
    return {
      emitting: this.emitting,
      visible: this.mesh.visible,
      vertices: this.vertices,
      positions: Array.from(
        (geometry.getAttribute('position') as T.BufferAttribute).array.slice(0, this.vertices * 3),
      ),
      opacity: Array.from(
        (geometry.getAttribute('fade') as T.BufferAttribute).array.slice(0, this.vertices),
      ),
      points: Array.from({ length: this.count }, (_, index) => {
        const point = this.point(index);
        return {
          position: point.position.toArray(),
          center: point.center.toArray(),
          time: point.time,
          heading: point.angle,
          segment: point.segment,
        };
      }),
      limits: { ...wakeLimits },
      speed: this.speed,
      strength: this.strength,
      contactStrength: this.contactStrength,
      docking: this.dockingStarted !== null,
      interaction: {
        position: this.interaction.position.toArray(),
        direction: this.interaction.direction.toArray(),
        strength: this.interaction.strength,
      },
    };
  }
}
