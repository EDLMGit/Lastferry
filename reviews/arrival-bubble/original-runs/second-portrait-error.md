# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: arrival-bubble.spec.ts >> portrait Ternhaven celebrates all four rescues and keeps lifecycle provisional through Undo and Replay
- Location: tests\e2e\arrival-bubble.spec.ts:22:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('#arrival-content')
Expected: 0
Received: 1
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" locator('#arrival-content') with timeout 10000ms
  - waiting for locator('#arrival-content')
    23 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Ternhaven" [ref=e4]:
    - generic "Ternhaven. Use the labeled waypoint controls to navigate." [ref=e6]
    - button "6 of 6 spaces · boat needs depth 4 · crossing status" [ref=e7] [cursor=pointer]:
      - generic: 6/6 · Depth 4
    - navigation "Crossing controls" [ref=e8]:
      - button "Undo" [active] [ref=e9] [cursor=pointer]
      - button "Wait · 1 action" [ref=e10] [cursor=pointer]:
        - generic: Wait
      - button "Menu" [ref=e11] [cursor=pointer]
      - button "Mute sound" [ref=e12] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; current location; Home, delivery destination":
          - generic [ref=e13] [cursor=pointer]
          - generic [ref=e15] [cursor=pointer]: Harbor
      - generic:
        - button "Select Tern Buoy; adjacent, against the current":
          - generic [aria-hidden] [ref=e18] [cursor=pointer]: ×
          - generic [ref=e19] [cursor=pointer]: Tern Buoy
      - generic:
        - button "Select High Bank; no direct passage":
          - generic [aria-hidden] [ref=e22] [cursor=pointer]: ◇
          - generic [ref=e23] [cursor=pointer]: High Bank
      - generic:
        - button "Select Tern Steps; no direct passage":
          - generic:
            - generic [aria-hidden]: ◇
          - generic: Tern Steps
      - generic:
        - button "Select Reed Landing; no direct passage":
          - generic:
            - generic [aria-hidden]: ◇
          - generic: Reed Landing
    - navigation "Passenger actions at Harbor" [ref=e25]:
      - generic [ref=e26]: At Harbor
      - button "Bring home" [ref=e27] [cursor=pointer]
    - button "Tern Reach flows from Tern Buoy to Harbor. It stays this way. Open reef and tide forecast." [ref=e28] [cursor=pointer]:
      - strong [ref=e30]: Tern Reach to Harbor only
    - navigation "Cove view" [ref=e31]:
      - button "Whole cove" [ref=e32] [cursor=pointer]
      - button "Adjust map zoom" [ref=e33] [cursor=pointer]:
        - generic: Zoom
  - status [ref=e34]: Undid action. 13 actions completed.
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { readFileSync } from 'node:fs';
  3   | import { initial, type State } from '../../src/game/rules';
  4   | import { holdingPier, levelNames } from '../../src/levels/level';
  5   | import { activate, fullyVisible, idle, ready, state, tabTo, undo } from './ui';
  6   | import { directory, localView, recordRescue, report } from './large-cove-support';
  7   | import { candidate, execute, acceptedBest, completeSeven } from './cove-eight-support';
  8   | import { fixture, home, ongoing, storage, untouched, witness } from './three-lanterns-support';
  9   | import { productionURL } from './evidence';
  10  | import { arrivalFrame, arrivalMeasure, arrivalResult, arrivalRuntime, arrivalSource, dismissAndReopen, nextStoryToPlay, previousBest, recordArrival, unchangedAcceptance } from './arrival-bubble-support';
  11  |
  12  | test.use({hasTouch:true,isMobile:true,deviceScaleFactor:1,video:'off'});
  13  | test.setTimeout(420000);
  14  | let source:ReturnType<typeof arrivalSource>;
  15  | let errors:string[];
  16  | test.beforeEach(({page,browser})=>{
  17  |   errors=[];page.on('pageerror',error=>errors.push(error.message));source=arrivalSource();
  18  |   report(directory('source'),source.sha256,{...source,browser:browser.version(),node:process.version,os:process.platform,dpr:1,when:new Date().toISOString()});
  19  | });
  20  | test.afterEach(()=>{expect(errors).toEqual([]);expect(arrivalSource()).toEqual(source);});
  21  |
  22  | test('portrait Ternhaven celebrates all four rescues and keeps lifecycle provisional through Undo and Replay',async({page})=>{
  23  |   const {level,witnesses}=candidate('ternhaven');
  24  |   await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});
  25  |   await fixture(page,ongoing,acceptedBest);await ready(page,'ternhaven');
  26  |   let current=initial(level), finish:(()=>Promise<void>)|undefined;
  27  |   const timeline:State[]=[current];
  28  |   try{
  29  |     for(const [index,action] of witnesses[0].actions.entries()){
  30  |       if(recordArrival&&index===11)finish=await recordRescue(page,directory('390x844'),'arrival');
  31  |       current=await execute(page,level,action,current);timeline.push(current);
  32  |       if(current.delivered.includes('sedge')&&current.status==='playing'){
  33  |         await expect(page.locator('#arrival-content')).toHaveCount(0);
  34  |         await expect(page.locator('#dialog[data-outcome=won][open]')).toHaveCount(0);
  35  |       }
  36  |     }
  37  |     await arrivalResult(page,level,3,14,0);
  38  |     await expect(page.locator('#choose-cove')).toBeFocused();
  39  |     await page.keyboard.press('Shift+Tab');await expect(page.locator('#cancel')).toBeFocused();
  40  |     await page.keyboard.press('Tab');await expect(page.locator('#choose-cove')).toBeFocused();
  41  |     await unchangedAcceptance(page,acceptedBest);
  42  |     const first=await arrivalRuntime(page);
  43  |     const fit=await arrivalFrame(page,'390x844','three-lanterns');
  44  |     await page.waitForTimeout(400);
  45  |     const steady=await arrivalMeasure(page);
  46  |     expect(Math.abs(fit.bounds.x-steady.bounds.x)+Math.abs(fit.bounds.y-steady.bounds.y)+Math.abs(fit.bounds.height-steady.bounds.height)).toBeLessThanOrEqual(1);
  47  |     await expect(page.locator('#app')).toHaveClass(/arrival-open/);
  48  |     expect(await page.locator('#transfer-receipt').evaluate(el=>getComputedStyle(el).opacity)).toBe('0');
  49  |     await page.locator('#arrival-details summary').tap();
  50  |     await arrivalFrame(page,'390x844','details',true);
  51  |     await page.locator('#arrival-details summary').tap();
  52  |     await tabTo(page,'terminal-settings');await page.keyboard.press('Enter');
  53  |     await expect(page.locator('#tips-preference')).toHaveValue('off');
  54  |     await page.keyboard.press('Escape');await expect(page.locator('#terminal-settings')).toBeFocused();
  55  |     await activate(page,'choose-cove',true);await unchangedAcceptance(page,acceptedBest);
  56  |     await page.keyboard.press('Escape');await activate(page,'menu',true);await activate(page,'return-arrival',true);
  57  |     await activate(page,'cancel',true);await unchangedAcceptance(page,acceptedBest);
  58  |     await activate(page,'menu',true);await activate(page,'return-arrival',true);
  59  |     await dismissAndReopen(page);
  60  |     await arrivalResult(page,level,3,14,0);
  61  |     if(!recordArrival){
  62  |       await page.setViewportSize({width:780,height:320});
  63  |       await arrivalFrame(page,'lifecycle','rotated');
  64  |       await activate(page,'terminal-settings',true);
  65  |       await page.locator('#fullscreen').scrollIntoViewIfNeeded();await activate(page,'fullscreen',true);
  66  |       await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');
  67  |       expect(await page.evaluate(()=>document.fullscreenElement!.contains(document.getElementById('dialog')))).toBe(true);
  68  |       await activate(page,'fullscreen',true);await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??null)).toBeNull();
  69  |       await activate(page,'settings-back',true);await arrivalResult(page,level,3,14,0);
  70  |       await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  71  |       await page.waitForTimeout(100);
  72  |       await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  73  |       await page.setViewportSize({width:390,height:844});
  74  |     }
  75  |     const reopened=await arrivalRuntime(page);
  76  |     expect(reopened.celebration).toBe(first.celebration);
  77  |     expect(reopened.homecoming.celebrations).toBe(first.homecoming.celebrations);
  78  |     expect(reopened.audio.arrivalEventCount).toBe(first.audio.arrivalEventCount);
  79  |     expect(reopened.state).toEqual(current);await unchangedAcceptance(page,acceptedBest);
  80  |     await arrivalFrame(page,'390x844','reopened');
  81  |     await tabTo(page,'terminal-undo');await page.keyboard.press('Enter');await idle(page);
  82  |     expect(await state(page)).toEqual(timeline.at(-2));
  83  |     await expect(page.locator('#app')).not.toHaveClass(/arrival-open/);
> 84  |     await expect(page.locator('#arrival-content')).toHaveCount(0);
      |                                                    ^ Error: expect(locator).toHaveCount(expected) failed
  85  |     current=await execute(page,level,witnesses[0].actions.at(-1)!,timeline.at(-2)!);
  86  |     await arrivalResult(page,level,2,14,1);await arrivalFrame(page,'390x844','two-after-undo');
  87  |     const redelivery=await arrivalRuntime(page);
  88  |     expect(redelivery.celebration).not.toBe(first.celebration);
  89  |     expect(redelivery.audio.arrivalEventCount).toBe(first.audio.arrivalEventCount+1);
  90  |     await unchangedAcceptance(page,acceptedBest);
  91  |     report(directory('390x844'),recordArrival?'recorded-lifecycle':'lifecycle',{source:source.sha256,timeline,first,reopened,redelivery,saved:await storage(page)});
  92  |     if(finish)await page.waitForTimeout(1000);
  93  |   }finally{if(finish)await finish();}
  94  |   await activate(page,'terminal-restart',true);await idle(page);
  95  |   expect(await state(page)).toEqual(initial(level));
  96  |   const saved=await storage(page);expect(saved.masteryWrites).toBe(1);
  97  |   expect(JSON.parse(saved.mastery!).results['ternhaven@1']).toMatchObject({actions:14,successfulUndos:1,lanterns:2});
  98  |   expect(JSON.parse(saved.mastery!).results['orchard-landing@1']).toEqual(JSON.parse(acceptedBest).results['orchard-landing@1']);
  99  |   await untouched(page,ongoing);await home(page);await activate(page,'home-practice',true);
  100 |   await expect(page.locator('#practice-ternhaven .mastery-badge')).toHaveAccessibleName(/2 of 3 lanterns/);
  101 |   report(directory('390x844'),'replay-accepted',{source:source.sha256,saved});
  102 | });
  103 |
  104 | test('minified short-landscape current one-lantern rescue preserves a better accepted best and Practice isolation',async({page})=>{
  105 |   const {level,witnesses}=candidate('ternhaven');
  106 |   await page.setViewportSize({width:780,height:320});await page.emulateMedia({reducedMotion:'reduce'});
  107 |   await fixture(page,completeSeven,previousBest);await page.goto(productionURL+'/?cove=ternhaven');
  108 |   expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  109 |   let current=initial(level);const timeline:State[]=[current];
  110 |   for(const action of [...witnesses[0].actions.slice(0,-1),{type:'wait'} as const,witnesses[0].actions.at(-1)!]){
  111 |     current=await execute(page,level,action,current,false);timeline.push(current);
  112 |   }
  113 |   await arrivalResult(page,level,1,15,0);await arrivalFrame(page,'780x320','one-current-best-three');
  114 |   await expect(page.locator('.arrival-best-note')).toBeVisible();
  115 |   await page.locator('#arrival-details summary').tap();
  116 |   await expect(page.locator('#mastery-best')).toContainText('3 of 3 lanterns');
  117 |   await arrivalFrame(page,'780x320','details',true);
  118 |   await page.locator('#arrival-details summary').tap();
  119 |   await unchangedAcceptance(page,previousBest);
  120 |   await activate(page,'choose-cove',true);await unchangedAcceptance(page,previousBest);
  121 |   await activate(page,'return-arrival',true);await arrivalResult(page,level,1,15,0);
  122 |   await activate(page,'choose-cove',true);await page.locator('#cove-picker').selectOption('orchard-landing');await idle(page);
  123 |   await expect(page.locator('#seascape')).toHaveAttribute('aria-label','Orchard Landing');
  124 |   expect((await storage(page)).mastery).toBe(previousBest);
  125 |   await untouched(page,completeSeven);
  126 |   report(directory('780x320'),'production-rescue',{source:source.sha256,timeline,saved:await storage(page)});
  127 | });
  128 |
  129 | test('actual scored Journey arrival advances only through Continue story after tide Undo',async({page})=>{
  130 |   const checkpoint=JSON.stringify({version:1,completed:[],acknowledgedScenes:['opening'],checkpoint:{kind:'cove',id:'holding-pier'}},null,2)+'\n';
  131 |   await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});
  132 |   await fixture(page,checkpoint);await page.goto('/');await activate(page,'home-play',true);await idle(page);
  133 |   let current=initial(holdingPier);const timeline=[current];
  134 |   for(const action of witness('holding-pier')){
  135 |     const before=current;
  136 |     current=await execute(page,holdingPier,action,current);
  137 |     if(before.turn===3){await undo(page,true);expect(await state(page)).toEqual(before);current=await execute(page,holdingPier,action,before);}
  138 |     timeline.push(current);
  139 |   }
  140 |   await arrivalResult(page,holdingPier,2,9,1);await expect(page.locator('#continue-story')).toHaveText(/Continue story/);
  141 |   await expect(page.locator('#continue-story')).toBeFocused();
  142 |   await arrivalFrame(page,'320x740','journey-two');
  143 |   await page.locator('#arrival-details summary').tap();await arrivalFrame(page,'320x740','details',true);await page.locator('#arrival-details summary').tap();
  144 |   expect((await storage(page)).journey).toBe(checkpoint);await unchangedAcceptance(page,null);
  145 |   await dismissAndReopen(page);await unchangedAcceptance(page,null);
  146 |   await tabTo(page,'continue-story');await page.keyboard.press('Enter');
  147 |   await expect(page.locator('#story-continue')).toBeVisible();
  148 |   const saved=await storage(page);expect(JSON.parse(saved.journey!).completed).toEqual(['holding-pier']);
  149 |   expect(JSON.parse(saved.journey!).checkpoint).toEqual({kind:'scene',id:'another-bell'});
  150 |   expect(JSON.parse(saved.mastery!).results['holding-pier@1']).toMatchObject({lanterns:2,actions:9,successfulUndos:1});
  151 |   expect(saved.masteryWrites).toBe(1);
  152 |   report(directory('320x740'),'journey-continue',{source:source.sha256,timeline,saved});
  153 | });
  154 |
  155 | test('desktop confirmed Home accepts once and failed persistence remains visible without rewriting Journey',async({page})=>{
  156 |   await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  157 |   await fixture(page,completeSeven,undefined,true);await ready(page,'holding-pier');
  158 |   let current=initial(holdingPier);
  159 |   for(const action of witness('holding-pier'))current=await execute(page,holdingPier,action,current);
  160 |   await arrivalResult(page,holdingPier,3,9,0);await arrivalFrame(page,'desktop','three');
  161 |   await page.keyboard.press('Escape');await activate(page,'menu',true);await activate(page,'journey-return',true);
  162 |   await activate(page,'journey-return-cancel',true);await unchangedAcceptance(page,null);
  163 |   await activate(page,'return-arrival',true);await arrivalResult(page,holdingPier,3,9,0);
  164 |   await home(page,true);
  165 |   const saved=await storage(page);expect(saved.mastery).toBeNull();expect(saved.masteryWrites).toBe(1);
  166 |   await expect(page.locator('#home-surface, #home')).toHaveCount(1);
  167 |   await expect(page.locator('.mastery-notice')).toBeVisible();
  168 |   await untouched(page,completeSeven);
  169 |   report(directory('desktop'),'confirmed-home-storage-failure',{source:source.sha256,saved});
  170 | });
  171 |
  172 | test('isolated six-neighbor renderer fits every native size and exposes storage failure clearly',async({page})=>{
  173 |   for(const [width,height] of [[390,844],[780,320],[320,740],[1440,900]]){
  174 |     await page.setViewportSize({width,height});
  175 |     await page.goto('/tests/e2e/arrival-bubble-fixture.html?cast=six');
  176 |     await expect(page.locator('#arrival-cast li')).toHaveCount(6);
  177 |     await expect(page.locator('#arrival-cast img[data-portrait-state=loaded]')).toHaveCount(6);
  178 |     expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  179 |     await arrivalFrame(page,'fixtures',width+'x'+height+'-six');
  180 |     await page.locator('#arrival-details summary').tap();
  181 |     await arrivalFrame(page,'fixtures',width+'x'+height+'-six-details',true);
  182 |   }
  183 |   await page.setViewportSize({width:780,height:320});
  184 |   await page.goto('/tests/e2e/arrival-bubble-fixture.html?cast=six&notice=1');
```
