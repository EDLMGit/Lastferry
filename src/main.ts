import './style.css';
import { level as baseline, holdingPier, nodeNames, passengerNames } from './levels/level';
import {
  copy,
  draft,
  edgeTo,
  legalActions,
  load,
  pierAt,
  preview,
  type Action,
  type State,
} from './game/rules';
import { Session } from './game/session';
import { World } from './scene/world';
import { Sound } from './audio/sound';

const experiment = new URLSearchParams(location.search).get('cove') === 'holding-pier';
const level = experiment ? holdingPier : baseline;
const shallowBase = Math.min(...level.edges.map((e) => e.baseDepth));
const vulnerablePier = level.piers
  .filter((p) => !p.isDeliveryPier)
  .sort((a, b) => a.elevation - b.elevation)[0];
const floodTurn = level.rules.tide.rises.find(
  (r) => r.level >= vulnerablePier.elevation,
)!.afterTurn;
const vulnerableName = nodeNames[vulnerablePier.nodeId];
const name = (id: string) => passengerNames[id].split(' ·')[0];
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<main class="game ${experiment ? 'experiment' : ''}"><section id="seascape" aria-label="${level.title}"><div id="world"></div><header class="masthead"><span class="eyebrow">LAST FERRY <span class="dash">—</span> ${experiment ? 'PLAYABLE EXPERIMENT' : 'CHAPTER 01'}</span><h1>${experiment ? 'The Holding Pier' : 'The First Crossing'}</h1><p>A little boat. A way home.</p></header><div id="map-labels" aria-hidden="true">${experiment ? '<span class="pier-tag" data-pier="harbor-pier">HARBOR · SAFE</span><span class="pier-tag" data-pier="stone-pier">STONE PIER · SAFE</span><span class="pier-tag low" data-pier="rabbit-pier">RABBIT PIER · LOW</span>' : '<span class="island-label refuge">THE LIGHTHOUSE</span><span class="island-label sheep">MOSS’S PIER</span><span class="sea-label">THE OUTER PASSAGE</span>'}</div><div class="map-key"><span>··· One passage · one turn</span><span>◇ Shallows <b id="shallow-depth"></b> / deep <b id="deep-depth"></b></span></div><nav class="tools" aria-label="Crossing controls"><button id="undo" aria-label="Undo last turn" title="Undo the last turn">↶ <span>Undo</span></button><button id="restart" aria-label="Restart crossing">↺ <span>Restart</span></button><button id="sound" aria-label="Mute sound"></button></nav><p class="portrait-note">For a wider view, turn your phone sideways. All controls are available below.</p></section><aside class="panel" aria-label="Ferry controls"><div id="hud"></div><div id="controls"></div><div id="preview" aria-live="polite" aria-atomic="true"></div><div id="forecast"></div><p class="panel-foot">Take your time. The sea only moves when you do.</p><label class="cove-picker">Choose cove <select id="cove-picker"><option value="first-crossing" ${!experiment ? 'selected' : ''}>First Crossing · baseline</option><option value="holding-pier" ${experiment ? 'selected' : ''}>The Holding Pier · experiment</option></select></label></aside><div id="announcement" class="sr-only" role="status" aria-live="polite"></div></main>`;
const session = new Session(level),
  sound = new Sound(),
  world = new World(document.querySelector('#world')!, session.state, level);
const $ = (id: string) => document.getElementById(id)!;
let selected: Action | null = null,
  forecastOpen = false,
  fallback: ReturnType<typeof setTimeout> | undefined;
let keyboardInput = false,
  previewReturnId = '',
  recoverAfterCommit = false;
document.addEventListener('keydown', (e) => {
  if (['Tab', 'Enter', ' ', 'Escape'].includes(e.key)) keyboardInput = true;
});
document.addEventListener('pointerdown', () => {
  keyboardInput = false;
});
function focusAvailable(preferred?: string) {
  const target = (preferred ? $(preferred) : null) as HTMLButtonElement | null;
  if (target && !target.disabled && target.getClientRects().length) {
    target.focus();
    return;
  }
  const fallback =
    session.state.status !== 'playing'
      ? $('undo')
      : document.querySelector<HTMLButtonElement>('#controls button:not(:disabled)');
  fallback?.focus();
}
function closePreview() {
  selected = null;
  render();
  if (keyboardInput) focusAvailable(previewReturnId);
}
const actionTitle = (a: Action) =>
  a.type === 'move'
    ? `Sail to ${nodeNames[a.to]}`
    : a.type === 'wait'
      ? 'Wait one turn'
      : `${a.type === 'board' ? 'Board' : 'Unload'} ${a.passengerIds.length === 3 ? 'everyone' : a.passengerIds.map(name).join(' & ')}`;
function select(a: Action) {
  if (session.busy || session.state.status !== 'playing') return;
  previewReturnId = (document.activeElement as HTMLElement)?.id ?? '';
  selected = a;
  render();
  document.querySelector('.panel')!.scrollTop = 0;
  if (keyboardInput) $('cancel').focus();
}
function finish() {
  const recover =
    recoverAfterCommit &&
    (!document.activeElement ||
      document.activeElement === document.body ||
      document.activeElement.id === 'transition-status');
  clearTimeout(fallback);
  session.finish();
  render();
  if (recover) {
    document.querySelector('.panel')!.scrollTop = 0;
    focusAvailable();
  }
  recoverAfterCommit = false;
  const s = session.state;
  $('announcement').textContent =
    s.status === 'won'
      ? 'Everyone is home. All three passengers are safe.'
      : s.status === 'lost'
        ? `${vulnerableName} flooded with passengers waiting. Undo a turn.`
        : `Turn ${s.turn}. Tide ${s.tideLevel}. At ${nodeNames[s.boatNodeId]}.`;
}
function execute(action: Action | null) {
  if (!action) return;
  const a = copy(action),
    transaction = session.commit(a);
  if (!transaction) return;
  recoverAfterCommit = keyboardInput;
  selected = null;
  forecastOpen = false;
  render();
  if (keyboardInput) $('transition-status').focus();
  sound.play(transaction.after.status === 'won' ? 'arrival' : a.type);
  fallback = setTimeout(() => {
    world.cancel();
    if (session.busy) {
      world.sync(session.state);
      finish();
    }
  }, 1800);
  try {
    world.animate(transaction.before, transaction.after, a, finish);
  } catch {
    world.sync(session.state);
    finish();
  }
}
function activateMove(to: string) {
  if (session.busy || session.state.status !== 'playing') return;
  const a: Action = { type: 'move', to },
    proposed = preview(session.state, a, level);
  // Routine travel commits once. Dangerous/invalid moves open a free explanation.
  if (experiment && !proposed.error && proposed.state.status !== 'lost') execute(a);
  else select(a);
}
function channelConsequence(s: State) {
  const blocked = draft(s, level) > shallowBase + s.tideLevel;
  return `${blocked ? '⊘' : '◇'} ${experiment ? 'Shallow channel' : 'Shallow cut'} ${blocked ? 'blocked' : 'open'}: depth ${shallowBase + s.tideLevel}, draft ${draft(s, level)}.`;
}
function render() {
  const focused = (document.activeElement as HTMLElement)?.id,
    s = session.state,
    p = pierAt(s, level),
    busy = session.busy;
  document.querySelector('.panel')!.classList.toggle('selecting', !!selected);
  const nextRise = level.rules.tide.rises.find((r) => r.afterTurn > s.turn),
    filled = load(s, level);
  const riseNote = nextRise?.afterTurn === s.turn + 1 ? ` · tide rises to ${nextRise.level}` : '';
  const waitingAtRisk = s.waitingByPier[vulnerablePier.id].length;
  const danger =
    s.tideLevel >= vulnerablePier.elevation
      ? `${vulnerableName} is flooded · ${waitingAtRisk} waiting.`
      : `${vulnerableName} floods after turn ${floodTurn} · ${floodTurn - s.turn} turn${floodTurn - s.turn === 1 ? '' : 's'} left.`;
  $('hud').innerHTML =
    `<div class="panel-kicker">${experiment ? 'THE HOLDING PIER' : 'YOUR CROSSING'} <span class="chapter-mark">${experiment ? 'EXPERIMENT' : '01 / 01'}</span></div><div class="counters"><div><small>TURN</small><strong data-testid="turn">${String(s.turn).padStart(2, '0')}</strong></div><div><small>TIDE</small><strong data-testid="tide">${s.tideLevel}<span> / 2</span></strong></div><div><small>SAFE HOME</small><strong>${s.delivered.length}<span> / 3</span></strong></div></div><div class="cargo"><div><strong>${filled} / 4 spaces</strong><span>Draft <b>${draft(s, level)}</b></span></div><div class="slots" aria-label="${filled} of four passenger spaces occupied">${Array.from({ length: 4 }, (_, i) => `<i class="${i < filled ? 'filled' : ''}"></i>`).join('')}</div><p>${s.aboard.length ? s.aboard.map((id) => `${id.startsWith('rabbit') ? '♧' : '☁'} ${name(id)}`).join(' · ') : 'An empty boat, riding light.'}</p></div>${experiment ? `<div class="voyage-note"><strong>${danger}</strong><p>Stone Pier & Harbor stay dry through both rises.</p><p>Draft: empty = 1 · 1–2 spaces = 2 · 3–4 = 3</p></div>` : ''}`;
  $('controls').innerHTML =
    s.status === 'won'
      ? `<div class="ending"><span class="ending-icon">☀</span><span class="eyebrow">THE LIGHTHOUSE IS LIT</span><h2>Everyone home.</h2><p>Pip, Rue, and Moss are safe. A small crossing, a good evening.</p><p class="ending-small">All 3 passengers delivered · ${s.turn} turns<br>Undo to revisit the crossing, or start again.</p></div>`
      : s.status === 'lost'
        ? `<div class="ending loss"><span class="eyebrow">THE WATER HAS RISEN</span><h2>A turn too late.</h2><p>${vulnerableName} flooded with ${s.lossReason?.passengerIds.map(name).join(' and ')} still waiting. Undo a turn and try another way.</p></div>`
        : `<div class="location"><span class="eyebrow">${busy ? 'UNDER WAY' : 'NOW AT'}</span><h2>${nodeNames[s.boatNodeId]}</h2></div><p class="instruction">${experiment ? 'Bring everyone to Harbor. Sail costs 1 turn; Preview is free.' : s.boatNodeId === 'cut' && s.turn === 0 ? 'Moss is waiting at the low pier. Bring all three passengers to the lighthouse.' : 'Choose a passage or an action. Preview first, then confirm.'}</p><div class="action-list">${level.nodes
            .filter((n) => edgeTo(s, n.id, level))
            .map((n) => {
              const e = edgeTo(s, n.id, level)!,
                depth = e.baseDepth + s.tideLevel,
                blocked = depth < draft(s, level),
                willLose = preview(s, { type: 'move', to: n.id }, level).state.status === 'lost';
              return `${experiment ? '<div class="route-row">' : ''}<button class="action route ${selected?.type === 'move' && selected.to === n.id ? 'selected' : ''}" id="route-${n.id}" ${busy ? 'disabled' : ''}><span><b>${blocked ? '⊘' : '↗'} ${nodeNames[n.id]}</b><small>${experiment ? `${blocked ? 'Blocked' : willLose ? '⚠ Preview loss' : 'Sail · 1 turn'} · depth ${depth} / draft ${draft(s, level)}${riseNote}` : `${blocked ? 'Too shallow' : 'One passage'} · depth ${depth}`}</small></span><span class="chevron">›</span></button>${experiment ? `<button id="inspect-${n.id}" class="inspect-route" aria-label="Preview passage to ${nodeNames[n.id]}" ${busy ? 'disabled' : ''}>Preview</button></div>` : ''}`;
            })
            .join(
              '',
            )}${p && s.tideLevel < p.elevation && s.waitingByPier[p.id].length ? `<button class="action" id="board" ${busy ? 'disabled' : ''}><span><b>＋ Board passengers</b><small>${s.waitingByPier[p.id].map((id) => passengerNames[id]).join(', ')}${experiment ? ` · 1 turn${riseNote}` : ''}</small></span><span>›</span></button>` : ''}${p && s.tideLevel < p.elevation && s.aboard.length ? `<button class="action" id="unload" ${busy ? 'disabled' : ''}><span><b>⇥ ${p.isDeliveryPier ? 'Deliver passengers' : 'Unload at this pier'}</b><small>${experiment ? `1 turn · ${p.isDeliveryPier ? 'Safe home' : `Wait here; board again later · elevation ${p.elevation}`}${riseNote}` : 'Choose who leaves the ferry'}</small></span><span>›</span></button>` : ''}<button class="action quiet" id="wait" ${busy ? 'disabled' : ''}><span><b>≈ Wait one turn</b><small>${nextRise ? `${nextRise.afterTurn - s.turn} turn${nextRise.afterTurn - s.turn === 1 ? '' : 's'} until tide ${nextRise.level}` : 'High tide · no further rises'}</small></span><span>›</span></button></div>`;
  for (const n of level.nodes) {
    if ($(`route-${n.id}`)) $(`route-${n.id}`).onclick = () => activateMove(n.id);
    if ($(`inspect-${n.id}`))
      $(`inspect-${n.id}`).onclick = () => select({ type: 'move', to: n.id });
  }
  if ($('board'))
    $('board').onclick = () => select({ type: 'board', passengerIds: [...s.waitingByPier[p!.id]] });
  if ($('unload'))
    $('unload').onclick = () => select({ type: 'unload', passengerIds: [...s.aboard] });
  if ($('wait')) $('wait').onclick = () => select({ type: 'wait' });
  const pr = selected ? preview(s, selected, level) : null,
    next = pr?.state;
  let subset = '';
  if (selected && (selected.type === 'board' || selected.type === 'unload')) {
    const a = selected,
      ids = a.type === 'board' ? s.waitingByPier[p!.id] : s.aboard;
    subset = `<div class="passenger-options" role="group" aria-label="Passenger selection">${ids.map((id) => `<button id="passenger-${id}" aria-pressed="${a.passengerIds.includes(id)}">${id.startsWith('rabbit') ? '♧' : '☁'} ${passengerNames[id]} · ${level.passengers.find((p) => p.id === id)!.slots}</button>`).join('')}</div>`;
  }
  $('preview').innerHTML = busy
    ? `<div id="transition-status" class="preview busy" role="status" tabindex="-1"><span class="eyebrow">A MOMENT ON THE WATER</span><p>Finishing this turn…</p></div>`
    : selected && pr
      ? `<div class="preview ${pr.error || next?.status === 'lost' ? 'warning' : ''}"><div class="preview-head"><span class="eyebrow">ACTION PREVIEW · FREE</span><button id="cancel" aria-label="Close preview">×</button></div><h3>${actionTitle(selected)}</h3>${subset}<p>${pr.error ?? `Turn ${next!.turn} · tide ${next!.tideLevel} · ${load(next!, level)} / 4 spaces · draft ${draft(next!, level)}`}</p>${!pr.error ? `<p class="consequence">${next!.status === 'lost' ? `⚠ ${vulnerableName} floods with passengers waiting. This action ends the crossing.` : next!.status === 'won' ? 'All three passengers will be safe at the lighthouse.' : `${channelConsequence(next!)}${next!.tideLevel > s.tideLevel ? ' The tide rises after this action.' : ''}`}</p>` : ''}<button id="commit" class="commit" ${pr.error ? 'disabled' : ''}>${pr.error ? 'Action unavailable' : `Confirm · ${actionTitle(selected)}`} <span>${pr.error ? '' : '→'}</span></button></div>`
      : '';
  if ($('cancel')) $('cancel').onclick = closePreview;
  if ($('commit')) $('commit').onclick = () => execute(selected);
  if (selected && (selected.type === 'board' || selected.type === 'unload')) {
    const a = selected;
    for (const id of a.type === 'board' ? s.waitingByPier[p!.id] : s.aboard)
      if ($(`passenger-${id}`))
        $(`passenger-${id}`).onclick = () => {
          selected = {
            ...a,
            passengerIds: a.passengerIds.includes(id)
              ? a.passengerIds.filter((v) => v !== id)
              : [...a.passengerIds, id],
          };
          render();
        };
  }
  $('forecast').innerHTML =
    `<button id="forecast-toggle" aria-expanded="${forecastOpen}" class="forecast-button">≈ Next-tide forecast <span>${forecastOpen ? '−' : '+'}</span></button>${forecastOpen ? `<div class="forecast-detail"><strong>${nextRise ? `Tide ${nextRise.level} after turn ${nextRise.afterTurn}` : 'High tide has settled'}</strong><p>Shallows: ${shallowBase + (nextRise?.level ?? s.tideLevel)} · deep: ${3 + (nextRise?.level ?? s.tideLevel)}.</p><p>${level.piers.map((p) => `${nodeNames[p.nodeId]}: ${(nextRise?.level ?? s.tideLevel) >= p.elevation ? 'flooded' : 'dry'} (elevation ${p.elevation})`).join('<br>')}</p><p>Looking ahead is free. Use Wait to spend a turn.</p></div>` : `<p class="deadline">${vulnerableName} floods after turn <b>${floodTurn}</b>.</p>`}`;
  $('forecast-toggle').onclick = () => {
    forecastOpen = !forecastOpen;
    render();
  };
  ($('undo') as HTMLButtonElement).disabled = busy || !session.history.length;
  ($('restart') as HTMLButtonElement).disabled = busy;
  ($('cove-picker') as HTMLSelectElement).disabled = busy;
  $('undo').onclick = () => {
    if (session.undo()) {
      selected = null;
      world.sync(session.state);
      render();
      document.querySelector('.panel')!.scrollTop = 0;
      $('announcement').textContent =
        `Undid turn. Turn ${session.state.turn}, tide ${session.state.tideLevel}.`;
    }
  };
  $('restart').onclick = () => {
    if (session.restart()) {
      selected = null;
      forecastOpen = false;
      world.sync(session.state);
      render();
      document.querySelector('.panel')!.scrollTop = 0;
    }
  };
  $('sound').textContent = sound.muted ? '♫ Off' : '♫ On';
  $('sound').setAttribute('aria-label', sound.muted ? 'Unmute sound' : 'Mute sound');
  $('sound').setAttribute('aria-pressed', String(sound.muted));
  $('sound').onclick = () => {
    sound.toggle();
    render();
  };
  $('shallow-depth').textContent = String(shallowBase + s.tideLevel);
  $('deep-depth').textContent = String(3 + s.tideLevel);
  world.indicate(s, selected?.type === 'move' ? selected.to : undefined);
  world.setForecast(forecastOpen, nextRise?.level ?? s.tideLevel);
  if (experiment) positionLabels();
  if (focused && $(focused) && !($(focused) as HTMLButtonElement).disabled)
    $(focused).focus({ preventScroll: true });
  if (s.status !== 'playing') document.querySelector('.panel')!.scrollTop = 0;
}
world.onSelect = activateMove;
($('cove-picker') as HTMLSelectElement).onchange = (event) => {
  location.search = `?cove=${(event.target as HTMLSelectElement).value}`;
};
function positionLabels() {
  for (const label of document.querySelectorAll<HTMLElement>('[data-pier]')) {
    const pier = level.piers.find((p) => p.id === label.dataset.pier)!;
    label.hidden = pier.isDeliveryPier && session.state.delivered.length > 0;
    const point = world.project([pier.positionXZ[0], pier.positionXZ[1] - 1.9]);
    label.style.left = `${point.x}px`;
    label.style.top = `${point.y + world.host.offsetTop}px`;
  }
}
new ResizeObserver(positionLabels).observe(world.host);
positionLabels();
document.addEventListener('visibilitychange', () => {
  if (document.hidden && session.busy) {
    world.cancel();
    if (session.busy) finish();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !session.busy) {
    forecastOpen = false;
    if (selected) closePreview();
    else render();
  }
});
render();
if (import.meta.env.DEV)
  Object.assign(window, {
    __LAST_FERRY__: {
      getState: () => copy(session.state),
      getLegalActions: () => copy(legalActions(session.state, level)),
      getRenderStatus: () => ({
        pendingAnimation: session.busy,
        historyLength: session.history.length,
        passengers: world.passengerPresentation(),
        boatPosition: world.boatRoot.position.toArray(),
        waterY: world.water.position.y,
        hullY: world.hull.position.y,
      }),
      getFrameStatus: () => world.frameStatus(),
      getMetrics: () => world.metrics(),
    },
  });
