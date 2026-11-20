import { test, expect, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { draft, initial, load, preview, type State, type Action } from '../../../src/game/rules';
import { nodeName, passengerName, type Level } from '../../../src/levels/level';
import { candidate } from '../../../tests/e2e/cove-eight-support';
import { activate, fullyVisible, idle, undo } from '../../../tests/e2e/ui';
import { checkTurn, directory, localView, recordRescue, report, snapshot, transferStart } from '../../../tests/e2e/large-cove-support';
import { runtimeSource } from '../../../tests/e2e/three-lanterns-support';
import { checkWon, hash, listenToOutput, servedBuild } from '../../lantern-reach-difficulty/play/controls';

const prototype = process.env.LAST_FERRY_PILOT === '1';

async function observe(page: Page, level: Level, state: State) {
  await idle(page);
  await checkTurn(page,state,prototype);
  if (state.status === 'playing') {
    await expect(page.locator('#map-'+state.boatNodeId)).toHaveAttribute('aria-current','location');
    await expect(page.locator('.gauge-load')).toContainText('Load '+load(state,level)+'/6');
    await expect(page.locator('.gauge-water')).toContainText('Needs depth '+draft(state,level));
    await expect(page.locator('.gauge-goal')).toContainText(state.delivered.length+'/'+level.passengers.length+' home');
  }
}

async function inspect(page: Page, id: string, level: Level, state: State) {
  const marker = page.locator('#map-'+id+' .map-hit');
  const inReach = await marker.evaluate(el=>{
    const box=el.getBoundingClientRect();
    return !el.closest('.offscreen') && el.contains(document.elementFromPoint(box.x+box.width/2, box.y+box.height/2));
  });
  if (inReach) await marker.tap();
  else {
    await activate(page,'load-toggle',true);
    if(id==='harbor') await activate(page,'find-home',true);
    else {
      const index=page.locator('#place-index');
      if (!await index.evaluate(el=>(el as HTMLDetailsElement).open)) await index.locator('summary').tap();
      await index.locator('[data-inspect-place="'+id+'"]').tap();
    }
  }
  await expect(page.locator('#local-context')).toHaveAttribute('data-location',id);
  await expect(page.locator('#sail')).toHaveAccessibleName(new RegExp(nodeName(id,level)));
  await fullyVisible(page,page.locator('#sail'));
  await observe(page,level,state);
  return (await page.locator('#local-context .depth-reading').innerText()).replaceAll('\n',' ');
}

for(const [width,height] of [[390,844],[780,320]]) {
  test('Last Ferry playable pickup and homecoming at '+width+'x'+height,async({page,browser})=>{
    const { level,witnesses }=candidate('last-ferry');
    const portrait=width===390;
    const detour=prototype || !portrait;
    const plan=witnesses[detour ? 1 : 0];
    const out=directory(width+'x'+height);
    const source=runtimeSource();
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:portrait?'no-preference':'reduce'});
    const film=portrait && !prototype && process.env.LAST_FERRY_FILM!=='0';
    if(film) await listenToOutput(page);
    const errors:string[]=[];
    const events:{name:string;turn:number;epochMs:number}[]=[];
    const frames:Record<string,unknown>={};
    const readings:{turn:number;to:string;text:string}[]=[];
    const openingRosters:Record<string,string>={};
    let homewardForecast='';
    const event=async(name:string,turn:number)=>{
      events.push({name,turn,epochMs:await page.evaluate(()=>performance.timeOrigin+performance.now())});
    };
    const shot=async(name:string)=>{
      await snapshot(page,out,name);
      if(prototype){
        frames[name]=await page.evaluate(()=>{
          const game=(window as any).__LAST_FERRY__;
          const {boat,lantern,lighthouse,passengers,nodes,view}=game.getFrameStatus();
          const controls=Array.from(document.querySelectorAll<HTMLElement>('#dock-actions button, #load-toggle, #status-toggle,.tools button,.view-controls > button'))
            .filter(b=>b.offsetWidth).map(b=>({id:b.id,rect:b.getBoundingClientRect().toJSON()}));
          return {boat,lantern,lighthouse,passengers,nodes,view,controls};
        });
      }
    };
    page.on('pageerror',e=>errors.push(e.message));
    if(portrait){
      await page.goto('/');
      await activate(page,'home-practice',true);
      await expect(page.locator('[data-practice]')).toHaveCount(13);
      await activate(page,'practice-last-ferry',true);
    }else{
      await page.goto('/?cove=last-ferry');
    }
    await expect(page.locator('#seascape')).toHaveAttribute('aria-label','Last Ferry');
    const build = prototype ? null : await servedBuild(page);
    expect(await page.evaluate(()=>localStorage.getItem('last-ferry-tips'))).toBeNull();
    const readStorage=()=>page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)
      .filter(([key])=>key.startsWith('last-ferry.journey') || key.startsWith('last-ferry.mastery'))));
    const saved=await readStorage();
    let state=initial(level);
    const states=[state];
    let undos=0;
    await observe(page,level,state);
    await page.waitForTimeout(600);
    let finish: (()=>Promise<void>)|undefined;
    if(film){
      await expect.poll(()=>page.evaluate(()=>(window as any).__lastFerryMonitoredContext?.state)).toBe('running');
      finish=await recordRescue(page,out,'final-arrival',true);
    }
    const play=async(a:Action,label:string,capture:boolean)=>{
      const result=preview(state,a,level);
      expect(result.error).toBeNull();
      const full=state.aboard.length===level.passengers.length;
      await event(label+' · '+a.type+(a.type==='move'?' to '+a.to:''),state.turn);
      if(a.type==='move'){
        const text=await inspect(page,a.to,level,state);
        readings.push({turn:state.turn,to:a.to,text});
        if(capture && state.turn===0) await shot('02-first-passage');
        if(capture && full && a.to==='harbor') {
          await page.waitForTimeout(350);
          await shot('05-harbor-passage');
          await event('Last approach begins',state.turn);
        }
        await activate(page,'sail',true);
        if(capture && portrait && full && a.to==='harbor'){
          await expect(page.locator('#seascape')).toHaveAttribute('aria-busy','true');
          await page.waitForTimeout(940);
          await expect(page.locator('#seascape')).toHaveAttribute('aria-busy','true',{timeout:150});
          await shot('06-last-approach');
          await page.waitForTimeout(500);
          if(!prototype && await page.locator('#seascape').getAttribute('aria-busy')==='true')
            await shot('06b-channel-light');
        }
      } else if(a.type==='board' || a.type==='unload'){
        await transferStart(page,a,async()=>{
          if(capture && a.type==='board' && state.aboard.length===0) await shot('03-first-pickup');
          if(capture && full && a.type==='unload') {
            await expect(page.locator('.cove-choice[aria-pressed=true]')).toHaveCount(level.passengers.length);
            for(const id of state.aboard) {
              const tile=page.locator('#passenger-'+id);
              await expect(tile).toHaveAttribute('aria-pressed','true');
              await expect(tile).toContainText(passengerName(id,level));
            }
            await fullyVisible(page,page.locator('#commit'));
            await shot('08-bring-home');
          }
        });
      }else{
        await activate(page,a.type,true); await activate(page,'commit',true);
      }
      state=result.state;
      await observe(page,level,state);
      if(state.status==='playing') await localView(page);
      if(capture && a.type==='board' && state.aboard.length===level.passengers.length){
        await page.waitForTimeout(1850);
        homewardForecast=await page.locator('#status-toggle').innerText();
        if(!prototype) expect(homewardForecast).toContain('No more tide rises.');
        await event('All neighbors safely aboard',state.turn);
        await shot('04-full-deck');
      }
      if(capture && full && a.type==='move' && a.to==='harbor'){
        await page.waitForTimeout(650);
        await event('Harbor docked, waiting for captain',state.turn);
        await shot('07-docked');
        expect(state.delivered).toEqual([]);
      }
    };
    try{
      await shot('01-opening');
      if(!prototype && !portrait){
        for(const pier of level.piers.filter(p=>state.waitingByPier[p.id]?.length)){
          await inspect(page,pier.nodeId,level,state);
          await activate(page,'location-details',true);
          const facts=page.locator('#location-facts');
          await expect(facts).toBeVisible();
          for(const who of state.waitingByPier[pier.id]) await expect(facts).toContainText(passengerName(who,level));
          openingRosters[pier.nodeId]=await facts.innerText();
          await activate(page,'close-location',true);
          await observe(page,level,state);
        }
      }
      for(const action of plan.actions){
        if(detour && state.turn===2 && state.boatNodeId==='quilt'){
          const text=await inspect(page,'lace',level,state);
          await expect(page.locator('#sail')).toBeDisabled();
          await expect(page.locator('#local-context .depth-reading')).toHaveAttribute('data-needed','3');
          await expect(page.locator('#local-context .depth-reading')).toHaveAttribute('data-water','2');
          readings.push({turn:state.turn,to:'lace',text});
          await shot('03b-loaded-cut');
          await activate(page,'close-location',true);
        }
        const before=state;
        await play(action,'Captain commits',true);
        if(!portrait && !undos && state.tideLevel>before.tideLevel){
          await undo(page,true); undos++;
          state=before; await observe(page,level,state);
          await event('Undo through first rise',state.turn);
          await play(action,'Captain repeats after Undo',false);
        }
        states.push(state);
      }
      await checkWon(page,level,state,undos);
      await expect(page.locator('#arrival-cast img[data-portrait-state=loaded]')).toHaveCount(level.passengers.length);
      await event('All ashore',state.turn);
      await shot('09-arrival');
      if(finish){
        await page.waitForTimeout(900);
        const stop=finish; finish=undefined; await stop();
      }
      await undo(page,true);
      state=states.at(-2)!; undos++;
      await observe(page,level,state);
      expect(state.aboard.length).toBe(level.passengers.length);
      await play(plan.actions.at(-1)!,'Redelivery',false);
      await checkWon(page,level,state,undos);
      expect(await readStorage()).toEqual(saved); expect(errors).toEqual([]);
      const now=runtimeSource();
      if(!prototype) expect(now.sha256).toBe(source.sha256);
      const runner=Object.fromEntries(['reviews/last-ferry/play/config.ts','reviews/last-ferry/play/crossing.spec.ts','reviews/lantern-reach-difficulty/play/controls.ts','tests/e2e/cove-eight-support.ts','tests/e2e/ui.ts','tests/e2e/large-cove-support.ts','tests/e2e/three-lanterns-support.ts'].map(p=>[p,hash(readFileSync(p))]));
      report(directory('source'),source.sha256,{...source,runner,build});
      const images=Object.fromEntries(readdirSync(out).filter(f=>f.endsWith('.png')).map(name=>{
        const bytes=readFileSync(out+'/'+name);
        expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)]).toEqual([width,height]);
        return [name,hash(bytes)];
      }));
      report(out,'run',{level:level.id,entry:portrait?'Home → Practice':'?cove=last-ferry',stage:prototype?'working development prototype':'minified release',
        source:source.sha256,endSource:now.sha256,build,node:process.version,browser:browser.version(),viewport:[width,height],motion:portrait?'normal':'reduced',tips:'default off',
        route:plan.id,actions:plan.actions,states,events,readings,openingRosters,homewardForecast,undos,terminalRedelivery:true,saved,errors,images});
      if(prototype) {report(out,'projections',frames); report(out,'level',level);}
    }finally{if(finish) await finish();}
  });
}

