import { chromium, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { measurePanel } from '../tests/e2e/cove-panel-measure.ts';
import { measurePortraits } from '../tests/e2e/portrait-measure.ts';

const options = Object.fromEntries(process.argv.slice(2).map(arg => arg.replace(/^--/, '').split('=')));
const root = resolve(options.source ?? '.');
const output = options.output ?? 'reviews/passenger-portraits/after';
const base = options.base ?? 'http://127.0.0.1:5250';
const baseline = options.baseline === 'true';
const digest = value => createHash('sha256').update(value).digest('hex');
const walk = folder => readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(resolve(folder, entry.name)) : [resolve(folder, entry.name)]);
const paths = ['src', 'data', 'public', 'cove-ui-package/ui', 'cove-panel-package/material', 'cove-portrait-package/portraits'].map(p => resolve(root, p)).filter(existsSync).flatMap(walk).filter(p => {const local=relative(root,p).replaceAll('\\','/');return !local.startsWith('src/dev/')&&!p.endsWith('.md')&&(!local.startsWith('cove-portrait-package/')||p.endsWith('.png')||p.endsWith('generation-manifest.json'));}).concat(['index.html', 'package.json', 'package-lock.json', 'vite.config.ts'].map(p => resolve(root, p))).sort();
const snapshot = () => Object.fromEntries(paths.map(p => [relative(root, p).replaceAll('\\', '/'), digest(readFileSync(p))]));
const files = snapshot();
const source = { head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), runtimeHash: digest(JSON.stringify(files)), files, actualSourceDirectory: root, note: baseline ? 'Exact reviewed23a644a runtime/data/build archive; parent node_modules resolution. Current capture tooling is separately hashed.' : 'Current working-tree runtime; stability checked after all captures.', captureHelperSha256: digest(readFileSync(new URL(import.meta.url))), measureHelperSha256: digest(readFileSync(new URL('../tests/e2e/portrait-measure.ts', import.meta.url))), panelMeasureSha256: digest(readFileSync(new URL('../tests/e2e/cove-panel-measure.ts', import.meta.url))), command: [process.execPath, ...process.argv.slice(1)], startedAt: new Date().toISOString() };
mkdirSync(`${output}/raw`, { recursive: true });
writeFileSync(`${output}/source.json`, JSON.stringify(source, null, 2));
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const result = { sourceHash: source.runtimeHash, environment: { node: process.version, browser: browser.version(), platform: process.platform, renderer: 'SwiftShader', dpr: 1 }, runs: [] };
const sizes = options.sizes ? options.sizes.split(',').map(s => s.split('x').map(Number)) : [[844,390], [780,320], [390,844], [360,740], [320,740], [1440,900]];
try {
  for (const [width,height] of sizes) {
    const touch = width < 1000;
    const context = await browser.newContext({ viewport:{width,height}, deviceScaleFactor:1, hasTouch:touch, isMobile:touch, reducedMotion:'no-preference', ...(!baseline && width===844 ? {recordVideo:{dir:`${output}/raw`,size:{width,height}}}: {}) });
    const page = await context.newPage();
    const run = { viewport:{width,height}, input:touch?'Chromium emulated touch; wheel for normal vertical scroll':'mouse', startedAt:Date.now(), captures:[], errors:[], actions:[], subsets:[], navigations:[] };
    result.runs.push(run);
    page.on('pageerror', error => run.errors.push(error.message));
    page.on('framenavigated', frame => {if(frame===page.mainFrame())run.navigations.push({at:Date.now(),url:frame.url()});});
    const state=()=>page.evaluate(()=>window.__LAST_FERRY__.getState());
    const idle=()=>expect(page.locator('#seascape')).toHaveAttribute('aria-busy','false');
    const activate=async id=>{if(touch)await page.locator(`#${id}`).tap();else await page.locator(`#${id}`).click();const s=await state();run.actions.push({id,at:Date.now(),turn:s.turn,tide:s.tideLevel,status:s.status});};
    const whole=async()=>{if((await page.locator('#view-toggle').textContent()).includes('Whole cove'))await activate('view-toggle');};
    const move=async id=>{const visible=await page.locator(`#map-${id}`).evaluate(e=>{const r=e.getBoundingClientRect();return !e.closest('.offscreen')&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;});if(!visible)await whole();await activate(`map-${id}`);await activate('sail');await idle();};
    const transfer=async id=>{await activate(id);await activate('commit');await idle();};
    const boundary=()=>page.evaluate(()=>{const a=window.__LAST_FERRY__;return {state:a.getState(),history:a.getRenderStatus().historyLength,view:a.getViewStatus(),homecoming:{active:a.getHomecomingStatus().active,celebrations:a.getHomecomingStatus().celebrations,camera:a.getHomecomingStatus().camera.factor},victoryTarget:a.getAudioStatus().victoryTarget,hud:document.getElementById('readout').textContent};});
    const scroll=async()=>{if(await page.locator('#preview').evaluate(e=>e.scrollHeight>e.clientHeight+1)){const b=await page.locator('#preview').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.wheel(0,600);await expect.poll(()=>page.locator('#preview').evaluate(e=>e.scrollTop)).toBeGreaterThan(0);}};
    const save=async(label,fit=false)=>{
      await page.locator('#preview img').evaluateAll(images=>Promise.all(images.map(image=>image.decode().catch(()=>{}))));
      await page.waitForTimeout(150);
      const path=`${output}/${width}x${height}-${label}.png`;await page.screenshot({path});
      const observation=await page.evaluate(()=>{const a=window.__LAST_FERRY__;return{state:a.getState(),view:a.getViewStatus(),viewport:a.getViewportStatus(),placement:a.getActionPlacement(),hudRect:document.querySelector('.hud').getBoundingClientRect().toJSON(),ferryRect:a.getFrameStatus().boat};});
      const measurement=fit?await page.evaluate(measurePanel):null;
      const portraits=fit?await page.evaluate(measurePortraits):null;
      run.captures.push({label,path,sha256:digest(readFileSync(path)),observation,measurement,portraits});
      if(fit){expect(measurement.failures).toEqual([]);if(!baseline)for(const c of portraits.choices){expect(c.image).not.toBeNull();expect(c.image).toMatchObject({complete:true,naturalWidth:256,naturalHeight:256,alt:'',draggable:false,pointerEvents:'none'});expect(c.image.rect.width).toBeGreaterThanOrEqual(40);expect(c.image.rect.width).toBeLessThanOrEqual(44);expect(c.imageContained).toBe(true);expect(c.checkOverlapsPortrait).toBe(false);}}
      console.log(`${width}x${height} ${label}: ${measurement?.failures.length ?? '-'} fit failures`);
    };
    try {
      await page.goto(`${base}/?cove=holding-pier`);await page.waitForFunction(()=>(window.__LAST_FERRY__?.getMetrics().frames??0)>4);await idle();await save('play');
      await activate('unload');await save('sheep-choice',true);await activate('commit');await idle();
      await move('shallows');await move('rabbit-pier');await activate('board');await save('rabbit-boarding',true);
      await activate('passenger-rabbit-2');await save('rabbit-subset',true);await scroll();await save('warning-scrolled');
      await activate('passenger-rabbit-2');await activate('commit');await idle();expect(await state()).toMatchObject({turn:4,tideLevel:1,status:'playing'});
      await activate('undo');await idle();expect(await state()).toMatchObject({turn:3,tideLevel:0});await transfer('board');
      await move('shallows');await move('stone');await transfer('board');await move('harbor');
      const before=await boundary();expect(before.state).toMatchObject({turn:8,tideLevel:2,status:'playing',aboard:['rabbit-1','rabbit-2','sheep-1']});
      await activate('unload');await save('harbor-preview',true);await scroll();await save('harbor-consequence');
      const fixed=await page.locator('#commit').boundingBox();
      for(const id of ['rabbit-2','sheep-1','rabbit-1','rabbit-1','sheep-1','rabbit-2']){
        await activate(`passenger-${id}`);const fit=await page.evaluate(measurePanel);expect(fit.failures).toEqual([]);const b=await page.locator('#commit').boundingBox();expect(Math.abs(b.x-fixed.x)).toBeLessThanOrEqual(1);expect(Math.abs(b.y-fixed.y)).toBeLessThanOrEqual(1);expect(await boundary()).toEqual(before);const selected=await page.locator('.cove-choice[aria-pressed="true"]').count();expect(await page.locator('#commit').isDisabled()).toBe(selected===0);run.subsets.push({chosen:selected,confirm:b,fitFailures:fit.failures});
      }
      await activate('cancel');expect(await boundary()).toEqual(before);await transfer('unload');expect(await state()).toMatchObject({turn:9,status:'won'});await page.waitForTimeout(1500);await save('arrival');
      await activate('terminal-undo');await idle();expect(await state()).toMatchObject({turn:8,status:'playing',delivered:[]});await transfer('unload');expect(await state()).toMatchObject({turn:9,status:'won'});expect(run.errors).toEqual([]);run.outcome='passed';
    } catch(error){run.outcome='failed';run.failure=String(error.stack??error);await page.screenshot({path:`${output}/${width}x${height}-failure.png`}).catch(()=>{});throw error;}
    finally{run.finalBoundary=await boundary().catch(()=>null);if(page.video())run.video=await page.video().path();await context.close();writeFileSync(`${output}/capture-manifest.json`,JSON.stringify(result,null,2));}
  }
  expect(snapshot()).toEqual(files);result.runtimeUnchanged=true;
} finally {result.finishedAt=new Date().toISOString();await browser.close();writeFileSync(`${output}/capture-manifest.json`,JSON.stringify(result,null,2));}
