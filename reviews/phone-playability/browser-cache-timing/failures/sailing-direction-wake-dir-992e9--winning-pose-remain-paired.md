# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sailing-direction-wake.spec.ts >> direction: free-water heading, both berths, transfer/tide Undo and winning pose remain paired
- Location: tests\e2e\sailing-direction-wake.spec.ts:71:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 0.85
Received:   1.4256833474051538
```

# Test source

```ts
  75  |   mkdirSync(`${reviewDir}/raw`, { recursive: true });
  76  |   const context = await browser.newContext({
  77  |     baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  78  |     viewport: { width: 844, height: 390 },
  79  |     deviceScaleFactor: 1,
  80  |     hasTouch: true,
  81  |     isMobile: true,
  82  |     reducedMotion: 'no-preference',
  83  |     recordVideo: { dir: `${reviewDir}/raw`, size: { width: 844, height: 390 } },
  84  |   });
  85  |   const page = await context.newPage(),
  86  |     observations: any[] = [],
  87  |     errors: string[] = [];
  88  |   page.on('pageerror', (e) => errors.push(e.message));
  89  |   let failure: string | null = null;
  90  |   async function save(label: string, shot = false) {
  91  |     const j = await agreedPose(page),
  92  |       s = await state(page),
  93  |       w = (await environment(page)).wake;
  94  |     observations.push({ label, state: s, journey: j, wave: w });
  95  |     if (shot) await page.screenshot({ path: `${reviewDir}/direction-${label}.png` });
  96  |     return j;
  97  |   }
  98  |   try {
  99  |     await ready(page, 'holding-pier');
  100 |     const initial = await save('start', true);
  101 |     await activate(page, 'map-shallows', true);
  102 |     expect((await journey(page)).pose.history).toHaveLength(0);
  103 |     expect((await state(page)).turn).toBe(0);
  104 |     await activate(page, 'close-location', true);
  105 |     await act(page, 'unload', true);
  106 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(initial.boatHeading, 8);
  107 |     await startMove(page, 'map-shallows', true);
  108 |     await page.waitForFunction(
  109 |       () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.3,
  110 |     );
  111 |     const planned = (await journey(page)).pose;
  112 |     await idle(page);
  113 |     const shallow = await save('free-water-rest', true);
  114 |     expect(shallow.boatHeading).toBeCloseTo(planned.heading, 8);
  115 |     expect(angularDistance(shallow.boatHeading, Math.PI / 2)).toBeGreaterThan(0.1);
  116 |     await activate(page, 'map-rabbit-pier', true);
  117 |     await page.waitForTimeout(350);
  118 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
  119 |     expect((await state(page)).turn).toBe(2);
  120 |     await activate(page, 'close-location', true);
  121 |     await activate(page, 'menu', true);
  122 |     await activate(page, 'settings', true);
  123 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
  124 |     expect((await journey(page)).pose.history).toHaveLength(2);
  125 |     await activate(page, 'settings-back', true);
  126 |     await activate(page, 'cancel', true);
  127 |     await act(page, 'wait', true);
  128 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
  129 |     await undo(page, true);
  130 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(shallow.boatHeading, 8);
  131 |     await undo(page, true);
  132 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(initial.boatHeading, 8);
  133 |     await act(page, 'map-harbor', true);
  134 |     await undo(page, true);
  135 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(initial.boatHeading, 8);
  136 |     await act(page, 'map-shallows', true);
  137 |     await startMove(page, 'map-rabbit-pier', true);
  138 |     await page.waitForFunction(
  139 |       () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.03,
  140 |     );
  141 |     expect((await journey(page)).pose.next.fromAngle).toBeCloseTo(shallow.boatHeading, 8);
  142 |     await idle(page);
  143 |     const rabbit = await save('rabbit-berth', true);
  144 |     expect(Math.abs(Math.sin(rabbit.boatHeading))).toBeCloseTo(1, 8);
  145 |     await activate(page, 'board', true);
  146 |     await activate(page, 'passenger-rabbit-2', true);
  147 |     expect((await journey(page)).pose.history).toHaveLength(3);
  148 |     await activate(page, 'passenger-rabbit-2', true);
  149 |     await activate(page, 'commit', true);
  150 |     await idle(page);
  151 |     await save('tide', true);
  152 |     expect(await state(page)).toMatchObject({
  153 |       turn: 4,
  154 |       tideLevel: 1,
  155 |       aboard: ['rabbit-1', 'rabbit-2'],
  156 |     });
  157 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(rabbit.boatHeading, 8);
  158 |     await undo(page, true);
  159 |     await cleared(page);
  160 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(rabbit.boatHeading, 8);
  161 |     await act(page, 'board', true);
  162 |     await beginSamples(page);
  163 |     await act(page, 'map-shallows', true);
  164 |     const reverseFrames = await endSamples(page);
  165 |     const activeFrames = reverseFrames.filter((f) => f.active);
  166 |     expect(activeFrames.length).toBeGreaterThan(4);
  167 |     expect(activeFrames[0].pose.next.fromAngle).toBeCloseTo(rabbit.boatHeading, 8);
  168 |     expect(activeFrames.every((f) => f.active.duration >= 1600 && f.active.duration <= 3000)).toBe(
  169 |       true,
  170 |     );
  171 |     let maxStep = 0;
  172 |     for (let i = 1; i < activeFrames.length; i++)
  173 |       maxStep = Math.max(maxStep, Math.abs(activeFrames[i].heading - activeFrames[i - 1].heading));
  174 |     observations.push({ label: 'reverse-samples', frames: reverseFrames,maxStep,adjacentSteps:activeFrames.slice(1).map((frame,index)=>({dt:frame.time-activeFrames[index].time,fromProgress:activeFrames[index].active.progress,toProgress:frame.active.progress,fromHeading:activeFrames[index].heading,toHeading:frame.heading,step:Math.abs(frame.heading-activeFrames[index].heading)})) });
> 175 |     expect(maxStep).toBeLessThan(0.85);
      |                     ^ Error: expect(received).toBeLessThan(expected)
  176 |     await act(page, 'map-stone', true);
  177 |     const stone = await save('opposite-berth', true);
  178 |     expect(angularDistance(stone.boatHeading, initial.boatHeading)).toBeCloseTo(Math.PI, 7);
  179 |     await act(page, 'board', true);
  180 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(stone.boatHeading, 8);
  181 |     await activate(page, 'unload', true);
  182 |     for (const id of ['rabbit-1', 'rabbit-2']) await activate(page, `passenger-${id}`, true);
  183 |     await activate(page, 'commit', true);
  184 |     await idle(page);
  185 |     expect((await state(page)).aboard).toEqual(['rabbit-1', 'rabbit-2']);
  186 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(stone.boatHeading, 8);
  187 |     await undo(page, true);
  188 |     await cleared(page);
  189 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(stone.boatHeading, 8);
  190 |     await act(page, 'map-harbor', true);
  191 |     const harbor = await agreedPose(page);
  192 |     await act(page, 'unload', true);
  193 |     expect(await state(page)).toMatchObject({ turn: 9, status: 'won' });
  194 |     await save('won', true);
  195 |     await undo(page, true);
  196 |     await cleared(page);
  197 |     expect((await agreedPose(page)).boatHeading).toBeCloseTo(harbor.boatHeading, 8);
  198 |     await save('terminal-undo', true);
  199 |     await act(page, 'unload', true);
  200 |     await page.waitForTimeout(1900);
  201 |     await cleared(page);
  202 |     expect(errors).toEqual([]);
  203 |   } catch (e) {
  204 |     failure = String(e);
  205 |     throw e;
  206 |   } finally {
  207 |     writeFileSync(
  208 |       `${reviewDir}/direction-lifecycle.json`,
  209 |       JSON.stringify(
  210 |         { outcome: failure ? 'failed' : 'passed', failure, observations, errors },
  211 |         null,
  212 |         2,
  213 |       ),
  214 |     );
  215 |     const video = page.video();
  216 |     await context.close();
  217 |     if (video) await video.saveAs(`${reviewDir}/raw/direction-lifecycle.webm`);
  218 |   }
  219 | });
  220 | 
  221 | test('direction: normal, hidden, device Reduced, recovery and animation failures settle the same planned pose once', async ({
  222 |   page,
  223 | }) => {
  224 |   test.setTimeout(180000);
  225 |   mkdirSync(`${reviewDir}/raw`, { recursive: true });
  226 |   const observations: any[] = [];
  227 |   let failure: string | null = null,
  228 |     normalHeading: number | null = null;
  229 |   try {
  230 |     await ready(page, 'holding-pier');
  231 |     for (const mode of [
  232 |       'complete',
  233 |       'visibility',
  234 |       'cancelled',
  235 |       'recovery',
  236 |       'error-before',
  237 |       'error-after',
  238 |     ]) {
  239 |       await restart(page);
  240 |       await act(page, 'unload');
  241 |       const prior = await agreedPose(page);
  242 |       const counts = await page.evaluate(
  243 |         () => (window as any).__LAST_FERRY__.getTransitionStatus().completionCounts,
  244 |       );
  245 |       if (mode === 'recovery' || mode.startsWith('error'))
  246 |         await page.evaluate(async (mode) => {
  247 |           const modulePath = performance
  248 |             .getEntriesByType('resource')
  249 |             .find((entry) => new URL(entry.name).pathname === '/src/scene/world.ts')?.name;
  250 |           if (!modulePath) throw Error('The live World module resource was not found');
  251 |           const { World } = await import(modulePath);
  252 |           const original = World.prototype.animate;
  253 |           (window as any).__restoreAnimate = () => {
  254 |             World.prototype.animate = original;
  255 |           };
  256 |           World.prototype.animate = function (...args: any[]) {
  257 |             if (mode === 'error-after') original.apply(this, args);
  258 |             if (mode !== 'recovery')
  259 |               throw Error('Injected animation failure for fallback verification');
  260 |           };
  261 |         }, mode);
  262 |       await startMove(page, 'map-shallows');
  263 |       if (mode === 'visibility' || mode === 'cancelled') {
  264 |         await page.waitForFunction(
  265 |           () => (window as any).__LAST_FERRY__.getJourneyStatus().active?.progress > 0.3,
  266 |         );
  267 |         if (mode === 'cancelled') await page.emulateMedia({ reducedMotion: 'reduce' });
  268 |         else
  269 |           await page.evaluate(() => {
  270 |             Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  271 |             document.dispatchEvent(new Event('visibilitychange'));
  272 |           });
  273 |       }
  274 |       await idle(page);
  275 |       const j = await agreedPose(page),
```