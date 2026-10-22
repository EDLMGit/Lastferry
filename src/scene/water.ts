import * as T from 'three';
import type { Level } from '../levels/level';
import type { CanonicalPath } from './paths';
import { shoreContour } from './shore';

const distance = (x: number, z: number, a: T.Vector2, b: T.Vector2) => {
  const dx = b.x - a.x,
    dz = b.y - a.y;
  const t = T.MathUtils.clamp(
    ((x - a.x) * dx + (z - a.y) * dz) / Math.max(1e-9, dx * dx + dz * dz),
    0,
    1,
  );
  return Math.hypot(x - a.x - dx * t, z - a.y - dz * t);
};
function inside(x: number, z: number, points: T.Vector2[]) {
  let odd = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (a.y > z !== b.y > z && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) odd = !odd;
  }
  return odd;
}
export function coastalMask(level: Level, paths: Map<string, CanonicalPath>) {
  const bounds = new T.Box2();
  for (const island of level.world.islands)
    for (const p of island.footprintXZ) bounds.expandByPoint(new T.Vector2(p[0], p[1]));
  for (const path of paths.values())
    for (const p of path.points) bounds.expandByPoint(new T.Vector2(p.x, p.z));
  bounds.expandByScalar(4);
  const coasts = level.world.islands.map((island) => ({
    points: shoreContour(island, 0.98),
    height: island.elevation * 0.18,
  }));
  const shallow = level.edges
    .filter((edge) => edge.baseDepth < 3)
    .flatMap((edge) => {
      const points = paths.get(edge.id)!.points.filter((_, i) => i % 5 === 0);
      const last = paths.get(edge.id)!.points.at(-1)!;
      if (points.at(-1) !== last) points.push(last);
      return points.slice(1).map((b, i) => ({
        a: new T.Vector2(points[i].x, points[i].z),
        b: new T.Vector2(b.x, b.z),
        strength: edge.baseDepth === 1 ? 1 : 0.5,
      }));
    });
  const size = 256,
    data = new Uint8Array(size * size * 4),
    span = bounds.getSize(new T.Vector2());
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const x = bounds.min.x + ((i + 0.5) / size) * span.x,
        z = bounds.min.y + ((j + 0.5) / size) * span.y;
      let bank = 0,
        shore = 0,
        landHeight = 0,
        land = 0,
        nearestCoast = Number.POSITIVE_INFINITY;
      for (const segment of shallow) {
        const d = distance(x, z, segment.a, segment.b);
        const width = 1.2 + 0.3 * Math.sin(x * 0.73 - z * 0.91);
        bank = Math.max(bank, Math.exp(-(d * d) / (width * width)) * segment.strength);
      }
      for (const coast of coasts) {
        const isLand = inside(x, z, coast.points);
        let d = 100;
        for (let k = 0; k < coast.points.length; k++)
          d = Math.min(
            d,
            distance(x, z, coast.points[k], coast.points[(k + 1) % coast.points.length]),
          );
        shore = Math.max(shore, Math.exp(-(d * d) / 1.1));
        if (d < nearestCoast) {
          nearestCoast = d;
          landHeight = coast.height;
        }
        land = Math.max(land, T.MathUtils.smoothstep(isLand ? d : -d, -0.18, 0.18));
      }
      const index = (j * size + i) * 4;
      data[index] = Math.round(bank * 255);
      data[index + 1] = Math.round(shore * 255);
      data[index + 2] = Math.round((landHeight / 0.72) * 255);
      data[index + 3] = Math.round(land * 255);
    }
  const texture = new T.DataTexture(data, size, size, T.RGBAFormat);
  texture.magFilter = T.LinearFilter;
  texture.minFilter = T.LinearFilter;
  texture.needsUpdate = true;
  return {
    texture,
    bounds: new T.Vector4(bounds.min.x, bounds.min.y, span.x, span.y),
    shallowSegments: shallow.length,
  };
}
export class CoastalWater {
  mesh: T.Mesh;
  mask: ReturnType<typeof coastalMask>;
  constructor(level: Level, paths: Map<string, CanonicalPath>) {
    this.mask = coastalMask(level, paths);
    const material = new T.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterY: { value: 0 },
        coast: { value: this.mask.texture },
        field: { value: this.mask.bounds },
      },
      vertexShader: `varying vec3 world;void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,
      fragmentShader: `varying vec3 world;uniform float time;uniform float waterY;uniform sampler2D coast;uniform vec4 field;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){
vec2 p=world.xz;vec2 uv=(p-field.xy)/field.zw;vec4 bed=texture2D(coast,clamp(uv,0.,1.));
float broad=noise(p*.27+vec2(time*.002,0.));
float banks=clamp(bed.r*.7+bed.g*.4,0.,.9)*(1.-waterY*.65);
vec3 c=mix(vec3(.135,.315,.382),vec3(.19,.375,.415),broad);
c=mix(c,vec3(.34,.47,.405),banks);
float submerged=bed.a*smoothstep(bed.b*.72-.07,bed.b*.72-.005,waterY);
float depth=max(0.,waterY-bed.b*.72);
c=mix(c,vec3(.30,.435,.39)*(.92+noise(p*1.3)*.14),submerged*.56*exp(-depth*1.2));
vec2 cell=floor(p*vec2(.78,.92));vec2 q=fract(p*vec2(.78,.92))-.5;float seed=hash(cell);
q.x+=sin(q.y*5.+seed*9.)*.11;
float glint=exp(-pow(q.x*4.,2.)-pow(q.y*30.,2.))*step(.79,seed);
glint*=.45+.55*pow(sin(time*.24+seed*13.)*.5+.5,2.);
c+=glint*.037;gl_FragColor=vec4(c,1.);}`,
    });
    this.mesh = new T.Mesh(new T.PlaneGeometry(200, 200), material);
    this.mesh.name = 'coastal-water';
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.userData.excludeFromFrame = true;
  }
  update(waterY: number, time: number) {
    this.mesh.position.y = waterY;
    const material = this.mesh.material as T.ShaderMaterial;
    material.uniforms.waterY.value = waterY;
    material.uniforms.time.value = time;
  }
}
