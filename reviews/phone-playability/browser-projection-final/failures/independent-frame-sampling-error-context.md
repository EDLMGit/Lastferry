# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone rendered marker anchors: independent world projection tracks both tide rises, view changes and rotation
- Location: tests\e2e\phone-playability.spec.ts:923:1

# Error details

```
Error: tide2-play harbor actual-world horizontal anchor

expect(received).toBeLessThan(expected)

Expected: < 1
Received:   76.8750276565552
```

# Test source

```ts
  892  |       };
  893  |       await press(page, 'menu');
  894  |       await fits();
  895  |       await save('menu', true);
  896  |       await page.locator('#settings').scrollIntoViewIfNeeded();
  897  |       await press(page, 'settings');
  898  |       await fits();
  899  |       await save('settings', true);
  900  |       await page.locator('#settings-back').scrollIntoViewIfNeeded();
  901  |       await press(page, 'settings-back');
  902  |       await press(page, 'cancel');
  903  |       await press(page, 'status-toggle');
  904  |       await fits();
  905  |       await save('forecast', true);
  906  |       await press(page, 'cancel');
  907  |       await press(page, 'unload');
  908  |       await fits();
  909  |       await fullyVisible(page, page.locator('#commit'));
  910  |       await press(page, 'passenger-sheep-1');
  911  |       await fits();
  912  |       await fullyVisible(page, page.locator('#commit'));
  913  |       await save('action', true);
  914  |       expect(await stable(page)).toEqual(original);
  915  |       await press(page, 'cancel');
  916  |       expect(await stable(page)).toEqual(original);
  917  |     });
  918  |   } finally {
  919  |     await context.close();
  920  |   }
  921  | });
  922  | 
  923  | test('phone rendered marker anchors: independent world projection tracks both tide rises, view changes and rotation', async ({
  924  |   browser,
  925  | }) => {
  926  |   const context = await browser.newContext({
  927  |     baseURL: `http://127.0.0.1:${process.env.LAST_FERRY_DEV_PORT ?? 5173}`,
  928  |     viewport: { width: 844, height: 390 },
  929  |     deviceScaleFactor: 1,
  930  |     hasTouch: true,
  931  |     isMobile: true,
  932  |     reducedMotion: 'no-preference',
  933  |   });
  934  |   const page = await context.newPage();
  935  |   try {
  936  |     await ready(page, 'holding-pier');
  937  |     await observed(page, 'rendered-marker-anchors', async (save) => {
  938  |       const align = async (label: string, shot = false) => {
  939  |         const data = await page.evaluate(() => {
  940  |           const a = (window as any).__LAST_FERRY__,
  941  |             f = a.getFrameStatus();
  942  |           return {
  943  |             camera: f.camera,
  944  |             canvas: document.querySelector('canvas')!.getBoundingClientRect().toJSON(),
  945  |             waterY: a.getEnvironmentStatus().waterY,
  946  |             markers: a.getNavigationStatus().markers.map((m: any) => {
  947  |               const e = document.querySelector<HTMLElement>(`#map-${m.id} .map-hit`)!;
  948  |               return {
  949  |                 id: m.id,
  950  |                 worldPosition: m.worldPosition,
  951  |                 offscreen: !!e.closest('.offscreen'),
  952  |                 rect: e.getBoundingClientRect().toJSON(),
  953  |               };
  954  |             }),
  955  |           };
  956  |         });
  957  |         const inverse = new T.Matrix4().fromArray(data.camera.inverse),
  958  |           projection = new T.Matrix4().fromArray(data.camera.projection);
  959  |         const comparisons = data.markers
  960  |           .filter((m: any) => !m.offscreen)
  961  |           .map((m: any) => {
  962  |             const point = new T.Vector3()
  963  |               .fromArray(m.worldPosition)
  964  |               .applyMatrix4(inverse)
  965  |               .applyMatrix4(projection);
  966  |             const actual = {
  967  |               x: data.canvas.left + ((point.x + 1) * data.canvas.width) / 2,
  968  |               y: data.canvas.top + ((1 - point.y) * data.canvas.height) / 2,
  969  |             };
  970  |             const dom = { x: m.rect.left + m.rect.width / 2, y: m.rect.top + m.rect.height / 2 };
  971  |             return {
  972  |               id: m.id,
  973  |               worldPosition: m.worldPosition,
  974  |               actual,
  975  |               dom,
  976  |               dx: dom.x - actual.x,
  977  |               dy: dom.y - actual.y,
  978  |             };
  979  |           });
  980  |         expect(comparisons.length).toBeGreaterThan(0);
  981  |         const evidence = await save(label, shot);
  982  |         evidence.independentAnchorProjection = {
  983  |           ...data,
  984  |           comparisons,
  985  |           method:
  986  |             'Node Three projection from actual Object3D worldPosition and renderer camera inverse/projection; no logical frame.nodes or world.project call',
  987  |         };
  988  |         for (const comparison of comparisons) {
  989  |           expect(
  990  |             Math.abs(comparison.dx),
  991  |             `${label} ${comparison.id} actual-world horizontal anchor`,
> 992  |           ).toBeLessThan(1);
       |             ^ Error: tide2-play harbor actual-world horizontal anchor
  993  |           expect(
  994  |             Math.abs(comparison.dy),
  995  |             `${label} ${comparison.id} actual-world vertical anchor`,
  996  |           ).toBeLessThan(1);
  997  |         }
  998  |       };
  999  |       await align('tide0');
  1000 |       await transfer(page, 'unload');
  1001 |       await move(page, 'shallows');
  1002 |       await move(page, 'rabbit-pier');
  1003 |       await press(page, 'board');
  1004 |       await press(page, 'commit');
  1005 |       await page.waitForFunction(() => {
  1006 |         const y = (window as any).__LAST_FERRY__.getEnvironmentStatus().waterY;
  1007 |         return y > 0.015 && y < 0.16;
  1008 |       });
  1009 |       await align('rising-tide1');
  1010 |       await idle(page);
  1011 |       await align('tide1', true);
  1012 |       await move(page, 'shallows');
  1013 |       await move(page, 'stone');
  1014 |       await press(page, 'board');
  1015 |       await fullyVisible(page, page.locator('#commit'));
  1016 |       await align('board-footer-tide1', true);
  1017 |       await press(page, 'commit');
  1018 |       await idle(page);
  1019 |       await whole(page);
  1020 |       await place(page, 'harbor');
  1021 |       await press(page, 'sail');
  1022 |       await page.waitForFunction(() => {
  1023 |         const y = (window as any).__LAST_FERRY__.getEnvironmentStatus().waterY;
  1024 |         return y > 0.195 && y < 0.34;
  1025 |       });
  1026 |       await align('rising-tide2-overview');
  1027 |       await idle(page);
  1028 |       await align('tide2-overview', true);
  1029 |       const original = await stable(page);
  1030 |       await press(page, 'back-to-boat');
  1031 |       await align('tide2-play');
  1032 |       const water = await page.evaluate(() => {
  1033 |         const a = (window as any).__LAST_FERRY__,
  1034 |           c = document.querySelector('canvas')!,
  1035 |           r = c.getBoundingClientRect();
  1036 |         for (let y = 90; y < innerHeight - 80; y += 20)
  1037 |           for (let x = 25; x < innerWidth - 120; x += 20)
  1038 |             if (document.elementFromPoint(x, y) === c && !a.getPickDetailAt(x - r.left, y - r.top))
  1039 |               return { x, y };
  1040 |         return null;
  1041 |       });
  1042 |       expect(water).not.toBeNull();
  1043 |       await page.mouse.move(water!.x, water!.y);
  1044 |       await page.mouse.down();
  1045 |       await page.mouse.move(water!.x + 80, water!.y + 35, { steps: 5 });
  1046 |       await page.mouse.up();
  1047 |       await align('tide2-panned');
  1048 |       await press(page, 'back-to-boat');
  1049 |       await page.setViewportSize({ width: 390, height: 844 });
  1050 |       await page.waitForTimeout(150);
  1051 |       await align('tide2-portrait', true);
  1052 |       await whole(page);
  1053 |       await align('tide2-portrait-overview');
  1054 |       await press(page, 'back-to-boat');
  1055 |       await page.setViewportSize({ width: 780, height: 320 });
  1056 |       await page.waitForTimeout(150);
  1057 |       await align('tide2-short-landscape', true);
  1058 |       expect(await stable(page)).toEqual(original);
  1059 |     });
  1060 |   } finally {
  1061 |     await context.close();
  1062 |   }
  1063 | });
  1064 | 
```