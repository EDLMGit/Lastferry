import { occupiedPierDeadline } from '../game/rescue-facts';
import { draft, edgeTo, passageFlow, pierAt, preview, type Action, type State } from '../game/rules';
import { level as baseline, nodeName, passengerName, type Level } from '../levels/level';

const stop = (id: string, l: Level) => nodeName(id, l);
const verb = (ids: string[], singular: string, plural: string) =>
  ids.length === 1 ? singular : plural;
const countActions = (n: number) => `${n} action${n === 1 ? '' : 's'}`;

export function currentNotice(s: State, l: Level, edge = l.edges.find((entry) => entry.current)) {
  if (!edge?.current) return null;
  const flow = passageFlow(edge, s.tideLevel);
  if (!flow) return null;
  const name = edge.current.name;
  const toward = stop(flow.to, l);
  const direction = `${name} flows from ${stop(flow.from, l)} to ${toward}.`;
  const reversal = l.rules.tide.rises.find((rise) =>
    rise.afterTurn > s.turn && passageFlow(edge, rise.level)?.from !== flow.from);
  const following = reversal && passageFlow(edge, reversal.level);
  const remaining = reversal ? reversal.afterTurn - s.turn : null;
  const next = following && remaining !== null
    ? `After ${remaining === 1 ? 'your next action' : countActions(remaining)}, it turns toward ${stop(following.to, l)}.`
    : 'It stays this way.';
  return {
    flow,
    direction,
    next,
    compact: `${name} to ${toward}${remaining === null ? ' only' : ` · turns in ${countActions(remaining)}`}`,
    underway: `${name} to ${toward}${remaining === 1 ? ' · turns on arrival' : ''}`,
    boundary: remaining === 1 && following ? `Then ${name} turns toward ${stop(following.to, l)}.` : '',
  };
}

function cutoffCopy(s: State, l: Level, loss: Exclude<NonNullable<State['lossReason']>, { code: 'PASSENGER_STRANDED' }>, before?: State) {
  const edge = l.edges.find((entry) => entry.id === loss.edgeId)!;
  const home = l.piers.find((p) => p.id === l.objective.deliveryPierId)!.nodeId;
  if (loss.code === 'RETURN_CAPACITY') {
    const trips = loss.homewardTrips === 1 ? 'One homeward trip remains' : `${loss.homewardTrips} homeward trips remain`;
    const detail = `${trips} through ${edge.current!.name}, with room for ${loss.homewardTrips * l.rules.capacity} spaces. The neighbors still across the reef need ${loss.offshoreSlots}.`;
    return { headline: 'There is too much to bring home.', warning: 'This leaves too much for the return trip.', detail };
  }
  const flow = passageFlow(edge, s.tideLevel)!;
  const direction = `from ${stop(flow.from, l)} to ${stop(flow.to, l)}`;
  if (loss.code === 'RETURN_DEPTH') {
    const detail = before
      ? `After this action the reef will flow only ${direction}. The boat will need depth ${loss.draft}, with no dry landing in reach to lighten it.`
      : `The reef flows only ${direction}. The boat needs depth ${loss.draft}, and cannot reach a dry landing to let anyone ashore.`;
    return { headline: 'The loaded ferry cannot reach Harbor.', warning: 'This leaves the boat too deep for the way home.', detail };
  }
  const turnsAgain = l.rules.tide.rises.some(r => r.afterTurn > s.turn && passageFlow(edge, r.level)?.from !== flow.from);
  const changed = before && passageFlow(edge, before.tideLevel)?.from !== flow.from;
  const cause = turnsAgain
    ? 'The remaining currents leave no trip that can collect them and bring them home.'
    : changed
      ? `After this action, ${edge.current!.name} will flow only ${direction}.`
      : `${edge.current!.name} flows only ${direction} and will not turn again.`;
  return {
    headline: `${passengerList(loss.passengerIds, l)} can no longer reach ${stop(home, l)}.`,
    warning: `This action will cut ${passengerList(loss.passengerIds, l)} off from ${stop(home, l)}.`,
    detail: cause,
  };
}

export function passengerList(ids: string[], l: Level = baseline): string {
  const names = ids.map((id) => passengerName(id, l));
  if (names.length < 2) return names[0] ?? '';
  if (names.length === 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

export function actionLabel(s: State, a: Action, l: Level): string {
  if (a.type === 'move') return `Sail to ${stop(a.to, l)}`;
  if (a.type === 'wait') return 'Wait';
  const who = passengerList(a.passengerIds, l) || 'passengers';
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
    destination = stop(l.piers.find((p) => p.id === l.objective.deliveryPierId)!.nodeId, l),
    home = required.filter((id) => s.delivered.includes(id)).length;
  return {
    headline:
      l.id === 'bellwater'
        ? `Bring ${passengerList(required, l)} to ${destination}`
        : `Bring ${total === 1 ? 'one passenger' : `all ${count} passengers`} to ${destination}`,
    progress: `Home ${home}/${total}`,
  };
}

export function passageCopy(s: State, to: string, l: Level): string {
  if (to === s.boatNodeId) return `You are at ${stop(to, l)}.`;
  const edge = edgeTo(s, to, l);
  if (!edge) return 'No direct passage. Sail to an adjacent stop first.';
  const need = draft(s, l),
    depth = edge.baseDepth + s.tideLevel;
  const depthText = `Boat needs depth ${need}. Passage has depth ${depth}: ${depth < need ? 'too shallow' : 'enough depth'}.`;
  const current = currentNotice(s, l, edge);
  return current ? `${depthText} ${current.direction} ${current.next}` : depthText;
}

export function actionCostCopy(l: Level): string {
  return `Sailing, boarding, unloading and waiting each cost ${countActions(l.rules.actionCost)}. Inspection is free.`;
}

export function pierSafetyCopy(s: State, pierId: string, l: Level): string {
  const pier = l.piers.find((p) => p.id === pierId)!;
  if (s.tideLevel >= pier.elevation) return `${stop(pier.nodeId, l)} is flooded.`;
  const flood = l.rules.tide.rises.find((r) => r.afterTurn > s.turn && r.level >= pier.elevation);
  if (flood) return `${stop(pier.nodeId, l)} floods in ${countActions(flood.afterTurn - s.turn)}.`;
  return `${stop(pier.nodeId, l)} stays safe through all tide rises.`;
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
      `${passengerList(ids, l)} ${verb(ids, 'waits', 'wait')}${safe ? ' safely' : ''} at ${stop(p.nodeId, l)}.`,
    ];
  });
}

export function statusCopy(
  s: State,
  l: Level,
): { headline: string; detail: string; urgent: boolean } {
  if (s.status === 'lost') {
    const loss = s.lossReason!;
    if (loss.code !== 'PASSENGER_STRANDED') {
      const cutoff = cutoffCopy(s, l, loss);
      return { headline: cutoff.headline, detail: `${cutoff.detail} Undo an earlier action, or restart.`, urgent: true };
    }
    const pier = l.piers.find((p) => p.id === loss.pierId)!;
    return {
      headline: `${stop(pier.nodeId, l)} flooded with ${passengerList(loss.passengerIds, l)} still waiting.`,
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
  const threatened = occupiedPierDeadline(s, l);
  const aboard = s.aboard.length
      ? `${passengerList(s.aboard, l)} ${verb(s.aboard, 'is', 'are')} safe aboard.`
      : '',
    waiting = waitingFacts(s, l),
    nextRise = l.rules.tide.rises.find((r) => r.afterTurn > s.turn),
    immediateTide = nextRise?.afterTurn === s.turn + 1 ? tideCopy(s, l) : '';
  if (threatened)
    return {
      headline: `${stop(threatened.pier.nodeId, l)} floods in ${countActions(threatened.rise.afterTurn - s.turn)}.`,
      detail: [
        immediateTide,
        aboard,
        ...waiting.filter((f) => !f.includes(stop(threatened.pier.nodeId, l))),
      ]
        .filter(Boolean)
        .join(' '),
      urgent: true,
    };
  const delivered = s.delivered.length
    ? `${passengerList(s.delivered, l)} ${verb(s.delivered, 'is', 'are')} safe at ${stop(l.piers.find((p) => p.id === l.objective.deliveryPierId)!.nodeId, l)}.`
    : '';
  return {
    headline: aboard || delivered || waiting.shift() || 'The boat is empty.',
    detail: [...waiting, delivered && aboard ? delivered : '', immediateTide]
      .filter(Boolean)
      .join(' '),
    urgent: false,
  };
}

export function forecastCopy(s: State, l: Level) {
  const next = l.rules.tide.rises.find((r) => r.afterTurn > s.turn),
    futureTide = next?.level ?? s.tideLevel,
    edge = l.edges.find((e) => e.current);
  const upcoming = l.rules.tide.rises.filter(r => r.afterTurn > s.turn);
  const schedule = edge ? upcoming.map((r, index) => {
    const phase = passageFlow(edge, r.level)!;
    const previous = index === 0 ? s.tideLevel : upcoming[index - 1].level;
    const floods = l.piers.filter(p => previous < p.elevation && p.elevation <= r.level).map(p => stop(p.nodeId, l));
    return { turn: r.afterTurn, direction: `${stop(phase.from, l)} → ${stop(phase.to, l)}`, depth: edge.baseDepth + r.level, floods };
  }) : [];
  return {
    schedule,
    headline: tideCopy(s, l),
    current: currentNotice(s, l),
    detail: l.piers
      .map((p) => {
        const ids = s.waitingByPier[p.id] ?? [],
          title = stop(p.nodeId, l);
        if (s.tideLevel >= p.elevation)
          return `${title} is flooded${ids.length ? `; ${passengerList(ids, l)} ${verb(ids, 'is', 'are')} waiting there` : ' and empty'}.`;
        if (futureTide >= p.elevation)
          return `${title} will flood at the next rise; ${ids.length ? `${passengerList(ids, l)} ${verb(ids, 'is', 'are')} waiting there` : 'nobody is waiting there'}.`;
        return `${title} ${next ? 'stays dry at the next rise' : 'is dry'}.`;
      })
      .join(' '),
  };
}

export function previewCopy(
  s: State,
  a: Action,
  l: Level,
  tips = true,
): { summary: string; consequence: string; error: string | null; requirement: string } {
  const proposed = preview(s, a, l),
    n = proposed.state,
    rise = n.tideLevel > s.tideLevel,
    pier = pierAt(s, l),
    summary = `${actionLabel(s, a, l)} · ${countActions(l.rules.actionCost)}.`;
  if (proposed.error) {
    const edge = a.type === 'move' ? edgeTo(s, a.to, l) : undefined,
      flow = edge && passageFlow(edge, s.tideLevel),
      plainMoveError =
        a.type === 'move' &&
        s.status === 'playing' &&
        (!flow || flow.from === s.boatNodeId) &&
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
  if (!tips) {
    const actionFact = a.type === 'board'
      ? `${passengerList(a.passengerIds, l)} will board.`
      : a.type === 'unload'
        ? `${passengerList(a.passengerIds, l)} will ${pier!.isDeliveryPier ? 'disembark' : 'wait'} at ${stop(pier!.nodeId, l)}.`
        : a.type === 'move'
          ? `One passage to ${stop(a.to, l)}.`
          : `The boat stays at ${stop(s.boatNodeId, l)}.`;
    const tideFact = rise ? 'The tide rises after this action.' : '';
    const currentFact = rise ? currentNotice(s, l)?.boundary ?? '' : '';
    return { summary, requirement, error: null, consequence: [actionFact, tideFact, currentFact].filter(Boolean).join(' ') };
  }
  let consequence: string;
  if (n.status === 'lost') {
    const loss = n.lossReason!;
    if (loss.code !== 'PASSENGER_STRANDED') {
      const cutoff = cutoffCopy(n, l, loss, s);
      return { summary, requirement, error: null, consequence: `${cutoff.warning} ${cutoff.detail}` };
    }
    const flooded = l.piers.find((p) => p.id === loss.pierId)!;
    const order =
      a.type === 'board'
        ? `${passengerList(a.passengerIds, l)} ${verb(a.passengerIds, 'boards', 'board')}${rise ? ', then the tide rises' : ''}. `
        : rise
          ? 'The tide rises after this action. '
          : '';
    consequence = `${order}${passengerList(loss.passengerIds, l)} ${verb(loss.passengerIds, 'is', 'are')} still waiting at ${stop(flooded.nodeId, l)} when it floods. This ends the crossing.`;
  } else if (n.status === 'won') {
    consequence = `Everyone will be safely home at ${stop(l.piers.find((p) => p.id === l.objective.deliveryPierId)!.nodeId, l)}.`;
  } else if (a.type === 'board') {
    const who = passengerList(a.passengerIds, l),
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
      ? `${passengerList(a.passengerIds, l)} will be safe at ${stop(pier!.nodeId, l)}.`
      : `${passengerList(a.passengerIds, l)} will wait at ${stop(pier!.nodeId, l)}. ${pierSafetyCopy(n, pier!.id, l)}`;
    if (rise) consequence += ' The tide rises after this action.';
  } else {
    consequence =
      a.type === 'move'
        ? `One passage to ${stop(a.to, l)}.`
        : `The boat stays at ${stop(s.boatNodeId, l)}.`;
    if (rise) consequence += ' The tide rises after this action.';
  }
  if ((a.type === 'board' || a.type === 'unload') && n.status === 'playing') {
    const blocked = l.nodes.find((node) => {
      const edge = edgeTo(n, node.id, l);
      return edge && edge.baseDepth + n.tideLevel < draft(n, l);
    });
    if (blocked) {
      const edge = edgeTo(n, blocked.id, l)!;
      consequence += ` Passage to ${stop(blocked.id, l)} has depth ${edge.baseDepth + n.tideLevel}: too shallow.`;
    }
  }
  if (rise && n.status === 'playing') {
    const boundary = currentNotice(s, l)?.boundary;
    if (boundary) consequence += ` ${boundary}`;
  }
  return { summary, consequence, requirement, error: null };
}

export function draftBandsCopy(l: Level): string {
  let first = 0;
  return l.rules.draftBands
    .map((band) => {
      const label =
        first === 0 && band.maxLoad === 0
          ? 'empty'
          : first === band.maxLoad
            ? `${first} spaces`
            : `${first}–${band.maxLoad} spaces`;
      first = band.maxLoad + 1;
      return `${label} = ${band.draft}`;
    })
    .join('; ');
}
