import { expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Level } from '../../src/levels/level';
import { passengerName } from '../../src/levels/level';
import { resolvePassengerAppearance } from '../../src/game/passenger-appearance';
import { runtimeSource, storage } from './three-lanterns-support';
import { directory, report, snapshot } from './large-cove-support';
import { activate, fullyVisible, idle } from './ui';

export const recordArrival = process.env.LAST_FERRY_ARRIVAL_RECORD === '1';
export const previousBest = JSON.stringify({version:1,results:{
  'orchard-landing@1':{coveId:'orchard-landing',revision:1,actions:13,successfulUndos:0,lanterns:3},
  'ternhaven@1':{coveId:'ternhaven',revision:1,actions:14,successfulUndos:0,lanterns:3}
}});
export function arrivalSource(){
  const base=runtimeSource();
  return {...base,tests:Object.fromEntries(['tests/e2e/arrival-bubble.spec.ts','tests/e2e/arrival-bubble-support.ts','tests/e2e/arrival-bubble-fixture.html','tests/e2e/cove-eight-support.ts','tests/e2e/three-lanterns-support.ts','tests/e2e/large-cove-support.ts','tests/e2e/ui.ts','playwright.config.ts'].map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]))};
}
export async function arrivalResult(page:Page,level:Level,lanterns:number,actions:number,undos:number){
  await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','won');
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-lanterns',String(lanterns));
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-actions',String(actions));
  await expect(page.locator('#mastery-result')).toHaveAttribute('data-undos',String(undos));
  await expect(page.locator('.arrival-lanterns')).toHaveAccessibleName('This rescue · '+lanterns+' of 3 lanterns');
  await expect(page.locator('.arrival-lantern[data-lit=true]')).toHaveCount(lanterns);
  await expect(page.locator('.arrival-lantern')).toHaveCount(3);
  await expect(page.locator('.mastery-metrics')).toHaveCount(1);
  await expect(page.locator('.mastery-metrics')).toHaveText(actions+' actions · '+undos+' '+(undos===1?'Undo':'Undos'));
  await expect(page.locator('.arrival-heading')).toContainText(level.title);
  const ids=await page.locator('#arrival-cast li').evaluateAll(items=>items.map(item=>(item as HTMLElement).dataset.passengerId));
  expect(ids).toEqual(level.objective.requiredPassengerIds);
  for(const id of ids as string[]){
    const tile=page.locator('#arrival-cast [data-passenger-id="'+id+'"]');
    await expect(tile).toHaveAttribute('data-appearance',resolvePassengerAppearance(level,id)!.portraitKey!);
    await expect(tile.locator('.arrival-name')).toHaveText(passengerName(id,level));
    await expect(tile.locator('img')).toHaveAttribute('data-portrait-state','loaded');
    await expect(tile.locator('button,input')).toHaveCount(0);
  }
  for(const id of ['terminal-restart','terminal-undo','terminal-settings','cancel'])await fullyVisible(page,page.locator('#'+id));
  await expect(page.locator('#terminal-restart')).toHaveAccessibleName('Replay crossing');
  await fullyVisible(page,page.locator('#continue-story, #next-cove, #choose-cove'));
  await expect(page.locator('#terminal-restart [data-icon]')).toHaveAttribute('data-icon','replay');
  await expect(page.locator('#terminal-undo [data-icon]')).toHaveAttribute('data-icon','undo');
}
export async function arrivalMeasure(page:Page,expanded=false){
  const measured=await page.evaluate(()=>{
    const dialog=document.querySelector<HTMLDialogElement>('#dialog')!;
    const api=(window as any).__LAST_FERRY__;
    const v=visualViewport;
    const safe=api?.getViewportStatus?.().safe??{left:(v?.offsetLeft??0)+8,top:(v?.offsetTop??0)+8,right:(v?.offsetLeft??0)+(v?.width??innerWidth)-8,bottom:(v?.offsetTop??0)+(v?.height??innerHeight)-8};
    const bounds=dialog.getBoundingClientRect();
    const failures:string[]=[];
    const all=[dialog,...dialog.querySelectorAll<HTMLElement>('*')];
    for(const el of all){
      const style=getComputedStyle(el),b=el.getBoundingClientRect();
      const closed=el.closest('details:not([open])');
      if(closed&&!el.closest('summary')&&closed!==el)continue;
      if(el.matches('button > .cove-label') && style.clipPath==='inset(50%)')continue;
      if(!b.width||!b.height||style.display==='inline'||style.visibility==='hidden'||el.closest('.sr-only'))continue;
      if(el.clientWidth>0&&el.scrollWidth>el.clientWidth+1)failures.push((el.id||el.className)+': horizontal overflow');
    }
    const labels=[...dialog.querySelectorAll<HTMLElement>('.arrival-name,.arrival-heading h2,.arrival-heading p,.arrival-actions .cove-label,.mastery-metrics')].map(el=>{
      const b=el.getBoundingClientRect(), range=document.createRange();range.selectNodeContents(el);
      const container=el.closest('.arrival-cast li, .arrival-actions button, .arrival-overview')??dialog;
      const limit=container.getBoundingClientRect(),rects=[...range.getClientRects()];
      const fit=rects.every(r=>r.left>=limit.left-.5&&r.right<=limit.right+.5&&r.top>=bounds.top-.5&&r.bottom<=bounds.bottom+.5);
      return{text:el.textContent,font:getComputedStyle(el).fontSize,fit,rect:b.toJSON(),textRects:rects.map(r=>r.toJSON()),container:limit.toJSON()};
    });
    const controls=[...dialog.querySelectorAll<HTMLElement>('.arrival-actions button,.arrival-utilities button,.arrival-close')].map(el=>{const rect=el.getBoundingClientRect(),hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);return{id:el.id,rect:rect.toJSON(),centerHit:!!hit&&(hit===el||el.contains(hit))};});
    const crown=[...dialog.querySelectorAll<SVGElement>('.arrival-lantern')].map(el=>el.getBoundingClientRect().toJSON());
    const content=document.getElementById('dialog-content')!;
    return{viewport:[innerWidth,innerHeight],safe,bounds:bounds.toJSON(),failures,labels,controls,crown,wholeScroll:{client:content.clientHeight,scroll:content.scrollHeight},canvasCount:document.querySelectorAll('canvas').length};
  });
  expect(measured.failures).toEqual([]);
  expect(measured.labels.every(label=>label.fit)).toBe(true);
  expect(Math.abs((measured.bounds.left+measured.bounds.right)/2-(measured.safe.left+measured.safe.right)/2)).toBeLessThanOrEqual(1.5);
  expect(Math.abs((measured.bounds.top+measured.bounds.bottom)/2-(measured.safe.top+measured.safe.bottom)/2)).toBeLessThanOrEqual(1.5);
  expect(measured.bounds.left).toBeGreaterThanOrEqual(measured.safe.left-.5);
  expect(measured.bounds.top).toBeGreaterThanOrEqual(measured.safe.top-.5);
  expect(measured.bounds.right).toBeLessThanOrEqual(measured.safe.right+.5);
  expect(measured.bounds.bottom).toBeLessThanOrEqual(measured.safe.bottom+.5);
  for(const crown of measured.crown){
    expect(crown.top).toBeGreaterThanOrEqual(measured.safe.top-.5);
    expect(crown.bottom).toBeLessThanOrEqual(measured.safe.bottom+.5);
    expect(crown.width).toBeGreaterThanOrEqual(40);
  }
  for(const control of measured.controls){
    expect(control.centerHit,control.id+' center must remain interactive').toBe(true);
    expect(control.rect.height).toBeGreaterThanOrEqual(44);
    expect(control.rect.top).toBeGreaterThanOrEqual(measured.bounds.top-.5);
    expect(control.rect.bottom).toBeLessThanOrEqual(measured.bounds.bottom+.5);
  }
  if(!expanded)expect(measured.wholeScroll.scroll).toBeLessThanOrEqual(measured.wholeScroll.client+1);
  return measured;
}
export async function arrivalFrame(page:Page,folder:string,name:string,expanded=false){
  if(!recordArrival)await snapshot(page,directory(folder),name);
  const measured=await arrivalMeasure(page,expanded);
  report(directory(folder),name+'-fit',measured);
  return measured;
}
export async function dismissAndReopen(page:Page){
  await page.keyboard.press('Escape');
  await expect(page.locator('#dialog')).not.toHaveAttribute('open','');
  await expect(page.locator('#app')).not.toHaveClass(/arrival-open/);
  await activate(page,'menu',true);
  await activate(page,'return-arrival',true);
}
export const arrivalRuntime=(page:Page)=>page.evaluate(()=>{
  const api=(window as any).__LAST_FERRY__;
  return{state:api.getState(),mastery:api.getMasteryStatus(),homecoming:api.getHomecomingStatus(),audio:api.getAudioStatus(),frame:api.getFrameStatus(),celebration:document.getElementById('arrival-content')?.dataset.celebrationId,animations:document.getAnimations().map(a=>({state:a.playState,id:a.id}))};
});
export async function unchangedAcceptance(page:Page,expected:string|null){
  const value=await storage(page);
  expect(value.mastery).toBe(expected);expect(value.masteryWrites).toBe(0);
}
export async function nextStoryToPlay(page:Page){
  for(let count=0;count<4&&await page.locator('#story-continue').isVisible();count++){
    await activate(page,'story-continue',true);
    await page.waitForTimeout(80);
  }
  await idle(page);
}
