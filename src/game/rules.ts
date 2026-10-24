import { level, type Level } from '../levels/level';
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
  lossReason: null | { code: 'PASSENGER_STRANDED'; pierId: string; passengerIds: string[] };
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
export function validate(s: State, a: Action, l = level): string | null {
  if (s.status !== 'playing') return 'This crossing has ended. Undo or restart to continue.';
  if (!a || !['move', 'board', 'unload', 'wait'].includes(a.type)) return 'Unknown action.';
  if (a.type === 'wait') return null;
  if (a.type === 'move') {
    const edge = edgeTo(s, a.to, l),
      node = l.nodes.find((n) => n.id === a.to);
    if (!edge || !node) return 'Choose an adjacent waypoint. Each passage is one turn.';
    if (edge.baseDepth + s.tideLevel < draft(s, l))
      return `Too shallow: depth ${edge.baseDepth + s.tideLevel} is below draft ${draft(s, l)}. A lighter load needs less depth. Tide changes after an action.`;
    if (node.baseDepth + s.tideLevel < draft(s, l)) return 'The destination berth is too shallow.';
    return null;
  }
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
    if (load(next, l) > l.rules.capacity) return 'There are only four passenger spaces.';
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
  if (
    n.status !== 'lost' &&
    l.objective.requiredPassengerIds.every((id) => n.delivered.includes(id))
  )
    n.status = 'won';
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
