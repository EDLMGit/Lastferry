import './style.css';
import { level as baseline, holdingPier, bellwater, levelNames } from './levels/level';
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
  objectiveCopy,
  passageCopy,
  statusCopy,
  forecastCopy,
  previewCopy,
  passengerList,
} from './ui/presentation';
import { Session } from './game/session';
import { World } from './scene/world';
import { Sound } from './audio/sound';
import {
  restrainedTiming,
  slowerTiming,
  type CompletionReason,
  type TransitionPlan,
} from './scene/transitions';
import { waterPresets, type WaterTuning } from './scene/water';
import { placeLocalCard, overlaps, type Rectangle } from './ui/placement';
import { locationFacts } from './ui/location';

const cove = new URLSearchParams(location.search).get('cove');
const level = cove === 'first-crossing' ? baseline : cove === 'bellwater' ? bellwater : holdingPier;
const experiment = level.id === 'holding-pier';
const isBellwater = level.id === 'bellwater';
const { nodeNames, passengerNames } = levelNames(level);
const homeNodeId = level.piers.find((pier) => pier.id === level.objective.deliveryPierId)!.nodeId;
const title = level.id === baseline.id ? 'The First Crossing' : level.title;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<main class="game ${experiment ? 'holding' : isBellwater ? 'bellwater' : 'baseline'}"><section id="seascape" aria-label="${level.title}" aria-busy="false"><div id="world"></div><header class="hud"><div class="identity"><h1>${title}</h1><p id="objective"></p></div><div id="readout" aria-label="Crossing progress"></div><nav class="tools" aria-label="Crossing controls"><button id="undo">↶ Undo</button><button id="wait">Wait <span>· 1 action</span></button><button id="menu">Menu</button><button id="sound-toggle" aria-label="Mute sound" aria-pressed="false">♫</button></nav></header><nav id="map-labels" aria-label="Map stops"></nav><section id="local-context" role="region" aria-labelledby="local-heading" hidden></section><p id="selection-hint">Select a place to see its options.</p><svg id="selection-leader" aria-hidden="true"></svg><button id="status-toggle" aria-haspopup="dialog" aria-label="Open tide and pier forecast"></button><p id="transition-status" role="status" tabindex="-1" hidden>Finishing this action…</p><p class="portrait-note">Turn sideways for a wider view.</p></section><div id="announcement" class="sr-only" role="status" aria-live="polite"></div></main><dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog>`;
const $ = (id: string) => document.getElementById(id)!;
const session = new Session(level),
  sound = new Sound(),
  world = new World($('world'), session.state, level);
sound.reconcileState(session.state, level);
const dialog = $('dialog') as HTMLDialogElement;
type DialogMode = 'action' | 'forecast' | 'menu' | 'terminal';
let mode: DialogMode | null = null,
  selected: Action | null = null,
  returnId = '',
  keyboardInput = false;
let locationSelection: string | null = null;
let emphasis: string | undefined;
let selectionOrigin: { x: number; y: number } | null = null;
let actionOrigin: { x: number; y: number } | null = null;
let lastPointer: { x: number; y: number; control: Element | null } | null = null;
let cardPlacement: Rectangle | null = null;
let protectedBounds: Rectangle[] = [];
let fallback: ReturnType<typeof setTimeout> | undefined;
let closingFence: {
  rect: DOMRect;
  until: number;
  x: number;
  y: number;
  scope: 'commit' | 'dismiss';
} | null = null;
let transitionSerial = 0;
let activeTransition: {
  id: number;
  action: Action;
  plan: TransitionPlan;
  startedAt: number;
} | null = null;
let lastTransition: {
  id: number;
  action: Action;
  plan: TransitionPlan;
  startedAt: number;
  finishedAt: number;
  reason: CompletionReason;
} | null = null;
const completionCounts: Record<CompletionReason, number> = {
  complete: 0,
  recovery: 0,
  visibility: 0,
  cancelled: 0,
  error: 0,
};

function renderSound() {
  const control = $('sound-toggle');
  control.setAttribute('aria-label', sound.muted ? 'Unmute sound' : 'Mute sound');
  control.setAttribute('aria-pressed', String(sound.muted));
  control.title = `Sound ${sound.muted ? 'off' : 'on'}`;
  control.textContent = sound.muted ? '♩' : '♫';
}
function toggleSound() {
  const changed = sound.toggle();
  renderSound();
  if (mode === 'menu') renderDialog();
  void changed.then(renderSound).catch(renderSound);
}

function available(preferred?: string) {
  const target = preferred ? $(preferred) : null;
  if (
    target &&
    !(target as HTMLButtonElement).disabled &&
    target.getClientRects().length &&
    !target.closest('[inert]')
  )
    return target;
  if (locationSelection && !$('local-context').hidden) return $('local-heading');
  return $(`map-${session.state.boatNodeId}`) ?? $('menu');
}
function focusAvailable(preferred?: string) {
  available(preferred).focus({ preventScroll: true });
}
function blocked() {
  return session.busy || dialog.open;
}
function highlight(id?: string) {
  emphasis = id;
  world.indicate(session.state, locationSelection ?? undefined, id);
  for (const target of document.querySelectorAll<HTMLElement>('[data-destination]'))
    target.classList.toggle('highlighted', target.dataset.destination === id);
}
function restoreHighlight() {
  if (dialog.open) highlight(selected?.type === 'move' ? selected.to : undefined);
  else highlight((document.activeElement as HTMLElement)?.dataset.destination);
}
function closeDialog(restore = true, fence = false) {
  if (fence && !keyboardInput && $('cancel'))
    closingFence = {
      scope: 'dismiss',
      rect: $('cancel').getBoundingClientRect(),
      until: performance.now() + 180,
      x: 0,
      y: 0,
    };
  dialog.close();
  mode = null;
  selected = null;
  world.setForecast(false, session.state.tideLevel);
  renderLocation();
  positionMap();
  if (restore) focusAvailable(returnId);
  restoreHighlight();
}
function openDialog(next: DialogMode, action?: Action, trigger?: string) {
  if (blocked()) return;
  if (next === 'action' && session.state.status !== 'playing') return;
  returnId = trigger ?? (document.activeElement as HTMLElement)?.id ?? '';
  mode = next;
  selected = action ?? null;
  renderDialog();
  dialog.showModal();
  $('local-context').inert = true;
  (next === 'terminal' ? $('terminal-undo') : $('cancel')).focus();
  positionDialog();
  restoreHighlight();
}
function header(title: string, eyebrow?: string) {
  return `<header class="dialog-head"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2 id="dialog-title">${title}</h2></div><button id="cancel" aria-label="Close dialog">×</button></header>`;
}
function renderDialog() {
  if (!mode) return;
  const oldFocus = (document.activeElement as HTMLElement)?.id;
  const s = session.state,
    p = pierAt(s, level);
  dialog.dataset.mode = mode;
  if (mode === 'action' && selected) {
    const a = selected,
      proposed = preview(s, a, level),
      text = previewCopy(s, a, level);
    const ids = a.type === 'board' ? s.waitingByPier[p!.id] : a.type === 'unload' ? s.aboard : [];
    const choices =
      a.type === 'board' || a.type === 'unload'
        ? `<div class="passenger-options" role="group" aria-label="Passenger selection">${ids.map((id) => `<button id="passenger-${id}" aria-pressed="${a.passengerIds.includes(id)}"><b>${passengerNames[id].split(' ·')[0]}</b><span> · ${level.passengers.find((p) => p.id === id)!.slots} ${level.passengers.find((p) => p.id === id)!.slots === 1 ? 'space' : 'spaces'}</span></button>`).join('')}</div>`
        : '';
    $('dialog-content').innerHTML =
      `${header(actionLabel(s, a, level), 'Inspection · no action spent')}<div id="preview" class="dialog-body ${proposed.error || proposed.state.status === 'lost' ? 'warning' : ''}" aria-live="polite" aria-atomic="true">${choices}<p class="requirement">${text.error ?? text.requirement}</p>${text.consequence ? `<p class="consequence">${text.consequence}</p>` : ''}${!proposed.error ? `<p class="preview-result">Boat ${load(proposed.state, level)}/${level.rules.capacity} spaces · tide ${s.tideLevel}${s.tideLevel !== proposed.state.tideLevel ? ` → ${proposed.state.tideLevel}` : ''}</p>` : ''}</div><footer class="dialog-footer"><button id="commit" ${proposed.error ? 'disabled' : ''}>${proposed.error ? 'Action unavailable' : 'Confirm · 1 action'}</button></footer>`;
    if (a.type === 'board' || a.type === 'unload')
      for (const id of ids)
        $(`passenger-${id}`).onclick = () => {
          selected = {
            ...a,
            passengerIds: a.passengerIds.includes(id)
              ? a.passengerIds.filter((v) => v !== id)
              : [...a.passengerIds, id],
          };
          renderDialog();
        };
    $('commit').onclick = (e) => {
      if (mode === 'action' && selected && !session.busy) {
        if (e.isTrusted && e.detail > 0)
          closingFence = {
            scope: 'commit',
            rect: $('commit').getBoundingClientRect(),
            until: performance.now() + 180,
            x: e.clientX,
            y: e.clientY,
          };
        execute(selected);
      }
    };
  } else if (mode === 'forecast') {
    const f = forecastCopy(s, level);
    $('dialog-content').innerHTML =
      `${header('Tide and pier forecast', 'Inspection · no action spent')}<div class="dialog-body forecast-detail"><strong>${f.headline}</strong><p>${f.detail}</p><p>Each accepted action advances the tide schedule. Thinking and inspection do not.</p></div>`;
    world.setForecast(
      true,
      level.rules.tide.rises.find((r) => r.afterTurn > s.turn)?.level ?? s.tideLevel,
    );
  } else if (mode === 'menu') {
    const sheep = level.passengers.find((p) => p.species === 'sheep')!;
    $('dialog-content').innerHTML =
      `${header('Crossing menu')}<div class="dialog-body menu-body"><div class="menu-actions"><button id="restart">Restart crossing</button><button id="sound" aria-pressed="${sound.muted}" aria-label="${sound.muted ? 'Unmute sound' : 'Mute sound'}">Sound ${sound.muted ? 'off' : 'on'}</button></div><label class="cove-picker">Choose cove<select id="cove-picker">${[baseline, holdingPier, bellwater].map((l) => `<option value="${l.id}" ${l.id === level.id ? 'selected' : ''}>${l.title}${l.id === baseline.id ? ' · baseline' : ''}</option>`).join('')}</select></label><details id="help-details"><summary>How to play · actions and depth</summary><p>${actionCostCopy(level)}</p><p>Select a named place, island, pier or landmark to see its options for free. Choose Sail to travel one passage. Select the ferry for its current place. Passenger actions open a subset preview; choose names, then Confirm.</p><p>Boat depth needed: empty = 1; 1–2 spaces = 2; 3–4 spaces = 3. Each rabbit uses 1 space; ${passengerList([sheep.id], level)} uses ${sheep.slots}. A passage must be at least as deep as the boat needs.</p><p>Boarding and unloading happen before the tide rises. Use the status button for the tide and pier forecast. Undo earlier actions or restart to recover from a losing plan.</p><p>Tab and Shift+Tab move between controls; Enter or Space activates them. Escape closes a dialog first; press it again to close the location card. Selection never spends an action.</p></details></div>`;
    $('restart').onclick = restart;
    $('sound').onclick = toggleSound;
    ($('cove-picker') as HTMLSelectElement).onchange = (e) => {
      location.search = `?cove=${(e.target as HTMLSelectElement).value}`;
    };
  } else {
    const f = statusCopy(s, level),
      won = s.status === 'won',
      next = won && experiment;
    $('dialog-content').innerHTML =
      `${header(won ? (isBellwater ? 'Bellwater is safe.' : 'Everyone home.') : 'A turn too late.')}<div class="dialog-body ending ${won ? '' : 'loss'}"><p>${won ? (isBellwater ? `${passengerList(s.delivered, level)} are safe at Harbor. ${s.turn} actions completed.` : `${level.objective.requiredPassengerIds.length} passengers delivered in ${s.turn} actions. All are safe at ${nodeNames[level.piers.find((p) => p.id === level.objective.deliveryPierId)!.nodeId]}.`) : f.headline}</p><p>${next ? 'Further along the coast, two piers still have their lights on.' : won ? 'Undo to revisit the crossing, or restart.' : 'Undo earlier moves, or restart to try a different plan.'}</p></div><footer class="dialog-footer terminal-actions">${next ? '<button id="next-cove">Next cove</button>' : ''}<button id="terminal-undo">↶ Undo last action</button><button id="terminal-restart">Restart</button></footer>`;
    if (next)
      $('next-cove').onclick = () => {
        location.search = '?cove=bellwater';
      };
    $('terminal-undo').onclick = undo;
    $('terminal-restart').onclick = restart;
  }
  $('cancel').onclick = (e) => {
    e.stopPropagation();
    closeDialog(true, true);
    if (closingFence) {
      closingFence.x = e.clientX;
      closingFence.y = e.clientY;
    }
  };
  if (dialog.open) {
    const target = oldFocus ? $(oldFocus) : null;
    (target && dialog.contains(target) ? target : $('cancel')).focus({ preventScroll: true });
  }
  positionDialog();
}
function finish(id: number, reason: CompletionReason) {
  if (!activeTransition || activeTransition.id !== id || !session.busy) return;
  lastTransition = { ...activeTransition, finishedAt: performance.now(), reason };
  activeTransition = null;
  completionCounts[reason]++;
  clearTimeout(fallback);
  sound.stopTravel();
  if (reason !== 'complete') sound.resetActionEffects();
  sound.settleArrangement();
  session.finish();
  render();
  $('announcement').textContent =
    `${session.state.turn} actions completed. ${statusCopy(session.state, level).headline}`;
  if (session.state.status !== 'playing') openDialog('terminal', undefined, 'undo');
  else focusAvailable(returnId);
}
function execute(action: Action) {
  if (session.busy) return;
  const transaction = session.commit(copy(action));
  if (!transaction) return;
  actionOrigin = !keyboardInput && lastPointer ? { x: lastPointer.x, y: lastPointer.y } : null;
  sound.reconcileState(transaction.after, level, true);
  if (action.type === 'move') locationSelection = action.to;
  emphasis = undefined;
  const plan = world.plan(transaction.before, transaction.after, action);
  const id = ++transitionSerial;
  activeTransition = { id, action: copy(action), plan, startedAt: performance.now() };
  if (dialog.open) closeDialog(false);
  render();
  if (keyboardInput) $('transition-status').focus();
  fallback = setTimeout(() => {
    world.cancel('recovery');
    if (session.busy) {
      try {
        world.sync(session.state);
      } finally {
        finish(id, 'recovery');
      }
    }
  }, plan.recoveryDelay);
  try {
    world.animate(
      transaction.before,
      transaction.after,
      action,
      (reason) => finish(id, reason),
      plan,
    );
  } catch {
    try {
      world.sync(session.state);
    } finally {
      finish(id, 'error');
    }
  }
}
function clearLocation(restore = false) {
  if (blocked()) return;
  const previous = locationSelection;
  locationSelection = null;
  selectionOrigin = null;
  actionOrigin = null;
  renderMap();
  renderLocation();
  positionMap();
  highlight();
  if (restore || $('local-context').contains(document.activeElement))
    focusAvailable(previous ? `map-${previous}` : undefined);
}
function selectLocation(id: string) {
  if (
    blocked() ||
    session.state.status !== 'playing' ||
    !level.nodes.some((node) => node.id === id)
  )
    return;
  closingFence = null;
  actionOrigin = null;
  if (locationSelection !== id) {
    locationSelection = id;
    selectionOrigin = !keyboardInput && lastPointer ? { x: lastPointer.x, y: lastPointer.y } : null;
    renderMap();
    renderLocation();
    positionMap();
  }
  highlight();
  $('local-heading').focus({ preventScroll: true });
  $('announcement').textContent = `${nodeNames[id]} selected. Inspection is free.`;
}
function localContext() {
  selectLocation(session.state.boatNodeId);
}
function bindTarget(button: HTMLElement, id: string) {
  button.onclick = (event) => {
    event.stopPropagation();
    selectLocation(id);
  };
  button.onpointerenter = () => {
    if (!blocked()) highlight(id);
  };
  button.onpointerleave = restoreHighlight;
  button.onfocus = () => {
    if (!blocked()) highlight(id);
  };
  button.onblur = restoreHighlight;
}
function renderMap() {
  const s = session.state;
  $('map-labels').innerHTML =
    '<svg id="map-leaders" aria-hidden="true"></svg>' +
    level.nodes
      .map((n) => {
        const facts = locationFacts(s, n.id, level);
        const status = facts.current
          ? 'current'
          : facts.relation === 'remote'
            ? 'nonadjacent'
            : facts.status === 'too-shallow'
              ? 'too-shallow'
              : 'available';
        const description = facts.current
          ? 'current location'
          : facts.relation === 'remote'
            ? 'no direct passage'
            : facts.status === 'too-shallow'
              ? 'adjacent, too shallow'
              : facts.wouldLose
                ? 'adjacent, flood warning'
                : 'adjacent passage available';
        return `<div id="stop-${n.id}" class="map-stop" data-adjacent="${facts.relation === 'adjacent'}"><button id="map-${n.id}" class="map-target" data-status="${status}" data-risk="${facts.wouldLose ? 'loss' : 'safe'}" data-destination="${n.id}" aria-expanded="${locationSelection === n.id}" aria-controls="local-context" ${facts.current ? 'aria-current="location"' : ''} aria-label="Select ${facts.name}; ${description}${facts.home ? '; Home, delivery destination' : ''}" title="${description}" ${session.busy || s.status !== 'playing' ? 'disabled' : ''}><span class="map-symbol" aria-hidden="true">${facts.current ? '◉' : facts.relation === 'remote' ? '◇' : facts.status === 'too-shallow' ? '⊘' : facts.wouldLose ? '!' : '○'}</span><b>${facts.name}${facts.home ? ' · Home' : ''}</b></button></div>`;
      })
      .join('');
  for (const node of level.nodes) bindTarget($(`map-${node.id}`), node.id);
}
function renderLocation() {
  const card = $('local-context');
  const visible = !!locationSelection && !session.busy && session.state.status === 'playing';
  card.hidden = !visible;
  card.inert = dialog.open || session.busy;
  $('selection-hint').hidden =
    !!locationSelection || session.busy || session.state.status !== 'playing';
  if (!visible) {
    $('selection-leader').innerHTML = '';
    return;
  }
  const facts = locationFacts(session.state, locationSelection!, level);
  card.dataset.location = facts.id;
  card.dataset.status = facts.status;
  const paragraph = (text: string, className = '') =>
    text ? `<p class="${className}">${text}</p>` : '';
  const details = facts.wouldLose
    ? paragraph(facts.consequence, 'location-warning') + paragraph(facts.passage, 'requirement')
    : facts.current
      ? paragraph(facts.aboardCopy) +
        paragraph(facts.waiting.length ? facts.waitingCopy : '') +
        paragraph(facts.safety) +
        paragraph(facts.transferNote)
      : paragraph(facts.passage, 'requirement') +
        paragraph(facts.limitation && !facts.passage ? facts.limitation : '') +
        paragraph(facts.waiting.length ? facts.waitingCopy : '') +
        paragraph(facts.safety) +
        paragraph(facts.consequence, facts.wouldLose ? 'location-warning' : '');
  const actions = facts.current
    ? (facts.board ? `<button id="board">${facts.boardLabel}</button>` : '') +
      (facts.unload ? `<button id="unload">${facts.unloadLabel}</button>` : '')
    : facts.move
      ? `<button id="sail" data-risk="${facts.wouldLose ? 'loss' : 'safe'}" ${facts.canSail ? '' : 'disabled'}>Sail · 1 action</button>`
      : '';
  card.innerHTML = `<header class="location-head"><div><p class="location-role">${facts.current ? 'You are here' : facts.home ? 'Home · delivery destination' : facts.relation === 'remote' ? 'Free inspection' : facts.wouldLose ? 'Flood warning' : 'Direct passage'}</p><h2 id="local-heading" tabindex="-1">${facts.name}${facts.home && facts.current ? ' · Home' : ''}</h2></div><button id="close-location" aria-label="Close location card">×</button></header><div id="location-facts">${details}</div>${actions ? `<footer id="local-actions">${actions}</footer>` : ''}`;
  $('close-location').onclick = (event) => {
    event.stopPropagation();
    if (!keyboardInput)
      closingFence = {
        scope: 'dismiss',
        rect: $('close-location').getBoundingClientRect(),
        until: performance.now() + 180,
        x: event.clientX,
        y: event.clientY,
      };
    clearLocation(true);
  };
  if ($('board'))
    $('board').onclick = () =>
      openDialog('action', { type: 'board', passengerIds: [...facts.boardOptions] }, 'board');
  if ($('unload')) $('unload').onclick = () => openDialog('action', facts.unload!, 'unload');
  if ($('sail'))
    $('sail').onclick = (event) => {
      event.stopPropagation();
      if (blocked() || !facts.move || !facts.canSail) return;
      if (facts.wouldLose) openDialog('action', facts.move, 'sail');
      else {
        if (!keyboardInput)
          closingFence = {
            scope: 'commit',
            rect: $('sail').getBoundingClientRect(),
            until: performance.now() + 180,
            x: event.clientX,
            y: event.clientY,
          };
        returnId = 'local-heading';
        execute(facts.move);
      }
    };
}
function render() {
  const s = session.state,
    p = pierAt(s, level),
    facts = statusCopy(s, level),
    objective = objectiveCopy(s, level);
  $('objective').textContent = objective.headline;
  $('readout').innerHTML =
    `<strong id="boat-summary">Depth ${draft(s, level)} · ${load(s, level)}/${level.rules.capacity} spaces</strong><span><b data-testid="turn">${String(s.turn).padStart(2, '0')}</b> actions · Tide <b data-testid="tide">${s.tideLevel}</b> · <b id="progress">${objective.progress}</b></span>`;
  $('status-toggle').innerHTML =
    `<span class="status-symbol" aria-hidden="true">${facts.urgent ? '!' : '≈'}</span><span><strong id="status-headline">${facts.headline}</strong>${facts.detail ? `<span id="status-detail">${facts.detail}</span>` : '<span id="status-detail"></span>'}</span><span class="forecast-label">Forecast</span>`;
  $('status-toggle').classList.toggle('urgent', facts.urgent);
  $('status-toggle').onclick = () => openDialog('forecast', undefined, 'status-toggle');
  renderLocation();
  ($('undo') as HTMLButtonElement).disabled = session.busy || !session.history.length;
  ($('wait') as HTMLButtonElement).disabled = session.busy || s.status !== 'playing';
  ($('menu') as HTMLButtonElement).disabled = session.busy;
  ($('status-toggle') as HTMLButtonElement).disabled = session.busy;
  $('undo').onclick = () => {
    if (!blocked()) undo();
  };
  $('wait').onclick = () => openDialog('action', { type: 'wait' }, 'wait');
  $('menu').onclick = () => openDialog('menu', undefined, 'menu');
  $('sound-toggle').onclick = toggleSound;
  renderSound();
  $('transition-status').textContent =
    activeTransition?.action.type === 'move'
      ? `Sailing to ${nodeNames[activeTransition.action.to]}.`
      : 'Finishing this action…';
  $('transition-status').hidden = !session.busy;
  $('seascape').setAttribute('aria-busy', String(session.busy));
  renderMap();
  positionMap();
  restoreHighlight();
}
function undo() {
  if (session.busy) return;
  if (dialog.open) closeDialog(false);
  if (session.undo()) {
    locationSelection = null;
    selectionOrigin = null;
    actionOrigin = null;
    sound.resetActionEffects();
    sound.reconcileState(session.state, level);
    world.sync(session.state);
    render();
    focusAvailable('undo');
    $('announcement').textContent = `Undid action. ${session.state.turn} actions completed.`;
  }
}
function restart() {
  if (session.busy) return;
  if (dialog.open) closeDialog(false);
  if (session.restart()) {
    locationSelection = null;
    selectionOrigin = null;
    actionOrigin = null;
    sound.resetActionEffects();
    sound.reconcileState(session.state, level);
    world.sync(session.state);
    render();
    focusAvailable('menu');
  }
}
function positionDialog() {
  const destination = selected?.type === 'move' ? selected.to : session.state.boatNodeId;
  const node = level.nodes.find((n) => n.id === destination)!;
  const point = world.project(node.positionXZ);
  dialog.dataset.side = point.x > world.host.clientWidth * 0.5 ? 'left' : 'right';
}
function positionMap() {
  const host = world.host,
    canvas = host.getBoundingClientRect();
  const frame = world.frameStatus();
  const atPage = (r: Rectangle): Rectangle => ({
    left: r.left + canvas.left,
    right: r.right + canvas.left,
    top: r.top + canvas.top,
    bottom: r.bottom + canvas.top,
  });
  const figures = [
    frame.boat,
    ...frame.passengers,
    frame.lighthouse,
    ...(frame.bell ? [frame.bell] : []),
  ].map(atPage);
  const chrome = [
    document.querySelector<HTMLElement>('.hud')!,
    $('status-toggle'),
    ...(!$('selection-hint').hidden ? [$('selection-hint')] : []),
  ].map((element) => element.getBoundingClientRect());
  const bounds = { left: 8, top: 8, right: innerWidth - 8, bottom: innerHeight - 8 };
  const placed: Rectangle[] = [];
  const leaders: string[] = [];
  for (const n of level.nodes) {
    const group = $(`stop-${n.id}`);
    if (!group) continue;
    const point = world.project(n.positionXZ),
      x = point.x + canvas.left,
      y = point.y + canvas.top;
    const w = group.offsetWidth,
      h = group.offsetHeight;
    const preferred: [number, number][] = [
      [x - w / 2, y + 18],
      [x - w / 2, y - h - 18],
      [x + 22, y - h / 2],
      [x - w - 22, y - h / 2],
    ];
    const choice = placeLocalCard(
      w,
      h,
      bounds,
      [...chrome, ...figures, ...placed],
      preferred,
      preferred[0],
    ) ?? {
      left: Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)),
      top: Math.max(8, Math.min(innerHeight - h - 8, y + 18)),
      right: 0,
      bottom: 0,
    };
    choice.right = choice.left + w;
    choice.bottom = choice.top + h;
    group.style.left = `${choice.left}px`;
    group.style.top = `${choice.top}px`;
    placed.push(choice);
    const centerX = Math.max(choice.left, Math.min(choice.right, x)),
      centerY = Math.max(choice.top, Math.min(choice.bottom, y));
    if (Math.hypot(centerX - x, centerY - y) > 20)
      leaders.push(`<line x1="${x}" y1="${y}" x2="${centerX}" y2="${centerY}" />`);
  }
  if ($('map-leaders')) $('map-leaders').innerHTML = leaders.join('');
  cardPlacement = null;
  if (locationSelection && !$('local-context').hidden) {
    const local = $('local-context'),
      node = level.nodes.find((node) => node.id === locationSelection)!;
    const point = world.project(node.positionXZ),
      x = point.x + canvas.left,
      y = point.y + canvas.top;
    const places = frame.places.map((place) => atPage(place));
    const origin = [selectionOrigin, actionOrigin].flatMap((point) =>
      point
        ? [{ left: point.x - 30, right: point.x + 30, top: point.y - 30, bottom: point.y + 30 }]
        : [],
    );
    protectedBounds = [...chrome, ...figures, ...places, ...placed, ...origin];
    for (const width of [280, 248, 224]) {
      local.style.width = `${width}px`;
      const height = local.offsetHeight;
      const choice = placeLocalCard(
        width,
        height,
        bounds,
        protectedBounds,
        [
          [x - width / 2, y + 70],
          [x + 80, y - height / 2],
          [x - width - 80, y - height / 2],
          [x - width / 2, y - height - 80],
        ],
        [x - width / 2, y + 70],
      );
      if (choice) {
        cardPlacement = choice;
        break;
      }
    }
    if (!cardPlacement) {
      const width = local.offsetWidth,
        height = local.offsetHeight;
      cardPlacement = placeLocalCard(
        width,
        height,
        bounds,
        [...chrome, ...figures, ...placed, ...origin],
        [
          [8, innerHeight - height - 8],
          [innerWidth - width - 8, innerHeight - height - 8],
        ],
      ) ?? {
        left: 8,
        top: Math.max(chrome[0].bottom + 8, innerHeight - height - 8),
        right: 8 + width,
        bottom: innerHeight - 8,
      };
    }
    local.style.left = `${cardPlacement.left}px`;
    local.style.top = `${cardPlacement.top}px`;
    const endX = Math.max(cardPlacement.left, Math.min(cardPlacement.right, x)),
      endY = Math.max(cardPlacement.top, Math.min(cardPlacement.bottom, y));
    const distance = Math.hypot(endX - x, endY - y);
    if (distance <= 90) {
      $('selection-leader').innerHTML = `<line x1="${x}" y1="${y}" x2="${endX}" y2="${endY}" />`;
    } else {
      const dx = ((endX - x) / distance) * 24,
        dy = ((endY - y) / distance) * 24;
      $('selection-leader').innerHTML =
        `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" /><line x1="${endX - dx}" y1="${endY - dy}" x2="${endX}" y2="${endY}" />`;
    }
  } else {
    protectedBounds = [];
    $('selection-leader').innerHTML = '';
  }
  positionDialog();
}
world.onSelect = selectLocation;
world.onCurrent = localContext;
world.onClear = () => clearLocation();
world.onPresentationStart = (action) => {
  if (action.type === 'move') sound.startTravel();
  else if (action.type !== 'unload' || session.state.status !== 'won') sound.play(action.type);
};
world.onArrival = () => {
  sound.delivery();
  sound.settleArrangement();
};
new ResizeObserver(positionMap).observe(world.host);
dialog.addEventListener('cancel', (e) => {
  e.preventDefault();
  closeDialog(true);
});
dialog.addEventListener('click', (e) => e.stopPropagation());
dialog.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const controls = [
    ...dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), select, summary, a[href], [tabindex="0"]',
    ),
  ].filter((e) => e.getClientRects().length);
  const first = controls[0],
    last = controls.at(-1);
  if (!first || !last) return;
  if (
    e.shiftKey &&
    (document.activeElement === first || !dialog.contains(document.activeElement))
  ) {
    e.preventDefault();
    last.focus();
  } else if (
    !e.shiftKey &&
    (document.activeElement === last || !dialog.contains(document.activeElement))
  ) {
    e.preventDefault();
    first.focus();
  }
});
document.addEventListener(
  'keydown',
  (e) => {
    if (['Tab', 'Enter', ' ', 'Escape'].includes(e.key)) keyboardInput = true;
    if (e.repeat && ['Enter', ' '].includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (e.key === 'Escape' && !dialog.open && locationSelection) {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearLocation(true);
      return;
    }
    if (e.isTrusted && !e.repeat && ['Enter', ' '].includes(e.key)) void sound.activate();
  },
  true,
);
document.addEventListener(
  'pointerdown',
  (e) => {
    keyboardInput = false;
    lastPointer = { x: e.clientX, y: e.clientY, control: (e.target as Element).closest('button') };
    if (e.isTrusted) void sound.activate();
  },
  true,
);
document.addEventListener(
  'click',
  (e) => {
    const commit = (e.target as Element).closest('#sail, #commit, #board, #unload');
    if (commit && e.isTrusted && e.detail > 0 && lastPointer?.control !== commit) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (
      closingFence &&
      performance.now() < closingFence.until &&
      !dialog.open &&
      e.isTrusted &&
      e.detail > 0
    ) {
      const r = closingFence.rect;
      if (
        (closingFence.scope === 'dismiss' ||
          Math.hypot(e.clientX - closingFence.x, e.clientY - closingFence.y) <= 24) &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  },
  true,
);
document.addEventListener('visibilitychange', () => {
  sound.visibility(document.hidden);
  if (document.hidden && session.busy) {
    const id = activeTransition?.id;
    world.cancel('visibility');
    if (session.busy && id !== undefined) finish(id, 'visibility');
  }
});
addEventListener('pagehide', () => {
  sound.dispose();
  world.dispose();
});
addEventListener('pageshow', (event) => {
  if (event.persisted) location.reload();
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
      getPickTargetAt: (x: number, y: number) => world.pickAt(x, y),
      getPickDetailAt: (x: number, y: number) => world.pickDetailAt(x, y),
      getSelectionStatus: () =>
        copy({
          selectedId: locationSelection,
          cardOpen: !$('local-context').hidden,
          emphasis,
          origin: selectionOrigin,
          actionOrigin,
          cardPlacement,
          protectedBounds,
          protectedOverlaps: cardPlacement
            ? protectedBounds.filter((bounds) => overlaps(cardPlacement!, bounds, 0))
            : [],
        }),
      getNavigationStatus: () => world.navigationPresentation(),
      getEnvironmentStatus: () => copy(world.environmentPresentation()),
      getJourneyStatus: () => copy(world.journeyPresentation()),
      getMetrics: () => world.metrics(),
      getAudioStatus: () => sound.presentation(),
      captureAudioStream: () => sound.captureStream(),
      setAccompanimentEnabled: (enabled: boolean) => sound.setAccompanimentEnabled(enabled),
      getTransitionStatus: () =>
        copy({ active: activeTransition, last: lastTransition, completionCounts }),
      setTimingCandidate: (candidate: 'slower' | 'restrained') => {
        if (!session.busy) world.timing = candidate === 'slower' ? slowerTiming : restrainedTiming;
      },
      setWaterCandidate: (candidate: 'luminous' | 'restrained') =>
        world.coastalWater.configure(waterPresets[candidate]),
      setWaterTuning: (tuning: Partial<WaterTuning>) => world.coastalWater.configure(tuning),
    },
  });
