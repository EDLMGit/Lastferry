import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((value) => value.replace(/^--/, '').split('=')),
);
const base = args.base ?? 'http://127.0.0.1:5195';
const output = args.output ?? 'reviews/cove-interface/contrast.json';
const width = Number(args.width ?? 844),
  height = Number(args.height ?? 390);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)],
  );
const sourceFiles = [...walk('src'), ...walk('data'), resolve('package-lock.json')].sort();
const snapshot = () =>
  Object.fromEntries(
    sourceFiles.map((path) => [
      relative('.', path).replaceAll('\\', '/'),
      hash(readFileSync(path)),
    ]),
  );
const files = snapshot();
const report = {
  startedAt: new Date().toISOString(),
  source: {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    status: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
    files,
    hash: hash(JSON.stringify(files)),
  },
  environment: {
    node: process.version,
    browser: '',
    viewport: { width, height },
    deviceScaleFactor: 1,
    renderer: 'SwiftShader',
    hasTouch: true,
    physicalDevice: false,
  },
  method:
    'Actual WebGL canvas copied during requestAnimationFrame. Foreground and layered background colors come from computed browser styles; source-over composition is evaluated against local canvas samples and the brightest/darkest opaque canvas samples. Ratios use sRGB relative luminance without rounding before comparison. Glyph antialiasing is not treated as the foreground color. Focus checks use the rendered solid keyline color when present. This focused audit is not blanket WCAG certification.',
  references: [
    'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
    'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html',
  ],
  stages: [],
  errors: [],
};
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
report.environment.browser = browser.version();
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
});
const page = await context.newPage();
page.on('pageerror', (error) => report.errors.push(error.message));
const selectors = [
  'h1',
  '#objective',
  '#boat-summary',
  '#readout > span',
  '.tools button:not(:disabled)',
  '#status-toggle',
  '#status-detail',
  '#status-headline',
  '.map-name b',
  '.map-home',
  '.map-symbol',
  '#dock-actions button',
  '.dock-arrow',
  '.dock-home',
  '#local-heading',
  '.location-role',
  '#location-facts p',
  '#close-location',
  '#sail:not(:disabled)',
  '#selection-hint',
  '#dialog[open] #dialog-title',
  '#dialog[open] .eyebrow',
  '#dialog[open] #cancel',
  '#dialog[open] #preview .requirement',
  '#dialog[open] #preview .consequence',
  '#dialog[open] .preview-result',
  '#dialog[open] .passenger-options button',
  '#dialog[open] #commit:not(:disabled)',
  '#dialog[open] .menu-actions button',
  '#dialog[open] .cove-picker',
  '#dialog[open] .cove-picker select',
  '#dialog[open] .forecast-detail p',
  '#dialog[open] .dialog-body details summary',
  '#dialog[open] .ending p',
  '#dialog[open] .terminal-actions button',
  '.map-target:focus-visible .map-hit',
  '.map-target:focus-visible .map-name',
];
const collect = async (label) => {
  const stage = await page.evaluate(
    async ({ label, selectors }) => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const canvas = document.querySelector('#world canvas');
      const copy = document.createElement('canvas');
      copy.width = canvas.width;
      copy.height = canvas.height;
      const painter = copy.getContext('2d', { willReadFrequently: true });
      painter.drawImage(canvas, 0, 0);
      const pixels = painter.getImageData(0, 0, copy.width, copy.height).data;
      const box = canvas.getBoundingClientRect();
      const parse = (value) => {
        const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
        return numbers.length >= 3 ? [...numbers.slice(0, 3), numbers[3] ?? 1] : [0, 0, 0, 0];
      };
      const composite = (foreground, background) =>
        foreground
          .slice(0, 3)
          .map((value, index) => foreground[3] * value + (1 - foreground[3]) * background[index]);
      const luminance = (color) =>
        color
          .map((value) => {
            const linear = value / 255;
            return linear <= 0.04045 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4;
          })
          .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
      const contrast = (first, second) => {
        const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
        return (values[0] + 0.05) / (values[1] + 0.05);
      };
      const pixel = (x, y) => {
        const px = Math.max(
          0,
          Math.min(copy.width - 1, Math.round(((x - box.left) * copy.width) / box.width)),
        );
        const py = Math.max(
          0,
          Math.min(copy.height - 1, Math.round(((y - box.top) * copy.height) / box.height)),
        );
        const index = (py * copy.width + px) * 4;
        return {
          x: Number(x.toFixed(1)),
          y: Number(y.toFixed(1)),
          rgba: [...pixels.slice(index, index + 4)],
        };
      };
      const samples = [];
      for (let y = 2; y < copy.height; y += 8)
        for (let x = 2; x < copy.width; x += 8) {
          const sample = pixel(
            box.left + (x / copy.width) * box.width,
            box.top + (y / copy.height) * box.height,
          );
          if (sample.rgba[3] > 250) samples.push(sample);
        }
      if (!samples.length) throw Error('Canvas readback contains no opaque rendered pixels');
      samples.sort((a, b) => luminance(a.rgba.slice(0, 3)) - luminance(b.rgba.slice(0, 3)));
      const dark = samples[0],
        bright = samples.at(-1);
      const openDialog = document.querySelector('dialog[open]');
      const visible = (element) =>
        !!element.getClientRects().length &&
        !element.closest('[hidden]') &&
        !element.closest('dialog:not([open])') &&
        getComputedStyle(element).visibility === 'visible' &&
        (!openDialog || openDialog.contains(element));
      const elements = [
        ...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)])),
      ].filter(visible);
      const checks = elements.map((element) => {
        const style = getComputedStyle(element),
          bounds = element.getBoundingClientRect();
        const local = pixel(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
        const ancestors = [];
        for (
          let current = element;
          current && current !== document.documentElement;
          current = current.parentElement
        ) {
          const currentStyle = getComputedStyle(current);
          if (currentStyle.backgroundImage !== 'none')
            throw Error(`Unsupported background image on ${current.id || current.className}`);
          if (Number(currentStyle.opacity) !== 1)
            throw Error(`Unsupported element opacity on ${current.id || current.className}`);
          const color = parse(currentStyle.backgroundColor);
          if (color[3] && current.tagName !== 'BODY')
            ancestors.unshift({
              selector: current.id ? `#${current.id}` : current.className || current.tagName,
              css: currentStyle.backgroundColor,
              color,
            });
        }
        if (element.closest('dialog[open]')) {
          const backdrop = getComputedStyle(
            document.querySelector('dialog'),
            '::backdrop',
          ).backgroundColor;
          ancestors.unshift({
            selector: 'dialog::backdrop',
            css: backdrop,
            color: parse(backdrop),
          });
        }
        const backgrounds = [local, bright, dark].map((sample, index) => ({
          region: ['local', 'bright-scene', 'dark-scene'][index],
          sample,
          rgb: ancestors.reduce(
            (current, layer) => composite(layer.color, current),
            sample.rgba.slice(0, 3),
          ),
        }));
        const color = parse(style.color);
        const cue = element.matches('.map-symbol, .dock-arrow, .dock-home');
        const hasText =
          !element.matches('.map-hit, .map-name') &&
          (!!element.textContent.trim() || element.matches('select'));
        const ratios = [];
        if (hasText || cue)
          ratios.push({
            kind: cue ? 'icon' : 'text',
            threshold: cue ? 3 : 4.5,
            foreground: style.color,
            ratios: backgrounds.map((background) => ({
              region: background.region,
              ratio: contrast(composite(color, background.rgb), background.rgb),
            })),
          });
        if (Number.parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== 'none') {
          const border = parse(style.borderTopColor);
          ratios.push({
            kind: 'border-to-inner-surface',
            threshold: 3,
            foreground: style.borderTopColor,
            ratios: backgrounds.map((background) => ({
              region: background.region,
              ratio: contrast(composite(border, background.rgb), background.rgb),
            })),
          });
        }
        if (Number.parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== 'none') {
          const shadow = style.boxShadow.match(/rgba?\([^)]+\)/)?.[0];
          const keyline = shadow && parse(shadow)[3] === 1 ? parse(shadow).slice(0, 3) : null;
          const outline = parse(style.outlineColor);
          ratios.push({
            kind: keyline ? 'focus-to-keyline' : 'focus-to-inner-surface',
            threshold: 3,
            foreground: style.outlineColor,
            keyline: shadow ?? null,
            ratios: backgrounds.map((background) => ({
              region: background.region,
              ratio: contrast(
                composite(outline, keyline ?? background.rgb),
                keyline ?? background.rgb,
              ),
            })),
          });
        }
        return {
          selector: element.id ? `#${element.id}` : element.className || element.tagName,
          text: element.textContent.trim().slice(0, 90),
          bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
          layers: ancestors.map(({ selector, css }) => ({ selector, css })),
          backgrounds,
          checks: ratios.map((check) => ({
            ...check,
            minimum: Math.min(...check.ratios.map((value) => value.ratio)),
            pass: check.ratios.every((value) => value.ratio >= check.threshold),
          })),
        };
      });
      return {
        label,
        at: new Date().toISOString(),
        state: window.__LAST_FERRY__.getState(),
        sceneSamples: { opaqueGridSamples: samples.length, bright, dark },
        checks,
      };
    },
    { label, selectors },
  );
  report.stages.push(stage);
};
const idle = () =>
  page.waitForFunction(
    () => document.querySelector('#seascape').getAttribute('aria-busy') === 'false',
  );
const tap = (id) => page.locator(`#${id}`).tap();
const select = async (id) => {
  await page.locator(`#map-${id} .map-name`).tap();
  await page.locator('#local-context').waitFor({ state: 'visible' });
};
const transfer = async (id) => {
  await tap(id);
  await tap('commit');
  await idle();
};
const sail = async (id) => {
  await select(id);
  await tap('sail');
  await idle();
};
const tabTo = async (id) => {
  for (let count = 0; count < 50; count++) {
    if ((await page.evaluate(() => document.activeElement?.id)) === id) return;
    await page.keyboard.press('Tab');
  }
  throw Error(`Natural keyboard navigation did not reach ${id}`);
};
try {
  for (const cove of ['holding-pier', 'bellwater']) {
    await page.goto(`${base}/?cove=${cove}`);
    await page.waitForFunction(() => (window.__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
    await idle();
    await collect(`${cove}-ordinary`);
  }
  await page.goto(`${base}/?cove=holding-pier`);
  await page.waitForFunction(() => (window.__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
  await tabTo('map-stone');
  await collect('current-marker-keyboard-focus');
  await select('shallows');
  await collect('shallow-inspection');
  await select('harbor');
  await tabTo('sail');
  await collect('safe-sail-keyboard-focus');
  await page.keyboard.press('Escape');
  await tap('menu');
  await collect('menu');
  await page.keyboard.press('Escape');
  await tap('unload');
  await tabTo('commit');
  await collect('temporary-unload-preview');
  await tap('commit');
  await idle();
  await sail('shallows');
  await sail('rabbit-pier');
  await tap('board');
  await collect('critical-boarding-safe');
  await page.locator('#dialog[open] .passenger-options button').last().tap();
  await collect('critical-boarding-subset-warning');
  await page.keyboard.press('Escape');
  await tap('status-toggle');
  await collect('forecast');
  await page.keyboard.press('Escape');
  await transfer('board');
  await sail('shallows');
  await sail('stone');
  await transfer('board');
  await sail('harbor');
  await transfer('unload');
  await collect('success');
} catch (error) {
  report.errors.push(error.stack ?? String(error));
} finally {
  report.finishedAt = new Date().toISOString();
  report.sourceStable = JSON.stringify(snapshot()) === JSON.stringify(files);
  const checks = report.stages.flatMap((stage) =>
    stage.checks.flatMap((element) =>
      element.checks.map((check) => ({ stage: stage.label, selector: element.selector, ...check })),
    ),
  );
  report.summary = {
    stages: report.stages.length,
    checks: checks.length,
    failed: checks.filter((check) => !check.pass),
    minimumText: Math.min(
      ...checks.filter((check) => check.kind === 'text').map((check) => check.minimum),
    ),
    minimumCue: Math.min(
      ...checks.filter((check) => check.kind !== 'text').map((check) => check.minimum),
    ),
  };
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2));
  await browser.close();
}
if (report.errors.length || report.summary.failed.length || !report.sourceStable)
  process.exitCode = 1;
console.log(
  JSON.stringify({
    output,
    summary: report.summary,
    errors: report.errors,
    sourceStable: report.sourceStable,
  }),
);
