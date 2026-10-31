import { draft, pierAt, preview, type Action, type State } from '../game/rules';
import type { Level } from '../levels/level';
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
  return {
    label,
    depth,
    detail: text.consequence,
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
