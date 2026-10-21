import { draft, edgeTo, pierAt, preview, type Action, type State } from '../game/rules';
import { nodeNames, passengerNames, type Level } from '../levels/level';

const stop = (id: string) => nodeNames[id] ?? id;
const shortName = (id: string) => passengerNames[id]?.split(' ·')[0] ?? id;
const verb = (ids: string[], singular: string, plural: string) =>
  ids.length === 1 ? singular : plural;
const countActions = (n: number) => `${n} action${n === 1 ? '' : 's'}`;

export function passengerList(ids: string[]): string {
  const names = ids.map(shortName);
  if (names.length < 2) return names[0] ?? '';
  if (names.length === 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

export function actionLabel(s: State, a: Action, l: Level): string {
  if (a.type === 'move') return `Sail to ${stop(a.to)}`;
  if (a.type === 'wait') return 'Wait';
  const who = passengerList(a.passengerIds) || 'passengers';
  if (a.type === 'board') return `Board ${who}`;
  return pierAt(s, l)?.isDeliveryPier ? `Deliver ${who}` : `Let ${who} ashore`;
}

export function objectiveCopy(s: State, l: Level): { headline: string; progress: string } {
  const required = l.objective.requiredPassengerIds,
    total = required.length,
    count =
      ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][
        total
      ] ?? total,
    destination = stop(l.piers.find((p) => p.id === l.objective.deliveryPierId)!.nodeId),
    home = required.filter((id) => s.delivered.includes(id)).length;
  return {
    headline: `Bring ${total === 1 ? 'one passenger' : `all ${count} passengers`} to ${destination}`,
    progress: `Home ${home}/${total}`,
  };
}

export function passageCopy(s: State, to: string, l: Level): string {
  if (to === s.boatNodeId) return `You are at ${stop(to)}.`;
  const edge = edgeTo(s, to, l);
  if (!edge) return 'No direct passage. Sail to an adjacent stop first.';
  const need = draft(s, l),
    depth = edge.baseDepth + s.tideLevel;
  return `Boat needs depth ${need}. Passage has depth ${depth}: ${depth < need ? 'too shallow' : 'enough depth'}.`;
}

export function actionCostCopy(l: Level): string {
  return `Sailing, boarding, unloading and waiting each cost ${countActions(l.rules.actionCost)}. Inspection is free.`;
}

export function pierSafetyCopy(s: State, pierId: string, l: Level): string {
  const pier = l.piers.find((p) => p.id === pierId)!;
  if (s.tideLevel >= pier.elevation) return `${stop(pier.nodeId)} is flooded.`;
  const flood = l.rules.tide.rises.find((r) => r.afterTurn > s.turn && r.level >= pier.elevation);
  if (flood) return `${stop(pier.nodeId)} floods in ${countActions(flood.afterTurn - s.turn)}.`;
  return `${stop(pier.nodeId)} stays safe through all tide rises.`;
}

function tideCopy(s: State, l: Level): string {
  const next = l.rules.tide.rises.find((r) => r.afterTurn > s.turn);
  if (!next) return 'The tide will not rise again.';
  return next.afterTurn === s.turn + 1
    ? 'The tide rises after your next action.'
    : `The tide rises in ${countActions(next.afterTurn - s.turn)}.`;
}

function waitingFacts(s: State, l: Level): string[] {
  return l.piers.flatMap((p) => {
    const ids = s.waitingByPier[p.id] ?? [];
    if (!ids.length) return [];
    const futureFlood = l.rules.tide.rises.some(
      (r) => r.afterTurn > s.turn && r.level >= p.elevation,
    );
    const safe = s.tideLevel < p.elevation && !futureFlood;
    return [
      `${passengerList(ids)} ${verb(ids, 'waits', 'wait')}${safe ? ' safely' : ''} at ${stop(p.nodeId)}.`,
    ];
  });
}

export function statusCopy(
  s: State,
  l: Level,
): { headline: string; detail: string; urgent: boolean } {
  if (s.status === 'lost') {
    const loss = s.lossReason!,
      pier = l.piers.find((p) => p.id === loss.pierId)!;
    return {
      headline: `${stop(pier.nodeId)} flooded with ${passengerList(loss.passengerIds)} still waiting.`,
      detail: 'Undo earlier moves, or restart to try a different plan.',
      urgent: true,
    };
  }
  if (s.status === 'won')
    return {
      headline: 'Everyone is safely home.',
      detail: `${s.delivered.length} passengers delivered in ${countActions(s.turn)}.`,
      urgent: false,
    };
  const threatened = l.piers
    .flatMap((p) => {
      const ids = (s.waitingByPier[p.id] ?? []).filter((id) =>
        l.objective.requiredPassengerIds.includes(id),
      );
      const rise = l.rules.tide.rises.find((r) => r.afterTurn > s.turn && r.level >= p.elevation);
      return ids.length && rise ? [{ pier: p, rise }] : [];
    })
    .sort((a, b) => a.rise.afterTurn - b.rise.afterTurn)[0];
  const aboard = s.aboard.length
      ? `${passengerList(s.aboard)} ${verb(s.aboard, 'is', 'are')} safe aboard.`
      : '',
    waiting = waitingFacts(s, l),
    nextRise = l.rules.tide.rises.find((r) => r.afterTurn > s.turn),
    immediateTide = nextRise?.afterTurn === s.turn + 1 ? tideCopy(s, l) : '';
  if (threatened)
    return {
      headline: `${stop(threatened.pier.nodeId)} floods in ${countActions(threatened.rise.afterTurn - s.turn)}.`,
      detail: [
        immediateTide,
        aboard,
        ...waiting.filter((f) => !f.includes(stop(threatened.pier.nodeId))),
      ]
        .filter(Boolean)
        .join(' '),
      urgent: true,
    };
  const delivered = s.delivered.length
    ? `${passengerList(s.delivered)} ${verb(s.delivered, 'is', 'are')} safe at ${stop(l.piers.find((p) => p.id === l.objective.deliveryPierId)!.nodeId)}.`
    : '';
  return {
    headline: aboard || delivered || waiting.shift() || 'The boat is empty.',
    detail: [...waiting, delivered && aboard ? delivered : '', immediateTide]
      .filter(Boolean)
      .join(' '),
    urgent: false,
  };
}

export function forecastCopy(s: State, l: Level): { headline: string; detail: string } {
  const next = l.rules.tide.rises.find((r) => r.afterTurn > s.turn),
    futureTide = next?.level ?? s.tideLevel;
  return {
    headline: tideCopy(s, l),
    detail: l.piers
      .map((p) => {
        const ids = s.waitingByPier[p.id] ?? [],
          title = stop(p.nodeId);
        if (s.tideLevel >= p.elevation)
          return `${title} is flooded${ids.length ? `; ${passengerList(ids)} ${verb(ids, 'is', 'are')} waiting there` : ' and empty'}.`;
        if (futureTide >= p.elevation)
          return `${title} will flood at the next rise; ${ids.length ? `${passengerList(ids)} ${verb(ids, 'is', 'are')} waiting there` : 'nobody is waiting there'}.`;
        return `${title} ${next ? 'stays dry at the next rise' : 'is dry'}.`;
      })
      .join(' '),
  };
}

export function previewCopy(
  s: State,
  a: Action,
  l: Level,
): { summary: string; consequence: string; error: string | null; requirement: string } {
  const proposed = preview(s, a, l),
    n = proposed.state,
    rise = n.tideLevel > s.tideLevel,
    pier = pierAt(s, l),
    summary = `${actionLabel(s, a, l)} · ${countActions(l.rules.actionCost)}.`;
  if (proposed.error) {
    const edge = a.type === 'move' ? edgeTo(s, a.to, l) : undefined,
      plainMoveError =
        a.type === 'move' &&
        s.status === 'playing' &&
        (!edge || edge.baseDepth + s.tideLevel < draft(s, l));
    return {
      summary,
      error: plainMoveError && a.type === 'move' ? passageCopy(s, a.to, l) : proposed.error,
      consequence: '',
      requirement: '',
    };
  }
  const requirement =
    a.type === 'board' || a.type === 'unload'
      ? `After ${a.type === 'board' ? 'boarding' : 'unloading'}: boat needs depth ${draft(n, l)}.`
      : a.type === 'move'
        ? passageCopy(s, a.to, l)
        : `Boat needs depth ${draft(n, l)}.`;
  let consequence: string;
  if (n.status === 'lost') {
    const loss = n.lossReason!,
      flooded = l.piers.find((p) => p.id === loss.pierId)!;
    const order =
      a.type === 'board'
        ? `${passengerList(a.passengerIds)} ${verb(a.passengerIds, 'boards', 'board')}${rise ? ', then the tide rises' : ''}. `
        : rise
          ? 'The tide rises after this action. '
          : '';
    consequence = `${order}${passengerList(loss.passengerIds)} ${verb(loss.passengerIds, 'is', 'are')} still waiting at ${stop(flooded.nodeId)} when it floods. This ends the crossing.`;
  } else if (n.status === 'won') {
    consequence = `Everyone is safely home at ${stop(l.piers.find((p) => p.id === l.objective.deliveryPierId)!.nodeId)}.`;
  } else if (a.type === 'board') {
    const who = passengerList(a.passengerIds),
      safety =
        a.passengerIds.length === 2
          ? 'Both are'
          : a.passengerIds.length === 1
            ? `${who} is`
            : `All ${a.passengerIds.length} are`;
    consequence = rise
      ? `${who} ${verb(a.passengerIds, 'boards', 'board')}, then the tide rises. ${safety} safe aboard.`
      : `${who} will be aboard.`;
  } else if (a.type === 'unload') {
    consequence = pier!.isDeliveryPier
      ? `${passengerList(a.passengerIds)} will be safe at ${stop(pier!.nodeId)}.`
      : `${passengerList(a.passengerIds)} will wait at ${stop(pier!.nodeId)}. ${pierSafetyCopy(n, pier!.id, l)}`;
    if (rise) consequence += ' The tide rises after this action.';
  } else {
    consequence =
      a.type === 'move'
        ? `One passage to ${stop(a.to)}.`
        : `The boat stays at ${stop(s.boatNodeId)}.`;
    if (rise) consequence += ' The tide rises after this action.';
  }
  if ((a.type === 'board' || a.type === 'unload') && n.status === 'playing') {
    const blocked = l.nodes.find((node) => {
      const edge = edgeTo(n, node.id, l);
      return edge && edge.baseDepth + n.tideLevel < draft(n, l);
    });
    if (blocked) {
      const edge = edgeTo(n, blocked.id, l)!;
      consequence += ` Passage to ${stop(blocked.id)} has depth ${edge.baseDepth + n.tideLevel}: too shallow.`;
    }
  }
  return { summary, consequence, requirement, error: null };
}
