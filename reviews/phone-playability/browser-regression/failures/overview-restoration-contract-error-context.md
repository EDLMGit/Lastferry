# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homecoming.spec.ts >> homecoming recovery: simulated hide and context loss settle finite motion without replay or resource growth
- Location: tests\e2e\homecoming.spec.ts:513:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 8
+ Received  + 8

  Object {
-   "bottom": -3.5685411389099766,
-   "left": -8.440640614473521,
+   "bottom": -3.5243115899220276,
+   "left": -8.400655179277729,
    "position": Array [
      0,
      34,
      24,
    ],
    "projection": Array [
-     0.11951018272697603,
+     0.12008402425086283,
      0,
      0,
      0,
      0,
-     0.19121629236316168,
+     0.19213443880138054,
      0,
      0,
      0,
      0,
      -0.02002002002002002,
      0,
-     0.008742502168465715,
-     -0.31763679427222,
+     0.008784480271523233,
+     -0.3228583705091301,
      -1.002002002002002,
      1,
    ],
-   "right": 8.294335053407847,
-   "top": 6.890818653515877,
+   "right": 8.254349618212055,
+   "top": 6.885066408509087,
  }
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "The Holding Pier" [ref=e4]:
    - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "The Holding Pier" [level=1] [ref=e9]
        - paragraph [ref=e10]: Bring all three passengers to Harbor
      - generic "Crossing progress" [ref=e11]:
        - strong [ref=e12]: Depth 3 · 4/4 spaces
        - generic [ref=e13]: 08 actions · Tide 2 · Home 0/3
      - navigation "Crossing controls" [ref=e14]:
        - button "↶ Undo" [active] [ref=e15] [cursor=pointer]
        - button "Wait · 1 action" [ref=e16] [cursor=pointer]
        - button "Menu" [ref=e17] [cursor=pointer]
        - button "Mute sound" [ref=e18] [cursor=pointer]: ♫
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; current location; Home, delivery destination":
          - generic [aria-hidden] [ref=e20] [cursor=pointer]: •
          - generic [ref=e21] [cursor=pointer]: Harbor · Home
      - generic:
        - button "Select Stone Pier; adjacent passage available":
          - generic [ref=e23] [cursor=pointer]
          - generic [ref=e25] [cursor=pointer]: Stone Pier
      - generic:
        - button "Select Shallows; no direct passage":
          - generic [aria-hidden] [ref=e28] [cursor=pointer]: ◇
          - generic [ref=e29] [cursor=pointer]: Shallows
      - generic:
        - button "Select Rabbit Pier; no direct passage":
          - generic [aria-hidden] [ref=e32] [cursor=pointer]: ◇
          - generic [ref=e33] [cursor=pointer]: Rabbit Pier
    - navigation "Passenger actions at Harbor" [ref=e35]:
      - button "Bring passengers home; choose passengers" [ref=e36] [cursor=pointer]:
        - generic [ref=e39]: Bring home
        - generic [aria-hidden] [ref=e40]: ⌂
    - paragraph: Select a place to see its options.
    - button "Open tide and pier forecast" [ref=e41] [cursor=pointer]:
      - generic [aria-hidden] [ref=e42]: ≈
      - strong [ref=e44]: Pip, Rue and Moss are safe aboard.
      - generic [ref=e45]: Forecast
    - navigation "Cove view" [ref=e46]:
      - button "Play view" [pressed] [ref=e47] [cursor=pointer]
      - button "Back to boat" [ref=e48] [cursor=pointer]
  - status [ref=e49]: Undid action. 8 actions completed.
```

# Test source

```ts
  121 |             touch: navigator.maxTouchPoints,
  122 |             osReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  123 |           })),
  124 |           errors,
  125 |           observations,
  126 |         },
  127 |         null,
  128 |         2,
  129 |       ),
  130 |     );
  131 |   }
  132 | }
  133 | 
  134 | async function approach(page: Page, ids = holdingApproach, touch = false, tideUndo = false) {
  135 |   for (const id of ids) {
  136 |     const before = await state(page);
  137 |     await act(page, id, touch);
  138 |     if (tideUndo && before.turn === 3) {
  139 |       const risen = await state(page);
  140 |       expect(risen).toMatchObject({ tideLevel: 1, status: 'playing' });
  141 |       await undo(page, touch);
  142 |       expect(await state(page)).toEqual(before);
  143 |       await act(page, id, touch);
  144 |       expect(await state(page)).toEqual(risen);
  145 |     }
  146 |   }
  147 | }
  148 | 
  149 | async function settled(page: Page) {
  150 |   await expect.poll(async () => (await homecoming(page)).finite).toBe(false);
  151 |   const value = await homecoming(page);
  152 |   expect(value.active).toBe(true);
  153 |   expect(
  154 |     value.animalOffsets.every(
  155 |       (animal: any) =>
  156 |         animal.position.every((n: number) => Math.abs(n) < 1e-7) &&
  157 |         animal.rotation.every((n: number) => Math.abs(n) < 1e-7),
  158 |     ),
  159 |   ).toBe(true);
  160 |   return value;
  161 | }
  162 | 
  163 | async function controls(page: Page) {
  164 |   await fullyVisible(page, page.locator('#dialog'), false);
  165 |   const controls = page.locator('#dialog :is(button,select):visible');
  166 |   for (const control of await controls.all()) {
  167 |     await fullyVisible(page, control);
  168 |     await readable(control);
  169 |   }
  170 |   for (const text of await page.locator('#dialog :is(h2,p,label):visible').all())
  171 |     await readable(text);
  172 |   const entries = await controls.evaluateAll((elements) =>
  173 |     elements.map((element) => {
  174 |       const r = element.getBoundingClientRect();
  175 |       return { id: element.id, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  176 |     }),
  177 |   );
  178 |   for (let a = 0; a < entries.length; a++)
  179 |     for (let b = a + 1; b < entries.length; b++) {
  180 |       const x = entries[a],
  181 |         y = entries[b];
  182 |       expect(
  183 |         Math.min(x.right, y.right) - Math.max(x.left, y.left) <= 0.5 ||
  184 |           Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) <= 0.5,
  185 |         `${x.id} overlaps ${y.id}`,
  186 |       ).toBe(true);
  187 |     }
  188 | }
  189 | 
  190 | async function framing(page: Page) {
  191 |   const value = await scene(page);
  192 |   for (const item of [value.lighthouse, value.boat, ...value.passengers]) {
  193 |     expect(item.left).toBeGreaterThanOrEqual(0);
  194 |     expect(item.top).toBeGreaterThanOrEqual(0);
  195 |     expect(item.right).toBeLessThanOrEqual(value.canvas.width);
  196 |     expect(item.bottom).toBeLessThanOrEqual(value.canvas.height);
  197 |   }
  198 |   const covered = await page.evaluate(() => {
  199 |     const api = (window as any).__LAST_FERRY__,
  200 |       f = api.getFrameStatus(),
  201 |       canvas = document.querySelector('canvas')!.getBoundingClientRect(),
  202 |       panel = document.querySelector('#dialog')!.getBoundingClientRect();
  203 |     return [f.lighthouse, f.boat, ...f.passengers].map((box: any) => ({
  204 |       id: box.id ?? 'landmark/boat',
  205 |       overlapWidth:
  206 |         Math.min(canvas.left + box.right, panel.right) -
  207 |         Math.max(canvas.left + box.left, panel.left),
  208 |       overlapHeight:
  209 |         Math.min(canvas.top + box.bottom, panel.bottom) - Math.max(canvas.top + box.top, panel.top),
  210 |     }));
  211 |   });
  212 |   for (const item of covered)
  213 |     expect(
  214 |       item.overlapWidth <= 0.5 || item.overlapHeight <= 0.5,
  215 |       `${item.id} covered by ending`,
  216 |     ).toBe(true);
  217 |   return value;
  218 | }
  219 | 
  220 | async function restoredMap(page: Page, camera: any) {
> 221 |   expect((await scene(page)).camera).toEqual(camera);
      |                                      ^ Error: expect(received).toEqual(expected) // deep equality
  222 |   const markers = await page.evaluate(() => {
  223 |     const frame = (window as any).__LAST_FERRY__.getFrameStatus(),
  224 |       canvas = document.querySelector('canvas')!.getBoundingClientRect();
  225 |     return frame.nodes.map((node: any) => {
  226 |       const target = document.querySelector(`#map-${node.id} .map-hit`)!.getBoundingClientRect();
  227 |       return {
  228 |         id: node.id,
  229 |         dx: target.left + target.width / 2 - canvas.left - node.x,
  230 |         dy: target.top + target.height / 2 - canvas.top - node.y,
  231 |       };
  232 |     });
  233 |   });
  234 |   for (const marker of markers) {
  235 |     expect(Math.abs(marker.dx), `${marker.id} horizontal projection`).toBeLessThan(1);
  236 |     expect(Math.abs(marker.dy), `${marker.id} vertical projection`).toBeLessThan(1);
  237 |   }
  238 |   const point = await page.evaluate(() => {
  239 |     const api = (window as any).__LAST_FERRY__,
  240 |       f = api.getFrameStatus(),
  241 |       canvas = document.querySelector('canvas')!,
  242 |       bounds = canvas.getBoundingClientRect();
  243 |     for (const fy of [0.5, 0.25, 0.75, 0.1, 0.9])
  244 |       for (const fx of [0.5, 0.25, 0.75, 0.1, 0.9]) {
  245 |         const x = f.boat.left + (f.boat.right - f.boat.left) * fx,
  246 |           y = f.boat.top + (f.boat.bottom - f.boat.top) * fy;
  247 |         if (
  248 |           api.getPickDetailAt(x, y)?.kind === 'ferry' &&
  249 |           document.elementFromPoint(bounds.left + x, bounds.top + y) === canvas
  250 |         )
  251 |           return { x: bounds.left + x, y: bounds.top + y };
  252 |       }
  253 |     return null;
  254 |   });
  255 |   expect(
  256 |     point,
  257 |     'A visible actual ferry must remain selectable after camera restoration',
  258 |   ).not.toBeNull();
  259 |   const before = await state(page);
  260 |   await page.mouse.click(point!.x, point!.y);
  261 |   await expect(page.locator('#local-context')).toBeVisible();
  262 |   expect(await state(page)).toEqual(before);
  263 |   await page.keyboard.press('Escape');
  264 | }
  265 | 
  266 | test('homecoming desktop: subset and tide Undo, finite cancellation, settled Settings and honest progression', async ({
  267 |   page,
  268 | }) => {
  269 |   test.setTimeout(180000);
  270 |   await ready(page, 'holding-pier');
  271 |   await observed(page, 'desktop-holding', async (save) => {
  272 |     await save('ordinary', true);
  273 |     await approach(page, holdingApproach, false, true);
  274 |     const before = await state(page),
  275 |       normalCamera = (await scene(page)).camera;
  276 |     await activate(page, 'unload');
  277 |     await activate(page, 'passenger-rabbit-1');
  278 |     await activate(page, 'passenger-rabbit-2');
  279 |     await activate(page, 'commit');
  280 |     await idle(page);
  281 |     expect(await state(page)).toMatchObject({ status: 'playing', delivered: ['sheep-1'] });
  282 |     expect(await homecoming(page)).toMatchObject({ active: false, celebrations: 0 });
  283 |     await undo(page);
  284 |     expect(await state(page)).toEqual(before);
  285 |     await act(page, 'unload');
  286 |     expect(await homecoming(page)).toMatchObject({ active: true, finite: true, celebrations: 1 });
  287 |     await undo(page);
  288 |     expect(await state(page)).toEqual(before);
  289 |     expect(await homecoming(page)).toMatchObject({ active: false, finite: false });
  290 |     await save('finite-undo-restored');
  291 |     await restoredMap(page, normalCamera);
  292 |     await act(page, 'unload');
  293 |     await save('visible-arrival', true);
  294 |     await settled(page);
  295 |     expect(await homecoming(page)).toMatchObject({ celebrations: 2 });
  296 |     await controls(page);
  297 |     await framing(page);
  298 |     await save('settled-ending', true);
  299 |     await dialogCycle(page, 'next-cove');
  300 |     await tabTo(page, 'terminal-settings');
  301 |     const mutedBeforeSettings = (await audio(page)).muted;
  302 |     await page.keyboard.down('Enter');
  303 |     await page.keyboard.press('Enter');
  304 |     await page.keyboard.up('Enter');
  305 |     await expect(page.locator('#settings-sound')).toBeFocused();
  306 |     expect((await audio(page)).muted).toBe(mutedBeforeSettings);
  307 |     const stableState = await state(page),
  308 |       stableAudio = await audio(page),
  309 |       stableHome = await homecoming(page);
  310 |     await controls(page);
  311 |     await save('settings', true);
  312 |     await dialogCycle(page, 'settings-sound');
  313 |     await page.keyboard.press('Escape');
  314 |     await expect(page.locator('#terminal-settings')).toBeFocused();
  315 |     expect(await state(page)).toEqual(stableState);
  316 |     expect(await audio(page)).toMatchObject({
  317 |       deliveryCount: stableAudio.deliveryCount,
  318 |       arrivalEventCount: stableAudio.arrivalEventCount,
  319 |       victoryTarget: 0.5,
  320 |     });
  321 |     expect((await homecoming(page)).celebrations).toBe(stableHome.celebrations);
```