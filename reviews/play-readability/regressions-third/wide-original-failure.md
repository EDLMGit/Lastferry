# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: play-readability-regressions.spec.ts >> Wide Berth full-six pickup and staged subset retain native controls and both camera modes
- Location: tests\e2e\play-readability-regressions.spec.ts:174:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  - 1
+ Received  + 1

@@ -5,8 +5,8 @@
      "poppy",
      "wren",
    ],
    "boatNodeId": "high-quay",
    "status": "playing",
-   "tideLevel": 1,
+   "tideLevel": 0,
    "turn": 4,
  }
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Wide Berth" [ref=e4]:
    - generic "Wide Berth. Use the labeled waypoint controls to navigate." [ref=e6]
    - button "6 of 6 spaces · boat needs depth 4 · crossing status" [ref=e7] [cursor=pointer]:
      - generic: 6/6 · Depth 4
    - navigation "Crossing controls" [ref=e8]:
      - button "Undo" [ref=e9] [cursor=pointer]
      - button "Wait · 1 action" [ref=e10] [cursor=pointer]
      - button "Menu" [ref=e11] [cursor=pointer]
      - button "Mute sound" [ref=e12] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; adjacent, too shallow; Home, delivery destination":
          - generic [aria-hidden] [ref=e14] [cursor=pointer]: ╱
          - generic [ref=e15] [cursor=pointer]: Harbor · Home
      - generic:
        - button "Select High Quay; current location" [active]:
          - generic [aria-hidden] [ref=e18] [cursor=pointer]: •
          - generic [ref=e19] [cursor=pointer]: High Quay
      - generic:
        - button "Select Wide Berth; adjacent passage available":
          - generic [ref=e21] [cursor=pointer]
          - generic [ref=e23] [cursor=pointer]: Wide Berth
      - generic:
        - button "Select Shell Landing; adjacent, too shallow":
          - generic [aria-hidden] [ref=e26] [cursor=pointer]: ╱
          - generic [ref=e27] [cursor=pointer]: Shell Landing
      - generic:
        - button "Select Outer Buoy; adjacent passage available":
          - generic [ref=e29] [cursor=pointer]
          - generic [ref=e31] [cursor=pointer]: Outer Buoy
    - navigation "Passenger actions at High Quay" [ref=e33]:
      - button "Let ashore" [ref=e34] [cursor=pointer]
    - button "Open tide and pier forecast" [ref=e35] [cursor=pointer]:
      - generic [aria-hidden] [ref=e36]: "!"
      - strong [ref=e37]: Shell Landing floods in 6 actions.
    - navigation "Cove view" [ref=e38]:
      - button "Play view" [pressed] [ref=e39] [cursor=pointer]
      - button "Back to boat" [ref=e40] [cursor=pointer]
  - status [ref=e41]: 4 actions completed. Shell Landing floods in 6 actions.
```

# Test source

```ts
  94  |         .filter(
  95  |           (element) =>
  96  |             element.scrollWidth > element.clientWidth + 1 &&
  97  |             getComputedStyle(element).overflowX !== 'visible',
  98  |         )
  99  |         .map((element) => element.className),
  100 |     );
  101 |     expect(overflow).toEqual([]);
  102 |   }
  103 |   await fullyVisible(page, page.locator('#commit'));
  104 |   await fullyVisible(page, page.locator('#cancel'));
  105 | }
  106 | async function cameraFrames(page: Page, name: string) {
  107 |   const before = await state(page);
  108 |   await page.keyboard.press('Escape');
  109 |   for (const size of sizes) {
  110 |     await page.setViewportSize(size);
  111 |     if ((await page.locator('#view-toggle').innerText()).includes('Play view'))
  112 |       await activate(page, 'view-toggle', true);
  113 |     if (await page.locator('#back-to-boat').isVisible()) await activate(page, 'back-to-boat', true);
  114 |     await expect(page.locator('#view-toggle')).toContainText('Whole cove');
  115 |     for (const id of ['load-toggle', 'undo', 'menu', 'view-toggle'])
  116 |       await fullyVisible(page, page.locator(`#${id}`));
  117 |     await shot(page, `${name}-${size.width}x${size.height}-play`);
  118 |     await wholeCove(page, true);
  119 |     await expect(page.locator('#view-toggle')).toContainText('Play view');
  120 |     await shot(page, `${name}-${size.width}x${size.height}-overview`);
  121 |     expect(await state(page)).toEqual(before);
  122 |   }
  123 | }
  124 | 
  125 | test('Bellwater actual rabbit pickup retains free subsets, loaded views and Undo', async ({
  126 |   browser,
  127 |   baseURL,
  128 | }) => {
  129 |   const context = await browser.newContext({
  130 |     baseURL,
  131 |     viewport: sizes[0],
  132 |     deviceScaleFactor: 1,
  133 |     hasTouch: true,
  134 |   });
  135 |   const page = await context.newPage(),
  136 |     errors: string[] = [];
  137 |   page.on('pageerror', (error) => errors.push(error.message));
  138 |   await ready(page, 'bellwater');
  139 |   const prefix = bellwaterWitnesses.witnesses
  140 |     .find((witness) => witness.id === 'shallow-outward-deep-return')!
  141 |     .actions.slice(0, 2);
  142 |   for (const action of prefix) await act(page, `map-${action.to}`, true);
  143 |   const before = await state(page);
  144 |   await activate(page, 'board', true);
  145 |   await expect(page.locator('.passenger-options button')).toHaveCount(2);
  146 |   await fitChoices(page);
  147 |   await activate(page, 'passenger-lark', true);
  148 |   await expect(page.locator('#passenger-lark')).toHaveAttribute('aria-pressed', 'false');
  149 |   await expect(page.locator('#passenger-tansy')).toHaveAttribute('aria-pressed', 'true');
  150 |   expect(await state(page)).toEqual(before);
  151 |   await shot(page, 'bellwater-390x844-subset');
  152 |   await activate(page, 'passenger-lark', true);
  153 |   await activate(page, 'commit', true);
  154 |   await idle(page);
  155 |   expect(await state(page)).toMatchObject({
  156 |     turn: 3,
  157 |     aboard: ['tansy', 'lark'],
  158 |     status: 'playing',
  159 |   });
  160 |   await cameraFrames(page, 'bellwater-loaded');
  161 |   await activate(page, 'unload', true);
  162 |   await fitChoices(page);
  163 |   await activate(page, 'passenger-lark', true);
  164 |   await expect(page.locator('.consequence')).toContainText('This ends the crossing');
  165 |   await shot(page, 'bellwater-780x320-unload-warning');
  166 |   await page.keyboard.press('Escape');
  167 |   expect((await state(page)).turn).toBe(3);
  168 |   await undo(page, true);
  169 |   expect(await state(page)).toEqual(before);
  170 |   expect(errors).toEqual([]);
  171 |   await context.close();
  172 | });
  173 | 
  174 | test('Wide Berth full-six pickup and staged subset retain native controls and both camera modes', async ({
  175 |   browser,
  176 |   baseURL,
  177 | }) => {
  178 |   const context = await browser.newContext({
  179 |     baseURL,
  180 |     viewport: sizes[0],
  181 |     deviceScaleFactor: 1,
  182 |     hasTouch: true,
  183 |   });
  184 |   const page = await context.newPage(),
  185 |     errors: string[] = [];
  186 |   page.on('pageerror', (error) => errors.push(error.message));
  187 |   await ready(page, 'wide-berth');
  188 |   const prefix = wideWitnesses.witnesses
  189 |     .find((witness) => witness.id === 'stage-sheep-light-return')!
  190 |     .actions.slice(0, 4);
  191 |   for (const action of prefix)
  192 |     await act(page, action.type === 'move' ? `map-${action.to}` : action.type, true);
  193 |   const full = await state(page);
> 194 |   expect(full).toMatchObject({
      |                ^ Error: expect(received).toMatchObject(expected)
  195 |     turn: 4,
  196 |     tideLevel: 1,
  197 |     aboard: ['alder', 'clover', 'poppy', 'wren'],
  198 |     boatNodeId: 'high-quay',
  199 |     status: 'playing',
  200 |   });
  201 |   await expect(page.locator('#load-toggle')).toContainText('6/6');
  202 |   await cameraFrames(page, 'wide-full-six');
  203 |   await activate(page, 'unload', true);
  204 |   await expect(page.locator('.passenger-options button')).toHaveCount(4);
  205 |   await fitChoices(page);
  206 |   for (const id of ['poppy', 'wren']) await activate(page, `passenger-${id}`, true);
  207 |   await expect(page.locator('#commit')).toContainText('Let Alder and Clover ashore');
  208 |   expect(await state(page)).toEqual(full);
  209 |   await shot(page, 'wide-780x320-staging-subset');
  210 |   await activate(page, 'commit', true);
  211 |   await idle(page);
  212 |   expect(await state(page)).toMatchObject({
  213 |     turn: 5,
  214 |     aboard: ['poppy', 'wren'],
  215 |     status: 'playing',
  216 |   });
  217 |   await shot(page, 'wide-780x320-staged');
  218 |   await undo(page, true);
  219 |   expect(await state(page)).toEqual(full);
  220 |   expect(errors).toEqual([]);
  221 |   await context.close();
  222 | });
  223 | 
  224 | test('First Crossing initial practice retains its original roster and free inspection', async ({
  225 |   browser,
  226 |   baseURL,
  227 | }) => {
  228 |   const context = await browser.newContext({
  229 |     baseURL,
  230 |     viewport: sizes[0],
  231 |     deviceScaleFactor: 1,
  232 |     hasTouch: true,
  233 |   });
  234 |   const page = await context.newPage();
  235 |   await ready(page, 'first-crossing');
  236 |   const initial = await state(page);
  237 |   expect(initial).toMatchObject({ turn: 0, aboard: ['rabbit-1', 'rabbit-2'], status: 'playing' });
  238 |   await cameraFrames(page, 'first-crossing-initial');
  239 |   await activate(page, 'map-harbor', true);
  240 |   await expect(page.locator('#local-context')).toBeVisible();
  241 |   expect(await state(page)).toEqual(initial);
  242 |   await page.keyboard.press('Escape');
  243 |   await expect(page.locator('#map-harbor')).toBeFocused();
  244 |   expect(await page.evaluate(() => (window as any).__LAST_FERRY__.getCampaignStatus().entry)).toBe(
  245 |     'direct',
  246 |   );
  247 |   await context.close();
  248 | });
  249 | 
  250 | test('Home Options preserve natural focus, sound mute and inactive gameplay after phone rotation', async ({
  251 |   browser,
  252 |   baseURL,
  253 | }) => {
  254 |   const context = await browser.newContext({
  255 |     baseURL,
  256 |     viewport: sizes[0],
  257 |     deviceScaleFactor: 1,
  258 |     hasTouch: true,
  259 |   });
  260 |   const page = await context.newPage();
  261 |   await page.goto('/');
  262 |   await expect(page.locator('#home-play')).toBeVisible();
  263 |   const before = await state(page);
  264 |   await activate(page, 'home-sound', true);
  265 |   await expect
  266 |     .poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted))
  267 |     .toBe(false);
  268 |   for (const size of sizes) {
  269 |     await page.setViewportSize(size);
  270 |     for (const id of ['home-play', 'home-options', 'home-practice', 'home-sound'])
  271 |       await fullyVisible(page, page.locator(`#${id}`));
  272 |     await shot(page, `home-${size.width}x${size.height}`);
  273 |   }
  274 |   await tabTo(page, 'home-options');
  275 |   await page.keyboard.press('Enter');
  276 |   for (const id of ['settings-sound', 'settings-back', 'motion-preference'])
  277 |     await fullyVisible(page, page.locator(`#${id}`));
  278 |   await expect(page.locator('#settings-sound')).toHaveText(/Mute sound/);
  279 |   await tabTo(page, 'settings-sound');
  280 |   await page.keyboard.press('Enter');
  281 |   await expect
  282 |     .poll(() => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus().muted))
  283 |     .toBe(true);
  284 |   await shot(page, 'home-780x320-settings-muted');
  285 |   await activate(page, 'settings-back', true);
  286 |   await expect(page.locator('#home-options')).toBeFocused();
  287 |   expect(await state(page)).toEqual(before);
  288 |   await expect(page.locator('#seascape')).toHaveAttribute('inert', '');
  289 |   expect(await page.evaluate(() => localStorage.getItem('last-ferry-muted'))).toBe('true');
  290 |   await context.close();
  291 | });
  292 | 
```