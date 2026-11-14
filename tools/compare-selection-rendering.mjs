import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const option = (name, fallback) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const baseURL = option('base', 'http://127.0.0.1:5191');
const output = option('output', 'reviews/selection/matched-canvas');
const finalManifest = JSON.parse(readFileSync('reviews/selection/after-performance/source-manifest.json', 'utf8'));
const sourceRoot = resolve(finalManifest.root);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sourceUnchanged = () => Object.entries(finalManifest.runtimeHashes).every(([path, expected]) => hash(readFileSync(resolve(sourceRoot, path))) === expected);
if (!sourceUnchanged()) throw Error('Frozen final source differs from measured manifest');
mkdirSync(output, { recursive: true });
const report = { sourceManifest: '../after-performance/source-manifest.json', runtimeHash: finalManifest.runtimeHash,
  toolHash: hash(readFileSync(new URL(import.meta.url))), baseURL, startedAt: new Date().toISOString(),
  method: 'Diagnostic CSS intervention, not final appearance or isolated causal proof. Same121 requestAnimationFrame timestamps/exactly120 intervals as before/after no-video samples; no per-frame diagnostics.',
  intervention: '#world { top:92px !important; bottom:78px !important; }', measurements: [], errors: [] };
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const geometry = (page) => page.evaluate(() => {
  const canvas = document.querySelector('#world canvas'), rect = canvas.getBoundingClientRect(), api = window.__LAST_FERRY__;
  return { canvas: { x: rect.x, y: rect.y, cssWidth: rect.width, cssHeight: rect.height, bufferWidth: canvas.width, bufferHeight: canvas.height, renderedPixels: canvas.width * canvas.height },
    viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, metrics: api.getMetrics(), state: api.getState(), audio: api.getAudioStatus() };
});
try {
  for (const cove of ['holding-pier', 'bellwater']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', (error) => report.errors.push(error.message));
    await page.goto(`${baseURL}/?cove=${cove}`);
    await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 8);
    await page.addStyleTag({ content: report.intervention });
    await page.waitForFunction(() => {
      const c = document.querySelector('#world canvas'), r = c.getBoundingClientRect();
      return r.x === 0 && r.y === 92 && r.width === 1440 && r.height === 730 && c.width === 1440 && c.height === 730;
    });
    const before = await geometry(page);
    if (before.audio.contextState !== 'not-created') throw Error('Diagnostic requires uncreated audio');
    const timestamps = await page.evaluate(() => new Promise((done) => {
      const timestamps = [];
      const sample = (time) => { timestamps.push(time); if (timestamps.length === 121) done(timestamps); else requestAnimationFrame(sample); };
      requestAnimationFrame(sample);
    }));
    const intervals = timestamps.slice(1).map((time, i) => time - timestamps[i]), sorted = [...intervals].sort((a, b) => a - b);
    const after = await geometry(page);
    if (JSON.stringify(before.state) !== JSON.stringify(after.state)) throw Error('Diagnostic changed the puzzle');
    report.measurements.push({ cove, count: intervals.length, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1], timestamps, intervals, before, after });
    await context.close();
  }
  if (!sourceUnchanged()) throw Error('Source changed during diagnostic');
  report.sourceUnchangedAcrossExecution = true;
  report.environment = { browser: browser.version(), node: process.version, os: 'Windows 11 Pro', renderer: 'Headless Chromium SwiftShader; no video; DPR1; audio uncreated' };
} catch (error) { report.errors.push(error.stack); process.exitCode = 1; }
finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync(`${output}/diagnostic.json`, JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify({ runtimeHash: report.runtimeHash, measurements: report.measurements.map(({ cove, medianMs, p95Ms, before }) => ({ cove, medianMs, p95Ms, canvas: before.canvas })), errors: report.errors }));
}
