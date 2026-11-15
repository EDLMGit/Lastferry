import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, type State } from '../../src/game/rules';
import { holdingPier, levelNames } from '../../src/levels/level';
import { activate, fullyVisible, idle, ready, state, tabTo, undo } from './ui';
import { directory, localView, recordRescue, report, snapshot } from './large-cove-support';
import { candidate, execute, acceptedBest, completeSeven } from './cove-eight-support';
import { fixture, home, ongoing, storage, untouched, witness } from './three-lanterns-support';
import { productionURL } from './evidence';
import { arrivalFrame, arrivalMeasure, arrivalResult, arrivalRuntime, arrivalSource, dismissAndReopen, nextStoryToPlay, previousBest, recordArrival, unchangedAcceptance } from './arrival-bubble-support';

test.use({hasTouch:true,isMobile:true,deviceScaleFactor:1,video:'off'});
test.setTimeout(420000);
let source:ReturnType<typeof arrivalSource>;
let errors:string[];
test.beforeEach(({page,browser})=>{
  errors=[];page.on('pageerror',error=>errors.push(error.message));source=arrivalSource();
  report(directory('source'),source.sha256,{...source,browser:browser.version(),node:process.version,os:process.platform,dpr:1,when:new Date().toISOString()});
});
test.afterEach(()=>{expect(errors).toEqual([]);expect(arrivalSource()).toEqual(source);});

test('portrait Ternhaven celebrates all four rescues and keeps lifecycle provisional through Undo and Replay',async({page})=>{
  const {level,witnesses}=candidate('ternhaven');
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});
  await fixture(page,ongoing,acceptedBest);await ready(page,'ternhaven');
  let current=initial(level), finish:(()=>Promise<void>)|undefined;
  const timeline:State[]=[current];
  try{
    for(const [index,action] of witnesses[0].actions.entries()){
      if(recordArrival&&index===11)finish=await recordRescue(page,directory('390x844'),'arrival');
      current=await execute(page,level,action,current);timeline.push(current);
      if(current.delivered.includes('sedge')&&current.status==='playing'){
        await expect(page.locator('#arrival-content')).toHaveCount(0);
        await expect(page.locator('#dialog[data-outcome=won][open]')).toHaveCount(0);
      }
    }
    await arrivalResult(page,level,3,14,0);
    await expect(page.locator('#choose-cove')).toBeFocused();
    await page.keyboard.press('Shift+Tab');await expect(page.locator('#cancel')).toBeFocused();
    await page.keyboard.press('Tab');await expect(page.locator('#choose-cove')).toBeFocused();
    await unchangedAcceptance(page,acceptedBest);
    const first=await arrivalRuntime(page);
    const fit=await arrivalFrame(page,'390x844','three-lanterns');
    await page.waitForTimeout(400);
    const steady=await arrivalMeasure(page);
    expect(Math.abs(fit.bounds.x-steady.bounds.x)+Math.abs(fit.bounds.y-steady.bounds.y)+Math.abs(fit.bounds.height-steady.bounds.height)).toBeLessThanOrEqual(1);
    await expect(page.locator('#app')).toHaveClass(/arrival-open/);
    expect(await page.locator('#transfer-receipt').evaluate(el=>getComputedStyle(el).opacity)).toBe('0');
    await page.locator('#arrival-details summary').tap();
    await arrivalFrame(page,'390x844','details',true);
    await page.locator('#arrival-details summary').tap();
    await tabTo(page,'terminal-settings');await page.keyboard.press('Enter');
    await expect(page.locator('#tips-preference')).toHaveValue('off');
    await page.keyboard.press('Escape');await expect(page.locator('#terminal-settings')).toBeFocused();
    await activate(page,'choose-cove',true);await unchangedAcceptance(page,acceptedBest);
    await page.keyboard.press('Escape');await activate(page,'menu',true);await activate(page,'return-arrival',true);
    await activate(page,'cancel',true);await unchangedAcceptance(page,acceptedBest);
    if(!recordArrival)await snapshot(page,directory('390x844'),'closed-harbor');
    await activate(page,'menu',true);await activate(page,'return-arrival',true);
    await dismissAndReopen(page);
    await arrivalResult(page,level,3,14,0);
    if(!recordArrival){
      await page.setViewportSize({width:780,height:320});
      await arrivalFrame(page,'lifecycle','rotated');
      await activate(page,'terminal-settings',true);
      await page.locator('#fullscreen').scrollIntoViewIfNeeded();await activate(page,'fullscreen',true);
      await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');
      expect(await page.evaluate(()=>document.fullscreenElement!.contains(document.getElementById('dialog')))).toBe(true);
      await activate(page,'fullscreen',true);await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??null)).toBeNull();
      await activate(page,'settings-back',true);await arrivalResult(page,level,3,14,0);
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
      await page.waitForTimeout(100);
      await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
      await page.setViewportSize({width:390,height:844});
    }
    const reopened=await arrivalRuntime(page);
    expect(reopened.celebration).toBe(first.celebration);
    expect(reopened.homecoming.celebrations).toBe(first.homecoming.celebrations);
    expect(reopened.audio.arrivalEventCount).toBe(first.audio.arrivalEventCount);
    expect(reopened.state).toEqual(current);await unchangedAcceptance(page,acceptedBest);
    await arrivalFrame(page,'390x844','reopened');
    if(finish){
      await page.waitForTimeout(600);await finish();finish=undefined;
      await snapshot(page,directory('final-source'),'390x844-three');
      report(directory('final-source'),'390x844-three-fit',await arrivalMeasure(page));
      await page.setViewportSize({width:780,height:320});
      await snapshot(page,directory('final-source'),'780x320-three');
      report(directory('final-source'),'780x320-three-fit',await arrivalMeasure(page));
      await page.setViewportSize({width:390,height:844});
    }
    await tabTo(page,'terminal-undo');await page.keyboard.press('Enter');await idle(page);
    expect(await state(page)).toEqual(timeline.at(-2));
    await expect(page.locator('#app')).not.toHaveClass(/arrival-open/);
    await expect(page.locator('#arrival-content')).toBeHidden();
    expect(await page.evaluate(()=>document.getAnimations().filter(animation=>((animation.effect as KeyframeEffect)?.target as Element)?.closest('#arrival-content')).length)).toBe(0);
    current=await execute(page,level,witnesses[0].actions.at(-1)!,timeline.at(-2)!);
    await arrivalResult(page,level,2,14,1);await arrivalFrame(page,'390x844','two-after-undo');
    const redelivery=await arrivalRuntime(page);
    expect(redelivery.celebration).not.toBe(first.celebration);
    expect(redelivery.audio.arrivalEventCount).toBe(first.audio.arrivalEventCount+1);
    await unchangedAcceptance(page,acceptedBest);
    report(directory('390x844'),recordArrival?'recorded-lifecycle':'lifecycle',{source:source.sha256,timeline,first,reopened,redelivery,saved:await storage(page)});
    if(recordArrival){
      await snapshot(page,directory('final-source'),'390x844-two');
      report(directory('final-source'),'390x844-two-fit',await arrivalMeasure(page));
    }
  }finally{if(finish)await finish();}
  await activate(page,'terminal-restart',true);await idle(page);
  expect(await state(page)).toEqual(initial(level));
  const saved=await storage(page);expect(saved.masteryWrites).toBe(1);
  expect(JSON.parse(saved.mastery!).results['ternhaven@1']).toMatchObject({actions:14,successfulUndos:1,lanterns:2});
  expect(JSON.parse(saved.mastery!).results['orchard-landing@1']).toEqual(JSON.parse(acceptedBest).results['orchard-landing@1']);
  await untouched(page,ongoing);await home(page);await activate(page,'home-practice',true);
  await expect(page.locator('#practice-ternhaven .mastery-badge')).toHaveAccessibleName(/2 of 3 lanterns/);
  report(directory('390x844'),'replay-accepted',{source:source.sha256,saved});
});

test('minified short-landscape current one-lantern rescue preserves a better accepted best and Practice isolation',async({page})=>{
  const {level,witnesses}=candidate('ternhaven');
  await page.setViewportSize({width:780,height:320});await page.emulateMedia({reducedMotion:'reduce'});
  await fixture(page,completeSeven,previousBest);await page.goto(productionURL+'/?cove=ternhaven');
  expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  let current=initial(level);const timeline:State[]=[current];
  for(const action of [...witnesses[0].actions.slice(0,-1),{type:'wait'} as const,witnesses[0].actions.at(-1)!]){
    current=await execute(page,level,action,current,false);timeline.push(current);
  }
  await arrivalResult(page,level,1,15,0);await arrivalFrame(page,'780x320','one-current-best-three');
  await expect(page.locator('.arrival-best-note')).toBeVisible();
  await page.locator('#arrival-details summary').tap();
  await expect(page.locator('#mastery-best')).toContainText('3 of 3 lanterns');
  await arrivalFrame(page,'780x320','details',true);
  await page.locator('#arrival-details summary').tap();
  await unchangedAcceptance(page,previousBest);
  await activate(page,'choose-cove',true);await unchangedAcceptance(page,previousBest);
  await activate(page,'return-arrival',true);await arrivalResult(page,level,1,15,0);
  await activate(page,'choose-cove',true);await page.locator('#cove-picker').selectOption('orchard-landing');await idle(page);
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label','Orchard Landing');
  expect((await storage(page)).mastery).toBe(previousBest);
  await untouched(page,completeSeven);
  report(directory('780x320'),'production-rescue',{source:source.sha256,timeline,saved:await storage(page)});
});

test('actual scored Journey arrival advances only through Continue story after tide Undo',async({page})=>{
  const checkpoint=JSON.stringify({version:1,completed:[],acknowledgedScenes:['opening'],checkpoint:{kind:'cove',id:'holding-pier'}},null,2)+'\n';
  await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});
  await fixture(page,checkpoint);await page.goto('/');await activate(page,'home-play',true);await idle(page);
  let current=initial(holdingPier);const timeline=[current];
  for(const action of witness('holding-pier')){
    const before=current;
    current=await execute(page,holdingPier,action,current);
    if(before.turn===3){await undo(page,true);expect(await state(page)).toEqual(before);current=await execute(page,holdingPier,action,before);}
    timeline.push(current);
  }
  await arrivalResult(page,holdingPier,2,9,1);await expect(page.locator('#continue-story')).toHaveText(/Continue story/);
  await expect(page.locator('#continue-story')).toBeFocused();
  await arrivalFrame(page,'320x740','journey-two');
  await page.locator('#arrival-details summary').tap();await arrivalFrame(page,'320x740','details',true);await page.locator('#arrival-details summary').tap();
  expect((await storage(page)).journey).toBe(checkpoint);await unchangedAcceptance(page,null);
  await dismissAndReopen(page);await unchangedAcceptance(page,null);
  await tabTo(page,'continue-story');await page.keyboard.press('Enter');
  await expect(page.locator('#story-continue')).toBeVisible();
  const saved=await storage(page);expect(JSON.parse(saved.journey!).completed).toEqual(['holding-pier']);
  expect(JSON.parse(saved.journey!).checkpoint).toEqual({kind:'scene',id:'another-bell'});
  expect(JSON.parse(saved.mastery!).results['holding-pier@1']).toMatchObject({lanterns:2,actions:9,successfulUndos:1});
  expect(saved.masteryWrites).toBe(1);
  report(directory('320x740'),'journey-continue',{source:source.sha256,timeline,saved});
});

test('desktop confirmed Home accepts once and failed persistence remains visible without rewriting Journey',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  await fixture(page,completeSeven,undefined,true);await ready(page,'holding-pier');
  let current=initial(holdingPier);
  for(const action of witness('holding-pier'))current=await execute(page,holdingPier,action,current);
  await arrivalResult(page,holdingPier,3,9,0);await arrivalFrame(page,'desktop','three');
  await page.keyboard.press('Escape');await activate(page,'menu',true);await activate(page,'journey-return',true);
  await activate(page,'journey-return-cancel',true);await unchangedAcceptance(page,null);
  await activate(page,'return-arrival',true);await arrivalResult(page,holdingPier,3,9,0);
  await home(page,true);
  const saved=await storage(page);expect(saved.mastery).toBeNull();expect(saved.masteryWrites).toBe(1);
  await expect(page.locator('#home-surface, #home')).toHaveCount(1);
  await expect(page.locator('.mastery-notice')).toBeVisible();
  await untouched(page,completeSeven);
  report(directory('desktop'),'confirmed-home-storage-failure',{source:source.sha256,saved});
});

test('isolated six-neighbor renderer fits every native size and exposes storage failure clearly',async({page})=>{
  for(const [width,height] of [[390,844],[780,320],[320,740],[1440,900]]){
    await page.setViewportSize({width,height});
    await page.goto('/tests/e2e/arrival-bubble-fixture.html?cast=six');
    await expect(page.locator('#arrival-cast li')).toHaveCount(6);
    await expect(page.locator('#arrival-cast img[data-portrait-state=loaded]')).toHaveCount(6);
    expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
    await arrivalFrame(page,'fixtures',width+'x'+height+'-six');
    await page.locator('#arrival-details summary').tap();
    await arrivalFrame(page,'fixtures',width+'x'+height+'-six-details',true);
  }
  await page.setViewportSize({width:780,height:320});
  for(const lanterns of [3,2]){
    await page.goto('/tests/e2e/arrival-bubble-fixture.html?cast=six&notice=1&lanterns='+lanterns);
    await expect(page.locator('.arrival-storage-notice')).toBeVisible();
    await fullyVisible(page,page.locator('.arrival-storage-notice'),false);
    await arrivalFrame(page,'fixtures','780x320-storage-notice-'+lanterns);
    if(lanterns===2){
      await page.locator('#arrival-details summary').tap();
      await expect(page.locator('#mastery-best')).toContainText('3 of 3 lanterns');
      await page.locator('#mastery-best').scrollIntoViewIfNeeded();
      await fullyVisible(page,page.locator('#mastery-best'),false);
      await arrivalFrame(page,'fixtures','780x320-storage-notice-best-details',true);
    }
  }
  report(directory('fixtures'),'six-neighbor-source',{source:source.sha256,fixture:await page.evaluate(()=>(window as any).__ARRIVAL_FIXTURE__),scope:'Isolated pure arrival renderer; real Wide Berth level and required passenger IDs, synthetic won display state, no Session/game action/save owner.'});
});

test('isolated initial pending and failed portraits keep names and stable geometry',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>release=resolve);
  await page.route('**/beaver-brown.png',async route=>{await gate;await route.continue();});
  await page.route('**/deer-chestnut.png',route=>route.abort());
  await page.goto('/tests/e2e/arrival-bubble-fixture.html?cast=four',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-passenger-id=willow] img')).toHaveAttribute('data-portrait-state','pending');
  await expect(page.locator('[data-passenger-id=juniper] img')).toHaveAttribute('data-portrait-state','failed');
  await expect(page.locator('[data-passenger-id=willow] .arrival-portrait-fallback')).toBeVisible();
  await expect(page.locator('[data-passenger-id=juniper] .arrival-name')).toHaveText('Juniper');
  const before=await arrivalFrame(page,'fixtures','portrait-pending-failed');
  release();
  await expect(page.locator('[data-passenger-id=willow] img')).toHaveAttribute('data-portrait-state','loaded');
  const after=await arrivalFrame(page,'fixtures','portrait-loaded-failed');
  expect(after.bounds).toEqual(before.bounds);
  expect(await page.evaluate(()=>localStorage.getItem('last-ferry.mastery.v1'))).toBeNull();
  report(directory('fixtures'),'fallback',{source:source.sha256,before,after,scope:'Isolated renderer; requested beaver image held until explicit release, deer image deliberately aborted. Real names and reserved portrait boxes remain.'});
});

test('an actual loss keeps its original failure screen and Undo resumes play without celebration',async({page})=>{
  await page.setViewportSize({width:780,height:320});await page.emulateMedia({reducedMotion:'reduce'});
  await fixture(page,ongoing);await ready(page,'holding-pier');
  let current=initial(holdingPier);
  const timeline=[current];
  for(let turn=0;turn<4;turn++){current=await execute(page,holdingPier,{type:'wait'},current);timeline.push(current);}
  expect(current.status).toBe('lost');
  await expect(page.locator('#arrival-content')).toHaveCount(0);
  await expect(page.locator('.ending.loss')).toContainText('Undo earlier moves');
  await expect(page.locator('#dialog')).not.toHaveClass(/cove-surface--arrival/);
  await undo(page,true);expect(await state(page)).toEqual(timeline.at(-2));
  await unchangedAcceptance(page,null);await untouched(page,ongoing);
  report(directory('failure'),'undo',{source:source.sha256,timeline,saved:await storage(page)});
});

test('final minified real arrival keeps a storage read failure and expanded Details usable',async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:780,height:320});await page.emulateMedia({reducedMotion:'reduce'});
  const malformed='{unreadable-lantern-results';
  await fixture(page,completeSeven,malformed);await page.goto(productionURL+'/?cove=holding-pier');
  expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  const scripts=await page.locator('script[src]').evaluateAll(items=>items.map(item=>(item as HTMLScriptElement).src));
  let current=initial(holdingPier);const timeline=[current];
  for(const action of witness('holding-pier')){current=await execute(page,holdingPier,action,current,false);timeline.push(current);}
  await arrivalResult(page,holdingPier,3,9,0);
  await expect(page.locator('.arrival-storage-notice')).toContainText('could not be read');
  await fullyVisible(page,page.locator('.arrival-storage-notice'),false);
  await arrivalFrame(page,'production-final','780x320-storage-notice');
  await page.locator('#arrival-details summary').tap();
  await arrivalFrame(page,'production-final','780x320-storage-notice-details',true);
  await page.locator('#arrival-details summary').tap();
  await activate(page,'terminal-settings',true);await activate(page,'settings-back',true);
  await arrivalResult(page,holdingPier,3,9,0);
  await activate(page,'terminal-undo',true);await idle(page);
  await expect(page.locator('#arrival-content')).toBeHidden();
  await activate(page,'map-harbor',true);
  await expect(page.locator('#unload')).toBeVisible({timeout:5000});
  await untouched(page,completeSeven);await unchangedAcceptance(page,malformed);
  report(directory('production-final'),'read-failure-rescue',{source:source.sha256,scripts,timeline,saved:await storage(page)});
});
