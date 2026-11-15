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
const { initial, legalActions, reduce, draft, load, passageError, preview } = await import('../../src/game/rules.ts');
const { Session } = await import('../../src/game/session.ts');
const { checkCurrents } = await import('../../src/levels/level.ts');
const level = checkCurrents(JSON.parse(readFileSync('data/ternhaven.level.json', 'utf8')));
const actionId = a => a.type === 'move' ? a.to : a.type === 'wait' ? 'wait' : a.type + ':' + a.passengerIds.toSorted().join('+');

export function examine(l, allow = () => true) {
  const lastChange = l.rules.tide.rises.at(-1).afterTurn;
  const key = s => JSON.stringify([Math.min(s.turn, lastChange), s.tideLevel, s.boatNodeId,
    s.status, s.lossReason, s.aboard.toSorted(), s.delivered.toSorted(),
    l.piers.map(p => s.waitingByPier[p.id].toSorted())]);
  const nodes = [{ state: initial(l), next: [], parents: [], distance: null }];
  const known = new Map([[key(nodes[0].state), 0]]);
  for (let origin = 0; origin < nodes.length; origin++) {
    const node = nodes[origin];
    for (const action of legalActions(node.state, l)) {
      if (!allow(node.state, action)) continue;
      const after = reduce(node.state, action, l);
      const stateKey = key(after);
      let destination = known.get(stateKey);
      if (destination === undefined) {
        destination = nodes.length;
        known.set(stateKey, destination);
        nodes.push({ state: after, next: [], parents: [], distance: null });
      }
      node.next.push({ action: actionId(action), value: action, destination });
      nodes[destination].parents.push(origin);
    }
  }
  const queue = nodes.flatMap((n, i) => n.state.status === 'won' ? [i] : []);
  for (const i of queue) nodes[i].distance = 0;
  for (const i of queue) for (const parent of nodes[i].parents) {
    if (nodes[parent].distance !== null) continue;
    nodes[parent].distance = nodes[i].distance + 1;
    queue.push(parent);
  }
  const locate = steps => {
    let i = 0;
    for (const step of steps) {
      const edge = nodes[i].next.find(e => e.action === step);
      if (!edge) throw new Error(`Illegal action after ${steps.slice(0, steps.indexOf(step)).join(', ')}: ${step}`);
      i = edge.destination;
    }
    return i;
  };
  const profile = steps => ['start', ...steps].map((step, turn) => {
    const n = nodes[locate(steps.slice(0, turn))];
    return { step, turn, boat: n.state.boatNodeId, tide: n.state.tideLevel,
      load: load(n.state, l), draft: draft(n.state, l), status: n.state.status,
      loss: n.state.lossReason, aboard: n.state.aboard, delivered: n.state.delivered,
      waiting: n.state.waitingByPier, minimumRemaining: n.distance,
      viableActions: n.next.filter(e => nodes[e.destination].distance !== null).map(e => e.action) };
  });
  const continuation = steps => {
    let i = locate(steps);
    if (nodes[i].distance === null) return null;
    const path = [];
    while (nodes[i].distance) {
      const edge = nodes[i].next.find(e => nodes[e.destination].distance === nodes[i].distance - 1);
      path.push(edge.action);
      i = edge.destination;
    }
    return path;
  };
  const descendants = steps => {
    const visited = new Set([locate(steps)]);
    let transitions = 0;
    for (const i of visited) for (const edge of nodes[i].next) {
      transitions++;
      visited.add(edge.destination);
    }
    return { states: visited.size, transitions,
      won: [...visited].filter(i => nodes[i].state.status === 'won').length,
      lost: [...visited].filter(i => nodes[i].state.status === 'lost').length,
      playing: [...visited].filter(i => nodes[i].state.status === 'playing').length };
  };
  return { nodes, locate, profile, continuation, descendants, summary: {
    states: nodes.length, transitions: nodes.reduce((n, s) => n + s.next.length, 0),
    winningStates: nodes.filter(n => n.state.status === 'won').length,
    viableStates: nodes.filter(n => n.distance !== null).length,
    shortest: nodes[0].distance, shortestWitness: continuation([]),
  } };
}

const first = place => [place, 'unload:fennel+juniper', 'fork', 'harbor', 'unload:sedge', 'fork'];
const safe = first('high').concat(['reeds', 'board:willow', 'fork', 'high', 'board:fennel+juniper', 'fork', 'harbor', 'unload:fennel+juniper+willow']);
const low = first('low').concat(['low', 'board:fennel+juniper', 'reeds', 'board:willow', 'low', 'fork', 'harbor', 'unload:fennel+juniper+willow']);
const wrongLow = first('low').concat(['reeds', 'board:willow', 'fork', 'low']);
const wrongHigh = first('high').concat(['high', 'board:fennel+juniper', 'fork', 'wait']);
const wrongLoad = ['high', 'unload:juniper'];
const graph = examine(level);
const higherLow = structuredClone(level);
higherLow.piers.find(p => p.nodeId === 'low').elevation = 3;
const deeperReach = structuredClone(level);
deeperReach.edges.find(e => e.id === 'harbor-fork').baseDepth = 3;
const locationCounterfactual = examine(higherLow);
const loadCounterfactual = examine(deeperReach);
const restrictions = {
  noTemporaryUnloading: (s, a) => !(a.type === 'unload' && s.boatNodeId !== 'harbor'),
  noEarlyDelivery: (s, a) => !(a.type === 'unload' && s.boatNodeId === 'harbor' && s.delivered.length === 0 && s.aboard.length !== level.passengers.length),
  avoidShallowCut: (s, a) => !(a.type === 'move' && [s.boatNodeId, a.to].toSorted().join() === 'fork,reeds'),
  avoidDeepLink: (s, a) => !(a.type === 'move' && [s.boatNodeId, a.to].toSorted().join() === 'low,reeds'),
  noPickupUntilFinalTide: (s, a) => !(a.type === 'board' && s.tideLevel < 2),
  noInitialStagingAtHigh: (s, a) => !(a.type === 'unload' && s.boatNodeId === 'high' && s.turn < 4),
  noInitialStagingAtLow: (s, a) => !(a.type === 'unload' && s.boatNodeId === 'low' && s.turn < 4),
};
const viableOpeningDeliveries = new Set();
for (const node of graph.nodes) if (node.distance !== null) for (const edge of node.next) {
  const after = graph.nodes[edge.destination];
  if (after.distance !== null && !node.state.delivered.length && after.state.delivered.length)
    viableOpeningDeliveries.add(JSON.stringify({ turn: after.state.turn, delivered: after.state.delivered,
      waiting: after.state.waitingByPier }));
}
const families = {};
function enumerate(i, path) {
  const n = graph.nodes[i];
  if (n.distance === null || path.length + n.distance > 14) return;
  if (n.state.status === 'won') {
    const id = path[0];
    (families[id] ??= { sequences: 0, example: path }).sequences++;
    return;
  }
  for (const e of n.next) enumerate(e.destination, [...path, e.action]);
}
enumerate(0, []);
const mechanicalData = {
  rules: level.rules,
  nodes: level.nodes.map(({ id, baseDepth, pierId }) => ({ id, baseDepth, pierId })),
  edges: level.edges.map(({ id, nodes, baseDepth, bidirectional, current }) => ({ id, nodes, baseDepth, bidirectional, current })),
  piers: level.piers.map(({ id, nodeId, elevation, isDeliveryPier }) => ({ id, nodeId, elevation, isDeliveryPier })),
  passengers: level.passengers.map(({ id, species, slots }) => ({ id, species, slots })),
  start: level.start, objective: level.objective,
};
const sources = Object.fromEntries(['data/ternhaven.level.json', 'data/ternhaven/witnesses.json',
  'src/game/rules.ts', 'src/game/session.ts', 'src/levels/level.ts', 'reviews/cove-eight-practice/audit.mjs']
  .map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
const committedPlans = JSON.parse(readFileSync('data/ternhaven/witnesses.json', 'utf8'));
const sessionReplays = committedPlans.witnesses.map(plan => {
  const session = new Session(level);
  let predictions = 0;
  for (const action of plan.actions) {
    const before = JSON.stringify(session.state);
    const p = preview(session.state, action, level);
    if (p.error || JSON.stringify(session.state) !== before) throw new Error('Mutating or invalid preview');
    const transaction = session.commit(action);
    if (!transaction || JSON.stringify(transaction.after) !== JSON.stringify(p.state)) throw new Error('Preview mismatch');
    session.finish();
    predictions++;
    const ids = [...session.state.aboard, ...session.state.delivered, ...Object.values(session.state.waitingByPier).flat()].sort();
    if (ids.join() !== level.objective.requiredPassengerIds.toSorted().join()) throw new Error('Passenger mismatch');
  }
  if (session.state.status !== 'won') throw new Error('Witness did not win');
  const win = structuredClone(session.state);
  if (!session.undo()) throw new Error('Terminal Undo failed');
  session.commit(plan.actions.at(-1));
  session.finish();
  if (JSON.stringify(win) !== JSON.stringify(session.state)) throw new Error('Terminal redelivery mismatch');
  return { id: plan.id, turn: session.state.turn, status: session.state.status,
    previewCommitMatches: predictions, terminalUndoRedelivery: true, unscoredResult: session.result };
});
const recovery = (() => {
  const plan = committedPlans.losingAlternatives.find(p => p.id === 'wrong-early-load');
  const session = new Session(level);
  for (const action of plan.actions) { session.commit(action); session.finish(); }
  const loss = structuredClone(session.state);
  while (session.state.turn > plan.recoveryToTurn) if (!session.undo()) throw new Error('Recovery Undo failed');
  const restored = structuredClone(session.state);
  for (const action of committedPlans.witnesses[0].actions.slice(plan.recoveryToTurn)) {
    if (!session.commit(action)) throw new Error('Recovery action failed');
    session.finish();
  }
  if (session.state.status !== 'won') throw new Error('Recovery did not rescue');
  return { loss, restored, result: session.state, successfulUndos: session.successfulUndos };
})();
if (graph.summary.shortest !== 13 || locationCounterfactual.continuation(wrongLow) === null ||
  loadCounterfactual.continuation(wrongLoad) === null || graph.continuation(wrongLoad) !== null ||
  graph.continuation(wrongLow.slice(0, 9)) !== null || graph.continuation(wrongHigh.slice(0, 8)) !== null)
  throw new Error('Authored design claim changed; inspect the graph before accepting results.');
console.log(JSON.stringify({ node: process.version, sources,
  mechanicsSha256: createHash('sha256').update(JSON.stringify(mechanicalData)).digest('hex'),
  methodology: { exactTimeThrough: 10, plateauAfter: 10, exhaustive: true,
    subsetGenerator: 'production legalActions', reducer: 'production reduce', arbitraryDepthLimit: false },
  authored: graph.summary, proposedTarget: 14, placementFamiliesWithinProposedTarget: families,
  viableOpeningDeliveries: [...viableOpeningDeliveries].map(s => JSON.parse(s)),
  witnesses: { safe: graph.profile(safe), low: graph.profile(low) },
  temptingLowLightFirst: graph.profile(wrongLow), temptingHighHeavyFirst: graph.profile(wrongHigh),
  temptingUnloadOnlyDeer: graph.profile(wrongLoad),
  failedBranchExhaustion: {
    lowReturnViaBuoy: graph.descendants(wrongLow.slice(0, 9)),
    highHeavyFirst: graph.descendants(wrongHigh.slice(0, 8)),
    unloadOnlyDeer: graph.descendants(wrongLoad),
  },
  visibleConflicts: {
    earlyLoad: passageError(graph.nodes[graph.locate(wrongLoad.concat('fork'))].state, 'harbor', level),
    heavyAtBuoy: passageError(graph.nodes[graph.locate(wrongHigh.slice(0, 9))].state, 'reeds', level),
    fullAtReedLanding: passageError(graph.nodes[graph.locate(low.slice(0, 10))].state, 'fork', level),
  },
  sessionReplays, recovery,
  firstActions: graph.nodes[0].next.map(e => ({ action: e.action, minimumRemaining: graph.nodes[e.destination].distance })),
  locationCounterfactual: { changed: 'Tern Steps elevation 2 -> 3 only', ...locationCounterfactual.summary,
    rescuedWrongPlan: locationCounterfactual.continuation(wrongLow),
    wrongEarlyLoadStillUnwinnable: locationCounterfactual.continuation(wrongLoad) === null,
    profile: locationCounterfactual.profile(wrongLow) },
  loadCounterfactual: { changed: 'Harbor current base depth 2 -> 3 only', ...loadCounterfactual.summary,
    rescuedWrongPlan: loadCounterfactual.continuation(wrongLoad),
    wrongLowApproachStillUnwinnable: loadCounterfactual.continuation(wrongLow.slice(0, 9)) === null,
    profile: loadCounterfactual.profile(wrongLoad) },
  bypasses: Object.fromEntries(Object.entries(restrictions).map(([id, allow]) => [id, examine(level, allow).summary])),
}, null, 2));
