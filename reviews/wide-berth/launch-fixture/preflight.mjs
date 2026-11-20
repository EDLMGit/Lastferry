import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
for(const viewport of [{width:390,height:844},{width:780,height:320}]){
 const context=await browser.newContext({viewport,deviceScaleFactor:1});
 const page=await context.newPage();
 await page.route('**/__launch-authoring-fixture',route=>route.fulfill({contentType:'text/html',body:'<html><body style="margin:0;background:#173e43;color:#f5d996"><canvas id="art" style="margin:8px;display:block"></canvas><p style="font:18px Georgia;margin:8px">Authoring fixture: painter only; not gameplay evidence.</p></body></html>'}));
 await page.goto('http://127.0.0.1:5270/__launch-authoring-fixture');
 await page.evaluate(async({width,height})=>{const {createCoveStoryPainter}=await import('/src/campaign/story-painter.ts');const canvas=document.querySelector('#art');const H=width<480?551:242;canvas.style.width=(width-16)+'px';canvas.style.height=H+'px';window.painter=createCoveStoryPainter(canvas);window.painter.resize(width-16,H,1);},{...viewport});
 for(const [beat,t]of [['begin',0],['release',2.4],['glide',4.9],['end',8]]){await page.evaluate(t=>window.painter.draw('launch',t),t);const name=`${viewport.width}x${viewport.height}-${beat}.png`;await page.screenshot({path:`reviews/wide-berth/launch-fixture/${name}`});results.push({viewport,beat,seconds:t,path:name});}
 await context.close();
}
writeFileSync('reviews/wide-berth/launch-fixture/observations.json',JSON.stringify({note:'Direct current Canvas2D painter authoring fixture only; does not establish actual journey UI, animation or rescue. Root will capture actual scenes separately.',browser:browser.version(),sourceSha256:createHash('sha256').update(readFileSync('src/campaign/story-painter.ts')).digest('hex'),results},null,2));
await browser.close();
