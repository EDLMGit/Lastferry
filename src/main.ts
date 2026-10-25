import './style.css';
import './ui/cove-ui.css';
import { controlContent, iconMarkup, passengerChoiceContent, setControl, type CoveIcon, type CoveFace } from './ui/cove-ui';
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
import { placeActionCard, overlaps, type Rectangle } from './ui/placement';
import { locationFacts } from './ui/location';
import { endpointTargets } from './ui/cove-layout';
import { MotionPreference, type MotionMode } from './ui/motion-preference';
import { PanGesture } from './ui/pan-gesture';
import { visibleViewport, insetRectangle } from './ui/viewport';
import { FullscreenSupport } from './ui/fullscreen';

const cove = new URLSearchParams(location.search).get('cove');
const level = cove === 'first-crossing' ? baseline : cove === 'bellwater' ? bellwater : holdingPier;
const experiment = level.id === 'holding-pier';
const isBellwater = level.id === 'bellwater';
const { nodeNames, passengerNames } = levelNames(level);
const homeNodeId = level.piers.find((pier) => pier.id === level.objective.deliveryPierId)!.nodeId;
const title = level.id === baseline.id ? 'The First Crossing' : level.title;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.classList.add('cove-kit');
app.innerHTML = `<main class="game ${experiment ? 'holding' : isBellwater ? 'bellwater' : 'baseline'}"><section id="seascape" aria-label="${level.title}" aria-busy="false"><div id="world"></div><header class="hud"><div class="identity"><h1>${title}</h1><p id="objective"></p></div><div id="readout" aria-label="Crossing progress"></div><nav class="tools" aria-label="Crossing controls"><button id="undo">↶ Undo</button><button id="wait">Wait <span>· 1 action</span></button><button id="menu">Menu</button><button id="sound-toggle" aria-label="Mute sound" aria-pressed="false">♫</button></nav></header><nav id="map-labels" aria-label="Map stops"></nav><nav id="dock-actions" aria-label="Passenger actions" hidden></nav><section id="local-context" role="region" aria-labelledby="local-heading" hidden></section><p id="selection-hint">Select a place to see its options.</p><svg id="selection-leader" aria-hidden="true"></svg><button id="status-toggle" aria-haspopup="dialog" aria-label="Open tide and pier forecast"></button><p id="transition-status" role="status" tabindex="-1" hidden>Finishing this action…</p><p class="portrait-note">Turn sideways for a wider view.</p></section><div id="announcement" class="sr-only" role="status" aria-live="polite"></div></main><dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog>`;
const $ = (id: string) => document.getElementById(id)!;
for (const [id, icon, label] of [
  ['undo', 'undo', 'Undo'],
  ['wait', 'wait', 'Wait · 1 action'],
  ['menu', 'menu', 'Menu'],
] as const) setControl($(id), icon, label);
setControl($('menu'), 'menu', 'Menu', 'quiet', true);
$('menu').title = 'Menu';
document.querySelector('.hud')!.classList.add('cove-panel', 'cove-surface', 'cove-surface--compact');
$('local-context').classList.add('cove-panel', 'cove-surface', 'cove-surface--compact');
$('status-toggle').classList.add('cove-panel', 'cove-surface', 'cove-surface--compact');
const session = new Session(level),
  sound = new Sound(),
  world = new World($('world'), session.state, level),
  motion = new MotionPreference(matchMedia('(prefers-reduced-motion: reduce)'));
sound.reconcileState(session.state, level);
const dialog = $('dialog') as HTMLDialogElement;
dialog.classList.add('cove-panel', 'cove-surface');
const fullscreenSupport = new FullscreenSupport(app, dialog, {
  artifact: new URL(import.meta.url).pathname.split('/').at(-1) ?? 'unknown',
  mode: import.meta.env.DEV ? 'development' : 'production',
});
const viewControls = document.createElement('nav');
viewControls.className = 'view-controls';
viewControls.setAttribute('aria-label', 'Cove view');
viewControls.innerHTML =
  '<button id="view-toggle" aria-pressed="false">Whole cove</button><button id="back-to-boat" hidden>Back to boat</button>';
$('seascape').append(viewControls);
setControl($('back-to-boat'), 'back-to-boat', 'Back to boat');
$('seascape').querySelector('.portrait-note')?.remove();
const viewNotice = document.createElement('p');
viewNotice.id = 'view-notice';
viewNotice.role = 'status';
viewNotice.hidden = true;
$('seascape').append(viewNotice);
type DialogMode = 'action' | 'forecast' | 'menu' | 'terminal' | 'settings';
let mode: DialogMode | null = null,
  selected: Action | null = null,
  returnId = '',
  keyboardInput = false;
let settingsParent: 'menu' | 'terminal' = 'menu';
type SoundIntent = 'enable' | 'retry' | 'mute';
let soundIntent: { control: HTMLElement; intent: SoundIntent } | null = null;
let viewFence: { x: number; y: number; until: number } | null = null;
let locationSelection: string | null = null;
let emphasis: string | undefined;
let selectionOrigin: { x: number; y: number } | null = null;
let actionOrigin: { x: number; y: number } | null = null;
let lastPointer: { x: number; y: number; control: Element | null } | null = null;
let cardPlacement: Rectangle | null = null;
let protectedBounds: Rectangle[] = [];
let labelLayout = new Map<string, Rectangle>();
let labelLayoutKey = '';
const labelDimensions = new Map<string, { element: HTMLElement; width: number; height: number }>();
let labelDimensionsKey = '';
let dockPlacement: Rectangle | null = null;
let fallback: ReturnType<typeof setTimeout> | undefined;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
let actionAnchor: Rectangle | null = null;
let actionPlacement: (Rectangle & { layout: 'floating' | 'sheet' }) | null = null;
let actionPlace: string | null = null;
let actionAnchorOffset = { x: 0, y: 0 };
let placementViewportKey = '';
let layoutRequest = 0;
let layoutFlushing = false;
let pageDisposed = false;
let viewport = visibleViewport(window.visualViewport, innerWidth, innerHeight);
let safeBounds: Rectangle = viewport;
let usableBounds: Rectangle = viewport;
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
  if (pageDisposed) return;
  const playback = sound.playback();
  const intent: SoundIntent = playback.running ? 'mute' : playback.requested ? 'retry' : 'enable';
  const label =
    intent === 'mute' ? 'Mute sound' : intent === 'retry' ? 'Retry sound' : 'Enable sound';
  const control = $('sound-toggle');
  control.dataset.playback = playback.state;
  control.dataset.soundIntent = intent;
  control.setAttribute('aria-label', label);
  control.setAttribute('aria-pressed', String(sound.muted));
  control.title = label;
  const icon: CoveIcon = intent === 'mute' ? 'sound-on' : intent === 'retry' ? 'sound-retry' : 'sound-off';
  const compactLabel = sound.muted || playback.running ? label : playback.requested ? 'Retry' : 'Sound';
  setControl(control, icon, compactLabel, 'quiet', sound.muted || playback.running);
  const settings = $('settings-sound');
  if (settings) {
    setControl(settings, icon, label);
    settings.dataset.playback = playback.state;
    settings.dataset.soundIntent = intent;
    settings.setAttribute('aria-pressed', String(playback.running));
    settings.setAttribute('aria-label', label);
  }
  const mute = $('settings-mute');
  if (mute) {
    setControl(mute, 'sound-off', 'Mute sound');
    mute.hidden = playback.state !== 'requested' || !playback.requested;
  }
  const status = $('audio-status');
  if (status)
    status.textContent = sound.muted
      ? 'Sound is muted.'
      : playback.running
        ? 'Sound is playing.'
        : playback.requested
          ? 'Sound is waiting. Tap Retry sound, or keep it muted.'
          : 'Sound starts when you play. You can also enable it here.';
}
function explicitSound(control: HTMLElement, intent?: SoundIntent) {
  const chosen =
    intent ??
    (soundIntent?.control === control
      ? soundIntent.intent
      : (control.dataset.soundIntent as SoundIntent));
  soundIntent = null;
  const changed = chosen === 'retry' ? sound.activate() : sound.setMuted(chosen === 'mute');
  renderSound();
  void changed.then(renderSound).catch(renderSound);
}
function toggleSound(event: MouseEvent) {
  explicitSound(event.currentTarget as HTMLElement);
}
function audioControl(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest<HTMLElement>('#sound-toggle, #settings-sound, #settings-mute')
    : null;
}
function captureSoundIntent(target: EventTarget | null) {
  const control = audioControl(target);
  soundIntent = control ? { control, intent: control.dataset.soundIntent as SoundIntent } : null;
}
function activateSound() {
  const activated = sound.activate();
  renderSound();
  void activated.then(renderSound).catch(renderSound);
}
sound.onChange = renderSound;

function notifyView(message: string) {
  clearTimeout(noticeTimer);
  viewNotice.textContent = message;
  viewNotice.hidden = false;
  $('announcement').textContent = message;
  const control = $('fullscreen');
  if (control && dialog.open) {
    let feedback = $('fullscreen-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.id = 'fullscreen-feedback';
      feedback.role = 'status';
      control.after(feedback);
    }
    feedback.textContent = message;
    positionDialog();
  }
  if (fullscreenSupport.failed) {
    $('fullscreen-support')?.remove();
    const support = document.createElement('button');
    support.id = 'fullscreen-support';
    setControl(support, null, 'Copy support details');
    support.onclick = () => {
      const details = JSON.stringify(
        {
          ...fullscreenSupport.details(),
          audio: sound.playback(),
        },
        null,
        2,
      );
      const manual = () => {
        let text = $('fullscreen-details') as HTMLTextAreaElement | null;
        if (!text) {
          text = document.createElement('textarea');
          text.id = 'fullscreen-details';
          text.readOnly = true;
          text.setAttribute('aria-label', 'Fullscreen support details');
          support.after(text);
        }
        text.value = details;
        text.focus();
        text.select();
        setControl(support, null, 'Select and copy these details');
        positionDialog();
      };
      let copied: Promise<void> | undefined;
      try {
        copied = navigator.clipboard?.writeText(details);
      } catch {
        manual();
        return;
      }
      if (copied)
        void copied.then(() => {
          setControl(support, null, 'Support details copied');
        }, manual);
      else manual();
    };
    (control && dialog.open ? $('fullscreen-feedback') : viewNotice).append(support);
    positionDialog();
  } else {
    noticeTimer = setTimeout(() => {
      viewNotice.hidden = true;
    }, 4500);
  }
}
function renderFullscreen() {
  const button = $('fullscreen');
  if (!button) return;
  const active = document.fullscreenElement === app;
  setControl(button, active ? 'fullscreen-exit' : 'fullscreen-enter', active ? 'Exit fullscreen' : 'Fullscreen');
  button.setAttribute('aria-pressed', String(active));
  button.onclick = toggleFullscreen;
  if (!fullscreenSupport.failed) {
    $('fullscreen-feedback')?.remove();
    $('fullscreen-support')?.remove();
    $('fullscreen-details')?.remove();
  }
}
function toggleFullscreen(event: MouseEvent) {
  const requested = fullscreenSupport.toggle(event.isTrusted);
  const attempt = fullscreenSupport.currentId;
  void requested.then((message) => {
    if (pageDisposed || attempt !== fullscreenSupport.currentId) return;
    if (message) notifyView(message);
    else viewNotice.hidden = true;
    renderFullscreen();
    scheduleLayout();
  });
}
function renderView() {
  const view = world.viewStatus();
  const toggle = $('view-toggle'),
    label = view.mode === 'overview' ? 'Play view' : 'Whole cove',
    pressed = String(view.mode === 'overview'),
    back = $('back-to-boat'),
    hideBack = view.mode !== 'overview' && !view.panned && !view.focused;
  setControl(toggle, view.mode === 'overview' ? 'back-to-boat' : 'whole-cove', label);
  if (toggle.getAttribute('aria-pressed') !== pressed) toggle.setAttribute('aria-pressed', pressed);
  if (back.hidden !== hideBack) back.hidden = hideBack;
}
function scheduleLayout() {
  if (layoutRequest || layoutFlushing) return;
  layoutRequest = requestAnimationFrame(flushLayout);
}
function flushLayout() {
  if (layoutFlushing) return;
  cancelAnimationFrame(layoutRequest);
  layoutRequest = 0;
  layoutFlushing = true;
  try {
    updateViewport();
    positionMap();
    renderView();
  } finally {
    layoutFlushing = false;
  }
}
function updateViewport() {
  viewport = visibleViewport(window.visualViewport, innerWidth, innerHeight);
  const width = viewport.right - viewport.left,
    height = viewport.bottom - viewport.top;
  for (const [name, value] of [
    ['--viewport-left', `${viewport.left}px`],
    ['--viewport-top', `${viewport.top}px`],
    ['--viewport-width', `${width}px`],
    ['--viewport-height', `${height}px`],
  ])
    if (app.style.getPropertyValue(name) !== value) app.style.setProperty(name, value);
  const style = getComputedStyle(app);
  const inset = (side: string) => Number.parseFloat(style.getPropertyValue(`--safe-${side}`)) || 0;
  safeBounds = insetRectangle(viewport, {
    left: inset('left'),
    top: inset('top'),
    right: inset('right'),
    bottom: inset('bottom'),
  });
  const hud = document.querySelector<HTMLElement>('.hud')!.getBoundingClientRect();
  const controls = viewControls.getBoundingClientRect();
  const forecast = $('status-toggle').getBoundingClientRect();
  usableBounds = {
    ...safeBounds,
    top: Math.max(safeBounds.top, hud.bottom + 8),
    bottom: Math.min(
      safeBounds.bottom,
      controls.top - 8,
      $('status-toggle').hidden ? safeBounds.bottom : forecast.top - 8,
    ),
  };
  const canvas = world.host.getBoundingClientRect();
  world.setUsableRectangle({
    left: usableBounds.left - canvas.left,
    right: usableBounds.right - canvas.left,
    top: usableBounds.top - canvas.top,
    bottom: usableBounds.bottom - canvas.top,
  });
}

function renderMotion() {
  document.documentElement.dataset.motion = motion.reduced ? 'reduced' : 'normal';
  const control = $('motion-preference') as HTMLSelectElement | null;
  if (control) control.value = motion.mode;
  const status = $('motion-status');
  if (status)
    status.textContent =
      motion.mode === 'reduced'
        ? 'Reduced motion is on.'
        : `Following device · ${motion.reduced ? 'reduced' : 'normal'} motion.`;
}
world.setReducedMotion(motion.reduced);
renderMotion();
const unsubscribeMotion = motion.subscribe((reduced) => {
  world.setReducedMotion(reduced);
  renderMotion();
});

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
  const marker = $(`map-${session.state.boatNodeId}`);
  return marker?.getClientRects().length ? marker : $('menu');
}
function focusAvailable(preferred?: string) {
  if (
    keyboardInput &&
    (preferred === 'board' || preferred === 'unload') &&
    $(preferred) &&
    !$('dock-actions').hidden
  ) {
    flushLayout();
    if (getComputedStyle($(preferred)).visibility === 'hidden') {
      world.frameLocation(session.state.boatNodeId);
      flushLayout();
    }
  }
  available(preferred).focus({ preventScroll: true });
}
function blocked() {
  return session.busy || dialog.open || fullscreenSupport.promoting;
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
  actionAnchor = null;
  actionPlacement = null;
  actionPlace = null;
  dialog.style.removeProperty('left');
  dialog.style.removeProperty('top');
  dialog.style.removeProperty('right');
  dialog.style.removeProperty('bottom');
  if (session.state.status !== 'won') world.setCompletionBounds(null);
  world.setForecast(false, session.state.tideLevel);
  renderLocation();
  renderDock();
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
  actionPlacement = null;
  placementViewportKey = '';
  if (next === 'action') {
    actionPlace = action?.type === 'move' ? action.to : session.state.boatNodeId;
    const target = $(returnId);
    const point = world.project(level.nodes.find((node) => node.id === actionPlace)!.positionXZ);
    const canvas = world.host.getBoundingClientRect();
    const x = point.x + canvas.left,
      y = point.y + canvas.top;
    const rect = target?.getClientRects().length ? target.getBoundingClientRect() : null;
    actionAnchor = rect
      ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
      : { left: x - 24, right: x + 24, top: y - 24, bottom: y + 24 };
    actionAnchorOffset = {
      x: (actionAnchor.left + actionAnchor.right) / 2 - x,
      y: (actionAnchor.top + actionAnchor.bottom) / 2 - y,
    };
  }
  renderDialog();
  dialog.showModal();
  $('local-context').hidden = true;
  $('local-context').inert = true;
  $('dock-actions').hidden = true;
  $('dock-actions').inert = true;
  $('selection-leader').innerHTML = '';
  (next === 'terminal'
    ? ($('next-cove') ?? $('choose-cove') ?? $('terminal-undo'))
    : $('cancel')
  ).focus();
  positionDialog();
  restoreHighlight();
}
function switchDialog(next: DialogMode, focusId: string) {
  if (!keyboardInput && lastPointer)
    viewFence = { x: lastPointer.x, y: lastPointer.y, until: performance.now() + 180 };
  mode = next;
  selected = null;
  actionPlacement = null;
  actionAnchor = null;
  actionPlace = null;
  renderDialog();
  $(focusId).focus({ preventScroll: true });
}
function openSettings(parent: 'menu' | 'terminal') {
  settingsParent = parent;
  switchDialog('settings', 'settings-sound');
}
function backFromSettings() {
  switchDialog(settingsParent, settingsParent === 'terminal' ? 'terminal-settings' : 'settings');
}
function header(title: string, eyebrow?: string, closeLabel = 'Close dialog') {
  return `<header class="dialog-head"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2 id="dialog-title">${title}</h2></div><button id="cancel" aria-label="${closeLabel}">${controlContent('close', closeLabel)}</button></header>`;
}
function renderDialog() {
  if (!mode) return;
  dialog.classList.toggle('cove-surface--arrival', mode === 'terminal' && session.state.status === 'won');
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
        ? `<div class="passenger-options" role="group" aria-label="Passenger selection">${ids.map((id) => `<button id="passenger-${id}" class="cove-choice" aria-pressed="${a.passengerIds.includes(id)}">${passengerChoiceContent(passengerNames[id].split(' ·')[0], level.passengers.find((p) => p.id === id)!.slots)}</button>`).join('')}</div>`
        : '';
    $('dialog-content').innerHTML =
      `${header(actionLabel(s, a, level), `${nodeNames[a.type === 'move' ? a.to : s.boatNodeId]} · inspection is free`)}<div id="preview" class="dialog-body ${proposed.error || proposed.state.status === 'lost' ? 'warning' : ''}" aria-live="polite" aria-atomic="true">${choices}<p class="requirement">${text.error ?? text.requirement}</p>${text.consequence ? `<p class="consequence">${text.consequence}</p>` : ''}${!proposed.error ? `<p class="preview-result">After this action: Boat ${load(proposed.state, level)}/${level.rules.capacity} spaces · tide ${proposed.state.tideLevel}${s.tideLevel !== proposed.state.tideLevel ? ` (now ${s.tideLevel})` : ''}</p>` : ''}</div><footer class="dialog-footer"><button id="commit" ${proposed.error ? 'disabled' : ''}>${proposed.error ? 'Action unavailable' : 'Confirm · 1 action'}</button></footer>`;
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
      `${header('Crossing menu')}<div class="dialog-body menu-body">${s.status === 'won' ? '<button id="return-arrival">Return to arrival</button>' : ''}<div class="menu-actions"><button id="restart">Restart crossing</button><button id="settings">Settings</button></div><label class="cove-picker">Choose cove<select id="cove-picker">${[baseline, holdingPier, bellwater].map((l) => `<option value="${l.id}" ${l.id === level.id ? 'selected' : ''}>${l.title}${l.id === baseline.id ? ' · baseline' : ''}</option>`).join('')}</select></label><details id="help-details"><summary>How to play · actions and depth</summary><p>${actionCostCopy(level)}</p><p>Select a named place, island, pier or landmark to see its options for free. Choose Sail to travel one passage. Select the ferry for its current place. Passenger actions open a subset preview; choose names, then Confirm.</p><p>Boat depth needed: empty = 1; 1–2 spaces = 2; 3–4 spaces = 3. Each rabbit uses 1 space; ${passengerList([sheep.id], level)} uses ${sheep.slots}. A passage must be at least as deep as the boat needs.</p><p>Boarding and unloading happen before the tide rises. Use the status button for the tide and pier forecast. Undo earlier actions or restart to recover from a losing plan.</p><p>Tab and Shift+Tab move between controls; Enter or Space activates them. Escape closes a dialog first; press it again to close the location card. Selection never spends an action.</p></details></div>`;
    $('restart').onclick = restart;
    const fullscreen = document.createElement('button');
    fullscreen.id = 'fullscreen';
    $('settings').closest('.menu-actions')!.after(fullscreen);
    renderFullscreen();
    $('settings').onclick = () => openSettings('menu');
    if (s.status === 'won')
      $('return-arrival').onclick = () =>
        switchDialog('terminal', experiment ? 'next-cove' : 'choose-cove');
    ($('cove-picker') as HTMLSelectElement).onchange = (e) => {
      location.search = `?cove=${(e.target as HTMLSelectElement).value}`;
    };
  } else if (mode === 'settings') {
    $('dialog-content').innerHTML =
      `${header('Settings', undefined, 'Back to ' + (settingsParent === 'terminal' ? 'arrival' : 'menu'))}<div class="dialog-body settings-body"><div class="settings-row"><span>Sound</span><div class="settings-sound-controls"><button id="settings-sound"></button><button id="settings-mute" data-sound-intent="mute" hidden>Mute sound</button></div></div><p id="audio-status" role="status"></p><label class="settings-row" for="motion-preference">Motion<select id="motion-preference"><option value="device">Follow device</option><option value="reduced">Reduced</option></select></label><p id="motion-status"></p></div><footer class="dialog-footer"><button id="settings-back">Back</button></footer>`;
    $('settings-sound').onclick = toggleSound;
    $('settings-mute').onclick = (event) =>
      explicitSound(event.currentTarget as HTMLElement, 'mute');
    const fullscreen = document.createElement('button');
    fullscreen.id = 'fullscreen';
    document.querySelector('.settings-body')!.append(fullscreen);
    renderFullscreen();
    ($('motion-preference') as HTMLSelectElement).onchange = (event) =>
      motion.setMode((event.target as HTMLSelectElement).value as MotionMode);
    $('settings-back').onclick = backFromSettings;
    renderSound();
    renderMotion();
  } else {
    const f = statusCopy(s, level),
      won = s.status === 'won',
      next = won && experiment;
    dialog.dataset.outcome = won ? 'won' : 'lost';
    $('dialog-content').innerHTML =
      `${header(won ? (isBellwater ? 'Bellwater is safe.' : 'Everyone home.') : 'A turn too late.')}<div class="dialog-body ending ${won ? '' : 'loss'}"><p>${won ? `${level.objective.requiredPassengerIds.length} passengers safe at Harbor · ${s.turn} actions.` : f.headline}</p>${won ? '' : '<p>Undo earlier moves, or restart to try a different plan.</p>'}</div><footer class="dialog-footer terminal-actions">${won ? `<button id="${next ? 'next-cove' : 'choose-cove'}">${next ? 'Next cove' : 'Choose a cove'}</button><button id="terminal-settings">Settings</button>` : ''}<button id="terminal-undo">↶ Undo last action</button><button id="terminal-restart">Restart</button></footer>`;
    if (next)
      $('next-cove').onclick = () => {
        location.search = '?cove=bellwater';
      };
    else if (won) $('choose-cove').onclick = () => switchDialog('menu', 'cove-picker');
    if (won) $('terminal-settings').onclick = () => openSettings('terminal');
    $('terminal-undo').onclick = undo;
    $('terminal-restart').onclick = restart;
  }
  const controls: [string, CoveIcon | null, string | null, CoveFace, boolean?][] = [
    ['cancel', 'close', $('cancel').getAttribute('aria-label'), 'quiet', true],
    ['commit', 'confirm', null, selected?.type === 'unload' && s.boatNodeId === homeNodeId ? 'warm' : 'action'],
    ['restart', null, 'Restart crossing', 'quiet'],
    ['settings', 'settings', 'Settings', 'quiet'],
    ['settings-back', null, 'Back', 'quiet'],
    ['return-arrival', 'harbor-home', 'Return to arrival', 'warm'],
    ['next-cove', 'next-cove', 'Next cove', 'warm'],
    ['choose-cove', 'whole-cove', 'Choose a cove', 'warm'],
    ['terminal-settings', 'settings', 'Settings', 'quiet'],
    ['terminal-undo', 'undo', 'Undo last action', 'quiet'],
    ['terminal-restart', null, 'Restart', 'quiet'],
  ];
  for (const [id, icon, label, face, iconOnly] of controls) {
    const button = $(id);
    if (button) setControl(button, icon, label ?? button.textContent ?? '', face, iconOnly);
  }
  $('cancel').onclick = (e) => {
    e.stopPropagation();
    if (mode === 'settings') {
      backFromSettings();
      return;
    }
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
  if (locationSelection === session.state.boatNodeId) locationSelection = null;
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
  world.poses.accept(transaction.before, action);
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
    world.cancel('error');
    if (session.busy) {
      try {
        world.sync(session.state);
      } finally {
        finish(id, 'error');
      }
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
    world.frameLocation(id);
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
    if (!blocked()) {
      if (keyboardInput) world.frameLocation(id);
      highlight(id);
    }
  };
  button.onblur = restoreHighlight;
}
function renderMap() {
  const s = session.state;
  labelDimensions.clear();
  $('map-labels').hidden = s.status === 'won';
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
        return `<div id="stop-${n.id}" class="map-stop" data-adjacent="${facts.relation === 'adjacent'}"><button id="map-${n.id}" class="map-target" data-status="${status}" data-risk="${facts.wouldLose ? 'loss' : 'safe'}" data-destination="${n.id}" aria-expanded="${locationSelection === n.id}" aria-controls="local-context" ${facts.current ? 'aria-current="location"' : ''} aria-label="Select ${facts.name}; ${description}${facts.home ? '; Home, delivery destination' : ''}" title="${description}" ${session.busy || s.status !== 'playing' ? 'disabled' : ''}><span class="map-hit"><span class="map-symbol" aria-hidden="true">${facts.current ? '•' : facts.relation === 'remote' ? '◇' : facts.status === 'too-shallow' ? '╱' : facts.wouldLose ? '!' : ''}</span></span><span class="map-name"><b class="cove-name cove-surface cove-surface--compact">${facts.home ? iconMarkup('harbor-home') : ''}${facts.name}${facts.home ? '<span class="map-home cove-objective"> · Home</span>' : ''}</b></span></button></div>`;
      })
      .join('');
  for (const node of level.nodes) bindTarget($(`map-${node.id}`), node.id);
}
function renderLocation() {
  const card = $('local-context');
  const visible =
    !!locationSelection && !session.busy && !dialog.open && session.state.status === 'playing';
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
  const actions =
    !facts.current && facts.move
      ? `<button id="sail" data-risk="${facts.wouldLose ? 'loss' : 'safe'}" ${facts.canSail ? '' : 'disabled'}>Sail · 1 action</button>`
      : '';
  card.innerHTML = `<header class="location-head"><div><p class="location-role">${facts.current ? 'You are here' : facts.home ? 'Home · delivery destination' : facts.relation === 'remote' ? 'Free inspection' : facts.wouldLose ? 'Flood warning' : 'Direct passage'}</p><h2 id="local-heading" tabindex="-1">${facts.name}${facts.home && facts.current ? ' · Home' : ''}</h2></div><button id="close-location" aria-label="Close location card">×</button></header><div id="location-facts">${details}</div>${actions ? `<footer id="local-actions">${actions}</footer>` : ''}`;
  setControl($('close-location'), 'close', 'Close location card', 'quiet', true);
  if ($('sail')) {
    setControl($('sail'), 'sail', 'Sail · 1 action', 'action');
    $('sail').setAttribute('aria-label', `Sail to ${facts.name} · 1 action`);
  }
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
function renderDock() {
  const dock = $('dock-actions'),
    facts = locationFacts(session.state, session.state.boatNodeId, level),
    visible =
      !session.busy &&
      !dialog.open &&
      session.state.status === 'playing' &&
      !facts.flooded &&
      !!facts.pierId &&
      !!(facts.board || facts.unload);
  dock.hidden = !visible;
  dock.inert = !visible;
  if (!visible) return;
  dock.setAttribute('aria-label', `Passenger actions at ${facts.name}`);
  dock.innerHTML =
    (facts.board
      ? `<button id="board" aria-haspopup="dialog" aria-label="${facts.boardLabel}; choose passengers">${controlContent('board', 'Board')}</button>`
      : '') +
    (facts.unload
      ? `<button id="unload" aria-haspopup="dialog" aria-label="${facts.unloadLabel}; choose passengers">${controlContent('unload', facts.home ? 'Bring home' : 'Let ashore')}</button>`
      : '');
  if (facts.board) setControl($('board'), 'board', 'Board', 'action');
  if (facts.unload) setControl($('unload'), 'unload', facts.home ? 'Bring home' : 'Let ashore', facts.home ? 'warm' : 'action');
  if (facts.board)
    $('board').onclick = (event) => {
      event.stopPropagation();
      openDialog('action', { type: 'board', passengerIds: [...facts.boardOptions] }, 'board');
    };
  if (facts.unload)
    $('unload').onclick = (event) => {
      event.stopPropagation();
      openDialog('action', facts.unload!, 'unload');
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
  $('status-toggle').hidden = s.status === 'won';
  $('selection-hint').hidden = s.status === 'won' || !!locationSelection;
  $('selection-leader').hidden = s.status === 'won';
  $('status-toggle').onclick = () => openDialog('forecast', undefined, 'status-toggle');
  renderLocation();
  renderDock();
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
    world.poses.undo();
    locationSelection = null;
    selectionOrigin = null;
    actionOrigin = null;
    sound.resetActionEffects();
    sound.reconcileState(session.state, level);
    world.sync(session.state);
    world.backToBoat();
    render();
    focusAvailable('undo');
    $('announcement').textContent = `Undid action. ${session.state.turn} actions completed.`;
  }
}
function restart() {
  if (session.busy) return;
  if (dialog.open) closeDialog(false);
  if (session.restart()) {
    world.poses.reset();
    locationSelection = null;
    selectionOrigin = null;
    actionOrigin = null;
    sound.resetActionEffects();
    sound.reconcileState(session.state, level);
    world.sync(session.state);
    world.backToBoat();
    render();
    focusAvailable('menu');
  }
}
function positionDialog() {
  if (!dialog.open) return;
  const canvas = world.host.getBoundingClientRect();
  dialog.style.maxWidth = safeBounds.right - safeBounds.left + 'px';
  if (mode === 'action' && selected && actionAnchor) {
    const key = [
      viewport.left,
      viewport.top,
      viewport.right,
      viewport.bottom,
      world.cameraRevision,
    ].join(':');
    if (key !== placementViewportKey) {
      if (placementViewportKey) {
        const trigger = $(returnId);
        if (trigger?.getClientRects().length && !trigger.closest('[hidden]')) {
          const rect = trigger.getBoundingClientRect();
          actionAnchor = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        } else if (actionPlace) {
          const point = world.project(
            level.nodes.find((node) => node.id === actionPlace)!.positionXZ,
          );
          const x = Math.max(
            safeBounds.left + 24,
            Math.min(safeBounds.right - 24, point.x + canvas.left + actionAnchorOffset.x),
          );
          const y = Math.max(
            safeBounds.top + 24,
            Math.min(safeBounds.bottom - 24, point.y + canvas.top + actionAnchorOffset.y),
          );
          actionAnchor = { left: x - 24, right: x + 24, top: y - 24, bottom: y + 24 };
        }
      }
      actionPlacement = null;
      placementViewportKey = key;
    }
    dialog.style.setProperty('--dialog-max-height', safeBounds.bottom - safeBounds.top + 'px');
    const transfer = selected.type === 'board' || selected.type === 'unload';
    if (transfer) dialog.style.height = Math.min(380, safeBounds.bottom - safeBounds.top) + 'px';
    else dialog.style.removeProperty('height');
    const rect = dialog.getBoundingClientRect();
    actionPlacement = placeActionCard(rect.width, rect.height, safeBounds, actionAnchor, {
      portrait: canvas.width < canvas.height,
      previous: actionPlacement,
    });
    if (transfer && canvas.width < canvas.height) {
      actionPlacement = {
        ...actionPlacement,
        top: safeBounds.bottom - rect.height,
        bottom: safeBounds.bottom,
        layout: 'sheet',
      };
    } else if (transfer && canvas.height <= 360) {
      const nearLeft =
        (actionAnchor.left + actionAnchor.right) / 2 < (safeBounds.left + safeBounds.right) / 2;
      const left = nearLeft ? safeBounds.left : safeBounds.right - rect.width;
      actionPlacement = {
        left,
        right: left + rect.width,
        top: safeBounds.top,
        bottom: safeBounds.top + rect.height,
        layout: 'sheet',
      };
    }
    dialog.dataset.layout = actionPlacement.layout;
    dialog.style.left = actionPlacement.left + 'px';
    dialog.style.top = actionPlacement.top + 'px';
    dialog.style.right = 'auto';
    dialog.style.bottom = 'auto';
    if (actionPlace) {
      const point = world.project(level.nodes.find((node) => node.id === actionPlace)!.positionXZ);
      const stage = $('seascape').getBoundingClientRect();
      const label = labelLayout.get(actionPlace);
      const x = label ? (label.left + label.right) / 2 : point.x + canvas.left - stage.left,
        y = label ? (label.top + label.bottom) / 2 : point.y + canvas.top - stage.top;
      const endX =
        Math.max(actionPlacement.left, Math.min(actionPlacement.right, x + stage.left)) -
        stage.left;
      const endY =
        Math.max(actionPlacement.top, Math.min(actionPlacement.bottom, y + stage.top)) - stage.top;
      $('selection-leader').innerHTML =
        '<line x1="' + x + '" y1="' + y + '" x2="' + endX + '" y2="' + endY + '" />';
    }
    return;
  }
  dialog.dataset.layout = 'floating';
  dialog.style.removeProperty('height');
  dialog.style.removeProperty('left');
  dialog.style.removeProperty('top');
  dialog.style.removeProperty('right');
  dialog.style.removeProperty('bottom');
  dialog.style.setProperty('--dialog-max-height', safeBounds.bottom - safeBounds.top + 'px');
  dialog.dataset.side = 'right';
  const preferred = dialog.getBoundingClientRect();
  const left = Math.max(
    safeBounds.left,
    Math.min(safeBounds.right - preferred.width, preferred.left),
  );
  const top = Math.max(
    safeBounds.top,
    Math.min(safeBounds.bottom - preferred.height, preferred.top),
  );
  dialog.style.left = left + 'px';
  dialog.style.top = top + 'px';
  dialog.style.right = 'auto';
  dialog.style.bottom = 'auto';
  if (session.state.status === 'won') {
    if (mode === 'terminal' && dialog.open) {
      const rect = dialog.getBoundingClientRect();
      world.setCompletionBounds({
        left: rect.left - canvas.left,
        right: rect.right - canvas.left,
        top: rect.top - canvas.top,
        bottom: rect.bottom - canvas.top,
      });
    }
  }
}
function positionMap() {
  if (session.state.status === 'won') {
    labelLayout.clear();
    labelLayoutKey = '';
    cardPlacement = null;
    dockPlacement = null;
    protectedBounds = [];
    positionDialog();
    return;
  }
  const canvas = world.host.getBoundingClientRect(),
    stage = $('seascape').getBoundingClientRect();
  const frame = world.layoutFrameStatus();
  const atLocal = (r: Rectangle): Rectangle => ({
    left: r.left + canvas.left - stage.left,
    right: r.right + canvas.left - stage.left,
    top: r.top + canvas.top - stage.top,
    bottom: r.bottom + canvas.top - stage.top,
  });
  const toLocal = (r: Rectangle): Rectangle => ({
    left: r.left - stage.left,
    right: r.right - stage.left,
    top: r.top - stage.top,
    bottom: r.bottom - stage.top,
  });
  const figures = [frame.boat, ...frame.passengers].map(atLocal);
  const chrome = [
    document.querySelector<HTMLElement>('.hud')!,
    viewControls,
    ...(!$('status-toggle').hidden ? [$('status-toggle')] : []),
  ].map((e) => toLocal(e.getBoundingClientRect()));
  const bounds = toLocal(safeBounds);
  bounds.top = Math.max(bounds.top, chrome[0].bottom + 6);
  bounds.bottom = Math.max(
    bounds.top + 80,
    Math.min(bounds.bottom, ...chrome.slice(1).map((r) => r.top - 6)),
  );
  const markers = endpointTargets(
    level.nodes.map((node) => {
      const point = world.project(node.positionXZ);
      return {
        id: node.id,
        x: point.x + canvas.left - stage.left,
        y: point.y + canvas.top - stage.top,
      };
    }),
  );
  const placed: Rectangle[] = [];
  const leaders: string[] = [];
  const layoutKey = [canvas.width, canvas.height, world.layoutRevision, session.state.turn].join(
    ':',
  );
  if (labelLayoutKey !== layoutKey) {
    labelLayoutKey = layoutKey;
    labelLayout.clear();
  }
  const dimensionsKey = [
    canvas.width,
    canvas.height,
    innerWidth,
    innerHeight,
    devicePixelRatio,
  ].join(':');
  if (labelDimensionsKey !== dimensionsKey) {
    labelDimensions.clear();
    labelDimensionsKey = dimensionsKey;
  }
  const labels = level.nodes.flatMap((node) => {
    const group = $('stop-' + node.id);
    if (!group) return [];
    const name = group.querySelector<HTMLElement>('.map-name')!;
    let dimensions = labelDimensions.get(node.id);
    if (dimensions?.element !== name) {
      dimensions = { element: name, width: name.offsetWidth, height: name.offsetHeight };
      labelDimensions.set(node.id, dimensions);
    }
    return [{ id: node.id, group, name, width: dimensions.width, height: dimensions.height }];
  });
  const hint = $('selection-hint'),
    hintBounds = hint.hidden ? null : toLocal(hint.getBoundingClientRect());
  for (const { id, group, name, width: w, height: h } of labels) {
    const marker = markers.find((m) => m.id === id)!;
    const visible =
      marker.x >= bounds.left &&
      marker.x <= bounds.right &&
      marker.y >= bounds.top &&
      marker.y <= bounds.bottom;
    group.style.opacity = visible ? '1' : '0';
    group.style.pointerEvents = visible ? '' : 'none';
    group.classList.toggle('offscreen', !visible);
    group.style.setProperty('--target-size', marker.size + 'px');
    group.style.left = marker.bounds.left + 'px';
    group.style.top = marker.bounds.top + 'px';
    if (!visible) continue;
    const place = atLocal(frame.places.find((place) => place.id === id)!);
    const preferred: [number, number][] = [
      [marker.x - w / 2, place.top - h - 6],
      [marker.x - w / 2, marker.bounds.bottom + 8],
      [place.right + 8, place.top],
      [place.left - w - 8, place.top],
    ];
    const candidates = preferred.map(([x, y]) => {
      const left = Math.max(bounds.left, Math.min(bounds.right - w, x));
      const top = Math.max(bounds.top, Math.min(bounds.bottom - h, y));
      return { left, top, right: left + w, bottom: top + h };
    });
    const avoid = [...figures, ...placed, ...(hintBounds ? [hintBounds] : [])];
    const score = (choice: Rectangle) =>
      avoid.filter((r) => overlaps(choice, r, 2)).length * 200 +
      Math.hypot(choice.left - preferred[0][0], choice.top - preferred[0][1]);
    const choice = labelLayout.get(id) ?? candidates.sort((a, b) => score(a) - score(b))[0];
    labelLayout.set(id, choice);
    name.style.left = choice.left - marker.bounds.left + 'px';
    name.style.top = choice.top - marker.bounds.top + 'px';
    placed.push(choice, marker.bounds);
    const x = Math.max(choice.left, Math.min(choice.right, marker.x)),
      y = Math.max(choice.top, Math.min(choice.bottom, marker.y));
    if (Math.hypot(x - marker.x, y - marker.y) > 20)
      leaders.push(
        '<line x1="' + marker.x + '" y1="' + marker.y + '" x2="' + x + '" y2="' + y + '" />',
      );
  }
  if ($('map-leaders')) $('map-leaders').innerHTML = leaders.join('');
  dockPlacement = null;
  const dock = $('dock-actions');
  if (!dock.hidden) {
    const boat = atLocal(frame.boat),
      visible =
        boat.right > bounds.left &&
        boat.left < bounds.right &&
        boat.bottom > bounds.top &&
        boat.top < bounds.bottom;
    dock.style.visibility = visible ? 'visible' : 'hidden';
    dock.dataset.layout = 'row';
    if (dock.offsetWidth > bounds.right - bounds.left) dock.dataset.layout = 'column';
    const choice = placeActionCard(dock.offsetWidth, dock.offsetHeight, bounds, boat, {
      avoid: [...figures, ...placed],
    });
    dockPlacement = choice;
    dock.style.left = choice.left + 'px';
    dock.style.top = choice.top + 'px';
    placed.push(choice);
  }
  cardPlacement = null;
  if (locationSelection && !$('local-context').hidden) {
    const local = $('local-context'),
      marker = markers.find((m) => m.id === locationSelection)!;
    local.style.width = Math.min(330, bounds.right - bounds.left) + 'px';
    local.style.setProperty('--local-max-height', Math.max(80, bounds.bottom - bounds.top) + 'px');
    protectedBounds = [...figures, ...chrome];
    const choice = placeActionCard(local.offsetWidth, local.offsetHeight, bounds, marker.bounds, {
      portrait: canvas.width < canvas.height,
      avoid: [
        ...figures,
        ...markers.filter((m) => m.id !== locationSelection).map((m) => m.bounds),
        ...(dockPlacement ? [dockPlacement] : []),
      ],
    });
    cardPlacement = choice;
    local.style.left = choice.left + 'px';
    local.style.top = choice.top + 'px';
    const x = Math.max(choice.left, Math.min(choice.right, marker.x)),
      y = Math.max(choice.top, Math.min(choice.bottom, marker.y));
    $('selection-leader').innerHTML =
      '<line x1="' + marker.x + '" y1="' + marker.y + '" x2="' + x + '" y2="' + y + '" />';
  } else if (!dialog.open) {
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
};
world.onTransferContact = (contact) =>
  sound.transferContact({
    weight: contact.passengerIds.some(
      (id) => level.passengers.find((p) => p.id === id)?.species === 'sheep',
    )
      ? 'full'
      : 'light',
    settle: contact.stage === 'settling',
    compact: contact.reduced,
    count: contact.passengerIds.length,
  });
world.onArrival = () => {
  sound.delivery();
  sound.settleArrangement();
};
world.onViewChange = scheduleLayout;
world.onFrame = () => {
  if (layoutRequest) flushLayout();
};
$('view-toggle').onclick = () => {
  if (dialog.open) return;
  if (world.viewStatus().mode === 'overview') clearLocation();
  world.setViewMode(world.viewStatus().mode === 'overview' ? 'play' : 'overview');
  scheduleLayout();
};
$('back-to-boat').onclick = () => {
  if (dialog.open) return;
  clearLocation();
  world.backToBoat();
  $('view-toggle').focus({ preventScroll: true });
  scheduleLayout();
};
const panGesture = new PanGesture();
let panPointer: number | null = null;
let suppressPanClick = false;
const canvas = world.renderer.domElement;
document.addEventListener(
  'pointerdown',
  (event) => {
    suppressPanClick = false;
    if (panPointer !== null && event.pointerId !== panPointer) {
      panGesture.start(event.pointerId, event.clientX, event.clientY);
      panGesture.end(panPointer, true);
      panGesture.end(event.pointerId, true);
      const owner = panPointer;
      panPointer = null;
      if (canvas.hasPointerCapture(owner)) canvas.releasePointerCapture(owner);
      suppressPanClick = true;
    }
  },
  true,
);
canvas.addEventListener('pointerdown', (event) => {
  if (blocked() || session.state.status !== 'playing' || event.button !== 0 || !event.isPrimary)
    return;
  const rect = canvas.getBoundingClientRect();
  if (world.pickAt(event.clientX - rect.left, event.clientY - rect.top)) return;
  if (!panGesture.start(event.pointerId, event.clientX, event.clientY)) return;
  panPointer = event.pointerId;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (panPointer !== event.pointerId) return;
  const delta = panGesture.move(event.pointerId, event.clientX, event.clientY);
  if (delta) {
    world.panByPixels(delta.x, delta.y);
    scheduleLayout();
  }
});
const endPan = (event: PointerEvent) => {
  if (panPointer !== event.pointerId) return;
  suppressPanClick = panGesture.end(event.pointerId, event.type !== 'pointerup');
  panPointer = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
};
canvas.addEventListener('pointerup', endPan);
canvas.addEventListener('pointercancel', endPan);
canvas.addEventListener('lostpointercapture', (event) => {
  if (panPointer === event.pointerId) endPan(event);
});
canvas.addEventListener(
  'click',
  (event) => {
    if (suppressPanClick) {
      suppressPanClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true,
);
const layoutObserver = new ResizeObserver(scheduleLayout);
layoutObserver.observe(world.host);
layoutObserver.observe(document.querySelector('.hud')!);
layoutObserver.observe(viewControls);
layoutObserver.observe($('status-toggle'));
const refreshLabelFonts = () => {
  labelDimensions.clear();
  labelLayoutKey = '';
  scheduleLayout();
};
document.fonts.addEventListener('loadingdone', refreshLabelFonts);
document.fonts.addEventListener('loadingerror', refreshLabelFonts);
const viewportChanged = () => {
  scheduleLayout();
  fullscreenSupport.observe('resize');
};
addEventListener('resize', viewportChanged);
visualViewport?.addEventListener('resize', viewportChanged);
visualViewport?.addEventListener('scroll', scheduleLayout);
document.addEventListener('fullscreenchange', () => {
  fullscreenSupport.changed();
  renderFullscreen();
  flushLayout();
  restoreHighlight();
  requestAnimationFrame(() => {
    flushLayout();
    fullscreenSupport.observe('fullscreen-frame');
  });
});
document.addEventListener('fullscreenerror', () => fullscreenSupport.observe('fullscreenerror'));
dialog.addEventListener('cancel', (e) => {
  e.preventDefault();
  if (mode === 'settings') backFromSettings();
  else closeDialog(true);
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
    if (['Tab', 'Enter', ' ', 'Escape'].includes(e.key)) {
      keyboardInput = true;
      if (!e.repeat) {
        viewFence = null;
        if (e.key === 'Enter' || e.key === ' ') captureSoundIntent(e.target);
        else soundIntent = null;
      }
    }
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
  },
  true,
);
document.addEventListener(
  'pointerdown',
  (e) => {
    if (
      viewFence &&
      performance.now() < viewFence.until &&
      Math.hypot(e.clientX - viewFence.x, e.clientY - viewFence.y) <= 24
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    viewFence = null;
    if (
      closingFence?.scope === 'dismiss' &&
      performance.now() < closingFence.until &&
      !dialog.open &&
      e.clientX >= closingFence.rect.left &&
      e.clientX <= closingFence.rect.right &&
      e.clientY >= closingFence.rect.top &&
      e.clientY <= closingFence.rect.bottom
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    keyboardInput = false;
    lastPointer = { x: e.clientX, y: e.clientY, control: (e.target as Element).closest('button') };
    captureSoundIntent(e.target);
  },
  true,
);
document.addEventListener(
  'click',
  (e) => {
    if (suppressPanClick && e.isTrusted && e.detail > 0) {
      suppressPanClick = false;
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (
      viewFence &&
      e.isTrusted &&
      e.detail > 0 &&
      performance.now() < viewFence.until &&
      Math.hypot(e.clientX - viewFence.x, e.clientY - viewFence.y) <= 24
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
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
        return;
      }
    }
    if (e.isTrusted && !audioControl(e.target)) {
      soundIntent = null;
      activateSound();
    }
  },
  true,
);
document.addEventListener('pointerup', (event) => {
  if (event.isTrusted && suppressPanClick && event.target === canvas && event.isPrimary)
    activateSound();
});
document.addEventListener('pointercancel', () => {
  soundIntent = null;
});
document.addEventListener('visibilitychange', () => {
  sound.visibility(document.hidden);
  if (document.hidden) {
    world.settleHomecoming();
    world.clearMovement();
  }
  if (document.hidden && session.busy) {
    const id = activeTransition?.id;
    world.cancel('visibility');
    if (session.busy && id !== undefined) finish(id, 'visibility');
  }
});
addEventListener('pagehide', () => {
  pageDisposed = true;
  sound.onChange = null;
  layoutObserver.disconnect();
  document.fonts.removeEventListener('loadingdone', refreshLabelFonts);
  document.fonts.removeEventListener('loadingerror', refreshLabelFonts);
  cancelAnimationFrame(layoutRequest);
  clearTimeout(noticeTimer);
  unsubscribeMotion();
  motion.dispose();
  sound.dispose();
  world.dispose();
});
addEventListener('pageshow', (event) => {
  if (event.persisted) location.reload();
});
updateViewport();
render();
scheduleLayout();
if (import.meta.env.DEV)
  Object.assign(window, {
    __LAST_FERRY__: {
      getState: () => copy(session.state),
      getLegalActions: () => copy(legalActions(session.state, level)),
      getRenderStatus: () => ({
        pendingAnimation: session.busy,
        historyLength: session.history.length,
        poseHistoryLength: world.poses.history.length,
        passengers: world.passengerPresentation(),
        boatPosition: world.boatRoot.position.toArray(),
        waterY: world.water.position.y,
        hullY: world.hull.position.y,
      }),
      getFrameStatus: () => world.frameStatus(),
      getViewStatus: () => copy(world.viewStatus()),
      getViewportStatus: () =>
        copy({
          viewport,
          safe: safeBounds,
          usable: usableBounds,
          canvas: world.host.getBoundingClientRect().toJSON(),
          hud: document.querySelector('.hud')!.getBoundingClientRect().toJSON(),
          fullscreen: document.fullscreenElement === app,
        }),
      getActionPlacement: () =>
        copy({
          anchor: actionAnchor,
          panel: actionPlacement,
          bounds: safeBounds,
          layout: actionPlacement?.layout,
          selected,
          mode,
        }),
      getHomecomingStatus: () => world.homecomingPresentation(),
      setLighthouseComparisonPhase: (phase: number | null) => {
        world.effects.comparisonPhase = phase !== null && Number.isFinite(phase) ? phase : null;
      },
      getMotionStatus: () => ({ mode: motion.mode, reduced: motion.reduced }),
      getTransferStatus: () => world.transferPresentation(),
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
          dockPlacement,
          labels: [...labelLayout].map(([id, bounds]) => ({ id, ...bounds })),
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
      getFullscreenStatus: () => fullscreenSupport.details(),
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
