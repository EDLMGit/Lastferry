import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';

registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !extname(specifier) && context.parentURL &&
    existsSync(fileURLToPath(new URL(specifier + '.ts', context.parentURL)))) return next(specifier + '.ts', context);
  return next(specifier, context);
} });

const { initial, legalActions, reduce } = await import('../../../src/game/rules.ts');
const baseline = 'ca89eeed7cde27b48c3a17d2d47dc1ebd3c71745';
const level = JSON.parse(execFileSync('git', ['show', baseline + ':data/lantern-reach.level.json']));
level.rules.capacity = 6;
level.rules.draftBands.push({ maxLoad: 6, draft: 4 });
level.rules.tide.rises = [{ afterTurn: 5, level: 1 }, { afterTurn: 9, level: 2 }];
level.passengers = [
  { id: 'flax', species: 'sheep', slots: 2 }, { id: 'tallow', species: 'rabbit', slots: 1 },
  { id: 'spindle', species: 'deer', slots: 3 }, { id: 'wicklow', species: 'beaver', slots: 2 },
];
level.names.passengers = { flax: 'Flax', tallow: 'Tallow', spindle: 'Spindle', wicklow: 'Wicklow' };
level.objective.requiredPassengerIds = level.passengers.map(p => p.id);
level.start = { boatNodeId: 'wick', aboard: [], waitingByPier: {
  'harbor-pier': [], 'signal-pier': [], 'wick-pier': level.objective.requiredPassengerIds,
} };
for (const node of level.nodes) node.baseDepth = 4;
for (const edge of level.edges) edge.baseDepth = 3;

function key(state) {
  return JSON.stringify([Math.min(state.turn,9), state.tideLevel, state.boatNodeId, state.bridgeOpen,
    state.aboard.toSorted(), state.delivered.toSorted(), Object.values(state.waitingByPier).map(a => a.toSorted()), state.status]);
}

function search(start) {
  const states = [start], parent = [-1], actions = [null], seen = new Set([key(start)]);
  for (let at = 0; at < states.length; at++) {
    const s = states[at];
    if (s.status === 'won') {
      const route = [];
      for (let i = at; parent[i] !== -1; i = parent[i]) route.unshift(actions[i]);
      return route;
    }
    for (const a of legalActions(s, level)) {
      const n = reduce(s, a, level), id = key(n);
      if (seen.has(id)) continue;
      seen.add(id);
      states.push(n); parent.push(at); actions.push(a);
    }
  }
  return null;
}

const start = initial(level);
const witness = search(start);
const openingLoads = legalActions(start, level).filter(a => a.type === 'board').map(a => {
  const rest = search(reduce(start, a, level));
  return { aboard: a.passengerIds, minimum: rest ? rest.length + 1 : null };
});
assert(witness);
console.log(JSON.stringify({ baseline, witness, minimum: witness.length, openingLoads }, null, 2));
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(level, null, 2) + '\n');
