import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { resolve } from 'node:path';

const source = 'src/campaign/story-painter.ts';
const baseline = 'a5e1eff68ee93eb2d4cf9814863a3b104fc6a889';
const current = readFileSync(source, 'utf8');
const previous = execFileSync('git', ['show', baseline + ':' + source], { encoding: 'utf8' });
const sum = bytes => createHash('sha256').update(bytes).digest('hex');
const dir = 'reviews/journey-home';
const drafts = '.cache/journey-home-art';
mkdirSync(drafts, { recursive: true });
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
const { chromium } = await import('playwright');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent('<title>Original Canvas painter comparison</title>');
  for (const [id, input] of [['previous', previous], ['current', current]]) {
    await page.addScriptTag({ type: 'module', content: stripTypeScriptTypes(input) + '\nwindow.' + id + ' = createCoveStoryPainter' });
  }
  const views = [];
  for (const [width, height] of [[374, 551], [764, 242]]) {
    await page.evaluate(({ width, height }) => {
      for (const which of ['previous','current']) {
        const canvas = document.createElement('canvas');
        const painter = window[which](canvas);
        painter.resize(width, height, 1);
        window[which+'Frame'] = (id, t) => {
          painter.draw(id, t);
          return canvas.toDataURL('image/png').split(',')[1];
        };
        window[which+'Durations'] = painter.durations;
      }
    }, { width, height });
    const unchanged = await page.evaluate(() => {
      let n = 0;
      for (const [id, duration] of Object.entries(window.previousDurations)) {
        for (const t of [0, 3.6, duration]) {
          if (window.previousFrame(id,t) !== window.currentFrame(id,t)) throw Error(id + ' changed at ' + t);
          n++;
        }
      }
      return n;
    });
    const shots = [];
    for (const [id, held] of [['drowned-orchard',5.9], ['last-lights',6], ['far-shore',5.1], ['last-ferry',5.1], ['supper',6.7]]) {
      const duration = await page.evaluate(id=>window.currentDurations[id], id);
      const frames = [];
      for (const t of [0, duration/2, held, duration]) {
        const encoded = await page.evaluate(([id,t])=>window.currentFrame(id,t), [id,t]);
        const png = Buffer.from(encoded,'base64');
        frames.push({ seconds:t, sha256:sum(png) });
        writeFileSync(`${drafts}/${id}-${width}-${t}.png`, png);
      }
      assert.equal(new Set(frames.slice(0,3).map(f=>f.sha256)).size,3);
      assert.equal(frames[2].sha256, frames[3].sha256);
      shots.push({ id, frames });
    }
    views.push({width,height,unchanged,shots});
  }
  writeFileSync(dir+'/picture-check.json', JSON.stringify({
    method:'Controlled Chromium Canvas2D comparison in the phone picture area. Isolated painter output; the actual Journey frames are checked separately.',
    baseline, currentSource:source, baselineSourceSHA256:sum(previous), currentSourceSHA256:sum(current),
    browser:browser.version(), node:process.version, views,
  },null,2)+'\n');
  console.log(views.map(v=>v.unchanged+' previous frames equal, '+v.shots.length+' finite shots at '+v.width+'x'+v.height).join('\n'));
} finally {
  await browser.close();
}
