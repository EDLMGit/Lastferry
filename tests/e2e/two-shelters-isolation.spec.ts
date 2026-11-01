import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Action, State } from '../../src/game/rules';
import type { Level } from '../../src/levels/level';
import { reviewDir } from './evidence';
import { act, activate, idle, restart, state, undo } from './ui';
import { journeyKey, passive } from './story-support';

test.setTimeout(240000);
const completed = ['holding-pier', 'bellwater', 'driftwood-yard'];
const acknowledged = ['opening', 'another-bell', 'driftwood-light'];
const fixtures = {
  'pending-launch': {
    version: 1,
    checkpoint: { kind: 'scene', id: 'a-wider-deck' },
    completed,
    acknowledgedScenes: acknowledged,
  },
  'active-wide': {
    version: 1,
    checkpoint: { kind: 'cove', id: 'wide-berth' },
    completed,
    acknowledgedScenes: [...acknowledged, 'a-wider-deck'],
  },
  'completed-four': {
    version: 1,
    checkpoint: { kind: 'complete' },
    completed: [...completed, 'wide-berth'],
    acknowledgedScenes: [...acknowledged, 'a-wider-deck'],
  },
};
const twoShelters = JSON.parse(readFileSync('data/two-shelters.level.json', 'utf8')) as Level;
const witnessData = JSON.parse(readFileSync('data/two-shelters/witnesses.json', 'utf8'));
const actions = witnessData.witnesses[0].actions as Action[];
const bytes = (page: Page) => passive(page, (key) => localStorage.getItem(key), journeyKey);
const campaign = (page: Page) =>
  passive(page, () => (window as any).__LAST_FERRY__.getCampaignStatus());
const expectedAfter = (page: Page, before: State, action: Action): Promise<State> =>
  passive(
    page,
    async ({ before, action, level }) => {
      const modulePath = '/src/game/rules.ts';
      const { reduce } = await import(modulePath);
      return reduce(before, action, level);
    },
    { before, action, level: twoShelters },
  );

async function seed(page: Page, raw: string | null) {
  await page.addInitScript(
    ({ key, raw }) => {
      if (!sessionStorage.twoSheltersIsolationSeed) {
        if (raw !== null) localStorage.setItem(key, raw);
        localStorage.setItem('last-ferry-muted', 'true');
        localStorage.setItem('last-ferry-motion', 'reduced');
        sessionStorage.twoSheltersIsolationSeed = '1';
      }
      const writes: { key: string; value: string }[] = [];
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (name, value) {
        if (this === localStorage && name === key) writes.push({ key: name, value });
        return original.call(this, name, value);
      };
      (window as any).__twoSheltersJourneyWrites = writes;
    },
    { key: journeyKey, raw },
  );
}

async function preserved(page: Page, raw: string | null) {
  expect(await bytes(page)).toBe(raw);
  expect(await passive(page, () => (window as any).__twoSheltersJourneyWrites)).toEqual([]);
}

async function execute(page: Page, action: Action) {
  if (action.type === 'move') await act(page, `map-${action.to}`, true);
  else if (action.type === 'wait') await act(page, 'wait', true);
  else {
    await activate(page, action.type, true);
    if (await page.locator('#dialog[open][data-mode=action]').count()) {
      for (const choice of await page.locator('.passenger-options button').all()) {
        const id = (await choice.getAttribute('id'))!.replace('passenger-', '');
        const selected = (await choice.getAttribute('aria-pressed')) === 'true';
        if (selected !== action.passengerIds.includes(id)) await choice.tap();
      }
      await activate(page, 'commit', true);
    }
    await idle(page);
  }
}

async function returnHome(page: Page) {
  if (await page.locator('#choose-cove').isVisible()) await activate(page, 'choose-cove', true);
  else await activate(page, 'menu', true);
  await activate(page, 'journey-return', true);
  await activate(page, 'journey-return-confirm', true);
  await expect(page.locator('#home-play')).toBeVisible();
}

function report(name: string, record: unknown) {
  mkdirSync(reviewDir, { recursive: true });
  const paths = [
    'src/campaign/registry.ts',
    'src/campaign/progress.ts',
    'src/levels/level.ts',
    'src/main.ts',
    'data/two-shelters.level.json',
    'data/two-shelters/witnesses.json',
    'tests/e2e/two-shelters-isolation.spec.ts',
  ];
  writeFileSync(
    `${reviewDir}/isolation-${name}.json`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        files: Object.fromEntries(
          paths.map((path) => [
            path,
            createHash('sha256').update(readFileSync(path)).digest('hex'),
          ]),
        ),
        ...(record as object),
      },
      null,
      2,
    ),
  );
}

for (const [name, record] of Object.entries(fixtures)) {
  test(`Practice completion preserves exact ${name} journey bytes`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const raw = `\n${JSON.stringify(record, null, 2)}\n`;
    const observations: unknown[] = [];
    try {
      await seed(page, raw);
      await page.goto('/');
      await expect(page.locator('#home-play')).toBeVisible();
      await preserved(page, raw);
      await activate(page, 'home-practice', true);
      await expect(page.locator('#practice-two-shelters')).toHaveText('Two Shelters');
      await activate(page, 'practice-two-shelters', true);
      await idle(page);
      expect(await campaign(page)).toMatchObject({
        active: false,
        level: 'two-shelters',
        scene: null,
      });
      const initialState = await state(page);
      expect(initialState).toMatchObject({ turn: 0, status: 'playing' });
      await preserved(page, raw);
      await act(page, 'wait', true);
      await restart(page, true);
      expect(await state(page)).toEqual(initialState);
      await preserved(page, raw);
      let expected = initialState;
      for (const action of actions) {
        expected = await expectedAfter(page, expected, action);
        await execute(page, action);
        expect(await state(page)).toEqual(expected);
        await preserved(page, raw);
        observations.push({ action, state: expected });
      }
      expect(expected.status).toBe('won');
      await expect(page.locator('#continue-story')).toHaveCount(0);
      await undo(page, true);
      expect((await state(page)).status).toBe('playing');
      await preserved(page, raw);
      await execute(page, actions.at(-1)!);
      expect(await state(page)).toEqual(expected);
      await preserved(page, raw);
      await returnHome(page);
      await preserved(page, raw);
      expect((await campaign(page)).progress.record).toEqual(record);
      await page.reload();
      await expect(page.locator('#home-play')).toBeVisible();
      await preserved(page, raw);
      expect((await campaign(page)).progress.record).toEqual(record);
      await page.goto('/?cove=two-shelters');
      await idle(page);
      expect(await campaign(page)).toMatchObject({
        entry: 'direct',
        active: false,
        level: 'two-shelters',
      });
      await preserved(page, raw);
      await page.reload();
      await idle(page);
      expect(await state(page)).toEqual(initialState);
      await preserved(page, raw);
      report(name, {
        record,
        raw,
        observations,
        browser: browser.version(),
        viewport: page.viewportSize(),
        actualUI: true,
        reducedMotion: true,
        muted: true,
        passed: true,
      });
    } finally {
      await context.close();
    }
  });
}

test('fresh direct candidate creates no campaign checkpoint through Home and reload', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 780, height: 320 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  try {
    await seed(page, null);
    await page.goto('/?cove=two-shelters');
    await idle(page);
    expect(await campaign(page)).toMatchObject({
      entry: 'direct',
      active: false,
      level: 'two-shelters',
      progress: null,
    });
    await preserved(page, null);
    await act(page, 'wait', true);
    await restart(page, true);
    await preserved(page, null);
    await returnHome(page);
    await preserved(page, null);
    await page.reload();
    await expect(page.locator('#home-play')).toHaveText('Play');
    await preserved(page, null);
    report('fresh-direct', {
      browser: browser.version(),
      viewport: page.viewportSize(),
      passed: true,
      raw: null,
    });
  } finally {
    await context.close();
  }
});
