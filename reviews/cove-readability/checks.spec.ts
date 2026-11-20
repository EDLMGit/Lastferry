import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { activate, fullyVisible, idle, tabTo } from '../../tests/e2e/ui';
import { completeSix, legacyTwo } from '../../tests/e2e/three-lanterns-support';
import { completeSeven } from '../../tests/e2e/cove-eight-support';
import { selectStop } from '../lantern-reach-difficulty/play/controls';

const dir = 'reviews/cove-readability/checks';
mkdirSync(dir, { recursive: true });

async function sail(page: Page, destination: string) {
  await selectStop(page, destination);
  await activate(page, 'sail', true);
  await idle(page);
}

async function fitInstruments(page: Page) {
  for (const id of ['menu', 'undo', 'load-toggle', 'status-toggle', 'view-toggle']) {
    await fullyVisible(page, page.locator('#' + id));
  }
  expect(await page.evaluate(() => {
    const instruments = [...document.querySelectorAll<HTMLElement>('#load-toggle, #status-toggle')];
    return instruments.every(el => {
      const box = el.getBoundingClientRect();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent?.trim() || node.parentElement?.closest('[aria-hidden=true],.sr-only')) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        if ([...range.getClientRects()].some(r => r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)) return false;
      }
      return true;
    }) && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}

test('320px inspection, keyboard return, rotating the pending manifest and protected Practice save bytes', async ({page}) => {
  const reloaded = JSON.parse(readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json', 'utf8')).reloaded;
  const journey = 'last-ferry.journey.v1';
  const original = {
    [journey]: reloaded.journey as string, 'last-ferry.mastery.v1': reloaded.mastery as string,
    [journey + '.before-six-coves']: legacyTwo, [journey + '.before-orchard']: completeSix,
    [journey + '.before-ternhaven']: completeSeven,
  };
  await page.addInitScript(values => Object.entries(values).forEach(([key, raw]) => localStorage.setItem(key, raw)), original);
  await page.setViewportSize({width:320,height:740});
  await page.goto('/?cove=holding-pier'); await idle(page);
  await fitInstruments(page);
  await tabTo(page, 'load-toggle'); await page.keyboard.press('Enter');
  await tabTo(page, 'find-home'); await page.keyboard.press('Enter');
  await expect(page.locator('#local-context')).toBeFocused();
  await expect(page.locator('#local-context')).toHaveAttribute('data-location','harbor');
  await page.keyboard.press('Escape');
  await expect(page.locator('#map-harbor')).toBeFocused();
  await tabTo(page, 'status-toggle'); await page.keyboard.press('Enter');
  const find = page.locator('[data-find-pier="rabbit-pier"]');
  await expect(find).toContainText('Find Rabbit Pier');
  await page.keyboard.press('Tab');
  await expect(find).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#local-context')).toHaveAttribute('data-location','rabbit-pier');
  await expect(page.locator('#map-rabbit-pier')).toHaveAccessibleName(/floods in 4 actions/i);
  await expect(page.getByTestId('turn')).toHaveText('00');
  await page.keyboard.press('Escape');
  await activate(page,'unload',true); await idle(page);
  await sail(page,'shallows'); await sail(page,'rabbit-pier');
  await activate(page,'board',true); await activate(page,'passenger-rabbit-2',true);
  await expect(page.locator('#passenger-rabbit-2')).toHaveAttribute('aria-pressed','false');
  await page.setViewportSize({width:740,height:320});
  await fullyVisible(page,page.locator('#commit'));
  await expect(page.locator('#passenger-rabbit-2')).toHaveAttribute('aria-pressed','false');
  await expect(page.getByTestId('turn')).toHaveText('03');
  await page.setViewportSize({width:320,height:740});
  await fullyVisible(page,page.locator('#commit'));
  await activate(page,'passenger-rabbit-2',true);
  await activate(page,'commit',true); await idle(page);
  await expect(page.getByTestId('turn')).toHaveText('04');
  await page.screenshot({path:dir+'/320-after-rise.png'});
  await activate(page,'undo',true); await idle(page);
  await expect(page.getByTestId('turn')).toHaveText('03');
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(k => [k,localStorage.getItem(k)])),Object.keys(original))).toEqual(original);
});

test('desktop signal operations, waiting, inspection and Undo report only committed actions', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/?cove=lantern-reach'); await idle(page);
  await fitInstruments(page);
  await sail(page,'signal');
  await activate(page,'open-bridge',true);
  await expect(page.getByTestId('turn')).toHaveText('01');
  await activate(page,'commit',true); await idle(page);
  await expect(page.locator('.tide-taken')).toHaveText('2 actions used');
  await activate(page,'wait',true);
  await expect(page.getByTestId('turn')).toHaveText('02');
  await activate(page,'commit',true); await idle(page);
  await expect(page.getByTestId('turn')).toHaveText('03');
  await expect(page.locator('#status-toggle')).toContainText('Wick Race turns');
  await page.screenshot({path:dir+'/desktop-current.png'});
  await activate(page,'undo',true); await idle(page);
  await expect(page.locator('#status-toggle')).toContainText('Signal Quay floods');
});

test('offline friend file reaches first control and loads real animal portraits without server requests', async ({page,context}) => {
  await page.setViewportSize({width:390,height:844});
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  page.on('pageerror', e => errors.push(e.message));
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve(process.env.FRIEND_HTML ?? '../Last Ferry.html')).href);
  await expect(page.locator('#home-play')).toHaveText('Play');
  await activate(page,'home-play',true);
  for(const name of ['Next','Next','Take the helm']) {
    await expect(page.locator('#story-continue')).toContainText(name);
    await page.waitForTimeout(650);
    await activate(page,'story-continue',true);
  }
  await idle(page);
  await expect(page.locator('#map-stone')).toHaveAttribute('aria-current','location');
  await expect(page.locator('#status-toggle')).toContainText('Rabbit Pier');
  await activate(page,'unload',true); await idle(page);
  await sail(page,'shallows'); await sail(page,'rabbit-pier');
  await activate(page,'board',true);
  const portraits=page.locator('.cove-choice-portrait img');
  await expect(portraits).toHaveCount(2);
  expect(await portraits.evaluateAll(images=>images.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true);
  expect(errors).toEqual([]); expect(requests).toEqual([]);
});
