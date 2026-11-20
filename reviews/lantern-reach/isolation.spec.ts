import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { completeSeven } from '../../tests/e2e/cove-eight-support';
import { home } from '../../tests/e2e/three-lanterns-support';
import { activate, fullyVisible, idle, restart, tabTo } from '../../tests/e2e/ui';

const previous = JSON.parse(readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json', 'utf8')).reloaded;
const journey = 'last-ferry.journey.v1';
const mastery = 'last-ferry.mastery.v1';
const scenarios = [
  { width: 320, height: 740, progress: completeSeven },
  { width: 1440, height: 900, progress: previous.journey as string },
];

for (const { width, height, progress } of scenarios) {
  test(width + ' UI, open, cancel, restart and protected storage', async ({ page, browser }) => {
    const touch = width === 320;
    const dir = join('reviews/lantern-reach/isolation', width + 'x' + height);
    mkdirSync(dir, { recursive: true });
    const seed = {
      [journey]: progress, [mastery]: previous.mastery as string,
      [journey + '.before-orchard']: completeSeven,
      [journey + '.before-ternhaven']: completeSeven.trimEnd(),
    };
    await page.setViewportSize({ width, height });
    await page.addInitScript(seed => {
      if (!location.protocol.startsWith('http')) return;
      if (!sessionStorage.getItem('seeded')) {
        for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
        sessionStorage.setItem('seeded', 'yes');
      }
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k, v) {
        if (this === localStorage && Object.hasOwn(seed, k)) sessionStorage.setItem('unexpected-write', k);
        return set.call(this, k, v);
      };
    }, seed);
    const protectedStorage = async () => {
      expect(await page.evaluate(keys => ({
        saved: Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])),
        write: sessionStorage.getItem('unexpected-write'),
      }), Object.keys(seed))).toEqual({ saved: seed, write: null });
    };
    await page.goto('/');
    await activate(page, 'home-practice', touch);
    await expect(page.locator('[data-practice]')).toHaveCount(11);
    await expect(page.locator('#practice-drowned-orchard')).toContainText('no lantern rating');
    await expect(page.locator('#practice-lantern-reach')).toContainText('no lantern rating');
    await activate(page, 'practice-lantern-reach', touch);
    await idle(page);
    await fullyVisible(page, page.locator('#open-bridge'));
    const bundle = await page.locator('head script[type=module][src]').getAttribute('src');
    expect(bundle).toMatch(/assets\/index-.*\.js/);
    const bytes = await (await page.request.get(bundle!)).body();
    const hash = createHash('sha256').update(bytes).digest('hex');
    await page.screenshot({ path: join(dir, 'start.png') });
    await tabTo(page, 'open-bridge');
    await page.keyboard.press('Enter');
    await expect(page.locator('#commit')).toHaveAccessibleName('Open bridge · 1 action');
    await fullyVisible(page, page.locator('#commit'));
    await page.screenshot({ path: join(dir, 'signal-preview.png') });
    await page.keyboard.press('Escape');
    await expect(page.locator('#open-bridge')).toBeFocused();
    await expect(page.getByTestId('turn')).toHaveText('00');
    await activate(page, 'open-bridge', touch);
    await activate(page, 'commit', touch);
    await idle(page);
    await expect(page.getByTestId('turn')).toHaveText('01');
    await expect(page.locator('#open-bridge')).toHaveCount(0);
    await activate(page, 'status-toggle', touch);
    await expect(page.locator('.forecast-detail')).toContainText(/bridge is open/i);
    await restart(page, touch);
    await expect(page.locator('#open-bridge')).toBeVisible();
    await expect(page.getByTestId('turn')).toHaveText('00');
    await protectedStorage();
    await home(page);
    await page.goto('/?cove=lantern-reach');
    await idle(page);
    await expect(page.locator('#open-bridge')).toBeVisible();
    await protectedStorage();
    writeFileSync(join(dir, 'run.json'), JSON.stringify({ width, height, browser: browser.version(), bundle, sha256: hash,
      progress: touch ? 'legacy completed seven' : 'completed eight', protectedKeys: Object.keys(seed) }, null, 2));
  });
}
