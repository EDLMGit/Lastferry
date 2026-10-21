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
} from './game/rules';
import {
  actionLabel,
  actionCostCopy,
  passengerList,
  passageCopy,
  pierSafetyCopy,
  statusCopy,
  forecastCopy,
  previewCopy,
} from './ui/presentation';
import { Session } from './game/session';
import { World } from './scene/world';
import { Sound } from './audio/sound';

const experiment = new URLSearchParams(location.search).get('cove') === 'holding-pier';
const level = experiment ? holdingPier : baseline;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<main class="game ${experiment ? 'holding' : 'baseline'}"><section id="seascape" aria-label="${level.title}"><div id="world"></div><header class="masthead"><span>LAST FERRY</span><h1>${experiment ? 'The Holding Pier' : 'The First Crossing'}</h1></header><nav id="map-labels" aria-label="Map stops"></nav><nav class="tools" aria-label="Crossing controls"><button id="undo" aria-label="Undo last action">↶ <span>Undo</span></button><button id="restart" aria-label="Restart crossing" title="Restart crossing">↺</button><button id="sound"></button></nav><p class="portrait-note">Turn sideways for a wider view. All controls remain available below.</p></section><aside class="panel" aria-label="Ferry controls"><div id="hud"></div><div id="controls"></div><div id="preview" aria-live="polite" aria-atomic="true"></div><div id="secondary"><button id="wait" class="action quiet"><b>Wait</b><span>1 action</span></button><div id="forecast"></div><details id="rules-details"><summary>Actions and boat depth</summary><p id="action-cost">${actionCostCopy(level)}</p><p>Boat depth needed: empty = 1; 1–2 spaces = 2; 3–4 spaces = 3. A rabbit uses 1 space; Moss uses 2.</p></details><label class="cove-picker">Choose cove<select id="cove-picker"><option value="first-crossing" ${!experiment ? 'selected' : ''}>First Crossing · baseline</option><option value="holding-pier" ${experiment ? 'selected' : ''}>The Holding Pier</option></select></label></div></aside><div id="announcement" class="sr-only" role="status" aria-live="polite"></div></main>`;
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
  const next =
    session.state.status !== 'playing'
      ? $('undo')
      : document.querySelector<HTMLButtonElement>(
          '#local-actions button:not(:disabled), #travel-actions .route:not(:disabled)',
        );
  next?.focus();
}
function highlight(id?: string) {
  const destination = id && edgeTo(session.state, id, level) ? id : undefined;
  world.indicate(session.state, destination);
  for (const target of document.querySelectorAll<HTMLElement>('[data-destination]'))
    target.classList.toggle('highlighted', target.dataset.destination === destination);
}
function restoreHighlight() {
  const active = document.activeElement as HTMLElement;
  highlight(active?.dataset.destination ?? (selected?.type === 'move' ? selected.to : undefined));
}
function closePreview() {
  selected = null;
  render();
  if (keyboardInput) focusAvailable(previewReturnId);
}
function select(a: Action) {
  if (session.busy || session.state.status !== 'playing') return;
  if (a.type === 'move' && a.to === session.state.boatNodeId) return;
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
  $('announcement').textContent =
    `${session.state.turn} actions completed. ${statusCopy(session.state, level).headline}`;
}
function execute(a: Action | null) {
  if (!a) return;
  const transaction = session.commit(copy(a));
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
  if (to === session.state.boatNodeId) {
    $('announcement').textContent =
      `You are at ${nodeNames[to]}. Passenger actions are in the controls.`;
    return;
  }
  const a: Action = { type: 'move', to },
    proposed = preview(session.state, a, level);
  if (experiment && !proposed.error && proposed.state.status !== 'lost') execute(a);
  else select(a);
}
function navigationState(id: string) {
  if (id === session.state.boatNodeId) return 'current';
  const e = edgeTo(session.state, id, level);
  return !e
    ? 'nonadjacent'
    : e.baseDepth + session.state.tideLevel < draft(session.state, level)
      ? 'too-shallow'
      : 'available';
}
function bindTarget(button: HTMLElement, id: string, inspect = false) {
  button.onclick = () => (inspect ? select({ type: 'move', to: id }) : activateMove(id));
  button.onpointerenter = () => highlight(id);
  button.onpointerleave = restoreHighlight;
  button.onfocus = () => highlight(id);
  button.onblur = () => highlight(selected?.type === 'move' ? selected.to : undefined);
}
function renderMap() {
  const s = session.state;
  $('map-labels').innerHTML = level.nodes
    .map((n) => {
      const state = navigationState(n.id),
        current = state === 'current',
        unavailable = state === 'nonadjacent',
        blocked = state === 'too-shallow',
        loses =
          state === 'available' &&
          preview(s, { type: 'move', to: n.id }, level).state.status === 'lost';
      const label = current
        ? `You are at ${nodeNames[n.id]}`
        : unavailable
          ? `${nodeNames[n.id]}: no direct passage`
          : `Sail to ${nodeNames[n.id]}${loses ? '; flood warning' : ''}`;
      return `<button id="map-${n.id}" class="map-target" data-status="${state}" data-risk="${loses ? 'loss' : 'safe'}" data-destination="${n.id}" ${current ? 'aria-current="location"' : ''} aria-label="${label}" title="${passageCopy(s, n.id, level)}${loses ? ' Flood warning: inspect before confirming.' : ''}" ${session.busy || s.status !== 'playing' ? 'disabled' : ''}><span class="map-symbol" aria-hidden="true">${current ? '●' : unavailable ? '◇' : blocked ? '⊘' : loses ? '!' : '○'}</span><span><b>${current || unavailable ? nodeNames[n.id] : `Sail to ${nodeNames[n.id]}`}</b><span class="map-state">${current ? 'You are here' : unavailable ? 'No direct passage' : blocked ? 'Too shallow' : loses ? 'Flood warning · inspect' : 'Available · 1 action'}</span></span></button>`;
    })
    .join('');
  for (const n of level.nodes) bindTarget($(`map-${n.id}`), n.id);
  positionMap();
}
function render() {
  const focused = (document.activeElement as HTMLElement)?.id,
    s = session.state,
    p = pierAt(s, level),
    busy = session.busy;
  const panel = document.querySelector('.panel')!;
  panel.classList.toggle('selecting', !!selected);
  const facts = statusCopy(s, level);
  $('hud').innerHTML =
    `<div class="score-strip"><span><b data-testid="turn">${String(s.turn).padStart(2, '0')}</b> actions</span><span>Tide <b data-testid="tide">${s.tideLevel}</b></span><span>Home <b>${s.delivered.length}/3</b></span></div><div class="boat-summary"><strong>Boat needs depth ${draft(s, level)}</strong><span>${load(s, level)}/${level.rules.capacity} spaces</span></div><div class="situation ${facts.urgent ? 'urgent' : ''}"><strong id="status-headline">${facts.headline}</strong><p id="status-detail">${facts.detail}</p></div>`;
  if (s.status === 'won')
    $('controls').innerHTML =
      `<section class="ending"><span class="ending-icon" aria-hidden="true">☀</span><h2>Everyone home.</h2><p>Pip, Rue and Moss are safe at Harbor.</p><p>All 3 passengers delivered · ${s.turn} actions</p><p>Undo to revisit the crossing, or restart.</p></section>`;
  else if (s.status === 'lost')
    $('controls').innerHTML =
      `<section class="ending loss"><h2>A turn too late.</h2><p>${facts.headline}</p><p>Undo earlier moves, or restart to try a different plan.</p></section>`;
  else {
    const dry = p && s.tideLevel < p.elevation;
    const boarding = dry ? s.waitingByPier[p.id] : [],
      unloading = dry ? s.aboard : [];
    const local = (type: 'board' | 'unload', ids: string[]) => {
      const a: Action = { type, passengerIds: ids };
      const detail =
        type === 'board'
          ? `${passengerList(ids)} ${ids.length === 1 ? 'is' : 'are'} waiting here. 1 action.`
          : p!.isDeliveryPier
            ? 'Safe at Harbor. 1 action.'
            : `Wait at ${nodeNames[p!.nodeId]}; ${level.rules.tide.rises.every((r) => r.level < p!.elevation) ? 'stays safe' : pierSafetyCopy(s, p!.id, level)}. 1 action.`;
      return `<button id="${type}" class="action local-action" ${busy ? 'disabled' : ''}><span><b>${actionLabel(s, a, level)}</b><small>${detail}</small></span></button>`;
    };
    $('controls').innerHTML =
      `<section class="local-context"><h2 id="local-heading">${nodeNames[s.boatNodeId]}</h2><div id="local-actions">${boarding.length ? local('board', boarding) : ''}${unloading.length ? local('unload', unloading) : ''}${!boarding.length && !unloading.length ? `<p class="local-empty">${p && !dry ? 'This pier is flooded. The ferry can leave.' : p ? 'No passengers to transfer here.' : 'Buoy stop · choose the next passage.'}</p>` : ''}</div></section><p class="action-guide">${actionCostCopy(level)}</p><section id="travel-actions"><h3>Travel · 1 action per passage</h3><div class="action-list">${level.nodes
        .filter((n) => edgeTo(s, n.id, level))
        .map((n) => {
          const e = edgeTo(s, n.id, level)!,
            depth = e.baseDepth + s.tideLevel,
            blocked = depth < draft(s, level),
            loses = preview(s, { type: 'move', to: n.id }, level).state.status === 'lost';
          return `<div class="route-row"><button class="action route" id="route-${n.id}" data-destination="${n.id}" data-status="${blocked ? 'too-shallow' : 'available'}" ${busy ? 'disabled' : ''}><span><b>${blocked ? '⊘ ' : ''}Sail to ${nodeNames[n.id]}</b><small>Boat ${draft(s, level)} · passage ${depth}${blocked ? ': too shallow' : loses ? ': flood warning' : ': enough depth'}</small></span></button><button id="inspect-${n.id}" class="inspect-route" data-destination="${n.id}" aria-label="Inspect passage to ${nodeNames[n.id]} for free" ${busy ? 'disabled' : ''}>Inspect</button></div>`;
        })
        .join('')}</div></section>`;
    for (const n of level.nodes) {
      if ($(`route-${n.id}`)) bindTarget($(`route-${n.id}`), n.id);
      if ($(`inspect-${n.id}`)) bindTarget($(`inspect-${n.id}`), n.id, true);
    }
    if ($('board'))
      $('board').onclick = () =>
        select({ type: 'board', passengerIds: [...s.waitingByPier[p!.id]] });
    if ($('unload'))
      $('unload').onclick = () => select({ type: 'unload', passengerIds: [...s.aboard] });
  }
  const a = selected,
    copyText = a ? previewCopy(s, a, level) : null,
    pr = a ? preview(s, a, level) : null;
  let subset = '';
  if (a && (a.type === 'board' || a.type === 'unload')) {
    const ids = a.type === 'board' ? s.waitingByPier[p!.id] : s.aboard;
    subset = `<div class="passenger-options" role="group" aria-label="Passenger selection">${ids.map((id) => `<button id="passenger-${id}" aria-pressed="${a.passengerIds.includes(id)}"><b>${passengerNames[id].split(' ·')[0]}</b><span>${level.passengers.find((p) => p.id === id)!.slots} ${level.passengers.find((p) => p.id === id)!.slots === 1 ? 'space' : 'spaces'}</span></button>`).join('')}</div>`;
  }
  $('preview').innerHTML = busy
    ? `<div id="transition-status" class="busy" role="status" tabindex="-1">Finishing this action…</div>`
    : a && copyText
      ? `<section class="preview-card ${copyText.error || pr?.state.status === 'lost' ? 'warning' : ''}"><div class="preview-head"><div><span>Free inspection</span><h3>${actionLabel(s, a, level)}</h3></div><button id="cancel" aria-label="Close preview">×</button></div><div class="preview-scroll">${subset}<p class="requirement">${copyText.error ?? copyText.requirement}</p><p class="consequence">${copyText.consequence}</p><p class="preview-cost">${copyText.error ? 'No action spent.' : `Costs 1 action. Result: ${pr!.state.turn} actions · tide ${pr!.state.tideLevel} · ${load(pr!.state, level)}/${level.rules.capacity} spaces.`}</p></div><button id="commit" class="commit" ${copyText.error ? 'disabled' : ''}>${copyText.error ? 'Action unavailable' : `Confirm · ${actionLabel(s, a, level)}`}</button></section>`
      : '';
  if ($('cancel')) $('cancel').onclick = closePreview;
  if ($('commit')) $('commit').onclick = () => execute(selected);
  if (a && (a.type === 'board' || a.type === 'unload'))
    for (const id of a.type === 'board' ? s.waitingByPier[p!.id] : s.aboard)
      $(`passenger-${id}`).onclick = () => {
        selected = {
          ...a,
          passengerIds: a.passengerIds.includes(id)
            ? a.passengerIds.filter((v) => v !== id)
            : [...a.passengerIds, id],
        };
        render();
      };
  const forecast = forecastCopy(s, level);
  $('forecast').innerHTML =
    `<button id="forecast-toggle" aria-expanded="${forecastOpen}" class="forecast-button">Tide and pier forecast <span>${forecastOpen ? '−' : '+'}</span></button>${forecastOpen ? `<div class="forecast-detail"><b>${forecast.headline}</b><p>${forecast.detail}</p><p>Inspection is free. Wait costs 1 action.</p></div>` : ''}`;
  $('forecast-toggle').onclick = () => {
    forecastOpen = !forecastOpen;
    render();
  };
  ($('wait') as HTMLButtonElement).disabled = busy || s.status !== 'playing';
  $('wait').onclick = () => select({ type: 'wait' });
  ($('undo') as HTMLButtonElement).disabled = busy || !session.history.length;
  ($('restart') as HTMLButtonElement).disabled = busy;
  ($('cove-picker') as HTMLSelectElement).disabled = busy;
  $('undo').onclick = () => {
    if (session.undo()) {
      selected = null;
      world.sync(session.state);
      render();
      panel.scrollTop = 0;
      $('announcement').textContent = `Undid action. ${session.state.turn} actions completed.`;
    }
  };
  $('restart').onclick = () => {
    if (session.restart()) {
      selected = null;
      forecastOpen = false;
      world.sync(session.state);
      render();
      panel.scrollTop = 0;
    }
  };
  $('sound').textContent = sound.muted ? '♫ Off' : '♫ On';
  $('sound').setAttribute('aria-label', sound.muted ? 'Unmute sound' : 'Mute sound');
  $('sound').setAttribute('aria-pressed', String(sound.muted));
  $('sound').onclick = () => {
    sound.toggle();
    render();
  };
  renderMap();
  world.setForecast(
    forecastOpen,
    level.rules.tide.rises.find((r) => r.afterTurn > s.turn)?.level ?? s.tideLevel,
  );
  highlight(selected?.type === 'move' ? selected.to : undefined);
  if (focused && $(focused) && !($(focused) as HTMLButtonElement).disabled)
    $(focused).focus({ preventScroll: true });
  if (s.status !== 'playing') panel.scrollTop = 0;
}
function positionMap() {
  const small = matchMedia('(max-height: 480px) and (min-width: 701px)').matches;
  const sea = $('seascape'),
    width = sea.clientWidth,
    height = sea.clientHeight;
  for (const n of level.nodes) {
    const target = $(`map-${n.id}`);
    if (!target) continue;
    let point;
    if (experiment)
      point = world.project([
        n.positionXZ[0],
        n.positionXZ[1] +
          (n.id === 'stone' || n.id === 'rabbit-pier' ? -3.8 : n.id === 'shallows' ? 1.05 : 1.65),
      ]);
    else
      point = world.project([
        n.positionXZ[0],
        n.positionXZ[1] + (n.id === 'cut' ? -2.8 : n.id.startsWith('outer') ? 0.7 : 1.5),
      ]);
    const half = target.offsetWidth / 2;
    target.style.left = `${Math.max(half + 6, Math.min(width - half - 6, point.x))}px`;
    target.style.top = `${Math.max(small ? 76 : 130, Math.min(height - target.offsetHeight / 2 - 8, point.y + world.host.offsetTop))}px`;
  }
}
world.onSelect = activateMove;
($('cove-picker') as HTMLSelectElement).onchange = (e) => {
  location.search = `?cove=${(e.target as HTMLSelectElement).value}`;
};
new ResizeObserver(positionMap).observe(world.host);
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
      getNavigationStatus: () => world.navigationPresentation(),
      getMetrics: () => world.metrics(),
    },
  });
