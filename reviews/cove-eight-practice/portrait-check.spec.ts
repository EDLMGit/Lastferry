import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { candidate, replay, sources, acceptedBest } from '../../tests/e2e/cove-eight-support';
import { fixture, ongoing } from '../../tests/e2e/three-lanterns-support';
import { activate, ready, state } from '../../tests/e2e/ui';
import { directory, localView, report, snapshot } from '../../tests/e2e/large-cove-support';

test.use({ viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,video:'off',reducedMotion:'reduce' });
test('final delivery uses three distinct correct loaded portrait images',async({page})=>{
  const source=sources();
  const {level,witnesses}=candidate('ternhaven');
  await fixture(page,ongoing,acceptedBest);
  await ready(page,'ternhaven');
  await replay(page,level,witnesses[0].actions.slice(0,-1));
  const before=await state(page);
  await localView(page);
  await activate(page,'unload',true);
  const inspect=()=>page.locator('.passenger-options button').evaluateAll(buttons=>buttons.map(button=>{
    const holder=button.querySelector<HTMLElement>('.cove-choice-portrait')!;
    const image=holder.querySelector<HTMLImageElement>('img')!;
    return {id:button.id,name:button.querySelector('.cove-choice-name')!.textContent,appearance:holder.dataset.appearance,currentSrc:image.currentSrc,src:image.src,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,complete:image.complete,state:image.dataset.portraitState,imageRect:image.getBoundingClientRect().toJSON()};
  }));
  const immediate=await inspect();
  await expect(page.locator('.passenger-options img[data-portrait-state=loaded]')).toHaveCount(3);
  const loaded=await inspect();
  const expected:Record<string,string>={'passenger-willow':'beaver-brown','passenger-juniper':'deer-chestnut','passenger-fennel':'rabbit-tan'};
  expect(loaded.map(row=>row.id)).toEqual(Object.keys(expected));
  for(const row of loaded){
    expect(row.appearance).toBe(expected[row.id]);
    expect(row.currentSrc).toContain(expected[row.id]);
    expect(row.naturalWidth).toBe(256);expect(row.naturalHeight).toBe(256);
    expect(row.imageRect.width).toBe(44);expect(row.imageRect.height).toBe(44);
    expect(row.complete).toBe(true);
    await page.locator('#'+row.id).screenshot({path:directory('portrait-check')+'/'+row.id+'.png'});
  }
  await snapshot(page,directory('portrait-check'),'final-delivery');
  expect(await state(page)).toEqual(before);
  expect(sources()).toEqual(source);
  report(directory('portrait-check'),'mapping',{runtime:source.sha256,driverSHA256:createHash('sha256').update(readFileSync('reviews/cove-eight-practice/portrait-check.spec.ts')).digest('hex'),before,immediate,loaded});
});
