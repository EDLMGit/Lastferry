import { edgeTo, legalActions, preview, type Action, type State } from '../game/rules';
import { nodeName, type Level } from '../levels/level';
import {
  actionLabel,
  passageCopy,
  passengerList,
  pierSafetyCopy,
  previewCopy,
} from './presentation';

type Move = Extract<Action, { type: 'move' }>;
type Transfer = Extract<Action, { type: 'board' | 'unload' }>;

export type LocationFacts = {
  id: string;
  name: string;
  home: boolean;
  current: boolean;
  relation: 'current' | 'adjacent' | 'remote';
  status: 'current' | 'safe' | 'too-shallow' | 'loss' | 'remote';
  pierId: string | null;
  flooded: boolean;
  waiting: string[];
  aboard: string[];
  delivered: string[];
  waitingCopy: string;
  aboardCopy: string;
  deliveredCopy: string;
  safety: string;
  passage: string;
  limitation: string;
  consequence: string;
  move: Move | null;
  canSail: boolean;
  wouldLose: boolean;
  boardOptions: string[];
  board: Transfer | null;
  unload: Transfer | null;
  boardLabel: string;
  unloadLabel: string;
  transferNote: string;
};

export function locationFacts(s: State, nodeId: string, l: Level): LocationFacts {
  const current = nodeId === s.boatNodeId,
    edge = edgeTo(s, nodeId, l),
    pier = l.piers.find((p) => p.nodeId === nodeId),
    home = pier?.id === l.objective.deliveryPierId,
    flooded = !!pier && s.tideLevel >= pier.elevation,
    waiting = [...(pier ? (s.waitingByPier[pier.id] ?? []) : [])],
    aboard = [...s.aboard],
    delivered = [...s.delivered],
    move: Move | null = !current && edge ? { type: 'move', to: nodeId } : null,
    proposed = move ? preview(s, move, l) : null,
    text = move ? previewCopy(s, move, l) : null,
    canSail = !!proposed && !proposed.error,
    wouldLose = canSail && proposed!.state.status === 'lost',
    actions = current ? legalActions(s, l) : [],
    transfer = (type: 'board' | 'unload') =>
      actions
        .filter((action): action is Transfer => action.type === type)
        .sort((a, b) => b.passengerIds.length - a.passengerIds.length)[0] ?? null,
    board = transfer('board'),
    unload = transfer('unload'),
    passage = current
      ? `You are at ${nodeName(nodeId, l)}.`
      : edge
        ? passageCopy(s, nodeId, l)
        : '',
    limitation = current
      ? ''
      : !edge
        ? `No direct passage from ${nodeName(s.boatNodeId, l)}.`
        : proposed?.error
          ? (text!.error ?? proposed.error)
          : '';
  return {
    id: nodeId,
    name: nodeName(nodeId, l),
    home,
    current,
    relation: current ? 'current' : edge ? 'adjacent' : 'remote',
    status: current
      ? 'current'
      : !edge
        ? 'remote'
        : !canSail
          ? 'too-shallow'
          : wouldLose
            ? 'loss'
            : 'safe',
    pierId: pier?.id ?? null,
    flooded,
    waiting,
    aboard,
    delivered,
    waitingCopy: waiting.length
      ? `${passengerList(waiting, l)} ${waiting.length === 1 ? 'waits' : 'wait'} here.`
      : pier
        ? 'No passengers waiting here.'
        : '',
    aboardCopy: current
      ? aboard.length
        ? `${passengerList(aboard, l)} ${aboard.length === 1 ? 'is' : 'are'} safe aboard.`
        : 'The ferry is empty.'
      : '',
    deliveredCopy: home && delivered.length ? `${passengerList(delivered, l)} safely home.` : '',
    safety: pier ? pierSafetyCopy(s, pier.id, l) : '',
    passage,
    limitation,
    consequence: wouldLose
      ? text!.consequence
      : proposed && proposed.state.tideLevel !== s.tideLevel
        ? 'The tide rises after this action.'
        : '',
    move,
    canSail,
    wouldLose,
    boardOptions: current && !flooded ? [...waiting] : [],
    board,
    unload,
    boardLabel: board ? actionLabel(s, { type: 'board', passengerIds: waiting }, l) : '',
    unloadLabel: unload
      ? pier!.isDeliveryPier
        ? 'Bring passengers home'
        : actionLabel(s, unload, l)
      : '',
    transferNote: current
      ? flooded
        ? 'Pier flooded · the ferry can leave. Boarding and unloading are unavailable.'
        : !pier
          ? 'Waypoint · choose the next passage.'
          : !board && !unload
            ? 'No passengers to transfer.'
            : ''
      : '',
  };
}
