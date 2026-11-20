import { draft, edgeTo, load, type Action, type State } from '../game/rules';
import type { Level } from '../levels/level';

export function depthReading(state: State, level: Level, action?: Action) {
  const crossing = action?.type === 'move' ? edgeTo(state, action.to, level) : null;
  const nodeId = crossing && action?.type === 'move' ? action.to : state.boatNodeId;
  const berth = level.nodes.find(node => node.id === nodeId)!.baseDepth + state.tideLevel;
  const passage = crossing ? crossing.baseDepth + state.tideLevel : null;
  const water = passage === null ? berth : Math.min(passage, berth);
  const limit = passage === null || berth < passage ? 'berth' : berth === passage ? 'both' : 'passage';
  const scope = action?.type === 'board' || action?.type === 'unload' ? action.type : crossing ? 'crossing' : 'here';
  let manifest = state;
  if (action?.type === 'board' || action?.type === 'unload') {
    const aboard = action.type === 'board' ? [...state.aboard, ...action.passengerIds]
      : state.aboard.filter(id => !action.passengerIds.includes(id));
    manifest = { ...state, aboard };
  }
  const occupied = load(manifest, level);
  const capacity = level.rules.capacity;
  return { load: occupied, capacity, needed: occupied <= capacity ? draft(manifest, level) : null,
    water, limit, passage, berth, scope } as const;
}

export function depthMark(needed: number | null, available: number) {
  const scale = Math.max(6, needed ?? 0, available);
  return `<span aria-hidden="true" class="depth-mark" style="--water-line:${100 * available / scale}%;--hull-line:${100 * (needed ?? 0) / scale}%"><i class="depth-waterline"></i>${needed === null ? '' : '<i class="depth-notch"></i>'}</span>`;
}

type Reading = ReturnType<typeof depthReading>;

export function boardingReading(reading: Reading) {
  const { needed, water, load, capacity } = reading;
  return `<span class="boarding-reading" data-needed="${needed}" data-water="${water}" data-limit="berth">${depthMark(needed, water)}<span>Needs depth <b>${needed}</b> · berth <b>${water}</b></span><span class="sr-only"> after boarding, ${load}/${capacity} spaces.</span></span>`;
}

export function readingMarkup(reading: Reading) {
  const { needed, water, load, capacity, passage, berth, scope, limit } = reading;
  const shallow = needed !== null && needed > water;
  const projected = scope === 'board' || scope === 'unload';
  const cell = (label: string, value: number) => `<span class="depth-fact">${label} <b>${value}</b></span>`;
  const available = passage === null ? cell('· berth', berth)
    : limit === 'both' ? cell('· passage & arrival', berth)
    : cell('· passage', passage) + ' ' + cell('· arrival', berth);
  const depthNote = passage === null || limit === 'both' ? (shallow ? 'Too shallow' : '')
    : (limit === 'passage' ? 'Passage' : 'Arrival') + (shallow ? ' too shallow' : ' limits depth');
  const heading = scope === 'board' ? 'After boarding' : scope === 'unload' ? 'After unloading' : depthNote || 'Crossing depth';
  return `<div class="depth-reading requirement" data-needed="${needed ?? ''}" data-water="${water}" data-limit="${limit}" data-shallow="${shallow}">
    ${depthMark(needed, water)}<div class="depth-lines"><div class="depth-caption"><strong>${heading}</strong>${projected ? `<span>${load}/${capacity} spaces</span>` : ''}${projected && shallow ? '<b>Too shallow</b>' : ''}</div>
    <div class="depth-values">${needed === null ? cell('Over capacity', load) : cell('Needs depth', needed)} ${available}</div></div></div>`;
}
