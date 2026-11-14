import { level, nodeName, type Level, type Passage } from '../levels/level';
export type { Level } from '../levels/level';
export type Action =
  | { type: 'move'; to: string }
  | { type: 'board' | 'unload'; passengerIds: string[] }
  | { type: 'wait' };
export type State = {
  turn: number;
  tideLevel: number;
  boatNodeId: string;
  aboard: string[];
  waitingByPier: Record<string, string[]>;
  delivered: string[];
  status: 'playing' | 'won' | 'lost';
  lossReason: null
    | { code: 'PASSENGER_STRANDED'; pierId: string; passengerIds: string[] }
    | { code: 'RETURN_CUT_OFF'; edgeId: string; passengerIds: string[] }
    | { code: 'RETURN_DEPTH'; edgeId: string; passengerIds: string[]; draft: number }
    | { code: 'RETURN_CAPACITY'; edgeId: string; passengerIds: string[]; offshoreSlots: number; homewardTrips: number };
};
export const copy = <T>(v: T): T => structuredClone(v);
export function initial(l: Level = level): State {
  return {
    turn: 0,
    tideLevel: l.rules.tide.initialLevel,
    ...copy(l.start),
    delivered: [],
    status: 'playing',
    lossReason: null,
  };
}
export const load = (s: State, l = level) =>
  s.aboard.reduce((n, id) => n + l.passengers.find((p) => p.id === id)!.slots, 0);
export const draft = (s: State, l = level) =>
  l.rules.draftBands.find((b) => load(s, l) <= b.maxLoad)!.draft;
export const pierAt = (s: State, l = level) => l.piers.find((p) => p.nodeId === s.boatNodeId);
export const edgeTo = (s: State, to: string, l = level) =>
  l.edges.find(
    (e) => e.nodes.includes(s.boatNodeId) && e.nodes.includes(to) && to !== s.boatNodeId,
  );
export function passageFlow(edge: Passage, tideLevel: number) {
  if (!edge.current) return undefined;
  const phase = edge.current.phases.find((entry) => entry.tideLevel === tideLevel);
  if (!phase) throw new Error(`No current direction for ${edge.id} at tide ${tideLevel}.`);
  return phase;
}

function reachable(l: Level, tide: number, origins: Set<string>, reverse: boolean, omit?: Passage) {
  const reached = new Set(origins);
  for (const node of reached) {
    for (const edge of l.edges) {
      if (edge === omit || !edge.nodes.includes(node)) continue;
      const flow = passageFlow(edge, tide);
      if (flow && node !== (reverse ? flow.to : flow.from)) continue;
      reached.add(edge.nodes[edge.nodes[0] === node ? 1 : 0]);
    }
  }
  return reached;
}

function banks(l: Level, edge: Passage) {
  const harbor = l.piers.find((pier) => pier.id === l.objective.deliveryPierId)!.nodeId;
  const homeSide = reachable(l, l.rules.tide.initialLevel, new Set([harbor]), false, edge);
  const [a, b] = edge.nodes;
  if (homeSide.has(a) === homeSide.has(b)) return undefined;
  return { homeSide, endpoint: homeSide.has(a) ? a : b };
}

export function currentHomeBank(l: Level, edge: Passage) {
  return edge.current ? banks(l, edge)?.endpoint : undefined;
}

function capacityCutoff(s: State, l: Level, edge: Passage, tides: number[]): State['lossReason'] {
  const bank = banks(l, edge);
  if (!bank) return null;
  let offshore = !bank.homeSide.has(s.boatNodeId);
  const passengers = new Set(offshore ? s.aboard : []);
  for (const pier of l.piers) {
    if (!bank.homeSide.has(pier.nodeId))
      for (const id of s.waitingByPier[pier.id]) passengers.add(id);
  }
  const passengerIds = l.objective.requiredPassengerIds.filter((id) => passengers.has(id));
  const offshoreSlots = passengerIds.reduce(
    (total, id) => total + l.passengers.find((p) => p.id === id)!.slots, 0,
  );
  let homewardTrips = 0;
  for (const tide of tides) {
    const outward = passageFlow(edge, tide)!.from === bank.endpoint;
    if (offshore && !outward) homewardTrips++;
    offshore = outward;
  }
  return offshoreSlots > homewardTrips * l.rules.capacity
    ? { code: 'RETURN_CAPACITY', edgeId: edge.id, passengerIds, offshoreSlots, homewardTrips }
    : null;
}

function canReachDryLanding(s: State, l: Level) {
  const stops = new Set([s.boatNodeId]);
  for (const boatNodeId of stops) {
    const here = { ...s, boatNodeId };
    const pier = pierAt(here, l);
    if (pier && pier.elevation > s.tideLevel) return true;
    for (const node of l.nodes) {
      if (!stops.has(node.id) && !passageError(here, node.id, l)) stops.add(node.id);
    }
  }
  return false;
}

function checkReturn(s: State, l: Level): State['lossReason'] {
  const reef = l.edges.find((edge) => edge.current);
  if (!reef) return null;
  const home = l.piers.find((pier) => pier.id === l.objective.deliveryPierId)!.nodeId;
  const tides = [s.tideLevel, ...l.rules.tide.rises.filter((rise) => rise.afterTurn > s.turn).map((rise) => rise.level)];
  const canReturn: Set<string>[] = [];
  let towardHome = new Set([home]);
  for (let i = tides.length - 1; i >= 0; i--) {
    towardHome = reachable(l, tides[i], towardHome, true);
    canReturn.unshift(towardHome);
  }
  let boatReach = new Set([s.boatNodeId]);
  const rescueStops = new Set<string>();
  tides.forEach((tide, index) => {
    boatReach = reachable(l, tide, boatReach, false);
    for (const node of boatReach) if (canReturn[index].has(node)) rescueStops.add(node);
  });
  const unreachable = new Set(canReturn[0].has(s.boatNodeId) ? [] : s.aboard);
  for (const pier of l.piers) {
    if (!rescueStops.has(pier.nodeId))
      for (const id of s.waitingByPier[pier.id]) unreachable.add(id);
  }
  const passengerIds = l.objective.requiredPassengerIds.filter((id) => unreachable.has(id));
  if (passengerIds.length) return { code: 'RETURN_CUT_OFF', edgeId: reef.id, passengerIds };
  if (tides.length === 1 && s.aboard.length && !canReachDryLanding(s, l)) {
    const trapped = l.objective.requiredPassengerIds.filter((id) => s.aboard.includes(id));
    if (trapped.length) return { code: 'RETURN_DEPTH', edgeId: reef.id, passengerIds: trapped, draft: draft(s, l) };
  }
  return capacityCutoff(s, l, reef, tides);
}

export function passageError(s: State, to: string, l = level): string | null {
  const edge = edgeTo(s, to, l);
  const node = l.nodes.find((n) => n.id === to);
  if (!edge || !node) return 'Choose an adjacent waypoint. Each passage is one turn.';
  const flow = passageFlow(edge, s.tideLevel);
  if (flow && flow.from !== s.boatNodeId)
    return `${edge.current!.name} flows only from ${nodeName(flow.from, l)} to ${nodeName(flow.to, l)}.`;
  if (edge.baseDepth + s.tideLevel < draft(s, l))
    return `Too shallow: depth ${edge.baseDepth + s.tideLevel} is below draft ${draft(s, l)}. A lighter load needs less depth. Tide changes after an action.`;
  if (node.baseDepth + s.tideLevel < draft(s, l)) return 'The destination berth is too shallow.';
  return null;
}

export function validate(s: State, a: Action, l = level): string | null {
  if (s.status !== 'playing') return 'This crossing has ended. Undo or restart to continue.';
  if (!a || !['move', 'board', 'unload', 'wait'].includes(a.type)) return 'Unknown action.';
  if (a.type === 'wait') return null;
  if (a.type === 'move') return passageError(s, a.to, l);
  const ids = a.passengerIds;
  if (!Array.isArray(ids) || !ids.length || ids.some((id) => typeof id !== 'string'))
    return 'Select at least one passenger.';
  if (new Set(ids).size !== ids.length) return 'Select each passenger only once.';
  if (ids.some((id) => !l.passengers.some((p) => p.id === id))) return 'Unknown passenger.';
  const pier = pierAt(s, l);
  if (!pier) return 'Board and unload at a pier.';
  if (s.tideLevel >= pier.elevation) return 'This pier is flooded. The boat can still leave.';
  if (a.type === 'board') {
    if (ids.some((id) => !s.waitingByPier[pier.id].includes(id)))
      return 'These passengers are not waiting here.';
    const next = { ...s, aboard: [...s.aboard, ...ids] };
    if (load(next, l) > l.rules.capacity) return `The boat has ${l.rules.capacity} spaces; this group needs ${load(next, l)}.`;
    if (
      pier &&
      l.nodes.find((n) => n.id === s.boatNodeId)!.baseDepth + s.tideLevel < draft(next, l)
    )
      return 'The berth cannot support that load.';
  } else if (ids.some((id) => !s.aboard.includes(id))) return 'These passengers are not aboard.';
  return null;
}
export function reduce(s: State, a: Action, l = level): State {
  if (validate(s, a, l)) return s;
  const n = copy(s),
    pier = pierAt(s, l);
  if (a.type === 'move') n.boatNodeId = a.to;
  if (a.type === 'board') {
    n.aboard.push(...a.passengerIds);
    n.waitingByPier[pier!.id] = n.waitingByPier[pier!.id].filter(
      (id) => !a.passengerIds.includes(id),
    );
  }
  if (a.type === 'unload') {
    n.aboard = n.aboard.filter((id) => !a.passengerIds.includes(id));
    (pier!.id === l.objective.deliveryPierId ? n.delivered : n.waitingByPier[pier!.id]).push(
      ...a.passengerIds,
    );
  }
  n.turn++;
  for (const rise of l.rules.tide.rises) if (n.turn >= rise.afterTurn) n.tideLevel = rise.level;
  for (const p of l.piers) {
    const stranded = n.waitingByPier[p.id].filter((id) =>
      l.objective.requiredPassengerIds.includes(id),
    );
    if (n.tideLevel >= p.elevation && stranded.length) {
      n.status = 'lost';
      n.lossReason = { code: 'PASSENGER_STRANDED', pierId: p.id, passengerIds: stranded };
      break;
    }
  }
  if (n.status !== 'lost') {
    if (l.objective.requiredPassengerIds.every((id) => n.delivered.includes(id))) n.status = 'won';
    else {
      n.lossReason = checkReturn(n, l);
      if (n.lossReason) n.status = 'lost';
    }
  }
  return n;
}
export function preview(s: State, a: Action, l = level) {
  const error = validate(s, a, l);
  return { error, state: error ? copy(s) : reduce(s, a, l) };
}
export function legalActions(s: State, l = level): Action[] {
  const p = pierAt(s, l),
    actions: Action[] = [
      { type: 'wait' },
      ...l.nodes.map((n) => ({ type: 'move' as const, to: n.id })),
    ];
  for (const type of ['board', 'unload'] as const) {
    const ids = type === 'board' ? (p ? s.waitingByPier[p.id] : []) : s.aboard;
    for (let mask = 1; mask < 1 << ids.length; mask++)
      actions.push({ type, passengerIds: ids.filter((_, i) => mask & (1 << i)) });
  }
  return actions.filter((a) => !validate(s, a, l));
}
