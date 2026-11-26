import {test, expect, type Page} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {initial} from '../../src/game/rules';
import {activate,idle,undo,wholeCove} from '../../tests/e2e/ui';
import {directory,localView,report,snapshot,recordRescue} from '../../tests/e2e/large-cove-support';
import {fixture,storage,completed,runtimeSource} from '../../tests/e2e/three-lanterns-support';
import {candidate,execute,seven,sevenScenes} from '../../tests/e2e/cove-eight-support';
import {arrivalMeasure,arrivalResult} from '../../tests/e2e/arrival-bubble-support';

const practiceBest: string = JSON.parse(readFileSync('reviews/arrival-bubble/390x844/replay-accepted.json','utf8')).saved.mastery;
const orchardBoundary = JSON.stringify({version:1,completed,acknowledgedScenes:sevenScenes,checkpoint:{kind:'cove',id:'orchard-landing'}},null,2)+'\n';
const destination='ternhaven-wave';
const hash=(buf:Buffer)=>createHash('sha256').update(buf).digest('hex');
const clip=process.env.TERN_RECORD!=='0';
const folder='390x844';
async function saved(page:Page){return JSON.parse((await storage(page)).journey!);}
async function shot(page:Page,name:string){await snapshot(page,directory(folder),name);}
async function profiles(page:Page,kind:'choice'|'arrival',name:string){
  const images=await page.locator('#dialog[open] img.cove-portrait-image').evaluateAll(async imgs=>Promise.all(imgs.map(async node=>{
    const img=node as HTMLImageElement;await img.decode();return {key:img.closest<HTMLElement>('[data-appearance]')!.dataset.appearance!,src:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight};
  })));
  expect(images.length).toBeGreaterThan(1);
  for(const image of images){
    expect(image.width).toBe(256);expect(image.height).toBe(256);
    expect(hash(await (await page.request.get(image.src)).body())).toBe(hash(readFileSync('assets/portraits/'+kind+'/'+image.key+'.png')));
  }
  await shot(page,name);return images;
}
async function monitor(page:Page){
  await page.addInitScript(()=>{
    const connect=AudioNode.prototype.connect;
    AudioNode.prototype.connect=function(this:AudioNode,...args:unknown[]){
      const result=Reflect.apply(connect,this,args);
      if(args[0]===this.context.destination){
        const context=this.context as AudioContext, tap=context.createMediaStreamDestination();
        Reflect.apply(connect,this,[tap]);
        Object.assign(window,{__lastFerryOutputMonitor:tap.stream,__lastFerryMonitoredContext:context});
      }
      return result;
    } as typeof connect;
  });
}
test('Orchard to Ternhaven to the accepted eighth cove, real controls on minified production',async({page,browser})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const source=runtimeSource(), orchard=candidate('orchard-landing'),tern=candidate('ternhaven');
  await page.emulateMedia({reducedMotion:'reduce'});await monitor(page);await fixture(page,orchardBoundary,practiceBest);
  await page.goto('/');await activate(page,'home-play',true);await idle(page);
  const bundleURLs=await page.locator('head script[type=module][src],head link[rel=stylesheet][href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')??n.getAttribute('href')!));
  expect(bundleURLs.some(url=>/assets\/index-.*\.js$/.test(url))).toBe(true);
  const build=Object.fromEntries(await Promise.all(bundleURLs.map(async path=>[path,hash(await(await page.request.get(path)).body())])));
  expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  await expect(page.locator('#seascape')).toHaveAttribute('aria-label',orchard.level.title);
  let orchardState=initial(orchard.level);
  for(const step of orchard.witnesses[0].actions)orchardState=await execute(page,orchard.level,step,orchardState,false);
  await arrivalResult(page,orchard.level,3,12,0);
  expect(await storage(page)).toMatchObject({journey:orchardBoundary,mastery:practiceBest,journeyWrites:0,masteryWrites:0});
  await shot(page,'orchard-provisional');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(page.locator('html')).toHaveAttribute('data-motion','normal');
  await expect.poll(()=>page.evaluate(()=>(window as any).__lastFerryMonitoredContext?.state)).toBe('running');
  const observations:Record<string,unknown>={source:source.sha256,build,orchardState};
  const finish=clip?await recordRescue(page,directory(folder),'final-arrival',true):undefined;
  try{
    await activate(page,'continue-story',true);
    await expect(page.locator('#story-continue')).toHaveText('Continue to Ternhaven');
    expect(await saved(page)).toMatchObject({checkpoint:{kind:'scene',id:destination},completed:seven,acknowledgedScenes:sevenScenes});
    const pending=await storage(page);
    expect(pending.masteryWrites).toBe(1);expect(pending.journeyWrites).toBe(1);
    await expect(page.locator('#story-pause')).toBeDisabled({timeout:15000});
    await shot(page,'wave-held');
    expect(await storage(page)).toEqual(pending);
    await activate(page,'story-continue',true);await idle(page);
    const active=await storage(page);
    expect(await saved(page)).toMatchObject({checkpoint:{kind:'cove',id:tern.level.id},completed:seven,acknowledgedScenes:[...sevenScenes,destination]});
    expect(active.mastery).toBe(pending.mastery);
    let current=initial(tern.level);
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label',tern.level.title);
    await expect(page.locator('#undo')).toBeDisabled();
    await expect(page.locator('#map-'+current.boatNodeId)).toHaveAttribute('aria-current','location');
    await expect(page.locator('[data-testid=turn]')).toHaveText('00');await expect(page.locator('[data-testid=tide]')).toHaveText(String(current.tideLevel));
    await expect(page.locator('#load-toggle')).toContainText('6/6');
    await shot(page,'ternhaven-handoff');
    const facts:Record<string,string>={};
    await wholeCove(page,true);
    for(const id of ['fork','high','low','reeds','harbor']){
      await page.locator('#map-'+id+' .map-hit').tap();await expect(page.locator('#local-context')).toHaveAttribute('data-location',id);
      facts[id]=await page.locator('#location-facts').textContent()??'';
      await activate(page,'close-location',true);
    }
    for(const id of current.aboard)expect(facts.fork).toContain(tern.level.names!.passengers[id]);
    for(const node of tern.level.nodes.filter(n=>n.pierId)){
      const waiting=current.waitingByPier[node.pierId!];
      for(const entry of tern.level.passengers)expect(facts[node.id].includes(tern.level.names!.passengers[entry.id]+' waits')).toBe(waiting.includes(entry.id));
    }
    expect(await storage(page)).toEqual(active);
    observations.handoff={productionInitial:current,actualLocationFacts:facts,saved:active};
    const timeline=[current],shots:unknown[]=[];
    for(const step of tern.witnesses[0].actions){
      const prev=current;
      const chooser=prev.turn===1?'let-ashore':prev.turn===10?'board':prev.turn===13?'bring-home':undefined;
      current=await execute(page,tern.level,step,current,false,chooser?async()=>{shots.push(await profiles(page,'choice',chooser))}:undefined);
      if(prev.turn===3){
        expect(current.tideLevel).toBeGreaterThan(prev.tideLevel);
        await undo(page,true);await expect(page.locator('[data-testid=tide]')).toHaveText(String(prev.tideLevel));
        await expect(page.locator('[data-testid=turn]')).toHaveText('03');await page.waitForTimeout(400);
        current=await execute(page,tern.level,step,prev,false);
      }
      timeline.push(current);
      if(current.delivered.includes('sedge')&&current.status==='playing')await expect(page.locator('#dialog[data-outcome=won][open]')).toHaveCount(0);
    }
    await arrivalResult(page,tern.level,2,14,1);
    await activate(page,'cancel',true);await activate(page,'menu',true);await activate(page,'return-arrival',true);
    await page.locator('#arrival-details summary').tap();await page.locator('#arrival-details summary').tap();
    expect(await storage(page)).toEqual(active);
    await undo(page,true);await expect(page.locator('[data-testid=turn]')).toHaveText('13');
    await execute(page,tern.level,tern.witnesses[0].actions.at(-1)!,timeline.at(-2)!,false);
    await arrivalResult(page,tern.level,2,14,2);expect(await storage(page)).toEqual(active);
    const figures=await profiles(page,'arrival','ternhaven-arrival');
    expect(figures).toHaveLength(4);const bounds=await arrivalMeasure(page);
    await expect(page.locator('.arrival-best-note')).toContainText('better');
    observations.ternhaven={expectedStatesValidatedAgainstTurnTideAndControls:timeline,choices:shots,figures,bounds,storageBeforeAccept:active};
    await activate(page,'continue-story',true);await expect(page.locator('#dialog[open]')).toContainText(/eight coves are safe/i);
    await page.waitForTimeout(600);await shot(page,'eight-cove-endpoint');
    expect(await saved(page)).toEqual({version:1,completed:[...seven,'ternhaven'],acknowledgedScenes:[...sevenScenes,destination],checkpoint:{kind:'complete'}});
    const final=await storage(page);
    expect(final.mastery).toBe(active.mastery);expect(final.journeyWrites).toBe(active.journeyWrites+1);
    observations.complete=final;
  }finally{if(finish)await finish();}
  await page.reload();await expect(page.locator('.home-notice')).toContainText(/eight coves are safe/i);
  expect(await storage(page)).toEqual(observations.complete);
  expect(JSON.parse((await storage(page)).mastery!).results['ternhaven@1']).toEqual(JSON.parse(practiceBest).results['ternhaven@1']);
  await shot(page,'eight-cove-home-reload');expect(errors).toEqual([]);
  expect(runtimeSource().sha256).toBe(source.sha256);
  report(directory('source'),source.sha256,{...source,browser:browser.version(),node:process.version,dpr:1,when:new Date().toISOString(),build,method:'Native 390x844 touch emulation, SwiftShader, minified Vite; no dev API. Before camera recording, Orchard used device Reduced Motion. Normal Motion from Orchard result through end of capture. Source includes raw bytes as tested on Windows.'});
  report(directory(folder),'route',{...observations,reloaded:await storage(page),errors});
});
