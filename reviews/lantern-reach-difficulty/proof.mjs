import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !extname(specifier) && context.parentURL &&
      existsSync(new URL(specifier + '.ts', context.parentURL))) return next(specifier + '.ts', context);
    return next(specifier, context);
  },
});
const { initial, legalActions, reduce, validate, load, draft } = await import('../../src/game/rules.ts');
const { lanternReach: level } = await import('../../src/levels/level.ts');
const plans = JSON.parse(readFileSync('data/lantern-reach/witnesses.json', 'utf8'));
const [signal, reserve] = plans.witnesses;
const [late, greedy] = plans.losingAlternatives;
const lastRise = level.rules.tide.rises.at(-1).afterTurn;

function key(s, cove, finalRise) {
  return JSON.stringify([
    Math.min(finalRise, s.turn), s.tideLevel, s.bridgeOpen, s.boatNodeId,
    s.aboard.toSorted(), s.delivered.toSorted(),
    cove.piers.map(pier => s.waitingByPier[pier.id].toSorted()), s.status, s.lossReason,
  ]);
}

function search(start, allow = () => true, cove = level) {
  const finalRise = cove.rules.tide.rises.at(-1).afterTurn;
  const states = [start], parents = [-1], edges = [null];
  const visited = new Set([key(start,cove,finalRise)]);
  let transitions = 0, wins = 0, losses = 0, shortest = null;
  for (let i = 0; i < states.length; i++) {
    const s = states[i];
    if (s.status === 'lost') losses++;
    if (s.status === 'won') {
      wins++;
      if (!shortest) {
        shortest = [];
        for (let j = i; j !== 0; j = parents[j]) shortest.unshift(edges[j]);
      }
    }
    for (const action of legalActions(s, cove)) {
      if (!allow(action, s)) continue;
      transitions++;
      const next = reduce(s, action, cove);
      const signature = key(next,cove,finalRise);
      if (visited.has(signature)) continue;
      visited.add(signature);
      states.push(next);
      parents.push(i);
      edges.push(action);
    }
  }
  return { states: states.length, transitions, wins, losses,
    minimumAdditionalActions: shortest?.length ?? null, shortest };
}

function replay(actions, start = initial(level), cove = level) {
  let s = start;
  const trace = [];
  for (const action of actions) {
    assert.equal(validate(s, action, cove), null, JSON.stringify({action, s}));
    s = reduce(s, action, cove);
    trace.push({action, state:s, load:load(s, cove), draft:draft(s, cove)});
  }
  return {state:s, trace};
}

const start = initial(level);
const fixedOpen = {...start, bridgeOpen:true};
const phaseOne = greedy.actions.slice(0,1);
const fork = signal.actions.slice(0,6);
const noSignalTime = fork.filter(action => action.type !== 'open-bridge');
const both = late.actions[6];
const seeDeer = signal.actions[6];
const boardDeer = signal.actions[7];
const all = search(start);
const permanentlyClosed = search(start, action => action.type !== 'open-bridge');
const permanentlyOpen = search(fixedOpen);
const fullFirst = search(replay(phaseOne).state);
const fixedOpenFullFirst = search(replay(phaseOne, fixedOpen).state);
const forkState = replay(fork).state;
const postBoard = reduce(forkState, both, level);
const afterLateBoard = search(postBoard);
const alternativesAtSix = legalActions(forkState, level).map(action => ({
  action, ...search(reduce(forkState,action,level)),
}));
const earlyOpenFork = replay(noSignalTime, fixedOpen).state;
const fixedOpenBoardBoth = replay([both, seeDeer, boardDeer], earlyOpenFork);
const fixedOpenContinuation = search(fixedOpenBoardBoth.state);
const allReplays = [...plans.witnesses,...plans.losingAlternatives].map(plan => ({id:plan.id,...replay(plan.actions)}));

assert.equal(all.minimumAdditionalActions, 13);
assert.equal(permanentlyClosed.minimumAdditionalActions, 17);
assert.equal(permanentlyOpen.minimumAdditionalActions, 12);
assert.equal(allReplays[0].state.turn, all.minimumAdditionalActions);
assert.equal(allReplays[1].state.turn, permanentlyClosed.minimumAdditionalActions);
for (const row of allReplays.slice(0,2)) assert.equal(row.state.status, 'won');
for (const row of allReplays.slice(2)) assert.deepEqual(row.state.lossReason,
  {code:'PASSENGER_STRANDED',pierId:'east-pier',passengerIds:['sorbus']});
assert.equal(forkState.turn, 6);
assert.deepEqual(forkState.aboard, []);
assert.equal(postBoard.status,'playing');
assert.equal(afterLateBoard.wins, 0);
assert.deepEqual(alternativesAtSix.filter(row => row.wins).map(row => row.action),[seeDeer]);
assert.equal(fullFirst.wins, 0);
assert.equal(fixedOpenFullFirst.minimumAdditionalActions, 13);
assert.equal(earlyOpenFork.turn, 5);
assert.equal(fixedOpenBoardBoth.state.turn, 8);
assert.equal(fixedOpenBoardBoth.state.status, 'playing');
assert.equal(fixedOpenContinuation.minimumAdditionalActions, 4);
assert.equal(reserve.actions.some(action => action.type === 'open-bridge'), false);
const grace = structuredClone(level);
grace.rules.tide.rises[1].afterTurn = 9;
const graceBoat = replay([...fork,both,seeDeer,boardDeer], initial(grace), grace);
assert.equal(graceBoat.state.status, 'playing');
assert.equal(graceBoat.state.turn, 9);
const graceContinuation = search(graceBoat.state, undefined, grace);
assert.ok(graceContinuation.wins);

const staging = structuredClone(level);
staging.start.boatNodeId = 'signal';
staging.rules.tide.rises = [{afterTurn:4,level:1},{afterTurn:9,level:2}];
for (const pier of staging.piers) {
  pier.elevation = {'signal':3,'harbor':3,'wick':1,'east-float':2}[pier.nodeId];
  staging.world.islands.find(island => island.id === pier.islandId).elevation = pier.elevation;
}
for (const edge of staging.edges) edge.baseDepth = 3;
const race = staging.edges.find(edge => edge.current);
race.current.phases = [1,0,1].map((from,index) => ({
  tideLevel:index,from:race.nodes[from],to:race.nodes[1-from],
}));
const stagingResult = search(initial(staging),undefined,staging);
assert.equal(stagingResult.minimumAdditionalActions,14);
const delaySignal = search(initial(staging),(action,s) => action.type !== 'open-bridge' || s.turn >= 9,staging);
assert.ok(delaySignal.wins);
const prototypes = {
  drySignalStart:{
    disposition:staging.start, tide:staging.rules.tide, elevations:staging.piers.map(p => ({id:p.id,elevation:p.elevation})),
    race:race.current, edgeBaseDepths:staging.edges.map(e => [e.id,e.baseDepth]),
    unrestricted:stagingResult, noSignalBeforeBothFloods:delaySignal,
  },
  laterStepsFlood:{
    rises:grace.rules.tide.rises, unrestricted:search(initial(grace),undefined,grace),
    boardRabbitsFirstAfterSignal:graceBoat, remaining:graceContinuation,
  },
};
const sources = ['src/game/rules.ts','src/levels/level.ts','data/lantern-reach.level.json','data/lantern-reach/witnesses.json'];
const sha256 = Object.fromEntries(sources.map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
console.log(JSON.stringify({
  level:level.id, sha256, lastRise,
  all, permanentlyClosed, permanentlyOpen,
  temptingOpening:{state:replay(phaseOne).state, actual:fullFirst, sameActionOnFixedOpen:fixedOpenFullFirst},
  wickDecision:{forkState, afterBoarding:postBoard, afterLateBoard, alternativesAtSix,
    permanentlyOpenArrival:earlyOpenFork, permanentlyOpenPickups:fixedOpenBoardBoth, remaining:fixedOpenContinuation},
  replays:allReplays, prototypes,
},null,2));
