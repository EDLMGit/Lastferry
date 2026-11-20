import {expect,test,type Page} from '@playwright/test';
import {initial, type Action} from '../../src/game/rules';
import {drownedOrchard, orchardLanding} from '../../src/levels/level';
import {execute} from '../../tests/e2e/cove-eight-support';
import {runtimeSource} from '../../tests/e2e/three-lanterns-support';
import {directory, report, snapshot, localView} from '../../tests/e2e/large-cove-support';
import {idle, wholeCove, state} from '../../tests/e2e/ui';
import {readFileSync} from 'node:fs';
const plans=JSON.parse(readFileSync('data/drowned-orchard/witnesses.json','utf8'));

const surface = async(page:Page) => page.evaluate(()=>{
  const api=(window as any).__LAST_FERRY__, env=api.getEnvironmentStatus(), frame=api.getFrameStatus();
  return {waterY:env.waterY, shader:env.waterUniformY, shoreWater:env.shores.waterY,
    islands:env.shores.islands.map(({id,mode,surfaceY,contactVisible}:any)=>({id,mode,surfaceY,contactVisible})),
    passengers:frame.passengers,boat:frame.boat,lighthouse:frame.lighthouse,
    nodes:frame.nodes,landmarks:frame.pickTargets.filter((p:any)=>p.kind==='landmark')};
});
for(const [width,height] of [[390,844],[780,320]]) test('Actual Orchard landmarks and supported shores '+width+'x'+height,async({page,browser})=>{
  await page.setViewportSize({width,height});
  const dir=directory(width+'x'+height), source=runtimeSource(), observations:any[]=[];
  for(const level of [orchardLanding,drownedOrchard]){
    await page.goto('/?cove='+level.id);
    await idle(page);
    expect(await state(page)).toEqual(initial(level));
    await snapshot(page,dir,level.id+'-play');
    await wholeCove(page,true);
    await snapshot(page,dir,level.id+'-whole');
    const check=async()=>{
      const s=await state(page), view=await surface(page);
      expect(view.waterY).toBeCloseTo(s.tideLevel*level.world.waterYPerTideLevel,6);
      expect(view.shader).toBeCloseTo(view.waterY,6);expect(view.shoreWater).toBeCloseTo(view.waterY,6);
      for(const p of level.piers){
        const shore=view.islands.find((i:any)=>i.id===p.islandId);
        expect(shore.surfaceY).toBeCloseTo(p.elevation*0.18-0.005,6);
        expect(shore.mode==='submerged').toBe(s.tideLevel>=p.elevation);
        expect(shore.contactVisible).toBe(s.tideLevel<p.elevation);
        if(s.waitingByPier[p.id].length)expect(shore.mode).not.toBe('submerged');
      }
      observations.push({level:level.id,turn:s.turn,tide:s.tideLevel,view});
    };
    await check();
    if(level===drownedOrchard&&width===390){
      await localView(page);let s=initial(level);
      for(const a of (plans.witnesses[0].actions as Action[]).slice(0,level.rules.tide.rises.at(-1)!.afterTurn)){
        s=await execute(page,level,a,s,true);
        if(level.rules.tide.rises.some(r=>r.afterTurn===s.turn))await check();
      }
      await wholeCove(page,true);await snapshot(page,dir,'drowned-orchard-high-water');
    }
  }
  report(dir,'surfaces',{source:source.sha256,head:source.head,chromium:browser.version(),node:process.version,observations});
});
