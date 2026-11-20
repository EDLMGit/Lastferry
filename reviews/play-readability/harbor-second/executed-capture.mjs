import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const output = process.argv[2] ?? 'reviews/play-readability/harbor-candidate';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sources = ['src/campaign/story-painter.ts','src/campaign/story-view.ts','src/campaign/story.css','src/campaign/registry.ts','src/campaign/presentation.ts'].map(p=>({path:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')}));
const records = [];
for (const [width,height] of [[390,844],[780,320],[320,740],[2048,930]]) {
  const context = await browser.newContext({ viewport: {width,height}, deviceScaleFactor: 1, hasTouch: width < 900 });
  await context.addInitScript(() => {
    localStorage.setItem('last-ferry.journey.v1', JSON.stringify({version:1,checkpoint:{kind:'scene',id:'another-bell'},completed:['holding-pier'],acknowledgedScenes:['opening']}));
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5282/');
  await page.locator('#home-play').click();
  await page.locator('#story-more summary').click();
  await page.locator('#story-replay-scene').click();
  await page.locator('#story-more summary').click();
  const inspect = () => page.evaluate(() => {
    const g=window.__LAST_FERRY__, canvas=document.getElementById('story-canvas'), caption=document.getElementById('story-caption');
    const nodes=[...document.querySelectorAll('#dialog button,#story-more summary')].filter(e=>e.getBoundingClientRect().width && getComputedStyle(e).visibility !== 'hidden');
    const rect=r=>({x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom});
    return {story:g.getStoryStatus(),state:g.getState(),campaign:g.getCampaignStatus(),canvas:rect(canvas.getBoundingClientRect()),caption:{text:caption.textContent,rect:rect(caption.getBoundingClientRect()),opacity:getComputedStyle(caption).opacity},controls:nodes.map(e=>({id:e.id||e.textContent,rect:rect(e.getBoundingClientRect())})),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  for (const [label,elapsed] of [['begin',0],['placement',3200],['end',5000]]) {
    if(elapsed) await page.waitForFunction(t=>window.__LAST_FERRY__.getStoryStatus().timeline.elapsed>=t,elapsed);
    if(elapsed<5000) await page.locator('#story-pause').click();
    const before=await inspect();
    const capture = await cdp.send('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
    writeFileSync(`${output}/${width}x${height}-${label}.png`,Buffer.from(capture.data,'base64'));
    records.push({viewport:{width,height},label,before,after:await inspect(),errors});
    writeFileSync(`${output}/capture.json`,JSON.stringify({at:new Date().toISOString(),sources,records},null,2));
    if(elapsed<5000) await page.locator('#story-pause').click();
  }
  const beforeContinue=await page.evaluate(()=>localStorage.getItem('last-ferry.journey.v1'));
  await page.locator('#story-continue').click();
  await page.waitForFunction(()=>window.__LAST_FERRY__.getState().boatNodeId==='harbor');
  records.push({viewport:{width,height},handoff:{beforeContinue,afterContinue:await page.evaluate(()=>localStorage.getItem('last-ferry.journey.v1')),state:await page.evaluate(()=>window.__LAST_FERRY__.getState())}});
  await context.close();
}
await browser.close();
writeFileSync(`${output}/capture.json`,JSON.stringify({at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sources,records},null,2));
console.log(JSON.stringify({output,records:records.length}));
