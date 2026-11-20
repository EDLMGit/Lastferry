import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as Three from 'three';
import { animal } from '../src/scene/models.ts';
import { passengerScale } from '../src/scene/ferry-profile.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.env.PLAYWRIGHT_BROWSERS_PATH ??= join(root, '.cache/ms-playwright');
const { chromium } = await import('@playwright/test');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => readFile(join(root, file));
const git = (...args) => execFileSync('git', args, { cwd: root });
const directory = join(root, 'assets/portraits');
const review = join(root, 'reviews/animal-presentation/art');
const reviewed = 'a2740e61ec5a782f558ea6caad4181466d04e9f7';
const beforeSource = git('show', reviewed + ':src/scene/models.ts');
const beforeModule = stripTypeScriptTypes(beforeSource.toString()).replace("'./ferry-profile.ts'", JSON.stringify(pathToFileURL(join(root, 'src/scene/ferry-profile.ts')).href))
  .replace("'three'", JSON.stringify(import.meta.resolve('three'))).replace("'three/addons/geometries/RoundedBoxGeometry.js'", JSON.stringify(import.meta.resolve('three/addons/geometries/RoundedBoxGeometry.js')));
const { animal: before } = await import('data:text/javascript;base64,' + Buffer.from(beforeModule).toString('base64'));
const roster = [
  { key: 'rabbit-cream', species: 'rabbit', variant: 0, arrival: [0.50, 0.70, 1], choice: [0.20, 1.37, 1], stageHeight: 0.89, faceField: 0.69 },
  { key: 'rabbit-tan', species: 'rabbit', variant: 1, arrival: [-0.50, 0.70, 1], choice: [-0.20, 1.37, 1], stageHeight: 0.89, faceField: 0.69 },
  { key: 'sheep-wool', species: 'sheep', variant: 0, arrival: [0.77, 0.31, 1], choice: [0.18, 0.13, 1], stageHeight: 0.76, faceField: 0.69 },
  { key: 'beaver-brown', species: 'beaver', variant: 0, arrival: [1.29, 0.49, 1], choice: [0.29, 0.24, 1], stageHeight: 0.85, faceField: 0.55 },
  { key: 'deer-chestnut', species: 'deer', variant: 0, arrival: [-0.88, 0.41, 1], choice: [-0.32, 0.31, 1], stageHeight: 0.91, faceField: 0.76 },
];
const lighting = { hemisphere: ['#fff5e7', '#b8b2ae', 1.22], key: ['#ffecd2', 2.1, [-3, 5, 4]], fill: ['#c9e1e4', 0.75, [4, 1, 3]], rim: ['#fff0d7', 1.22, [2, 3, -4]] };
const dependencies = ['src/scene/models.ts', 'src/scene/animals.ts', 'src/scene/ferry-profile.ts', 'src/game/passenger-appearance.ts', 'tools/bake-animal-profiles.mjs', 'package-lock.json'];
const sources = Object.fromEntries(await Promise.all(dependencies.map(async name => [name, sha((await read(name)).toString().replaceAll('\r\n', '\n'))])));
const manifest = { sourceHashesLf: sources, renderer: 'Three.WebGLRenderer / MeshStandardMaterial, original production geometry, material and passengerScale; controlled portrait lighting, not gameplay screenshots', threeRevision: Three.REVISION, node: process.version, recipe: 'node tools/bake-animal-profiles.mjs', lighting, rendering: { encoding: 'sRGB', toneMapping: 'ACESFilmic', exposure: 1, renderPixels: 768, outputPixels: 256, downsample: 'Chromium Canvas2D high-quality, transparent RGBA', shadows: 'PCF 1024, separate from gameplay shadows' }, profiles: [] };
const choiceOmissions = ['sheep-shank', 'sheep-foot', 'beaver-flat-tail'];
manifest.choiceOmissions = { names: choiceOmissions, purpose: 'A bust omits low shanks and the beaver paddle that would peek into its lower edge; no geometry, pose, paint or scale changes.' };
const accounting = { baseline: reviewed, sourceHashesLf: sources, previousModelSourceSha256: sha(beforeSource), appearances: [] };
const fileList = [];
for (const folder of [join(directory, 'choice'), join(directory, 'arrival'), review]) await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
try {
  manifest.chromium = browser.version();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const modules = new Map(await Promise.all(['three.core.js', 'three.module.js'].map(async name => [name, await read('node_modules/three/build/' + name)])));
  await page.route('http://animal-bake.test/**', route => {
    const name = new URL(route.request().url()).pathname.slice(1);
    return route.fulfill(modules.has(name) ? { contentType: 'application/javascript', body: modules.get(name) } : { contentType: 'text/html', body: '<html><body></body></html>' });
  });
  await page.goto('http://animal-bake.test/');
  await page.evaluate(async lighting => {
    const T = await import('/three.module.js');
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(768, 768);
    renderer.setClearColor(0, 0);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(...lighting.hemisphere));
    for (const [id, [color, power, position]] of Object.entries(lighting).filter(([id]) => id !== 'hemisphere')) {
      const light = new T.DirectionalLight(color, power);
      light.position.set(...position);
      if (id === 'key') {
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        Object.assign(light.shadow.camera, { left: -1.7, right: 1.7, top: 1.7, bottom: -1.7, near: 0.1, far: 14 });
        light.shadow.camera.updateProjectionMatrix();
        light.shadow.bias = -0.0003;
        light.shadow.normalBias = 0.0025;
      }
      scene.add(light);
    }
    const output = document.createElement('canvas');
    output.width = output.height = 256;
    const ctx = output.getContext('2d', { willReadFrequently: true });
    window.bake = ({ json, profile, spec, fixedFrame, choiceOmissions }) => {
      const figure = new T.ObjectLoader().parse(json);
      if (profile === 'choice') figure.traverse(part => {
        if (choiceOmissions.includes(part.name)) part.visible = false;
      });
      scene.add(figure);
      scene.updateMatrixWorld(true);
      const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
      const direction = profile === 'study' ? [0.77, 0.39, 1] : spec[profile];
      camera.position.set(...direction).normalize().multiplyScalar(5);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      const projected = new T.Box3();
      figure.traverse(part => {
        if (!part.isMesh) return;
        const attr = part.geometry.getAttribute('position');
        for (let index = 0; index < attr.count; index++) {
          projected.expandByPoint(new T.Vector3().fromBufferAttribute(attr, index).applyMatrix4(part.matrixWorld).applyMatrix4(camera.matrixWorldInverse));
        }
      });
      const height = projected.max.y - projected.min.y, width = projected.max.x - projected.min.x;
      const cx = (projected.max.x + projected.min.x) / 2;
      const field = profile === 'choice' ? spec.faceField : Math.max(height / (profile === 'study' ? 0.88 : spec.stageHeight), width / 0.94);
      const bottom = profile === 'choice' ? projected.max.y - field * 0.96 : projected.min.y - field * 0.055;
      const frame = fixedFrame ?? { left: cx - field / 2, right: cx + field / 2, top: bottom + field, bottom };
      Object.assign(camera, frame);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      ctx.clearRect(0, 0, 256, 256);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(renderer.domElement, 0, 0, 256, 256);
      const pixels = ctx.getImageData(0, 0, 256, 256).data;
      let x0 = 256, x1 = -1, y0 = 256, y1 = -1;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) if (pixels[(y * 256 + x) * 4 + 3] > 15) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      const data = output.toDataURL('image/png');
      const gl = renderer.getContext(), debug = gl.getExtension('WEBGL_debug_renderer_info');
      const device = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null;
      scene.remove(figure);
      figure.traverse(part => {
        if (part.isMesh) { part.geometry.dispose(); part.material.dispose(); }
      });
      return { frame, direction, data, pixelBounds: [x0, y0, x1, y1], device };
    };
  }, lighting);
  const stats = model => {
    let meshes = 0, triangles = 0;
    const materials = new Set();
    model.traverse(part => {
      if (!part.isMesh) return;
      meshes++;
      triangles += (part.geometry.index?.count ?? part.geometry.attributes.position.count) / 3;
      materials.add(part.material.uuid);
    });
    const bounds = new Three.Box3().setFromObject(model, true);
    return { meshes, triangles, materials: materials.size, singlePassDrawCalls: meshes, localVertexMin: bounds.min.toArray(), localVertexMax: bounds.max.toArray() };
  };
  for (const spec of roster) {
    const now = animal(spec.species, spec.variant), old = before(spec.species, spec.variant);
    accounting.appearances.push({ key: spec.key, before: stats(old), after: stats(now) });
    const scale = passengerScale(spec.species);
    for (const group of [old, now]) {
      group.scale.set(...scale);
      group.updateMatrixWorld(true);
      group.traverse(part => {
        if (part.isMesh) part.geometry = new Three.BufferGeometry().copy(part.geometry);
      });
    }
    const run = async (model, profile, fixedFrame) => page.evaluate(args => window.bake(args), { json: model.toJSON(), spec, profile, fixedFrame, choiceOmissions });
    for (const profile of ['choice', 'arrival']) {
      const result = await run(now, profile);
      const file = profile + '/' + spec.key + '.png';
      const bytes = Buffer.from(result.data.split(',')[1], 'base64');
      await writeFile(join(directory, file), bytes);
      fileList.push({ profile, key: spec.key, data: result.data });
      manifest.webgl = result.device;
      manifest.profiles.push({ profile, key: spec.key, species: spec.species, variant: spec.variant, scale, file, width: 256, height: 256, sha256: sha(bytes), bytes: bytes.length, pixelBounds: result.pixelBounds, cameraDirection: result.direction, ortho: result.frame });
    }
    const study = await run(now, 'study');
    const baseline = await run(old, 'study', study.frame);
    fileList.push({ profile: 'before', key: spec.key, data: baseline.data }, { profile: 'after', key: spec.key, data: study.data });
    accounting.appearances.at(-1).matchedCamera = { direction: study.direction, ortho: study.frame };
  }
  for (const rows of [['before', 'after'], ['choice', 'arrival']]) {
    const isModel = rows[0] === 'before';
    await page.setViewportSize({ width: isModel ? 840 : 630, height: isModel ? 412 : 302 });
    const names = ['Cream rabbit', 'Tan rabbit', 'Sheep', 'Beaver', 'Deer'];
    const cells = row => roster.map((spec, index) => {
      const size = isModel ? 142 : row === 'choice' ? 58 : 100;
      return '<div class="tile"><img width="' + size + '" height="' + size + '" src="' + fileList.find(file => file.profile === row && file.key === spec.key).data + '"><span>' + names[index] + '</span></div>';
    }).join('');
    await page.setContent('<style>*{box-sizing:border-box}body{margin:0;background:#153e42;color:#f7ebcf;font:14px system-ui;padding:10px}h3{font-size:14px;font-weight:600;margin:0 0 4px;color:#edc884}section{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-bottom:9px}.tile{display:grid;justify-items:center;align-items:end;gap:2px;background:#244a4f;border-radius:9px;padding:2px 0 4px}.tile:nth-child(2n){background:#365c58}span{line-height:19px}</style>' + rows.map(row => '<h3>' + ({ before:'Reviewed factory · same camera and light', after:'Revised factory · same camera and light', choice:'Choice · 58px · original and selected teal', arrival:'Arrival · 100px · shared foot line' })[row] + '</h3><section>' + cells(row) + '</section>').join(''));
    await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
    await page.screenshot({ path: join(review, isModel ? 'matched-models.png' : 'native-profiles.png') });
  }
} finally {
  await browser.close();
}
await writeFile(join(directory, 'animal-profiles.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(join(review, 'model-costs-and-cameras.json'), JSON.stringify(accounting, null, 2) + '\n');
console.log('Baked ten transparent model profiles and two labeled study sheets.');
