import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL && existsSync(new URL(specifier + '.ts', context.parentURL))) {
      return next(specifier + '.ts', context);
    }
    return next(specifier, context);
  },
});

const { initial, legalActions, reduce, validate, load, draft } = await import('../../src/game/rules.ts');
const { lastFerry: level } = await import('../../src/levels/level.ts');
const plans = JSON.parse(readFileSync('data/last-ferry/witnesses.json', 'utf8'));
const lastRise = level.rules.tide.rises.at(-1).afterTurn;

function key(state) {
  return JSON.stringify([Math.min(state.turn, lastRise), state.tideLevel, state.boatNodeId,
    state.aboard.toSorted(), state.delivered.toSorted(),
    level.piers.map(pier => state.waitingByPier[pier.id].toSorted()), state.status]);
}

function play(state, action) {
  assert.equal(validate(state, action, level), null, JSON.stringify({ state, action }));
  return reduce(state, action, level);
}

const states = [initial(level)];
const seen = new Map([[key(states[0]), 0]]);
const predecessors = [[]];
let transitions = 0;
const wins = [];
for (let index = 0; index < states.length; index++) {
  const state = states[index];
  if (state.status === 'won') wins.push(index);
  for (const action of legalActions(state, level)) {
    const next = reduce(state, action, level);
    const signature = key(next);
    if (!seen.has(signature)) {
      seen.set(signature, states.length);
      states.push(next);
      predecessors.push([]);
    }
    predecessors[seen.get(signature)].push(index);
    transitions++;
  }
}

const distance = new Map(wins.map(index => [index, 0]));
const queue = [...wins];
for (let i = 0; i < queue.length; i++) {
  const next = queue[i];
  for (const previous of predecessors[next]) {
    if (distance.has(previous)) continue;
    distance.set(previous, distance.get(next) + 1);
    queue.push(previous);
  }
}
assert.equal(distance.get(0), 7);
assert.equal(distance.size, states.length);

const witnesses = plans.witnesses.map(plan => {
  let state = states[0];
  const trip = plan.actions.map(action => {
    state = play(state, action);
    return { action, turn: state.turn, at: state.boatNodeId, tide: state.tideLevel,
      aboard: state.aboard, load: load(state, level), depthNeeded: draft(state, level) };
  });
  assert.equal(state.status, 'won');
  const afterFirstPickup = plan.actions.slice(0, 2).reduce(play, states[0]);
  const fastestFromPickup = afterFirstPickup.turn + distance.get(seen.get(key(afterFirstPickup)));
  assert.equal(state.turn, fastestFromPickup);
  return { id: plan.id, actions: state.turn, fastestWithThatFirstPickup: fastestFromPickup,
    fullDeckOnAction: trip.find(step => step.load === level.rules.capacity).turn, trip };
});

const fullDeck = states.filter(state => state.status === 'playing' && load(state, level) === level.rules.capacity);
for (const state of fullDeck) {
  assert.deepEqual(state.aboard.toSorted(), level.objective.requiredPassengerIds.toSorted());
  assert.equal(key(play(state, { type: 'wait' })), key(state));
  const homeward = state.boatNodeId === 'harbor' ? [] : state.boatNodeId === 'lantern' ? ['harbor'] : ['lantern', 'harbor'];
  let aboard = state;
  for (const to of homeward) aboard = play(aboard, { type: 'move', to });
  assert.equal(aboard.status, 'playing');
  assert.equal(play(aboard, { type: 'unload', passengerIds: aboard.aboard }).status, 'won');
}

const inputs = ['src/game/rules.ts', 'data/last-ferry.level.json', 'data/last-ferry/witnesses.json', 'reviews/last-ferry/proof.mjs'];
const hash = path => createHash('sha256').update(readFileSync(path, 'utf8').replaceAll('\r\n', '\n')).digest('hex');
console.log(JSON.stringify({
  sources: Object.fromEntries(inputs.map(path => [path, hash(path)])),
  hashFormat: 'SHA-256 of LF-normalized UTF-8',
  graph: { configurations: states.length, legalTransitions: transitions, canFinish: distance.size,
    minimum: distance.get(0), fullDeckStops: fullDeck.map(state => state.boatNodeId) },
  witnesses,
}, null, 2));
