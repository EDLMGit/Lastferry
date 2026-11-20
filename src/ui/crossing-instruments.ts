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

function deckPlan(occupied: number, capacity: number) {
  const columns = Math.ceil(capacity / 2);
  const width = (44 - 3 * (columns - 1)) / columns;
  const slots = Array.from({ length: capacity }, (_, i) => {
    const x = 10 + Math.floor(i / 2) * (width + 3);
    const y = 5 + (i % 2) * 11;
    return `<rect class="deck-slot${i < occupied ? ' occupied' : ''}" x="${x}" y="${y}" width="${width}" height="8" rx="1.5"/>`;
  });
  return `<svg class="deck-plan" viewBox="0 0 70 29" aria-hidden="true"><path class="deck-sheer" d="M7 2 H48 Q60 2 68 14.5 Q60 27 48 27 H7 Q3 27 3 23 V6 Q3 2 7 2Z"/><path class="deck-stem" d="M59 10 63 14.5 59 19"/>${slots.join('')}</svg>`;
}

export function ferryInstrument(state: State, level: Level) {
  const { load, capacity, needed, water } = depthReading(state, level);
  const pier = level.piers.find(p => p.id === level.objective.deliveryPierId)!;
  const destination = nodeName(pier.nodeId, level);
  const total = level.objective.requiredPassengerIds.length;
  const rescued = state.delivered.filter(id => level.objective.requiredPassengerIds.includes(id)).length;
  const crew = state.aboard.length ? passengerList(state.aboard, level) + ' aboard' : 'Nobody aboard';
  const goal = `Bring everyone to ${destination}`;
  const spaceReading = `${load} of ${capacity} deck spaces occupied.`;
  const waterReading = `Boat needs depth ${needed}. Water here is ${water} deep.`;
  const summary = `${goal}. ${rescued} of ${total} home. ${spaceReading} ${crew}. ${waterReading} Crossing details.`;
  const markup =
    `<span class="gauge-goal">${iconMarkup('harbor-home')}<strong>${escapeLabel(destination)}</strong><span>${rescued}/${total} home</span></span>` +
    `<span class="gauge-pair"><span class="gauge-load"><span>Deck <b>${load}/${capacity}</b></span>${deckPlan(load, capacity)}</span>` +
    `<span class="gauge-water">${depthMark(needed, water)}<span><span class="hull-label">Hull <b>${needed}</b></span><span>Water <b>${water}</b></span></span></span></span>`;
  const details = `<strong id="boat-summary">${spaceReading}</strong><span class="gauge-crew">${escapeLabel(crew)}</span><span>${waterReading}</span>`;
  return { markup, summary, details, homeNode: pier.nodeId, destination };
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
