import { test, expect, type Locator, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { activate, act, ready, state, rendered, idle, undo, fullyVisible, readable } from './ui';

async function noOverlap(first: Locator, second: Locator) {
  const a = await first.boundingBox(),
    b = await second.boundingBox();
  expect(a).not.toBeNull();
  expect(b).not.toBeNull();
  const width = Math.min(a!.x + a!.width, b!.x + b!.width) - Math.max(a!.x, b!.x);
  const height = Math.min(a!.y + a!.height, b!.y + b!.height) - Math.max(a!.y, b!.y);
  const viewport = first.page().viewportSize()!;
  const detail = {
    first: first.toString(),
    second: second.toString(),
    firstBounds: a,
    secondBounds: b,
    width,
    height,
    viewport,
  };
  if (width > 0.5 && height > 0.5) {
    await first.page().screenshot({
      path: `${reviewDir}/responsive-overlap-${viewport.width}x${viewport.height}.png`,
    });
    writeFileSync(
      `${reviewDir}/responsive-overlap-${viewport.width}x${viewport.height}.json`,
      JSON.stringify(detail, null, 2),
    );
  }
  expect(width <= 0.5 || height <= 0.5, JSON.stringify(detail)).toBe(true);
}

async function localLayout(page: Page) {
  const local = page.locator('#local-context');
  await fullyVisible(page, local, false);
  await fullyVisible(page, page.locator('#status-toggle'));
  await readable(page.locator('#local-heading'));
  const measurements = await local.evaluate((element) => {
    const rect = element.getBoundingClientRect(),
      style = getComputedStyle(element);
    const children = [...element.children].map((child) => child.getBoundingClientRect());
    const contentHeight =
      Math.max(...children.map((child) => child.bottom)) -
      Math.min(...children.map((child) => child.top));
    const extra = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce(
      (sum, property) =>
        sum + Number.parseFloat(style[property as keyof CSSStyleDeclaration] as string),
      0,
    );
    return {
      width: innerWidth,
      height: innerHeight,
      cardHeight: rect.height,
      naturalHeight: contentHeight + extra,
      inlineTop: (element as HTMLElement).style.top,
      inlineLeft: (element as HTMLElement).style.left,
    };
  });
  expect(measurements.cardHeight).toBeLessThanOrEqual(measurements.naturalHeight + 1);
  expect(measurements.cardHeight).toBeLessThanOrEqual(120);
  if (measurements.width > 700 && measurements.height <= 600) {
    expect(measurements.inlineTop).toBe('');
    expect(measurements.inlineLeft).toBe('');
  }
  await noOverlap(local, page.locator('#status-toggle'));
  for (const route of await page.locator('#map-labels button').all()) {
    await fullyVisible(page, route);
    await noOverlap(local, route);
  }
  for (const button of await page.locator('#local-actions button').all()) {
    await fullyVisible(page, button);
    await readable(button);
  }
  return measurements;
}

async function resize(page: Page, width: number, height: number) {
  const frames = await page.evaluate(() => (window as any).__LAST_FERRY__.getMetrics().frames);
  await page.setViewportSize({ width, height });
  await page.waitForFunction(
    (prior) => (window as any).__LAST_FERRY__.getMetrics().frames > prior + 1,
    frames,
  );
}

for (const [width, height] of [
  [844, 500],
  [1024, 600],
] as const) {
  for (const touch of [false, true]) {
    const input = touch ? 'touch' : 'mouse';
    test(`responsive ${width}x${height} ${input}: local card, forecast, breakpoint resize and nine-action rescue`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        hasTouch: touch,
        isMobile: touch,
      });
      const page = await context.newPage();
      mkdirSync(reviewDir, { recursive: true });
      await ready(page, 'holding-pier');
      const layouts = [await localLayout(page)],
        original = await state(page);
      await activate(page, 'status-toggle', touch);
      await expect(page.locator('.forecast-detail')).toContainText('Rabbit Pier');
      expect(await state(page)).toEqual(original);
      await activate(page, 'cancel', touch);
      await act(page, 'unload', touch);
      expect(await state(page)).toMatchObject({
        turn: 1,
        boatNodeId: 'stone',
        aboard: [],
        waitingByPier: { 'stone-pier': ['sheep-1'] },
      });
      layouts.push(await localLayout(page));
      await page.screenshot({
        path: `${reviewDir}/responsive-${width}x${height}-${input}-unloaded.png`,
      });
      const afterUnloading = await state(page);
      await act(page, 'map-shallows', touch);
      expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
      await expect(page.locator('#dialog')).not.toBeVisible();
      await undo(page, touch);
      expect(await state(page)).toEqual(afterUnloading);
      for (const [nextWidth, nextHeight] of [
        [844, 480],
        [844, 481],
        [1024, 600],
        [1024, 601],
        [1440, 900],
        [1024, 601],
        [1024, 600],
        [844, 481],
        [844, 480],
        [844, 390],
        [780, 390],
        [width, height],
      ]) {
        await resize(page, nextWidth, nextHeight);
        layouts.push(await localLayout(page));
        expect(await state(page)).toEqual(afterUnloading);
      }
      const route = page.locator('#map-shallows');
      expect(
        await route.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return document
            .elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
            ?.closest('button')?.id;
        }),
      ).toBe('map-shallows');
      await act(page, 'map-shallows', touch);
      expect(await state(page)).toMatchObject({ turn: 2, boatNodeId: 'shallows' });
      await expect(page.locator('#dialog')).not.toBeVisible();
      for (const id of [
        'map-rabbit-pier',
        'board',
        'map-shallows',
        'map-stone',
        'board',
        'map-harbor',
        'unload',
      ])
        await act(page, id, touch);
      expect(await state(page)).toMatchObject({
        turn: 9,
        tideLevel: 2,
        status: 'won',
        aboard: [],
        delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'],
      });
      await fullyVisible(page, page.locator('#terminal-undo'));
      writeFileSync(
        `${reviewDir}/responsive-${width}x${height}-${input}.json`,
        JSON.stringify(
          {
            input,
            touchEmulation: touch,
            browser: browser.version(),
            userAgent: await page.evaluate(() => navigator.userAgent),
            layouts,
            initialState: original,
            afterUnloading,
            finalState: await state(page),
          },
          null,
          2,
        ),
      );
      await context.close();
    });
  }
}

for (const reduced of [false, true]) {
  test(`rapid phone Confirm ${reduced ? 'reduced' : 'normal'}: trusted touch spacing, one commit and no background dialog`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 844, height: 390 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    mkdirSync(reviewDir, { recursive: true });
    await ready(page, 'first-crossing');
    await act(page, 'map-sheep-pier', true);
    await activate(page, 'board', true);
    await fullyVisible(page, page.locator('#commit'));
    const before = await state(page),
      beforeRender = await rendered(page),
      bounds = await page.locator('#commit').boundingBox();
    await page.evaluate(() => {
      const w = window as any;
      w.__phaseAInput = [];
      const record = (event: Event) => {
        const pointer = event as PointerEvent,
          target = event.target as Element;
        w.__phaseAInput.push({
          type: event.type,
          at: event.timeStamp,
          observedAt: performance.now(),
          trusted: event.isTrusted,
          target: target.closest('[id]')?.id ?? '',
          pointerType: pointer.pointerType ?? '',
          x: pointer.clientX,
          y: pointer.clientY,
          turn: w.__LAST_FERRY__.getState().turn,
          history: w.__LAST_FERRY__.getRenderStatus().historyLength,
          dialog: document.getElementById('dialog')?.hasAttribute('open'),
        });
      };
      for (const type of ['pointerdown', 'pointerup', 'click'])
        window.addEventListener(type, record, true);
    });
    const x = bounds!.x + bounds!.width / 2,
      y = bounds!.y + bounds!.height / 2;
    await page.touchscreen.tap(x, y);
    if (reduced) await idle(page);
    await page.touchscreen.tap(x, y);
    await idle(page);
    const events = await page.evaluate(() => (window as any).__phaseAInput);
    const down = events.filter((event: any) => event.type === 'pointerdown'),
      up = events.filter((event: any) => event.type === 'pointerup');
    expect(down).toHaveLength(2);
    expect(up).toHaveLength(2);
    const spacing = down[1].at - up[0].at;
    const after = await state(page),
      afterRender = await rendered(page);
    writeFileSync(
      `${reviewDir}/rapid-confirm-${reduced ? 'reduced' : 'normal'}.json`,
      JSON.stringify(
        {
          reducedMotion: reduced,
          recording: false,
          input: 'emulated touch',
          browser: browser.version(),
          userAgent: await page.evaluate(() => navigator.userAgent),
          viewport: [844, 390],
          firstReleaseToSecondPressMs: spacing,
          events,
          before,
          after,
          historyBefore: beforeRender.historyLength,
          historyAfter: afterRender.historyLength,
        },
        null,
        2,
      ),
    );
    expect(events.every((event: any) => event.trusted)).toBe(true);
    expect(down[0]).toMatchObject({ target: 'commit', pointerType: 'touch', turn: 1 });
    expect(
      spacing,
      'The observed touch sequence must be rapid rather than delayed automation',
    ).toBeGreaterThanOrEqual(0);
    expect(
      spacing,
      'The observed touch sequence must be rapid rather than delayed automation',
    ).toBeLessThanOrEqual(180);
    expect(after).toMatchObject({
      turn: 2,
      tideLevel: 0,
      status: 'playing',
      boatNodeId: 'sheep-pier',
      aboard: ['rabbit-1', 'rabbit-2', 'sheep-1'],
      waitingByPier: { 'sheep-pier': [] },
      delivered: [],
    });
    expect(afterRender.historyLength).toBe(beforeRender.historyLength + 1);
    await expect(page.locator('#dialog')).not.toBeVisible();
    await context.close();
  });
}
