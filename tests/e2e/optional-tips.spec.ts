import { expect, test, type Page } from '@playwright/test';
import { preview, type State } from '../../src/game/rules';
import { activate, fullyVisible, idle, restart, state, tabTo, undo } from './ui';
import { journeyKey } from './story-support';
import { checkTurn, directory, localView, report, snapshot } from './large-cove-support';
import {
  action, chooseTransfer, coveData, replay, savedJourney, selectRoute, setTips, settings, tipsKey,
} from './optional-tips-support';

async function noAdvice(page: Page) {
  await expect(page.locator('.map-target[data-risk="loss"]')).toHaveCount(0);
  await expect(page.locator('#local-context .location-warning')).toHaveCount(0);
  await expect(page.locator('.map-target[title*="cut off"]')).toHaveCount(0);
  await expect(page.locator('.map-target[aria-label*="ends the crossing"]')).toHaveCount(0);
  await expect(page.locator('#announcement')).not.toContainText(/will be lost|too much for the return|will cut|ends the crossing/);
}

for (const [width, height] of [[390, 844], [780, 320]]) {
  for (const id of ['wide-berth', 'reef-return']) {
    test(id + ' Tips Off and On at ' + width + '×' + height, async ({ browser, baseURL }) => {
      test.setTimeout(240000);
      const context = await browser.newContext({
        baseURL, viewport: { width, height }, deviceScaleFactor: 1, hasTouch: true, isMobile: true,
      });
      await context.addInitScript(({ key, saved }) => {
        if (!sessionStorage.getItem('tips-fixture')) {
          localStorage.setItem(key, saved);
          localStorage.setItem('last-ferry-muted', 'true');
          sessionStorage.setItem('tips-fixture', 'seeded');
        }
      }, { key: journeyKey, saved: savedJourney });
      const page = await context.newPage();
      const { level, actions } = coveData(id);
      const dir = directory(id);
      const prefix = width + 'x' + height;
      const shot = (name: string) => snapshot(page, dir, prefix + '-' + name);
      const results: unknown[] = [];
      const errors: string[] = [];
      page.on('pageerror', e => errors.push(e.message));
      try {
        await page.goto('/?cove=' + id);
        await page.waitForFunction(() => (window as any).__LAST_FERRY__?.getMetrics().frames > 3);
        const start = await state(page);
        await settings(page);
        await expect(page.locator('#tips-preference')).toHaveValue('off');
        await expect(page.locator('#tips-preference')).toHaveAttribute('aria-describedby', 'tips-description');
        await page.locator('#tips-preference').scrollIntoViewIfNeeded();
        await fullyVisible(page, page.locator('#tips-preference'));
        await fullyVisible(page, page.locator('#settings-back'));
        await shot('settings-off');
        await activate(page, 'settings-back', true);
        await activate(page, 'cancel', true);
        expect(await state(page)).toEqual(start);
        await expect(page.locator('#undo')).toBeDisabled();
        if (id === 'wide-berth') await replay(page, actions.slice(0, 2), level);
        const decision = await state(page);
        for (const on of [false, true]) {
          await setTips(page, on);
          const mode = on ? 'on' : 'off';
          await selectRoute(page, id === 'wide-berth' ? 'harbor' : 'wrack');
          await expect(page.locator('#sail')).toBeDisabled();
          await expect(page.locator('#local-context')).toContainText('Needs depth');
          await expect(page.locator('#local-context')).toContainText('passage 2');
          await shot('blocked-' + mode);
          await activate(page, 'close-location', true);
          await localView(page);
          await chooseTransfer(page, 'unload', [id === 'wide-berth' ? 'alder' : 'heather']);
          await expect(page.locator('#preview .requirement')).toContainText(id === 'wide-berth' ? '4/6' : '2/6');
          await expect(page.locator('#preview')).not.toHaveClass(/warning/);
          if (on) await expect(page.locator('#preview')).toContainText('too shallow');
          else await expect(page.locator('#preview')).not.toContainText('Passage to');
          await shot('mixed-subset-' + mode);
          if (id === 'wide-berth') {
            for (const choice of await page.locator('.passenger-options button').all())
              if ((await choice.getAttribute('aria-pressed')) === 'false') await choice.tap();
            await expect(page.locator('#preview .requirement')).toContainText('0/6');
            await expect(page.locator('#preview')).not.toContainText('too shallow');
          }
          await activate(page, 'cancel', true);
          expect(await state(page)).toEqual(decision);
          if (!on) await noAdvice(page);
        }
        await setTips(page, false);
        if (id === 'wide-berth')
          await action(page, { type: 'unload', passengerIds: ['alder', 'clover', 'wren'] }, level);
        else await replay(page, actions.slice(0, 8), level);
        const beforeLoss = await state(page) as State;
        for (const on of [false, true]) {
          await setTips(page, on);
          const mode = on ? 'on' : 'off';
          const losing = id === 'wide-berth' ? { type: 'move' as const, to: 'harbor' } : { type: 'wait' as const };
          const expected = preview(beforeLoss, losing, level).state;
          expect(expected.status).toBe('lost');
          if (id === 'wide-berth') {
            await selectRoute(page, 'harbor');
            await expect(page.locator('#sail')).toBeEnabled();
            await expect(page.locator('#sail')).toHaveAttribute('data-risk', on ? 'loss' : 'safe');
            await expect(page.locator('#sail')).toHaveAttribute('aria-label', on ? 'Sail anyway to Harbor · 1 action' : 'Sail to Harbor · 1 action');
            await expect(page.locator('#map-harbor')).toHaveAttribute('data-risk', on ? 'loss' : 'safe');
            if (on) await expect(page.locator('#local-context')).toContainText('too much for the return');
            else {
              await noAdvice(page);
              await expect(page.locator('#local-context')).not.toContainText('homeward trip remains');
              await expect(page.locator('#local-context')).not.toContainText('too much');
            }
            await shot('losing-sail-' + mode);
            await activate(page, 'sail', true);
          } else {
            await localView(page);
            await page.waitForTimeout(350);
            await activate(page, 'wait', true);
            await expect(page.locator('#preview')).toHaveClass(on ? /warning/ : /^(?!.*warning)/);
            if (on) await expect(page.locator('#preview')).toContainText('no dry landing');
            else {
              await expect(page.locator('#preview')).not.toContainText('no dry landing');
              await expect(page.locator('#preview')).not.toContainText('too deep');
              await expect(page.locator('#preview')).toContainText('tide');
            }
            await fullyVisible(page, page.locator('#commit'));
            await shot('losing-wait-' + mode);
            await activate(page, 'commit', true);
          }
          await idle(page);
          await checkTurn(page, expected, true);
          await expect(page.locator('.ending')).toContainText(id === 'wide-berth' ? 'room for 6 spaces' : 'cannot reach a dry landing');
          await fullyVisible(page, page.locator('#terminal-undo'));
          await shot('actual-loss-' + mode);
          results.push({ tips: mode, action: losing, actual: await state(page) });
          await undo(page, true);
          expect(await state(page)).toEqual(beforeLoss);
          expect(await page.evaluate(key => localStorage.getItem(key), tipsKey)).toBe(String(on));
          await shot('undo-' + mode);
          if (id === 'wide-berth') {
            await activate(page, 'unload', true);
            if (on) {
              await expect(page.locator('#dialog')).toHaveAttribute('data-mode', 'action');
              await expect(page.locator('#preview')).toHaveClass(/warning/);
              await shot('single-transfer-on');
              await activate(page, 'commit', true);
            } else await expect(page.locator('#dialog[data-mode="action"][open]')).toHaveCount(0);
            await idle(page);
            await expect(page.locator('#dialog')).toHaveAttribute('data-outcome', 'lost');
            await undo(page, true);
            expect(await state(page)).toEqual(beforeLoss);
          }
        }
        expect((results[0] as { actual: State }).actual).toEqual((results[1] as { actual: State }).actual);
        await setTips(page, false);
        await noAdvice(page);
        if (width === 390) {
          let firstWin: State | undefined;
          for (const on of [false, true]) {
            await restart(page, true);
            await setTips(page, on);
            const won = await replay(page, actions, level);
            expect(won.status).toBe('won');
            if (firstWin) expect(won).toEqual(firstWin);
            firstWin = won;
            results.push({ rescue: on ? 'on' : 'off', won });
            await shot('rescue-' + (on ? 'on' : 'off'));
            await undo(page, true);
            expect((await state(page)).status).toBe('playing');
          }
        }
        expect(await page.evaluate(key => localStorage.getItem(key), journeyKey)).toBe(savedJourney);
        expect(errors).toEqual([]);
        report(dir, prefix + '-tips', { viewport: { width, height }, browser: browser.version(), dpr: 1, errors, results, journeyBytesUnchanged: true });
      } finally {
        await context.close();
      }
    });
  }
}

test('shared Tips keyboard access, persistence and blocked storage', async ({ browser, baseURL }) => {
  const dir = directory('settings');
  for (const blockedStorage of [false, true]) {
    const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
    await context.addInitScript(({ journey, saved, tips, blocked }) => {
      if (!sessionStorage.getItem('optional-tips-settings-fixture')) {
        localStorage.setItem(journey, saved);
        localStorage.setItem('last-ferry-muted', 'true');
        sessionStorage.setItem('optional-tips-settings-fixture', 'seeded');
      }
      const read = Storage.prototype.getItem, write = Storage.prototype.setItem;
      Storage.prototype.getItem = function (key) {
        if (blocked && key === tips) throw new DOMException('Storage unavailable', 'SecurityError');
        return read.call(this, key);
      };
      Storage.prototype.setItem = function (key, value) {
        if (blocked && key === tips) throw new DOMException('Storage unavailable', 'SecurityError');
        if (key === journey) sessionStorage.setItem('unexpected-journey-write', 'yes');
        return write.call(this, key, value);
      };
    }, { journey: journeyKey, saved: savedJourney, tips: tipsKey, blocked: blockedStorage });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(60000);
    try {
      await page.goto('/');
      await expect(page.locator('#home-play')).toHaveText('Continue');
      await tabTo(page, 'home-options');
      await page.keyboard.press('Enter');
      await tabTo(page, 'tips-preference');
      await expect(page.locator('#tips-preference')).toHaveValue('off');
      await page.keyboard.press('End');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#tips-preference')).toBeFocused();
      await expect(page.locator('#tips-preference')).toHaveValue('on');
      await fullyVisible(page, page.locator('#tips-preference'));
      await snapshot(page, dir, blockedStorage ? 'storage-blocked-on' : 'keyboard-on');
      await page.keyboard.press('Escape');
      await expect(page.locator('#home-options')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('#tips-preference')).toHaveValue('on');
      await page.keyboard.press('Escape');
      await activate(page, 'home-practice', true);
      await expect(page.locator('[id^=practice-]')).toHaveCount(7);
      await activate(page, 'practice-reef-return', true);
      await expect(page.locator('#unload')).toBeVisible();
      await settings(page);
      await expect(page.locator('#tips-preference')).toHaveValue('on');
      await activate(page, 'settings-back', true);
      await activate(page, 'cancel', true);
      await restart(page, true);
      await settings(page);
      await expect(page.locator('#tips-preference')).toHaveValue('on');
      await activate(page, 'settings-back', true);
      await activate(page, 'cancel', true);
      if (!blockedStorage) {
        await page.reload();
        await expect(page.locator('#home-play')).toHaveText('Continue');
        await activate(page, 'home-options', true);
        await expect(page.locator('#tips-preference')).toHaveValue('on');
        await activate(page, 'settings-back', true);
        await activate(page, 'home-practice', true);
        await activate(page, 'practice-reef-return', true);
        await expect(page.locator('#unload')).toBeVisible();
        await activate(page, 'menu', true);
        await page.locator('#cove-picker').selectOption('wide-berth');
        await expect(page.locator('#seascape')).toHaveAttribute('aria-label', 'Wide Berth');
        await settings(page);
        await expect(page.locator('#tips-preference')).toHaveValue('on');
        await page.locator('#tips-preference').selectOption('off');
        await page.reload();
        await settings(page);
        await expect(page.locator('#tips-preference')).toHaveValue('off');
      }
      expect(await page.evaluate(key => localStorage.getItem(key), journeyKey)).toBe(savedJourney);
      expect(await page.evaluate(() => sessionStorage.getItem('unexpected-journey-write'))).toBeNull();
      report(dir, blockedStorage ? 'blocked-storage' : 'persisted', { preferenceSessionUsable: true, journeyBytesUnchanged: true, keyboard: 'Tab, Shift+Tab, End, Enter, Escape', browser: browser.version() });
    } finally {
      await context.close();
    }
  }
});
