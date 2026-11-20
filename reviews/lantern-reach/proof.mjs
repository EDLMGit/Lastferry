import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';

registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !extname(specifier) && context.parentURL &&
    existsSync(fileURLToPath(new URL(specifier + '.ts', context.parentURL))))
    return next(specifier + '.ts', context);
  return next(specifier, context);
} });

const { lanternReach: level } = await import('../../src/levels/level.ts');
const { edgeTo, initial, legalActions, reduce, validate } = await import('../../src/game/rules.ts');
const plans = JSON.parse(readFileSync('data/lantern-reach/witnesses.json', 'utf8'));
const lastRise = Math.max(0, ...level.rules.tide.rises.map(rise => rise.afterTurn));
const bridgeEdge = level.bridge.edgeId;
const currentEdge = level.edges.find(edge => edge.current).id;
const key = s => JSON.stringify([Math.min(lastRise, s.turn), s.tideLevel, s.bridgeOpen,
  s.boatNodeId, s.aboard.toSorted(), s.delivered.toSorted(), level.piers.map(p => s.waitingByPier[p.id].toSorted()),
  s.status, s.lossReason]);
const initialState = initial(level);

function search(start, allowed = () => true) {
  const states = [start], parents = [-1], incoming = [null];
  const visited = new Set([key(start)]);
  let transitions = 0, wins = 0, losses = 0, witness = null;
  for (let i = 0; i < states.length; i++) {
    const s = states[i];
    if (s.status === 'lost') losses++;
    if (s.status === 'won') {
      wins++;
      if (witness === null) {
        witness = [];
        for (let j = i; parents[j] !== -1; j = parents[j]) witness.unshift(incoming[j]);
      }
    }
    for (const action of legalActions(s, level)) {
      if (!allowed(s, action)) continue;
      transitions++;
      const after = reduce(s, action, level);
      const id = key(after);
      if (visited.has(id)) continue;
      visited.add(id);
      states.push(after);
      parents.push(i);
      incoming.push(action);
    }
  }
  return { minimumAdditionalActions: witness?.length ?? null, witness, states: states.length, transitions, wins, losses };
}

function replay(actions) {
  let s = initialState;
  const facts = [];
  for (const action of actions) {
    assert.deepEqual(validate(s, action, level), null);
    const route = action.type === 'move' ? edgeTo(s, action.to, level).id : null;
    s = reduce(s, action, level);
    facts.push({ turn: s.turn, tide: s.tideLevel, location: s.boatNodeId, bridgeOpen: s.bridgeOpen, route, action, status: s.status });
  }
  return { state: s, facts };
}

const forbidPassage = id => (s, a) => a.type !== 'move' || edgeTo(s, a.to, level).id !== id;
const unconstrained = search(initialState);
const neverOperate = search(initialState, (_s, a) => a.type !== 'open-bridge');
const neverTakeCut = search(initialState, forbidPassage(bridgeEdge));
const neverTakeRace = search(initialState, forbidPassage(currentEdge));
const early = search(replay([{ type: 'open-bridge' }]).state);
assert.equal(unconstrained.minimumAdditionalActions, 6);
assert.equal(neverOperate.minimumAdditionalActions, 7);
assert.equal(neverTakeCut.minimumAdditionalActions, 7);
assert.equal(neverTakeRace.minimumAdditionalActions, 6);
assert.equal(early.wins, 0);
const replays = plans.witnesses.map(plan => {
  const { state, facts } = replay(plan.actions);
  assert.equal(state.status, 'won');
  const used = facts.map(step => step.route);
  if (plan.id === 'open-shortcut') {
    assert.ok(used.includes(bridgeEdge) && !used.includes(currentEdge) && state.bridgeOpen);
    assert.equal(state.turn, unconstrained.minimumAdditionalActions);
  } else {
    assert.ok(used.includes(currentEdge) && !used.includes(bridgeEdge) && !state.bridgeOpen);
    assert.equal(state.turn, neverOperate.minimumAdditionalActions);
  }
  return { id: plan.id, facts };
});
const mistake = replay(plans.losingAlternatives[0].actions);
assert.deepEqual(mistake.state.lossReason, { code: 'PASSENGER_STRANDED', pierId: 'wick-pier', passengerIds: ['tallow', 'ember'] });
const firstActions = legalActions(initialState, level).map(action => ({
  action, minimumTotalActions: (() => {
    const minimum = search(reduce(initialState, action, level)).minimumAdditionalActions;
    return minimum === null ? null : minimum + 1;
  })(),
}));
assert.deepEqual(firstActions.filter(result => result.minimumTotalActions !== null).map(result => result.action), [{type:'move',to:'wick'}]);

const sourceFiles = ['data/lantern-reach.level.json', 'data/lantern-reach/witnesses.json', 'src/game/rules.ts', 'src/levels/level.ts'];
const sha256 = Object.fromEntries(sourceFiles.map(path => [path, createHash('sha256').update(readFileSync(path, 'utf8').replaceAll('\r\n', '\n')).digest('hex')]));
console.log(JSON.stringify({ level: level.id, sha256, lastScheduledRise: lastRise, firstActions, unrestricted: unconstrained,
  noOpening: neverOperate, noShortcutCrossing: neverTakeCut, noCurrentCrossing: neverTakeRace, openedFirst: early,
  mistake: mistake.facts, replays }, null, 2));
