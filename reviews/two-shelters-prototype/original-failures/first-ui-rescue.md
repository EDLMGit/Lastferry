# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: two-shelters.spec.ts >> actual 390x844 rescue low-separate-subsets, tide and terminal Undo
- Location: tests\e2e\two-shelters.spec.ts:77:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 4
+ Received  + 3

@@ -1,20 +1,19 @@
  Object {
    "aboard": Array [
+     "hazel",
      "bracken",
    ],
    "boatNodeId": "low",
    "delivered": Array [],
    "lossReason": null,
    "status": "playing",
    "tideLevel": 0,
-   "turn": 1,
+   "turn": 0,
    "waitingByPier": Object {
      "harbor-pier": Array [],
-     "low-pier": Array [
-       "hazel",
-     ],
+     "low-pier": Array [],
      "reeds-pier": Array [
        "mica",
      ],
      "refuge-pier": Array [],
    },
```

# Page snapshot

```yaml
- main [ref=f2e3]:
  - region "Two Shelters" [ref=f2e4]:
    - generic "Two Shelters. Use the labeled waypoint controls to navigate." [ref=f2e6]
    - button "4 of 4 spaces · boat needs depth 3 · crossing status" [ref=f2e7] [cursor=pointer]:
      - generic: 4/4 · Depth 3
    - navigation "Crossing controls" [ref=f2e8]:
      - button "Undo" [disabled] [ref=f2e9]
      - button "Wait · 1 action" [ref=f2e10] [cursor=pointer]
      - button "Menu" [ref=f2e11] [cursor=pointer]
      - button "Enable sound" [ref=f2e12] [cursor=pointer]:
        - generic: Sound
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; adjacent passage available; Home, delivery destination":
          - generic: Harbor · Home
      - generic:
        - button "Select High Refuge; adjacent passage available":
          - generic [ref=f2e13] [cursor=pointer]
          - generic [ref=f2e15] [cursor=pointer]: High Refuge
      - generic:
        - button "Select Low Landing; current location":
          - generic [aria-hidden] [ref=f2e18] [cursor=pointer]: •
          - generic [ref=f2e19] [cursor=pointer]: Low Landing
      - generic:
        - button "Select Reed Pier; adjacent, too shallow":
          - generic:
            - generic [aria-hidden]: ╱
          - generic: Reed Pier
    - navigation "Passenger actions at Low Landing" [ref=f2e21]:
      - button "Let ashore" [ref=f2e22] [cursor=pointer]
    - button "Open tide and pier forecast" [ref=f2e23] [cursor=pointer]:
      - generic [aria-hidden] [ref=f2e24]: "!"
      - strong [ref=f2e25]: Reed Pier floods in 4 actions.
    - navigation "Cove view" [ref=f2e26]:
      - button "Whole cove" [ref=f2e27] [cursor=pointer]
  - status [ref=f2e28]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
  3   | import { createHash } from 'node:crypto';
  4   | import { execFileSync } from 'node:child_process';
  5   | import type { Action, State } from '../../src/game/rules';
  6   | import type { Level } from '../../src/levels/level';
  7   | import { ready, act, activate, wholeCove, state, idle, undo, tabTo, fullyVisible } from './ui';
  8   | import { reviewDir } from './evidence';
  9   | import { passive } from './story-support';
  10  | 
  11  | mkdirSync(reviewDir, { recursive: true });
  12  | const witnesses = JSON.parse(readFileSync('data/two-shelters/witnesses.json','utf8')) as { witnesses: {id:string;actions:Action[]}[] };
  13  | const twoShelters = JSON.parse(readFileSync('data/two-shelters.level.json','utf8')) as Level;
  14  | const save = (name: string, data: unknown) => writeFileSync(`${reviewDir}/${name}.json`, JSON.stringify(data, null, 2));
  15  | const source = () => {
  16  |   const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
  17  |   return Object.fromEntries([...walk('src'), ...walk('data'), 'package.json', 'package-lock.json'].map(p => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]));
  18  | };
  19  | test.beforeAll(async ({ browser }) => save('source-before', { at: new Date().toISOString(), head: execFileSync('git', ['rev-parse','HEAD'], { encoding:'utf8' }).trim(), files: source(), node: process.version, browser: browser.version(), platform: process.platform, renderer:'ANGLE SwiftShader', capture:'Native CSS viewport DPR1; real UI on development build' }));
  20  | test.afterAll(() => save('source-after', {files:source()}));
  21  | async function snap(page: Page, name: string) {
  22  |   await page.waitForTimeout(200);
  23  |   const cdp=await page.context().newCDPSession(page);
  24  |   const image=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
  25  |   writeFileSync(`${reviewDir}/${name}.png`,Buffer.from(image.data,'base64'));
  26  |   await cdp.detach();
  27  |   save(name,await page.evaluate(()=>{const g=(window as any).__LAST_FERRY__; return {state:g.getState(),view:g.getViewStatus(),render:g.getRenderStatus(),navigation:g.getNavigationStatus(),audio:g.getAudioStatus(),active:document.activeElement?.id};}));
  28  | }
  29  | async function playView(page:Page) {
  30  |   if ((await page.locator('#view-toggle').textContent())?.includes('Play view')) await activate(page,'view-toggle',true);
  31  |   if(await page.locator('#back-to-boat').isVisible()) await activate(page,'back-to-boat',true);
  32  | }
  33  | async function execute(page:Page,action:Action,touch=true) {
  34  |   if(action.type==='move') await act(page,`map-${action.to}`,touch);
  35  |   else if(action.type==='wait') await act(page,'wait',touch);
  36  |   else {
  37  |     await activate(page,action.type,touch);
  38  |     if(await page.locator('#dialog[open][data-mode=action]').count()) {
  39  |       for(const choice of await page.locator('.passenger-options button').all()) {
  40  |         const id=(await choice.getAttribute('id'))!.replace('passenger-','');
  41  |         if(((await choice.getAttribute('aria-pressed'))==='true')!==action.passengerIds.includes(id)) await choice.click();
  42  |       }
  43  |       await fullyVisible(page,page.locator('#commit'));
  44  |       await activate(page,'commit',touch);
  45  |     }
  46  |     await idle(page);
  47  |   }
  48  | }
  49  | 
  50  | test('native candidate Play and Overview plus matched earlier cove',async({browser,baseURL})=>{
  51  |   for(const [width,height] of [[390,844],[780,320],[320,740],[844,390],[1440,900]]) {
  52  |     const ctx=await browser.newContext({baseURL,viewport:{width,height},deviceScaleFactor:1,hasTouch:true});
  53  |     const page=await ctx.newPage();
  54  |     await ready(page,'two-shelters');
  55  |     for(const id of ['unload','wait','undo','menu','sound-toggle','load-toggle','status-toggle','view-toggle']) await fullyVisible(page,page.locator('#'+id));
  56  |     await expect(page.locator('#status-toggle')).toContainText('Reed Pier floods in 4 actions');
  57  |     await snap(page,`${width}x${height}-start-play`);
  58  |     await wholeCove(page,true);
  59  |     for(const node of twoShelters.nodes) await fullyVisible(page,page.locator('#map-'+node.id),false);
  60  |     await snap(page,`${width}x${height}-overview`);
  61  |     const before=await state(page);
  62  |     await activate(page,'map-reeds',true);
  63  |     await expect(page.locator('#local-context')).toContainText('Needs depth 3 · passage 1');
  64  |     await expect(page.locator('#sail')).toBeDisabled();
  65  |     await fullyVisible(page,page.locator('#location-details'));
  66  |     await snap(page,`${width}x${height}-blocked-inspection`);
  67  |     expect(await state(page)).toEqual(before);
  68  |     await ready(page,'holding-pier');
  69  |     await snap(page,`${width}x${height}-holding-matched-play`);
  70  |     await ready(page,'driftwood-yard');
  71  |     await snap(page,`${width}x${height}-driftwood-matched-play`);
  72  |     await ctx.close();
  73  |   }
  74  | });
  75  | 
  76  | for(const [width,height,witnessId] of [[390,844,'low-separate-subsets'],[780,320,'high-mixed-first']] as const) {
  77  |   test(`actual ${width}x${height} rescue ${witnessId}, tide and terminal Undo`,async({browser,baseURL})=>{
  78  |     const ctx=await browser.newContext({baseURL,viewport:{width,height},hasTouch:true,deviceScaleFactor:1});
  79  |     const page=await ctx.newPage();
  80  |     const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  81  |     await ready(page,'two-shelters');
  82  |     const witness=witnesses.witnesses.find(w=>w.id===witnessId)!;
  83  |     expect(witness).toBeTruthy();
  84  |     let expected:State=await state(page);
  85  |     const observations=[];
  86  |     for(const action of witness.actions as Action[]) {
  87  |       const before=await state(page);
  88  |       expected=await page.evaluate(async({before,action,level})=>{const path='/src/game/rules.ts'; const {reduce}=await import(path);return reduce(before,action,level);},{before,action,level:twoShelters});
  89  |       await execute(page,action);
> 90  |       expect(await state(page)).toEqual(expected);
      |                                 ^ Error: expect(received).toEqual(expected) // deep equality
  91  |       observations.push({action,state:expected});
  92  |       if(expected.turn===1 || expected.turn===2 || expected.turn===4 || expected.turn===5 || expected.turn===6 || expected.turn===9) {
  93  |         await playView(page);
  94  |         await snap(page,`${width}x${height}-turn${expected.turn}-play`);
  95  |       }
  96  |       if(expected.turn===4 || expected.turn===9) {
  97  |         await undo(page,true);expect(await state(page)).toEqual(before);
  98  |         await execute(page,action);expect(await state(page)).toEqual(expected);
  99  |       }
  100 |       if(expected.status==='won') {
  101 |         await snap(page,`${width}x${height}-rescue`);
  102 |         await undo(page,true);expect(await state(page)).toEqual(before);
  103 |         await execute(page,action);expect(await state(page)).toEqual(expected);
  104 |       }
  105 |     }
  106 |     expect(expected.status).toBe('won');
  107 |     expect(errors).toEqual([]);
  108 |     save(`${width}x${height}-rescue-sequence`,{witnessId,observations,errors});
  109 |     await ctx.close();
  110 |   });
  111 | }
  112 | 
  113 | test('natural keyboard inspection, immediate loss and reduced fullscreen recovery',async({browser,baseURL})=>{
  114 |   const ctx=await browser.newContext({baseURL,viewport:{width:780,height:320},deviceScaleFactor:1,hasTouch:true});
  115 |   const page=await ctx.newPage();await ready(page,'two-shelters');
  116 |   const press=async(id:string)=>{await tabTo(page,id);await page.keyboard.press('Enter');};
  117 |   await press('view-toggle');await press('map-low');
  118 |   const start=await state(page);
  119 |   await press('location-details');
  120 |   await expect(page.locator('#location-facts')).toContainText('Low Landing');
  121 |   await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  122 |   expect(await state(page)).toEqual(start);
  123 |   await press('map-harbor');await press('sail');await idle(page);
  124 |   await press('unload');await press('commit');await idle(page);
  125 |   await press('map-low');await press('sail');await idle(page);
  126 |   await press('map-reeds');
  127 |   await expect(page.locator('#local-context')).toContainText('Mica');
  128 |   await expect(page.locator('#sail')).toContainText('Sail anyway');
  129 |   await fullyVisible(page,page.locator('#sail'));
  130 |   await snap(page,'780x320-immediate-loss');
  131 |   const before=await state(page);
  132 |   await press('sail');await idle(page);
  133 |   expect((await state(page)).status).toBe('lost');
  134 |   await press('terminal-undo');expect(await state(page)).toEqual(before);
  135 |   await expect(page.locator('#undo')).toBeFocused();
  136 |   await activate(page,'menu',true);await activate(page,'fullscreen',true);
  137 |   await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');
  138 |   await page.setViewportSize({width:320,height:740});
  139 |   await fullyVisible(page,page.locator('#cancel'));
  140 |   await activate(page,'settings',true);
  141 |   await page.locator('#motion-preference').selectOption('reduced');
  142 |   await activate(page,'settings-sound',true);
  143 |   await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  144 |   await page.evaluate(()=>document.exitFullscreen());
  145 |   await expect.poll(()=>page.evaluate(()=>document.fullscreenElement)).toBeNull();
  146 |   await undo(page,true);expect((await state(page)).turn).toBe(2);
  147 |   await playView(page);await snap(page,'320x740-rotation-recovery');
  148 |   await ctx.close();
  149 | });
  150 | 
  151 | async function recordRuntime(page: Page, name: string) {
  152 |   const directory = `${reviewDir}/raw/${name}`;
  153 |   mkdirSync(directory, { recursive: true });
  154 |   const audioAvailable = await passive(page, () => {
  155 |     const stream = (window as any).__LAST_FERRY__.captureAudioStream();
  156 |     if (!stream) return false;
  157 |     const chunks: Blob[] = [];
  158 |     const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  159 |     const start = performance.timeOrigin + performance.now();
  160 |     const stopped = new Promise<number[]>((resolve) => {
  161 |       recorder.ondataavailable = (e) => chunks.push(e.data);
  162 |       recorder.onstop = async () =>
  163 |         resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
  164 |     });
  165 |     (window as any).__sheltersRecording = { recorder, start, stopped };
  166 |     recorder.start();
  167 |     return true;
  168 |   });
  169 |   const cdp = await page.context().newCDPSession(page);
  170 |   const frames: { path: string; timestamp: number; receipt: number }[] = [];
  171 |   cdp.on('Page.screencastFrame', (event) => {
  172 |     const path = `${directory}/frame-${String(frames.length).padStart(6, '0')}.jpg`;
  173 |     writeFileSync(path, Buffer.from(event.data, 'base64'));
  174 |     frames.push({ path, timestamp: event.metadata.timestamp!, receipt: Date.now() });
  175 |     void cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  176 |   });
  177 |   await cdp.send('Page.startScreencast', {
  178 |     format: 'jpeg',
  179 |     quality: 87,
  180 |     maxWidth: page.viewportSize()!.width,
  181 |     maxHeight: page.viewportSize()!.height,
  182 |     everyNthFrame: 3,
  183 |   });
  184 |   return async () => {
  185 |     await cdp.send('Page.stopScreencast');
  186 |     const recording = audioAvailable
  187 |       ? await passive(page, async () => {
  188 |           const r = (window as any).__sheltersRecording;
  189 |           r.recorder.stop();
  190 |           return { start: r.start, bytes: await r.stopped };
```