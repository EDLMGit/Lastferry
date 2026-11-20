import {expect,test} from '@playwright/test';
import {initial} from '../../src/game/rules';
import {ternhaven} from '../../src/levels/level';
import {directory,report,snapshot} from '../../tests/e2e/large-cove-support';
import {seven,sevenScenes,fitStory,more,mastery} from '../../tests/e2e/orchard-journey-support';
import {fixture,storage,home,legacyTwo,ongoing,untouched,runtimeSource} from '../../tests/e2e/three-lanterns-support';
import {activate,idle,state,tabTo} from '../../tests/e2e/ui';
import {audio,campaign,timeline,startCheck} from '../../tests/e2e/journey-six-support';
const scene='ternhaven-wave', key='last-ferry.journey.v1', backup=key+'.before-ternhaven';
const raw=JSON.stringify({version:1,completed:seven,acknowledgedScenes:sevenScenes,checkpoint:{kind:'complete'}},null,2)+'\n';
const best=JSON.stringify({version:1,results:{'ternhaven@1':{coveId:'ternhaven',revision:1,lanterns:3,actions:14,successfulUndos:0}}});
for(const [w,h] of [[390,844],[780,320],[320,740],[1440,900]]){
  test('Ternhaven scene, handoff and safe viewport '+w+'x'+h,async({page,browser})=>{
    const source=runtimeSource(), dir=directory(w+'x'+h);
    const moving=w===390||w===780;
    await page.setViewportSize({width:w,height:h});
    await page.emulateMedia({reducedMotion:moving?'no-preference':'reduce'});
    await fixture(page,raw,best);
    await page.goto('/');
    if(moving)await activate(page,'home-sound',true);
    await activate(page,'home-play',true);
    const beat=async(name:string)=>{const before=await timeline(page);await snapshot(page,dir,name);return {before,after:await timeline(page)}};
    const beats=[];
    await expect(page.locator('#story-continue')).toHaveAccessibleName('Continue to Ternhaven');
    const pending=(await storage(page)).journey;
    expect(JSON.parse(pending!)).toMatchObject({checkpoint:{kind:'scene',id:scene},completed:seven,acknowledgedScenes:sevenScenes});
    expect(await page.evaluate(k=>localStorage.getItem(k),backup)).toBe(raw);
    const predecessor=await state(page);
    expect((await campaign(page)).level).toBe('orchard-landing');
    expect((await mastery(page)).current).toBeNull();
    if(moving){
      beats.push(await beat('scene-begin'));
      expect(beats[0].before.elapsed).toBeLessThan(1050);
      await page.waitForTimeout(Math.max(0,3600-(await timeline(page)).elapsed));
      beats.push(await beat('scene-greeting'));
      expect(beats[1].before.elapsed).toBeGreaterThan(2900);
      expect(beats[1].before.elapsed).toBeLessThan(5200);
    }
    await expect(page.locator('#story-pause')).toBeDisabled({timeout:12000});
    beats.push(await beat('scene-held'));
    await expect(page.locator('#story-caption')).toHaveText('Juniper, Sedge and Fennel are aboard. Willow is waiting by the reeds.');
    const fit=await fitStory(page);
    expect(await state(page)).toEqual(predecessor);
    expect((await storage(page)).journey).toBe(pending);
    if(w===780){
      await more(page);await activate(page,'story-replay',true);
      await page.locator('#story-more > summary').tap();
      await activate(page,'story-pause',true);
      const stopped=await timeline(page);await page.waitForTimeout(220);
      expect((await timeline(page)).elapsed).toBe(stopped.elapsed);
      await page.keyboard.press('Enter');
      await expect.poll(async()=>(await timeline(page)).elapsed).toBeGreaterThan(1100);
      await more(page);await tabTo(page,'story-settings');await page.keyboard.press('Enter');
      const held=await timeline(page), sound=await audio(page);
      expect(sound.storySources).toBe(0);
      await activate(page,'fullscreen',true);
      await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');

      await activate(page,'fullscreen',true);
      await expect.poll(()=>page.evaluate(()=>document.fullscreenElement)).toBeNull();
      await page.setViewportSize({width:390,height:844});await page.setViewportSize({width:w,height:h});
      await page.evaluate(()=>{for(const hidden of [true,false]){Object.defineProperty(document,'hidden',{value:hidden,configurable:true});document.dispatchEvent(new Event('visibilitychange'));}});
      await page.keyboard.press('Escape');await expect(page.locator('#story-settings')).toBeFocused();
      expect((await timeline(page)).elapsed).toBe(held.elapsed);
      expect((await audio(page)).lastStoryCue).toEqual(sound.lastStoryCue);
      await activate(page,'story-read',true);await expect(page.locator('.story-description')).toContainText('Willow');
      await page.keyboard.press('Escape');await expect(page.locator('#story-read')).toBeFocused();
      await activate(page,'story-skip',true);expect(await timeline(page)).toMatchObject({settled:true,recap:true});
      expect((await storage(page)).journey).toBe(pending);
      await page.reload();await tabTo(page,'home-play');await page.keyboard.press('Enter');
      expect(await timeline(page)).toMatchObject({scene,settled:true,recap:true});
      await expect(page.locator('#story-continue')).toBeFocused();
      await more(page);await activate(page,'story-replay-scene',true);
      await tabTo(page,'story-continue');expect((await timeline(page)).settled).toBe(false);
      await page.keyboard.press('Enter');
    } else await activate(page,'story-continue',true);
    await startCheck(page,'ternhaven');
    expect(await state(page)).toEqual(initial(ternhaven));
    expect(await mastery(page)).toMatchObject({successfulUndos:0,current:null});
    expect((await storage(page)).mastery).toBe(best);
    await snapshot(page,dir,'playable-handoff');
    report(dir,'observed',{source:source.sha256,browser:browser.version(),dpr:1,fit,beats,initial:await state(page),saved:await storage(page)});
  });
}
test('Practice and Home leave old, complete-seven and active Journey records untouched',async({browser,baseURL})=>{
  for(const rawBytes of [ongoing,raw,legacyTwo]){
    const ctx=await browser.newContext({baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    try{
      const page=await ctx.newPage();await fixture(page,rawBytes,best);await page.goto('/');
      await activate(page,'home-options',true);await activate(page,'settings-back',true);
      await activate(page,'home-practice',true);await expect(page.locator('[data-practice]')).toHaveCount(9);
      await activate(page,'practice-ternhaven',true);await idle(page);expect(await state(page)).toEqual(initial(ternhaven));await home(page);
      await untouched(page,rawBytes);await page.goto('/?cove=ternhaven');await idle(page);await untouched(page,rawBytes);
      expect((await storage(page)).mastery).toBe(best);expect(await page.evaluate(k=>localStorage.getItem(k),backup)).toBeNull();
    }finally{await ctx.close()}
  }
});
