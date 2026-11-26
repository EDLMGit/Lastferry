import { test, expect } from '@playwright/test';
import { readFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { initial } from '../../src/game/rules';
import { candidate, execute } from '../../tests/e2e/cove-eight-support';
import { fixture } from '../../tests/e2e/three-lanterns-support';
import { report, directory, snapshot, localView } from '../../tests/e2e/large-cove-support';

test.use({ hasTouch:true,isMobile:true,deviceScaleFactor:1,video:'off',reducedMotion:'reduce' });
test.setTimeout(180000);
for(const [width,height] of [[390,844],[780,320]]){
test('before centered arrival '+width+'x'+height,async({page,browser})=>{
  const {level,witnesses}=candidate('ternhaven');
  await page.setViewportSize({width,height});
  await fixture(page);
  await page.goto('http://127.0.0.1:5284/?cove=ternhaven');
  expect(await page.evaluate(()=>typeof (window as any).__LAST_FERRY__)).toBe('undefined');
  let current=initial(level);
  for(const action of witnesses[0].actions)current=await execute(page,level,action,current,false);
  expect(current.status).toBe('won');
  await expect(page.locator('#dialog')).toHaveAttribute('data-outcome','won');
  await page.waitForTimeout(1200);
  await snapshot(page,directory('before'),width+'x'+height);
  report(directory('before'),width+'x'+height,{current,viewport:[width,height],browser:browser.version(),node:process.version,reducedMotion:true,bundle:'index-Brb746hC.js',bundleSHA256:createHash('sha256').update(readFileSync('.cache/arrival-before-dist/assets/index-Brb746hC.js')).digest('hex'),runtimeSource:'c1ed244aef5d0c7f235d111258bc28658ade82086df5427f2228537aafdc783d',sourceBase:'107b18adedc4f59202eb105a35c2d9676d2752ee',method:'Actual fourteen-action UI rescue in isolated reviewed production bundle; no state injection',card:await page.locator('#dialog').evaluate(el=>({bounds:el.getBoundingClientRect().toJSON(),text:el.textContent})),when:new Date().toISOString()});
});
}
