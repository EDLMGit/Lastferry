import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const base = process.env.COVE_PANEL_GALLERY_URL ?? 'http://127.0.0.1:5240';
const output = 'reviews/cove-panel-refinement/gallery';
mkdirSync(output, { recursive: true });
const digest = (value) => createHash('sha256').update(value).digest('hex');
const files = [
  'asset-gallery.html', 'src/dev/asset-gallery.ts', 'src/dev/asset-gallery.css',
  'src/ui/cove-ui.ts', 'src/ui/cove-ui.css', 'assets/catalog.json',
  'cove-panel-package/material/cove-panel-material.css',
  'cove-panel-package/material/shoreline-corner.svg',
];
const identity = () => Object.fromEntries(files.map((path) => [path, digest(readFileSync(path))]));
const source = identity();
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1440, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(`${base}/asset-gallery.html`);
    await page.locator('#gallery-text-stress .cove-choice').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    const measurements = await page.evaluate(() => {
      const rect = (r) => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
      const specimens = [...document.querySelectorAll('.panel-specimen')].map((panel) => {
        const dimensions = [...panel.querySelectorAll('.passenger-options, .cove-choice, .cove-choice-name, .cove-choice-capacity')].map((element) => ({
          selector: element.className,
          width: element.clientWidth,
          scrollWidth: element.scrollWidth,
          horizontalOverflow: element.scrollWidth > element.clientWidth + 1,
        }));
        const choices = [...panel.querySelectorAll('.cove-choice')].map((button) => {
          const style = getComputedStyle(button), box = button.getBoundingClientRect();
          const content = {
            left: box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft),
            right: box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight),
            top: box.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop),
            bottom: box.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom),
          };
          const lines = [...button.querySelectorAll('.cove-choice-name, .cove-choice-capacity')].flatMap((label) => {
            const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
            const fragments = [];
            while (walker.nextNode()) {
              if (!walker.currentNode.textContent.trim()) continue;
              const range = document.createRange();
              range.selectNodeContents(walker.currentNode);
              fragments.push(...[...range.getClientRects()].map((r) => ({
                text: walker.currentNode.textContent,
                bounds: rect(r),
                fits: r.left >= content.left - 1 && r.right <= content.right + 1 && r.top >= content.top - 1 && r.bottom <= content.bottom + 1,
              })));
            }
            return fragments;
          });
          return {
            text: button.textContent,
            pressed: button.getAttribute('aria-pressed'),
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            bounds: rect(box), content, lines,
            fits: lines.every((line) => line.fits),
            primaryTarget: box.height >= 48,
          };
        });
        return { id: panel.id, bounds: rect(panel.getBoundingClientRect()), dimensions, choices };
      });
      return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, specimens };
    });
    const pass = errors.length === 0 && measurements.documentWidth <= width + 1 && measurements.specimens.every((panel) => panel.dimensions.every((item) => !item.horizontalOverflow) && panel.choices.every((choice) => choice.fits && choice.primaryTarget));
    for (const id of ['gallery-three-passengers', 'gallery-narrow-passengers', 'gallery-text-stress'])
      await page.locator(`#${id}`).screenshot({ path: `${output}/${width}-${id}.png` });
    results.push({ width, height: 900, errors, pass, ...measurements });
    await page.close();
  }
} finally {
  await browser.close();
}
const unchanged = JSON.stringify(source) === JSON.stringify(identity());
const report = {
  purpose: 'Bounded developer-gallery design check; these are not gameplay or physical-phone captures.',
  source: { head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), files: source, hash: digest(JSON.stringify(source)), unchanged },
  browser: browser.version(),
  method: 'Actual shared helper/grid/material at 400px and 320px maximum panel widths, with 20px (125%) gallery-only longer labels. Every nonempty text-node Range fragment is checked against its choice content box, plus nested scroll widths and48px minimum targets. No hidden-scrollbar exemption.',
  results,
};
writeFileSync(`${output}/measurements.json`, `${JSON.stringify(report, null, 2)}\n`);
if (!unchanged || results.some((result) => !result.pass)) process.exitCode = 1;
console.log(JSON.stringify({ sourceStable: unchanged, results: results.map((r) => ({ width: r.width, pass: r.pass })) }));
