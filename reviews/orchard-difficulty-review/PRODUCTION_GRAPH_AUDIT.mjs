import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
};
const repo = path.resolve(option('--repo', process.cwd()));
const out = option('--out', undefined);
if (!out) throw new Error('Pass --out <scratch-directory>; --repo defaults to the working directory.');
const output = path.resolve(out);
const manifest = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'SOURCE_MANIFEST.json'), 'utf8'));
const gitBlob = bytes => crypto.createHash('sha1').update('blob ' + bytes.length).update(Buffer.from([0])).update(bytes).digest('hex');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'last-ferry-graph-audit-'));

try {
  const sources = [];
  for (const source of manifest.sourceFiles) {
    const original = fs.readFileSync(path.join(repo, source.path));
    if (gitBlob(original) !== source.gitBlobSha) throw new Error('Pinned source differs: ' + source.path);
    sources.push({ ...source, sha256: sha256(original), bytes: original.length });
    const destination = path.join(temporary, source.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const content = source.path === 'src/game/rules.ts'
      ? original.toString('utf8').replaceAll("'../levels/level'", "'../levels/level.ts'")
      : original;
    fs.writeFileSync(destination, content);
  }
  const rules = await import(pathToFileURL(path.join(temporary, 'src/game/rules.ts')).href);
  const levels = await import(pathToFileURL(path.join(temporary, 'src/levels/level.ts')).href);
  const { initial, legalActions, reduce, load, draft } = rules;

  function analyze(l) {
    const cap = l.rules.tide.rises.at(-1)?.afterTurn ?? 0;
    const key = s => JSON.stringify([
      Math.min(s.turn, cap), s.boatNodeId, s.status,
      [...s.aboard].sort(), [...s.delivered].sort(),
      l.piers.map(p => [...s.waitingByPier[p.id]].sort()),
    ]);
    const states = [initial(l)];
    const ids = new Map([[key(states[0]), 0]]);
    const adjacency = [[]], reverse = [[]], depth = [0];
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      if (state.status !== 'playing') continue;
      for (const action of legalActions(state, l)) {
        const next = reduce(state, action, l);
        const k = key(next);
        let j = ids.get(k);
        if (j === undefined) {
          j = states.length;
          ids.set(k, j);
          states.push(next);
          adjacency.push([]);
          reverse.push([]);
          depth.push(depth[i] + 1);
        }
        adjacency[i].push({ action, j });
        reverse[j].push(i);
      }
    }
    const wins = states.flatMap((s, i) => s.status === 'won' ? [i] : []);
    const distance = states.map(() => Infinity), queue = [...wins];
    for (const i of wins) distance[i] = 0;
    for (let i = 0; i < queue.length; i++) {
      for (const j of reverse[queue[i]]) {
        if (Number.isFinite(distance[j])) continue;
        distance[j] = distance[queue[i]] + 1;
        queue.push(j);
      }
    }
    const minimum = distance[0];
    const corridor = states.flatMap((s, i) => depth[i] + distance[i] === minimum ? [i] : []);
    const ways = new Map(wins.map(i => [i, 1n]));
    for (const i of [...corridor].sort((a, b) => distance[a] - distance[b])) {
      if (distance[i] === 0) continue;
      let count = 0n;
      for (const { j } of adjacency[i]) if (distance[j] === distance[i] - 1) count += ways.get(j) ?? 0n;
      ways.set(i, count);
    }
    let i = 0;
    const witness = [], profile = [];
    while (distance[i] > 0 && Number.isFinite(distance[i])) {
      const s = states[i];
      const viable = adjacency[i].filter(e => Number.isFinite(distance[e.j]));
      const optimal = viable.filter(e => distance[e.j] === distance[i] - 1);
      profile.push({
        turn: s.turn, node: s.boatNodeId, aboard: s.aboard,
        load: load(s, l), draft: draft(s, l), remaining: distance[i],
        legal: adjacency[i].length, viable: viable.length, optimal: optimal.length,
        choices: adjacency[i].map(e => ({
          action: e.action, toWin: Number.isFinite(distance[e.j]) ? distance[e.j] : null,
          result: states[e.j].status,
        })),
      });
      witness.push(optimal[0].action);
      i = optimal[0].j;
    }
    return {
      level: l.id, cap,
      passengerCount: l.passengers.length,
      occupiedSpaces: l.passengers.reduce((n, p) => n + p.slots, 0),
      nodes: l.nodes.length, edges: l.edges.length,
      states: states.length,
      transitions: adjacency.reduce((n, edges) => n + edges.length, 0),
      wonStates: wins.length,
      playingStates: states.filter(s => s.status === 'playing').length,
      viablePlayingStates: states.filter((s, i) => s.status === 'playing' && Number.isFinite(distance[i])).length,
      minActions: minimum,
      shortestActionSequences: String(ways.get(0) ?? 0n),
      shortestCorridorStates: corridor.length,
      shortestCorridorBranchStates: corridor.filter(i => adjacency[i].filter(e => distance[e.j] === distance[i] - 1).length > 1).length,
      witness, profile,
    };
  }

  const coves = [levels.holdingPier, levels.bellwater, levels.driftwoodYard, levels.twoShelters, levels.wideBerth, levels.reefReturn, levels.orchardLanding];
  const results = coves.map(analyze);
  const sail = to => ({ type: 'move', to });
  const board = id => ({ type: 'board', passengerIds: [id] });
  const replay = actions => actions.reduce((state, action) => {
    const next = reduce(state, action, levels.orchardLanding);
    if (next.turn !== state.turn + 1 || next.status !== 'playing') throw new Error('Invalid Orchard merge witness');
    return next;
  }, initial(levels.orchardLanding));
  const orders = [
    [sail('quay'), sail('steps'), board('sorrel'), sail('quay'), board('pomme')],
    [sail('quay'), board('pomme'), sail('steps'), board('sorrel'), sail('quay')],
  ];
  const canonical = state => JSON.stringify({ ...state, aboard: [...state.aboard].sort() });
  const orderStates = orders.map(replay);
  const ordersMerge = canonical(orderStates[0]) === canonical(orderStates[1]);
  if (!ordersMerge) throw new Error('The two five-action Orchard prefixes no longer merge');
  const orchard = results.find(result => result.level === 'orchard-landing');
  const reef = results.find(result => result.level === 'reef-return');
  const report = {
    reviewedCommit: manifest.reviewedCommit,
    nodeVersion: process.version,
    normalization: manifest.normalization,
    adaptations: manifest.adaptations,
    sourceFiles: sources,
    highlightedChecks: {
      orchardPickupOrders: orders,
      orchardOrdersMerge: ordersMerge,
      orchardMergedState: orderStates[0],
      orchardTurn6: orchard.profile.find(state => state.turn === 6),
      reefTurn8: reef.profile.find(state => state.turn === 8),
    },
    results: results.map(({ profile, ...summaryAndWitness }) => summaryAndWitness),
  };
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'PRODUCTION_GRAPH_RESULTS.json'), JSON.stringify(report, null, 2) + '\n');
  for (const result of results) {
    const { profile, witness, ...summary } = result;
    console.log(JSON.stringify(summary));
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
