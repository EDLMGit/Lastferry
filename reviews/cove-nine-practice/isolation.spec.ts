import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {activate,fullyVisible,idle,state,tabTo} from '../../tests/e2e/ui';
import {candidate,capture,completeSeven,replay} from '../../tests/e2e/cove-eight-support';
import {home,runtimeSource,storage} from '../../tests/e2e/three-lanterns-support';
import {directory,report} from '../../tests/e2e/large-cove-support';
import {initial} from '../../src/game/rules';
import {parseJourney} from '../../src/campaign/progress';
const id='drowned-orchard', key='last-ferry.journey.v1';
const accepted=JSON.parse(readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json','utf8'));
const older=JSON.parse(completeSeven);
const backgrounds:Record<string,string>={'completed-eight':accepted.reloaded.journey,'pending-ternhaven':JSON.stringify({...older,checkpoint:{kind:'scene',id:'ternhaven-wave'}},null,2)+'\n','legacy-seven':completeSeven};
for(const [name,raw] of Object.entries(backgrounds)){
  test(name+': independent Practice rescue, Restart, Home and reload',async({page,browser})=>{
    const {level,witnesses}=candidate(id), best=accepted.reloaded.mastery, source=runtimeSource();
    const narrow=name==='legacy-seven', width=narrow?320:name==='completed-eight'?1024:390,height=narrow?740:width===1024?640:844;
    expect(parseJourney(raw).valid).toBe(true);
    await page.setViewportSize({width,height});
    await page.addInitScript(({key,older,raw,best})=>{
      if(!location.protocol.startsWith('http'))return;
      const backups=Object.fromEntries(['.before-six-coves','.before-orchard','.before-ternhaven','.before-ternhaven.2'].map((s,i)=>[key+s,older+' '.repeat(i)]));
      if(!sessionStorage.getItem('c9-seeded')){localStorage.setItem(key,raw);localStorage.setItem('last-ferry.mastery.v1',best);sessionStorage.setItem('journey-writes','0');sessionStorage.setItem('mastery-writes','0');for(const [k,b] of Object.entries(backups))localStorage.setItem(k,b);sessionStorage.setItem('c9-seeded','1')}
      const set=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){
        if(this===localStorage && (k===key||k==='last-ferry.mastery.v1')){const counter=k===key?'journey-writes':'mastery-writes';sessionStorage.setItem(counter,String(Number(sessionStorage.getItem(counter))+1))}
        if(this===localStorage&&k.startsWith(key+'.before-'))sessionStorage.setItem('c9-backup-write','1');
        return set.call(this,k,v);
      };
    },{key,older:completeSeven,raw,best});
    const unchanged=async()=>{
      expect(await storage(page)).toEqual({journey:raw,mastery:best,journeyWrites:0,masteryWrites:0});
      const actual=await page.evaluate(key=>({backups:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith(key+'.before-')).map(k=>[k,localStorage.getItem(k)])),writes:sessionStorage.getItem('c9-backup-write')}),key);
      expect(actual.writes).toBeNull();
      expect(actual.backups).toEqual(Object.fromEntries(['.before-six-coves','.before-orchard','.before-ternhaven','.before-ternhaven.2'].map((s,i)=>[key+s,completeSeven+' '.repeat(i)])));
    };
    await page.goto('/');await activate(page,'home-practice',true);
    await expect(page.locator('[data-practice]')).toHaveCount(10);
    await expect(page.locator('#practice-ternhaven .mastery-badge')).toHaveAccessibleName(/2 of 3 lanterns/);
    await expect(page.locator('#practice-'+id)).toContainText('Playtest · no lantern rating');
    await page.locator('.mastery-criteria summary').tap();
    await expect(page.locator('.mastery-targets dt')).toHaveCount(9);await expect(page.locator('.mastery-targets')).not.toContainText(level.title);
    await page.locator('#practice-'+id).scrollIntoViewIfNeeded();await activate(page,'practice-'+id,true);await idle(page);
    expect(await state(page)).toEqual(initial(level));await unchanged();
    await home(page);await page.goto('/?cove='+id);await idle(page);await unchanged();
    if(name!=='pending-ternhaven')await capture(page,name,'opening');
    if(narrow){
      await activate(page,'menu',true);await expect(page.locator('#dialog')).toContainText('Playtest · no lantern rating');
      await tabTo(page,'settings');await page.keyboard.press('Enter');
      await expect(page.locator('#tips-preference')).toHaveValue('off');
      await page.setViewportSize({width:780,height:320});
      await activate(page,'fullscreen',true);await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');
      expect(await page.evaluate(()=>document.fullscreenElement!.contains(document.querySelector('#dialog')))).toBe(true);
      await activate(page,'fullscreen',true);await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??null)).toBe(null);
      await page.keyboard.press('Escape');await expect(page.locator('#settings')).toBeFocused();await page.keyboard.press('Escape');
      await page.setViewportSize({width,height});await idle(page);expect(await state(page)).toEqual(initial(level));
    }
    const states=await replay(page,level,witnesses[0].actions,true);expect(states.at(-1)?.status).toBe('won');await unchanged();
    await expect(page.locator('.arrival-unrated')).toHaveText('Rescued · no lantern rating');await expect(page.locator('#mastery-result')).toHaveCount(0);
    await expect(page.locator('#arrival-cast li')).toHaveCount(level.passengers.length);
    await expect(page.locator('.arrival-result')).toHaveAttribute('data-actions',String(witnesses[0].actions.length));
    await fullyVisible(page,page.locator('#choose-cove'));await fullyVisible(page,page.locator('#terminal-restart'));
    if(narrow){await capture(page,name,'unrated');await page.locator('#arrival-details summary').tap();await expect(page.locator('#arrival-details')).toContainText('Playtest · no lantern rating');await page.locator('#arrival-details summary').tap()}
    await activate(page,'terminal-restart',true);await idle(page);expect(await state(page)).toEqual(initial(level));await unchanged();
    await home(page);await unchanged();await page.goto('/');await unchanged();
    report(directory(name),'isolation',{source:source.sha256,browser:browser.version(),viewport:[width,height],witness:witnesses[0].id,result:states.at(-1),saved:await storage(page),backupWrites:0,distinctExistingBackups:4});
  })
}
