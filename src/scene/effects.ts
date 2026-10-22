import * as T from 'three';

export class CrossingEffects {
  wake: T.Mesh;
  glow: T.Sprite;
  points: { position: T.Vector3; time: number }[] = [];
  emitting = false;
  arrivalStarted: number | null = null;
  arrivalIntensity = 0;
  lamp?: T.PointLight;
  lens?: T.MeshStandardMaterial;
  lampBase = 0;
  reduced = false;
  constructor(lighthouse: T.Object3D) {
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      'position',
      new T.Float32BufferAttribute(new Float32Array(32 * 6 * 3), 3).setUsage(T.DynamicDrawUsage),
    );
    geometry.setAttribute(
      'fade',
      new T.Float32BufferAttribute(new Float32Array(32 * 6), 1).setUsage(T.DynamicDrawUsage),
    );
    geometry.setDrawRange(0, 0);
    this.wake = new T.Mesh(
      geometry,
      new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: T.DoubleSide,
        vertexShader:
          'attribute float fade;varying float alpha;void main(){alpha=fade;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'varying float alpha;void main(){gl_FragColor=vec4(.70,.83,.77,alpha);}',
      }),
    );
    this.wake.name = 'ferry-wake';
    this.wake.userData.excludeFromFrame = true;
    this.wake.frustumCulled = false;
    this.wake.visible = false;
    const pixels = new Uint8Array(32 * 32 * 4);
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        const index = (y * 32 + x) * 4;
        const radius = Math.hypot((x - 15.5) / 16, (y - 15.5) / 16);
        pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
        pixels[index + 3] = Math.round(Math.max(0, 1 - radius) ** 2 * 255);
      }
    const texture = new T.DataTexture(pixels, 32, 32, T.RGBAFormat);
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearFilter;
    texture.needsUpdate = true;
    this.glow = new T.Sprite(
      new T.SpriteMaterial({
        map: texture,
        color: '#ffcf78',
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.glow.name = 'harbor-lantern-response';
    this.glow.position.copy(lighthouse.localToWorld(new T.Vector3(0, 2.6, 0)));
    this.glow.scale.set(1.8, 1.8, 1);
    this.glow.userData.excludeFromFrame = true;
    this.glow.visible = false;
    lighthouse.traverse((object) => {
      if (object instanceof T.PointLight) {
        this.lamp = object;
        this.lampBase = object.intensity;
      }
      if (
        object instanceof T.Mesh &&
        object.material instanceof T.MeshStandardMaterial &&
        object.material.color.getHexString() === 'f9cb70'
      ) {
        object.material = object.material.clone();
        this.lens = object.material;
        this.lens!.emissive.set('#ffd795');
      }
    });
  }
  reset() {
    this.points.length = 0;
    this.emitting = false;
    this.wake.geometry.setDrawRange(0, 0);
    this.wake.visible = false;
    this.arrivalStarted = null;
    this.arrivalIntensity = 0;
    this.glow.visible = false;
    this.glow.material.opacity = 0;
    if (this.lamp) this.lamp.intensity = this.lampBase;
    if (this.lens) this.lens.emissiveIntensity = 0;
  }
  arrive(time: number, reduced: boolean) {
    if (this.arrivalStarted === null) this.arrivalStarted = time;
    this.reduced = reduced;
  }
  update(
    time: number,
    position: T.Vector3,
    angle: number,
    moving: boolean,
    waterY: number,
    reduced: boolean,
  ) {
    this.reduced = reduced;
    this.emitting = moving && !reduced;
    if (this.emitting) {
      const stern = position
        .clone()
        .add(new T.Vector3(-Math.sin(angle) * 0.72, 0, -Math.cos(angle) * 0.72));
      stern.y = waterY + 0.018;
      if (!this.points.length || stern.distanceTo(this.points.at(-1)!.position) > 0.045)
        this.points.push({ position: stern, time });
    }
    while (this.points.length && time - this.points[0].time > 360) this.points.shift();
    while (this.points.length > 31) this.points.shift();
    let length = 0;
    for (let i = this.points.length - 2; i >= 0; i--) {
      length += this.points[i].position.distanceTo(this.points[i + 1].position);
      if (length > 1.55) {
        this.points.splice(0, i + 1);
        break;
      }
    }
    if (reduced) this.points.length = 0;
    const positions = this.wake.geometry.getAttribute('position') as T.BufferAttribute;
    const fade = this.wake.geometry.getAttribute('fade') as T.BufferAttribute;
    let count = 0;
    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1],
        b = this.points[i];
      const direction = b.position.clone().sub(a.position).setY(0).normalize();
      const normal = new T.Vector3(-direction.z, 0, direction.x);
      const widthA = 0.04 + (i / this.points.length) * 0.13,
        widthB = 0.04 + ((i + 1) / this.points.length) * 0.13;
      const vertices = [
        a.position.clone().addScaledVector(normal, widthA),
        a.position.clone().addScaledVector(normal, -widthA),
        b.position.clone().addScaledVector(normal, widthB),
        a.position.clone().addScaledVector(normal, -widthA),
        b.position.clone().addScaledVector(normal, -widthB),
        b.position.clone().addScaledVector(normal, widthB),
      ];
      for (const [j, vertex] of vertices.entries()) {
        positions.setXYZ(count, vertex.x, waterY + 0.018, vertex.z);
        const age = time - (j < 2 || j === 3 ? a.time : b.time);
        fade.setX(count++, Math.max(0, 1 - age / 360) * 0.18);
      }
    }
    positions.needsUpdate = true;
    fade.needsUpdate = true;
    this.wake.geometry.setDrawRange(0, count);
    this.wake.visible = count > 0;
    if (this.arrivalStarted !== null) {
      const elapsed = Math.max(0, time - this.arrivalStarted);
      this.arrivalIntensity = reduced ? 0.45 : 0.27 + 0.55 * Math.exp(-elapsed / 1100);
      if (this.lamp) this.lamp.intensity = this.lampBase + this.arrivalIntensity * 2;
      if (this.lens) this.lens.emissiveIntensity = this.arrivalIntensity;
      this.glow.visible = true;
      this.glow.material.opacity = this.arrivalIntensity * 0.26;
    }
  }
  presentation() {
    const count = this.wake.geometry.drawRange.count;
    return {
      wake: {
        emitting: this.emitting,
        visible: this.wake.visible,
        vertices: count,
        positions: Array.from(
          (this.wake.geometry.getAttribute('position') as T.BufferAttribute).array.slice(
            0,
            count * 3,
          ),
        ),
        opacity: Array.from(
          (this.wake.geometry.getAttribute('fade') as T.BufferAttribute).array.slice(0, count),
        ),
        points: this.points.map((point) => ({
          position: point.position.toArray(),
          time: point.time,
        })),
      },
      arrival: {
        active: this.arrivalStarted !== null,
        intensity: this.arrivalIntensity,
        lampIntensity: this.lamp?.intensity ?? null,
        emissiveIntensity: this.lens?.emissiveIntensity ?? null,
        glowVisible: this.glow.visible,
        glowOpacity: this.glow.material.opacity,
      },
    };
  }
}
