import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { reviewDir } from './evidence';
import { act, ready as baseReady, state, idle, undo, restart } from './ui';

const environment = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getEnvironmentStatus());
const journey = (page: Page) =>
  page.evaluate(() => (window as any).__LAST_FERRY__.getJourneyStatus());
const homeBaselines = new WeakMap<Page, any>();
async function ready(page: Page, cove: string) {
  await baseReady(page, cove);
  homeBaselines.set(page, (await environment(page)).arrival);
}
const holding = [
  'unload',
  'map-shallows',
  'map-rabbit-pier',
  'board',
  'map-shallows',
  'map-stone',
  'board',
  'map-harbor',
  'unload',
];
const bellwater = [
  'map-shallows',
  'map-low-pier',
  'board',
  'map-east-buoy',
  'map-west-buoy',
  'map-harbor',
  'map-bell-pier',
  'board',
  'map-harbor',
  'map-west-buoy',
  'map-east-buoy',
  'map-west-buoy',
  'map-harbor',
  'unload',
];

function nearestCourse(position: number[], route: any) {
  let nearest = { distance: Infinity, direction: [0, 0] };
  const points: number[] = route.pointsXYZ;
  for (let i = 3; i < points.length; i += 3) {
    const ax = points[i - 3] + route.position[0],
      az = points[i - 1] + route.position[2];
    const dx = points[i] - points[i - 3],
      dz = points[i + 2] - points[i - 1];
    const length = Math.hypot(dx, dz);
    if (!length) continue;
    const t = Math.max(
      0,
      Math.min(1, ((position[0] - ax) * dx + (position[2] - az) * dz) / length ** 2),
    );
    const distance = Math.hypot(position[0] - ax - t * dx, position[2] - az - t * dz);
    if (distance < nearest.distance) nearest = { distance, direction: [dx / length, dz / length] };
  }
  return nearest;
}
function coastIsAtWater(view: any, tide: number) {
  expect(view.waterY).toBeCloseTo(tide * 0.18, 6);
  expect(view.waterUniformY).toBeCloseTo(view.waterY, 6);
  expect(view.shores.waterY).toBeCloseTo(view.waterY, 6);
  expect(view.maskSize).toEqual([256, 256]);
  expect(view.shallowSegments).toBeGreaterThan(16);
  expect(view.shores.contactVertices).toBeGreaterThan(0);
  for (let i = 1; i < view.shores.contactPositions.length; i += 3)
    expect(view.shores.contactPositions[i]).toBeCloseTo(view.waterY + 0.012, 5);
  for (const island of view.shores.islands) {
    expect(island.geometryVertices).toBeGreaterThan(20);
    expect(island.rockCount).toBeGreaterThan(0);
    if (island.surfaceY <= view.waterY) {
      expect(island.mode).toBe('submerged');
      expect(island.contactScale).toBeNull();
      expect(island.contactVisible).toBe(false);
      expect(island.submergedFraction).toBe(1);
    } else {
      expect(island.mode).toBe(tide ? 'wet' : 'exposed');
      expect(island.contactScale).toBeGreaterThan(0);
      expect(island.contactVisible).toBe(true);
    }
  }
}
async function startSamples(page: Page) {
  await page.evaluate(() => {
    const target = window as any;
    target.__environmentSamples = [];
    target.__environmentSampling = true;
    function sample(time: number) {
      if (!target.__environmentSampling) return;
      const course = target.__LAST_FERRY__.getJourneyStatus();
      const view = target.__LAST_FERRY__.getEnvironmentStatus();
      if (course.active)
        target.__environmentSamples.push({
          time,
          turn: target.__LAST_FERRY__.getState().turn,
          pose: course.boatWorldPosition,
          heading: course.boatHeading,
          active: course.active,
          routes: course.routeBuffers.map((route: any) => ({
            id: route.id,
            position: route.position,
            y: route.pointsXYZ[1],
          })),
          waterY: view.waterY,
          waterUniformY: view.waterUniformY,
          wake: view.wake,
        });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
}
async function stopSamples(page: Page) {
  return page.evaluate(() => {
    (window as any).__environmentSampling = false;
    return (window as any).__environmentSamples as any[];
  });
}
async function arrivalIsVisible(page: Page, reduced: boolean) {
  const view = await environment(page), base = homeBaselines.get(page);
  expect(base).toBeDefined();
  expect(view.arrival.active).toBe(true);
  expect(view.arrival.intensity).toBeGreaterThan(0);
  expect(view.arrival.lampIntensity).toBeGreaterThan(base.lampIntensity);
  expect(view.arrival.emissiveIntensity).toBeCloseTo(base.emissiveIntensity + view.arrival.intensity, 6);
  expect(view.arrival.glowVisible).toBe(true);
  expect(view.arrival.glowOpacity).toBeGreaterThan(base.glowOpacity);
  if (reduced) expect(view.arrival.intensity).toBe(0.45);
  return view;
}
async function effectsAreClear(page: Page) {
  const view = await environment(page), base = homeBaselines.get(page);
  expect(base).toBeDefined();
  expect(view.wake).toMatchObject({ emitting: false, visible: false, vertices: 0, points: [] });
  expect(view.arrival).toMatchObject({
    active: false,
    intensity: 0,
    emissiveIntensity: base.emissiveIntensity,
    lampIntensity: base.lampIntensity,
    glowVisible: true,
    glowOpacity: base.glowOpacity,
  });
  expect(view.forecast.visible).toBe(false);
  expect(view.forecast.groups.filter((group: any) => group.visible)).toEqual([]);
}

test('environment: visible curved courses carry the ferry, tangent and fading wake both ways', async ({
  page,
}) => {
  test.setTimeout(180000);
  mkdirSync(`${reviewDir}/raw`, { recursive: true });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page, 'bellwater');
  const original = await journey(page);
  const buffers = new Map<string, any>(
    original.routeBuffers.map((route: any) => [route.id, route]),
  );
  await startSamples(page);
  for (let i = 0; i < bellwater.length; i++) {
    await act(page, bellwater[i]);
    expect((await state(page)).turn).toBe(i + 1);
    if (i === 3 || i === 8) {
      await page.locator(i === 3 ? '#map-west-buoy' : '#map-bell-pier').click();
      const highlighted = await journey(page);
      for (const route of highlighted.routeBuffers)
        expect(route.pointsXYZ).toEqual(buffers.get(route.id).pointsXYZ);
      await page.locator('#close-location').click();
    }
    if (i === 3) {
      expect((await environment(page)).wake.emitting).toBe(false);
      await page.waitForFunction(
        () => !(window as any).__LAST_FERRY__.getEnvironmentStatus().wake.visible,
      );
      expect((await state(page)).turn).toBe(4);
    }
    expect((await journey(page)).boatHeading).toBeCloseTo(Math.PI / 2, 6);
  }
  const samples = await stopSamples(page);
  expect(samples.length).toBeGreaterThan(20);
  for (const edge of ['harbor-bell', 'west-east'])
    for (const reverse of [false, true]) {
      const crossing = samples.filter(
        (sample) => sample.active.edgeId === edge && sample.active.reverse === reverse,
      );
      expect(crossing.length, `${edge} reverse=${reverse}`).toBeGreaterThanOrEqual(2);
      expect(crossing.some((sample) => sample.wake.emitting)).toBe(true);
      expect(crossing.some((sample) => sample.wake.visible && sample.wake.vertices > 0)).toBe(true);
    }
  const emissionFrames = new Map(samples.map((sample) => [sample.time, sample]));
  for (const sample of samples) {
    const route: any = buffers.get(sample.active.edgeId);
    const nearest = nearestCourse(sample.pose, route);
    expect(nearest.distance).toBeLessThan(0.0001);
    expect(sample.pose[1]).toBeCloseTo(sample.waterY, 5);
    expect(sample.waterUniformY).toBeCloseTo(sample.waterY, 6);
    for (const visible of sample.routes)
      expect(visible.y + visible.position[1]).toBeCloseTo(sample.waterY + 0.035, 5);
    if (sample.active.distance > 1.05 && sample.active.pathLength - sample.active.distance > 1.05) {
      const sign = sample.active.reverse ? -1 : 1;
      const aligned =
        sign *
        (Math.sin(sample.heading) * nearest.direction[0] +
          Math.cos(sample.heading) * nearest.direction[1]);
      expect(aligned).toBeGreaterThan(0.98);
    }
    for (let i = 1; i < sample.wake.positions.length; i += 3)
      expect(sample.wake.positions[i]).toBeCloseTo(sample.waterY + 0.018, 5);
    expect(sample.wake.points.length).toBeLessThanOrEqual(31);
    let wakeLength = 0;
    for (let i = 0; i < sample.wake.points.length; i++) {
      const point = sample.wake.points[i],
        emitted = emissionFrames.get(point.time);
      expect(emitted, `Missing emission frame at ${point.time}`).toBeDefined();
      expect(point.position[0]).toBeCloseTo(emitted.pose[0] - Math.sin(emitted.heading) * 0.72, 5);
      expect(point.position[1]).toBeCloseTo(emitted.waterY + 0.018, 5);
      expect(point.position[2]).toBeCloseTo(emitted.pose[2] - Math.cos(emitted.heading) * 0.72, 5);
      expect(
        nearestCourse(point.position, buffers.get(emitted.active.edgeId)).distance,
      ).toBeLessThanOrEqual(0.721);
      expect(sample.time - point.time).toBeGreaterThanOrEqual(0);
      expect(sample.time - point.time).toBeLessThanOrEqual(720);
      if (i)
        wakeLength += Math.hypot(
          ...point.position.map(
            (value: number, axis: number) => value - sample.wake.points[i - 1].position[axis],
          ),
        );
    }
    expect(wakeLength).toBeLessThanOrEqual(1.8 + 0.00001);
    for (const opacity of sample.wake.opacity) {
      expect(opacity).toBeGreaterThanOrEqual(0);
      expect(opacity).toBeLessThanOrEqual(0.181);
    }
  }
  for (const turn of new Set(samples.map((sample) => sample.turn))) {
    const crossing = samples.filter((sample) => sample.turn === turn);
    for (let i = 1; i < crossing.length; i++) {
      expect(crossing[i].active.progress).toBeGreaterThanOrEqual(crossing[i - 1].active.progress);
      expect(crossing[i].active.distance).toBeGreaterThanOrEqual(crossing[i - 1].active.distance);
    }
  }
  expect(await state(page)).toMatchObject({
    turn: 14,
    tideLevel: 2,
    status: 'won',
    delivered: ['tansy', 'lark', 'bram'],
  });
  await arrivalIsVisible(page, false);
  await page.waitForFunction(
    () => !(window as any).__LAST_FERRY__.getEnvironmentStatus().wake.visible,
  );
  await page.screenshot({ path: `${reviewDir}/environment-journeys-arrival.png` });
  writeFileSync(
    `${reviewDir}/environment-journey-samples.json`,
    JSON.stringify(
      { source: 'current browser runtime; see source-manifest.json', samples },
      null,
      2,
    ),
  );
  await undo(page);
  await effectsAreClear(page);
  expect((await state(page)).turn).toBe(13);
  expect(errors).toEqual([]);
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(`${reviewDir}/raw/environment-journeys.webm`);
});

test('environment: shores, free forecast and complete Undo follow both tide boundaries', async ({
  page,
}) => {
  await ready(page, 'holding-pier');
  const initial = await state(page),
    shores = (await environment(page)).shores;
  coastIsAtWater(await environment(page), 0);
  const ordinary = (await journey(page)).routeBuffers;
  await page.locator('#map-shallows').click();
  expect((await journey(page)).routeBuffers).toEqual(ordinary);
  expect(await state(page)).toEqual(initial);
  await page.locator('#close-location').click();
  await page.locator('#status-toggle').click();
  const preview = await environment(page);
  expect(await state(page)).toEqual(initial);
  expect(preview.waterY).toBe(0);
  expect(preview.forecast.visible).toBe(true);
  expect(preview.forecast.tideY).toBe(0.18);
  const visible = preview.forecast.groups.filter((group: any) => group.visible);
  expect(visible).toHaveLength(1);
  expect(visible[0].name).toBe('forecast-tide-1');
  for (const contour of visible[0].contours)
    for (let i = 1; i < contour.positions.length; i += 3)
      expect(contour.positions[i]).toBeCloseTo(0.193, 5);
  await page.locator('#cancel').click();
  await effectsAreClear(page);
  const states = [initial],
    views = [shores];
  for (let i = 0; i < holding.length; i++) {
    await act(page, holding[i]);
    states.push(await state(page));
    views.push((await environment(page)).shores);
    coastIsAtWater(await environment(page), i < 3 ? 0 : i < 7 ? 1 : 2);
    if (i === 3 || i === 7) {
      await undo(page);
      expect(await state(page)).toEqual(states[i]);
      expect((await environment(page)).shores).toEqual(views[i]);
      await effectsAreClear(page);
      await act(page, holding[i]);
      expect(await state(page)).toEqual(states[i + 1]);
    }
  }
  await arrivalIsVisible(page, false);
  for (let i = holding.length - 1; i >= 0; i--) {
    await undo(page);
    expect(await state(page)).toEqual(states[i]);
    expect((await environment(page)).shores).toEqual(views[i]);
    await effectsAreClear(page);
  }
  expect(await state(page)).toEqual(initial);
});

test('environment: interrupted travel, restart and changing cove clear transient effects', async ({
  page,
}) => {
  await ready(page, 'bellwater');
  await page.locator('#map-west-buoy').click();
  await page.locator('#sail').click();
  await page.waitForFunction(
    () => (window as any).__LAST_FERRY__.getJourneyStatus().active !== null,
  );
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 1, boatNodeId: 'west-buoy' });
  expect((await journey(page)).active).toBeNull();
  await effectsAreClear(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });
  await undo(page);
  expect((await state(page)).turn).toBe(0);
  await effectsAreClear(page);
  await act(page, 'map-west-buoy');
  await restart(page);
  expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'harbor' });
  await effectsAreClear(page);
  await page.locator('#menu').click();
  await page.locator('#cove-picker').selectOption('holding-pier');
  await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getEnvironmentStatus);
  await idle(page);
  expect(await state(page)).toMatchObject({ turn: 0, boatNodeId: 'stone', aboard: ['sheep-1'] });
  homeBaselines.set(page, (await environment(page)).arrival);
  await effectsAreClear(page);
  coastIsAtWater(await environment(page), 0);
});

test('environment: reduced motion keeps calm water, no wake and stable warm arrival', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, 'holding-pier');
  const before = await environment(page);
  expect(before.reducedMotion).toBe(true);
  expect(before.waterTime).toBe(0);
  await startSamples(page);
  for (const id of holding) {
    await act(page, id);
    const view = await environment(page);
    expect(view.waterTime).toBe(0);
    expect(view.wake).toMatchObject({ emitting: false, visible: false, vertices: 0, points: [] });
  }
  const samples = await stopSamples(page);
  for (const sample of samples)
    expect(sample.wake).toMatchObject({ emitting: false, visible: false, vertices: 0, points: [] });
  expect((await state(page)).status).toBe('won');
  await arrivalIsVisible(page, true);
  const observations = await page.evaluate(async () => {
    const views = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(requestAnimationFrame);
      const view = (window as any).__LAST_FERRY__.getEnvironmentStatus();
      views.push({ waterTime: view.waterTime, arrival: view.arrival, wake: view.wake });
    }
    return views;
  });
  for (const view of observations) {
    expect(view.waterTime).toBe(0);
    expect(view.arrival.intensity).toBe(0.45);
    expect(view.wake).toMatchObject({ emitting: false, visible: false, vertices: 0 });
  }
  await undo(page);
  await effectsAreClear(page);
  await restart(page);
  expect((await state(page)).turn).toBe(0);
  await effectsAreClear(page);
});
