# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: arrival-bubble.spec.ts >> actual scored Journey arrival advances only through Continue story after tide Undo
- Location: tests\e2e\arrival-bubble.spec.ts:131:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "cove-label: horizontal overflow",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - region "The Holding Pier" [ref=e4]:
      - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=e6]
      - button "0 of 4 spaces · boat needs depth 1 · crossing status":
        - generic: 0/4 · Depth 1
      - navigation "Crossing controls":
        - button "Undo"
        - button "Wait · 1 action" [disabled]:
          - generic: Wait
        - button "Menu"
        - button "Mute sound"
      - navigation "Cove view":
        - button "Whole cove"
        - button "Adjust map zoom":
          - generic: Zoom
    - status [ref=e7]: Pip, Rue and Moss home · 1 action used. Needs depth 3 → 1. 9 actions completed. Everyone is safely home.
  - dialog [ref=e8]:
    - region [ref=e10]:
      - button "Close arrival" [ref=e11] [cursor=pointer]
      - generic [ref=e12]:
        - img "This rescue · 2 of 3 lanterns"
        - generic [ref=e13]:
          - heading "Everyone home." [level=2] [ref=e14]
          - paragraph [ref=e15]: The Holding Pier
      - list "Rescued neighbors" [ref=e16]:
        - listitem [ref=e17]:
          - generic [ref=e19]: Pip
        - listitem [ref=e20]:
          - generic [ref=e22]: Rue
        - listitem [ref=e23]:
          - generic [ref=e25]: Moss
      - region "This rescue" [ref=e26]:
        - paragraph [ref=e27]: 9 actions · 1 Undo
      - generic [ref=e28]:
        - button "Continue story" [active] [ref=e29] [cursor=pointer]
        - button "Replay crossing" [ref=e30] [cursor=pointer]:
          - generic: Replay
      - generic [ref=e31]:
        - button "Undo last action" [ref=e32] [cursor=pointer]:
          - generic: Undo
        - group [ref=e33]:
          - generic "Details" [ref=e34] [cursor=pointer]
        - button "Settings" [ref=e36] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, type Page } from '@playwright/test';
  2   | import { createHash } from 'node:crypto';
  3   | import { readFileSync } from 'node:fs';
  4   | import type { Level } from '../../src/levels/level';
  5   | import { passengerName } from '../../src/levels/level';
  6   | import { resolvePassengerAppearance } from '../../src/game/passenger-appearance';
  7   | import { runtimeSource, storage } from './three-lanterns-support';
  8   | import { directory, report, snapshot } from './large-cove-support';
  9   | import { activate, fullyVisible, idle } from './ui';
  10  |
  11  | export const recordArrival = process.env.LAST_FERRY_ARRIVAL_RECORD === '1';
  12  | export const previousBest = JSON.stringify({version:1,results:{
  13  |   'orchard-landing@1':{coveId:'orchard-landing',revision:1,actions:13,successfulUndos:0,lanterns:3},
  14  |   'ternhaven@1':{coveId:'ternhaven',revision:1,actions:14,successfulUndos:0,lanterns:3}
  15  | }});
  16  | export function arrivalSource(){
  17  |   const base=runtimeSource();
  18  |   return {...base,tests:Object.fromEntries(['tests/e2e/arrival-bubble.spec.ts','tests/e2e/arrival-bubble-support.ts','tests/e2e/arrival-bubble-fixture.html','tests/e2e/cove-eight-support.ts','tests/e2e/three-lanterns-support.ts','tests/e2e/large-cove-support.ts','tests/e2e/ui.ts','playwright.config.ts'].map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]))};
  19  | }
  20  | export async function arrivalResult(page:Page,level:Level,lanterns:number,actions:number,undos:number){
  21  |   await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','won');
  22  |   await expect(page.locator('#mastery-result')).toHaveAttribute('data-lanterns',String(lanterns));
  23  |   await expect(page.locator('#mastery-result')).toHaveAttribute('data-actions',String(actions));
  24  |   await expect(page.locator('#mastery-result')).toHaveAttribute('data-undos',String(undos));
  25  |   await expect(page.locator('.arrival-lanterns')).toHaveAccessibleName('This rescue · '+lanterns+' of 3 lanterns');
  26  |   await expect(page.locator('.arrival-lantern[data-lit=true]')).toHaveCount(lanterns);
  27  |   await expect(page.locator('.arrival-lantern')).toHaveCount(3);
  28  |   await expect(page.locator('.mastery-metrics')).toHaveCount(1);
  29  |   await expect(page.locator('.mastery-metrics')).toHaveText(actions+' actions · '+undos+' '+(undos===1?'Undo':'Undos'));
  30  |   await expect(page.locator('.arrival-heading')).toContainText(level.title);
  31  |   const ids=await page.locator('#arrival-cast li').evaluateAll(items=>items.map(item=>(item as HTMLElement).dataset.passengerId));
  32  |   expect(ids).toEqual(level.objective.requiredPassengerIds);
  33  |   for(const id of ids as string[]){
  34  |     const tile=page.locator('#arrival-cast [data-passenger-id="'+id+'"]');
  35  |     await expect(tile).toHaveAttribute('data-appearance',resolvePassengerAppearance(level,id)!.portraitKey!);
  36  |     await expect(tile.locator('.arrival-name')).toHaveText(passengerName(id,level));
  37  |     await expect(tile.locator('img')).toHaveAttribute('data-portrait-state','loaded');
  38  |     await expect(tile.locator('button,input')).toHaveCount(0);
  39  |   }
  40  |   for(const id of ['terminal-restart','terminal-undo','terminal-settings','cancel'])await fullyVisible(page,page.locator('#'+id));
  41  |   await fullyVisible(page,page.locator('#continue-story, #next-cove, #choose-cove'));
  42  |   await expect(page.locator('#terminal-restart [data-icon]')).toHaveAttribute('data-icon','replay');
  43  |   await expect(page.locator('#terminal-undo [data-icon]')).toHaveAttribute('data-icon','undo');
  44  | }
  45  | export async function arrivalMeasure(page:Page,expanded=false){
  46  |   const measured=await page.evaluate(()=>{
  47  |     const dialog=document.querySelector<HTMLDialogElement>('#dialog')!;
  48  |     const api=(window as any).__LAST_FERRY__;
  49  |     const v=visualViewport;
  50  |     const safe=api?.getViewportStatus?.().safe??{left:(v?.offsetLeft??0)+8,top:(v?.offsetTop??0)+8,right:(v?.offsetLeft??0)+(v?.width??innerWidth)-8,bottom:(v?.offsetTop??0)+(v?.height??innerHeight)-8};
  51  |     const bounds=dialog.getBoundingClientRect();
  52  |     const failures:string[]=[];
  53  |     const all=[dialog,...dialog.querySelectorAll<HTMLElement>('*')];
  54  |     for(const el of all){
  55  |       const style=getComputedStyle(el),b=el.getBoundingClientRect();
  56  |       const closed=el.closest('details:not([open])');
  57  |       if(closed&&!el.closest('summary')&&closed!==el)continue;
  58  |       if(!b.width||!b.height||style.display==='inline'||style.visibility==='hidden'||el.closest('.sr-only'))continue;
  59  |       if(el.clientWidth>0&&el.scrollWidth>el.clientWidth+1)failures.push((el.id||el.className)+': horizontal overflow');
  60  |     }
  61  |     const labels=[...dialog.querySelectorAll<HTMLElement>('.arrival-name,.arrival-heading h2,.arrival-heading p,.arrival-actions .cove-label,.mastery-metrics')].map(el=>{
  62  |       const b=el.getBoundingClientRect(), range=document.createRange();range.selectNodeContents(el);
  63  |       const container=el.closest('.arrival-cast li, .arrival-actions button, .arrival-overview')??dialog;
  64  |       const limit=container.getBoundingClientRect(),rects=[...range.getClientRects()];
  65  |       const fit=rects.every(r=>r.left>=limit.left-.5&&r.right<=limit.right+.5&&r.top>=bounds.top-.5&&r.bottom<=bounds.bottom+.5);
  66  |       return{text:el.textContent,font:getComputedStyle(el).fontSize,fit,rect:b.toJSON(),textRects:rects.map(r=>r.toJSON()),container:limit.toJSON()};
  67  |     });
  68  |     const controls=[...dialog.querySelectorAll<HTMLElement>('.arrival-actions button,.arrival-utilities button,.arrival-close')].map(el=>({id:el.id,rect:el.getBoundingClientRect().toJSON()}));
  69  |     const crown=[...dialog.querySelectorAll<SVGElement>('.arrival-lantern')].map(el=>el.getBoundingClientRect().toJSON());
  70  |     const content=document.getElementById('dialog-content')!;
  71  |     return{viewport:[innerWidth,innerHeight],safe,bounds:bounds.toJSON(),failures,labels,controls,crown,wholeScroll:{client:content.clientHeight,scroll:content.scrollHeight},canvasCount:document.querySelectorAll('canvas').length};
  72  |   });
> 73  |   expect(measured.failures).toEqual([]);
      |                             ^ Error: expect(received).toEqual(expected) // deep equality
  74  |   expect(measured.labels.every(label=>label.fit)).toBe(true);
  75  |   expect(Math.abs((measured.bounds.left+measured.bounds.right)/2-(measured.safe.left+measured.safe.right)/2)).toBeLessThanOrEqual(1.5);
  76  |   expect(Math.abs((measured.bounds.top+measured.bounds.bottom)/2-(measured.safe.top+measured.safe.bottom)/2)).toBeLessThanOrEqual(1.5);
  77  |   expect(measured.bounds.left).toBeGreaterThanOrEqual(measured.safe.left-.5);
  78  |   expect(measured.bounds.top).toBeGreaterThanOrEqual(measured.safe.top-.5);
  79  |   expect(measured.bounds.right).toBeLessThanOrEqual(measured.safe.right+.5);
  80  |   expect(measured.bounds.bottom).toBeLessThanOrEqual(measured.safe.bottom+.5);
  81  |   for(const crown of measured.crown){
  82  |     expect(crown.top).toBeGreaterThanOrEqual(measured.safe.top-.5);
  83  |     expect(crown.bottom).toBeLessThanOrEqual(measured.safe.bottom+.5);
  84  |     expect(crown.width).toBeGreaterThanOrEqual(40);
  85  |   }
  86  |   for(const control of measured.controls){
  87  |     expect(control.rect.height).toBeGreaterThanOrEqual(44);
  88  |     expect(control.rect.top).toBeGreaterThanOrEqual(measured.bounds.top-.5);
  89  |     expect(control.rect.bottom).toBeLessThanOrEqual(measured.bounds.bottom+.5);
  90  |   }
  91  |   if(!expanded)expect(measured.wholeScroll.scroll).toBeLessThanOrEqual(measured.wholeScroll.client+1);
  92  |   return measured;
  93  | }
  94  | export async function arrivalFrame(page:Page,folder:string,name:string,expanded=false){
  95  |   if(!recordArrival)await snapshot(page,directory(folder),name);
  96  |   const measured=await arrivalMeasure(page,expanded);
  97  |   report(directory(folder),name+'-fit',measured);
  98  |   return measured;
  99  | }
  100 | export async function dismissAndReopen(page:Page){
  101 |   await page.keyboard.press('Escape');
  102 |   await expect(page.locator('#dialog')).not.toHaveAttribute('open','');
  103 |   await expect(page.locator('#app')).not.toHaveClass(/arrival-open/);
  104 |   await activate(page,'menu',true);
  105 |   await activate(page,'return-arrival',true);
  106 | }
  107 | export const arrivalRuntime=(page:Page)=>page.evaluate(()=>{
  108 |   const api=(window as any).__LAST_FERRY__;
  109 |   return{state:api.getState(),mastery:api.getMasteryStatus(),homecoming:api.getHomecomingStatus(),audio:api.getAudioStatus(),frame:api.getFrameStatus(),celebration:document.getElementById('arrival-content')?.dataset.celebrationId,animations:document.getAnimations().map(a=>({state:a.playState,id:a.id}))};
  110 | });
  111 | export async function unchangedAcceptance(page:Page,expected:string|null){
  112 |   const value=await storage(page);
  113 |   expect(value.mastery).toBe(expected);expect(value.masteryWrites).toBe(0);
  114 | }
  115 | export async function nextStoryToPlay(page:Page){
  116 |   for(let count=0;count<4&&await page.locator('#story-continue').isVisible();count++){
  117 |     await activate(page,'story-continue',true);
  118 |     await page.waitForTimeout(80);
  119 |   }
  120 |   await idle(page);
  121 | }
  122 |
  123 |
```
