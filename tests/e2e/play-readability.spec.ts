import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ready, act, activate, wholeCove, state, idle, undo, tabTo, fullyVisible } from './ui';
import { reviewDir } from './evidence';

mkdirSync(reviewDir, { recursive: true });
const save = (name: string, data: unknown) => writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(data, null, 2));
function source() {
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
  return Object.fromEntries([...walk('src'), ...walk('data'), 'package.json', 'package-lock.json'].map(p => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]));
}
test.beforeAll(async ({ browser }) => save('source-before', { head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), files: source(), browser: browser.version(), node: process.version, renderer: 'ANGLE SwiftShader', capture: 'Native CSS viewport DPR1; actual UI; development build unless marked production' }));
test.afterAll(() => save('source-after', { files: source() }));
async function shot(page: Page, name: string) {
  await page.waitForTimeout(350);
  const cdp = await page.context().newCDPSession(page);
  const capture = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const bytes = Buffer.from(capture.data, 'base64');
  writeFileSync(`${reviewDir}/${name}.png`, bytes);
  await cdp.detach();
  expect(bytes.length, 'Native screenshot must contain the rendered scene').toBeGreaterThan(5000);
  save(name, await page.evaluate(() => {
    const g = (window as any).__LAST_FERRY__;
    return { state: g?.getState(), view: g?.getViewStatus?.(), navigation: g?.getNavigationStatus(), frame: g?.getFrameStatus(), active: document.activeElement?.id };
  }));
}
test('native collapsed controls and free nearby inspection', async ({ browser, baseURL }) => {
  for (const [width, height] of [[320,740],[390,844],[780,320],[844,390],[1440,900]]) {
    const ctx = await browser.newContext({ baseURL, viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 1000 });
    const page = await ctx.newPage();
    await ready(page, 'holding-pier');
    for (const id of ['load-toggle','wait','menu','sound-toggle','status-toggle','view-toggle','unload']) await fullyVisible(page, page.locator('#' + id));
    await expect(page.locator('#status-toggle')).toContainText('Rabbit Pier floods in 4 actions');
    await shot(page, `${width}x${height}-start`);
    const before = await state(page);
    const frame = await page.evaluate(() => (window as any).__LAST_FERRY__.getViewStatus());
    await activate(page, 'load-toggle', width < 1000);
    await fullyVisible(page, page.locator('#close-status'));
    await shot(page, `${width}x${height}-expanded`);
    expect(await state(page)).toEqual(before);
    expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getViewStatus())).toMatchObject({ focus: frame.focus, scale: frame.scale });
    await activate(page, 'close-status', width < 1000);
    await wholeCove(page, width < 1000);
    const blockedHits = await page.locator('.map-stop:not(.offscreen) .map-target').evaluateAll((buttons) => buttons.flatMap(button => {
      const hit = button.querySelector('.map-hit')!.getBoundingClientRect();
      const points = [[hit.left+4,hit.top+4],[hit.right-4,hit.top+4],[(hit.left+hit.right)/2,(hit.top+hit.bottom)/2],[hit.left+4,hit.bottom-4],[hit.right-4,hit.bottom-4]];
      return points.filter(([x,y])=>document.elementFromPoint(x,y)?.closest('button')!==button).map(([x,y])=>({id:button.id,x,y,owner:document.elementFromPoint(x,y)?.closest('button')?.id}));
    }));
    save(`${width}x${height}-hit-owners`,blockedHits);
    expect(blockedHits).toEqual([]);
    await activate(page, 'map-shallows', width < 1000);
    await expect(page.locator('#sail')).toBeDisabled();
    await expect(page.locator('#local-context')).toContainText('Needs depth 2 · passage 1');
    await fullyVisible(page, page.locator('#location-details'));
    const intercepted = await page.locator('#local-context').evaluate(card => {
      const a=card.getBoundingClientRect();
      return [...document.querySelectorAll('.view-controls button, #status-toggle, .tools button, #load-toggle')].filter(el=>{ const b=el.getBoundingClientRect(); return b.width>0 && a.left<b.right && a.right>b.left && a.top<b.bottom && a.bottom>b.top; }).map(el=>el.id);
    });
    expect(intercepted).toEqual([]);
    await shot(page, `${width}x${height}-blocked`);
    await activate(page, 'location-details', width < 1000);
    await expect(page.locator('#location-facts')).toContainText('Boat needs depth 2');
    expect(await state(page)).toEqual(before);
    await ctx.close();
  }
});

test('natural keyboard direct sailing, inline loss and complete recovery', async ({ browser, baseURL }) => {
  for (const size of [{width:1440,height:900},{width:780,height:320}]) {
    const ctx = await browser.newContext({baseURL,viewport:size,deviceScaleFactor:1});
    const page = await ctx.newPage();
    await ready(page,'holding-pier');
    const press = async (id:string,back=false) => { await tabTo(page,id,back); await page.keyboard.press('Enter'); };
    await press('load-toggle');
    expect((await state(page)).turn).toBe(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('#load-toggle')).toBeFocused();
    await press('view-toggle');
    await press('map-harbor');
    await expect(page.locator('#local-context')).toBeFocused();
    await press('location-details');
    await expect(page.locator('#location-facts')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#location-details')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#map-harbor')).toBeFocused();
    await page.keyboard.press('Enter');
    await press('sail',true);
    await idle(page);
    expect((await state(page)).turn).toBe(1);
    await expect(page.locator('#dialog')).not.toBeVisible();
    await expect(page.locator('#map-harbor')).toBeFocused();
    await press('menu');
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeFocused();
    for(let i=0;i<2;i++) { await press('wait'); await press('commit'); await idle(page); }
    const before=await state(page);
    await press('map-stone');
    await expect(page.locator('#local-context')).toContainText('Pip');
    await expect(page.locator('#local-context')).toContainText('Rue');
    await expect(page.locator('#sail')).toHaveText(/Sail anyway/);
    const covered=await page.locator('#local-context').evaluate(card=>{ const a=card.getBoundingClientRect(); return [...document.querySelectorAll('.tools button,.view-controls button,#status-toggle,#load-toggle')].filter(el=>{const b=el.getBoundingClientRect();return b.width>0&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}).map(el=>el.id); });
    expect(covered).toEqual([]);
    await shot(page,`${size.width}x${size.height}-inline-loss`);
    expect(await state(page)).toEqual(before);
    await press('sail');
    await idle(page);
    expect((await state(page)).turn).toBe(4);
    expect((await state(page)).status).toBe('lost');
    await press('terminal-undo');
    expect(await state(page)).toEqual(before);
    expect(await page.evaluate(()=>document.activeElement?.id)).toBe('undo');
    await ctx.close();
  }
});

test('touch inspection, bounded pan, rotation and actual fullscreen preserve state',async({browser,baseURL})=>{
  const ctx=await browser.newContext({baseURL,viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true});
  const page=await ctx.newPage();
  await ready(page,'holding-pier');
  await wholeCove(page,true);
  const before=await state(page);
  await activate(page,'map-harbor',true);
  expect(await state(page)).toEqual(before);
  await expect(page.locator('#sail')).toBeEnabled();
  await shot(page,'390x844-safe-sail');
  await activate(page,'close-location',true);
  const touch = await ctx.newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:40,y:620}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:80,y:660}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await touch.detach();
  expect(await state(page)).toEqual(before);
  if(await page.locator('#back-to-boat').isVisible()) await activate(page,'back-to-boat',true);
  await activate(page,'menu',true);
  await activate(page,'fullscreen',true);
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');
  await expect(page.locator('#dialog')).toBeVisible();
  await page.setViewportSize({width:844,height:390});
  await fullyVisible(page,page.locator('#cancel'));
  await activate(page,'fullscreen',true);
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??null)).toBeNull();
  await activate(page,'settings',true);
  await page.locator('#motion-preference').selectOption('reduced');
  await activate(page,'settings-sound',true);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  expect(await state(page)).toEqual(before);
  await act(page,'map-harbor',true);
  expect((await state(page)).turn).toBe(1);
  await undo(page,true);
  expect(await state(page)).toEqual(before);
  await shot(page,'844x390-rotated-recovery');
  await ctx.close();
});

test('two actual rapid activations commit one move while busy',async({browser,baseURL})=>{
  const ctx=await browser.newContext({baseURL,viewport:{width:844,height:390},deviceScaleFactor:1,hasTouch:true});
  const page=await ctx.newPage();
  await ready(page,'holding-pier');
  await activate(page,'map-harbor',true);
  const button=await page.locator('#sail').boundingBox();
  await page.evaluate(()=>{
    (window as any).__inputTimes=[];
    document.addEventListener('pointerdown',e=>(window as any).__inputTimes.push({at:performance.now(),id:(e.target as Element).closest('button')?.id}),true);
  });
  const x=button!.x+button!.width/2,y=button!.y+button!.height/2;
  await page.touchscreen.tap(x,y);
  await page.waitForTimeout(60);
  await page.touchscreen.tap(x,y);
  await idle(page);
  expect((await state(page)).turn).toBe(1);
  const inputs=await page.evaluate(()=>(window as any).__inputTimes);
  save('repeat-input',{inputs,observedInterval:inputs.length>=2?inputs[1].at-inputs[0].at:null,scope:'One observed busy-window sequence; no universal <=180ms guarantee'});
  await ctx.close();
});

test('Whole cove keeps actual shore passengers and home clear of corner controls',async({browser,baseURL})=>{
  for(const [cove,width,height] of [['wide-berth',844,390],['wide-berth',780,320],['bellwater',844,390],['driftwood-yard',780,320],['holding-pier',390,844]] as const){
    const ctx=await browser.newContext({baseURL,viewport:{width,height},deviceScaleFactor:1,hasTouch:true});
    const page=await ctx.newPage();page.setDefaultTimeout(15000);
    await ready(page,cove);await wholeCove(page,true);
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    const coverage=await page.evaluate(()=>{
      const g=(window as any).__LAST_FERRY__,frame=g.getFrameStatus();
      const controls=[...document.querySelectorAll<HTMLElement>('.tools button,#load-toggle,#status-toggle,.view-controls button')].filter(e=>!e.hidden&&e.getBoundingClientRect().width>0).map(e=>({id:e.id,...e.getBoundingClientRect().toJSON()}));
      const subjects=[...frame.passengers,{id:'lighthouse',...frame.lighthouse}];
      return {view:g.getViewStatus(),overlaps:subjects.flatMap(s=>controls.filter(c=>s.left<c.right&&s.right>c.left&&s.top<c.bottom&&s.bottom>c.top).map(c=>({subject:s.id,control:c.id}))),outside:subjects.filter(s=>s.left<0||s.right>innerWidth||s.top<0||s.bottom>innerHeight)};
    });
    save(`${cove}-${width}x${height}-overview-clearance`,coverage);
    expect(coverage.overlaps).toEqual([]);expect(coverage.outside).toEqual([]);
    await shot(page,`${cove}-${width}x${height}-overview-clearance`);
    const before=await page.evaluate(()=>(window as any).__LAST_FERRY__.getViewStatus());
    await activate(page,'load-toggle',true);
    expect(await page.evaluate(()=>(window as any).__LAST_FERRY__.getViewStatus())).toMatchObject({focus:before.focus,scale:before.scale});
    await ctx.close();
  }
});
