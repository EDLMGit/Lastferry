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
const level = checkCurrents(JSON.parse(readFileSync('data/drowned-orchard.level.json', 'utf8')));
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
      if (!edge) throw new Error('Illegal action from graph state ' + i + ': ' + step);
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

const plans = JSON.parse(readFileSync('data/drowned-orchard/witnesses.json', 'utf8'));
const graph = examine(level);
const prefix = ['steps', 'board:sloe'];
const trace = actions => actions.map(actionId);
const assert = (condition, context) => { if (!condition) throw new Error(context); };
const deep = structuredClone(level), free = structuredClone(level), highSteps = structuredClone(level);
deep.edges.find(e => e.current).baseDepth += 1;
const freeEdge = free.edges.find(e => e.current);
freeEdge.bidirectional = true;
delete freeEdge.current;
highSteps.piers.find(p => p.nodeId === 'steps').elevation += 1;
function relaxation(copy, branch, reason) {
  const g = examine(checkCurrents(copy)), suffix = g.continuation(branch);
  assert(graph.continuation(branch) === null && suffix !== null, 'Counterfactual did not revive ' + branch);
  return { reason, branch, ...g.summary, winningAfterBranch: g.profile([...branch, ...suffix]), suffix };
}
const relaxations = {
  deeperPomona: relaxation(deep, prefix, 'Only Pomona Reach baseDepth from 1 to 2: carrying both Step residents through the first homeward window becomes legal.'),
  reversiblePomona: relaxation(free, prefix, 'Only Pomona Reach direction changes to ordinary bidirectional at all tides. The production current-only terminal predicates also no longer apply, and this explicit witness reaches an actual win.'),
  higherSteps: relaxation(highSteps, ['steps','board:burr'], 'Only raised Steps pier elevation from 3 to 4: Sloe can wait through the last turn of the current.'),
};
const winningPaths = [];
function minimums(i, path) {
  const n = graph.nodes[i];
  if (!n.distance) { winningPaths.push(path); return; }
  for (const e of n.next) if (graph.nodes[e.destination].distance === n.distance - 1)
    minimums(e.destination, [...path, e.action]);
}
minimums(0, []);
const viableFirstFerries = new Set(), shoreAtFlip = new Set(), earlyFull = [];
for (const n of graph.nodes) {
  const s = n.state;
  if (s.tideLevel === 1 && load(s,level) >= 5) earlyFull.push({ earliest: s.turn, canWin: n.distance !== null, load: load(s, level) });
  if (n.distance === null) continue;
  for (const e of n.next) {
    const next = graph.nodes[e.destination];
    if (next.distance === null) continue;
    if (s.tideLevel === 1 && s.boatNodeId === 'orchard' && e.action === 'quay') viableFirstFerries.add(s.aboard.toSorted().join('+'));
    if (s.turn === 8 && next.state.turn === 9) shoreAtFlip.add(JSON.stringify({
      boat: next.state.boatNodeId, aboard: next.state.aboard.toSorted(), delivered: next.state.delivered.toSorted(),
      orchard: next.state.waitingByPier['orchard-pier'].toSorted(), steps: next.state.waitingByPier['steps-pier'].toSorted() }));
  }
}
assert(JSON.stringify([...viableFirstFerries].sort()) === JSON.stringify(['brindle','burr']), 'Bad first crossings');
const wrong = plans.losingAlternatives[0], mistake = trace(wrong.actions);
const bad = graph.descendants(prefix);
assert(graph.summary.shortest === 13 && wrong.firstNoWinningContinuationTurn === prefix.length &&
  graph.continuation(prefix.slice(0,-1)) !== null && bad.won === 0, 'Minimum or impossibility changed');
function replay(l, actions, session = new Session(l)) {
  for (const a of actions) {
    const before = JSON.stringify(session.state), p = preview(session.state,a,l);
    assert(!p.error && before === JSON.stringify(session.state), 'Invalid or mutating preview');
    const committed = session.commit(a);
    assert(committed && JSON.stringify(committed.after) === JSON.stringify(p.state), 'Preview mismatch');
    session.finish();
    const s = session.state, present = [...s.aboard, ...s.delivered, ...Object.values(s.waitingByPier).flat()];
    assert(JSON.stringify(present.sort()) === JSON.stringify(l.objective.requiredPassengerIds.toSorted()), 'Passenger conservation');
  }
  return session;
}
const verifiedWitnesses = plans.witnesses.map(w => {
  const session = replay(level, w.actions);
  assert(session.state.status === 'won' && session.state.turn === 13 && session.result === null, w.id);
  const won = JSON.stringify(session.state);
  assert(session.undo() && session.state.status === 'playing', 'Terminal Undo');
  replay(level, w.actions.slice(-1), session);
  assert(won === JSON.stringify(session.state) && session.successfulUndos === 1 && session.takeResult() === null, 'Redelivery');
  return { id:w.id, steps:graph.profile(trace(w.actions)), terminalUndoAndRedelivery:true, unscored:true };
});
const failed = replay(level, wrong.actions), terminal = structuredClone(failed.state);
assert(terminal.status === 'lost' && terminal.lossReason?.code === 'RETURN_CAPACITY', 'Wrong terminal');
while (failed.state.turn > wrong.recoveryToTurn) assert(failed.undo(),'Recovery');
const restored = structuredClone(failed.state), winner = plans.witnesses.find(w => w.id === wrong.recoveryWitness);
assert(JSON.stringify(restored) === JSON.stringify(replay(level, winner.actions.slice(0, wrong.recoveryToTurn)).state),'Exact recovery state');
replay(level,winner.actions.slice(wrong.recoveryToTurn),failed);
assert(failed.state.status === 'won' && failed.successfulUndos === 3, 'Recovery win');
const fullStates = graph.nodes.filter(n => load(n.state,level) === 6);
const fullBeforeAnyDelivery = fullStates.filter(n => !n.state.delivered.length);
const earliest = ns => ns.length ? Math.min(...ns.map(n => n.state.turn)) : null;
const restrictions = {
  mustStayOffshoreUntilLastRise: (s,a) => !(s.turn<9 && s.boatNodeId==='orchard' && a.type==='move' && a.to==='quay'),
  noSecondOutboundEntry: (s,a) => !(s.tideLevel===2 && a.type==='move' && a.to==='orchard' && s.boatNodeId==='quay'),
  neverUseOrchardSteps: (s,a) => !(a.type==='move' && [s.boatNodeId,a.to].toSorted().join() === 'orchard,steps'),
  noFirstWindowDelivery: (s,a) => !(s.turn<5 && a.type==='unload' && s.boatNodeId==='harbor'),
  noTemporaryUnloading: (s,a) => !(a.type==='unload' && s.boatNodeId!=='harbor'),
};
const checks = Object.fromEntries(Object.entries(restrictions).map(([k,allow])=>[k,examine(level,allow).summary]));
for(const k of ['mustStayOffshoreUntilLastRise','noSecondOutboundEntry','neverUseOrchardSteps']) assert(checks[k].shortest===null,k);
assert(graph.continuation(['quay'])===null,'Empty first trip bypass');
const starting=initial(level), initialLegality=level.piers.map(p=>({id:p.id, elevation:p.elevation, tide:starting.tideLevel,dry:p.elevation>starting.tideLevel,waiting:starting.waitingByPier[p.id]}));
assert(initialLegality.every(p=>p.dry || !p.waiting.length),'Invalid start');
const mechanics = { rules:level.rules, nodes:level.nodes.map(({id,baseDepth,pierId})=>({id,baseDepth,pierId})),
  edges:level.edges.map(({id,nodes,baseDepth,bidirectional,current})=>({id,nodes,baseDepth,bidirectional,current})),
  piers:level.piers.map(({id,nodeId,elevation,isDeliveryPier})=>({id,nodeId,elevation,isDeliveryPier})),
  passengers:level.passengers,start:level.start,objective:level.objective };
const hash = b => createHash('sha256').update(b).digest('hex');
const evidence = { engine:process.version,method:'Unbounded FIFO enumeration of all legal production transitions, then reverse multi-source BFS from every genuine won state. Full time until turn 9; canonical plateau thereafter.',
  mechanicsSha256:hash(JSON.stringify(mechanics)), sourceHashesLF:Object.fromEntries(['src/game/rules.ts','src/game/session.ts','src/game/mastery.ts','src/levels/level.ts','data/drowned-orchard.level.json','reviews/cove-nine-practice/audit.mjs','data/drowned-orchard/witnesses.json'].map(p=>[p,hash(readFileSync(p,'utf8').replaceAll('\r\n','\n'))])),
  initialLegality, graph:graph.summary, optimalPaths:winningPaths, viableFirstPomonaCrossings:[...viableFirstFerries].sort(), viableStatesOnTurnNine:[...shoreAtFlip].map(JSON.parse),
  verifiedWitnesses, firstMistake:{trace:graph.profile(mistake),descendantsAfterTurnTwo:bad,recovery:{terminal,restored,won:failed.state,successfulUndos:failed.successfulUndos}},
  bypass:{restrictions:checks,emptyReturn:graph.profile(['quay']),firstFiveSpaceLoad:Math.min(...earlyFull.map(s=>s.earliest)),canRecoverFromEarlyHeavyLoad:earlyFull.some(s=>s.canWin),earliestSixSpaceLoad:earliest(fullStates), earliestViableSixSpaceLoad:earliest(fullStates.filter(n=>n.distance!==null)), earliestSixSpaceLoadBeforeAnyDelivery:earliest(fullBeforeAnyDelivery), canWinFromThatCollection:fullBeforeAnyDelivery.some(n=>n.distance!==null), fullLoadCarriesEveryone:level.passengers.reduce((a,b)=>a+b.slots,0)<=level.rules.capacity},relaxations };
console.log(JSON.stringify(evidence,null,2));
