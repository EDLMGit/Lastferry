import * as T from 'three';
import type { lighthouse } from './models';

export class CrossingEffects {
  wake: T.Mesh;
  glow: T.Sprite;
  sweep = new T.Group();
  sweepPhase = 0;
  sweepLastTime: number | null = null;
  points: { position: T.Vector3; time: number }[] = [];
  emitting = false;
  arrivalStarted: number | null = null;
  arrivalIntensity = 0;
  resting = false;
  lamp?: T.PointLight;
  lens?: T.MeshStandardMaterial;
  lensBase = 0;
  lampBase = 0;
  reduced = false;
  constructor(home: ReturnType<typeof lighthouse>) {
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      'position',
      new T.Float32BufferAttribute(new Float32Array(32 * 6 * 3), 3).setUsage(T.DynamicDrawUsage),
    );
    geometry.setAttribute(
      'fade',
      new T.Float32BufferAttribute(new Float32Array(32 * 6), 1).setUsage(T.DynamicDrawUsage),
    );
    geometry.setAttribute(
      'lateral',
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
          'attribute float fade;attribute float lateral;varying float alpha;varying float sideFade;void main(){alpha=fade;sideFade=lateral;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: `varying float alpha;varying float sideFade;
          void main(){
            float feather=1.-smoothstep(.25,1.,abs(sideFade));
            gl_FragColor=vec4(.36,.52,.48,alpha*feather);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
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
    this.glow.position.copy(home.anchor.getWorldPosition(new T.Vector3()));
    this.glow.scale.set(1.1, 1.1, 1);
    this.glow.userData.excludeFromFrame = true;
    const beam = new T.Mesh(
      new T.CylinderGeometry(0.82, 0.035, 4.8, 20, 8, true),
      new T.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: T.DoubleSide,
        forceSinglePass: true,
        uniforms: { strength: { value: 0.14 } },
        vertexShader:
          'varying vec2 beamUv;void main(){beamUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: `uniform float strength;varying vec2 beamUv;
          void main(){
            float reach=smoothstep(0.,.08,beamUv.y)*(1.-smoothstep(.3,1.,beamUv.y));
            float feather=.45+.55*pow(abs(cos(beamUv.x*6.2831853)),3.);
            gl_FragColor=vec4(1.,.67,.27,strength*reach*feather);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    );
    beam.rotation.z = -Math.PI / 2;
    beam.position.x = 2.4;
    beam.name = 'harbor-amber-sweep';
    beam.raycast = () => {};
    this.sweep.add(beam);
    this.sweep.position.copy(home.lens.getWorldPosition(new T.Vector3()));
    this.sweep.name = 'harbor-homecoming-beam';
    this.sweep.userData.excludeFromFrame = true;
    this.sweep.userData.decorative = true;
    this.lamp = home.lamp;
    this.lampBase = home.lamp.intensity;
    this.lens = home.lens.material as T.MeshStandardMaterial;
    this.lensBase = this.lens.emissiveIntensity;
    this.reset();
  }
  reset() {
    this.points.length = 0;
    this.emitting = false;
    this.wake.geometry.setDrawRange(0, 0);
    this.wake.visible = false;
    this.arrivalStarted = null;
    this.arrivalIntensity = 0;
    this.resting = false;
    this.reduced = false;
    this.sweep.visible = false;
    this.sweepPhase = 0;
    this.sweepLastTime = null;
    this.sweep.rotation.y = 0;
    this.glow.visible = true;
    this.glow.material.opacity = 0.08;
    if (this.lamp) this.lamp.intensity = this.lampBase;
    if (this.lens) this.lens.emissiveIntensity = this.lensBase;
  }
  arrive(time: number, reduced: boolean) {
    if (this.arrivalStarted === null) this.arrivalStarted = time;
    this.reduced = reduced;
    this.sweep.visible = true;
  }
  settle(reduced: boolean) {
    this.reset();
    this.resting = true;
    this.reduced = reduced;
    this.arrivalIntensity = reduced ? 0.45 : 0.27;
    this.sweep.visible = true;
    this.applyLight();
  }
  private applyLight() {
    if (this.lamp) this.lamp.intensity = this.lampBase + this.arrivalIntensity * 2;
    if (this.lens) this.lens.emissiveIntensity = this.lensBase + this.arrivalIntensity;
    this.glow.visible = true;
    this.glow.material.opacity = 0.08 + this.arrivalIntensity * 0.26;
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
    while (this.points.length && time - this.points[0].time > 720) this.points.shift();
    while (this.points.length > 31) this.points.shift();
    let length = 0;
    for (let i = this.points.length - 2; i >= 0; i--) {
      length += this.points[i].position.distanceTo(this.points[i + 1].position);
      if (length > 1.8) {
        this.points.splice(0, i + 1);
        break;
      }
    }
    if (reduced) this.points.length = 0;
    const positions = this.wake.geometry.getAttribute('position') as T.BufferAttribute;
    const fade = this.wake.geometry.getAttribute('fade') as T.BufferAttribute;
    const lateral = this.wake.geometry.getAttribute('lateral') as T.BufferAttribute;
    let count = 0;
    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1],
        b = this.points[i];
      const direction = b.position.clone().sub(a.position).setY(0).normalize();
      const normal = new T.Vector3(-direction.z, 0, direction.x);
      const widthA = 0.055 + Math.min(1, (time - a.time) / 720) * 0.2,
        widthB = 0.055 + Math.min(1, (time - b.time) / 720) * 0.2;
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
        fade.setX(count, Math.max(0, 1 - age / 720) ** 1.4 * 0.16);
        lateral.setX(count++, [1, -1, 1, -1, -1, 1][j]);
      }
    }
    positions.needsUpdate = true;
    fade.needsUpdate = true;
    lateral.needsUpdate = true;
    this.wake.geometry.setDrawRange(0, count);
    this.wake.visible = count > 0;
    if (this.arrivalStarted !== null) {
      const elapsed = Math.max(0, time - this.arrivalStarted);
      this.arrivalIntensity = reduced ? 0.45 : 0.27 + 0.55 * Math.exp(-elapsed / 1100);
      this.applyLight();
    }
    if (this.sweep.visible) {
      if (!reduced && this.sweepLastTime !== null)
        this.sweepPhase +=
          (Math.min(100, Math.max(0, time - this.sweepLastTime)) / 20000) * Math.PI * 2;
      this.sweepLastTime = time;
      this.sweep.rotation.y = reduced ? 0.45 : this.sweepPhase;
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
        resting: this.resting,
        intensity: this.arrivalIntensity,
        lampIntensity: this.lamp?.intensity ?? null,
        emissiveIntensity: this.lens?.emissiveIntensity ?? null,
        glowVisible: this.glow.visible,
        glowOpacity: this.glow.material.opacity,
        sweep: {
          visible: this.sweep.visible,
          angle: this.sweep.rotation.y,
          reduced: this.reduced,
          startedAt: this.arrivalStarted,
          drawObjects: this.sweep.children.length,
        },
      },
    };
  }
}
