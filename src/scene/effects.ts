import * as T from 'three';
import type { lighthouse } from './models';
import { FerryWake, type WakeCoast } from './wake';

export class CrossingEffects {
  wake: T.Mesh;
  glow: T.Sprite;
  sweep = new T.Group();
  sweepPhase = 0;
  sweepLastTime: number | null = null;
  comparisonPhase: number | null = null;
  movement: FerryWake;
  interaction: FerryWake['interaction'];
  arrivalStarted: number | null = null;
  arrivalIntensity = 0;
  resting = false;
  lamp?: T.PointLight;
  lens?: T.MeshStandardMaterial;
  lensBase = 0;
  lampBase = 0;
  reduced = false;
  constructor(home: ReturnType<typeof lighthouse>, coast?: WakeCoast) {
    this.movement = new FerryWake(coast);
    this.wake = this.movement.mesh;
    this.interaction = this.movement.interaction;
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
        depthTest: true,
        depthWrite: false,
        blending: T.AdditiveBlending,
        premultipliedAlpha: false,
        side: T.DoubleSide,
        forceSinglePass: true,
        uniforms: {
          strength: { value: 0.22 },
          tint: { value: new T.Color('#ffdda3') },
        },
        vertexShader: `varying vec3 beamNormal;varying float beamDistance;
          void main(){
            beamNormal=normalMatrix*normal;
            beamDistance=uv.y;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
          }`,
        fragmentShader: `uniform float strength;uniform vec3 tint;
          varying vec3 beamNormal;varying float beamDistance;
          void main(){
            float facing=abs(normalize(beamNormal).z);
            float silhouette=pow(facing,1.5)*smoothstep(0.,.2,facing);
            float reach=smoothstep(0.,.025,beamDistance)*exp(-1.5*beamDistance);
            reach*=1.-smoothstep(.42,.95,beamDistance);
            gl_FragColor=vec4(tint,.5*strength*silhouette*reach);
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
    this.clearMovement();
    this.arrivalStarted = null;
    this.arrivalIntensity = 0;
    this.resting = false;
    this.reduced = false;
    this.sweep.visible = false;
    this.sweepPhase = 0;
    this.sweepLastTime = null;
    this.comparisonPhase = null;
    this.sweep.rotation.y = 0;
    this.glow.visible = true;
    this.glow.material.opacity = 0.08;
    this.glow.material.blending = T.NormalBlending;
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
    this.glow.material.blending = T.AdditiveBlending;
    this.glow.material.opacity = 0.08 + this.arrivalIntensity * 0.26;
  }
  beginMovement(time: number, position: T.Vector3, angle?: number) {
    this.movement.begin(time, position, angle);
  }
  finishMovement(time: number) {
    this.movement.finish(time);
  }
  clearMovement() {
    this.movement.clear();
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
    this.reduced = reduced;
    this.movement.update(time, position, angle, moving, waterY, reduced, hullY);
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
      this.sweep.rotation.y = this.comparisonPhase ?? (reduced ? 0.45 : this.sweepPhase);
    }
  }
  presentation() {
    return {
      wake: this.movement.presentation(),
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
          comparisonPhase: this.comparisonPhase,
        },
      },
    };
  }
}
