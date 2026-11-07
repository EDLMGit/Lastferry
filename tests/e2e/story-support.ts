import { expect, type Page, type CDPSession } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, activate, idle, state, undo } from './ui';

export const journeyKey = 'last-ferry.journey.v1';
export const openingCopy = [
  'Your first evening alone at the helm.',
  'The tide will be high tonight.',
  'Bring everyone to the lighthouse.',
];
export const connectionCopy =
  'Pip, Rue and Moss are safe. Across the water, Bellwater is still waiting.';
export const endpointCopy =
  /Both coves are safe\.[\s\S]*The next part of the journey is still being made\./;
export const checkpoint = (page: Page) =>
  page.evaluate((key) => localStorage.getItem(key), journeyKey);
export const journey = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getCampaignStatus());
export async function title(page: Page) {
  await page.goto('/');
  await expect(page.locator('#journey-new')).toBeVisible();
  await page.waitForFunction(() => ((window as any).__LAST_FERRY__?.getMetrics().frames ?? 0) > 4);
}
export async function startJourney(page: Page, touch = false) {
  await activate(page, 'journey-new', touch);
  await expect(page.locator('#story-skip')).toBeVisible();
  await activate(page, 'story-skip', touch);
  for (const line of openingCopy) await expect(page.locator('#dialog')).toContainText(line);
  await activate(page, 'story-continue', touch);
  await idle(page);
  expect(await state(page)).toMatchObject({
    turn: 0,
    tideLevel: 0,
    boatNodeId: 'stone',
    aboard: ['sheep-1'],
    delivered: [],
  });
}
export async function rescueHolding(page: Page, touch = false, tideUndo = true) {
  await act(page, 'unload', touch);
  await act(page, 'map-shallows', touch);
  await act(page, 'map-rabbit-pier', touch);
  const before = await state(page);
  await act(page, 'board', touch);
  expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing' });
  if (tideUndo) {
    await undo(page, touch);
    expect(await state(page)).toEqual(before);
    await act(page, 'board', touch);
  }
  for (const id of ['map-shallows', 'map-stone', 'board', 'map-harbor', 'unload'])
    await act(page, id, touch);
  expect(await state(page)).toMatchObject({ turn: 9, status: 'won' });
}
export async function rescueBellwater(page: Page, touch = false) {
  for (const id of ['map-shallows', 'map-low-pier', 'board']) await act(page, id, touch);
  if (page.viewportSize()!.height <= 320) await exposeBellwaterEast(page);
  for (const id of [
    'map-east-buoy',
    'map-west-buoy',
    'map-harbor',
    'map-bell-pier',
    'board',
    'map-harbor',
    'unload',
  ])
    await act(page, id, touch);
  expect(await state(page)).toMatchObject({ turn: 10, tideLevel: 2, status: 'won' });
}
export async function exposeBellwaterEast(page: Page) {
  if ((await page.locator('#view-toggle').textContent())?.includes('Play view'))
    await activate(page, 'view-toggle', true);
  const size = page.viewportSize()!;
  const session = await page.context().newCDPSession(page);
  const start = { x: size.width - 82, y: Math.round(size.height * 0.6), id: 7 };
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
  for (let step = 1; step <= 5; step++)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ ...start, y: start.y - step * 16 }],
    });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
export function measureStory() {
  const dialog = document.getElementById('dialog')!;
  const surface = dialog.getBoundingClientRect();
  const failures: string[] = [];
  const nested = [...dialog.querySelectorAll<HTMLElement>('*')]
    .filter((e) => !e.closest('.sr-only') && e.getBoundingClientRect().width > 0)
    .map((e) => {
      const r = e.getBoundingClientRect(),
        s = getComputedStyle(e);
      const overflow = e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1;
      if (overflow && s.display !== 'inline')
        failures.push(
          `${e.id || e.className}: horizontal overflow ${e.scrollWidth}/${e.clientWidth}`,
        );
      return { id: e.id, tag: e.tagName, rect: r.toJSON(), font: s.font, overflow };
    });
  const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
  const lines: {
    text: string;
    rect: ReturnType<DOMRect['toJSON']>;
    fontSize: number;
    fits: boolean;
  }[] = [];
  let text: Node | null;
  while ((text = walker.nextNode())) {
    if (
      !text.textContent?.trim() ||
      text.parentElement?.closest('.sr-only') ||
      !text.parentElement?.getBoundingClientRect().width
    )
      continue;
    const range = document.createRange();
    range.selectNodeContents(text);
    const style = getComputedStyle(text.parentElement);
    for (const r of range.getClientRects()) {
      if (r.width < 0.1) continue;
      const fits =
        r.left >= surface.left - 0.75 &&
        r.right <= surface.right + 0.75 &&
        r.top >= surface.top - 0.75 &&
        r.bottom <= surface.bottom + 0.75;
      lines.push({
        text: text.textContent.trim(),
        rect: r.toJSON(),
        fontSize: parseFloat(style.fontSize),
        fits,
      });
      if (!fits) failures.push(`Text outside dialog: ${text.textContent.trim()}`);
    }
  }
  const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button')]
    .filter((e) => e.getBoundingClientRect().width > 0)
    .map((e) => {
      const r = e.getBoundingClientRect();
      const fits =
        r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5;
      if (!fits) failures.push(`${e.id}: outside viewport`);
      if (r.width < 44 || r.height < 44) failures.push(`${e.id}: target below 44px`);
      return { id: e.id, rect: r.toJSON(), fits };
    });
  return {
    viewport: { width: innerWidth, height: innerHeight },
    surface: surface.toJSON(),
    canvasCount: document.querySelectorAll('canvas').length,
    nested,
    lines,
    buttons,
    failures,
  };
}
export async function captureStory(page: Page, label: string) {
  mkdirSync(reviewDir, { recursive: true });
  const measurement = await page.evaluate(measureStory);
  const info = {
    at: new Date().toISOString(),
    url: page.url(),
    viewport: page.viewportSize(),
    state: await state(page),
    journey: await journey(page),
    measurement,
  };
  writeFileSync(`${reviewDir}/${label}.json`, JSON.stringify(info, null, 2));
  await page.screenshot({ path: `${reviewDir}/${label}.png` });
  expect(measurement.canvasCount).toBe(1);
  expect(measurement.failures).toEqual([]);
  expect(measurement.lines.every((line) => line.fontSize >= 14)).toBe(true);
  return info;
}
const sessions = new WeakMap<Page, CDPSession>();
export async function passive<T, A = undefined>(
  page: Page,
  fn: (arg: A) => T | Promise<T>,
  arg?: A,
): Promise<T> {
  let session = sessions.get(page);
  if (!session) {
    session = await page.context().newCDPSession(page);
    sessions.set(page, session);
  }
  const result = await session.send('Runtime.evaluate', {
    expression: `(${fn.toString()})(${JSON.stringify(arg) ?? 'undefined'})`,
    returnByValue: true,
    awaitPromise: true,
    userGesture: false,
  });
  if (result.exceptionDetails)
    throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value as T;
}
export async function coldTouch(page: Page, id: string) {
  const point = await passive(
    page,
    (id) => {
      const r = document.getElementById(id)!.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    id,
  );
  const session = sessions.get(page)!;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...point, id: 1 }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
