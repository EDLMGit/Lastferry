import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { productionURL, reviewDir } from './evidence';
import { act, activate, idle, fullyVisible } from './ui';
import { measureStory } from './story-support';
async function transfer(page: Page, type: 'board' | 'unload', ids?: string[], commit = true) {
  await activate(page, type, true);
  if (await page.locator('#dialog[open][data-mode="action"]').count()) {
    for (const b of await page.locator('.passenger-options button').all()) {
      const id = (await b.getAttribute('id'))!.replace('passenger-', '');
      if (ids && ((await b.getAttribute('aria-pressed')) === 'true') !== ids.includes(id))
        await b.tap();
    }
    if (commit) await activate(page, 'commit', true);
  }
  await idle(page);
}
test('production six-space boat rescue, actual six-option overflow and full-label fit', async ({
  browser,
}) => {
  test.setTimeout(300000);
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  mkdirSync(reviewDir, { recursive: true });
  try {
    await page.goto(`${productionURL}/?cove=wide-berth`);
    await expect(page.locator('.identity h1')).toHaveText('Wide Berth');
    for (const id of ['map-high-quay', 'map-wide-berth']) await act(page, id, true);
    await transfer(page, 'board');
    await expect(page.locator('#boat-summary')).toContainText('Depth 4 · 6/6 spaces');
    await act(page, 'map-high-quay', true);
    await transfer(page, 'unload', ['alder']);
    await act(page, 'map-shell-landing', true);
    await transfer(page, 'board');
    for (let i = 0; i < 3; i++) await act(page, 'wait', true);
    await act(page, 'map-high-quay', true);
    await transfer(page, 'unload');
    await transfer(page, 'board', undefined, false);
    await expect(page.locator('#commit')).toBeDisabled();
    await expect(page.locator('#preview .requirement')).toContainText(
      'boat has 6 spaces; this group needs 8',
    );
    await expect
      .poll(() =>
        page
          .locator('#preview img')
          .evaluateAll(
            (images) =>
              images.length === 6 &&
              images.every(
                (i) =>
                  (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 256,
              ),
          ),
      )
      .toBe(true);
    for (const size of [
      { width: 320, height: 740 },
      { width: 390, height: 844 },
      { width: 780, height: 320 },
      { width: 844, height: 390 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(size);
      await expect.poll(async () => (await page.evaluate(measureStory)).failures).toEqual([]);
      for (const id of ['alder', 'clover', 'poppy', 'wren', 'sorrel', 'finch'])
        await fullyVisible(page, page.locator(`#passenger-${id}`));
      await fullyVisible(page, page.locator('#preview .requirement'), false);
      await fullyVisible(page, page.locator('#commit'));
      await page.screenshot({
        path: `${reviewDir}/${size.width}x${size.height}-production-six-chooser.png`,
      });
      writeFileSync(
        `${reviewDir}/${size.width}x${size.height}-production-fit.json`,
        JSON.stringify(await page.evaluate(measureStory), null, 2),
      );
    }
    await page.setViewportSize({ width: 844, height: 390 });
    await activate(page, 'passenger-clover', true);
    for(const size of [{width:320,height:740},{width:390,height:844},{width:780,height:320},{width:844,height:390},{width:1440,height:900}]){
      await page.setViewportSize(size);
      await expect.poll(async()=>(await page.evaluate(measureStory)).failures).toEqual([]);
      for(const id of ['alder','clover','poppy','wren','sorrel','finch'])await fullyVisible(page,page.locator(`#passenger-${id}`));
      await fullyVisible(page,page.locator('#preview .requirement'),false);await fullyVisible(page,page.locator('#commit'));
      await page.screenshot({path:`${reviewDir}/${size.width}x${size.height}-legal-six-chooser.png`});
    }
    await activate(page, 'commit', true);
    await idle(page);
    await expect(page.locator('#boat-summary')).toContainText('Depth 4 · 6/6 spaces');
    await act(page, 'map-harbor', true);
    await transfer(page, 'unload');
    await act(page, 'map-high-quay', true);
    await transfer(page, 'board');
    await act(page, 'map-harbor', true);
    await transfer(page, 'unload');
    await expect(page.locator('#dialog')).toContainText('6 passengers safe at Harbor');
    expect(errors).toEqual([]);
    writeFileSync(
      `${reviewDir}/production-environment.json`,
      JSON.stringify(
        {
          browser: browser.version(),
          node: process.version,
          errors,
          method:
            'Actual production build UI, no DEV state bridge; safe six-neighbor staging variation then complete delivery',
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
  }
});
