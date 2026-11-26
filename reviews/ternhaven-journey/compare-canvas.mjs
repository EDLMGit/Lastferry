import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { stripTypeScriptTypes } from 'node:module';

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.cache/ms-playwright');
const { chromium } = await import('playwright');
const source = 'src/campaign/story-painter.ts';
const base = '42e0b3a46e2f347a0e00a8dbb4240a36fa0197e0';
const old = execFileSync('git', ['show', base + ':' + source], { encoding: 'utf8' });
const current = readFileSync(source, 'utf8');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage();
  await page.route('http://127.0.0.1/studio', route => route.fulfill({contentType:'text/html',body:'<!doctype html><title>Canvas comparison</title>'}));
  await page.goto('http://127.0.0.1/studio');
  for (const [name, text] of [['before', old], ['after', current]]) {
    const js = stripTypeScriptTypes(text);
    await page.addScriptTag({type:'module',content:js + '\nwindow.' + name + ' = createCoveStoryPainter;'});
  }
  const results = [];
  for (const [w,h] of [[374,551],[764,242]]) {
    const row = await page.evaluate(async ({w,h}) => {
      const ca=document.createElement('canvas'), cb=document.createElement('canvas');
      const a=window.before(ca), b=window.after(cb);
      a.resize(w,h); b.resize(w,h);
      let oldFrames=0;
      for (const [shot, duration] of Object.entries(a.durations)) {
        for (const t of [0,3.6,duration]) {
          a.draw(shot,t); b.draw(shot,t);
          if (ca.toDataURL()!==cb.toDataURL()) throw new Error(shot+' differed at '+t);
          oldFrames++;
        }
      }
      const shots=[];
      for (const t of [0,3.6,5.9,7]) {
        b.draw('ternhaven',t);
        const pixels=cb.getContext('2d').getImageData(0,0,w,h).data;
        const bytes=await crypto.subtle.digest('SHA-256',pixels);
        shots.push([...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join(''));
      }
      if (new Set(shots.slice(0,3)).size!==3 || shots[2]!==shots[3]) throw new Error('Ternhaven poses or held endpoint changed unexpectedly');
      return {width:w,height:h,unchangedOldFrames:oldFrames,ternhavenRGBA:shots};
    }, {w,h});
    results.push(row);
  }
  const root='reviews/ternhaven-journey';
  writeFileSync(root+'/canvas-comparison.json', JSON.stringify({base,browser:browser.version(),node:process.version,source,gitSourceSHA256:hash(old),workingTreeSourceSHA256:hash(current),method:'Isolated real Chromium Canvas, same sizes, light and time, no UI; compares nine previous shots at beginning/greeting/end. Ternhaven is distinct at 0, 3.6, 5.9s, then identical at 7s.',results},null,2)+'\n');
  console.log(results.map(x=>x.unchangedOldFrames).join(' + ')+' older frames unchanged; new finite poses and hold verified');
} finally { await browser.close(); }
