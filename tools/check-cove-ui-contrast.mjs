import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const options = Object.fromEntries(process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')));
const base = options.base ?? 'http://127.0.0.1:5230';
const output = options.output ?? 'reviews/cove-ui-assets/contrast.json';
const hash = (value) => createHash('sha256').update(value).digest('hex');
const walk = (path) => readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(resolve(path, entry.name)) : [resolve(path, entry.name)]);
const paths = [...walk('src'), ...walk('data'), ...walk('cove-ui-package/ui/icons'), resolve('package-lock.json')].sort();
const snapshot = () => Object.fromEntries(paths.map((path) => [relative('.', path).replaceAll('\\', '/'), hash(readFileSync(path))]));
const files = snapshot();
const report = {
  at: new Date().toISOString(),
  source: { head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), hash: hash(JSON.stringify(files)), files },
  environment: { node: process.version, viewport: { width: 844, height: 390 }, dpr: 1, touch: 'Chromium emulation', renderer: 'SwiftShader', browser: '' },
  method: 'Computed actual UI foreground and background colors, source-over compositing through the ancestor surfaces against local and darkest/brightest current opaque WebGL samples. Linear-gradient endpoint alternatives bound the supplied monotone two-color faces. Evaluates text, icon, selected-check, map-state and focus-keyline contrast, not decorative panel borders or antialiased glyph fringes. Actual native screenshots remain necessary; this is not complete accessibility certification.',
  references: ['https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html', 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html'],
  stages: [], errors: [],
};
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
report.environment.browser = browser.version();
const context = await browser.newContext({ viewport: report.environment.viewport, deviceScaleFactor: 1, hasTouch: true });
const page = await context.newPage();
page.on('pageerror', (error) => report.errors.push(error.message));
const collect = async (label) => {
 const stage = await page.evaluate(async (label) => {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const canvas = document.querySelector('#world canvas');
  const copy = document.createElement('canvas');
  copy.width = canvas.width; copy.height = canvas.height;
  const painter = copy.getContext('2d', { willReadFrequently: true });
  painter.drawImage(canvas, 0, 0);
  const pixels = painter.getImageData(0, 0, copy.width, copy.height).data;
  const bounds = canvas.getBoundingClientRect();
  const parse = (css) => { const v = css.match(/[\d.]+/g)?.map(Number) ?? []; return [...v.slice(0, 3), v[3] ?? 1]; };
  const over = (fg, bg) => fg.slice(0, 3).map((v, i) => fg[3] * v + (1 - fg[3]) * bg[i]);
  const luminance = (c) => c.slice(0, 3).map((v) => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const ratio = (a, b) => { const l = [luminance(a), luminance(b)].sort((a, b) => b - a); return (l[0] + .05) / (l[1] + .05); };
  const sample = (x, y) => { const px = Math.max(0, Math.min(copy.width - 1, Math.round((x - bounds.left) * copy.width / bounds.width))), py = Math.max(0, Math.min(copy.height - 1, Math.round((y - bounds.top) * copy.height / bounds.height))); return [...pixels.slice((py * copy.width + px) * 4, (py * copy.width + px) * 4 + 4)]; };
  const samples = [];
  for (let y = 2; y < copy.height; y += 8) for (let x = 2; x < copy.width; x += 8) { const i = (y * copy.width + x) * 4; if (pixels[i + 3] === 255) samples.push([...pixels.slice(i, i + 4)]); }
  if (!samples.length) throw Error('No opaque WebGL pixels available');
  samples.sort((a, b) => luminance(a) - luminance(b));
  const scene = { darkest: samples[0], brightest: samples.at(-1), count: samples.length };
  const modal = document.querySelector('dialog[open]');
  const selectors = ['h1', '#objective', '#boat-summary', '#readout > span', '#status-headline', '#status-detail', '.map-name b', '.map-home', '.map-symbol', '.cove-label', '.cove-glyph', '.cove-choice-copy', '.cove-choice-check', '#local-heading', '.location-role', '#location-facts p', '#selection-hint', '#dialog-title', '.eyebrow', '#preview .requirement', '#preview .consequence', '.preview-result', '.cove-picker', '.cove-picker select', '.settings-row', '.settings-row select', '#audio-status', '#motion-status', '.forecast-detail p', '#help-details summary', '.ending p', 'button:focus-visible', '.map-target:focus-visible .map-hit'];
  const elements = [...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))].filter((e) => e.getClientRects().length && !e.closest('[hidden], dialog:not([open]), .offscreen, .sr-only') && getComputedStyle(e).visibility === 'visible' && (!modal || modal.contains(e)));
  const checks = [];
  for (const element of elements) {
   const style = getComputedStyle(element), r = element.getBoundingClientRect();
   const layers = [];
   for (let e = element; e && e !== document.documentElement; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (Number(s.opacity) !== 1) throw Error(`Unhandled opacity: ${e.id || e.className}`);
    const color = parse(s.backgroundColor), gradient = s.backgroundImage.match(/rgba?\([^)]+\)/g);
    if (s.backgroundImage !== 'none' && (!s.backgroundImage.startsWith('linear-gradient(') || gradient?.length !== 2)) throw Error(`Unhandled surface: ${s.backgroundImage}`);
    if (gradient) layers.unshift({ source: e.id || e.className, colors: gradient.map(parse), css: s.backgroundImage });
    else if (color[3] && e.tagName !== 'BODY') layers.unshift({ source: e.id || e.className, colors: [color], css: s.backgroundColor });
   }
   if (modal) layers.unshift({ source: 'dialog::backdrop', colors: [parse(getComputedStyle(modal, '::backdrop').backgroundColor)], css: getComputedStyle(modal, '::backdrop').backgroundColor });
   let backgrounds = [sample(r.x + r.width / 2, r.y + r.height / 2), scene.darkest, scene.brightest].map((c) => c.slice(0, 3));
   for (const layer of layers) backgrounds = backgrounds.flatMap((bg) => layer.colors.map((fg) => over(fg, bg)));
   const icon = element.matches('.cove-glyph, .map-symbol');
   const text = !element.matches('.cove-choice-check, .map-hit, button:focus-visible') && !!element.textContent.trim();
   const add = (kind, threshold, foreground, targets) => {
    const minimum = Math.min(...targets.map((bg) => ratio(over(parse(foreground), bg), bg)));
    checks.push({ selector: element.id || element.getAttribute('class'), text: element.textContent.trim().slice(0, 55), kind, threshold, foreground, minimum, pass: minimum >= threshold, layers });
   };
   if (icon || text) add(icon ? 'icon' : 'text', icon ? 3 : 4.5, style.color, backgrounds);
   if (element.matches('.map-symbol') || (element.matches('.cove-choice-check') && element.closest('[aria-pressed="false"]'))) add('state-border', 3, style.borderTopColor, backgrounds);
   if (element.matches('.cove-choice-check') && element.closest('[aria-pressed="true"]')) add('selected-fill-to-choice', 3, style.backgroundColor, [parse(getComputedStyle(element.parentElement).backgroundColor).slice(0, 3)]);
   if (Number.parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== 'none') {
    const colors = style.boxShadow.match(/rgba?\([^)]+\)/g) ?? [];
    const keyline = colors.map(parse).findLast((c) => c[3] === 1);
    add('focus-keyline', 3, style.outlineColor, keyline ? [keyline.slice(0, 3)] : backgrounds);
   }
  }
  return { label, state: window.__LAST_FERRY__.getState(), scene, checks };
 }, label);
 report.stages.push(stage);
};
const idle = () => page.waitForFunction(() => document.querySelector('#seascape').getAttribute('aria-busy') === 'false');
const tap = async (id) => { await page.locator(`#${id}`).tap(); };
const select = async (id) => {
 const isVisible = await page.locator(`#map-${id}`).evaluate((e) => { const r = e.getBoundingClientRect(); return !e.closest('.offscreen') && r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
 if (!isVisible && (await page.locator('#view-toggle').textContent()).includes('Whole cove')) await tap('view-toggle');
 await tap(`map-${id}`);
};
const transfer = async (id) => { await tap(id); await tap('commit'); await idle(); };
const sail = async (id) => { await select(id); await tap('sail'); await idle(); };
const tabTo = async (id) => { for (let i = 0; i < 50; i++) { if (await page.locator(`#${id}`).evaluate((e) => e === document.activeElement)) return; await page.keyboard.press('Tab'); } throw Error(`Cannot Tab to ${id}`); };
try {
 await page.goto(`${base}/?cove=holding-pier`);
 await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
 await collect('ordinary');
 await select('stone'); await collect('current-location'); await page.keyboard.press('Escape');
 await tap('menu'); await collect('menu'); await tap('settings'); await collect('settings');
 await page.locator('#motion-preference').selectOption('reduced');
 report.reducedMotion = await page.evaluate(() => ({ mode: document.documentElement.dataset.motion, buttonTransitions: [...document.querySelectorAll('.cove-button')].map((e) => getComputedStyle(e).transitionDuration) }));
 await page.locator('#motion-preference').selectOption('device'); await tap('settings-back'); await page.keyboard.press('Escape');
 await tap('unload'); await tabTo('commit'); await collect('unloading-focus'); await tap('commit'); await idle();
 await sail('shallows'); await sail('rabbit-pier'); await tap('board'); await collect('safe-boarding'); await tap('passenger-rabbit-2'); await collect('subset-warning'); await tap('passenger-rabbit-2'); await tap('commit'); await idle();
 await sail('shallows'); await sail('stone'); await transfer('board'); await sail('harbor'); await collect('harbor-loaded'); await transfer('unload'); await collect('arrival');
} catch (error) { report.errors.push(error.stack ?? String(error)); }
finally {
 report.sourceStable = JSON.stringify(snapshot()) === JSON.stringify(files);
 const checks = report.stages.flatMap((s) => s.checks.map((c) => ({ stage: s.label, ...c })));
 report.summary = { stages: report.stages.length, checks: checks.length, minimumText: Math.min(...checks.filter((c) => c.kind === 'text').map((c) => c.minimum)), minimumIcon: Math.min(...checks.filter((c) => c.kind === 'icon').map((c) => c.minimum)), failed: checks.filter((c) => !c.pass) };
 mkdirSync(dirname(output), { recursive:true }); writeFileSync(output, JSON.stringify(report,null,2)); await browser.close();
}
console.log(JSON.stringify({output, summary:report.summary, errors:report.errors, sourceStable:report.sourceStable}));
if (report.errors.length || report.summary.failed.length || !report.sourceStable) process.exitCode = 1;
