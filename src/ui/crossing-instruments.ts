import { nextWaterChange } from '../game/rescue-facts';
import type { State } from '../game/rules';
import { nodeName, type Level } from '../levels/level';
import { escapeLabel, iconMarkup } from './cove-ui';
import { depthMark, depthReading } from './depth-reading';
import { passengerList } from './presentation';
import { waterlineMark } from './tide-mark';

function crewCaption(ids: string[], level: Level, place: string) {
  if (!ids.length) return '';
  return ids.length <= 2 ? passengerList(ids, level) + ' ' + place : ids.length + ' passengers ' + place;
}

export function ferryInstrument(state: State, level: Level) {
  const { load, capacity, needed, water } = depthReading(state, level);
  const pier = level.piers.find(p => p.id === level.objective.deliveryPierId)!;
  const destination = nodeName(pier.nodeId, level);
  const total = level.objective.requiredPassengerIds.length;
  const rescued = state.delivered.filter(id => level.objective.requiredPassengerIds.includes(id)).length;
  const crew = crewCaption(state.aboard, level, 'aboard');
  const goal = `Bring everyone to ${destination}`;
  const summary = `${goal}. ${rescued} of ${total} home. ${crew || 'Empty ferry'}. Load ${load} of ${capacity} spaces. Ferry needs depth ${needed}. Water here is ${water} deep. Open crossing details.`;
  const markup =
    `<span class="gauge-goal">${iconMarkup('harbor-home')}<span><strong>Bring all ${total} to ${escapeLabel(destination)}</strong><span>${rescued}/${total} home</span></span></span>` +
    `<span class="gauge-load"><span>Load <b>${load}/${capacity}</b></span>${crew ? `<span class="gauge-crew">${escapeLabel(crew)}</span>` : ''}</span>` +
    `<span class="gauge-water">${depthMark(needed, water)}<span><span>Needs depth <b>${needed}</b></span><span>Water here <b>${water}</b></span></span></span>`;
  return { markup, summary, homeNode: pier.nodeId, destination };
}

export function tideInstrument(state: State, level: Level) {
  const change = nextWaterChange(state, level);
  const clock = `${state.turn} ${state.turn === 1 ? 'action' : 'actions'} taken`;
  if (!change) {
    const headline = state.status === 'playing' ? 'No more tide rises.' : 'Crossing ended.';
    return {
      urgent: false,
      summary: clock + '. ' + headline,
      markup: `<span class="tide-taken">${clock}</span><strong id="status-headline">${headline}</strong>`,
    };
  }
  const { landings, current, remaining } = change;
  const duration = remaining + (remaining === 1 ? ' action' : ' actions');
  const names = landings.map(p => p.name).join(' and ');
  const flood = names && names + (landings.length === 1 ? ' floods' : ' flood');
  const reversal = current && current.name + ' turns';
  const events = [flood, reversal].filter(Boolean).join(' · ');
  const headline = `${events || 'Tide rises'} in ${duration}.`;
  const waiting = landings.flatMap(p => p.waiting);
  const caption = waiting.length ? crewCaption(waiting, level, 'waiting')
    : landings.some(p => p.winch) ? 'The winch floods too'
    : landings.length ? 'Nobody waiting there' : '';
  const markup =
    `<span class="tide-numbers"><span class="tide-countdown">${waterlineMark()}In ${duration}</span><span class="tide-taken">${state.turn} ${state.turn === 1 ? 'action' : 'actions'} used</span></span>` +
    `<strong id="status-headline">${escapeLabel(events || 'Tide rises')}</strong>` +
    (caption ? `<span class="tide-passengers">${escapeLabel(caption)}</span>` : '');
  return { markup, urgent: waiting.length > 0 || landings.some(p => p.winch), summary: `${clock}. ${headline} ${caption}`.trim() };
}
