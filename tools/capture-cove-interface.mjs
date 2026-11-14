import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((value) => value.replace(/^--/, '').split('=')),
);
const base = args.base ?? 'http://127.0.0.1:5197';
const out = args.output ?? 'reviews/cove-interface/raw/initial';
const root = resolve(args.root ?? '.');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const filesIn = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(folder, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
const files = ['src', 'data']
  .flatMap((path) => filesIn(resolve(root, path)))
  .concat(
    ['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].map((path) =>
      resolve(root, path),
    ),
  )
  .sort();
const snapshot = () =>
  Object.fromEntries(
    files.map((path) => [relative(root, path).replaceAll('\\', '/'), hash(readFileSync(path))]),
  );
const source = snapshot();
mkdirSync(out, { recursive: true });
const report = {
  source: {
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    files: source,
    hash: hash(JSON.stringify(source)),
  },
  startedAt: new Date().toISOString(),
  base,
  captures: [],
  errors: [],
};
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
report.browser = browser.version();
try {
  for (const [width, height] of [
    [844, 390],
    [780, 320],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => report.errors.push(error.message));
    const capture = async (cove, state) => {
      const path = `${out}/${cove}-${width}x${height}-${state}.png`;
      const geometry = await page.evaluate(() => {
        const rect = (element) => {
          const r = element.getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
          };
        };
        return {
          frame: window.__LAST_FERRY__.getFrameStatus(),
          selection: window.__LAST_FERRY__.getSelectionStatus(),
          state: window.__LAST_FERRY__.getState(),
          controls: [
            ...document.querySelectorAll(
              '.map-hit, .map-name, #dock-actions button, .hud button, #status-toggle, #local-context, #local-context button, #dialog[open], #dialog[open] button',
            ),
          ]
            .filter((el) => el.getClientRects().length && !el.closest('[hidden]'))
            .map((el) => ({
              id: el.id || el.closest('button')?.id,
              class: el.className,
              text: el.textContent,
              ...rect(el),
              fontSize: getComputedStyle(el).fontSize,
            })),
        };
      });
      await page.screenshot({ path });
      report.captures.push({
        cove,
        width,
        height,
        state,
        path,
        hash: hash(readFileSync(path)),
        geometry,
      });
    };
    for (const cove of ['holding-pier', 'bellwater']) {
      await page.goto(`${base}/?cove=${cove}`);
      await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 5);
      await capture(cove, 'ordinary');
      if (cove === 'holding-pier') {
        await page.locator('#unload').tap();
        await page.locator('#dialog[open]').waitFor();
        await capture(cove, 'dock-preview');
        await page.locator('#cancel').tap();
        await page.locator('#map-harbor .map-hit').tap();
        await page.locator('#local-context:not([hidden])').waitFor();
        await capture(cove, 'safe-inspection');
      }
    }
    await context.close();
  }
} catch (error) {
  report.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  report.sourceStable = hash(JSON.stringify(snapshot())) === report.source.hash;
  writeFileSync(`${out}/geometry.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      source: report.source.hash,
      sourceStable: report.sourceStable,
      captures: report.captures.map(({ path }) => path),
      errors: report.errors,
      failure: report.failure,
    }),
  );
}
