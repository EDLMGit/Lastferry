import { registerHooks } from 'node:module';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { extname, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Loader adaptation only: production TypeScript bodies are imported unchanged.
// The app uses a bundler for extensionless imports and JSON; this proof uses Node.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !extname(specifier)) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.json')) return { format: 'module', shortCircuit: true, source: `export default ${readFileSync(new URL(url), 'utf8')};` };
    return nextLoad(url, context);
  },
});

const repositoryRoot = process.argv[2]
  ? pathToFileURL(resolve(process.argv[2]) + sep)
  : new URL('../../repo/', import.meta.url);
const { initial, reduce, validate, preview, legalActions, load, draft } = await import(new URL('src/game/rules.ts',repositoryRoot));
const { Session } = await import(new URL('src/game/session.ts',repositoryRoot));
const l = JSON.parse(readFileSync(new URL('./driftwood-mechanics.proposal.json', import.meta.url), 'utf8'));
const move = to => ({type:'move',to});
const board = (...passengerIds) => ({type:'board',passengerIds});
const unload = (...passengerIds) => ({type:'unload',passengerIds});
const wait = {type:'wait'};
const critical = [move('yard'),board('nell'),move('mooring'),unload('nell'),move('bend'),move('reeds'),board('fern','oat')];
const plans = [
  {id:'stage-nell-collect-group',description:'Rescue Nell to the nearby high landing, save both rabbits at the rise, return for Nell and bring all three home together.',actions:[...critical,move('bend'),move('mooring'),board('nell'),move('harbor'),unload('nell','fern','oat')]},
  {id:'stage-nell-deliver-rabbits-first',description:'Same critical rescue plan, then deliver the rabbits before collecting Nell. This is a different safe delivery order, not a second distinct critical rescue strategy.',actions:[...critical,move('bend'),move('mooring'),move('harbor'),unload('fern','oat'),move('mooring'),board('nell'),move('harbor'),unload('nell')]},
];
function checkConservation(s) {
  const ids = [...s.aboard,...s.delivered,...Object.values(s.waitingByPier).flat()];
  assert.deepEqual(ids.sort(),[...l.objective.requiredPassengerIds].sort());
}
function summarize(s) {
  return {turn:s.turn,tide:s.tideLevel,node:s.boatNodeId,aboard:s.aboard,load:load(s,l),draft:draft(s,l),waiting:s.waitingByPier,delivered:s.delivered,status:s.status,lossReason:s.lossReason};
}
const proof=[];
for (const p of plans) {
  const session = new Session(l);
  const steps=[];
  for (const a of p.actions) {
    const before = structuredClone(session.state);
    const prediction = preview(before,a,l);
    assert.equal(prediction.error,null);
    const tx=session.commit(a);assert.ok(tx);
    assert.deepEqual(tx.after,prediction.state);
    assert.equal(tx.after.turn,before.turn+1);
    checkConservation(tx.after);
    session.finish();
    assert.equal(session.undo(),true);assert.deepEqual(session.state,before);
    assert.ok(session.commit(a));session.finish();
    steps.push({action:a,...summarize(session.state)});
  }
  assert.equal(session.state.status,'won');
  for(let i=p.actions.length;i>0;i--)assert.equal(session.undo(),true);
  assert.deepEqual(session.state,initial(l));
  proof.push({...p,actionCount:p.actions.length,steps,fullStateUndo:'passed'});
}

const alternatives=[
  {id:'deliver-nell-immediately',description:'Going straight home with Nell uses the extra trip needed to board the rabbits before action7.',actions:[move('yard'),board('nell'),move('harbor'),unload('nell'),move('mooring'),move('bend'),move('reeds')]},
  {id:'rabbits-first-wait-for-return-depth',description:'The loaded return is too shallow before the first rise; waiting for it leaves Nell on the low yard.',actions:[move('mooring'),move('bend'),move('reeds'),board('fern','oat'),wait,wait,wait]},
  {id:'only-one-rabbit-at-last-safe-boarding',description:'Both rabbits must leave the low landing before it floods. A one-rabbit subset at action7 strands the other.',actions:[...critical.slice(0,-1),board('fern')]},
];
const failed=[];
for(const p of alternatives){let s=initial(l);const steps=[];for(const a of p.actions){assert.equal(validate(s,a,l),null);s=reduce(s,a,l);checkConservation(s);steps.push({action:a,...summarize(s)});}assert.equal(s.status,'lost');failed.push({...p,steps});}
let loadedReturn=initial(l);for(const a of alternatives[1].actions.slice(0,4))loadedReturn=reduce(loadedReturn,a,l);
const blockedAction=move('bend');assert.match(validate(loadedReturn,blockedAction,l),/Too shallow/);assert.equal(reduce(loadedReturn,blockedAction,l),loadedReturn);
let lastSafe=initial(l);for(const a of critical.slice(0,-1))lastSafe=reduce(lastSafe,a,l);
assert.equal(lastSafe.turn,6);assert.equal(lastSafe.tideLevel,0);
const both=preview(lastSafe,board('fern','oat'),l).state;assert.equal(both.tideLevel,1);assert.equal(both.status,'playing');assert.deepEqual(both.waitingByPier['reeds-pier'],[]);
const one=preview(lastSafe,board('fern'),l).state;assert.equal(one.status,'lost');assert.deepEqual(one.lossReason.passengerIds,['oat']);

// Bounded breadth-first exploration; turn normalization after the last authored
// rise removes harmless repeated Wait states. The bound is a proof-tool setting,
// never a gameplay budget or a playtime/difficulty rating.
const horizon=24,lastRise=Math.max(...l.rules.tide.rises.map(x=>x.afterTurn));
const key=s=>JSON.stringify([Math.min(s.turn,lastRise),s.tideLevel,s.boatNodeId,[...s.aboard].sort(),[...s.delivered].sort(),Object.entries(s.waitingByPier).sort().map(([k,v])=>[k,[...v].sort()]),s.status]);
const queue=[{s:initial(l),a:[]}],seen=new Set([key(initial(l))]);let firstWin=null,winningStates=0,lostStates=0;
for(let i=0;i<queue.length;i++){
  const {s,a}=queue[i];
  if(s.status==='won'){winningStates++;if(!firstWin)firstWin=a;continue;}
  if(s.status==='lost'){lostStates++;continue;}
  if(a.length>=horizon)continue;
  for(const action of legalActions(s,l)){
    const n=reduce(s,action,l);checkConservation(n);const k=key(n);
    if(!seen.has(k)){seen.add(k);queue.push({s:n,a:[...a,action]});}
  }
}
assert.ok(firstWin);assert.equal(firstWin.length,12);
const sourcePaths=['src/game/rules.ts','src/game/session.ts'];
const sourceIdentities=sourcePaths.map(path=>{const b=readFileSync(new URL(path,repositoryRoot));return {path,sha256:createHash('sha256').update(b).digest('hex')};});
const output={baseline:'da1f2686ce6aff8d754e13111447dabb6e1313f0',node:process.version,scope:'Actual unchanged production reducer/Session; mechanical proposal only. No world geometry, rendering, assets, browser or phone validation.',sourceIdentities,witnesses:proof,losingAlternatives:failed,blockedReturn:{state:summarize(loadedReturn),action:blockedAction,reason:validate(loadedReturn,blockedAction,l),stateUnchanged:true},lastSafeBoarding:{both:summarize(both),one:summarize(one)},boundedSearch:{horizon,turnNormalization:'clamp key at last rise, action11; rules retain actual turn',uniqueStates:seen.size,winningStates,lostStates,firstWinningSequenceLength:firstWin.length,firstWinningSequence:firstWin,claim:'Witness feasibility and focused alternatives; no product difficulty/playtime claim.'}};
writeFileSync(new URL('./proof-results.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
writeFileSync(new URL('./witnesses.json',import.meta.url),JSON.stringify({levelId:l.id,proposalOnly:true,witnesses:plans,losingAlternatives:alternatives},null,2)+'\n');
console.log(JSON.stringify({witnessActions:plans.map(p=>p.actions.length),allStateUndo:'passed',previewAndAtomicRise:'passed',passengerConservation:'passed',blockedReturn:'passed',losingAlternatives:alternatives.map(p=>p.id),boundedSearch:output.boundedSearch,sourceIdentities},null,2));
