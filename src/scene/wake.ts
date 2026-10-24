import * as T from 'three';

export type WakeCoast = { texture: T.Texture; bounds: T.Vector4 };

export const wakeLimits = {
  capacity: 12,
  lifetime: 1800,
  spacing: 0.72,
  variation: 0.5,
  sections: 12,
};

type ReleasedCrest = {
  id: number;
  position: T.Vector3;
  center: T.Vector3;
  direction: T.Vector3;
  time: number;
  angle: number;
  strength: number;
  seed: number;
  segment: number;
};

const variation = (id: number) => (id * 0.61803398875 + 0.27) % 1;

export class FerryWake {
  mesh: T.Mesh<T.BufferGeometry, T.ShaderMaterial>;
  interaction = { position: new T.Vector3(), direction: new T.Vector3(0, 0, 1), strength: 0 };
  readonly pool: ReleasedCrest[] = Array.from({ length: wakeLimits.capacity }, () => ({
    id: 0,
    position: new T.Vector3(),
    center: new T.Vector3(),
    direction: new T.Vector3(),
    time: 0,
    angle: 0,
    strength: 0,
    seed: 0,
    segment: 0,
  }));
  private shape = { age: 0, width: 0, bend: 0, skew: 0, opacity: 0, x: 0, z: 0 };
  count = 0;
  first = 0;
  segment = 0;
  serial = 0;
  emitting = false;
  active = false;
  previous = new T.Vector3();
  previousAngle = 0;
  previousTime: number | null = null;
  previousWater = 0;
  carried = 0;
  nextSpacing = 0.2;
  speed = 0;
  strength = 0;
  vertices = 0;

  constructor(coast?: WakeCoast) {
    const capacity = wakeLimits.capacity * wakeLimits.sections * 6,
      geometry = new T.BufferGeometry();
    geometry.setAttribute(
      'position',
      new T.Float32BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(T.DynamicDrawUsage),
    );
    for (const name of ['fade', 'lateral', 'distance', 'age'])
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
      vertexShader: `attribute float fade;attribute float lateral;attribute float distance;attribute float age;
        varying float alpha;varying float across;varying float along;varying float seed;varying vec2 worldXZ;
        void main(){
          alpha=fade;across=lateral;along=distance;seed=age;worldXZ=position.xz;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        }`,
      fragmentShader: `uniform vec3 pearl;uniform vec3 body;uniform sampler2D coast;uniform vec4 field;uniform float hasCoast;uniform float waterY;
        varying float alpha;varying float across;varying float along;varying float seed;varying vec2 worldXZ;
        void main(){
          float ends=1.-smoothstep(.55,1.,abs(along));
          float softness=1.-smoothstep(.04,1.,abs(across));
          float crest=1.-smoothstep(.04,.6,abs(across-.1));
          float gap=1.-.64*exp(-pow((along-(seed-.5)*.9)*5.5,2.));
          float bodyWeight=softness*.18;
          float coverage=(bodyWeight+crest*.82)*ends*gap;
          float wet=1.;
          if(hasCoast>.5){
            vec4 land=texture2D(coast,clamp((worldXZ-field.xy)/field.zw,0.,1.));
            wet=1.-land.a*smoothstep(waterY+.004,waterY+.025,land.b*.72);
          }
          gl_FragColor=vec4(mix(body,pearl,crest),alpha*coverage*wet);
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
    this.segment = 0;
    this.serial = 0;
    this.emitting = false;
    this.active = false;
    this.previousTime = null;
    this.carried = 0;
    this.nextSpacing = 0.2;
    this.speed = 0;
    this.strength = 0;
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
    this.nextSpacing = 0.2;
    this.speed = 0;
    this.strength = 0;
    this.interaction.strength = 0;
  }

  finish(_time: number) {
    this.active = false;
    this.emitting = false;
    this.speed = 0;
    this.strength = 0;
    this.interaction.strength = 0;
  }

  private emit(
    time: number,
    x: number,
    z: number,
    angle: number,
    dx: number,
    dz: number,
    waterY: number,
  ) {
    if (this.strength < 0.025) return;
    if (this.count === wakeLimits.capacity) {
      this.first = (this.first + 1) % wakeLimits.capacity;
      this.count--;
    }
    const point = this.point(this.count++),
      forward = dx * Math.sin(angle) + dz * Math.cos(angle),
      sideways = dx * Math.cos(angle) - dz * Math.sin(angle),
      reach = 1 / Math.hypot(forward / 0.76, sideways / 0.48);
    point.id = ++this.serial;
    point.center.set(x, waterY, z);
    point.position.set(x - dx * reach, waterY + 0.018, z - dz * reach);
    point.direction.set(dx, 0, dz);
    point.time = time;
    point.angle = angle;
    point.strength = this.strength;
    point.seed = variation(point.id);
    point.segment = this.segment;
    this.nextSpacing = wakeLimits.spacing + point.seed * wakeLimits.variation;
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
      this.strength = T.MathUtils.smoothstep(this.speed, 0.08, 1.5) * 0.58;
      this.emitting = this.strength > 0.025;
      this.interaction.direction.set(dx / horizontal, 0, dz / horizontal);
      let remaining = horizontal,
        used = 0;
      while (this.carried + remaining >= this.nextSpacing) {
        const step = this.nextSpacing - this.carried;
        used += step;
        remaining -= step;
        const fraction = used / horizontal;
        this.emit(
          time - elapsed * (1 - fraction),
          this.previous.x + dx * fraction,
          this.previous.z + dz * fraction,
          this.previousAngle + (angle - this.previousAngle) * fraction,
          dx / horizontal,
          dz / horizontal,
          this.previousWater + (waterY - this.previousWater) * fraction,
        );
        this.carried = 0;
      }
      this.carried += remaining;
    } else {
      this.emitting = false;
      this.speed = 0;
      this.strength = 0;
    }
    this.previous.copy(position);
    this.previousAngle = angle;
    this.previousTime = time;
    this.previousWater = waterY;
    while (this.count && time - this.point(0).time >= wakeLimits.lifetime) {
      this.first = (this.first + 1) % wakeLimits.capacity;
      this.count--;
    }
    this.interaction.position.set(position.x, waterY, position.z);
    this.interaction.strength = this.strength;
    this.mesh.material.uniforms.waterY.value = waterY;
    this.vertices = 0;
    for (let i = 0; i < this.count; i++) this.buildCrest(this.point(i), time, waterY);
    for (const attribute of Object.values(this.mesh.geometry.attributes))
      attribute.needsUpdate = true;
    this.mesh.geometry.setDrawRange(0, this.vertices);
    this.mesh.visible = this.vertices > 0;
  }

  private evolve(point: ReleasedCrest, time: number) {
    const age = T.MathUtils.clamp((time - point.time) / wakeLimits.lifetime, 0, 1),
      spread = 1 - (1 - age) ** 1.5,
      drift = spread * 0.24,
      skew = (point.seed - 0.5) * 0.3;
    this.shape.age = age;
    this.shape.width = 0.43 + point.seed * 0.1 + spread * (0.72 + point.seed * 0.22);
    this.shape.bend = 0.12 + spread * 0.36;
    this.shape.skew = skew;
    this.shape.opacity = point.strength * T.MathUtils.smoothstep(age, 0, 0.07) * (1 - age) ** 1.1;
    this.shape.x = point.position.x - point.direction.x * drift + point.direction.z * skew * spread;
    this.shape.z = point.position.z - point.direction.z * drift - point.direction.x * skew * spread;
    return this.shape;
  }

  private vertex(
    x: number,
    y: number,
    z: number,
    alpha: number,
    side: number,
    along: number,
    seed: number,
  ) {
    const geometry = this.mesh.geometry,
      index = this.vertices++;
    geometry.getAttribute('position').setXYZ(index, x, y, z);
    geometry.getAttribute('fade').setX(index, alpha);
    geometry.getAttribute('lateral').setX(index, side);
    geometry.getAttribute('distance').setX(index, along);
    geometry.getAttribute('age').setX(index, seed);
  }

  private buildCrest(point: ReleasedCrest, time: number, waterY: number) {
    const shape = this.evolve(point, time);
    if (shape.opacity < 0.001) return;
    const thickness = 0.105 + shape.age * 0.075;
    for (let i = 0; i < wakeLimits.sections; i++) {
      for (let j = 0; j < 6; j++) {
        const end = j === 2 || j === 4 || j === 5,
          side = j === 0 || j === 2 || j === 5 ? 1 : -1,
          u = ((i + Number(end)) / wakeLimits.sections) * 2 - 1,
          slope = 2 * shape.bend * u + shape.skew,
          length = Math.hypot(shape.width, slope),
          x = u * shape.width - (slope / length) * side * thickness,
          z =
            -shape.bend * (1 - u * u) + shape.skew * u + (shape.width / length) * side * thickness;
        this.vertex(
          shape.x + x * point.direction.z + z * point.direction.x,
          waterY + 0.018,
          shape.z - x * point.direction.x + z * point.direction.z,
          shape.opacity,
          side,
          u,
          point.seed,
        );
      }
    }
  }

  presentation() {
    const geometry = this.mesh.geometry,
      time = this.previousTime ?? 0;
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
        const point = this.point(index),
          shape = this.evolve(point, time);
        return {
          id: point.id,
          position: point.position.toArray(),
          center: point.center.toArray(),
          direction: point.direction.toArray(),
          time: point.time,
          heading: point.angle,
          strength: point.strength,
          seed: point.seed,
          segment: point.segment,
          evolution: { ...shape, waterY: this.previousWater + 0.018 },
        };
      }),
      limits: { ...wakeLimits },
      speed: this.speed,
      strength: this.strength,
      contactStrength: 0,
      docking: false,
      interaction: {
        position: this.interaction.position.toArray(),
        direction: this.interaction.direction.toArray(),
        strength: this.interaction.strength,
      },
    };
  }
}
