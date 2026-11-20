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

const { initial, legalActions, reduce, validate, draft, load } = await import('../../src/game/rules.ts');
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const levelPath = 'data/far-shore.level.json';
const plansPath = 'data/far-shore/witnesses.json';
const earlyPlanPath = 'reviews/far-shore/development/early-witness.json';
const earlyLevelPath = 'reviews/far-shore/play/development/level.json';
const level = read(levelPath);
const plans = read(plansPath);
const earlyPlan = read(earlyPlanPath);
const early = read(earlyLevelPath);
const originalRules = structuredClone(level.rules);
originalRules.tide.rises[1].afterTurn = 9;
assert.deepEqual(early.rules, originalRules);
for (const key of ['edges', 'nodes', 'piers', 'start', 'passengers', 'objective']) {
  assert.deepEqual(early[key], level[key]);
}
const deeper = structuredClone(level);
deeper.nodes.find(node => node.id === 'rush').baseDepth++;

function signature(state, cove, lastRise) {
  return JSON.stringify([
    Math.min(lastRise, state.turn), state.tideLevel, state.boatNodeId,
    state.aboard.toSorted(), state.delivered.toSorted(),
    cove.piers.map(pier => state.waitingByPier[pier.id].toSorted()),
    state.status, state.lossReason?.code, state.lossReason?.pierId, state.lossReason?.edgeId,
    state.lossReason?.passengerIds.toSorted(),
  ]);
}

function search(cove, start = initial(cove), permit = () => true) {
  const lastRise = cove.rules.tide.rises.at(-1).afterTurn;
  const states = [start];
  const visited = new Set([signature(start, cove, lastRise)]);
  let winningStates = 0;
  let transitions = 0;
  let minimum = null;
  for (let index = 0; index < states.length; index++) {
    const state = states[index];
    if (state.status === 'won') {
      minimum ??= state.turn - start.turn;
      winningStates++;
    }
    for (const action of legalActions(state, cove)) {
      if (!permit(state, action)) continue;
      transitions++;
      const next = reduce(state, action, cove);
      const key = signature(next, cove, lastRise);
      if (visited.has(key)) continue;
      visited.add(key);
      states.push(next);
    }
  }
  return { states: states.length, transitions, winningStates, minimum };
}

function replay(cove, actions) {
  let state = initial(cove);
  for (const action of actions) {
    assert.equal(validate(state, action, cove), null, JSON.stringify({state, action}));
    state = reduce(state, action, cove);
  }
  return state;
}

function receivingBerth(cove, actions) {
  const before = replay(cove, actions.slice(0, 7));
  const boarding = { type:'board', passengerIds:['rowan'] };
  const desired = { ...before, aboard: [...before.aboard, 'rowan'] };
  return { turn: before.turn, aboard: before.aboard, at: before.boatNodeId, delivered: before.delivered,
    slotsFree: cove.rules.capacity - load(before, cove), slotsWithDeer: load(desired, cove),
    depthWithDeer: draft(desired, cove), berthDepth: cove.nodes.find(n => n.id === before.boatNodeId).baseDepth + before.tideLevel,
    rejection: validate(before, boarding, cove), continuations: search(cove, before) };
}

const ideal = plans.witnesses[0].actions;
const mistake = plans.losingAlternatives[0].actions;
const earlyState = replay(early, earlyPlan.actions);
assert.equal(earlyState.status, 'won');
const earlyWrongFirst = search(early, replay(early, mistake.slice(0, 1)));
if (process.argv.includes('--early')) {
  console.log(JSON.stringify({ earlyWitness: earlyState, earlyWrongFirst, earlySearch:search(early) }, null, 2));
  process.exit(0);
}

const baseline = search(level);
const firstChoices = legalActions(initial(level), level).map(action => ({
  action, ...search(level, replay(level, [action])),
}));
const lighterCompanion = receivingBerth(level, ideal);
const heavierCompanion = receivingBerth(level, mistake);
const deeperBerth = receivingBerth(deeper, mistake);
const noLightBackhaul = search(level, initial(level),
  (state, action) => !(action.type === 'move' && action.to === 'bank' &&
    state.boatNodeId === 'steps' && state.aboard.includes('button')));
const otherFirstDelivery = search(level, initial(level),
  (state, action) => !(state.boatNodeId === 'harbor' && !state.delivered.length &&
    action.type === 'unload' && action.passengerIds.length === 1 && action.passengerIds[0] === 'thistle'));
const actualWin = replay(level, ideal);
const actualLoss = replay(level, mistake);
assert.equal(baseline.minimum, 13);
assert.equal(actualWin.status, 'won');
assert.equal(actualWin.turn, baseline.minimum);
assert.deepEqual(actualLoss.lossReason, { code: 'PASSENGER_STRANDED', pierId: 'rush-pier', passengerIds: ['rowan'] });
assert.equal(lighterCompanion.rejection, null);
assert.equal(heavierCompanion.rejection, 'The berth cannot support that load.');
assert.equal(heavierCompanion.continuations.minimum, null);
assert.equal(noLightBackhaul.minimum, null);
assert.equal(otherFirstDelivery.minimum, null);
assert.equal(deeperBerth.rejection, null);
assert.notEqual(deeperBerth.continuations.minimum, null);
assert.equal(earlyState.turn, 14);
assert.notEqual(earlyWrongFirst.minimum, null);
assert.deepEqual(firstChoices.filter(row => row.minimum !== null).map(row => row.action),
  [{type:'board', passengerIds:['thistle']}]);

const sources = [levelPath, plansPath, earlyLevelPath, earlyPlanPath, 'src/game/rules.ts', 'reviews/far-shore/proof.mjs'];
const digest = path => createHash('sha256').update(readFileSync(path, 'utf8').replaceAll('\r\n', '\n')).digest('hex');
console.log(JSON.stringify({
  format:'SHA-256 over LF-normalized UTF-8 source', hashes:Object.fromEntries(sources.map(path => [path, digest(path)])),
  minimumActions:baseline.minimum, masteryTarget:null, graph:baseline, firstChoices,
  lighterCompanion, heavierCompanion, withoutButtonOnOutboundReach:noLightBackhaul, withoutThistleAloneAsFirstDelivery:otherFirstDelivery,
  counterfactualOnlyRushBasinOneUnitDeeper:deeperBerth,
  prototypeWithOneExtraAction: { witnessActions:earlyState.turn, buttonFirst: earlyWrongFirst },
  mistake:{turn:actualLoss.turn, reason:actualLoss.lossReason}, rescue:{turn:actualWin.turn, delivered:actualWin.delivered},
}, null, 2));
