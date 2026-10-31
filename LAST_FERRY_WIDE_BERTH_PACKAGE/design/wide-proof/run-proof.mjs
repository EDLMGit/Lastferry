import { registerHooks } from 'node:module';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { extname, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Loader adaptation only. Production TypeScript function bodies are unchanged.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !extname(specifier)) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.json')) return {format:'module',shortCircuit:true,source:`export default ${readFileSync(new URL(url),'utf8')};`};
    return nextLoad(url, context);
  },
});

assert.ok(process.argv[2], 'Pass the actual Lastferry repository root as the first argument. This harness tests the supplied non-spatial proposal, not a shipped level.');
const repositoryRoot = pathToFileURL(resolve(process.argv[2])+sep);
const {initial,reduce,validate,preview,legalActions,load,draft} = await import(new URL('src/game/rules.ts',repositoryRoot));
const {Session} = await import(new URL('src/game/session.ts',repositoryRoot));
const l = JSON.parse(readFileSync(new URL('./wide-berth-mechanics.proposal.json',import.meta.url),'utf8'));
const move=to=>({type:'move',to});
const board=(...passengerIds)=>({type:'board',passengerIds});
const unload=(...passengerIds)=>({type:'unload',passengerIds});
const wait={type:'wait'};
const wide=['alder','clover','poppy','wren'], low=['sorrel','finch'];
const sheep=['alder','clover'], rabbits=['poppy','wren','sorrel','finch'];
const sixPickup=[move('high-quay'),move('wide-berth'),board(...wide),move('high-quay')];
const plans=[
  {id:'six-space-deep-delivery-first',criticalPlan:true,description:'Carry six spaces through deep water and deliver the whole first group via Outer Buoy. Board the low pair exactly on the second rise.',actions:[...sixPickup,move('outer-buoy'),move('harbor'),unload(...wide),move('high-quay'),move('shell-landing'),board(...low),move('high-quay'),move('harbor'),unload(...low)]},
  {id:'stage-sheep-light-return',criticalPlan:true,description:'After carrying six spaces, leave both sheep safely at High Quay. Rescue the low pair early, carry four rabbits through the depth-three shortcut, then collect the sheep.',actions:[...sixPickup,unload(...sheep),move('shell-landing'),board(...low),move('high-quay'),move('harbor'),unload(...rabbits),move('high-quay'),board(...sheep),move('harbor'),unload(...sheep)]},
  {id:'stage-one-sheep-five-bodies-wait-after-rescue',criticalPlan:false,description:'A supported safe variation, not the second main critical strategy: stage one sheep, rescue the low pair, then wait only after all endangered piers are empty. Five bodies occupy six spaces; return at the second rise and collect the staged sheep later.',actions:[...sixPickup,unload('alder'),move('shell-landing'),board(...low),wait,wait,wait,move('high-quay'),move('harbor'),unload('clover',...rabbits),move('high-quay'),board('alder'),move('harbor'),unload('alder')]},
  {id:'two-entry-pauses-then-staging',criticalPlan:false,description:'Two optional entry pauses remain recoverable by choosing the staging plan; the full deep-delivery plan has less deadline slack.',actions:[wait,wait,...sixPickup,unload(...sheep),move('shell-landing'),board(...low),move('high-quay'),move('harbor'),unload(...rabbits),move('high-quay'),board(...sheep),move('harbor'),unload(...sheep)]},
];

function conservation(s) {
  const ids=[...s.aboard,...s.delivered,...Object.values(s.waitingByPier).flat()];
  assert.deepEqual([...ids].sort(),[...l.objective.requiredPassengerIds].sort());
  assert.ok(load(s,l)<=l.rules.capacity);
}
function summary(s) {return {turn:s.turn,tide:s.tideLevel,node:s.boatNodeId,aboard:s.aboard,bodyCount:s.aboard.length,load:load(s,l),draft:draft(s,l),waiting:s.waitingByPier,delivered:s.delivered,status:s.status,lossReason:s.lossReason};}
function replay(actions) {
  let state=initial(l);
  for(const action of actions) {assert.equal(validate(state,action,l),null);state=reduce(state,action,l);conservation(state);}
  return state;
}
const witnesses=[];
for(const plan of plans) {
  const session=new Session(l), steps=[];
  for(const action of plan.actions) {
    const before=structuredClone(session.state), predicted=preview(before,action,l);
    assert.equal(predicted.error,null);
    assert.deepEqual(session.state,before,'Preview must not mutate committed state');
    const tx=session.commit(action);assert.ok(tx);assert.deepEqual(tx.after,predicted.state);
    assert.equal(tx.after.turn,before.turn+1);conservation(tx.after);
    assert.equal(session.commit(wait),null,'Busy input must not add an action');
    session.finish();
    assert.equal(session.undo(),true);assert.deepEqual(session.state,before);
    assert.ok(session.commit(action));session.finish();
    steps.push({action,...summary(session.state)});
  }
  assert.equal(session.state.status,'won');
  const terminal=structuredClone(session.state);
  for(let i=0;i<plan.actions.length;i++)assert.equal(session.undo(),true);
  assert.deepEqual(session.state,initial(l));assert.equal(session.history.length,0);
  witnesses.push({...plan,actionCount:plan.actions.length,maxBodyCount:Math.max(...steps.map(s=>s.bodyCount)),maxLoad:Math.max(...steps.map(s=>s.load)),terminal:summary(terminal),steps,fullStateUndo:'passed'});
}

const failures=[
  {id:'full-deep-delivery-after-one-pause',description:'One extra pause before committing to the full deep-delivery route leaves the low pair waiting when action 10 arrives.',actions:[...sixPickup,wait,move('outer-buoy'),move('harbor'),unload(...wide),move('high-quay'),move('shell-landing')]},
  {id:'low-pair-first',description:'Saving the low pair first reaches Wide Berth at action 5, after the rise has flooded its waiting first group; arrival is not boarding.',actions:[move('high-quay'),move('shell-landing'),board(...low),move('high-quay'),move('wide-berth')]},
  {id:'take-four-and-return',description:'Taking a four-space subset and leaving a sheep at Wide Berth cannot get back to board that sheep before the first rise.',actions:[move('high-quay'),move('wide-berth'),board('alder','poppy','wren'),move('high-quay'),unload('alder','poppy','wren')]},
  {id:'full-load-wait-for-shortcut',description:'Waiting with the full first group at High Quay until the shortcut reaches depth four floods Shell Landing with its pair still waiting.',actions:[...sixPickup,wait,wait,wait,wait,wait,wait]},
  {id:'stage-everyone-then-wait',description:'Staging the first group safely does not remove the low pair deadline.',actions:[...sixPickup,unload(...wide),wait,wait,wait,wait,wait]},
];
const losingAlternatives=[];
for(const plan of failures) {
  const session=new Session(l),steps=[];
  for(const action of plan.actions) {
    const before=structuredClone(session.state), prediction=preview(before,action,l);
    assert.equal(prediction.error,null);const tx=session.commit(action);assert.ok(tx);session.finish();
    assert.deepEqual(tx.after,prediction.state);conservation(session.state);steps.push({action,...summary(session.state)});
  }
  assert.equal(session.state.status,'lost');
  const terminal=structuredClone(session.state), lastBefore=session.history.at(-1);
  assert.equal(session.undo(),true);assert.deepEqual(session.state,lastBefore);
  losingAlternatives.push({...plan,terminal:summary(terminal),steps,terminalUndo:'passed'});
}

function blockedCase(id,actions,action) {
  const session=new Session(l);
  for(const a of actions){assert.ok(session.commit(a));session.finish();}
  const before=structuredClone(session.state),history=structuredClone(session.history),prediction=preview(before,action,l);
  assert.ok(prediction.error);assert.deepEqual(prediction.state,before);
  assert.equal(reduce(before,action,l),before);assert.equal(session.commit(action),null);
  assert.deepEqual(session.state,before);assert.deepEqual(session.history,history);assert.equal(session.busy,false);
  return {id,state:summary(before),action,error:prediction.error,previewAndCommitUnchanged:true};
}
const blocked=[
  blockedCase('full-shortcut-before-first-rise',sixPickup,move('harbor')),
  blockedCase('full-shortcut-after-first-rise',[...sixPickup,wait],move('harbor')),
  blockedCase('cannot-anticipate-second-rise',[...sixPickup,wait,wait,wait,wait,wait],move('harbor')),
  blockedCase('unload-one-rabbit-is-still-five-spaces',[...sixPickup,unload('poppy')],move('shell-landing')),
  blockedCase('six-space-loaded-low-return-before-second-rise',plans[2].actions.slice(0,7),move('high-quay')),
];

// Both exact flood boundaries: board happens before the tide and flooding check.
const wideBoundary=replay([wait,wait,move('high-quay'),move('wide-berth')]);
assert.equal(wideBoundary.turn,4);assert.equal(wideBoundary.tideLevel,0);
const wideAll=preview(wideBoundary,board(...wide),l).state;
const wideSubset=preview(wideBoundary,board('alder','poppy','wren'),l).state;
assert.equal(wideAll.turn,5);assert.equal(wideAll.status,'playing');assert.equal(wideAll.tideLevel,1);
assert.equal(wideSubset.status,'lost');assert.deepEqual(wideSubset.lossReason.passengerIds,['clover']);
const lowBoundary=replay(plans[0].actions.slice(0,9));
assert.equal(lowBoundary.turn,9);assert.equal(lowBoundary.tideLevel,1);
const lowBoth=preview(lowBoundary,board(...low),l).state;
const lowOne=preview(lowBoundary,board('sorrel'),l).state;
assert.equal(lowBoth.turn,10);assert.equal(lowBoth.tideLevel,2);assert.equal(lowBoth.status,'playing');
assert.equal(lowOne.status,'lost');assert.deepEqual(lowOne.lossReason.passengerIds,['finch']);
const boundarySession=new Session(l);
for(const action of plans[0].actions.slice(0,9)){assert.ok(boundarySession.commit(action));boundarySession.finish();}
assert.ok(boundarySession.commit(board('sorrel')));boundarySession.finish();assert.equal(boundarySession.state.status,'lost');
assert.equal(boundarySession.undo(),true);assert.deepEqual(boundarySession.state,lowBoundary);
for(const action of plans[0].actions.slice(9)){assert.ok(boundarySession.commit(action));boundarySession.finish();}
assert.equal(boundarySession.state.status,'won');

// Undo an understandable losing choice to the fork, then execute the full plan.
const recovered=new Session(l);
for(const action of failures[0].actions){assert.ok(recovered.commit(action));recovered.finish();}
while(recovered.state.turn>4)assert.equal(recovered.undo(),true);
assert.deepEqual(recovered.state,replay(sixPickup));
for(const action of plans[0].actions.slice(4)){assert.ok(recovered.commit(action));recovered.finish();}
assert.equal(recovered.state.status,'won');

// Focused availability evidence at the actual time of the successful light return.
const lightReturnBefore=replay(plans[1].actions.slice(0,8));
assert.equal(lightReturnBefore.turn,8);assert.equal(lightReturnBefore.tideLevel,1);
assert.equal(load(lightReturnBefore,l),4);assert.equal(draft(lightReturnBefore,l),3);
assert.equal(validate(lightReturnBefore,move('harbor'),l),null);
assert.equal(l.edges.find(e=>e.id==='harbor-high-quay').baseDepth+lightReturnBefore.tideLevel,3);
const fullShortcutAfterRise=replay(plans[2].actions.slice(0,11));
assert.equal(fullShortcutAfterRise.tideLevel,2);assert.equal(load(fullShortcutAfterRise,l),6);
assert.equal(validate(fullShortcutAfterRise,move('harbor'),l),null);
const allSixAtHighQuay=replay([...sixPickup,unload(...wide),move('shell-landing'),board(...low),move('high-quay'),unload(...low)]);
assert.equal(allSixAtHighQuay.status,'playing');assert.equal(allSixAtHighQuay.waitingByPier['high-quay-pier'].length,6);
assert.equal(allSixAtHighQuay.aboard.length,0);assert.equal(allSixAtHighQuay.tideLevel,1);

// Bounded breadth-first reachability over actual legal actions, including every
// nonempty board/unload subset. Keys ignore passenger list order and normalize
// turn only after the final authored rise. This is not a gameplay action budget.
const horizon=l.validation.searchDepthLimit,lastRise=Math.max(...l.rules.tide.rises.map(x=>x.afterTurn));
const key=(s,carriedSix)=>JSON.stringify([Math.min(s.turn,lastRise),s.tideLevel,s.boatNodeId,[...s.aboard].sort(),[...s.delivered].sort(),Object.entries(s.waitingByPier).sort().map(([k,v])=>[k,[...v].sort()]),s.status,carriedSix]);
const start=initial(l),queue=[{s:start,parent:-1,action:null,depth:0,carriedSix:false}],seen=new Set([key(start,false)]);
let firstWinIndex=-1,winningStates=0,lostStates=0,depthCutoffs=0,maxBodies=0,maxLoad=0,atFirstRiseWithoutHavingCarriedSix=0;
for(let i=0;i<queue.length;i++) {
  const {s,depth,carriedSix}=queue[i];
  maxBodies=Math.max(maxBodies,s.aboard.length);maxLoad=Math.max(maxLoad,load(s,l));
  if(s.turn===5 && s.status==='playing' && !carriedSix)atFirstRiseWithoutHavingCarriedSix++;
  if(s.status==='won'){winningStates++;if(firstWinIndex<0)firstWinIndex=i;continue;}
  if(s.status==='lost'){lostStates++;continue;}
  if(depth>=horizon){depthCutoffs++;continue;}
  for(const action of legalActions(s,l)) {
    const next=reduce(s,action,l),nextCarriedSix=carriedSix||load(next,l)===6,k=key(next,nextCarriedSix);
    if(seen.has(k))continue;
    conservation(next);seen.add(k);queue.push({s:next,parent:i,action,depth:depth+1,carriedSix:nextCarriedSix});
  }
}
assert.ok(firstWinIndex>=0);assert.equal(atFirstRiseWithoutHavingCarriedSix,0);
assert.equal(maxLoad,6);assert.equal(maxBodies,5);
const firstWinningSequence=[];
for(let i=firstWinIndex;queue[i].parent>=0;i=queue[i].parent)firstWinningSequence.unshift(queue[i].action);
const sourceIdentities=['src/game/rules.ts','src/game/session.ts','src/levels/level.ts'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(new URL(path,repositoryRoot))).digest('hex')}));
const output={
  referenceBaseline:'7e324e88827857469bf348fca311548344d03da6',node:process.version,
  input:'Supplied non-spatial proposal; sourceIdentities identify the actual code exercised. The referenceBaseline label does not identify a newer checkout.',
  scope:'Actual unchanged production reducer and Session; mechanical proposal only. No production edits, spatial geometry, model clearance, animation, UI/browser, phone or fun claim.',
  sourceIdentities,witnesses,losingAlternatives,blocked,
  boundaries:{wide:{before:summary(wideBoundary),all:summary(wideAll),subset:summary(wideSubset)},low:{before:summary(lowBoundary),both:summary(lowBoth),one:summary(lowOne)},terminalUndoAndRecovery:'passed'},
  criticalForkRecovery:'passed',
  actualLightShortcut:{before:summary(lightReturnBefore),action:move('harbor'),depth:3,legal:true},
  fullShortcutAfterLastRise:{before:summary(fullShortcutAfterRise),depth:4,legal:true},
  allSixAtHighQuay:summary(allSixAtHighQuay),
  boundedSearch:{horizon,lastRise,turnNormalization:'Clamp only state-key turn at action 10; reducer retains real turns.',passengerOrderNormalization:'Ignore array order only in reachability keys; identity and membership remain exact.',traceProperty:'Keep a carriedSix flag in each search key to verify that every surviving first-rise path has already used the larger capacity.',legalActionCoverage:'Wait, every adjacent legal move, all nonempty board and unload subsets.',uniqueStates:seen.size,winningStates,lostStates,depthCutoffs,maxBodies,maxLoad,playingStatesAtFirstRiseWithoutHavingCarriedSix:atFirstRiseWithoutHavingCarriedSix,firstWinningSequenceLength:firstWinningSequence.length,firstWinningSequence,claim:'Feasibility and bounded mechanical reachability only; not a product difficulty or playtime claim.'},
};
writeFileSync(new URL('./proof-results.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
writeFileSync(new URL('./witnesses.json',import.meta.url),JSON.stringify({levelId:l.id,proposalOnly:true,witnesses:plans,losingAlternatives:failures},null,2)+'\n');
console.log(JSON.stringify({witnesses:witnesses.map(w=>({id:w.id,criticalPlan:w.criticalPlan,actions:w.actionCount,maxLoad:w.maxLoad,maxBodies:w.maxBodyCount})),previewAndAtomicFloodBoundaries:'passed',fullStateUndoAndRecovery:'passed',passengerConservation:'passed',blockedCases:blocked.map(x=>x.id),boundedSearch:output.boundedSearch,sourceIdentities},null,2));
