import {test,expect} from '@playwright/test';
import{mkdirSync,writeFileSync,readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{ready,wholeCove,activate,state}from'./ui';
import{reviewDir}from'./evidence';

test('Whole cove water drag preserves clear framing and Play still pans',async({browser,baseURL})=>{
  mkdirSync(reviewDir,{recursive:true});
  const source=Object.fromEntries(['src/main.ts','src/scene/world.ts','src/scene/view.ts'].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
  for(const viewport of [{width:844,height:390},{width:780,height:320}]){
    const ctx=await browser.newContext({baseURL,viewport,hasTouch:true,deviceScaleFactor:1});
    const page=await ctx.newPage();page.setDefaultTimeout(15000);
    await ready(page,'wide-berth');await wholeCove(page,true);
    const before=await page.evaluate(()=>(window as any).__LAST_FERRY__.getViewStatus()),initial=await state(page);
    const cdp=await ctx.newCDPSession(page);
    const drag=async()=>{const x=viewport.width-30,y=Math.round(viewport.height*.55);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-65,y:y+25}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150);};
    await drag();
    const after=await page.evaluate(()=>(window as any).__LAST_FERRY__.getViewStatus());
    const capture=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`${reviewDir}/${viewport.width}x${viewport.height}-overview-drag.png`,Buffer.from(capture.data,'base64'));
    writeFileSync(`${reviewDir}/${viewport.width}x${viewport.height}-overview-drag.json`,JSON.stringify({source,browser:browser.version(),viewport,before,after,state:await state(page)},null,2));
    expect(await state(page)).toEqual(initial);expect(after.focus).toEqual(before.focus);expect(after.scale).toEqual(before.scale);
    await activate(page,'view-toggle',true);
    await drag();
    expect(await page.evaluate(()=>(window as any).__LAST_FERRY__.getViewStatus().panned)).toBe(true);
    expect(await state(page)).toEqual(initial);
    await activate(page,'back-to-boat',true);
    expect(await page.evaluate(()=>(window as any).__LAST_FERRY__.getViewStatus().panned)).toBe(false);
    await ctx.close();
  }
});
