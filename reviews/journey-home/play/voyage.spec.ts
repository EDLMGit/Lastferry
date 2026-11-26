import { test, expect, type Page } from '@playwright/test';
import { recordWelcome } from './record';
import { readFileSync } from 'node:fs';
import { initial, load, preview, type State, type Action } from '../../../src/game/rules';
import { passengerName, type Level } from '../../../src/levels/level';
import { journeyKey } from '../../../tests/e2e/story-support';
import { activate, fullyVisible, idle, undo } from '../../../tests/e2e/ui';
import { runtimeSource, witness } from '../../../tests/e2e/three-lanterns-support';
import { checkTurn, directory, localView, report, snapshot, transferStart } from '../../../tests/e2e/large-cove-support';
import { hash, listenToOutput, servedBuild } from '../../lantern-reach-difficulty/play/controls';

const route = ['holding-pier','bellwater','driftwood-yard','two-shelters','wide-berth','reef-return','orchard-landing','ternhaven','drowned-orchard','lantern-reach','far-shore','last-ferry'];
const scenes = ['opening','another-bell','driftwood-light','among-the-reeds','a-wider-deck','lights-beyond-the-reef','orchard-paths','ternhaven-wave','orchard-underwater','the-last-lights','across-far-reach','one-last-crossing'];
const supper = 'a-place-for-the-captain';
const sizes = { portrait: { width:390, height:844 }, landscape: { width:780, height:320 } };
const masterKey = 'last-ferry.mastery.v1';

const read = (page:Page,key:string) => page.evaluate(k=>localStorage.getItem(k),key);
const saved = async(page:Page) => JSON.parse((await read(page,journeyKey))!);
const levelFor = (id:string):Level => JSON.parse(readFileSync('data/'+id+'.level.json','utf8'));

async function selectSail(page:Page,to:string) {
  const marker = page.locator('#map-'+to+' .map-hit');
  const reachable = await marker.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return !el.closest('.offscreen') && r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight &&
      el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
  });
  if(reachable) await marker.tap();
  else {
    await activate(page,'load-toggle',true);
    if(to==='harbor') await activate(page,'find-home',true);
    else {
      const index=page.locator('#place-index');
      if(!await index.evaluate(el=>(el as HTMLDetailsElement).open)) await index.locator('summary').tap();
      await index.locator('[data-inspect-place="'+to+'"]').tap();
    }
  }
  await expect(page.locator('#local-context')).toHaveAttribute('data-location',to);
  await fullyVisible(page,page.locator('#sail'));
  await activate(page,'sail',true);
}

async function observe(page:Page,level:Level,s:State) {
  await idle(page);
  await checkTurn(page,s,false);
  if(s.status==='playing') {
    await expect(page.locator('#map-'+s.boatNodeId)).toHaveAttribute('aria-current','location');
    await expect(page.locator('.gauge-load')).toContainText('Load '+load(s,level)+'/'+level.rules.capacity);
    await expect(page.locator('.gauge-goal')).toContainText(s.delivered.length+'/'+level.passengers.length+' home');
  }
}

async function commit(page:Page,level:Level,prior:State,action:Action) {
  const next=preview(prior,action,level);
  expect(next.error).toBeNull();
  if(action.type==='move') await selectSail(page,action.to);
  else if(action.type==='board' || action.type==='unload') await transferStart(page,action);
  else {
    await activate(page,action.type,true);
    await activate(page,'commit',true);
  }
  await observe(page,level,next.state);
  return next.state;
}

async function more(page:Page,button:string) {
  const menu=page.locator('#story-more');
  if(!await menu.evaluate(el=>(el as HTMLDetailsElement).open)) await menu.locator('summary').tap();
  await activate(page,button,true);
  if(await menu.isVisible() && await menu.evaluate(el=>(el as HTMLDetailsElement).open)) await menu.locator('summary').tap();
}

async function shot(page:Page,name:string) {
  const size=page.viewportSize()!;
  const out=directory(size.width+'x'+size.height);
  await snapshot(page,out,name);
  const bytes=readFileSync(out+'/'+name+'.png');
  expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)]).toEqual([size.width,size.height]);
  return {file:size.width+'x'+size.height+'/'+name+'.png',sha256:hash(bytes)};
}

async function sceneFrame(page:Page,name:string,caption:string) {
  await expect(page.locator('#story-caption')).toHaveText(caption);
  await expect(page.locator('#story-caption')).toHaveAttribute('aria-hidden','false');
  await fullyVisible(page,page.locator('#story-continue'));
  const fit=await page.locator('#story-caption').evaluate(el=>{
    const text=new Range(); text.selectNodeContents(el);
    const rects=[...text.getClientRects()];
    const control=document.querySelector('.story-controls')!.getBoundingClientRect();
    return rects.every(r=>r.left>=0 && r.right<=innerWidth+0.5 && r.top>=0 && r.bottom<=control.top+0.5);
  });
  expect(fit).toBe(true);
  return shot(page,name);
}

async function observeWelcomePaint(page:Page) {
  await page.evaluate(()=>{
    const sample=document.createElement('canvas');
    sample.width=80; sample.height=112;
    const ctx=sample.getContext('2d',{willReadFrequently:true})!;
    const records:{atMs:number;pixelHash:number;held:boolean}[]=[];
    Object.assign(window,{__voyageSupperPaint:records});
    let start=0,previous=-300;
    function frame() {
      const connected=document.querySelector<HTMLCanvasElement>('.story-picture[data-illustration=supper] #story-canvas');
      if(!connected) {requestAnimationFrame(frame);return;}
      const now=performance.now();
      if(!start)start=now;
      const elapsed=Math.round(now-start);
      if(elapsed-previous>=240) {
        ctx.drawImage(connected,0,0,sample.width,sample.height);
        let value=2166136261;
        for(const byte of ctx.getImageData(0,0,sample.width,sample.height).data) value=Math.imul(value^byte,16777619);
        records.push({atMs:elapsed,pixelHash:value>>>0,held:document.querySelector<HTMLButtonElement>('#story-pause')!.disabled});
        previous=elapsed;
      }
      if(elapsed<12000)requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

async function waitForRest(page: Page) {
  const paused = page.locator('#story-pause');
  await expect(async()=>{
    if(await paused.isEnabled() && (await paused.textContent())?.includes('Resume')) await paused.tap();
    await expect(paused).toBeDisabled({timeout:400});
  }).toPass({timeout:20000,intervals:[300]});
  const canvas=page.locator('#story-canvas');
  const pixels=async()=>hash(await canvas.evaluate(node=>(node as HTMLCanvasElement).toDataURL()));
  const held=await pixels();
  await page.waitForTimeout(470);
  expect(await pixels()).toBe(held);
}

test('fresh Home, every crossing, held supper, credits and independent replay',async({page,browser})=>{
  const pilot=Number(process.env.VOYAGE_PILOT ?? 0);
  const rehearsal=process.env.VOYAGE_REHEARSAL==='1';
  const source=runtimeSource();
  const out=directory('');
  const actionsLog:unknown[]=[];
  const checkpoints:unknown[]=[];
  const frames:unknown[]=[];
  const errors:string[]=[];
  page.on('pageerror',err=>errors.push(err.message));
  await listenToOutput(page);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const build=await servedBuild(page);
  await expect(page.locator('#home-play')).toHaveText('Play');
  expect(await read(page,journeyKey)).toBeNull();
  expect(await read(page,masterKey)).toBeNull();
  expect(await read(page,'last-ferry-tips')).toBeNull();
  const writeLog=()=>report(out,'voyage',{source:source.sha256,head:source.head,build,browser:browser.version(),os:process.platform,node:process.version,
    pilotChapters:pilot,rehearsal,device:'Chromium emulated touch / SwiftShader / DPR 1',actionsLog,checkpoints,frames,errors});
  const checkpoint=async(label:string)=>{checkpoints.push({label,record:await saved(page)});writeLog();};
  if(!pilot) report(directory('source'),source.sha256,{...source,build,
    drivingTest:hash(readFileSync('reviews/journey-home/play/voyage.spec.ts')),recorder:hash(readFileSync('reviews/journey-home/play/record.ts')),
    configuration:hash(readFileSync('reviews/journey-home/play/config.ts'))});
  frames.push(await shot(page,'fresh-home'));
  await activate(page,'home-play',true);
  let masteryAfterTernhaven='';
  let finishWelcome: (() => Promise<void>) | undefined;
  for(const [index,id] of route.entries()){
    if(index>=pilot && pilot) break;
    console.log('Playing '+(index+1)+'/12 '+id);
    const scene=scenes[index];
    const current=await saved(page);
    expect(current.checkpoint).toEqual({kind:'scene',id:scene});
    expect(current.completed).toEqual(route.slice(0,index));
    await checkpoint('entered '+scene);
    await expect(page.locator('#story-canvas')).toBeVisible();
    if(index===0){
      for(const number of [1,2]){
        await expect(page.locator('#story-position')).toHaveText(number+' of 3');
        await expect(page.locator('#story-continue')).toContainText('Next');
        await page.waitForTimeout(650);
        await activate(page,'story-continue',true);
      }
      await expect(page.locator('#story-continue')).toContainText('Take the helm');
      await page.waitForTimeout(650);
    }
    if(id==='drowned-orchard') {
      await waitForRest(page);
      frames.push(await shot(page,'orchard-underwater'));
    }
    if(id==='lantern-reach') {
      const line='The table is nearly ready. A few lights are still waiting across the water.';
      await page.waitForTimeout(3300);
      frames.push(await sceneFrame(page,'last-lights-unfolding',line));
      await waitForRest(page);
      for(const size of [sizes.portrait,sizes.landscape]){
        await page.setViewportSize(size); await page.waitForTimeout(250);
        frames.push(await sceneFrame(page,'last-lights',line));
      }
      await page.setViewportSize(sizes.portrait);
      expect(await saved(page)).toEqual(current);
    }
    if(index>=10) {
      await page.waitForTimeout(1600);
      frames.push(await shot(page,scene));
    }
    await activate(page,'story-continue',true);
    const level=levelFor(id);
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label',level.title);
    let s=initial(level);
    await observe(page,level,s);
    await expect(page.locator('#undo')).toBeDisabled();
    expect((await saved(page)).checkpoint).toEqual({kind:'cove',id});
    await checkpoint('at the helm '+id);
    const stable=await read(page,journeyKey);
    if(index>=8) expect(await read(page,masterKey)).toBe(masteryAfterTernhaven);
    if(index===8)frames.push(await shot(page,'drowned-orchard-at-the-helm'));
    const steps=witness(id);
    if(id==='last-ferry') steps.splice(steps.length-2,0,{type:'wait'});
    for(const action of steps) {
      const prior=s;
      s=await commit(page,level,prior,action);
      actionsLog.push({id,action,turn:s.turn,tide:s.tideLevel,location:s.boatNodeId,aboard:s.aboard,delivered:s.delivered,status:s.status});
      expect(await read(page,journeyKey)).toBe(stable);
      const tideUndo=id==='holding-pier' && s.tideLevel>prior.tideLevel && prior.tideLevel===0;
      const terminalUndo=id==='last-ferry' && s.status==='won';
      if(tideUndo || terminalUndo) {
        if(terminalUndo)frames.push(await shot(page,'final-delivery-before-undo'));
        await undo(page,true);
        await observe(page,level,prior);
        expect(await read(page,journeyKey)).toBe(stable);
        actionsLog.push({id,undo:true,restoredTurn:prior.turn,aboard:prior.aboard,tide:prior.tideLevel});
        if(terminalUndo) {
          finishWelcome=await recordWelcome(page,directory('delivery'));
          await page.waitForTimeout(650);
        }
        s=await commit(page,level,prior,action);
        actionsLog.push({id,repeated:action,turn:s.turn,tide:s.tideLevel,aboard:s.aboard,delivered:s.delivered,status:s.status});
      }
      if(id==='last-ferry' && s.boatNodeId==='harbor' && s.status==='playing' && s.aboard.length===4) {
        await expect(page.locator('#unload')).toContainText('Bring home');
        frames.push(await shot(page,'captain-at-the-dock'));
      }
      if(s.status==='playing') await localView(page);
    }
    expect(s.status).toBe('won');
    await expect(page.locator('.arrival-name')).toHaveText(level.objective.requiredPassengerIds.map(name=>passengerName(name,level)));
    await expect(page.locator('#continue-story')).toHaveText('Continue story');
    expect(await read(page,journeyKey)).toBe(stable);
    if(index>=8) {
      await expect(page.locator('.arrival-unrated')).toContainText('no lantern rating');
      await expect(page.locator('#mastery-result')).toHaveCount(0);
      expect(await read(page,masterKey)).toBe(masteryAfterTernhaven);
    }
    if(index===11) {
      await expect(page.locator('.arrival-result')).toHaveAttribute('data-undos','1');
      frames.push(await shot(page,'final-rescue-accepted-next'));
    }
    if(index===7) await page.emulateMedia({reducedMotion:'no-preference'});
    if(index===11)await observeWelcomePaint(page);
    await activate(page,'continue-story',true);
    if(index===7) masteryAfterTernhaven=(await read(page,masterKey))!;
    if(index>=8) expect(await read(page,masterKey)).toBe(masteryAfterTernhaven);
    await checkpoint('accepted '+id);
  }
  if(pilot){writeLog();return;}
  expect((await saved(page)).completed).toEqual(route);
  expect((await saved(page)).checkpoint).toEqual({kind:'scene',id:supper});
  const pending=await read(page,journeyKey);
  const welcome='We saved you a place.';
  await page.waitForTimeout(2900);
  frames.push(await sceneFrame(page,'captains-place-sweep',welcome));
  await waitForRest(page);
  const paints=await page.evaluate(()=>(window as any).__voyageSupperPaint as {atMs:number;pixelHash:number;held:boolean}[]);
  report(directory(''),'welcome-motion',paints);
  const activeColors=paints.filter(p=>!p.held).map(p=>p.pixelHash);
  expect(new Set(activeColors).size).toBeGreaterThan(2);
  await page.waitForTimeout(800);
  await finishWelcome!();
  for(const size of [sizes.portrait,sizes.landscape]){
    await page.setViewportSize(size); await page.waitForTimeout(250);
    frames.push(await sceneFrame(page,'captains-place',welcome));
  }
  await page.setViewportSize(sizes.portrait);
  await more(page,'story-read');
  await expect(page.locator('.story-transcript')).toContainText(welcome);
  await activate(page,'story-read-back',true);
  expect(await read(page,journeyKey)).toBe(pending);
  await page.reload();
  if(!rehearsal) expect(await servedBuild(page)).toEqual(build);
  await expect(page.locator('#home-play')).toHaveText('Continue');
  expect(await read(page,journeyKey)).toBe(pending);
  await activate(page,'home-play',true);
  await expect(page.locator('#story-caption')).toHaveText(welcome);
  expect(await read(page,journeyKey)).toBe(pending);
  await checkpoint('reloaded and resumed pending supper');
  const filmDir=directory('390x844');
  const stop=await recordWelcome(page,filmDir);
  try{
    await more(page,'story-replay-scene');
    await waitForRest(page);
    await page.waitForTimeout(1200);
    expect(await read(page,journeyKey)).toBe(pending);
    await activate(page,'story-continue',true);
    await expect(page.locator('#dialog')).toHaveAttribute('data-mode','journey-end');
    await page.waitForTimeout(900);
  }finally{await stop();}
  for(const size of [sizes.portrait,sizes.landscape]){
    await page.setViewportSize(size); await page.waitForTimeout(250);
    await expect(page.locator('#dialog-title')).toHaveText('Credits');
    for(const id of ['journey-practice','journey-settings','journey-title']) await fullyVisible(page,page.locator('#'+id));
    frames.push(await shot(page,'credits'));
  }
  await page.setViewportSize(sizes.portrait);
  expect((await saved(page)).checkpoint).toEqual({kind:'complete'});
  expect((await saved(page)).acknowledgedScenes).toEqual([...scenes,supper]);
  await checkpoint('credits explicitly acknowledged');
  const completed=await read(page,journeyKey);
  await activate(page,'journey-settings',true);
  await expect(page.locator('#settings-sound')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#journey-settings')).toBeFocused();
  await activate(page,'journey-practice',true);
  await expect(page.locator('[data-practice]')).toHaveCount(13);
  await activate(page,'practice-last-ferry',true);
  const last=levelFor('last-ferry');
  await observe(page,last,initial(last));
  await expect(page.locator('#undo')).toBeDisabled();
  expect(await read(page,journeyKey)).toBe(completed);
  expect(await read(page,masterKey)).toBe(masteryAfterTernhaven);
  await checkpoint('credits to independent Last Ferry replay');
  await page.goto('/');
  await expect(page.locator('#home-play')).toHaveText('View credits');
  await activate(page,'home-play',true);
  await expect(page.locator('#dialog')).toHaveAttribute('data-mode','journey-end');
  await expect(page.locator('#story-canvas')).toHaveCount(0);
  expect(await read(page,journeyKey)).toBe(completed);
  await checkpoint('reopened acknowledged credits from Home');
  if(!rehearsal) expect(runtimeSource().sha256).toBe(source.sha256);
  expect(errors).toEqual([]);
  writeLog();
});
