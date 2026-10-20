import './style.css';
import { level, nodeNames, passengerNames } from './levels/level';
import {
  copy,
  draft,
  edgeTo,
  legalActions,
  load,
  pierAt,
  preview,
  type Action,
} from './game/rules';
import { Session } from './game/session';
import { World } from './scene/world';
import { Sound } from './audio/sound';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<main class="game"><section id="seascape" aria-label="The first cove"><div id="world"></div><header class="masthead"><span class="eyebrow">LAST FERRY <span class="dash">—</span> CHAPTER 01</span><h1>The First Crossing</h1><p>A little boat. A way home.</p></header><div id="map-labels" aria-hidden="true"><span class="island-label refuge">THE LIGHTHOUSE</span><span class="island-label sheep">MOSS'S PIER</span><span class="sea-label">THE OUTER PASSAGE</span></div><div class="map-key"><span>··· One passage · one turn</span><span>◇ Shallows <b id="shallow-depth">2</b> / deep <b id="deep-depth">3</b></span></div><nav class="tools" aria-label="Crossing controls"><button id="undo" aria-label="Undo last turn" title="Undo the last turn">↶ <span>Undo</span></button><button id="restart" aria-label="Restart crossing">↺ <span>Restart</span></button><button id="sound" aria-label="Mute sound"></button></nav><p class="portrait-note">For a wider view, turn your phone sideways. All controls are available below.</p></section><aside class="panel" aria-label="Ferry controls"><div id="hud"></div><div id="controls"></div><div id="preview" aria-live="polite" aria-atomic="true"></div><div id="forecast"></div><p class="panel-foot">Take your time. The sea only moves when you do.</p></aside><div id="announcement" class="sr-only" role="status" aria-live="polite"></div></main>`;
const session = new Session(),
  sound = new Sound(),
  world = new World(document.querySelector('#world')!, session.state);
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
const $ = (id: string) => document.getElementById(id)!;
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
      : `${a.type === 'board' ? 'Board' : 'Unload'} ${a.passengerIds.length === 3 ? 'everyone' : a.passengerIds.map((id) => passengerNames[id].split(' ·')[0]).join(' & ')}`;
function select(a: Action) {
  if (session.busy || session.state.status !== 'playing') return;
  previewReturnId = (document.activeElement as HTMLElement)?.id ?? '';
  selected = a;
  render();
  document.querySelector('.panel')!.scrollTop = 0;
  if (keyboardInput) $('cancel').focus();
}
function finish() {
  const recoverFocus =
    recoverAfterCommit &&
    (!document.activeElement ||
      document.activeElement === document.body ||
      document.activeElement.id === 'transition-status');
  clearTimeout(fallback);
  session.finish();
  render();
  if (recoverFocus) {
    document.querySelector('.panel')!.scrollTop = 0;
    focusAvailable();
  }
  recoverAfterCommit = false;
  $('announcement').textContent =
    session.state.status === 'won'
      ? 'Everyone is home. All three passengers are safe.'
      : session.state.status === 'lost'
        ? 'The tide reached a waiting passenger. Undo a turn.'
        : `Turn ${session.state.turn}. Tide ${session.state.tideLevel}. At ${nodeNames[session.state.boatNodeId]}.`;
}
function commit() {
  if (!selected) return;
  const a = copy(selected),
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
function render() {
  const focused = (document.activeElement as HTMLElement)?.id,
    s = session.state,
    p = pierAt(s),
    busy = session.busy;
  document.querySelector('.panel')!.classList.toggle('selecting', !!selected);
  const nextRise = level.rules.tide.rises.find((r) => r.afterTurn > s.turn),
    filled = load(s);
  $('hud').innerHTML =
    `<div class="panel-kicker">YOUR CROSSING <span class="chapter-mark">01 / 01</span></div><div class="counters"><div><small>TURN</small><strong data-testid="turn">${String(s.turn).padStart(2, '0')}</strong></div><div><small>TIDE</small><strong data-testid="tide">${s.tideLevel}<span> / 2</span></strong></div><div><small>SAFE HOME</small><strong>${s.delivered.length}<span> / 3</span></strong></div></div><div class="cargo"><div><strong>${filled} / 4 spaces</strong><span>Draft <b>${draft(s)}</b></span></div><div class="slots" aria-label="${filled} of four passenger spaces occupied">${Array.from({ length: 4 }, (_, i) => `<i class="${i < filled ? 'filled' : ''}"></i>`).join('')}</div><p>${s.aboard.length ? s.aboard.map((id) => `${id.startsWith('rabbit') ? '♧' : '☁'} ${passengerNames[id].split(' ·')[0]}`).join(' · ') : 'An empty boat, riding light.'}</p></div>`;
  $('controls').innerHTML =
    s.status === 'won'
      ? `<div class="ending"><span class="ending-icon">☀</span><span class="eyebrow">THE LIGHTHOUSE IS LIT</span><h2>Everyone home.</h2><p>Pip, Rue, and Moss are safe. A small crossing, a good evening.</p><p class="ending-small">All 3 passengers delivered · ${s.turn} turns<br>Undo to revisit the crossing, or start again.</p></div>`
      : s.status === 'lost'
        ? `<div class="ending loss"><span class="eyebrow">THE WATER HAS RISEN</span><h2>A turn too late.</h2><p>The tide reached a waiting passenger. Undo a turn and try another way.</p></div>`
        : `<div class="location"><span class="eyebrow">${busy ? 'UNDER WAY' : 'NOW AT'}</span><h2>${nodeNames[s.boatNodeId]}</h2></div><p class="instruction">${s.boatNodeId === 'cut' && s.turn === 0 ? 'Moss is waiting at the low pier. Bring all three passengers to the lighthouse.' : 'Choose a passage or an action. Preview first, then confirm.'}</p><div class="action-list">${level.nodes
            .filter((n) => edgeTo(s, n.id))
            .map((n) => {
              const e = edgeTo(s, n.id)!,
                depth = e.baseDepth + s.tideLevel,
                blocked = depth < draft(s);
              return `<button class="action route ${selected?.type === 'move' && selected.to === n.id ? 'selected' : ''}" id="route-${n.id}" ${busy ? 'disabled' : ''}><span><b>${blocked ? '⊘' : '↗'} ${nodeNames[n.id]}</b><small>${blocked ? 'Too shallow' : 'One passage'} · depth ${depth}</small></span><span class="chevron">›</span></button>`;
            })
            .join(
              '',
            )}${p && s.tideLevel < p.elevation && s.waitingByPier[p.id].length ? `<button class="action" id="board" ${busy ? 'disabled' : ''}><span><b>＋ Board passengers</b><small>${s.waitingByPier[p.id].map((id) => passengerNames[id]).join(', ')}</small></span><span>›</span></button>` : ''}${p && s.tideLevel < p.elevation && s.aboard.length ? `<button class="action" id="unload" ${busy ? 'disabled' : ''}><span><b>⇥ ${p.isDeliveryPier ? 'Deliver passengers' : 'Unload at this pier'}</b><small>Choose who leaves the ferry</small></span><span>›</span></button>` : ''}<button class="action quiet" id="wait" ${busy ? 'disabled' : ''}><span><b>≈ Wait one turn</b><small>${nextRise ? `${nextRise.afterTurn - s.turn} turn${nextRise.afterTurn - s.turn === 1 ? '' : 's'} until tide ${nextRise.level}` : 'High tide · no further rises'}</small></span><span>›</span></button></div>`;
  for (const n of level.nodes) {
    const b = $(`route-${n.id}`);
    if (b) b.onclick = () => select({ type: 'move', to: n.id });
  }
  if ($('board'))
    $('board').onclick = () => select({ type: 'board', passengerIds: [...s.waitingByPier[p!.id]] });
  if ($('unload'))
    $('unload').onclick = () => select({ type: 'unload', passengerIds: [...s.aboard] });
  if ($('wait')) $('wait').onclick = () => select({ type: 'wait' });
  const pr = selected ? preview(s, selected) : null;
  let subset = '';
  if (selected && (selected.type === 'board' || selected.type === 'unload')) {
    const a = selected,
      ids = a.type === 'board' ? s.waitingByPier[p!.id] : s.aboard;
    subset = `<div class="passenger-options" role="group" aria-label="Passenger selection">${ids.map((id) => `<button id="passenger-${id}" aria-pressed="${a.passengerIds.includes(id)}">${id.startsWith('rabbit') ? '♧' : '☁'} ${passengerNames[id]} · ${level.passengers.find((p) => p.id === id)!.slots}</button>`).join('')}</div>`;
  }
  const next = pr?.state;
  const cutBlocked = next && draft(next) > 2 + next.tideLevel;
  $('preview').innerHTML = busy
    ? `<div id="transition-status" class="preview busy" role="status" tabindex="-1"><span class="eyebrow">A MOMENT ON THE WATER</span><p>Finishing this turn…</p></div>`
    : selected && pr
      ? `<div class="preview ${pr.error || next?.status === 'lost' ? 'warning' : ''}"><div class="preview-head"><span class="eyebrow">ACTION PREVIEW · FREE</span><button id="cancel" aria-label="Close preview">×</button></div><h3>${actionTitle(selected)}</h3>${subset}<p>${pr.error ?? `Turn ${next!.turn} · tide ${next!.tideLevel} · ${load(next!)} / 4 spaces · draft ${draft(next!)}`}</p>${!pr.error ? `<p class="consequence">${next!.status === 'lost' ? '⚠ The rise will reach a waiting passenger. This action ends the crossing.' : next!.status === 'won' ? 'All three passengers will be safe at the lighthouse.' : `${cutBlocked ? '⊘ Shallow cut blocked' : '◇ Shallow cut open'}: depth ${2 + next!.tideLevel}, draft ${draft(next!)}.${next!.tideLevel > s.tideLevel ? ' The tide rises after this action.' : ''}`}</p>` : ''}<button id="commit" class="commit" ${pr.error ? 'disabled' : ''}>${pr.error ? 'Action unavailable' : `Confirm · ${actionTitle(selected)}`} <span>${pr.error ? '' : '→'}</span></button></div>`
      : '';
  if ($('cancel')) $('cancel').onclick = closePreview;
  if ($('commit')) $('commit').onclick = commit;
  if (selected && (selected.type === 'board' || selected.type === 'unload')) {
    const a = selected;
    for (const id of a.type === 'board' ? s.waitingByPier[p!.id] : s.aboard) {
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
  }
  $('forecast').innerHTML =
    `<button id="forecast-toggle" aria-expanded="${forecastOpen}" class="forecast-button">≈ Next-tide forecast <span>${forecastOpen ? '−' : '+'}</span></button>${forecastOpen ? `<div class="forecast-detail"><strong>${nextRise ? `Tide ${nextRise.level} after turn ${nextRise.afterTurn}` : 'High tide has settled'}</strong><p>Shallows: ${2 + (nextRise?.level ?? s.tideLevel)} · deep: ${3 + (nextRise?.level ?? s.tideLevel)}.<br>${(nextRise?.level ?? s.tideLevel) >= 2 ? 'Sheep pier flooded. Harbor stays dry.' : 'Both piers stay dry. Sheep pier floods after turn 8.'}</p><p>Looking ahead is free. Use Wait to spend a turn.</p></div>` : `<p class="deadline">Sheep pier floods after turn <b>8</b>.</p>`}`;
  $('forecast-toggle').onclick = () => {
    forecastOpen = !forecastOpen;
    render();
  };
  ($('undo') as HTMLButtonElement).disabled = busy || !session.history.length;
  ($('restart') as HTMLButtonElement).disabled = busy;
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
  $('shallow-depth').textContent = String(2 + s.tideLevel);
  $('deep-depth').textContent = String(3 + s.tideLevel);
  world.indicate(s, selected?.type === 'move' ? selected.to : undefined);
  world.setForecast(forecastOpen, nextRise?.level ?? s.tideLevel);
  if (focused && $(focused) && !($(focused) as HTMLButtonElement).disabled)
    $(focused).focus({ preventScroll: true });
  if (s.status !== 'playing') document.querySelector('.panel')!.scrollTop = 0;
}
world.onSelect = (id) => select({ type: 'move', to: id });
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
if (import.meta.env.DEV) {
  Object.assign(window, {
    __LAST_FERRY__: {
      getState: () => copy(session.state),
      getLegalActions: () => copy(legalActions(session.state)),
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
}
