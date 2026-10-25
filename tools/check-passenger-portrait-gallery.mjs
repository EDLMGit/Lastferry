import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const base = process.env.PORTRAIT_GALLERY_URL ?? 'http://127.0.0.1:5250';
const output = 'reviews/passenger-portraits/gallery';
mkdirSync(output, { recursive: true });
const digest = (value) => createHash('sha256').update(value).digest('hex');
const paths = ['asset-gallery.html', 'src/dev/asset-gallery.ts', 'src/dev/asset-gallery.css', 'src/ui/cove-ui.ts', 'src/ui/cove-ui.css', 'assets/catalog.json', 'src/game/passenger-appearance.ts', ...['rabbit-cream', 'rabbit-tan', 'sheep-wool'].map((key) => `cove-portrait-package/portraits/${key}.png`)];
const snapshot = () => Object.fromEntries(paths.map((path) => [path, digest(readFileSync(path))]));
const files = snapshot();
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1440, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${base}/asset-gallery.html`);
    await page.locator('#gallery-failed-portrait .cove-portrait-image[data-portrait-state="failed"]').waitFor({ state: 'attached' });
    await page.waitForFunction(() => [...document.querySelectorAll('.cove-portrait-image')].every((image) => image.closest('#gallery-failed-portrait') || image.dataset.portraitState === 'loaded'));
    await page.evaluate(() => document.fonts.ready);
    const measurements = await page.evaluate(() => {
      const rect = (box) => ({ left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height });
      const inside = (box, bounds, tolerance = .75) => box.left >= bounds.left - tolerance && box.right <= bounds.right + tolerance && box.top >= bounds.top - tolerance && box.bottom <= bounds.bottom + tolerance;
      const specimens = [...document.querySelectorAll('.panel-specimen')].map((panel) => {
        const dimensions = [...panel.querySelectorAll('.passenger-options, .cove-choice, .cove-choice-copy, .cove-choice-name, .cove-choice-capacity')].map((element) => ({ selector: element.className, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, fits: element.scrollWidth <= element.clientWidth + 1 }));
        const choices = [...panel.querySelectorAll('.cove-choice')].map((button) => {
          const box = button.getBoundingClientRect(), style = getComputedStyle(button);
          const bounds = { left: box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), right: box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight), top: box.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop), bottom: box.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom) };
          const lines = [...button.querySelectorAll('.cove-choice-name, .cove-choice-capacity')].flatMap((label) => {
            const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT), entries = [];
            while (walker.nextNode()) {
              if (!walker.currentNode.textContent.trim()) continue;
              const range = document.createRange(); range.selectNodeContents(walker.currentNode);
              entries.push(...[...range.getClientRects()].map((line) => ({ text: walker.currentNode.textContent, bounds: rect(line), fits: inside(line, bounds) })));
            }
            return entries;
          });
          const slot = button.querySelector('.cove-choice-portrait'), slotBox = slot.getBoundingClientRect();
          const image = slot.querySelector('img'), failed = !!button.closest('#gallery-failed-portrait');
          const portrait = { key: slot.dataset.appearance, bounds: rect(slotBox), fits: inside(slotBox, bounds) && Math.abs(slotBox.width - 44) < .1 && Math.abs(slotBox.height - 44) < .1, state: image?.dataset.portraitState ?? 'unavailable', sourceWidth: image?.naturalWidth ?? null, sourceHeight: image?.naturalHeight ?? null, opacity: image ? getComputedStyle(image).opacity : null, noninteractive: !image || image.alt === '' && !image.draggable && getComputedStyle(image).pointerEvents === 'none', decoded: !image || failed ? !image || image.dataset.portraitState === 'failed' && image.naturalWidth === 0 && getComputedStyle(image).opacity === '0' : image.dataset.portraitState === 'loaded' && image.naturalWidth === 256 && image.naturalHeight === 256 && getComputedStyle(image).opacity === '1' };
          return { text: button.textContent, selected: button.getAttribute('aria-pressed'), bounds: rect(box), fontSize: style.fontSize, lines, portrait, fits: lines.every((line) => line.fits) && box.height >= 48 && portrait.fits && portrait.noninteractive && portrait.decoded };
        });
        return { id: panel.id, dimensions, choices };
      });
      return { documentWidth: document.documentElement.scrollWidth, canvasCount: document.querySelectorAll('canvas').length, specimens };
    });
    for (const id of ['gallery-three-passengers', 'gallery-narrow-passengers', 'gallery-text-stress', 'gallery-bellwater-portraits', 'gallery-failed-portrait'])
      await page.locator(`#${id}`).screenshot({ path: `${output}/${width}-${id}.png` });
    const pass = errors.length === 0 && measurements.documentWidth <= width + 1 && measurements.canvasCount === 0 && measurements.specimens.every((panel) => panel.dimensions.every((item) => item.fits) && panel.choices.every((choice) => choice.fits));
    results.push({ width, height: 900, errors, pass, ...measurements });
    await page.close();
  }
} finally {
  await browser.close();
}
const sourceStable = JSON.stringify(files) === JSON.stringify(snapshot());
const report = { purpose: 'Actual shared static portrait/helper gallery design checks, not gameplay or physical-phone evidence.', source: { head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), files, hash: digest(JSON.stringify(files)), sourceStable }, environment: { node: process.version, browser: browser.version(), dpr: 1, viewports: [1440, 320] }, command: 'node tools/check-passenger-portrait-gallery.mjs (PORTRAIT_GALLERY_URL defaults to http://127.0.0.1:5250)', method: 'Each live text-node Range line and nested scrollWidth/clientWidth,44px portrait containment, decoded256px source dimensions, pending/failure ownership, allnameschemes and20pxlongname stress. Original sources also appear at256px. No hidden-scrollbar exemption.', results };
writeFileSync(`${output}/measurements.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ sourceStable, results: results.map((entry) => ({ width: entry.width, pass: entry.pass, choices: entry.specimens.reduce((n, panel) => n + panel.choices.length, 0) })) }));
if (!sourceStable || results.some((entry) => !entry.pass)) process.exitCode = 1;
