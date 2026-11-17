import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';

registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !extname(specifier) && context.parentURL &&
      existsSync(fileURLToPath(new URL(specifier + '.ts', context.parentURL))))
    return next(specifier + '.ts', context);
  return next(specifier, context);
} });
const { Session } = await import('../../src/game/session.ts');
const { ternhaven } = await import('../../src/levels/level.ts');
const { MasteryStore, MASTERY_STORAGE_KEY, masteryTargets, resultFor } = await import('../../src/game/mastery.ts');
const plans = JSON.parse(readFileSync(new URL('../../data/ternhaven/witnesses.json', import.meta.url), 'utf8'));
const report = { source:'a2740e61ec5a782f558ea6caad4181466d04e9f7', runtime:process.version,
  method:'Native Node exact-source Session/reducer/mastery execution; no browser or Vite imports',
  witnesses:[], checks:[] };
function run(actions, session = new Session(ternhaven)) {
  for (const action of actions) {
    assert.ok(session.commit(action), 'legal committed action');
    session.finish();
  }
  return session;
}
function memory(raw=null, fail=false) {
  let bytes = raw; const writes=[];
  return {writes, get bytes(){return bytes;},
    port: { getItem(key) {assert.equal(key,MASTERY_STORAGE_KEY);return bytes;},
      setItem(key,value) {writes.push({key,value});if(fail)throw Error('quota');bytes=value;} } };
}
for (const witness of plans.witnesses) {
  const m=memory(); const store=new MasteryStore(()=>m.port);
  const s=run(witness.actions.slice(0,-1)); const last=witness.actions.at(-1);
  assert.ok(s.state.delivered.includes('sedge'));
  assert.equal(s.state.status,'playing');assert.equal(s.result,null);
  const before=structuredClone(s.state);
  assert.ok(s.commit(last));assert.equal(s.state.status,'won');
  assert.equal(s.result,null);assert.equal(s.takeResult(),null);
  s.finish();
  assert.equal(s.result.lanterns,3);
  assert.deepEqual(new Set(s.state.delivered),new Set(ternhaven.objective.requiredPassengerIds));
  assert.equal(store.best('ternhaven'),null);assert.equal(m.writes.length,0);
  assert.ok(s.undo());assert.deepEqual(s.state,before);assert.equal(s.result,null);assert.equal(s.successfulUndos,1);
  run([last],s);assert.equal(s.result.lanterns,2);assert.equal(s.result.actions,witness.actions.length);
  assert.equal(m.writes.length,0);assert.ok(store.accept(s.takeResult()));
  assert.equal(s.takeResult(),null);assert.equal(m.writes.length,1);
  assert.deepEqual(new MasteryStore(()=>m.port).best('ternhaven'),s.result??resultFor('ternhaven',witness.actions.length,1));
  report.witnesses.push({id:witness.id,actions:witness.actions.length,initialLanterns:3,terminalUndoRedeliveryLanterns:2,earlySedge:true,acceptanceWrites:1});
}
assert.equal(masteryTargets.ternhaven.target,14);assert.equal(masteryTargets.ternhaven.revision,1);
const oldIds=Object.keys(masteryTargets).filter(id=>id!=='ternhaven');
const oldResults=Object.fromEntries(oldIds.map(id=>[id+'@1',resultFor(id,masteryTargets[id].target,0)]));
const raw='\n'+JSON.stringify({version:1,results:oldResults},null,2)+'\n';
const oldMem=memory(raw), oldStore=new MasteryStore(()=>oldMem.port);
for(const id of oldIds)assert.deepEqual(oldStore.best(id),oldResults[id+'@1']);
assert.equal(oldStore.best('ternhaven'),null);assert.equal(oldMem.bytes,raw);assert.equal(oldMem.writes.length,0);
const actual=run(plans.witnesses[0].actions);
const restored=new Session(ternhaven);restored.state=structuredClone(actual.state);restored.finish();
assert.equal(restored.result,null);assert.equal(oldStore.accept(restored.takeResult()),false);assert.equal(oldMem.bytes,raw);
assert.ok(oldStore.accept(actual.takeResult()));
for(const id of oldIds)assert.deepEqual(oldStore.best(id),oldResults[id+'@1']);
report.checks.push({name:'eight accepted serialized bests and exact bytes preserved on read; no synthetic restored award',passed:true});
const best=run(plans.witnesses.find(w=>w.actions.length===13).actions).takeResult();
const lowerMem=memory(JSON.stringify({version:1,results:{'ternhaven@1':best}})), lowerStore=new MasteryStore(()=>lowerMem.port);
const plan14=plans.witnesses.find(w=>w.actions.length===14).actions;
const slow=run([...plan14.slice(0,-1),{type:'wait'},plan14.at(-1)]);
assert.equal(slow.result.actions,15);assert.equal(slow.result.lanterns,1);
assert.equal(lowerStore.accept(slow.takeResult()),false);assert.deepEqual(lowerStore.best('ternhaven'),best);assert.equal(lowerMem.writes.length,0);
report.checks.push({name:'current one-lantern rescue cannot replace earlier three-lantern best',passed:true});
const failed=memory(null,true), failedStore=new MasteryStore(()=>failed.port);
assert.ok(failedStore.accept(best));assert.deepEqual(failedStore.best('ternhaven'),best);assert.equal(failedStore.persistent,false);assert.ok(failedStore.issue);
report.checks.push({name:'failed storage retains visit best with notice',passed:true});
const unknown=new Session({...ternhaven,id:'independent-unscored'});
run(plans.witnesses[0].actions,unknown);assert.equal(unknown.state.status,'won');assert.equal(unknown.result,null);assert.equal(unknown.takeResult(),null);
assert.equal(failedStore.accept(null),false);
report.checks.push({name:'generic unscored completed rescue remains unscored/no-write',passed:true});
report.passed=true;
writeFileSync(new URL('./independent-session-rerun.local.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

