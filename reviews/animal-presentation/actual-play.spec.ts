import {expect,test,type Page} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {initial} from '../../src/game/rules';
import {holdingPier} from '../../src/levels/level';
import {activate,idle,tabTo,undo} from '../../tests/e2e/ui';
import {directory,localView,report,snapshot,recordRescue} from '../../tests/e2e/large-cove-support';
import {candidate,execute,acceptedBest} from '../../tests/e2e/cove-eight-support';
import {fixture,ongoing,storage,witness,runtimeSource} from '../../tests/e2e/three-lanterns-support';
import {arrivalMeasure,arrivalResult} from '../../tests/e2e/arrival-bubble-support';

const phase=process.env.ANIMAL_PHASE??'after';
const before=phase==='before';
const portrait={width:390,height:844},landscape={width:780,height:320};
const holdingSave=JSON.stringify({version:1,completed:[],acknowledgedScenes:['opening'],checkpoint:{kind:'cove',id:'holding-pier'}},null,2)+'\n';
const derivedChecks=new WeakMap<Page,unknown[]>();
async function settle(page:Page){
  await page.evaluate(()=>Promise.all([...document.querySelectorAll<HTMLImageElement>('#dialog[open] img')].map(img=>img.decode().catch(()=>{}))));
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
}
async function shot(page:Page,name:string) {
  await settle(page);
  const view=page.viewportSize()!;
  if(!before&&phase!=='driver-check'&&phase!=='diagnostic'){
    const visible=await page.locator('#dialog[open] img.cove-portrait-image').evaluateAll(images=>images.map(image=>{
      const element=image as HTMLImageElement,box=element.getBoundingClientRect();
      return {profile:element.closest('#arrival-cast')?'arrival':'choice',appearance:element.closest<HTMLElement>('[data-appearance]')?.dataset.appearance,src:element.currentSrc,width:element.naturalWidth,height:element.naturalHeight,rect:box.toJSON()};
    }));
    for(const image of visible){
      const content=image.src.startsWith('data:')?Buffer.from(image.src.split(',')[1],'base64'):await(await page.request.get(image.src)).body();
      const hash=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
      const expected=hash(readFileSync('assets/portraits/'+image.profile+'/'+image.appearance+'.png'));
      expect(hash(content),name+' '+image.appearance+' must use '+image.profile).toBe(expected);
      expect([image.width,image.height]).toEqual([256,256]);
      derivedChecks.get(page)?.push({name,view,profile:image.profile,appearance:image.appearance,sha256:expected,rect:image.rect});
    }
  }
  await snapshot(page,directory(view.width+'x'+view.height),name);
}
async function captureBoth(page:Page,name:string,measure=false){
  for(const viewport of [portrait,landscape]){
    await page.setViewportSize(viewport);
    await shot(page,name);
    if(measure) report(directory(viewport.width+'x'+viewport.height),name+'-fit',await arrivalMeasure(page));
  }
  await page.setViewportSize(portrait);await settle(page);
}
async function closerDeck(page:Page,name:string){
  await activate(page,'view-zoom',true);
  for(let index=0;index<2;index++){
    await settle(page);
    if(!await page.locator('#zoom-in').isEnabled())break;
    await activate(page,'zoom-in',true);await page.waitForTimeout(220);
  }
  await page.keyboard.press('Escape');await settle(page);await shot(page,name+'-inspection');
}
async function buildIdentity(page:Page){
  const urls=await page.locator('head script[type=module][src],head link[rel=stylesheet][href]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')??node.getAttribute('href')!));
  const bundles=Object.fromEntries(await Promise.all(urls.map(async url=>[url,createHash('sha256').update(await (await page.request.get(url)).body()).digest('hex')])));
  if(before)expect(Object.values(bundles)).toContain('e720078df7235229fb334ad17331b371ce3fef8d5d9e4915257a64629fbfde55');
  return {phase,bundles,browser:page.context().browser()?.version(),node:process.version,dpr:await page.evaluate(()=>devicePixelRatio),when:new Date().toISOString()};
}
async function unchanged(page:Page,journey:string){
  expect(await storage(page)).toMatchObject({journey,mastery:acceptedBest,journeyWrites:0,masteryWrites:0});
}
async function sampledDraws(page:Page){
  return page.evaluate(async()=>{
    const gl=document.querySelector('canvas')!.getContext('webgl2')!;
    const modes:Record<string,number>={};
    let calls=0,triangles=0;
    const records:{calls:number;triangles:number;time:number}[]=[];
    const replace=(name:'drawArrays'|'drawElements'|'drawArraysInstanced'|'drawElementsInstanced')=>{
      const original=gl[name],element=name.includes('Elements'),instanced=name.includes('Instanced');
      Object.defineProperty(gl,name,{configurable:true,value:function(...args:number[]){
        calls++;modes[String(args[0])]=(modes[String(args[0])]??0)+1;
        const count=args[element?1:2],instances=instanced?args[element?4:3]:1;
        triangles+=instances*(args[0]===gl.TRIANGLES?count/3:args[0]===gl.TRIANGLE_STRIP||args[0]===gl.TRIANGLE_FAN?Math.max(count-2,0):0);
        return Reflect.apply(original,gl,args);
      }});
      return ()=>Reflect.deleteProperty(gl,name);
    };
    const restore=(['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'] as const).map(replace);
    try{
      for(let i=0;i<12;i++){
        const time=await new Promise<number>(resolve=>requestAnimationFrame(resolve));records.push({time,calls,triangles});calls=0;triangles=0;
      }
    }finally{restore.forEach(reset=>reset());}
    return {method:'Real WebGL2 draw calls between rAFs including shadow passes, drawArrays/Elements and instanced variants; partial first interval excluded.',records:records.slice(1),modes};
  });
}
const errors=new WeakMap<Page,string[]>();
test.beforeEach(({page})=>{const items:string[]=[];errors.set(page,items);derivedChecks.set(page,[]);page.on('pageerror',e=>items.push(e.message));});
test.afterEach(({page},info)=>{
  if(derivedChecks.get(page)?.length)report(directory('served-images'),info.title.split(':')[0].replaceAll(' ','-'),derivedChecks.get(page));
  expect(errors.get(page)).toEqual([]);
});

test('Holding Journey: matched Bring home and three-neighbor arrival through actual controls',async({page})=>{
  await fixture(page,holdingSave,acceptedBest);await page.goto('/');await activate(page,'home-play',true);await idle(page);
  const build=await buildIdentity(page);let current=initial(holdingPier);
  const actions=witness('holding-pier');
  for(const [index,action] of actions.entries()){
    if(index===3&&!before){
      await localView(page);await activate(page,'board',true);
      const commit=page.locator('#commit'),start=await commit.boundingBox();
      await tabTo(page,'passenger-rabbit-1');await page.keyboard.press('Space');
      await expect(page.locator('#passenger-rabbit-1')).toBeFocused();await expect(page.locator('#passenger-rabbit-2')).toHaveAttribute('aria-pressed','true');
      await expect(page.locator('#passenger-rabbit-2 [data-appearance]')).toHaveAttribute('data-appearance','rabbit-tan');
      await shot(page,'holding-board-rue');
      await page.keyboard.press('Tab');await page.keyboard.press('Space');await expect(commit).toBeDisabled();
      const empty=await commit.boundingBox();expect(Math.abs(start!.y-empty!.y)).toBeLessThanOrEqual(1);
      await expect(page.locator('[data-testid=turn]')).toHaveText('03');
      await page.keyboard.press('Escape');await expect(page.locator('#dialog')).not.toHaveAttribute('open','');
    }
    if(index===8){
      await localView(page);await activate(page,'unload',true);
      await expect(page.locator('.passenger-options button[aria-pressed=true]')).toHaveCount(3);
      await captureBoth(page,'holding-bring-home');
      await page.keyboard.press('Escape');
    }
    current=await execute(page,holdingPier,action,current,false);
    if(index===6)await shot(page,'holding-loaded-deck');
  }
  await arrivalResult(page,holdingPier,3,9,0);
  await captureBoth(page,'holding-everyone-home',true);
  await unchanged(page,holdingSave);
  if(!before){
    await page.setViewportSize({width:320,height:740});await shot(page,'holding-everyone-home');await arrivalMeasure(page);
    await page.setViewportSize({width:1440,height:900});await shot(page,'holding-everyone-home');await arrivalMeasure(page);
    await page.setViewportSize(landscape);await activate(page,'terminal-settings',true);
    await activate(page,'fullscreen',true);await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');
    expect(await page.evaluate(()=>document.fullscreenElement?.contains(document.querySelector('dialog[open]')))).toBe(true);
    await activate(page,'fullscreen',true);await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??null)).toBeNull();
    await activate(page,'settings-back',true);await page.keyboard.press('Escape');await unchanged(page,holdingSave);
    await activate(page,'menu',true);await activate(page,'return-arrival',true);await undo(page,true);
    await expect(page.locator('[data-testid=turn]')).toHaveText('08');
    await localView(page);await activate(page,'unload',true);await activate(page,'commit',true);await idle(page);
    await arrivalResult(page,holdingPier,2,9,1);await unchanged(page,holdingSave);
  }
  report(directory('runs'),'holding',{build,current,saved:await storage(page)});
});

test('Wide Berth: real five-body six-space ferry and temporary subset cards',async({page})=>{
  const {level,witnesses}=candidate('wide-berth');
  await fixture(page,ongoing,acceptedBest);await page.goto('/?cove=wide-berth');await idle(page);
  const build=await buildIdentity(page);let current=initial(level);
  for(const [index,action] of witnesses[1].actions.slice(0,10).entries()){
    current=await execute(page,level,action,current,false,index===2?async()=>{
      await shot(page,'wide-let-ashore-subset');
    }:undefined);
  }
  expect(current.aboard).toHaveLength(5);await localView(page);await settle(page);await shot(page,'wide-five-aboard');
  const draws=await sampledDraws(page);
  expect(draws.records.some(record=>record.calls>20&&record.triangles>200)).toBe(true);
  if(!before)await closerDeck(page,'wide-five-aboard');
  report(directory('runs'),'wide-five',{build,current,draws,saved:await storage(page)});
});

test('Driftwood: real small ferry with Nell and both rabbits',async({page})=>{
  const {level,witnesses}=candidate('driftwood-yard');
  await fixture(page,ongoing,acceptedBest);await page.goto('/?cove=driftwood-yard');await idle(page);
  const build=await buildIdentity(page);let current=initial(level);
  for(const action of witnesses[0].actions.slice(0,10))current=await execute(page,level,action,current,false);
  expect(current.aboard.slice().sort()).toEqual(['fern','nell','oat']);
  await localView(page);await shot(page,'driftwood-full-deck');
  if(!before) await closerDeck(page,'driftwood-full-deck');
  report(directory('runs'),'driftwood',{build,current});
});

test('Ternhaven: earlier Sedge, choice identity, free inspection, tide Undo and redelivery',async({page})=>{
  test.skip(before);
  const {level,witnesses}=candidate('ternhaven');
  await page.setViewportSize(landscape);await fixture(page,ongoing,acceptedBest);await page.goto('/?cove=ternhaven');await idle(page);
  const build=await buildIdentity(page);let current=initial(level);
  for(const action of witnesses[0].actions){
    const old=current;
    const chooser=old.turn===1?'ternhaven-let-ashore':old.turn===10?'ternhaven-board':old.turn===13?'ternhaven-bring-home':undefined;
    current=await execute(page,level,action,current,false,chooser?()=>shot(page,chooser):undefined);
    if(old.turn===0)await shot(page,'ternhaven-deck');
    if(current.delivered.includes('sedge')&&current.status==='playing')await expect(page.locator('#dialog[open][data-outcome=won]')).toHaveCount(0);
    if(current.tideLevel>old.tideLevel&&old.turn===3){
      await undo(page,true);await expect(page.locator('[data-testid=turn]')).toHaveText('03');
      await page.waitForTimeout(350);
      current=await execute(page,level,action,old,false);
    }
  }
  await arrivalResult(page,level,2,14,1);
  await captureBoth(page,'ternhaven-everyone-home',true);await unchanged(page,ongoing);
  report(directory('runs'),'ternhaven',{build,current,saved:await storage(page)});
});

test('uninterrupted crew transfer and arrival with runtime sound',async({page})=>{
  test.skip(phase!=='record');
  const source=runtimeSource();await page.emulateMedia({reducedMotion:'no-preference'});
  await fixture(page,holdingSave,acceptedBest);await page.goto('/');await activate(page,'home-play',true);await idle(page);
  await activate(page,'menu',true);await activate(page,'settings',true);
  await page.locator('#motion-preference').selectOption('reduced');await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  let current=initial(holdingPier);const actions=witness('holding-pier');
  for(const action of actions.slice(0,7))current=await execute(page,holdingPier,action,current,true);
  await activate(page,'menu',true);await activate(page,'settings',true);await page.locator('#motion-preference').selectOption('device');await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('data-motion','normal');
  const finish=await recordRescue(page,directory('390x844'),'final-arrival');
  try{
    current=await execute(page,holdingPier,actions[7],current,true);
    await localView(page);await activate(page,'unload',true);await page.locator('#passenger-rabbit-2').tap();
    await page.waitForTimeout(450);await page.locator('#passenger-rabbit-2').tap();
    await page.waitForTimeout(450);await activate(page,'commit',true);await idle(page);
    await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','won');
    await page.waitForTimeout(1400);await activate(page,'terminal-settings',true);await activate(page,'settings-back',true);await activate(page,'cancel',true);await page.waitForTimeout(650);
    await activate(page,'menu',true);await activate(page,'return-arrival',true);await page.waitForTimeout(900);
  }finally{await finish();}
  await arrivalResult(page,holdingPier,3,9,0);await unchanged(page,holdingSave);
  expect(runtimeSource().sha256).toBe(source.sha256);
  report(directory('runs'),'recording',{source,browser:page.context().browser()?.version(),node:process.version,
    beforeLastPassage:current,when:new Date().toISOString(),qualifier:'First seven actions through actual controls with Reduced; restored Follow device before starting uninterrupted final crossing, free subset inspection, final transfer, result/close/reopen.'});
});

test('interrupted direct unloading settles the three real models once and Undo restores Moss to her deck anchor',async({page})=>{
  test.skip(phase!=='record');
  await page.emulateMedia({reducedMotion:'no-preference'});await fixture(page,ongoing,acceptedBest);
  await page.goto('/?cove=holding-pier');await idle(page);
  if(!await page.locator('#unload').isVisible())await activate(page,'map-stone',true);
  await page.locator('#unload').evaluate(button=>{
    button.addEventListener('click',()=>queueMicrotask(()=>{
      const api=(window as any).__LAST_FERRY__;
      (window as any).__animalInterrupted=api.getRenderStatus().pendingAnimation;
      Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));
    }),{once:true});
  });
  await activate(page,'unload',true);await idle(page);
  expect(await page.evaluate(()=>(window as any).__animalInterrupted)).toBe(true);
  const observed=()=>page.evaluate(()=>{
    const api=(window as any).__LAST_FERRY__;return {state:api.getState(),render:api.getRenderStatus(),transition:api.getTransitionStatus()};
  });
  const interrupted=await observed();expect(interrupted.state.turn).toBe(1);expect(interrupted.render.historyLength).toBe(1);
  expect(interrupted.render.passengers.map((p:{id:string})=>p.id).sort()).toEqual(['rabbit-1','rabbit-2','sheep-1']);
  expect(interrupted.render.passengers.every((p:{parent:string})=>!p.parent.startsWith('deck-anchor'))).toBe(true);
  await undo(page,true);const recovered=await observed();expect(recovered.state).toEqual(initial(holdingPier));
  expect(recovered.render.passengers.find((p:{id:string})=>p.id==='sheep-1').parent).toBe('deck-anchor-sheep-1');
  expect(recovered.render.passengers.map((p:{id:string})=>p.id).sort()).toEqual(['rabbit-1','rabbit-2','sheep-1']);
  await expect(page.locator('#dialog[open] .cove-choice')).toHaveCount(0);await unchanged(page,ongoing);
  report(directory('runs'),'interruption',{qualifier:'Trusted direct unload; visibility change simulated in a microtask during the real transfer. Ordinary Undo through controls.',interrupted,recovered});
});
