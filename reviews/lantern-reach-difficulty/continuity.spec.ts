import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { completeSeven, candidate, execute } from '../../tests/e2e/cove-eight-support';
import { home } from '../../tests/e2e/three-lanterns-support';
import { activate, fullyVisible, idle, restart, tabTo } from '../../tests/e2e/ui';
import { initial } from '../../src/game/rules';

const id = 'lantern-reach';
const journey = 'last-ferry.journey.v1';
const mastery = 'last-ferry.mastery.v1';
const accepted = JSON.parse(readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json','utf8')).reloaded;

for (const [width,height] of [[320,740],[1440,900]]) {
  test(width + ' Practice, forecast focus, Restart and save isolation', async ({ page,browser }) => {
    const dir = join('reviews/lantern-reach-difficulty/continuity', width+'x'+height);
    mkdirSync(dir,{recursive:true});
    const { level, witnesses } = candidate(id);
    const keys = { [journey]: width === 320 ? completeSeven : accepted.journey as string, [mastery]: accepted.mastery as string,
      [journey+'.before-orchard']: completeSeven, [journey+'.before-ternhaven']: completeSeven.trimEnd() };
    await page.setViewportSize({width,height});
    await page.addInitScript(keys => {
      if (!location.protocol.startsWith('http')) return;
      if (!sessionStorage.getItem('seeded')) {
        Object.entries(keys).forEach(([key,raw]) => localStorage.setItem(key,raw));
        sessionStorage.setItem('seeded','1');
      }
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k,v) {
        if (this === localStorage && Object.hasOwn(keys,k)) sessionStorage.setItem('protected-write',k);
        return set.call(this,k,v);
      };
    }, keys);
    const checkStorage = async () => {
      expect(await page.evaluate(names => ({keys:Object.fromEntries(names.map(k=>[k,localStorage.getItem(k)])),
        write:sessionStorage.getItem('protected-write')}),Object.keys(keys))).toEqual({keys,write:null});
    };
    await page.goto('/');
    await activate(page,'home-practice',true);
    await expect(page.locator('[data-practice]')).toHaveCount(11);
    for (const cove of [id,'drowned-orchard']) await expect(page.locator('#practice-'+cove)).toContainText('no lantern rating');
    await activate(page,'practice-'+id,true); await idle(page);
    const src = await page.locator('head script[type=module][src]').getAttribute('src');
    expect(src).toMatch(/assets\/index-.*\.js/);
    const sha256 = createHash('sha256').update(await (await page.request.get(src!)).body()).digest('hex');
    await expect(page.getByTestId('turn')).toHaveText('00');
    await tabTo(page,'status-toggle'); await page.keyboard.press('Enter');
    await expect(page.locator('.forecast-detail')).toContainText(level.bridge!.name);
    await fullyVisible(page,page.locator('#cancel'));
    await page.keyboard.press('Escape');
    await expect(page.locator('#status-toggle')).toBeFocused();
    await page.screenshot({path:join(dir,'start.png')});
    const plan = witnesses[0];
    await execute(page,level,plan.actions[0],initial(level),false);
    await restart(page,true);
    await expect(page.getByTestId('turn')).toHaveText('00');
    await expect(page.locator('#undo')).toBeDisabled();
    await checkStorage();
    if (width === 1440) {
      let state = initial(level);
      for (const action of plan.actions) state = await execute(page,level,action,state,false);
      await expect(page.locator('.arrival-unrated')).toContainText('no lantern rating');
      await page.screenshot({path:join(dir,'arrival.png')});
      await home(page,true);
    } else await home(page);
    await page.goto('/?cove='+id); await idle(page); await checkStorage();
    writeFileSync(join(dir,'observed.json'),JSON.stringify({width,height,browser:browser.version(),src,sha256,
      save:width===320?'completed seven':'completed eight',protectedKeys:Object.keys(keys),writes:0,
      completedRescue:width===1440?plan.id:null},null,2)+'\n');
  });
}
