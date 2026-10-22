import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { activate, act, ready, state, navigation, idle, undo, tabTo, fullyVisible, readable, dialogCycle, selectPlace } from './ui';

const selection = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getSelectionStatus());
const audio = (page: Page) => page.evaluate(() => (window as any).__LAST_FERRY__.getAudioStatus());

async function selectedPassage(page: Page, destination: string, edgeId: string, selected = true) {
  const view = await navigation(page);
  expect(view.routes.filter((route: any) => route.highlighted).map((route: any) => route.id)).toEqual([edgeId]);
  if (selected) {
    expect(view.selectedDestination).toBe(destination);
    expect(view.markers.find((marker: any) => marker.id === destination).selected).toBe(true);
  }
}

async function backgroundBlocked(page: Page, touch: boolean) {
  const before = await state(page), selected = await selection(page), title = await page.locator('#dialog-title').innerText();
  const card = await page.locator('#dialog').boundingBox();
  let tried = false;
  for (const id of ['map-harbor', 'map-shallows', 'wait', 'menu']) {
    const bounds = await page.locator(`#${id}`).boundingBox();
    if (!bounds) continue;
    const x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2;
    if (x >= card!.x && x <= card!.x + card!.width && y >= card!.y && y <= card!.y + card!.height) continue;
    if (touch) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    tried = true;
    break;
  }
  expect(tried).toBe(true);
  await page.evaluate(() => {
    for (const id of ['map-harbor', 'wait', 'menu']) (document.getElementById(id) as HTMLButtonElement).click();
  });
  expect(await state(page)).toEqual(before);
  expect((await selection(page)).selectedId).toBe(selected.selectedId);
  await expect(page.locator('#dialog-title')).toHaveText(title);
}

for (const [label, width, height, touch] of [
  ['desktop-contextual', 1440, 900, false],
  ['phone-contextual', 844, 390, true],
  ['phone-narrow-contextual', 780, 390, true],
] as const) {
  test(`${label}: selection, explicit sailing, modal safety and tide-boundary subsets`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    mkdirSync(reviewDir, { recursive: true });
    await ready(page, 'holding-pier');
    const hit = (id: string) => activate(page, id, touch);
    const sail = async (id: string) => {
      const before = await state(page);
      await act(page, `map-${id}`, touch);
      expect((await state(page)).turn).toBe(before.turn + 1);
      expect((await state(page)).boatNodeId).toBe(id);
      expect((await selection(page)).selectedId).toBe(id);
      await expect(page.locator('#dialog')).not.toBeVisible();
      await expect(page.locator('#local-heading')).toContainText(id === 'stone' ? 'Stone Pier' : id === 'rabbit-pier' ? 'Rabbit Pier' : id === 'harbor' ? 'Harbor' : 'Shallows');
    };
    const canvas = await page.locator('#world canvas').boundingBox();
    expect(canvas!.x).toBe(0);
    expect(canvas!.width).toBeGreaterThanOrEqual(width - 1);
    await expect(page.locator('#local-context')).toBeHidden();
    await expect(page.locator('.inspect-route, .panel, #controls')).toHaveCount(0);
    await expect(page.locator('#objective')).toHaveText('Bring all three passengers to Harbor');
    await expect(page.locator('#progress')).toHaveText('Home 0/3');
    await expect(page.locator('#boat-summary')).toHaveText('Depth 2 · 2/4 spaces');
    await expect(page.locator('#status-headline')).toHaveText('Rabbit Pier floods in 4 actions.');
    await expect(page.locator('#map-harbor')).toHaveAccessibleName(/Select Harbor.*Home, delivery destination/);
    await expect(page.locator('#map-stone')).toHaveAccessibleName(/Select Stone Pier.*(?:here|current)/i);
    await expect(page.locator('#map-shallows')).toHaveAccessibleName(/Select Shallows.*too shallow/i);
    await expect(page.locator('#map-rabbit-pier')).toHaveAccessibleName(/Select Rabbit Pier.*no direct passage/i);
    await expect(page.locator('#map-stone')).toHaveAttribute('aria-current', 'location');
    for (const id of ['map-harbor', 'map-stone', 'map-shallows', 'map-rabbit-pier', 'undo', 'wait', 'menu', 'status-toggle']) {
      await fullyVisible(page, page.locator(`#${id}`));
      await readable(page.locator(`#${id}`));
    }
    for (const id of ['objective', 'boat-summary', 'status-headline']) await readable(page.locator(`#${id}`));
    const firstNavigation = await navigation(page);
    expect(firstNavigation.markers.map((marker: any) => [marker.id, marker.status])).toEqual([
      ['harbor', 'available'], ['stone', 'current'], ['shallows', 'too-shallow'], ['rabbit-pier', 'nonadjacent'],
    ]);
    expect(new Set(firstNavigation.markers.map((marker: any) => marker.shape)).size).toBe(4);
    const frame = await page.evaluate(() => (window as any).__LAST_FERRY__.getFrameStatus());
    expect(frame.lighthouse.top).toBeGreaterThanOrEqual(8);
    expect(frame.lighthouse.bottom).toBeLessThan(frame.canvas.height - 8);
    for (const node of frame.nodes) {
      expect(node.x).toBeGreaterThan(0); expect(node.x).toBeLessThan(frame.canvas.width);
      expect(node.y).toBeGreaterThan(0); expect(node.y).toBeLessThan(frame.canvas.height);
    }
    for (const passenger of frame.passengers) expect(passenger.height).toBeGreaterThan(22);
    await page.screenshot({ path: `${reviewDir}/${label}-start.png` });
    const initial = await state(page), desired = (await audio(page)).desiredArrangement;
    await hit('map-stone');
    await expect(page.locator('#unload')).toBeVisible();
    expect(await state(page)).toEqual(initial);
    const boat = frame.boat;
    if (touch) await page.touchscreen.tap(canvas!.x + (boat.left + boat.right) / 2, canvas!.y + (boat.top + boat.bottom) / 2);
    else await page.mouse.click(canvas!.x + (boat.left + boat.right) / 2, canvas!.y + (boat.top + boat.bottom) / 2);
    expect((await selection(page)).selectedId).toBe('stone');
    expect(await state(page)).toEqual(initial);
    await hit('map-rabbit-pier');
    await expect(page.locator('#local-context')).toContainText('No direct passage from Stone Pier.');
    await expect(page.locator('#local-context')).toContainText('Pip');
    expect((await navigation(page)).routes.filter((route: any) => route.highlighted)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.locator('#local-context')).toBeHidden();
    if (!touch) {
      await page.locator('#map-harbor').hover(); await selectedPassage(page, 'harbor', 'harbor-stone', false);
      await page.locator('#map-shallows').hover(); await selectedPassage(page, 'shallows', 'stone-shallows', false);
      await expect(page.locator('#local-context')).toBeHidden();
    }
    await hit('map-harbor');
    await expect(page.locator('#local-heading')).toContainText('Harbor');
    await selectedPassage(page, 'harbor', 'harbor-stone');
    await fullyVisible(page, page.locator('#sail'));
    expect(await state(page)).toEqual(initial);
    await hit('map-shallows');
    await expect(page.locator('#local-context')).toContainText('Boat needs depth 2. Passage has depth 1: too shallow.');
    await expect(page.locator('#sail')).toBeDisabled();
    await selectedPassage(page, 'shallows', 'stone-shallows');
    for (const paragraph of await page.locator('#local-context p').all()) await readable(paragraph);
    await page.screenshot({ path: `${reviewDir}/${label}-route-inspection.png` });
    const close = await page.locator('#close-location').boundingBox();
    await page.evaluate(() => {
      const runtime = window as any; runtime.__selectionClicks = [];
      runtime.__traceSelectionClick = (event: MouseEvent) => runtime.__selectionClicks.push({ at: performance.now(), trusted: event.isTrusted, target: (event.target as HTMLElement).id, x: event.clientX, y: event.clientY });
      window.addEventListener('click', runtime.__traceSelectionClick, true);
    });
    if (touch) {
      await page.touchscreen.tap(close!.x + close!.width / 2, close!.y + close!.height / 2);
      await page.touchscreen.tap(close!.x + close!.width / 2, close!.y + close!.height / 2);
    } else {
      await page.mouse.click(close!.x + close!.width / 2, close!.y + close!.height / 2);
      await page.mouse.click(close!.x + close!.width / 2, close!.y + close!.height / 2);
    }
    const clicks = await page.evaluate(() => {
      const runtime = window as any; window.removeEventListener('click', runtime.__traceSelectionClick, true); return runtime.__selectionClicks;
    });
    writeFileSync(`${reviewDir}/${label}-close-clicks.json`, JSON.stringify({ clicks, gapMs: clicks[1]?.at - clicks[0]?.at }, null, 2));
    expect(clicks).toHaveLength(2);
    expect(clicks.every((click: any) => click.trusted)).toBe(true);
    expect(clicks[1].at - clicks[0].at, 'The repeat pair must exercise the existing 180ms input fence').toBeLessThanOrEqual(180);
    expect(await state(page)).toEqual(initial);
    await expect(page.locator('#dialog')).not.toBeVisible();
    await expect(page.locator('#local-context')).toBeHidden();
    await tabTo(page, 'map-shallows');
    await page.keyboard.press('Enter');
    await expect(page.locator('#local-heading')).toBeFocused();
    await page.keyboard.down('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.up('Enter');
    expect(await state(page)).toEqual(initial);
    await expect(page.locator('#local-heading')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#local-context')).toBeHidden();
    await hit('wait'); await dialogCycle(page); await backgroundBlocked(page, touch);
    await page.keyboard.press('Escape'); await expect(page.locator('#wait')).toBeFocused();
    await expect(page.locator('#local-context')).toBeHidden();
    await hit('menu'); await dialogCycle(page); await backgroundBlocked(page, touch);
    for (const id of ['restart', 'sound', 'cove-picker']) await fullyVisible(page, page.locator(`#${id}`));
    const soundLabel = await page.locator('#sound').getAttribute('aria-label');
    await tabTo(page, 'sound'); await page.keyboard.press('Enter');
    await expect(page.locator('#sound')).not.toHaveAttribute('aria-label', soundLabel!);
    const help = page.locator('#help-details summary');
    for (let count = 0; count < 32; count++) { if (await help.evaluate((element) => element === document.activeElement)) break; await page.keyboard.press('Tab'); }
    await expect(help).toBeFocused(); await page.keyboard.press('Enter');
    await expect(page.locator('#help-details')).toContainText('Sailing, boarding, unloading and waiting each cost 1 action. Inspection is free.');
    await page.keyboard.press('Escape'); await expect(page.locator('#menu')).toBeFocused();
    await hit('status-toggle'); await dialogCycle(page); await expect(page.locator('.forecast-detail')).toContainText('Rabbit Pier');
    await page.keyboard.press('Escape'); await expect(page.locator('#status-toggle')).toBeFocused();
    expect(await state(page)).toEqual(initial); expect((await audio(page)).desiredArrangement).toBe(desired);
    await hit('unload');
    await expect(page.locator('#dialog')).toContainText('After unloading: boat needs depth 1.');
    await expect(page.locator('#dialog')).toContainText('Moss will wait at Stone Pier. Stone Pier stays safe through all tide rises.');
    await dialogCycle(page); await fullyVisible(page, page.locator('#commit')); await hit('commit'); await idle(page);
    await sail('shallows'); await sail('rabbit-pier');
    await expect(page.locator('#status-detail')).toContainText('The tide rises after your next action.');
    const dry = await state(page);
    await hit('map-shallows');
    await expect(page.locator('#local-context')).toContainText('This ends the crossing.');
    expect(await state(page)).toEqual(dry);
    await hit('sail'); await expect(page.locator('.consequence')).toContainText('This ends the crossing.');
    await fullyVisible(page, page.locator('.consequence'), false); await hit('cancel');
    await expect(page.locator('#sail')).toBeFocused();
    await hit('board');
    await expect(page.locator('.consequence')).toContainText(/Pip and Rue board(?:, then the tide rises| first\. The tide then rises)\. Both are safe aboard\./);
    for (const id of ['passenger-rabbit-1', 'passenger-rabbit-2']) { await fullyVisible(page, page.locator(`#${id}`)); await readable(page.locator(`#${id}`)); }
    await hit('passenger-rabbit-2'); await expect(page.locator('#passenger-rabbit-2')).toBeFocused();
    await expect(page.locator('.consequence')).toContainText('Rue is still waiting at Rabbit Pier when it floods. This ends the crossing.');
    await fullyVisible(page, page.locator('.requirement'), false); await fullyVisible(page, page.locator('.consequence'), false); await fullyVisible(page, page.locator('#commit'));
    await page.screenshot({ path: `${reviewDir}/${label}-subset-warning.png` });
    expect(await state(page)).toEqual(dry); await hit('commit'); await idle(page);
    expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'lost', lossReason: { passengerIds: ['rabbit-2'] } });
    await expect(page.locator('.loss')).toContainText('Undo earlier moves, or restart'); await dialogCycle(page, 'terminal-undo');
    const loss = await state(page); await page.keyboard.press('Escape'); expect(await state(page)).toEqual(loss);
    await undo(page, touch); expect(await state(page)).toEqual(dry); await expect(page.locator('#local-context')).toBeHidden();
    await hit('board'); await expect(page.locator('.consequence')).toContainText('Both are safe aboard.');
    await fullyVisible(page, page.locator('#commit')); await fullyVisible(page, page.locator('.consequence'), false);
    await page.screenshot({ path: `${reviewDir}/${label}-critical-boarding.png` });
    await hit('commit'); await idle(page);
    expect(await state(page)).toMatchObject({ turn: 4, tideLevel: 1, status: 'playing', waitingByPier: { 'rabbit-pier': [], 'stone-pier': ['sheep-1'] } });
    await expect(page.locator('#status-headline')).toHaveText('Pip and Rue are safe aboard.');
    await expect(page.locator('#status-detail')).toContainText('Moss waits safely at Stone Pier.');
    await expect(page.locator('#status-headline')).not.toContainText(/flood/i);
    await page.screenshot({ path: `${reviewDir}/${label}-after-rise.png` });
    await hit('status-toggle'); await expect(page.locator('.forecast-detail')).toContainText('Rabbit Pier is flooded and empty.'); await hit('cancel');
    await sail('shallows'); await sail('stone'); await act(page, 'board', touch); await sail('harbor'); await act(page, 'unload', touch);
    expect(await state(page)).toMatchObject({ turn: 9, tideLevel: 2, status: 'won', delivered: ['rabbit-1', 'rabbit-2', 'sheep-1'] });
    await expect(page.locator('#map-harbor')).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('#local-context')).toBeHidden();
    await fullyVisible(page, page.locator('#terminal-undo')); await fullyVisible(page, page.locator('#terminal-restart')); await dialogCycle(page, 'terminal-undo');
    await page.screenshot({ path: `${reviewDir}/${label}-success.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    writeFileSync(`${reviewDir}/${label}-verification.json`, JSON.stringify({ viewport: [width, height], touchEmulation: touch, initialState: initial, startNavigation: firstNavigation, frame, finalState: await state(page), errors }, null, 2));
    await context.close();
  });
}
