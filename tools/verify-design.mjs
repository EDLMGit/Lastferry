#!/usr/bin/env node
/**
 * Last Ferry — dependency-free REFERENCE DESIGN validator.
 *
 * @source docs/GAMEPLAY_RULES.md
 * @source docs/FIRST_COVE.md
 *
 * This file is not the game engine and does not test an implemented game, input
 * handler, renderer, animation, camera, or user interface. Keep the future game
 * reducer independent; test that implementation against these documented cases.
 * Do not import this file into production code or call it a game integration test.
 *
 * Run with Node 20+: node tools/verify-design.mjs --write-report
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RULES = 'docs/GAMEPLAY_RULES.md';
const COVE = 'docs/FIRST_COVE.md';
const LEVEL_PATH = 'data/first-crossing.level.json';
const REPORT_PATH = 'docs/validation/design-validation.json';
const arguments_ = new Set(process.argv.slice(2));
const allowedArguments = new Set(['--write-report', '--json', '--help']);
for (const argument of arguments_) {
  if (!allowedArguments.has(argument)) {
    console.error(`Unknown argument: ${argument}`);
    process.exit(2);
  }
}
if (arguments_.has('--help')) {
  console.log('Usage: node tools/verify-design.mjs [--write-report] [--json]');
  console.log('Checks the authored reference design only; no game implementation is tested.');
  process.exit(0);
}

const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const clone = (value) => structuredClone(value);
const sorted = (values) => [...values].sort();
const levelText = read(LEVEL_PATH);
const level = JSON.parse(levelText);
const checks = [];
const replaySummaries = [];
const inputHashes = { [LEVEL_PATH]: sha256(levelText) };

function check(id, source, operation) {
  try {
    const detail = operation();
    checks.push({ id, source, status: 'passed', ...(detail ? { detail } : {}) });
  } catch (error) {
    checks.push({ id, source, status: 'failed', message: error.message });
  }
}

function nodeById(design, id) {
  return design.nodes.find((node) => node.id === id);
}

function pierById(design, id) {
  return design.piers.find((pier) => pier.id === id);
}

function pierAtBoat(design, state) {
  return design.piers.find((pier) => pier.nodeId === state.boatNodeId);
}

function passengerLoad(design, passengerIds) {
  return passengerIds.reduce((sum, id) => {
    const passenger = design.passengers.find((candidate) => candidate.id === id);
    assert.ok(passenger, `Unknown passenger ${id}`);
    return sum + passenger.slots;
  }, 0);
}

/** @source docs/GAMEPLAY_RULES.md#load-and-draft */
function draftForLoad(design, load) {
  assert.ok(Number.isInteger(load) && load >= 0 && load <= design.rules.capacity, 'Load outside capacity');
  return design.rules.draftBands.find((band) => load <= band.maxLoad).draft;
}

function boatDraft(design, state) {
  return draftForLoad(design, passengerLoad(design, state.aboard));
}

/** @source docs/GAMEPLAY_RULES.md#tide-and-pier-elevation */
function tideAtTurn(design, turn) {
  let tideLevel = design.rules.tide.initialLevel;
  for (const rise of design.rules.tide.rises) {
    if (turn >= rise.afterTurn) tideLevel = rise.level;
  }
  return tideLevel;
}

function isDry(pier, state) {
  return state.tideLevel < pier.elevation;
}

function makeInitialState(design) {
  return {
    turn: 0,
    tideLevel: tideAtTurn(design, 0),
    boatNodeId: design.start.boatNodeId,
    aboard: sorted(design.start.aboard),
    waitingByPier: Object.fromEntries(design.piers.map((pier) => [pier.id, sorted(design.start.waitingByPier[pier.id] ?? [])])),
    delivered: [],
    status: 'playing',
    lossReason: null,
  };
}

/**
 * Pure reference reducer. Invalid attempts preserve the original state object.
 * Successful actions return a fresh state; neither input state nor level changes.
 * @source docs/GAMEPLAY_RULES.md#atomic-action-order
 * @source docs/GAMEPLAY_RULES.md#invalid-actions
 */
function reduceAction(design, state, action) {
  const reject = (code, message) => ({ ok: false, state, error: { code, message }, events: [] });
  if (state.status !== 'playing') return reject('TERMINAL_STATE', 'Undo or restart before taking another action.');
  if (!action || typeof action !== 'object' || Array.isArray(action)) return reject('MALFORMED_ACTION', 'An action must be an object.');
  const fields = { move: ['type', 'to'], board: ['type', 'passengerIds'], unload: ['type', 'passengerIds'], wait: ['type'] };
  if (!Object.hasOwn(fields, action.type)) return reject('UNKNOWN_ACTION', 'Unknown action type.');
  if (Object.keys(action).some((key) => !fields[action.type].includes(key))) return reject('MALFORMED_ACTION', 'Unexpected action field.');

  let pier;
  if (action.type === 'move') {
    if (typeof action.to !== 'string') return reject('MALFORMED_ACTION', 'A move needs a destination node ID.');
    const destination = nodeById(design, action.to);
    if (!destination) return reject('UNKNOWN_NODE', 'Unknown destination node.');
    if (action.to === state.boatNodeId) return reject('SAME_NODE', 'The boat is already there.');
    const edge = design.edges.find((candidate) => candidate.nodes.includes(state.boatNodeId) && candidate.nodes.includes(action.to));
    if (!edge) return reject('NOT_ADJACENT', 'A committed move crosses exactly one adjacent edge.');
    const draft = boatDraft(design, state);
    if (edge.baseDepth + state.tideLevel < draft) return reject('INSUFFICIENT_DEPTH', 'This route is too shallow at the current tide.');
    if (destination.baseDepth + state.tideLevel < draft) return reject('UNSAFE_BERTH', 'The destination holding basin is too shallow.');
  }

  if (action.type === 'board' || action.type === 'unload') {
    if (!Array.isArray(action.passengerIds) || action.passengerIds.length === 0 || action.passengerIds.some((id) => typeof id !== 'string')) {
      return reject('EMPTY_OR_MALFORMED_SELECTION', 'Select a nonempty array of passenger IDs.');
    }
    if (new Set(action.passengerIds).size !== action.passengerIds.length) return reject('DUPLICATE_PASSENGER', 'Select each passenger at most once.');
    if (action.passengerIds.some((id) => !design.passengers.some((passenger) => passenger.id === id))) {
      return reject('UNKNOWN_PASSENGER', 'Unknown passenger ID.');
    }
    pier = pierAtBoat(design, state);
    if (!pier) return reject('NO_PIER', 'The boat must be at a pier.');
    if (!isDry(pier, state)) return reject('PIER_FLOODED', 'This pier is already flooded.');
    const available = action.type === 'board' ? state.waitingByPier[pier.id] : state.aboard;
    if (action.passengerIds.some((id) => !available.includes(id))) {
      return reject(action.type === 'board' ? 'NOT_WAITING_HERE' : 'NOT_ABOARD', 'Every selected passenger must be available here.');
    }
    if (action.type === 'board') {
      const resultingLoad = passengerLoad(design, [...state.aboard, ...action.passengerIds]);
      if (resultingLoad > design.rules.capacity) return reject('CAPACITY_EXCEEDED', 'The boat has four passenger slots.');
      const berthDepth = nodeById(design, state.boatNodeId).baseDepth + state.tideLevel;
      if (berthDepth < draftForLoad(design, resultingLoad)) return reject('UNSAFE_BERTH', 'Boarding would ground the boat.');
    }
  }

  // 1. Apply the complete action using the current tide.
  const next = clone(state);
  if (action.type === 'move') next.boatNodeId = action.to;
  if (action.type === 'board') {
    next.aboard = sorted([...next.aboard, ...action.passengerIds]);
    next.waitingByPier[pier.id] = next.waitingByPier[pier.id].filter((id) => !action.passengerIds.includes(id));
  }
  if (action.type === 'unload') {
    next.aboard = next.aboard.filter((id) => !action.passengerIds.includes(id));
    if (pier.id === design.objective.deliveryPierId) {
      next.delivered = sorted([...next.delivered, ...action.passengerIds]);
    } else {
      next.waitingByPier[pier.id] = sorted([...next.waitingByPier[pier.id], ...action.passengerIds]);
    }
  }

  // 2. Advance one turn, then apply any scheduled rise. No animation time matters.
  next.turn += design.rules.actionCost;
  next.tideLevel = tideAtTurn(design, next.turn);
  const events = [{ type: 'action-committed', action: clone(action), turn: next.turn }];
  if (next.tideLevel !== state.tideLevel) events.push({ type: 'tide-rise', from: state.tideLevel, to: next.tideLevel });

  // 3. Flood failure precedes victory. A boat at a flooded pier remains afloat.
  for (const candidate of design.piers) {
    const stranded = next.waitingByPier[candidate.id].filter((id) => design.objective.requiredPassengerIds.includes(id));
    if (!isDry(candidate, next) && stranded.length > 0) {
      next.status = 'lost';
      next.lossReason = { code: 'PASSENGER_STRANDED', pierId: candidate.id, passengerIds: sorted(stranded) };
      events.push({ type: 'loss', reason: clone(next.lossReason) });
      break;
    }
  }
  if (next.status === 'playing' && design.objective.requiredPassengerIds.every((id) => next.delivered.includes(id))) {
    next.status = 'won';
    events.push({ type: 'win' });
  }
  return { ok: true, state: next, events };
}

/** @source docs/GAMEPLAY_RULES.md#undo-and-restart */
function createSession(design) {
  return { state: makeInitialState(design), history: [] };
}

function commit(design, session, action) {
  const result = reduceAction(design, session.state, action);
  if (!result.ok) return { ...result, session };
  return { ...result, session: { state: result.state, history: [...session.history, clone(session.state)] } };
}

function undo(session) {
  if (session.history.length === 0) return { ok: false, session, error: { code: 'NOTHING_TO_UNDO' } };
  return { ok: true, session: { state: clone(session.history.at(-1)), history: session.history.slice(0, -1) } };
}

function runActions(design, actions) {
  let session = createSession(design);
  const trace = [traceRow(design, session.state, null)];
  for (const [index, action] of actions.entries()) {
    const result = commit(design, session, action);
    assert.ok(result.ok, `Action ${index + 1} rejected: ${result.error?.code}`);
    session = result.session;
    assertState(design, session.state);
    trace.push(traceRow(design, session.state, action));
  }
  return { session, trace };
}

function traceRow(design, state, action) {
  return {
    turn: state.turn, action, boatNodeId: state.boatNodeId,
    load: passengerLoad(design, state.aboard), draft: boatDraft(design, state),
    tideLevel: state.tideLevel, status: state.status,
  };
}

function assertState(design, state) {
  assert.ok(Number.isInteger(state.turn) && state.turn >= 0);
  assert.equal(state.tideLevel, tideAtTurn(design, state.turn));
  assert.ok(nodeById(design, state.boatNodeId));
  const allLocations = [...state.aboard, ...state.delivered, ...Object.values(state.waitingByPier).flat()];
  assert.deepEqual(sorted(allLocations), sorted(design.passengers.map((passenger) => passenger.id)), 'Every passenger exists in exactly one location');
  assert.equal(new Set(allLocations).size, allLocations.length, 'No passenger duplication');
  assert.ok(passengerLoad(design, state.aboard) <= design.rules.capacity);
  assert.ok(nodeById(design, state.boatNodeId).baseDepth + state.tideLevel >= boatDraft(design, state), 'No grounded boat');
  if (state.status === 'won') assert.ok(design.objective.requiredPassengerIds.every((id) => state.delivered.includes(id)));
  if (state.status === 'playing') {
    assert.equal(state.lossReason, null);
    for (const pier of design.piers) {
      if (!isDry(pier, state)) assert.ok(state.waitingByPier[pier.id].every((id) => !design.objective.requiredPassengerIds.includes(id)));
    }
  }
}

// Small exact geometry checks against authored exclusion footprints, not a renderer.
// @source docs/FIRST_COVE.md#world-layout-and-mesh-exclusions
const EPSILON = 1e-9;
const squaredDistance = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const samePoint = (a, b) => squaredDistance(a, b) < EPSILON ** 2;
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

function pointSegmentDistance(point, a, b) {
  const lengthSquared = squaredDistance(a, b);
  if (lengthSquared === 0) return Math.sqrt(squaredDistance(point, a));
  const t = Math.max(0, Math.min(1, ((point[0] - a[0]) * (b[0] - a[0]) + (point[1] - a[1]) * (b[1] - a[1])) / lengthSquared));
  return Math.sqrt(squaredDistance(point, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]));
}

function segmentsIntersect(a, b, c, d) {
  const first = cross(a, b, c), second = cross(a, b, d), third = cross(c, d, a), fourth = cross(c, d, b);
  if (((first > EPSILON && second < -EPSILON) || (first < -EPSILON && second > EPSILON)) &&
      ((third > EPSILON && fourth < -EPSILON) || (third < -EPSILON && fourth > EPSILON))) return true;
  return pointSegmentDistance(a, c, d) < EPSILON || pointSegmentDistance(b, c, d) < EPSILON ||
    pointSegmentDistance(c, a, b) < EPSILON || pointSegmentDistance(d, a, b) < EPSILON;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i];
    if (pointSegmentDistance(point, a, b) < EPSILON) return true;
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function segmentPolygonClearance(a, b, polygon) {
  if (pointInPolygon(a, polygon) || pointInPolygon(b, polygon)) return 0;
  let clearance = Infinity;
  for (let index = 0; index < polygon.length; index++) {
    const c = polygon[index], d = polygon[(index + 1) % polygon.length];
    if (segmentsIntersect(a, b, c, d)) return 0;
    clearance = Math.min(clearance, pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b));
  }
  return clearance;
}

function pierFootprint(pier) {
  const a = pier.landAnchorXZ, b = pier.positionXZ;
  const length = Math.sqrt(squaredDistance(a, b));
  const offset = [-(b[1] - a[1]) * pier.width / (2 * length), (b[0] - a[0]) * pier.width / (2 * length)];
  return [[a[0] + offset[0], a[1] + offset[1]], [b[0] + offset[0], b[1] + offset[1]], [b[0] - offset[0], b[1] - offset[1]], [a[0] - offset[0], a[1] - offset[1]]];
}

/**
 * Finite gameplay equivalence: after the last rise, later absolute turn counts
 * cannot alter legal actions or outcomes. Display counters/history are unbounded.
 * @source docs/FIRST_COVE.md#finite-state-search-and-its-limits
 */
function stateKey(design, state) {
  const lastRise = design.rules.tide.rises.at(-1)?.afterTurn ?? 0;
  return JSON.stringify([
    Math.min(state.turn, lastRise), state.tideLevel, state.boatNodeId,
    sorted(state.aboard), sorted(state.delivered),
    design.piers.map((pier) => [pier.id, sorted(state.waitingByPier[pier.id])]), state.status, state.lossReason,
  ]);
}

function nonemptySubsets(values) {
  const result = [];
  for (let mask = 1; mask < 2 ** values.length; mask++) result.push(values.filter((_, index) => (mask & (1 << index)) !== 0));
  return result;
}

function candidateActions(design, state) {
  const actions = [];
  for (const edge of design.edges) {
    if (edge.nodes.includes(state.boatNodeId)) actions.push({ type: 'move', to: edge.nodes.find((id) => id !== state.boatNodeId) });
  }
  const pier = pierAtBoat(design, state);
  if (pier && isDry(pier, state)) {
    for (const passengerIds of nonemptySubsets(state.waitingByPier[pier.id])) actions.push({ type: 'board', passengerIds });
    for (const passengerIds of nonemptySubsets(state.aboard)) actions.push({ type: 'unload', passengerIds });
  }
  actions.push({ type: 'wait' });
  return actions;
}

function boundedBreadthFirstSearch(design, maxActions) {
  const initial = makeInitialState(design);
  const queue = [{ state: initial, actions: [] }];
  const visited = new Set([stateKey(design, initial)]);
  let cursor = 0, validTransitions = 0, rejectedCandidates = 0, terminalLosses = 0, terminalWins = 0, depthBoundaryStates = 0;
  let shortestSolution = null;
  while (cursor < queue.length) {
    const current = queue[cursor++];
    assertState(design, current.state);
    if (current.state.status === 'won') {
      terminalWins++;
      shortestSolution ??= current.actions;
      continue;
    }
    if (current.state.status === 'lost') { terminalLosses++; continue; }
    if (current.actions.length >= maxActions) { depthBoundaryStates++; continue; }
    for (const action of candidateActions(design, current.state)) {
      const result = reduceAction(design, current.state, action);
      if (!result.ok) { rejectedCandidates++; continue; }
      validTransitions++;
      assertState(design, result.state);
      const key = stateKey(design, result.state);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ state: result.state, actions: [...current.actions, action] });
    }
  }
  return {
    kind: 'bounded-breadth-first-search', maxActions, reachableCanonicalStates: visited.size,
    processedStates: cursor, validTransitions, rejectedCandidates, terminalLosses, terminalWins,
    depthBoundaryStates, exhaustedWithinBoundary: depthBoundaryStates === 0,
    shortestSolutionLength: shortestSolution?.length ?? null, shortestSolution,
    scope: 'Reference rules only. Absolute turn counts at or after turn 8 share a clock phase; no undo/preview states are searched.',
  };
}

function expectInvalid(design, state, action, expectedCode) {
  const before = JSON.stringify(state);
  const result = reduceAction(design, state, action);
  assert.equal(result.ok, false, `${JSON.stringify(action)} must be rejected`);
  assert.equal(result.error.code, expectedCode);
  assert.strictEqual(result.state, state, 'Invalid attempts preserve state identity');
  assert.equal(JSON.stringify(state), before, 'Invalid attempts do not mutate state');
}

const move = (to) => ({ type: 'move', to });
const board = (...passengerIds) => ({ type: 'board', passengerIds });
const unload = (...passengerIds) => ({ type: 'unload', passengerIds });
const wait = () => ({ type: 'wait' });
const waits = (count) => Array.from({ length: count }, wait);
const rescueStart = [move('sheep-pier'), board('sheep-1')];

check('schema-and-authored-identities', `${COVE}#level-data-schema`, () => {
  assert.equal(level.schemaVersion, 1);
  assert.equal(level.kind, 'last-ferry-authored-level');
  assert.equal(level.id, 'first-crossing');
  assert.equal(level.rules.capacity, 4);
  assert.equal(level.rules.actionCost, 1);
  assert.equal(level.rules.depthFormula, 'baseDepth + tideLevel');
  assert.equal(level.rules.pierDryWhen, 'tideLevel < elevation');
  assert.equal(level.nodes.length, 6);
  assert.equal(level.edges.length, 6);
  assert.equal(level.piers.length, 2);
  assert.equal(level.passengers.length, 3);
  for (const collection of [level.nodes, level.edges, level.piers, level.passengers, level.world.islands]) {
    assert.equal(new Set(collection.map((item) => item.id)).size, collection.length);
    assert.ok(collection.every((item) => /^[a-z0-9-]+$/.test(item.id)));
  }
  for (const passenger of level.passengers) assert.equal(passenger.slots, { rabbit: 1, sheep: 2 }[passenger.species]);
  assert.deepEqual(level.rules.draftBands, [{ maxLoad: 0, draft: 1 }, { maxLoad: 2, draft: 2 }, { maxLoad: 4, draft: 3 }]);
  assert.deepEqual(level.rules.tide.rises, [{ afterTurn: 4, level: 1 }, { afterTurn: 8, level: 2 }]);
  assertState(level, makeInitialState(level));
  return 'Six nodes, six two-way edges, two piers, two rabbits, one sheep; all starting passengers conserved.';
});

check('graph-connectivity-and-two-routes', `${COVE}#routes`, () => {
  for (const edge of level.edges) {
    assert.equal(edge.bidirectional, true);
    assert.equal(edge.nodes.length, 2);
    assert.notEqual(edge.nodes[0], edge.nodes[1]);
    assert.ok(edge.nodes.every((id) => nodeById(level, id)));
    assert.ok(Number.isInteger(edge.baseDepth) && edge.baseDepth > 0);
    assert.ok(samePoint(edge.waypointsXZ[0], nodeById(level, edge.nodes[0]).positionXZ));
    assert.ok(samePoint(edge.waypointsXZ.at(-1), nodeById(level, edge.nodes[1]).positionXZ));
  }
  const reached = new Set(['harbor']);
  for (let iteration = 0; iteration < level.nodes.length; iteration++) {
    for (const edge of level.edges) if (edge.nodes.some((id) => reached.has(id))) edge.nodes.forEach((id) => reached.add(id));
  }
  assert.equal(reached.size, level.nodes.length);
  for (const node of level.nodes) assert.equal(level.edges.filter((edge) => edge.nodes.includes(node.id)).length, 2);
  assert.deepEqual(level.edges.filter((edge) => edge.baseDepth === 2).map((edge) => edge.id), ['harbor-cut', 'cut-sheep']);
  assert.equal(level.edges.filter((edge) => edge.baseDepth === 3).length, 4);
});

check('safe-berths-and-shared-tide-elevations', `${RULES}#tide-and-pier-elevation`, () => {
  assert.ok(level.nodes.every((node) => node.baseDepth >= 3), 'Every stopping basin supports maximum draft at the lowest tide');
  for (const pier of level.piers) {
    assert.equal(nodeById(level, pier.nodeId).pierId, pier.id);
    assert.equal(pier.elevation, level.world.islands.find((island) => island.id === pier.islandId).elevation);
  }
  assert.equal(pierById(level, 'sheep-pier').elevation, 2);
  assert.equal(pierById(level, 'harbor-pier').elevation, 3);
  assert.ok(pierById(level, level.objective.deliveryPierId).elevation > level.rules.tide.rises.at(-1).level);
});

check('mesh-exclusion-clearance', `${COVE}#world-layout-and-mesh-exclusions`, () => {
  const obstacles = [
    ...level.world.islands.map((island) => ({ id: island.id, polygon: island.footprintXZ })),
    ...level.piers.map((pier) => ({ id: pier.id, polygon: pierFootprint(pier) })),
  ];
  let minimum = Infinity;
  for (const edge of level.edges) {
    for (let index = 1; index < edge.waypointsXZ.length; index++) {
      const a = edge.waypointsXZ[index - 1], b = edge.waypointsXZ[index];
      assert.ok(!samePoint(a, b));
      for (const obstacle of obstacles) {
        const clearance = segmentPolygonClearance(a, b, obstacle.polygon);
        assert.ok(clearance + EPSILON >= level.world.requiredRouteClearance, `${edge.id} approaches ${obstacle.id} too closely: ${clearance}`);
        minimum = Math.min(minimum, clearance);
      }
    }
  }
  assert.ok(level.world.requiredRouteClearance > level.world.referenceBoatRadius);
  for (const pier of level.piers) {
    const ownIsland = level.world.islands.find((island) => island.id === pier.islandId);
    assert.ok(pointInPolygon(pier.landAnchorXZ, ownIsland.footprintXZ));
    assert.ok(!level.world.islands.some((island) => pointInPolygon(pier.positionXZ, island.footprintXZ)), 'The pier tip must lie outside land');
  }
  return { minimumAuthoredCenterlineClearance: Number(minimum.toFixed(6)), required: level.world.requiredRouteClearance, referenceBoatRadius: level.world.referenceBoatRadius, scope: 'Authored centerlines/polygons and a small point-radius proxy only. No actual visual or oriented collision hull was tested; its size is not capped by this proxy.' };
});

check('no-unmarked-route-crossings', `${COVE}#world-layout-and-mesh-exclusions`, () => {
  for (let first = 0; first < level.edges.length; first++) {
    for (let second = first + 1; second < level.edges.length; second++) {
      const a = level.edges[first], b = level.edges[second];
      const sharedNode = a.nodes.find((id) => b.nodes.includes(id));
      const sharedPoint = sharedNode ? nodeById(level, sharedNode).positionXZ : null;
      for (let i = 1; i < a.waypointsXZ.length; i++) {
        for (let j = 1; j < b.waypointsXZ.length; j++) {
          const firstSegment = [a.waypointsXZ[i - 1], a.waypointsXZ[i]], secondSegment = [b.waypointsXZ[j - 1], b.waypointsXZ[j]];
          if (!segmentsIntersect(...firstSegment, ...secondSegment)) continue;
          assert.ok(sharedPoint && firstSegment.some((point) => samePoint(point, sharedPoint)) && secondSegment.some((point) => samePoint(point, sharedPoint)), `${a.id} crosses ${b.id} away from a shared node`);
        }
      }
    }
  }
});

check('draft-table-and-depth-equality', `${RULES}#load-and-draft`, () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((load) => draftForLoad(level, load)), [1, 2, 2, 3, 3]);
  assert.throws(() => draftForLoad(level, 5));
  assert.ok(reduceAction(level, makeInitialState(level), move('sheep-pier')).ok, 'Depth equal to draft is passable');
  assert.equal(nodeById(level, 'harbor').baseDepth + tideAtTurn(level, 8), 5, 'Numeric depth has no artificial cap');
});

check('full-load-blocks-cut-and-keeps-detour', `${COVE}#routes`, () => {
  const { session } = runActions(level, rescueStart);
  assert.equal(session.state.turn, 2);
  assert.equal(passengerLoad(level, session.state.aboard), 4);
  assert.equal(boatDraft(level, session.state), 3);
  expectInvalid(level, session.state, move('cut'), 'INSUFFICIENT_DEPTH');
  assert.ok(reduceAction(level, session.state, move('outer-east')).ok);
});

check('cannot-borrow-next-turn-depth', `${RULES}#atomic-action-order`, () => {
  const { session } = runActions(level, [...rescueStart, wait()]);
  assert.equal(session.state.turn, 3);
  expectInvalid(level, session.state, move('cut'), 'INSUFFICIENT_DEPTH');
  assert.equal(session.state.tideLevel, 0);
  const afterWait = reduceAction(level, session.state, wait());
  assert.equal(afterWait.state.turn, 4);
  assert.equal(afterWait.state.tideLevel, 1);
  assert.ok(reduceAction(level, afterWait.state, move('cut')).ok);
});

check('preview-does-not-commit-or-add-history', `${RULES}#navigation-and-previews`, () => {
  const { session } = runActions(level, [...rescueStart, move('outer-east')]);
  const before = clone(session);
  const preview = reduceAction(level, session.state, move('outer-south'));
  assert.equal(preview.state.turn, 4);
  assert.equal(preview.state.tideLevel, 1);
  assert.deepEqual(session, before);
  assert.equal(session.history.length, 3);
});

check('nonempty-subsets-are-one-turn-actions', `${RULES}#actions`, () => {
  let { session } = runActions(level, [move('sheep-pier'), unload('rabbit-1', 'rabbit-2')]);
  assert.equal(session.state.turn, 2);
  assert.equal(session.state.aboard.length, 0);
  assert.deepEqual(session.state.delivered, []);
  assert.deepEqual(session.state.waitingByPier['sheep-pier'], ['rabbit-1', 'rabbit-2', 'sheep-1']);
  const result = commit(level, session, board('rabbit-1', 'sheep-1'));
  assert.ok(result.ok);
  assert.equal(result.session.state.turn, 3);
  assert.equal(passengerLoad(level, result.session.state.aboard), 3);
  assert.deepEqual(result.session.state.waitingByPier['sheep-pier'], ['rabbit-2']);
});

check('delivered-passengers-cannot-be-reboarded', `${RULES}#start-win-and-loss`, () => {
  const { session } = runActions(level, [move('harbor'), unload('rabbit-1')]);
  assert.deepEqual(session.state.delivered, ['rabbit-1']);
  assert.deepEqual(session.state.waitingByPier['harbor-pier'], []);
  expectInvalid(level, session.state, board('rabbit-1'), 'NOT_WAITING_HERE');
  assert.equal(session.state.status, 'playing');
});

check('invalid-action-matrix', `${RULES}#invalid-actions`, () => {
  const initial = makeInitialState(level);
  const atPier = runActions(level, [move('sheep-pier')]).session.state;
  const cases = [
    [initial, null, 'MALFORMED_ACTION'],
    [initial, {}, 'UNKNOWN_ACTION'],
    [initial, { type: 'teleport' }, 'UNKNOWN_ACTION'],
    [initial, { type: 'wait', extra: true }, 'MALFORMED_ACTION'],
    [initial, { type: 'move' }, 'MALFORMED_ACTION'],
    [initial, move('missing-node'), 'UNKNOWN_NODE'],
    [initial, move('cut'), 'SAME_NODE'],
    [initial, move('outer-south'), 'NOT_ADJACENT'],
    [initial, board('sheep-1'), 'NO_PIER'],
    [initial, unload('rabbit-1'), 'NO_PIER'],
    [atPier, board(), 'EMPTY_OR_MALFORMED_SELECTION'],
    [atPier, unload(), 'EMPTY_OR_MALFORMED_SELECTION'],
    [atPier, { type: 'board', passengerIds: 'sheep-1' }, 'EMPTY_OR_MALFORMED_SELECTION'],
    [atPier, board('sheep-1', 'sheep-1'), 'DUPLICATE_PASSENGER'],
    [atPier, unload('rabbit-1', 'rabbit-1'), 'DUPLICATE_PASSENGER'],
    [atPier, board('missing-passenger'), 'UNKNOWN_PASSENGER'],
    [atPier, board('rabbit-1'), 'NOT_WAITING_HERE'],
    [atPier, unload('sheep-1'), 'NOT_ABOARD'],
  ];
  for (const [state, action, code] of cases) expectInvalid(level, state, action, code);
  return { cases: cases.length, allPreserveStateAndTurn: true };
});

check('capacity-guard-synthetic-fixture', `${RULES}#invalid-actions`, () => {
  // The actual first cove contains exactly four slots of passengers, so overflow
  // is unreachable there. Add one ordinary rabbit ONLY to exercise the guard.
  const fixture = clone(level);
  fixture.passengers.push({ id: 'test-rabbit', species: 'rabbit', slots: 1 });
  const state = runActions(level, rescueStart).session.state;
  state.waitingByPier['sheep-pier'].push('test-rabbit');
  expectInvalid(fixture, state, board('test-rabbit'), 'CAPACITY_EXCEEDED');
  return 'Synthetic extra rabbit; not a reachable first-cove state and not an additional shipped character.';
});

check('unsafe-boarding-guard-synthetic-fixture', `${RULES}#invalid-actions`, () => {
  const fixture = clone(level);
  nodeById(fixture, 'sheep-pier').baseDepth = 2;
  const state = runActions(level, [move('sheep-pier')]).session.state;
  expectInvalid(fixture, state, board('sheep-1'), 'UNSAFE_BERTH');
  return 'Synthetic bad berth; all shipped berths have base depth 3 and are independently checked.';
});

check('missed-pier-floods-exactly-on-turn-eight', `${RULES}#atomic-action-order`, () => {
  const state7 = runActions(level, waits(7)).session.state;
  assert.equal(state7.status, 'playing');
  assert.equal(state7.tideLevel, 1);
  const result = reduceAction(level, state7, wait());
  assert.equal(result.state.status, 'lost');
  assert.equal(result.state.turn, 8);
  assert.equal(result.state.tideLevel, 2);
  assert.deepEqual(result.state.lossReason.passengerIds, ['sheep-1']);
});

check('boarding-before-rise-saves-passenger', `${RULES}#atomic-action-order`, () => {
  const state7 = runActions(level, [move('sheep-pier'), ...waits(6)]).session.state;
  const result = reduceAction(level, state7, board('sheep-1'));
  assert.equal(result.state.turn, 8);
  assert.equal(result.state.tideLevel, 2);
  assert.equal(result.state.status, 'playing');
  assert.deepEqual(result.state.waitingByPier['sheep-pier'], []);
  assert.ok(reduceAction(level, result.state, move('cut')).ok, 'A flooded pier does not trap an afloat boat');
});

check('arriving-on-flood-turn-is-too-late', `${RULES}#atomic-action-order`, () => {
  const state7 = runActions(level, waits(7)).session.state;
  const result = reduceAction(level, state7, move('sheep-pier'));
  assert.equal(result.ok, true, 'The move itself is legal');
  assert.equal(result.state.boatNodeId, 'sheep-pier');
  assert.equal(result.state.status, 'lost', 'Arrival does not automatically board passengers');
});

check('unloading-before-rise-can-strand-passenger', `${RULES}#atomic-action-order`, () => {
  const state7 = runActions(level, [...rescueStart, ...waits(5)]).session.state;
  const result = reduceAction(level, state7, unload('rabbit-1'));
  assert.equal(result.ok, true, 'The pier is dry at action validation');
  assert.equal(result.state.status, 'lost');
  assert.deepEqual(result.state.lossReason.passengerIds, ['rabbit-1']);
});

check('flooded-pier-rejects-boarding-and-unloading', `${RULES}#invalid-actions`, () => {
  const state = runActions(level, [move('sheep-pier'), ...waits(6), board('sheep-1')]).session.state;
  expectInvalid(level, state, board('rabbit-1'), 'PIER_FLOODED');
  expectInvalid(level, state, unload('rabbit-1'), 'PIER_FLOODED');
});

check('undo-restores-turn-three-before-first-rise', `${RULES}#undo-and-restart`, () => {
  const before = runActions(level, [...rescueStart, move('outer-east')]).session;
  const committed = commit(level, before, move('outer-south')).session;
  assert.equal(committed.state.tideLevel, 1);
  const restored = undo(committed).session;
  assert.deepEqual(restored, before);
  assert.equal(restored.state.tideLevel, 0);
});

check('undo-restores-turn-seven-after-flood-loss', `${RULES}#undo-and-restart`, () => {
  const before = runActions(level, [move('sheep-pier'), ...waits(6)]).session;
  const failed = commit(level, before, wait()).session;
  assert.equal(failed.state.status, 'lost');
  const restored = undo(failed).session;
  assert.deepEqual(restored, before);
  const alternative = commit(level, restored, board('sheep-1'));
  assert.equal(alternative.session.state.status, 'playing');
  assert.equal(alternative.session.state.tideLevel, 2);
});

check('invalid-attempts-add-no-undo-snapshot', `${RULES}#undo-and-restart`, () => {
  const session = runActions(level, rescueStart).session;
  const result = commit(level, session, move('cut'));
  assert.equal(result.ok, false);
  assert.strictEqual(result.session, session);
  assert.equal(result.session.history.length, 2);
});

check('nothing-to-undo-at-start-and-restart-clears-history', `${RULES}#undo-and-restart`, () => {
  const initial = createSession(level);
  const result = undo(initial);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'NOTHING_TO_UNDO');
  assert.strictEqual(result.session, initial);
  const played = runActions(level, rescueStart).session;
  assert.equal(played.history.length, 2);
  assert.deepEqual(createSession(level), initial);
});

check('no-hidden-deadline-after-passengers-are-safe', `${RULES}#start-win-and-loss`, () => {
  const safe = runActions(level, [move('sheep-pier'), ...waits(6), board('sheep-1')]).session.state;
  let state = safe;
  for (let index = 0; index < 20; index++) state = reduceAction(level, state, wait()).state;
  assert.equal(state.turn, 28);
  assert.equal(state.status, 'playing');
  assert.equal(state.tideLevel, 2);
  assert.equal(stateKey(level, state), stateKey(level, safe));
  for (const action of [move('cut'), move('harbor'), unload('rabbit-1', 'rabbit-2', 'sheep-1')]) state = reduceAction(level, state, action).state;
  assert.equal(state.status, 'won');
  assert.equal(state.turn, 31);
});

check('reducer-does-not-mutate-frozen-inputs', `${RULES}#state-contract`, () => {
  function freezeDeep(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const child of Object.values(value)) freezeDeep(child);
    }
    return value;
  }
  const frozenLevel = freezeDeep(clone(level));
  const frozenState = freezeDeep(makeInitialState(level));
  const result = reduceAction(frozenLevel, frozenState, freezeDeep(move('sheep-pier')));
  assert.ok(result.ok);
  assert.equal(frozenState.turn, 0);
  assert.equal(result.state.turn, 1);
});

const replayFiles = readdirSync(resolve(ROOT, 'data/replays')).filter((name) => name.endsWith('.json')).sort();
for (const filename of replayFiles) {
  const path = `data/replays/${filename}`;
  const text = read(path);
  inputHashes[path] = sha256(text);
  check(`replay:${filename}`, path, () => {
    const replay = JSON.parse(text);
    assert.equal(replay.schemaVersion, 1);
    assert.equal(replay.levelId, level.id);
    const { session, trace } = runActions(level, replay.actions);
    for (const [key, expected] of Object.entries(replay.expected)) assert.deepEqual(session.state[key], expected, `Unexpected final ${key}`);
    replaySummaries.push({ id: replay.id, source: path, purpose: replay.purpose, final: trace.at(-1), trace });
    if (session.state.status === 'won' || session.state.status === 'lost') {
      expectInvalid(level, session.state, wait(), 'TERMINAL_STATE');
      const restored = undo(session).session;
      assert.equal(restored.state.status, 'playing');
      assert.equal(restored.state.turn, session.state.turn - 1);
      const replayed = commit(level, restored, replay.actions.at(-1));
      assert.deepEqual(replayed.session.state, session.state, 'Undo/replay must reproduce terminal state exactly');
    }
    return { finalStatus: session.state.status, turns: session.state.turn, actions: replay.actions.length };
  });
}

check('declared-witness-files-exist-and-win', `${COVE}#witness-action-sequences`, () => {
  assert.equal(level.validation.witnessReplays.length, 3);
  for (const path of level.validation.witnessReplays) {
    const summary = replaySummaries.find((replay) => replay.source === path);
    assert.ok(summary, `Missing witness ${path}`);
    assert.equal(summary.final.status, 'won');
  }
});

let search = null;
check('bounded-solvability-and-state-invariants', `${COVE}#finite-state-search-and-its-limits`, () => {
  search = boundedBreadthFirstSearch(level, level.validation.searchDepthLimit);
  assert.equal(search.shortestSolutionLength, 7, 'The authored reference cove has a seven-action shortest solution');
  assert.ok(search.terminalWins > 0);
  assert.ok(search.terminalLosses > 0);
  assert.ok(search.shortestSolution.length <= level.validation.searchDepthLimit);
  const replayed = runActions(level, search.shortestSolution);
  assert.equal(replayed.session.state.status, 'won');
  return { shortestSolutionLength: search.shortestSolutionLength, reachableCanonicalStates: search.reachableCanonicalStates, scope: 'Bounded reference-state search, not a proof of implemented game behavior or subjective puzzle quality.' };
});

const failed = checks.filter((entry) => entry.status === 'failed');
const report = {
  schemaVersion: 1,
  levelId: level.id,
  evidenceType: 'reference-design-validation',
  implementedGameTested: false,
  reproducibleCommand: 'node tools/verify-design.mjs --write-report',
  inputSha256: inputHashes,
  summary: { status: failed.length === 0 ? 'passed' : 'failed', totalChecks: checks.length, passedChecks: checks.length - failed.length, failedChecks: failed.length },
  checks,
  replays: replaySummaries,
  search,
  limitations: [
    'The reducer in tools/verify-design.mjs is a reference model, not a production game engine.',
    'No implemented game, browser, input handler, UI, renderer, animation, camera, audio, or performance was tested.',
    'Geometry clearance checks use authored XZ exclusion polygons and route centerlines only; actual meshes, hulls, labels, and camera framing require separate visual/runtime verification.',
    'Bounded search uses the documented legal-action model and a finite equivalence after the last tide rise; it excludes undo histories and UI-only state.',
    'Capacity and unsafe-berth guards use explicitly labeled synthetic fixtures because those failures are unreachable in the shipped first-cove data.',
    'Witnesses demonstrate short tutorial routes; they do not establish enjoyment, difficulty, playtime, or replay value.',
    'Future Codex work must implement and independently test the real game rather than importing this validator as its engine or treating this report as game-test evidence.'
  ],
};

if (arguments_.has('--write-report')) {
  mkdirSync(resolve(ROOT, 'docs/validation'), { recursive: true });
  writeFileSync(resolve(ROOT, REPORT_PATH), `${JSON.stringify(report, null, 2)}\n`);
}
if (arguments_.has('--json')) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`${failed.length === 0 ? 'PASS' : 'FAIL'}: ${checks.length - failed.length}/${checks.length} reference design checks.`);
  if (search) console.log(`Bounded BFS: ${search.reachableCanonicalStates} canonical states; shortest solution ${search.shortestSolutionLength} actions; horizon ${search.maxActions}.`);
  console.log('Evidence scope: authored reference model only. No implemented game/UI was tested.');
  if (arguments_.has('--write-report')) console.log(`Report: ${REPORT_PATH}`);
  for (const failure of failed) console.error(`${failure.id}: ${failure.message}`);
}
process.exitCode = failed.length === 0 ? 0 : 1;
