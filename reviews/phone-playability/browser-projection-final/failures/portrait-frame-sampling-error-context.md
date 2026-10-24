# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone layout 360x740: readable Play and deliberate complete Whole cove
- Location: tests\e2e\phone-playability.spec.ts:184:3

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 2
Received:   136.65625
```

# Test source

```ts
  10  | const frame = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
  11  | const placement = (page: Page) =>
  12  |   page.evaluate(() => (window as any).__LAST_FERRY__.getActionPlacement());
  13  | const stable = (page: Page) =>
  14  |   page.evaluate(() => {
  15  |     const a = (window as any).__LAST_FERRY__;
  16  |     const pose = a.getJourneyStatus().pose;
  17  |     return {
  18  |       state: a.getState(),
  19  |       history: a.getRenderStatus().historyLength,
  20  |       pose: { heading: pose.heading, history: pose.history },
  21  |     };
  22  |   });
  23  | const rect = (page: Page, id: string) =>
  24  |   page.locator(`#${id}`).evaluate((e) => {
  25  |     const r = e.getBoundingClientRect();
  26  |     return {
  27  |       left: r.left,
  28  |       top: r.top,
  29  |       right: r.right,
  30  |       bottom: r.bottom,
  31  |       width: r.width,
  32  |       height: r.height,
  33  |     };
  34  |   });
  35  | async function visibleInViewport(page: Page, id: string) {
  36  |   return page.locator(`#${id}`).evaluate((e) => {
  37  |     const r = e.getBoundingClientRect();
  38  |     return (
  39  |       !e.closest('.offscreen') &&
  40  |       getComputedStyle(e).opacity !== '0' &&
  41  |       r.width > 0 &&
  42  |       r.height > 0 &&
  43  |       r.left >= 0 &&
  44  |       r.top >= 0 &&
  45  |       r.right <= innerWidth &&
  46  |       r.bottom <= innerHeight
  47  |     );
  48  |   });
  49  | }
  50  | async function press(page: Page, id: string, touch = true) {
  51  |   await fullyVisible(page, page.locator(`#${id}`));
  52  |   if (touch) await page.locator(`#${id}`).tap();
  53  |   else await page.locator(`#${id}`).click();
  54  | }
  55  | async function whole(page: Page, touch = true) {
  56  |   if ((await page.locator('#view-toggle').textContent())?.includes('Whole cove'))
  57  |     await press(page, 'view-toggle', touch);
  58  |   await page.waitForTimeout(200);
  59  | }
  60  | async function place(page: Page, id: string, touch = true) {
  61  |   if (!(await visibleInViewport(page, `map-${id}`))) await whole(page, touch);
  62  |   await press(page, `map-${id}`, touch);
  63  |   await expect(page.locator('#local-context')).toBeVisible();
  64  | }
  65  | async function move(page: Page, id: string, touch = true) {
  66  |   await place(page, id, touch);
  67  |   await press(page, 'sail', touch);
  68  |   await idle(page);
  69  | }
  70  | async function transfer(page: Page, id: 'board' | 'unload', touch = true) {
  71  |   if (!(await page.locator(`#${id}`).isVisible()))
  72  |     await place(page, (await state(page)).boatNodeId, touch);
  73  |   await press(page, id, touch);
  74  |   await press(page, 'commit', touch);
  75  |   await idle(page);
  76  | }
  77  | async function noOverflow(page: Page) {
  78  |   const result = await page.evaluate(() => ({
  79  |     width: innerWidth,
  80  |     height: innerHeight,
  81  |     scrollWidth: document.documentElement.scrollWidth,
  82  |     scrollHeight: document.documentElement.scrollHeight,
  83  |     app: document.querySelector('#app')!.getBoundingClientRect().toJSON(),
  84  |   }));
  85  |   expect(result.scrollWidth).toBeLessThanOrEqual(result.width + 1);
  86  |   expect(result.app.bottom).toBeLessThanOrEqual(result.height + 1);
  87  |   expect(result.app.height).toBeGreaterThan(result.height - 2);
  88  | }
  89  | async function activeSubjects(page: Page) {
  90  |   const f = await frame(page),
  91  |     v = await viewport(page),
  92  |     b = f.boat,
  93  |     c = v.canvas;
  94  |   expect(b.left + c.left).toBeGreaterThanOrEqual(v.usable.left - 1);
  95  |   expect(b.right + c.left).toBeLessThanOrEqual(v.usable.right + 1);
  96  |   expect(b.top + c.top).toBeGreaterThanOrEqual(v.usable.top - 1);
  97  |   expect(b.bottom + c.top).toBeLessThanOrEqual(v.usable.bottom + 1);
  98  |   return { width: b.right - b.left, height: b.bottom - b.top };
  99  | }
  100 | async function markerAlignment(page: Page, all = false) {
  101 |   const f = await frame(page),
  102 |     c = await page.locator('canvas').boundingBox();
  103 |   expect(c).not.toBeNull();
  104 |   for (const node of f.nodes) {
  105 |     const control = page.locator(`#map-${node.id}`);
  106 |     if (!all && !(await visibleInViewport(page, `map-${node.id}`))) continue;
  107 |     if (all) await fullyVisible(page, control);
  108 |     const marker = await control.boundingBox();
  109 |     expect(marker).not.toBeNull();
> 110 |     expect(Math.abs(marker!.x + marker!.width / 2 - (node.x + c!.x))).toBeLessThan(2);
      |                                                                       ^ Error: expect(received).toBeLessThan(expected)
  111 |     expect(Math.abs(marker!.y + marker!.height / 2 - (node.y + c!.y))).toBeLessThan(2);
  112 |   }
  113 | }
  114 | async function observed(
  115 |   page: Page,
  116 |   name: string,
  117 |   run: (save: (label: string, shot?: boolean) => Promise<any>) => Promise<void>,
  118 | ) {
  119 |   mkdirSync(`${reviewDir}/raw`, { recursive: true });
  120 |   const observations: any[] = [],
  121 |     errors: string[] = [];
  122 |   let failure: string | null = null;
  123 |   page.on('pageerror', (error) => errors.push(error.message));
  124 |   const save = async (label: string, shot = false) => {
  125 |     const data = await page.evaluate((label) => {
  126 |       const a = (window as any).__LAST_FERRY__;
  127 |       return {
  128 |         label,
  129 |         at: performance.now(),
  130 |         state: a.getState(),
  131 |         render: a.getRenderStatus(),
  132 |         frame: a.getFrameStatus(),
  133 |         view: a.getViewStatus(),
  134 |         viewport: a.getViewportStatus(),
  135 |         action: a.getActionPlacement(),
  136 |         selection: a.getSelectionStatus(),
  137 |         metrics: a.getMetrics(),
  138 |         fullscreen: {
  139 |           element: document.fullscreenElement?.id ?? null,
  140 |           enabled: document.fullscreenEnabled,
  141 |           dialogInside: !!document.fullscreenElement?.contains(document.querySelector('#dialog')),
  142 |         },
  143 |         audio: a.getAudioStatus(),
  144 |         transition: a.getTransitionStatus(),
  145 |       };
  146 |     }, label);
  147 |     observations.push(data);
  148 |     if (shot) await page.screenshot({ path: `${reviewDir}/${name}-${label}.png` });
  149 |     return data;
  150 |   };
  151 |   try {
  152 |     await run(save);
  153 |     expect(errors).toEqual([]);
  154 |   } catch (error) {
  155 |     failure = String((error as Error).stack ?? error);
  156 |     throw error;
  157 |   } finally {
  158 |     writeFileSync(
  159 |       `${reviewDir}/${name}.json`,
  160 |       JSON.stringify(
  161 |         {
  162 |           name,
  163 |           recordedAt: new Date().toISOString(),
  164 |           input:
  165 |             'Playwright touchscreen taps except separately labeled pointer/mouse or keyboard gestures',
  166 |           observations,
  167 |           errors,
  168 |           failure,
  169 |         },
  170 |         null,
  171 |         2,
  172 |       ),
  173 |     );
  174 |   }
  175 | }
  176 | 
  177 | for (const [width, height] of [
  178 |   [844, 390],
  179 |   [780, 390],
  180 |   [780, 320],
  181 |   [390, 844],
  182 |   [360, 740],
  183 | ])
  184 |   test(`phone layout ${width}x${height}: readable Play and deliberate complete Whole cove`, async ({
  185 |     browser,
  186 |   }) => {
  187 |     const context = await browser.newContext({
  188 |       baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  189 |       viewport: { width, height },
  190 |       deviceScaleFactor: 1,
  191 |       hasTouch: true,
  192 |       isMobile: true,
  193 |       reducedMotion: 'no-preference',
  194 |     });
  195 |     const page = await context.newPage();
  196 |     try {
  197 |       await ready(page, 'holding-pier');
  198 |       await observed(page, `layout-${width}x${height}`, async (save) => {
  199 |         await noOverflow(page);
  200 |         const original = await stable(page),
  201 |           dimensions = await activeSubjects(page);
  202 |         const baselineWidth: Record<string, number> = {
  203 |           '844x390': 69.09490461811049,
  204 |           '780x390': 61.22599696480856,
  205 |           '780x320': 59.120034927559686,
  206 |           '390x844': 46.607412399413136,
  207 |           '360x740': 42.70176331566341,
  208 |         };
  209 |         expect(dimensions.width).toBeGreaterThan(baselineWidth[`${width}x${height}`] * 1.25);
  210 |         await fullyVisible(page, page.locator('#unload'));
```