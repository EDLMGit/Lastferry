import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { initial, preview, type Action, type State } from '../../src/game/rules';
import { nodeName, passengerName, type Level } from '../../src/levels/level';
import { directory, localView, recordRescue, report, checkTurn } from '../../tests/e2e/large-cove-support';
import { activate, fullyVisible, idle, state, undo, wholeCove } from '../../tests/e2e/ui';
import { fixture, storage, runtimeSource, home } from '../../tests/e2e/three-lanterns-support';
import { candidate, execute, startCheck, capture, acceptedBest, completeSeven, seven, sevenScenes } from '../../tests/e2e/cove-eight-support';
import { measurePanel } from '../../tests/e2e/cove-panel-measure';
import { measurePortraits } from '../../tests/e2e/portrait-measure';
import { snapshot } from '../../tests/e2e/large-cove-support';
import { arrivalMeasure } from '../../tests/e2e/arrival-bubble-support';
const id='drowned-orchard';
const completedEight=JSON.stringify({version:1,completed:[...seven,'ternhaven'],acknowledgedScenes:[...sevenScenes,'ternhaven-wave'],checkpoint:{kind:'complete'}},null,2)+'\n';
const pendingScene=JSON.stringify({version:1,completed:seven,acknowledgedScenes:sevenScenes,checkpoint:{kind:'scene',id:'ternhaven-wave'}},null,2)+'\n';
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
const withMovie=process.env.C9_RECORD!=='0';
async function monitor(page:Page){
  await page.addInitScript(()=>{
    const connect=AudioNode.prototype.connect;
    AudioNode.prototype.connect=function(this:AudioNode,...args:unknown[]){
      const result=Reflect.apply(connect,this,args);
      if(args[0]===this.context.destination){
        const context=this.context as AudioContext,tap=context.createMediaStreamDestination();
        Reflect.apply(connect,this,[tap]);Object.assign(window,{__lastFerryOutputMonitor:tap.stream,__lastFerryMonitoredContext:context});
      }
      return result;
    } as typeof connect;
  });
}
function snapshotSource(){
  const {inputs,sha256,head}=runtimeSource();
  const tests=Object.fromEntries(['reviews/cove-nine-practice/gameplay.spec.ts','reviews/cove-nine-practice/gameplay.config.ts','tests/e2e/cove-eight-support.ts','tests/e2e/arrival-bubble-support.ts','tests/e2e/three-lanterns-support.ts','tests/e2e/large-cove-support.ts','tests/e2e/ui.ts'].map(p=>[p,sha(readFileSync(p))]));
  return {inputs,sha256,head,tests};
}
async function release(page:Page){
  const urls=await page.locator('head script[type=module][src],head link[rel=stylesheet][href]').evaluateAll(els=>els.map(e=>e.getAttribute('src')??e.getAttribute('href')!));
  expect(urls.some(u=>/assets\/index-.+\.js$/.test(u))).toBe(true);
  expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  const bundles=Object.fromEntries(await Promise.all(urls.map(async url=>[url,sha(await (await page.request.get(url)).body())])));
  for(const [p,v] of Object.entries(bundles))expect(v).toBe(sha(readFileSync('dist/'+p.replace(/^\.?\//,''))));
  return bundles;
}
async function checkProfiles(page:Page,profile:'choice'|'arrival'){
  const images=await page.locator('#dialog[open] img.cove-portrait-image').evaluateAll(async els=>Promise.all(els.map(async e=>{
    const im=e as HTMLImageElement;await im.decode();return {key:e.closest<HTMLElement>('[data-appearance]')!.dataset.appearance!,src:im.currentSrc,size:[im.naturalWidth,im.naturalHeight]};
  })));
  for(const im of images){expect(im.size).toEqual([256,256]);expect(sha(await(await page.request.get(im.src)).body())).toBe(sha(readFileSync('assets/portraits/'+profile+'/'+im.key+'.png')));}
  return images;
}
async function unscored(page:Page,level:Level,actions:number,undos:number){
  await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','won');
  await expect(page.locator('.arrival-unrated')).toHaveText('Rescued · no lantern rating');
  await expect(page.locator('#mastery-result,.arrival-lantern')).toHaveCount(0);
  await expect(page.locator('.arrival-result')).toHaveAttribute('data-actions',String(actions));
  await expect(page.locator('.arrival-result')).toHaveAttribute('data-undos',String(undos));
  await expect(page.locator('.arrival-name')).toHaveText(level.objective.requiredPassengerIds.map(i=>passengerName(i,level)));
  expect((await checkProfiles(page,'arrival')).length).toBe(level.passengers.length);
  await fullyVisible(page,page.locator('#choose-cove'));
}
async function filmStart(page:Page){
  await expect.poll(()=>page.evaluate(()=>(window as any).__lastFerryMonitoredContext?.state)).toBe('running');
  return recordRescue(page,directory('390x844'),'final-arrival',true);
}
const errors=new WeakMap<Page,string[]>();
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message));});
test.afterEach(({page})=>expect(errors.get(page)).toEqual([]));
for(const [width,height,n] of [[390,844,0],[780,320,1]]){
  test('Actual release rescue strategy '+(n+1)+' at '+width+'x'+height,async({page,browser})=>{
    const {level,witnesses}=candidate(id),witness=witnesses[n],source=snapshotSource(),size=width+'x'+height,raw=n===0?completedEight:completeSeven;
    await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:n===0?'no-preference':'reduce'});
    if(n===0)await monitor(page);
    await fixture(page,raw,acceptedBest);
    if(n===0)await page.goto('/?cove='+id);
    else{await page.goto('/');await activate(page,'home-practice',true);await expect(page.locator('[data-practice]')).toHaveCount(10);await activate(page,'practice-'+id,true);}
    await startCheck(page,level,false);
    const build=await release(page);
    const saved=await storage(page);
    expect(saved).toMatchObject({journey:raw,mastery:acceptedBest,journeyWrites:0,masteryWrites:0});
    await capture(page,size,'start-play');
    await wholeCove(page,true);
    for(const node of level.nodes){await expect(page.locator('#map-'+node.id)).toHaveAccessibleName(new RegExp(nodeName(node.id,level)));await fullyVisible(page,page.locator('#map-'+node.id+' .map-hit'));}
    await capture(page,size,'start-overview');await localView(page);
    await activate(page,'status-toggle',true);
    const edge=level.edges.find(e=>e.current)!;
    for(const [i,rise] of level.rules.tide.rises.entries()){
      const phase=edge.current!.phases.find(p=>p.tideLevel===rise.level)!;
      await expect(page.locator('.current-schedule li').nth(i)).toContainText('After action '+rise.afterTurn+' · '+nodeName(phase.from,level)+' → '+nodeName(phase.to,level)+' · depth '+(edge.baseDepth+rise.level));
    }
    await capture(page,size,'forecast');await activate(page,'cancel',true);
    const timeline:State[]=[initial(level)];
    let undos=0,sawChoice=false,sawChanged=false,finish:(()=>Promise<void>)|undefined;
    try{
      for(const [i,action] of witness.actions.entries()){
        const prev=timeline.at(-1)!;
        if(n===0 && withMovie && i===3)finish=await filmStart(page);
        const next=await execute(page,level,action,prev,false,async()=>{
          if(!sawChoice && i===(n===0?3:0) && (action.type==='board'||action.type==='unload')){
            expect((await checkProfiles(page,'choice')).length).toBeGreaterThan(0);
            const panel=await page.evaluate(measurePanel),portraits=await page.evaluate(measurePortraits);
            expect(panel.failures).toEqual([]);for(const c of portraits.choices)expect(c.imageContained&&c.checkContained&&!c.checkOverlapsPortrait).toBe(true);
            await fullyVisible(page,page.locator('#commit'));await snapshot(page,directory(size),'passenger-decision');report(directory(size),'passenger-decision-fit',{panel,portraits});sawChoice=true;
          }
        });
        if(next.tideLevel>prev.tideLevel&&!sawChanged){
          await localView(page);await capture(page,size,'changed-reach');
          if(n===1){await undo(page,true);await checkTurn(page,prev,false);undos++;await page.waitForTimeout(350);await execute(page,level,action,prev,false);}
          sawChanged=true;
        }
        if(next.turn===9){await localView(page);await capture(page,size,'final-current-position');}
        timeline.push(next);
      }
      expect(sawChoice).toBe(true);expect(sawChanged).toBe(true);
      await unscored(page,level,witness.actions.length,undos);
      await capture(page,size,'arrival');
      report(directory(size),'arrival-bounds',await arrivalMeasure(page));
      if(finish){await page.waitForTimeout(750);const end=finish;finish=undefined;await end();}
      await page.locator('#arrival-details summary').tap();await expect(page.locator('.arrival-detail-body')).toContainText('Playtest · no lantern rating.');await page.locator('#arrival-details summary').tap();
      await undo(page,true);undos++;
      await checkTurn(page,timeline.at(-2)!,false);
      await execute(page,level,witness.actions.at(-1)!,timeline.at(-2)!,false);
      await unscored(page,level,witness.actions.length,undos);
      await capture(page,size,'redelivery');
    }finally{if(finish)await finish();}
    await activate(page,'terminal-restart',true);await startCheck(page,level,false);
    await home(page);await page.reload();expect(await storage(page)).toEqual(saved);
    expect(snapshotSource().sha256).toBe(source.sha256);
    report(directory('source'),source.sha256,{...source,browser:browser.version(),node:process.version,os:process.platform,dpr:1,emulation:'Chromium touch, SwiftShader',when:new Date().toISOString()});
    report(directory(size),'actual-route',{source:source.sha256,build,strategy:witness.id,timeline,tideUndo:n===1,terminalUndo:true,returnedUnchanged:await storage(page),errors:errors.get(page),stateMethod:'Production previews compared with visible turn, tide, terminal dialog and actual native choices/arrival. Release has no debug state API.'});
  });
}
test('Tempting legal branch, actual Undo recovery and second rescue',async({page})=>{
  const {level,witnesses}=candidate(id),source=snapshotSource(),raw=pendingScene;
  const alt=JSON.parse(readFileSync('data/'+id+'/witnesses.json','utf8')).losingAlternatives[0] as {id:string;actions:Action[];firstNoWinningContinuationTurn:number;recoveryToTurn:number;recoveryWitness:string};
  const winner=witnesses.find(w=>w.id===alt.recoveryWitness)!;
  expect(winner).toBeTruthy();
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  await fixture(page,raw,acceptedBest);await page.goto((process.env.C9_DEV??'http://127.0.0.1:5361')+'/?cove='+id);
  await startCheck(page,level,true);const saved=await storage(page);
  const chain=[initial(level)];
  for(const [i,step]of alt.actions.entries()){
    const next=await execute(page,level,step,chain.at(-1)!,true);
    chain.push(next);
    if(i+1===alt.firstNoWinningContinuationTurn){await localView(page);await capture(page,'recovery','first-irrecoverable-choice');}
  }
  expect(chain.at(-1)!.status).not.toBe('won');
  await capture(page,'recovery','failed-plan');
  for(let i=alt.actions.length;i>alt.recoveryToTurn;i--){await undo(page,true);await checkTurn(page,chain[i-1],true);}
  await localView(page);await capture(page,'recovery','rewound-decision');
  let now=await state(page);
  const expected=winner.actions.slice(0,alt.recoveryToTurn).reduce((s,a)=>preview(s,a,level).state,initial(level));
  await checkTurn(page,expected,true);
  await page.waitForTimeout(350);
  for(const step of winner.actions.slice(alt.recoveryToTurn))now=await execute(page,level,step,now,true);
  await unscored(page,level,winner.actions.length,alt.actions.length-alt.recoveryToTurn);
  await capture(page,'recovery','rescued');expect(await storage(page)).toEqual(saved);
  expect(snapshotSource().sha256).toBe(source.sha256);
  report(directory('recovery'),'actual-undo',{source:source.sha256,branch:alt.id,timeline:chain,recoveryFrom:chain.at(-1),restored:chain[alt.recoveryToTurn],winner:winner.id,final:now,saved});
});
