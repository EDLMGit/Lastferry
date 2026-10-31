import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args[i + 1];
};
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(arg('--repo', process.cwd()));
const output = resolve(arg('--out', join(packageRoot, 'assets/portraits')));
const git = (...arguments_) => execFileSync('git', arguments_, {cwd:repo, encoding:'utf8'}).trim();
const sourceCommit = git('rev-parse', 'HEAD');
const expectedCommit = arg('--source-commit', null);
if (expectedCommit && expectedCommit !== sourceCommit) {
  throw new Error(`Expected source ${expectedCommit}; repository HEAD is ${sourceCommit}.`);
}
const sourceWorkingTreeChanges = git('status', '--porcelain', '--',
  'src/scene/models.ts', 'src/scene/world.ts', 'package.json', 'package-lock.json');
const size = 256;
const projectRequire = createRequire(join(repo, 'package.json'));
const threeEntry = projectRequire.resolve('three');
const threeRoot = resolve(dirname(threeEntry), '..');
const T = await import(pathToFileURL(join(threeRoot, 'build/three.module.js')).href);
const { SVGRenderer } = await import(pathToFileURL(join(threeRoot, 'examples/jsm/renderers/SVGRenderer.js')).href);
const modelPath = join(repo, 'src/scene/models.ts');
const { animal } = await import(pathToFileURL(modelPath).href);
const sha = (data) => createHash('sha256').update(data).digest('hex');
const escape = (value) => String(value).replace(/[&"<>]/g, (c) => ({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]));

class Element {
  constructor(tag) { this.tag = tag; this.attributes = {}; this.childNodes = []; this.style = {}; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  appendChild(child) { this.childNodes.push(child); return child; }
  removeChild(child) { this.childNodes.splice(this.childNodes.indexOf(child), 1); return child; }
  serialize() {
    const attrs = Object.entries(this.attributes).map(([key, value]) => ` ${key}="${escape(value)}"`).join('');
    return `<${this.tag}${attrs}>${this.childNodes.map(child => child.serialize()).join('')}</${this.tag}>`;
  }
}
const priorDocument = globalThis.document;
globalThis.document = { createElementNS: (_namespace, tag) => new Element(tag) };

const variants = [{key:'beaver-brown', species:'beaver', variant:0, scale:[1.15,1.5,1.15], framingFloorModelY:0}];
const rasterizer = arg('--sharp-module', null);
const sharp = rasterizer ? createRequire(import.meta.url)(rasterizer) : null;
const { chromium } = await import('@playwright/test');
const browser = sharp ? null : await chromium.launch({headless:true});
const manifest = {
  status:'integrated derivative; human visual approval pending',
  sourceCommit,
  sourceWorkingTreeChanges:sourceWorkingTreeChanges ? sourceWorkingTreeChanges.split('\n') : [],
  nodeVersion:process.version,
  packageLockSha256:sha(await readFile(join(repo, 'package-lock.json'))),
  modelSource:'src/scene/models.ts',
  modelSourceSha256:sha(await readFile(modelPath)),
  worldScaleSource:'src/scene/world.ts — passenger group scale',
  worldSourceSha256:sha(await readFile(join(repo, 'src/scene/world.ts'))),
  threeVersion:JSON.parse(await readFile(join(threeRoot, 'package.json'), 'utf8')).version,
  generator:'tools/render-nell-portrait.mjs',
  generatorSha256:sha(await readFile(fileURLToPath(import.meta.url))),
  rendering:'Offline official SVGRenderer geometric projection; simplified diffuse shading, not WebGL/ACES or shadow equivalence.',
  output:{width:size,height:size,background:'transparent',colorSpace:'sRGB',runtimeRecommendation:'Use raster derivatives as ordinary images; keep geometric SVG as generated source/evidence.'},
  camera:{projection:'orthographic',offset:[2.7,1.8,5],fit:'projected full beaver including broad flat tail, square field and 8% total padding',lookAt:'world-scaled bounding-box center before off-center orthographic framing'},
  lighting:{ambientLinearRGB:[.43,.45,.44],key:{color:'#fff1dc',intensity:.75,position:[-3,5,4]},fill:{color:'#aed5d1',intensity:.26,position:[4,1,2]}},
  rasterizer:sharp ? {name:'sharp',versions:sharp.versions,width:size,height:size,filter:'lanczos3',inputPixels:768,outputFormat:'PNG RGBA'} : {name:'Chromium SVG rasterization',version:browser.version(),width:size,height:size,outputFormat:'PNG RGBA',background:'transparent'},
  entries:[],
};
await mkdir(output, {recursive:true});
try {
  for (const variant of variants) {
    const scene = new T.Scene();
    const group = animal(variant.species, variant.variant);
    group.scale.set(...variant.scale);
    group.traverse(object => {
      if (object.isMesh) object.material = Array.isArray(object.material)
        ? object.material.map(material => material.clone()) : object.material.clone();
    });
    scene.add(group);
    scene.add(new T.AmbientLight(new T.Color().setRGB(.43,.45,.44)));
    const key = new T.DirectionalLight('#fff1dc', .75);
    key.position.set(-3,5,4);
    scene.add(key);
    const fill = new T.DirectionalLight('#aed5d1', .26);
    fill.position.set(4,1,2);
    scene.add(fill);
    group.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(group);
    const center = bounds.getCenter(new T.Vector3());
    const camera = new T.OrthographicCamera(-1,1,1,-1,.01,30);
    camera.position.copy(center).add(new T.Vector3(2.7,1.8,5));
    camera.lookAt(center);
    camera.updateMatrixWorld(true);
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    const point = new T.Vector3();
    group.traverse(object => {
      if (!object.isMesh) return;
      const positions = object.geometry.getAttribute('position');
      for (let i=0; i<positions.count; i++) {
        point.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld);
        if (point.y < variant.framingFloorModelY * variant.scale[1]) continue;
        point.applyMatrix4(camera.matrixWorldInverse);
        minX=Math.min(minX,point.x); maxX=Math.max(maxX,point.x);
        minY=Math.min(minY,point.y); maxY=Math.max(maxY,point.y);
      }
    });
    const field = Math.max(maxX-minX,maxY-minY)*1.08;
    const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
    camera.left=cx-field/2; camera.right=cx+field/2;
    camera.top=cy+field/2; camera.bottom=cy-field/2;
    camera.updateProjectionMatrix();
    const renderer = new SVGRenderer();
    renderer.setSize(size,size);
    renderer.setPrecision(3);
    renderer.overdraw=.3;
    renderer.render(scene,camera);
    renderer.domElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
    const svg = renderer.domElement.serialize();
    const svgName = variant.key+'.svg';
    await writeFile(join(output,svgName),svg+'\n');
    const files=[{path:svgName,sha256:sha(svg+'\n'),bytes:Buffer.byteLength(svg+'\n')}];
    if (sharp) {
      const png = await sharp(Buffer.from(svg),{density:216}).resize(size,size,{kernel:'lanczos3'}).png().toBuffer();
      const pngName=variant.key+'.png';
      await writeFile(join(output,pngName),png);
      files.push({path:pngName,sha256:sha(png),bytes:png.length});
    }
    if (browser) {
      const page = await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
      await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
      const png = await page.screenshot({omitBackground:true});
      const pngName=variant.key+'.png';
      await writeFile(join(output,pngName),png);
      files.push({path:pngName,sha256:sha(png),bytes:png.length});
      await page.close();
    }
    manifest.entries.push({...variant,files,projectedGeometryBounds:{minX,maxX,minY,maxY},field,renderInfo:renderer.info.render});
    group.traverse(object => {
      if (!object.isMesh) return;
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
    });
  }
} finally {
  await browser?.close();
  if (priorDocument === undefined) delete globalThis.document;
  else globalThis.document = priorDocument;
}
await writeFile(join(output,'generation-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({output,variants:manifest.entries.map(v=>({key:v.key,files:v.files.map(f=>({path:f.path,bytes:f.bytes}))})),webgl:false},null,2));
