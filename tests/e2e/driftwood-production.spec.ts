import {expect,test} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {productionURL,reviewDir} from './evidence';
import {act,activate,fullyVisible,idle} from './ui';
import {measureStory} from './story-support';
test('production Driftwood entry, bundled portraits and full-label fit across native sizes',async({browser})=>{
const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));mkdirSync(reviewDir,{recursive:true});
try{await page.goto(`${productionURL}/?cove=driftwood-yard`);await expect(page.locator('.identity h1')).toHaveText('Driftwood Yard');await idle(page);for(const id of ['map-yard','board','map-mooring','unload','map-bend','map-reeds','board','map-bend','map-mooring','board','map-harbor'])await act(page,id,true);await activate(page,'unload',true);await expect.poll(()=>page.locator('#preview img').evaluateAll(images=>images.length===3&&images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth===256))).toBe(true);
for(const size of [{width:320,height:740},{width:390,height:844},{width:780,height:320},{width:844,height:390},{width:1440,height:900}]){await page.setViewportSize(size);await expect.poll(async()=>(await page.evaluate(measureStory)).failures).toEqual([]);for(const id of ['passenger-fern','passenger-oat','passenger-nell','commit'])await fullyVisible(page,page.locator(`#${id}`));await page.screenshot({path:`${reviewDir}/${size.width}x${size.height}-production-delivery.png`});writeFileSync(`${reviewDir}/${size.width}x${size.height}-production-fit.json`,JSON.stringify(await page.evaluate(measureStory),null,2));}
await activate(page,'commit',true);await idle(page);await expect(page.locator('#dialog')).toContainText('3 passengers safe at Harbor');expect(errors).toEqual([]);writeFileSync(`${reviewDir}/production-environment.json`,JSON.stringify({browser:browser.version(),node:process.version,errors,source:'same production dist built by gates/build-handoff.txt; no DEV debug bridge'},null,2));
}finally{await context.close();}
});
