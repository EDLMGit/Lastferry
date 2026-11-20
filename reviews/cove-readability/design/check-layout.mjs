import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
const { chromium } = await import('playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const baseURL = process.env.COVE_DESIGN_URL ?? 'http://127.0.0.1:5403';
const readings = [];
let panRotation;
try {
  for (const [level, sizes] of [
    ['holding-pier', [[390,844],[780,320],[320,740]]],
    ['wide-berth', [[780,320],[390,844]]],
    ['far-shore', [[390,844],[780,320]]],
  ]) {
    const page = await browser.newPage({ viewport: { width: sizes[0][0], height: sizes[0][1] }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await page.goto(baseURL + '/?cove=' + level, { waitUntil: 'commit' });
    await page.waitForFunction(() => window.__LAST_FERRY__?.getMetrics().frames > 4);
    for (const [width, height] of sizes) {
      const start = await page.evaluate(() => window.__LAST_FERRY__.getMetrics().frames);
      await page.setViewportSize({ width, height });
      await page.waitForFunction(({ start, width, height }) => {
        const game = window.__LAST_FERRY__;
        const canvas = game.getFrameStatus().canvas;
        return canvas.width === width && canvas.height === height && game.getMetrics().frames > start + 3;
      }, { start, width, height });
      const observed = await page.evaluate(() => {
        const byId = id => document.getElementById(id);
        const shapes = ['load-toggle','status-toggle'].map(id => ({ id, ...byId(id).getBoundingClientRect().toJSON() }));
        const owns = (rect, x, y) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        const visible = r => r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
        const markers = [...document.querySelectorAll('.map-stop:not(.offscreen) .map-hit')].flatMap(element => {
          const r = element.getBoundingClientRect();
          if (!visible(r)) return [];
          const button = element.closest('button');
          const points = [[r.x + 4,r.y + 4],[r.right - 4,r.y + 4],[r.x + r.width / 2,r.y + r.height / 2],[r.x + 4,r.bottom - 4],[r.right - 4,r.bottom - 4]];
          return [{ id:button.id, hits:points.map(([x,y])=>document.elementFromPoint(x,y)?.closest('button')?.id ?? '') }];
        });
        const frame = window.__LAST_FERRY__.getFrameStatus();
        const passengers = frame.passengers.flatMap(({ id, left, right, top, bottom }) => {
          const x = (left + right) / 2;
          const y = top + (bottom - top) / 3;
          if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) return [];
          return [{ id, coveredByReading:shapes.find(r => owns(r,x,y))?.id ?? null }];
        });
        const lantern = frame.lantern;
        const lanternCoverage = shapes.filter(r => owns(r,(lantern.left + lantern.right)/2,(lantern.top + lantern.bottom)/2)).map(r => r.id);
        return { shapes, markers, passengers, lanternCoverage, pageWidth:document.documentElement.scrollWidth,
          load:byId('load-toggle').innerText, forecast:byId('status-toggle').innerText };
      });
      readings.push({ level, width, height, ...observed });
      assert.equal(observed.pageWidth, width);
      for (const r of observed.shapes)
        assert.ok(r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= width && r.top >= 0 && r.bottom <= height, r.id);
      for (const m of observed.markers)
        assert.ok(m.hits.every(id => id === m.id), level + ': ' + JSON.stringify(m));
      for (const p of observed.passengers)
        assert.equal(p.coveredByReading, null, level + ': ' + p.id);
      if (level === 'holding-pier' && width === 780) {
        assert.equal(observed.markers.length, 4);
      }
      if (level === 'wide-berth' && width === 780) {
        assert.deepEqual(observed.lanternCoverage, []);
        const cdp = await page.context().newCDPSession(page);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
        await cdp.detach();
        writeFileSync(new URL('wide-berth-780-edge.png', import.meta.url), Buffer.from(shot.data, 'base64'));
      }
    }
    await page.locator('#load-toggle').tap();
    await page.locator('#find-home').tap();
    await page.waitForFunction(() => document.getElementById('local-context')?.dataset.location === 'harbor');
    assert.equal(await page.getByTestId('turn').textContent(), '00');
    await page.close();
  }
  const page = await browser.newPage({ viewport: {width:780,height:320}, hasTouch:true, deviceScaleFactor:1, reducedMotion:'reduce' });
  await page.goto(baseURL + '/?cove=wide-berth', { waitUntil: 'commit' });
  await page.waitForFunction(() => Number.parseFloat(document.getElementById('status-toggle')?.style.getPropertyValue('--reading-x')) < 0);
  const input = await page.context().newCDPSession(page);
  await input.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:375,y:65}]});
  await input.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:428,y:97}]});
  await input.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  await input.detach();
  await page.waitForFunction(() => window.__LAST_FERRY__.getViewStatus().panned);
  const shifted = await page.locator('#status-toggle').evaluate(el => el.style.getPropertyValue('--reading-x'));
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(() => window.__LAST_FERRY__.getFrameStatus().canvas.width === 390 &&
    !document.getElementById('status-toggle').style.getPropertyValue('--reading-x'));
  panRotation = await page.evaluate(() => ({
    panned:window.__LAST_FERRY__.getViewStatus().panned,
    rects:['load-toggle','status-toggle'].map(id => ({
      id, translate:getComputedStyle(document.getElementById(id)).translate,
      ...document.getElementById(id).getBoundingClientRect().toJSON(),
    })),
  }));
  panRotation.previousOffset = shifted;
  assert.ok(Number.parseFloat(shifted) < 0);
  assert.equal(panRotation.panned, true);
  for (const rect of panRotation.rects) {
    assert.equal(rect.translate, 'none');
    assert.ok(rect.left >= 0 && rect.right <= 390 && rect.top >= 0 && rect.bottom <= 844);
  }
  await page.locator('#status-toggle').tap();
  assert.equal(await page.locator('#dialog').isVisible(), true);
  assert.equal(await page.getByTestId('turn').textContent(), '00');
  await page.close();
} finally {
  writeFileSync(new URL('layout-observations.json', import.meta.url), JSON.stringify({ browser:browser.version(), readings, panRotation }, null, 2) + '\n');
  await browser.close();
}
console.log('Passed ' + readings.length + ' native layout and rotation observations plus the panned landscape-to-portrait forecast');
