import { draft, edgeTo, pierAt, preview, type Action, type State } from '../game/rules';
import { nodeName, type Level } from '../levels/level';
import { passengerList, previewCopy } from './presentation';

export type Transfer = Extract<Action, { type: 'board' | 'unload' }>;

export function transferFacts(before: State, action: Transfer, level: Level) {
  const proposed = preview(before, action, level);
  const who = passengerList(action.passengerIds, level) || 'passengers';
  const home = !!pierAt(before, level)?.isDeliveryPier;
  const label =
    action.type === 'board' ? `Board ${who}` : home ? `Bring ${who} home` : `Let ${who} ashore`;
  const depth = `Needs depth ${draft(before, level)} → ${draft(proposed.state, level)}`;
  const text = previewCopy(before, action, level);
  let detail = text.consequence;
  if (action.type === 'board' && !proposed.error && proposed.state.status === 'playing') {
    const next = proposed.state;
    detail = next.tideLevel > before.tideLevel ? 'The tide rises after this action.' : '';
    for (const node of level.nodes) {
      const edge = edgeTo(next, node.id, level);
      if (edge && edge.baseDepth + next.tideLevel < draft(next, level))
        detail += ` Passage to ${nodeName(node.id, level)} has depth ${edge.baseDepth + next.tideLevel}: too shallow.`;
    }
    detail = detail.trim();
  }
  return {
    label,
    depth,
    detail,
    error: proposed.error,
    direct: action.passengerIds.length === 1 && !proposed.error && proposed.state.status !== 'lost',
  };
}

export function transferReceipt(before: State, after: State, action: Transfer, level: Level) {
  const who = passengerList(action.passengerIds, level);
  const result =
    action.type === 'board' ? 'aboard' : pierAt(before, level)?.isDeliveryPier ? 'home' : 'ashore';
  return {
    title: `${who} ${result} · ${after.turn - before.turn} action used`,
    depth:
      draft(before, level) === draft(after, level)
        ? ''
        : `Needs depth ${draft(before, level)} → ${draft(after, level)}`,
  };
}
