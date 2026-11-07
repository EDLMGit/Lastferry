import { test, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { reviewDir } from './evidence';
import { coldTouch, journeyKey, passive } from './story-support';

const sourceRevision = process.env.LAST_FERRY_LAUNCH_SOURCE_REV;
const sourceBytes = (path: string) =>
  sourceRevision ? execFileSync('git', ['show', `${sourceRevision}:${path}`]) : readFileSync(path);

const completion = {
  version: 1,
  checkpoint: { kind: 'complete' },
  completed: ['holding-pier', 'bellwater', 'driftwood-yard'],
  acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light'],
};

for (const size of [
  { width: 390, height: 844 },
  { width: 780, height: 320 },
]) {
  test(`grounded actual launch ${size.width}x${size.height}`, async ({ browser, baseURL }) => {
    mkdirSync(`${reviewDir}/raw`, { recursive: true });
    const context = await browser.newContext({
      baseURL,
      viewport: size,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    const key = `${size.width}x${size.height}`;
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const source = Object.fromEntries(
      [
        'src/campaign/story-painter.ts',
        'src/campaign/registry.ts',
        'src/campaign/story-view.ts',
        'src/campaign/presentation.ts',
      ].map((p) => [p, createHash('sha256').update(sourceBytes(p)).digest('hex')]),
    );
    await page.addInitScript(
      ({ key, completion }) => localStorage.setItem(key, JSON.stringify(completion)),
      { key: journeyKey, completion },
    );
    await page.goto('/');
    await coldTouch(page, 'home-play');
    await coldTouch(page, 'story-pause');
    const status = () => passive(page, () => (window as any).__LAST_FERRY__.getStoryStatus());
    const observations: unknown[] = [];
    const first = await status();
    expect(first.timeline.paused).toBe(true);
    expect(first.timeline.elapsed).toBeLessThan(1100);
    for (const [beat, at] of [
      ['begin', 0],
      ['release', 2300],
      ['glide', 4700],
      ['end', 8000],
    ] as const) {
      if (at > 0) {
        const elapsed = (await status()).timeline.elapsed;
        await coldTouch(page, 'story-pause');
        await page.waitForTimeout(Math.max(0, at - elapsed) + (at === 8000 ? 100 : 0));
        const advancing = await status();
        if (!advancing.timeline.settled && !advancing.timeline.paused)
          await coldTouch(page, 'story-pause');
      }
      const held = await status();
      expect(held.timeline.scene).toBe('a-wider-deck');
      expect(held.timeline.elapsed).toBeGreaterThanOrEqual(Math.max(0, at - 150));
      if (at < 8000) expect(held.timeline.elapsed).toBeLessThan(at + 1100);
      await page.screenshot({ path: `${reviewDir}/${key}-${beat}.png` });
      const observed = await status();
      observations.push({ beat, ...observed });
      expect(observed.timeline.elapsed).toBe(held.timeline.elapsed);
      expect(await passive(page, () => (window as any).__LAST_FERRY__.getState().turn)).toBe(0);
    }
    const sourceAfter = Object.fromEntries(
      Object.keys(source).map((p) => [p, createHash('sha256').update(sourceBytes(p)).digest('hex')]),
    );
    expect(sourceAfter).toEqual(source);
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/${key}-launch.json`,
      JSON.stringify(
        {
          method:
            'Actual root Home continuation from exact historical3 completion fixture; trusted Pause/Resume holds each real elapsed beat for native frame inspection. No scene-time injection. These held-frame captures complement the separate uninterrupted integrated recording; they are not continuous-motion evidence.',
          source,
          sourceRevision: sourceRevision ?? 'current working tree',
          baseURL,
          sourceAfter,
          observations,
          errors,
        },
        null,
        2,
      ),
    );
    await context.close();
  });
}
