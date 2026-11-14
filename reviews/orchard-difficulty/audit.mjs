import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, next) {
    return next(specifier === '../levels/level' ? '../levels/level.ts' : specifier, context);
  },
});
const { initial, legalActions, reduce } = await import('../../src/game/rules.ts');
const { orchardLanding } = await import('../../src/levels/level.ts');

const idOf = (action) => action.type === 'move' ? action.to :
  action.type === 'wait' ? 'wait' : action.type + ':' + action.passengerIds.toSorted().join('+');
const wrong = ['board:medlar+pomme', 'quay', 'unload:pomme', 'harbor', 'unload:medlar',
  'quay', 'board:pomme', 'orchard', 'board:orin'];

function examine(level, target) {
  const lastChange = level.rules.tide.rises.at(-1).afterTurn;
  const key = (s) => JSON.stringify([Math.min(s.turn, lastChange), s.boatNodeId, s.status,
    s.aboard.toSorted(), s.delivered.toSorted(), level.piers.map(p => s.waitingByPier[p.id].toSorted())]);
  const start = initial(level);
  const known = new Map([[key(start), 0]]);
  const nodes = [{ state: start, next: [], parents: [], distance: null }];
  for (const node of nodes) {
    const origin = known.get(key(node.state));
    for (const action of legalActions(node.state, level)) {
      const after = reduce(node.state, action, level);
      const stateKey = key(after);
      let destination = known.get(stateKey);
      if (destination === undefined) {
        destination = nodes.length;
        known.set(stateKey, destination);
        nodes.push({ state: after, next: [], parents: [], distance: null });
      }
      node.next.push({ action: idOf(action), destination });
      nodes[destination].parents.push(origin);
    }
  }
  const queue = nodes.flatMap((n, i) => n.state.status === 'won' ? [i] : []);
  for (const i of queue) nodes[i].distance = 0;
  for (const i of queue) {
    for (const parent of nodes[i].parents) {
      if (nodes[parent].distance !== null) continue;
      nodes[parent].distance = nodes[i].distance + 1;
      queue.push(parent);
    }
  }
  const profile = (steps) => {
    let i = 0;
    return ['start', ...steps].map((step, turn) => {
      if (turn) {
        const move = nodes[i].next.find(e => e.action === step);
        if (!move) throw new Error('Illegal witness action at turn ' + turn + ': ' + step);
        i = move.destination;
      }
      return { step, turn, state: nodes[i].state.status, loss: nodes[i].state.lossReason?.code,
        minimumRemaining: nodes[i].distance, legal: nodes[i].next.length,
        viable: nodes[i].next.filter(e => nodes[e.destination].distance !== null).length };
    });
  };
  const families = {};
  function enumerate(i, path, handoff) {
    const node = nodes[i];
    if (node.distance === null || path.length + node.distance > target) return;
    if (node.state.status === 'won') {
      const id = handoff + ', ' + path.length + ' actions';
      const family = families[id] ??= { sequences: 0, example: path };
      family.sequences++;
      return;
    }
    for (const { action, destination } of node.next) {
      const pickedUp = action.startsWith('board:') ? action.slice(6).split('+') : [];
      const lastSmallPickup = node.state.delivered.length === 1 && node.state.boatNodeId !== 'orchard'
        && pickedUp.length && !pickedUp.includes('orin');
      enumerate(destination, [...path, action], lastSmallPickup ? node.state.boatNodeId + ' / ' + pickedUp.join('+') : handoff);
    }
  }
  enumerate(0, [], 'no separate retrieval');
  const firstDeliveries = new Set();
  const orchardEntrances = new Set();
  const orchardDepartures = new Set();
  for (const node of nodes) {
    if (node.distance === null) continue;
    for (const edge of node.next) {
      const after = nodes[edge.destination];
      if (after.distance === null) continue;
      if (node.state.delivered.length === 0 && after.state.delivered.length > 0) {
        const waiting = level.piers.flatMap(p => after.state.waitingByPier[p.id].map(id => id + ' at ' + p.nodeId));
        firstDeliveries.add([after.state.turn, edge.action, ...waiting].join(', '));
      }
      if (edge.action === 'orchard' && node.state.boatNodeId === 'quay')
        orchardEntrances.add([after.state.turn, ...node.state.aboard.toSorted()].join(', '));
      if (edge.action === 'quay' && node.state.boatNodeId === 'orchard')
        orchardDepartures.add([after.state.turn, ...node.state.aboard.toSorted()].join(', '));
    }
  }
  return {
    states: nodes.length, transitions: nodes.reduce((n, s) => n + s.next.length, 0),
    shortest: nodes[0].distance, target, familiesByRetrievalAfterFirstDelivery: families,
    everyViableFirstDelivery: [...firstDeliveries].sort(),
    everyViableInwardCrossing: [...orchardEntrances].sort(),
    everyViableOutwardCrossing: [...orchardDepartures].sort(),
    usefulUndo: profile(wrong),
    firstActionOptions: nodes[0].next.map(e => ({ action: e.action, minimumRemaining: nodes[e.destination].distance })),
    twoOpeningWaits: profile(['wait', 'wait']).at(-1),
    stagedRescue: profile(['board:medlar+pomme', 'quay', 'unload:medlar', 'harbor', 'unload:pomme',
      'quay', 'board:medlar', 'orchard', 'board:orin', 'quay', 'harbor', 'unload:medlar+orin']),
    wrongPlanEndpoint: profile(wrong.concat(level.passengers.find(p => p.id === 'orin').slots === 3 ?
      ['wait', 'wait', 'wait'] : ['quay', 'harbor', 'unload:orin+pomme'])).at(-1),
  };
}
const twoSpace = structuredClone(orchardLanding);
twoSpace.passengers.find(p => p.id === 'orin').slots = 2;
const sources = Object.fromEntries(['data/orchard-landing.level.json', 'src/levels/level.ts', 'src/game/rules.ts']
  .map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
console.log(JSON.stringify({ node: process.version, sources, authored: examine(orchardLanding, 13), twoSpace: examine(twoSpace, 13) }, null, 2));
