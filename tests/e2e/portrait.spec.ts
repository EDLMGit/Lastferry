import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { measurePanel } from './cove-panel-measure';
import { measurePortraits } from './portrait-measure';
import { act, activate, fullyVisible, idle, ready, state, tabTo, undo } from './ui';

const slots = (page: Page) => page.locator('#preview .cove-choice-portrait');
const choiceGeometry = (page: Page) => page.evaluate(() => ({
  choices: [...document.querySelectorAll('.cove-choice')].map(e => ({ id:e.id, rect:e.getBoundingClientRect().toJSON() })),
  footer: document.getElementById('commit')!.getBoundingClientRect().toJSON(),
  dialog: document.getElementById('dialog')!.getBoundingClientRect().toJSON(),
}));
const boundary = (page: Page) => page.evaluate(() => {
  const a=(window as any).__LAST_FERRY__;
  return { state:a.getState(),history:a.getRenderStatus().historyLength,view:a.getViewStatus(),hud:document.getElementById('readout')!.textContent };
});
async function verify(page: Page, expected: Record<string,string>) {
  await expect.poll(() => page.locator('#preview img[data-portrait-state="loaded"]').count()).toBe(Object.keys(expected).length);
  expect(await page.evaluate(measurePanel).then(x=>x.failures)).toEqual([]);
  const result=await page.evaluate(measurePortraits);
  expect(result.choices.map(c=>c.id)).toEqual(Object.keys(expected).map(id=>`passenger-${id}`));
  expect(result.canvasCount).toBe(1);
  expect(result.imageCount).toBe(result.choices.length);
  for(const c of result.choices){
    expect(c.image).toMatchObject({complete:true,naturalWidth:256,naturalHeight:256,alt:'',draggable:false,pointerEvents:'none',opacity:'1'});
    expect(c.image!.rect!.width).toBe(44);expect(c.image!.rect!.height).toBe(44);
    expect(c.imageContained).toBe(true);expect(c.checkContained).toBe(true);expect(c.checkOverlapsPortrait).toBe(false);
    await expect(page.locator(`#${c.id} .cove-choice-portrait`)).toHaveAttribute('data-appearance',expected[c.id.replace('passenger-','')]);
    expect(c.image!.currentSrc).toContain(expected[c.id.replace('passenger-','')]);
    expect(c.button.height).toBe(62);
  }
  return result;
}
async function childTap(page: Page, selector:string) {
  const b=await page.locator(selector).boundingBox();expect(b).not.toBeNull();
  await page.touchscreen.tap(b!.x+b!.width/2,b!.y+b!.height/2);
}
function geometryUnchanged(before:Awaited<ReturnType<typeof choiceGeometry>>,after:Awaited<ReturnType<typeof choiceGeometry>>) {
  expect(after.choices.map(c=>c.id)).toEqual(before.choices.map(c=>c.id));
  for(const key of ['footer','dialog'] as const) for(const field of ['x','y','width','height'] as const)expect(Math.abs(after[key][field]-before[key][field])).toBeLessThanOrEqual(0.75);
  for(let i=0;i<before.choices.length;i++)for(const field of ['x','y','width','height'] as const)expect(Math.abs(after.choices[i].rect[field]-before.choices[i].rect[field])).toBeLessThanOrEqual(0.75);
}

test('portrait identities: all nine level passengers, singleton tan after partial boarding and delivery',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const page=await context.newPage();const observations:Record<string,unknown>={};
  const save=async(name:string)=>{observations[name]={boundary:await boundary(page),portraits:await page.evaluate(measurePortraits),imageResources:await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>(e as PerformanceResourceTiming).initiatorType==='img').map(e=>{const r=e as PerformanceResourceTiming;return{name:r.name,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,decodedBodySize:r.decodedBodySize};}))};mkdirSync(reviewDir,{recursive:true});await page.screenshot({path:`${reviewDir}/portrait-${name}.png`});};
  try{
    await ready(page,'holding-pier');await activate(page,'unload',true);await verify(page,{'sheep-1':'sheep-wool'});await save('holding-moss');
    await activate(page,'commit',true);await idle(page);await act(page,'map-shallows',true);await act(page,'map-rabbit-pier',true);await activate(page,'board',true);await verify(page,{'rabbit-1':'rabbit-cream','rabbit-2':'rabbit-tan'});await save('holding-rabbits');
    await activate(page,'commit',true);await idle(page);for(const id of ['map-shallows','map-stone','board','map-harbor'])await act(page,id,true);await activate(page,'unload',true);await childTap(page,'#passenger-rabbit-2 img');await activate(page,'commit',true);await idle(page);expect(await state(page)).toMatchObject({turn:9,status:'playing',aboard:['rabbit-2'],delivered:['rabbit-1','sheep-1']});await activate(page,'unload',true);await verify(page,{'rabbit-2':'rabbit-tan'});await save('holding-rue-after-delivery');await activate(page,'cancel',true);await undo(page,true);
    await ready(page,'first-crossing');await act(page,'map-sheep-pier',true);await activate(page,'board',true);await verify(page,{'sheep-1':'sheep-wool'});await save('first-moss');await activate(page,'cancel',true);await activate(page,'unload',true);await verify(page,{'rabbit-1':'rabbit-cream','rabbit-2':'rabbit-tan'});await save('first-rabbits');
    await ready(page,'bellwater');await act(page,'map-shallows',true);await act(page,'map-low-pier',true);await activate(page,'board',true);await verify(page,{tansy:'rabbit-cream',lark:'rabbit-tan'});await save('bellwater-rabbits');
    await childTap(page,'#passenger-lark img');await activate(page,'commit',true);await idle(page);expect(await state(page)).toMatchObject({turn:3,aboard:['tansy']});
    await activate(page,'board',true);await verify(page,{lark:'rabbit-tan'});await save('bellwater-lark-alone');await activate(page,'cancel',true);await undo(page,true);expect(await state(page)).toMatchObject({turn:2,aboard:[]});
    await activate(page,'board',true);for(const id of ['tansy','lark','lark','tansy'])await childTap(page,`#passenger-${id} img`);await verify(page,{tansy:'rabbit-cream',lark:'rabbit-tan'});await activate(page,'commit',true);await idle(page);
    for(const id of ['map-east-buoy','map-west-buoy','map-harbor','map-bell-pier'])await act(page,id,true);await activate(page,'board',true);await verify(page,{bram:'sheep-wool'});await save('bellwater-bram');await activate(page,'commit',true);await idle(page);expect(await state(page)).toMatchObject({turn:8,tideLevel:2,aboard:['lark','tansy','bram']});
    await act(page,'map-harbor',true);await activate(page,'unload',true);await childTap(page,'#passenger-lark .cove-choice-check');await activate(page,'commit',true);await idle(page);
    expect(await state(page)).toMatchObject({turn:10,status:'playing',aboard:['lark'],delivered:['tansy','bram']});
    await activate(page,'unload',true);await verify(page,{lark:'rabbit-tan'});await save('bellwater-lark-after-delivery');await activate(page,'cancel',true);await undo(page,true);
    await activate(page,'unload',true);await verify(page,{lark:'rabbit-tan',tansy:'rabbit-cream',bram:'sheep-wool'});await activate(page,'commit',true);await idle(page);expect(await state(page)).toMatchObject({turn:10,status:'won'});
  }finally{mkdirSync(reviewDir,{recursive:true});writeFileSync(`${reviewDir}/portrait-identities.json`,JSON.stringify(observations,null,2));await context.close();}
});

for(const [width,height] of [[780,320],[360,740]])test(`portrait loading ${width}x${height}: delayed and failed images reserve geometry and native input`,async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width,height},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});let mode='delayed',requests=0;
  await context.route(/\/sheep-wool(?:-[\w-]+)?\.png(?:\?|$)/,async route=>{if(route.request().resourceType()!=='image'){await route.continue();return;}requests++;if(mode==='delayed'){await gate;await route.continue().catch(()=>{});}else await route.abort('failed');});
  const page=await context.newPage();const observations:Record<string,unknown>={};
  try{
    await ready(page,'holding-pier');const original=await boundary(page);await activate(page,'unload',true);
    await expect.poll(()=>requests).toBeGreaterThan(0);await expect(page.locator('#preview img')).toHaveAttribute('data-portrait-state','pending');
    const pending=await choiceGeometry(page);observations.pending={geometry:pending,portraits:await page.evaluate(measurePortraits),fit:await page.evaluate(measurePanel)};
    expect(await page.evaluate(measurePanel).then(x=>x.failures)).toEqual([]);await expect(page.locator('#passenger-sheep-1')).toHaveAccessibleName('Moss 2 spaces');await fullyVisible(page,page.locator('#commit'));await fullyVisible(page,page.locator('#cancel'));
    release();await verify(page,{'sheep-1':'sheep-wool'});geometryUnchanged(pending,await choiceGeometry(page));observations.decoded={geometry:await choiceGeometry(page),portraits:await page.evaluate(measurePortraits)};
    await page.evaluate(()=>{(window as any).__portraitClicks=[];document.addEventListener('click',event=>{const b=(event.target as Element)?.closest?.('.cove-choice');if(b)(window as any).__portraitClicks.push({id:b.id,trusted:event.isTrusted});},true);});
    for(const selector of ['#passenger-sheep-1 img','#passenger-sheep-1 .cove-choice-check','#passenger-sheep-1 .cove-choice-name']){
      const before=await page.locator('#passenger-sheep-1').getAttribute('aria-pressed');await childTap(page,selector);await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed',before==='true'?'false':'true');expect(await boundary(page)).toEqual(original);geometryUnchanged(pending,await choiceGeometry(page));
    }
    const box=await page.locator('#passenger-sheep-1').boundingBox();await page.touchscreen.tap(box!.x+box!.width-4,box!.y+box!.height-4);await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed','true');
    expect(await page.evaluate(()=>(window as any).__portraitClicks)).toEqual(Array.from({length:4},()=>({id:'passenger-sheep-1',trusted:true})));expect(await boundary(page)).toEqual(original);
    await tabTo(page,'passenger-sheep-1');await page.keyboard.press('Space');await expect(page.locator('#commit')).toBeDisabled();await page.keyboard.press('Space');await expect(page.locator('#passenger-sheep-1')).toBeFocused();await page.keyboard.press('Escape');await expect(page.locator('#unload')).toBeFocused();await fullyVisible(page,page.locator('#unload'));
    mode='failed';await page.reload();await page.waitForFunction(()=>((window as any).__LAST_FERRY__?.getMetrics().frames??0)>4);await idle(page);await activate(page,'unload',true);
    await expect(page.locator('#preview img')).toHaveAttribute('data-portrait-state','failed');await expect(page.locator('#passenger-sheep-1')).toHaveAccessibleName('Moss 2 spaces');const failure=await page.evaluate(measurePortraits);expect(failure.choices[0].image).toMatchObject({naturalWidth:0,opacity:'0'});expect(failure.choices[0].imageContained).toBe(true);expect(await page.evaluate(measurePanel).then(x=>x.failures)).toEqual([]);geometryUnchanged(pending,await choiceGeometry(page));
    observations.failed={geometry:await choiceGeometry(page),portraits:failure};mkdirSync(reviewDir,{recursive:true});await page.screenshot({path:`${reviewDir}/portrait-failed-${width}x${height}.png`});
    await childTap(page,'#passenger-sheep-1 img');await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed','false');await childTap(page,'#passenger-sheep-1 .cove-choice-name');await expect(page.locator('#passenger-sheep-1')).toHaveAttribute('aria-pressed','true');await activate(page,'cancel',true);await activate(page,'unload',true);await expect(page.locator('#preview img')).toHaveAttribute('data-portrait-state','failed');geometryUnchanged(pending,await choiceGeometry(page));await activate(page,'commit',true);await idle(page);expect(await state(page)).toMatchObject({turn:1,aboard:[],waitingByPier:{'stone-pier':['sheep-1']}});
  }finally{release();mkdirSync(reviewDir,{recursive:true});writeFileSync(`${reviewDir}/portrait-loading-${width}x${height}.json`,JSON.stringify({observations,requests},null,2));await context.close();}
});
