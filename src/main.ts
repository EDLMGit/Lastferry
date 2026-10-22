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

const cove = new URLSearchParams(location.search).get('cove');
const level = cove === 'first-crossing' ? baseline : cove === 'bellwater' ? bellwater : holdingPier;
const experiment = level.id === 'holding-pier';
const isBellwater = level.id === 'bellwater';
const { nodeNames, passengerNames } = levelNames(level);
const title = level.id === baseline.id ? 'The First Crossing' : level.title;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<main class="game ${experiment ? 'holding' : isBellwater ? 'bellwater' : 'baseline'}"><section id="seascape" aria-label="${level.title}" aria-busy="false"><div id="world"></div><header class="hud"><div class="identity"><h1>${title}</h1><p id="objective"></p></div><div id="readout" aria-label="Crossing progress"></div><nav class="tools" aria-label="Crossing controls"><button id="undo">↶ Undo</button><button id="wait">Wait <span>· 1 action</span></button><button id="menu">Menu</button></nav></header><nav id="map-labels" aria-label="Map stops"></nav><section id="local-context" aria-labelledby="local-heading"></section><button id="status-toggle" aria-haspopup="dialog" aria-label="Open tide and pier forecast"></button><p id="transition-status" role="status" tabindex="-1" hidden>Finishing this action…</p><p class="portrait-note">Turn sideways for a wider view.</p></section><div id="announcement" class="sr-only" role="status" aria-live="polite"></div></main><dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog>`;
const $ = (id: string) => document.getElementById(id)!;
const session = new Session(level),
  sound = new Sound(),
  world = new World($('world'), session.state, level);
const dialog = $('dialog') as HTMLDialogElement;
type DialogMode = 'action' | 'forecast' | 'menu' | 'terminal';
let mode: DialogMode | null = null,
  selected: Action | null = null,
  returnId = '',
  keyboardInput = false;
let fallback: ReturnType<typeof setTimeout> | undefined;
let closingFence: { rect: DOMRect; until: number; x: number; y: number } | null = null;

function available(preferred?: string) {
  const target = (preferred ? $(preferred) : null) as HTMLButtonElement | null;
  if (target && !target.disabled && target.getClientRects().length) return target;
  return (
    document.querySelector<HTMLButtonElement>(
      '#local-context button:not(:disabled), .map-stop[data-adjacent="true"] .map-target:not(:disabled)',
    ) ?? $('menu')
  );
}
function focusAvailable(preferred?: string) {
  available(preferred).focus({ preventScroll: true });
}
function blocked() {
  return session.busy || dialog.open;
}
function highlight(id?: string) {
  const to = id && edgeTo(session.state, id, level) ? id : undefined;
  world.indicate(session.state, to);
  for (const target of document.querySelectorAll<HTMLElement>('[data-destination]'))
    target.classList.toggle('highlighted', target.dataset.destination === to);
}
function restoreHighlight() {
  if (dialog.open) highlight(selected?.type === 'move' ? selected.to : undefined);
  else highlight((document.activeElement as HTMLElement)?.dataset.destination);
}
function closeDialog(restore = true, fence = false) {
  if (fence && !keyboardInput && $('cancel'))
    closingFence = {
      rect: $('cancel').getBoundingClientRect(),
      until: performance.now() + 180,
      x: 0,
      y: 0,
    };
  dialog.close();
  mode = null;
  selected = null;
  world.setForecast(false, session.state.tideLevel);
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
      `${header('Crossing menu')}<div class="dialog-body menu-body"><div class="menu-actions"><button id="restart">Restart crossing</button><button id="sound" aria-pressed="${sound.muted}" aria-label="${sound.muted ? 'Unmute sound' : 'Mute sound'}">Sound ${sound.muted ? 'off' : 'on'}</button></div><label class="cove-picker">Choose cove<select id="cove-picker">${[baseline, holdingPier, bellwater].map((l) => `<option value="${l.id}" ${l.id === level.id ? 'selected' : ''}>${l.title}${l.id === baseline.id ? ' · baseline' : ''}</option>`).join('')}</select></label><details id="help-details"><summary>How to play · actions and depth</summary><p>${actionCostCopy(level)}</p><p>Use a named destination to sail one passage. Its separate Inspect button is free. Board or let passengers ashore at the current pier; select their names in the card, then confirm.</p><p>Boat depth needed: empty = 1; 1–2 spaces = 2; 3–4 spaces = 3. Each rabbit uses 1 space; ${passengerList([sheep.id], level)} uses ${sheep.slots}. A passage must be at least as deep as the boat needs.</p><p>Boarding and unloading happen before the tide rises. Use the status button for the tide and pier forecast. Undo earlier actions or restart to recover from a losing plan.</p><p>Tab and Shift+Tab move between controls; Enter or Space activates them. Escape closes a card.</p></details></div>`;
    $('restart').onclick = restart;
    $('sound').onclick = () => {
      sound.toggle();
      renderDialog();
    };
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
function finish() {
  clearTimeout(fallback);
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
  if (dialog.open) closeDialog(false);
  render();
  if (keyboardInput) $('transition-status').focus();
  sound.play(transaction.after.status === 'won' ? 'arrival' : action.type);
  fallback = setTimeout(() => {
    world.cancel();
    if (session.busy) {
      world.sync(session.state);
      finish();
    }
  }, 1800);
  try {
    world.animate(transaction.before, transaction.after, action, finish);
  } catch {
    world.sync(session.state);
    finish();
  }
}
function localContext() {
  if (blocked() || session.state.status !== 'playing') return;
  const local = document.querySelector<HTMLButtonElement>('#local-context button');
  if (local) {
    local.focus();
    $('local-context').classList.remove('attention');
    requestAnimationFrame(() => $('local-context').classList.add('attention'));
    $('announcement').textContent =
      `You are at ${nodeNames[session.state.boatNodeId]}. Passenger actions are here.`;
  } else {
    focusAvailable();
    $('announcement').textContent =
      `You are at ${nodeNames[session.state.boatNodeId]}. Choose an adjacent passage.`;
  }
}
function activateMove(to: string) {
  if (blocked() || session.state.status !== 'playing') return;
  if (to === session.state.boatNodeId) {
    localContext();
    return;
  }
  const a: Action = { type: 'move', to },
    proposed = preview(session.state, a, level);
  if (!proposed.error && proposed.state.status !== 'lost') {
    returnId = `map-${to}`;
    execute(a);
  } else openDialog('action', a, `map-${to}`);
}
function bindTarget(button: HTMLElement, id: string, inspect = false) {
  button.onclick = () =>
    inspect ? openDialog('action', { type: 'move', to: id }, button.id) : activateMove(id);
  button.onpointerenter = () => {
    if (!dialog.open) highlight(id);
  };
  button.onpointerleave = restoreHighlight;
  button.onfocus = () => {
    if (!dialog.open) highlight(id);
  };
  button.onblur = restoreHighlight;
}
function renderMap() {
  const s = session.state;
  $('map-labels').innerHTML =
    '<svg id="map-leaders" aria-hidden="true"></svg>' +
    level.nodes
      .map((n) => {
        const edge = edgeTo(s, n.id, level),
          current = n.id === s.boatNodeId;
        const status = current
          ? 'current'
          : !edge
            ? 'nonadjacent'
            : edge.baseDepth + s.tideLevel < draft(s, level)
              ? 'too-shallow'
              : 'available';
        const loses =
          status === 'available' &&
          preview(s, { type: 'move', to: n.id }, level).state.status === 'lost';
        const label = current
          ? `You are at ${nodeNames[n.id]}`
          : !edge
            ? `${nodeNames[n.id]}: no direct passage`
            : `Sail to ${nodeNames[n.id]}${loses ? '; flood warning' : ''}`;
        const disabled = session.busy || s.status !== 'playing' ? 'disabled' : '';
        return `<div id="stop-${n.id}" class="map-stop" data-adjacent="${!!edge}"><button id="map-${n.id}" class="map-target" data-status="${status}" data-risk="${loses ? 'loss' : 'safe'}" data-destination="${n.id}" ${current ? 'aria-current="location"' : ''} aria-label="${label}" title="${passageCopy(s, n.id, level)}" ${disabled}><span class="map-symbol" aria-hidden="true">${current ? '●' : !edge ? '◇' : status === 'too-shallow' ? '⊘' : loses ? '!' : '○'}</span><span><b>${current || !edge ? nodeNames[n.id] : `Sail to ${nodeNames[n.id]}`}</b><span class="map-state">${current ? 'You are here' : !edge ? 'No direct passage' : status === 'too-shallow' ? 'Too shallow' : loses ? 'Flood warning' : '1 action'}</span></span></button>${edge ? `<button id="inspect-${n.id}" class="inspect-route" data-destination="${n.id}" aria-label="Inspect passage to ${nodeNames[n.id]} for free" ${disabled}>Inspect</button>` : ''}</div>`;
      })
      .join('');
  for (const n of level.nodes) {
    bindTarget($(`map-${n.id}`), n.id);
    if ($(`inspect-${n.id}`)) bindTarget($(`inspect-${n.id}`), n.id, true);
  }
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
  const dry = p && s.tideLevel < p.elevation;
  const boarding = dry && s.status === 'playing' ? s.waitingByPier[p.id] : [],
    unloading = dry && s.status === 'playing' ? s.aboard : [];
  const local = (type: 'board' | 'unload', ids: string[]) => {
    const label =
      type === 'unload' && p!.isDeliveryPier
        ? 'Bring passengers home'
        : actionLabel(s, { type, passengerIds: ids }, level);
    return `<button id="${type}" ${session.busy ? 'disabled' : ''}>${label}</button>`;
  };
  $('local-context').innerHTML =
    `<h2 id="local-heading">${nodeNames[s.boatNodeId]}</h2><div id="local-actions">${boarding.length ? local('board', boarding) : ''}${unloading.length ? local('unload', unloading) : ''}${!boarding.length && !unloading.length ? `<p>${p && !dry ? 'Pier flooded · ferry can leave' : p ? 'No passengers to transfer' : 'Choose the next passage'}</p>` : ''}</div>`;
  $('local-context').classList.toggle('no-transfer', !boarding.length && !unloading.length);
  if ($('board'))
    $('board').onclick = () =>
      openDialog('action', { type: 'board', passengerIds: [...boarding] }, 'board');
  if ($('unload'))
    $('unload').onclick = () =>
      openDialog('action', { type: 'unload', passengerIds: [...unloading] }, 'unload');
  ($('undo') as HTMLButtonElement).disabled = session.busy || !session.history.length;
  ($('wait') as HTMLButtonElement).disabled = session.busy || s.status !== 'playing';
  ($('menu') as HTMLButtonElement).disabled = session.busy;
  ($('status-toggle') as HTMLButtonElement).disabled = session.busy;
  $('undo').onclick = () => {
    if (!blocked()) undo();
  };
  $('wait').onclick = () => openDialog('action', { type: 'wait' }, 'wait');
  $('menu').onclick = () => openDialog('menu', undefined, 'menu');
  $('transition-status').hidden = !session.busy;
  $('seascape').setAttribute('aria-busy', String(session.busy));
  renderMap();
  positionMap();
  highlight();
}
function undo() {
  if (session.busy) return;
  if (dialog.open) closeDialog(false);
  if (session.undo()) {
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
    small = matchMedia('(max-height: 600px) and (min-width: 701px)').matches;
  for (const n of level.nodes) {
    const group = $(`stop-${n.id}`);
    if (!group) continue;
    const offset = experiment
      ? n.id === 'stone' || n.id === 'rabbit-pier'
        ? -3.6
        : n.id === 'shallows'
          ? 0.85
          : 1.3
      : n.id === 'cut'
        ? -3.6
        : n.id.startsWith('outer')
          ? 0.7
          : 1.4;
    const point = world.project([n.positionXZ[0], n.positionXZ[1] + offset]);
    if (!experiment && !isBellwater && small) {
      if (n.id === 'harbor' || n.id === 'outer-west') point.x -= 145;
      if (n.id === 'sheep-pier' || n.id === 'outer-east') point.x += 145;
    }
    if (experiment && small && session.state.boatNodeId === 'shallows') {
      if (n.id === 'stone') point.x -= 28;
      if (n.id === 'rabbit-pier') point.x += 36;
    }
    if (experiment && n.id === session.state.boatNodeId) {
      if (n.id === 'shallows') point.x += small ? 100 : 170;
      if (n.id === 'harbor') point.x -= small ? 95 : 170;
    }
    if (!experiment && n.id === 'outer-south' && n.id === session.state.boatNodeId) point.y -= 65;
    if (
      isBellwater &&
      !small &&
      n.id === 'low-pier' &&
      session.state.boatNodeId === 'east-buoy' &&
      session.state.aboard.length
    ) {
      const head = Math.min(
        ...world
          .frameStatus()
          .passengers.filter((p) => session.state.aboard.includes(p.id))
          .map((p) => p.top),
      );
      point.y = Math.min(point.y, head - group.offsetHeight / 2 - 8);
    }
    const half = group.offsetWidth / 2;
    if (isBellwater && small) {
      const row = {
        harbor: 0.51,
        shallows: 0.85,
        'low-pier': 0.51,
        'west-buoy': 0.85,
        'east-buoy': 0.85,
        'bell-pier': 0.11,
      }[n.id];
      point.x =
        n.id === 'shallows'
          ? host.clientWidth / 2
          : n.id === 'harbor' || n.id === 'west-buoy'
            ? half + 8
            : host.clientWidth - half - 8;
      point.y = host.clientHeight * (row ?? 0.5);
    }
    const x = Math.max(half + 8, Math.min(host.clientWidth - half - 8, point.x));
    let bottom = host.offsetTop + host.clientHeight - group.offsetHeight / 2 - 4;
    if (isBellwater) {
      const forecast = $('status-toggle').getBoundingClientRect();
      if (x + half > forecast.left && x - half < forecast.right)
        bottom = Math.min(bottom, forecast.top - group.offsetHeight / 2 - 8);
    }
    group.style.left = `${x}px`;
    group.style.top = `${Math.max(host.offsetTop + group.offsetHeight / 2 + 4, Math.min(bottom, point.y + host.offsetTop))}px`;
  }
  if ($('map-leaders'))
    $('map-leaders').innerHTML =
      !experiment && small
        ? level.nodes
            .filter(
              (n) =>
                isBellwater || ['harbor', 'sheep-pier', 'outer-west', 'outer-east'].includes(n.id),
            )
            .map((n) => {
              const point = world.project(n.positionXZ),
                group = $(`stop-${n.id}`),
                rect = group.getBoundingClientRect();
              const targetX = isBellwater
                ? n.id === 'shallows'
                  ? rect.left + rect.width / 2
                  : n.id === 'harbor' || n.id === 'west-buoy'
                    ? rect.right
                    : rect.left
                : n.id === 'harbor' || n.id === 'outer-west'
                  ? rect.right
                  : rect.left;
              return `<line x1="${point.x}" y1="${point.y + host.offsetTop}" x2="${targetX}" y2="${rect.top + rect.height / 2}" />`;
            })
            .join('')
        : '';
  if (!small && innerWidth > 700) {
    const boat = world.frameStatus().boat;
    const local = $('local-context'),
      width = local.offsetWidth,
      height = local.offsetHeight,
      obstacles = [
        ...document.querySelectorAll<HTMLElement>('.map-stop, .hud, #status-toggle'),
      ].map((e) => e.getBoundingClientRect()),
      centerX = (boat.left + boat.right) / 2,
      centerY = (boat.top + boat.bottom) / 2 + host.offsetTop;
    const candidates = [
      [centerX - width / 2, boat.bottom + host.offsetTop + 10],
      [boat.left - width - 12, centerY - height / 2],
      [boat.right + 12, centerY - height / 2],
      [centerX - width / 2, boat.top + host.offsetTop - height - 12],
    ].map(([x, y]) => ({
      x: Math.max(16, Math.min(host.clientWidth - width - 16, x)),
      y: Math.max(host.offsetTop + 8, Math.min(host.offsetTop + host.clientHeight - height - 8, y)),
    }));
    const chosen =
      candidates.find((p) =>
        obstacles.every(
          (r) =>
            p.x + width + 8 <= r.left ||
            p.x - 8 >= r.right ||
            p.y + height + 8 <= r.top ||
            p.y - 8 >= r.bottom,
        ),
      ) ?? candidates[0];
    local.style.left = `${chosen.x + width / 2}px`;
    local.style.top = `${chosen.y}px`;
  } else {
    $('local-context').style.removeProperty('left');
    $('local-context').style.removeProperty('top');
  }
  positionDialog();
}
world.onSelect = activateMove;
world.onCurrent = localContext;
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
  },
  true,
);
document.addEventListener(
  'pointerdown',
  () => {
    keyboardInput = false;
  },
  true,
);
document.addEventListener(
  'click',
  (e) => {
    if (
      closingFence &&
      performance.now() < closingFence.until &&
      !dialog.open &&
      e.isTrusted &&
      e.detail > 0
    ) {
      if (
        (e.target as Element).closest('.inspect-route') &&
        Math.hypot(e.clientX - closingFence.x, e.clientY - closingFence.y) > 3
      )
        return;
      const r = closingFence.rect;
      if (
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
  if (document.hidden && session.busy) {
    world.cancel();
    if (session.busy) finish();
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
