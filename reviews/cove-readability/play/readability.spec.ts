import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { initial, reduce, validate, type Action, type State } from '../../../src/game/rules';
import { holdingPier, farShore, type Level } from '../../../src/levels/level';
import { directory, localView, report, snapshot, transferStart, checkTurn, recordRescue } from '../../../tests/e2e/large-cove-support';
import { activate, fullyVisible, idle, undo } from '../../../tests/e2e/ui';
import { runtimeSource } from '../../../tests/e2e/three-lanterns-support';
import { hash, listenToOutput, selectStop, servedBuild } from '../../lantern-reach-difficulty/play/controls';
import holding from '../../../data/experiments/holding-pier-solution.json' with { type: 'json' };
import far from '../../../data/far-shore/witnesses.json' with { type: 'json' };

const stage = process.env.COVE_READABILITY_STAGE ?? 'after';
const baseline = JSON.parse(readFileSync('reviews/far-shore/play/390x844/run.json','utf8'));
function sourceIdentity() {
  if(stage==='before') return baseline.source;
  const source = runtimeSource();
  const checks = Object.fromEntries(['reviews/cove-readability/play/config.ts','reviews/cove-readability/play/readability.spec.ts',
    'reviews/lantern-reach-difficulty/play/controls.ts','tests/e2e/large-cove-support.ts','tests/e2e/ui.ts',
    'tests/e2e/three-lanterns-support.ts'].map(path=>[path,hash(readFileSync(path))]));
  report(directory('source'),source.sha256,{...source,checks});
  return source.sha256;
}

const storage = (page: Page) => page.evaluate(() => ({
  journey: localStorage.getItem('last-ferry.journey.v1'),
  mastery: localStorage.getItem('last-ferry.mastery.v1'),
  tips: localStorage.getItem('last-ferry-tips')
}));

async function observe(page: Page, level: Level, state: State) {
  await idle(page);
  await checkTurn(page,state,false);
  if (state.status === 'playing') {
    await expect(page.locator('#map-' + state.boatNodeId)).toHaveAttribute('aria-current','location');
  }
}

async function apply(page: Page, level: Level, state: State, action: Action, atChoice?: () => Promise<void>) {
  expect(validate(state,action,level)).toBeNull();
  if (action.type === 'move') {
    await selectStop(page,action.to);
    await fullyVisible(page,page.locator('#sail'));
    if (atChoice) await atChoice();
    await activate(page,'sail',true);
  } else if (action.type === 'board' || action.type === 'unload') {
    await transferStart(page,action,atChoice);
  } else {
    await activate(page,action.type,true);
    await activate(page,'commit',true);
  }
  const next = reduce(state,action,level);
  await observe(page,level,next);
  if (next.status === 'playing') await localView(page);
  return next;
}

async function reading(page: Page, selector: string, need: number, water: number, limit: string) {
  if(stage === 'before') return;
  const instrument = page.locator(selector);
  await expect(instrument).toBeVisible();
  await expect(instrument).toHaveAttribute('data-needed',String(need));
  await expect(instrument).toHaveAttribute('data-water',String(water));
  await expect(instrument).toHaveAttribute('data-limit',limit);
  await page.waitForTimeout(600);
  await textFits(page,selector);
}

async function textFits(page:Page,selector:string){
  const instrument=page.locator(selector);
  const clipped = await instrument.evaluate(el => {
    const bounds = {left:0,top:0,right:innerWidth,bottom:innerHeight};
    for(let ancestor=el.parentElement; ancestor; ancestor=ancestor.parentElement){
      const style=getComputedStyle(ancestor);
      const rect=ancestor.getBoundingClientRect();
      if(['auto','hidden','scroll','clip'].includes(style.overflowY)){
        bounds.top=Math.max(bounds.top,rect.top); bounds.bottom=Math.min(bounds.bottom,rect.bottom);
      }
      if(['auto','hidden','scroll','clip'].includes(style.overflowX)){
        bounds.left=Math.max(bounds.left,rect.left); bounds.right=Math.min(bounds.right,rect.right);
      }
    }
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    const hidden:string[]=[];
    for(let text=walker.nextNode();text;text=walker.nextNode()){
      if(!text.textContent?.trim() || text.parentElement?.closest('.sr-only,[aria-hidden=true]')) continue;
      const range=document.createRange(); range.selectNodeContents(text);
      if([...range.getClientRects()].some(r=>r.left<bounds.left-1 || r.right>bounds.right+1 || r.top<bounds.top-1 || r.bottom>bounds.bottom+1)) hidden.push(text.textContent.trim());
    }
    return hidden;
  });
  if(clipped.length){
    const dir=directory('diagnostics');
    const name=page.viewportSize()!.width+'-'+selector.replace(/[^a-z0-9]+/g,'-');
    await snapshot(page,dir,name);
    report(dir,name,await instrument.evaluate(el=>{
      const boxes = [];
      for(let node:Element|null=el;node;node=node.parentElement){
        const {id,className,scrollTop,clientWidth,clientHeight,scrollWidth,scrollHeight}=node;
        const {overflowX,overflowY}=getComputedStyle(node);
        boxes.push({id,className,scrollTop,clientWidth,clientHeight,scrollWidth,scrollHeight,overflowX,overflowY,rect:node.getBoundingClientRect().toJSON()});
      }
      return boxes;
    }));
  }
  if (stage !== 'pilot') expect(clipped).toEqual([]);
}

async function frame(page: Page, dir: string, name: string) {
  await page.waitForTimeout(500);
  await snapshot(page,dir,name);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const [width,height] of [[390,844],[780,320]]) {
  test('Fresh Journey to Holding rescue ' + width + 'x' + height, async ({page,browser}) => {
    const out = directory(width+'x'+height+'/holding-pier');
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:width===780?'reduce':'no-preference'});
    const film = stage!=='before' && width===390 && process.env.COVE_READABILITY_RECORD !== '0';
    if (film) await listenToOutput(page);
    await page.goto('/');
    const build = await servedBuild(page);
    if(stage==='before') expect(build).toEqual(baseline.build);
    const fresh = await storage(page);
    expect(fresh).toEqual({journey:null,mastery:null,tips:null});
    await expect(page.locator('#home-play')).toHaveText('Play');
    await activate(page,'home-play',true);
    for(const [index,text] of ['Next','Next','Take the helm'].entries()) {
      await expect(page.locator('#story-position')).toHaveText((index+1) + ' of 3');
      await page.waitForTimeout(650);
      await expect(page.locator('#story-continue')).toContainText(text);
      await activate(page,'story-continue',true);
    }
    let state = initial(holdingPier);
    await observe(page,holdingPier,state);
    const saved = await storage(page);
    expect(JSON.parse(saved.journey!).checkpoint).toEqual({kind:'cove',id:'holding-pier'});
    const steps: {name:string;state:State}[] = [];
    const remember = (name:string) => steps.push({name,state});
    remember('Take the helm');
    if(stage!=='before'){
      await expect(page.locator('.gauge-goal')).toContainText('Bring all 3 to Harbor');
      await expect(page.locator('.gauge-goal')).toContainText('0/3 home');
      await expect(page.locator('.gauge-load')).toContainText('Load 2/4');
      await expect(page.locator('.gauge-crew')).toContainText('Moss aboard');
      await expect(page.locator('.gauge-water')).toContainText('Needs depth 2');
      await expect(page.locator('.gauge-water')).toContainText('Water here 3');
      await expect(page.locator('.tide-taken')).toContainText('0 actions used');
      await expect(page.locator('#status-headline')).toContainText('Rabbit Pier floods');
      await expect(page.locator('.tide-countdown')).toContainText('In 4 actions');
      await expect(page.locator('.tide-passengers')).toContainText('Pip and Rue waiting');
      await expect(page.locator('#map-rabbit-pier .map-countdown')).toHaveText('4');
    }
    const stopRecording = film ? await recordRescue(page,out,'final-arrival',true) : undefined;
    try {
      await frame(page,out,'01-first-control');
      await selectStop(page,'shallows');
      await expect(page.locator('#sail')).toBeDisabled();
      await observe(page,holdingPier,state);
      await reading(page,'#local-context .depth-reading',2,1,'passage');
      await frame(page,out,'02-blocked-passage');
      await activate(page,'close-location',true);
      await localView(page);
      for (const [i,action] of (holding.actions as Action[]).entries()) {
        const before = state;
        state = await apply(page,holdingPier,state,action, i===3 ? async () => {
          await expect(page.locator('#commit')).toBeEnabled();
          await expect(page.locator('button[aria-pressed=true][id^=passenger-]')).toHaveCount(2);
          await page.locator('#passenger-rabbit-2').tap();
          await observe(page,holdingPier,before);
          await reading(page,'#preview .depth-reading',2,3,'berth');
          if(stage!=='before'){
            await expect(page.locator('#preview .depth-reading')).toContainText('1/4 spaces');
            await textFits(page,'#preview .consequence');
          }
          await frame(page,out,'03a-single-preview');
          await page.locator('#passenger-rabbit-2').tap();
          await observe(page,holdingPier,before);
          await reading(page,'#preview .depth-reading',2,3,'berth');
          if(stage!=='before'){
            await expect(page.locator('#preview .depth-reading')).toContainText('2/4 spaces');
            await expect(page.locator('#preview .consequence')).toContainText('Pip and Rue');
            await expect(page.locator('#preview .consequence')).toContainText('Rabbit Pier');
            await textFits(page,'#preview .consequence');
          }
          await frame(page,out,'03-both-preview');
        } : undefined);
        remember('commit ' + (i+1));
        if (i===3) {
          expect(state.aboard).toEqual(['rabbit-1','rabbit-2']);
          expect(state.tideLevel).toBe(1);
          if(stage!=='before'){
            await expect(page.locator('.gauge-crew')).toContainText('Pip and Rue aboard');
            await expect(page.locator('.tide-taken')).toContainText('4 actions used');
            await expect(page.locator('#status-headline')).toContainText('Tide rises');
            await expect(page.locator('.tide-countdown')).toContainText('In 4 actions');
            await expect(page.locator('#map-rabbit-pier .map-countdown')).toHaveCount(0);
          }
          await frame(page,out,'04-after-rise');
          await undo(page,true); state=before; remember('Undo across rise');
          await observe(page,holdingPier,state);
          if(stage!=='before'){
            await expect(page.locator('#map-rabbit-pier .map-countdown')).toHaveText('1');
            await expect(page.locator('#status-headline')).toContainText('Rabbit Pier floods');
            await expect(page.locator('.tide-countdown')).toContainText('In 1 action');
            await expect(page.locator('.tide-passengers')).toContainText('Pip and Rue waiting');
          }
          await frame(page,out,'05-after-undo');
          state = await apply(page,holdingPier,state,action); remember('reboard');
        }
      }
      await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','won');
      await frame(page,out,'06-arrival');
      expect(await storage(page)).toEqual(saved);
    } finally { if(stopRecording) await stopRecording(); }
    expect(errors).toEqual([]);
    report(out,'run',{build,browser:browser.version(),viewport:[width,height],stage,tips:'default',source:sourceIdentity(),steps,saved,errors});
  });
}

for (const [width,height] of [[390,844],[780,320]]) {
  test('Far Shore same turn, different companion ' + width + 'x' + height, async ({page,browser}) => {
    const out=directory(width+'x'+height+'/far-shore');
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:width===780?'reduce':'no-preference'});
    await page.goto('/?cove=far-shore');
    const build = await servedBuild(page);
    if(stage==='before') expect(build).toEqual(baseline.build);
    const saved = await storage(page);
    const mistake = far.losingAlternatives[0].actions as Action[];
    const plan = far.witnesses[0].actions as Action[];
    const losing=[initial(farShore)];
    const winning=[initial(farShore)];
    await observe(page,farShore,losing[0]);
    for(const [i,action] of mistake.entries()){
      const before = losing.at(-1)!;
      const next = await apply(page,farShore,before,action, i===6 ? async () => {
        await reading(page,'#local-context .depth-reading',2,3,'berth');
        await frame(page,out,'01-sail-to-rush');
      } : undefined);
      losing.push(next);
      if(next.turn===7){
        await expect(page.locator('#board-unavailable')).toBeDisabled();
        await fullyVisible(page,page.locator('#board-unavailable'));
        await page.waitForTimeout(1300);
        await reading(page,'#board-unavailable .boarding-reading',4,3,'berth');
        await frame(page,out,'02-deep-party-at-rush');
      }
    }
    expect(losing.at(-1)!.status).toBe('lost');
    if(stage === 'after'){
      await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','lost');
      await activate(page,'cancel',true);
      await expect(page.locator('#status-toggle')).toHaveAccessibleName(/Crossing ended.*Open crossing result/i);
      await activate(page,'status-toggle',true);
      await expect(page.locator('#dialog[open]')).toHaveAttribute('data-mode','terminal');
      await expect(page.locator('#dialog[open]')).toHaveAttribute('data-outcome','lost');
      await expect(page.locator('#terminal-undo')).toBeVisible();
    }
    for(let i=losing.length-2;i>=0;i--){
      await undo(page,true); await observe(page,farShore,losing[i]);
    }
    for(const action of plan){
      const next=await apply(page,farShore,winning.at(-1)!,action);
      winning.push(next);
      if(next.turn===7){
        await expect(page.locator('#board')).toBeEnabled();
        await fullyVisible(page,page.locator('#board'));
        await page.waitForTimeout(1300);
        await reading(page,'#board .boarding-reading',3,3,'berth');
        await frame(page,out,'03-light-party-at-rush');
      }
      if(next.turn===8) await frame(page,out,'04-rowan-aboard');
    }
    expect(winning.at(-1)!.status).toBe('won');
    await expect(page.locator('.arrival-unrated')).toContainText('no lantern rating');
    await frame(page,out,'05-arrival');
    await undo(page,true); await observe(page,farShore,winning.at(-2)!);
    await apply(page,farShore,winning.at(-2)!,plan.at(-1)!);
    expect(await storage(page)).toEqual(saved);
    expect(errors).toEqual([]);
    report(out,'run',{build,stage,browser:browser.version(),viewport:[width,height],source:sourceIdentity(),losing,winning,terminalUndoAndRedelivery:true,reopenedLossWithEndedSign:stage==='after',saved,errors});
  });
}
