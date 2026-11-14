import './style.css';
import './ui/cove-ui.css';
import './ui/play-controls.css';
import './ui/view-controls.css';
import './ui/mobile-map-controls.css';
import { besideOwner, atScreenEdge } from './ui/owned-control';
import { occupiedPierDeadline } from './game/rescue-facts';
import {
  controlContent,
  iconMarkup,
  passengerChoiceContent,
  observePassengerPortraits,
  setControl,
  type CoveIcon,
  type CoveFace,
} from './ui/cove-ui';
import { resolvePassengerAppearance } from './game/passenger-appearance';
import { level as baseline, holdingPier, levelNames } from './levels/level';
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
  currentNotice,
  draftBandsCopy,
  objectiveCopy,
  passageCopy,
  statusCopy,
  forecastCopy,
  previewCopy,
  passengerList,
} from './ui/presentation';
import { Session } from './game/session';
import { MasteryStore, masteryTargets } from './game/mastery';
import { masteryResultMarkup, masteryBadgeMarkup, masteryCriteriaMarkup } from './ui/lanterns';
import { World } from './scene/world';
import { Sound } from './audio/sound';
import {
  restrainedTiming,
  slowerTiming,
  type CompletionReason,
  type TransitionPlan,
} from './scene/transitions';
import { waterPresets, type WaterTuning } from './scene/water';
import { placeActionCard, placeLocalCard, overlaps, type Rectangle } from './ui/placement';
import { locationFacts } from './ui/location';
import { placeCoveTargets, placeCoveNames } from './ui/cove-layout';
import { samplePath } from './scene/paths';
import { MotionPreference, type MotionMode } from './ui/motion-preference';
import { TipsPreference } from './ui/tips-preference';
import { PanGesture } from './ui/pan-gesture';
import { visibleViewport, insetRectangle } from './ui/viewport';
import { FullscreenSupport } from './ui/fullscreen';
import {
  storyCoves,
  practiceCoves,
  storyScenes,
  scenePredecessor,
  type SceneId,
} from './campaign/registry';
import {
  JourneyProgress,
  acceptCove,
  legacyContinuationScene,
  checkpointCove,
  type JourneyRecord,
} from './campaign/progress';
import { StoryPresentation, restoredHarbor } from './campaign/presentation';
import { StoryView } from './campaign/story-view';
import './campaign/story.css';

import './campaign/home.css';

import { transferFacts, transferReceipt } from './ui/transfer';

const cove = new URLSearchParams(location.search).get('cove');
let journey = cove === null ? new JourneyProgress() : null;
const mastery = new MasteryStore();
let campaignPlay = false;
let level = practiceCoves.find((entry) => entry.id === cove) ?? holdingPier;
let experiment = level.id === 'holding-pier';
let isBellwater = level.id === 'bellwater';
let { nodeNames, passengerNames } = levelNames(level);
let homeNodeId = level.piers.find((pier) => pier.id === level.objective.deliveryPierId)!.nodeId;
let title = level.id === baseline.id ? 'The First Crossing' : level.title;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.classList.add('cove-kit');
observePassengerPortraits(app);
app.innerHTML = `<main class="game ${experiment ? 'holding' : isBellwater ? 'bellwater' : 'baseline'}"><section id="seascape" aria-label="${level.title}" aria-busy="false"><div id="world"></div><button id="load-toggle" aria-expanded="false" aria-controls="crossing-details" aria-label="Crossing status"></button><section id="crossing-details" class="cove-panel cove-surface cove-surface--compact" aria-label="Crossing details" hidden><div class="identity"><h1>${title}</h1><p id="objective"></p></div><div id="readout" aria-label="Crossing progress"></div><button id="close-status">Close status</button></section><nav class="tools" aria-label="Crossing controls"><button id="undo">↶ Undo</button><button id="wait">Wait <span>· 1 action</span></button><button id="menu">Menu</button><button id="sound-toggle" aria-label="Mute sound" aria-pressed="false">♫</button></nav><nav id="map-labels" aria-label="Map stops"></nav><nav id="dock-actions" aria-label="Passenger actions" hidden></nav><section id="local-context" role="region" aria-label="Selected place" tabindex="-1" hidden></section><p id="selection-hint">Select a place to see its options.</p><svg id="selection-leader" aria-hidden="true"></svg><button id="status-toggle" aria-haspopup="dialog" aria-label="Open tide and pier forecast"></button><p id="transition-status" role="status" tabindex="-1" hidden>Finishing this action…</p><p class="portrait-note">Turn sideways for a wider view.</p></section><div id="announcement" class="sr-only" role="status" aria-live="polite"></div></main><dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog>`;

const homeSurface = document.createElement('section');

homeSurface.id = 'home';

homeSurface.hidden = true;

homeSurface.setAttribute('aria-label', 'Last Ferry home');

app.append(homeSurface);

const receipt = document.createElement('div');

receipt.id = 'transfer-receipt';

receipt.hidden = true;

receipt.setAttribute('aria-hidden', 'true');

app.append(receipt);

let receiptTimer: ReturnType<typeof setTimeout> | undefined;

let pendingReceipt: { id: number; title: string; depth: string } | null = null;

function clearReceipt() {
  clearTimeout(receiptTimer);

  pendingReceipt = null;

  receipt.hidden = true;
}

const $ = (id: string) => document.getElementById(id)!;
for (const [id, icon, label] of [
  ['undo', 'undo', 'Undo'],
  ['wait', 'wait', 'Wait'],
  ['menu', 'menu', 'Menu'],
] as const)
  setControl($(id), icon, label);
setControl($('menu'), 'menu', 'Menu', 'quiet', true);
$('wait').setAttribute('aria-label', 'Wait · 1 action');
$('wait').title = 'Wait · 1 action';
$('menu').title = 'Menu';
setControl($('load-toggle'), null, '0/4 · Depth 1', 'quiet');
setControl($('close-status'), 'close', 'Close status', 'quiet');
$('local-context').classList.add('cove-panel', 'cove-surface', 'cove-surface--compact');
$('status-toggle').classList.add('cove-panel', 'cove-surface', 'cove-surface--compact');
let session = new Session(level);
const sound = new Sound();
let world = new World($('world'), session.state, level);
const motion = new MotionPreference(matchMedia('(prefers-reduced-motion: reduce)'));
const tips = new TipsPreference();
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
  '<button id="view-toggle" aria-pressed="false">Whole cove</button><button id="view-zoom" aria-label="Adjust map zoom" aria-expanded="false" aria-controls="zoom-tools">Zoom</button><button id="back-to-boat" hidden>Back to boat</button><div id="zoom-tools" role="group" aria-label="Map zoom" hidden><button id="zoom-out" aria-label="Zoom out">−</button><output id="zoom-level" aria-live="polite"></output><button id="zoom-in" aria-label="Zoom in">+</button></div>';
$('seascape').append(viewControls);
setControl($('view-zoom'), null, 'Zoom');
setControl($('zoom-in'), null, '+');
setControl($('zoom-out'), null, '−');
setControl($('back-to-boat'), 'back-to-boat', 'Back to boat');
$('seascape').querySelector('.portrait-note')?.remove();
const viewNotice = document.createElement('p');
viewNotice.id = 'view-notice';
viewNotice.role = 'status';
viewNotice.hidden = true;
$('seascape').append(viewNotice);
type JourneyMode =
  'journey' | 'story' | 'transcript' | 'practice' | 'replace' | 'return-title' | 'journey-end';
type DialogMode = 'action' | 'forecast' | 'menu' | 'terminal' | 'settings' | JourneyMode;
let mode: DialogMode | null = null,
  selected: Action | null = null,
  returnId = '',
  keyboardInput = false;
let settingsParent: 'menu' | 'terminal' | JourneyMode = 'menu';
let storyId: SceneId | null = null;
let storyView: StoryView | null = null;
let storyUiKey = '';
let storyFrameRequest = 0;

let storyActionIntent: string | null = null;

const storyActionKey = () => `${storyId}:${storyPresentation.frame.shotIndex}`;

const storyPresentation = new StoryPresentation(
  () => renderStoryStatus(),
  (token) => {
    stopStoryClock();
    if (token === null) sound.cancelStoryRun();
    else sound.beginStoryRun(token);
  },
  (token, cue) => sound.storyCue(token, cue.kind, cue.strength, cue.id),
);
type SoundIntent = 'enable' | 'retry' | 'mute';
let soundIntent: { control: HTMLElement; intent: SoundIntent } | null = null;
let viewFence: { x: number; y: number; until: number } | null = null;
let locationSelection: string | null = null;
let locationDetails = false;
let emphasis: string | undefined;
let selectionOrigin: { x: number; y: number } | null = null;
let actionOrigin: { x: number; y: number } | null = null;
let lastPointer: { x: number; y: number; control: Element | null } | null = null;
let cardPlacement: Rectangle | null = null;
let protectedBounds: Rectangle[] = [];
let labelLayout = new Map<string, Rectangle>();
let labelAnchors = new Map<string, number>();
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
let overviewObstaclesKey = '';
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

function journeySurface() {
  return app.classList.contains('journey-screen');
}

function setHomeVisible(active: boolean) {
  homeSurface.hidden = !active;

  app.classList.toggle('home-screen', active);

  world.setHomePresentation(active);
}

function homeCheckpointNotice(record: JourneyRecord, newEntry: SceneId | null) {
  if (newEntry === 'among-the-reeds') {
    if (record.completed.includes('wide-berth')) return 'Two Shelters is next. Wide Berth is already safe.';
    if (record.acknowledgedScenes.includes('a-wider-deck')) return 'Visit Two Shelters first, then resume Wide Berth.';
    return 'Two Shelters now comes before Nell’s launch.';
  }
  if (newEntry) return `${storyScenes[newEntry].title} · new story waiting.`;
  const checkpoint = record.checkpoint;
  if (checkpoint.kind === 'complete') return 'Six coves are safe.';
  if (checkpoint.kind === 'scene') return `${storyScenes[checkpoint.id].title} · saved story.`;
  return `${storyCoves.find((entry) => entry.id === checkpoint.id)!.level.title} · from cove start.`;
}

function continueSavedJourney() {
  const freshEntry = journey?.continueAvailableContent();
  resumeJourney(!freshEntry);
}

function keepMastery(from = session) {
  const result = from.takeResult();
  if (!result) return;
  mastery.accept(result);
  if (mastery.issue) notifyView(mastery.issue);
}

function masteryNotice() {
  return mastery.issue ? `<p class="mastery-notice" role="status">${mastery.issue}</p>` : '';
}

function visitPractice(next: typeof level) {
  if (session.busy) return;
  startPlayable(next, false);
  if (new URLSearchParams(location.search).has('cove')) {
    const address = new URL(location.href);
    address.searchParams.set('cove', next.id);
    history.replaceState(null, '', address);
  }
}

function showHome(focusId?: string) {
  clearReceipt();

  storyPresentation.cancel();

  storyId = null;

  if (dialog.open) closeDialog(false);

  mode = 'journey';

  campaignPlay = false;

  app.classList.add('journey-screen');

  $('seascape').inert = true;

  world.setStoryCovered(false);

  setHomeVisible(true);

  const snapshot = journey?.snapshot;

  const checkpoint = snapshot?.record?.checkpoint;

  const newEntry = legacyContinuationScene(snapshot?.record);
  const complete = checkpoint?.kind === 'complete' && !newEntry;

  const invalid = snapshot?.kind === 'invalid';

  const label = complete
    ? 'Play a cove'
    : checkpoint
      ? 'Continue'
      : invalid
        ? 'New journey'
        : 'Play';

  const notice = snapshot?.record ? homeCheckpointNotice(snapshot.record, newEntry) : '';

  homeSurface.innerHTML = `<header id="home-title"><h1>Last Ferry</h1><p>The Long Tide</p></header><nav id="home-menu" aria-label="Home"><p class="home-notice">${notice}${snapshot && !snapshot.persistent ? ' Progress lasts only for this visit.' : ''}${invalid ? ` ${snapshot.issue}` : ''}</p><button id="home-play">${label}</button><div class="home-secondary"><button id="home-options">Options</button><button id="home-practice">Practice</button></div><div class="home-secondary"><button id="home-sound"></button>${checkpoint ? '<button id="home-new">New journey</button>' : ''}</div>${masteryNotice()}</nav>`;

  for (const button of homeSurface.querySelectorAll<HTMLButtonElement>('button'))
    setControl(
      button,
      button.id === 'home-options' ? 'settings' : null,
      button.textContent ?? '',
      button.id === 'home-play' ? 'warm' : 'quiet',
    );

  const fresh = () =>
    invalid || checkpoint ? showJourney('replace', 'journey-replace-cancel') : beginJourney();

  $('home-play').onclick = (event) => {
    if (event.detail > 1) return;

    if (complete) showJourney('practice', 'practice-first-crossing');
    else if (checkpoint) continueSavedJourney();
    else fresh();
  };

  $('home-options').onclick = () => openSettings('journey');

  $('home-practice').onclick = () => showJourney('practice', 'practice-first-crossing');

  $('home-sound').onclick = toggleSound;

  if ($('home-new')) $('home-new').onclick = fresh;

  renderSound();

  flushLayout();

  if (focusId || keyboardInput)
    ($(focusId ?? 'home-play') ?? $('home-play')).focus({ preventScroll: true });
}

function showJourney(next: JourneyMode, focusId: string) {
  if (next === 'journey') {
    showHome(focusId === 'journey-new' ? 'home-new' : 'home-play');
    return;
  }

  clearReceipt();

  if (next === 'story' || next === 'journey-end') setHomeVisible(false);

  if (mode === 'story' && next !== 'story') storyPresentation.cancel();
  if (next !== 'return-title') {
    app.classList.add('journey-screen');

    $('seascape').inert = true;

    world.setStoryFraming(true);
  }
  world.setStoryCovered(next === 'story');
  if (dialog.open) switchDialog(next, focusId);
  else {
    mode = next;
    selected = null;
    renderDialog();
    dialog.showModal();
    $(focusId).focus({ preventScroll: true });
  }
  flushLayout();
}
function returnToJourneyTitle() {
  if (session.busy) return;
  const departing = session;
  storyPresentation.cancel();
  storyId = null;
  campaignPlay = false;

  if (!app.classList.contains('home-screen')) mountCove(holdingPier);
  keepMastery(departing);
  journey ??= new JourneyProgress();
  history.replaceState(null, '', location.pathname);
  showHome(mode === 'practice' ? 'home-practice' : undefined);
}
function beginJourney() {
  journey?.replace();
  resumeJourney(false);
}
function resumeJourney(restored = true) {
  const checkpoint = journey?.snapshot.record?.checkpoint;
  if (!checkpoint) return;
  campaignPlay = true;
  if (checkpoint.kind === 'complete') {
    if (restored) {
      const destination = storyCoves.find(
        (entry) => entry.id === checkpointCove(journey!.snapshot.record!),
      )!.level;
      mountCove(destination);
      world.sync(restoredHarbor(destination));
    }
    showJourney('journey-end', 'journey-title');
    return;
  }
  if (checkpoint.kind === 'scene') {
    storyId = checkpoint.id;
    const previous = scenePredecessor(storyId);
    if (storyId === 'opening' || restored || level.id !== previous.id) {
      mountCove(previous);
      if (storyId !== 'opening') world.sync(restoredHarbor(previous));
    }
    storyPresentation.start(
      storyId,
      motion.reduced || document.hidden,
      performance.now(),
      restored,
    );
    showJourney('story', 'story-continue');
    renderStoryStatus();
    return;
  }
  startPlayable(storyCoves.find((entry) => entry.id === checkpoint.id)!.level, true);
}
function startPlayable(next: typeof level, story: boolean) {
  if (session.busy) return;
  const departing = session;
  storyPresentation.cancel();
  storyView = null;
  world.clearStory();
  storyId = null;
  campaignPlay = story;
  if (dialog.open) closeDialog(false);
  app.classList.remove('journey-screen');

  $('seascape').inert = false;

  setHomeVisible(false);

  mountCove(next);
  keepMastery(departing);
  world.setReducedMotion(motion.reduced);
  if (!keyboardInput && lastPointer)
    viewFence = { x: lastPointer.x, y: lastPointer.y, until: performance.now() + 180 };
  flushLayout();
  focusAvailable('menu');
}
function continueStory() {
  if (mode !== 'story' || !storyId) return;
  if (!storyPresentation.frame.final) {
    storyPresentation.next(motion.reduced || document.hidden);
    $('story-continue').focus({ preventScroll: true });
    return;
  }
  const id = storyId;
  if (!journey?.acknowledge(id)) return;
  resumeJourney();
}
function acceptStoryCove() {
  if (!campaignPlay || session.busy || session.state.status !== 'won') return;
  const entry = storyCoves.find((candidate) => candidate.id === level.id);
  if (!entry || !journey?.accept(entry.id, session.state.status)) return;
  keepMastery();
  resumeJourney(false);
}
function renderStoryStatus() {
  if (mode !== 'story' || !storyId) return;
  const frame = storyPresentation.frame;
  const scene = storyScenes[storyId];
  const shot = scene.shots[frame.shotIndex];

  const key = `${frame.runToken}:${frame.shotIndex}:${frame.captionOpacity}:${frame.recap}:${frame.settled}:${frame.paused}`;

  if (key === storyUiKey) {
    storyView?.render(frame);
    scheduleStoryClock();
    return;
  }
  storyUiKey = key;

  const pause = $('story-pause');

  if (pause) {
    setControl(pause, null, frame.paused ? 'Resume' : 'Pause', 'quiet');

    (pause as HTMLButtonElement).disabled = motion.reduced || (frame.final && frame.settled);
  }

  const skip = $('story-skip') as HTMLButtonElement | null;
  const next = $('story-continue') as HTMLButtonElement | null;

  if (skip) skip.hidden = false;
  if (next && next.textContent !== (frame.final ? scene.continueLabel : 'Next'))
    setControl(next, null, frame.final ? scene.continueLabel : 'Next', 'warm');
  const caption = $('story-caption');
  const copy = frame.recap ? scene.shots.map((item) => item.caption).join('\n\n') : shot.caption;
  if (caption && caption.textContent !== copy) caption.textContent = copy;
  if (caption) {
    caption.style.opacity = String(frame.captionOpacity);
    caption.setAttribute('aria-hidden', String(!frame.captionVisible));
    caption.classList.toggle('story-recap', frame.recap);
  }
  const art = $('story-canvas');
  if (art?.getAttribute('aria-label') !== shot.description)
    art?.setAttribute('aria-label', shot.description);
  const position = $('story-position');
  if (position) position.textContent = `${frame.shotIndex + 1} of ${scene.shots.length}`;
  const replayScene = $('story-replay-scene');
  if (replayScene) replayScene.hidden = !frame.recap;
  if ($('story-replay')) $('story-replay').hidden = frame.recap;
  storyView?.render(frame);
  scheduleStoryClock();
}
function stopStoryClock() {
  cancelAnimationFrame(storyFrameRequest);
  storyFrameRequest = 0;
}
function scheduleStoryClock() {
  if (
    storyFrameRequest ||
    pageDisposed ||
    mode !== 'story' ||
    !storyId ||
    storyPresentation.settled ||
    storyPresentation.paused ||
    document.hidden
  )
    return;
  storyFrameRequest = requestAnimationFrame((time) => {
    storyFrameRequest = 0;
    if (mode !== 'story' || pageDisposed) return;
    storyPresentation.update(time);
    renderStoryStatus();
  });
}
function mountCove(next: typeof level) {
  overviewObstaclesKey = '';
  clearReceipt();

  storyPresentation.cancel();
  storyView = null;
  world.clearStory();
  clearTimeout(fallback);
  activeTransition = null;
  lastTransition = null;
  world.dispose();
  level = next;
  experiment = level.id === 'holding-pier';
  isBellwater = level.id === 'bellwater';
  ({ nodeNames, passengerNames } = levelNames(level));
  homeNodeId = level.piers.find((pier) => pier.id === level.objective.deliveryPierId)!.nodeId;
  title = level.id === baseline.id ? 'The First Crossing' : level.title;
  session = new Session(level);
  world = new World($('world'), session.state, level);
  world.setReducedMotion(motion.reduced);

  world.setHomePresentation(app.classList.contains('home-screen'));

  world.setStoryFraming(journeySurface());
  bindWorld();
  canvas = world.renderer.domElement;
  bindCanvas();
  panPointer = null;
  suppressPanClick = false;
  locationSelection = null;
  locationDetails = false;
  selectionOrigin = null;
  actionOrigin = null;
  actionAnchor = null;
  actionPlacement = null;
  labelDimensions.clear();
  labelAnchors.clear();
  labelDimensionsKey = '';
  closingFence = null;
  $('map-labels').replaceChildren();
  document.querySelector('.game')!.className =
    `game ${experiment ? 'holding' : isBellwater ? 'bellwater' : 'baseline'}`;
  document.querySelector('.identity h1')!.textContent = title;
  $('seascape').setAttribute('aria-label', level.title);
  sound.resetActionEffects();
  sound.reconcileState(session.state, level);
  render();
  scheduleLayout();
}

function renderJourneyDialog() {
  storyView = null;
  const snapshot = journey?.snapshot;
  const checkpointNotice = snapshot?.persistent === false
    ? 'Journey progress lasts for this visit only.'
    : 'Progress is saved between coves. An unfinished cove starts again.';
  const notice =
    snapshot && !snapshot.persistent
      ? '<p role="status">Progress is only kept for this visit. It will not survive closing.</p>'
      : '';
  let heading = 'Last Ferry',
    body = '',
    actions = '';
  if (mode === 'journey') {
    const checkpoint = snapshot?.record?.checkpoint;
    const destination =
      checkpoint?.kind === 'cove'
        ? storyCoves.find((entry) => entry.id === checkpoint.id)!.level.title
        : null;
    body = `<p class="journey-subtitle">The Long Tide</p><p>${checkpointNotice}</p>${destination ? `<p>Continue at ${destination}, from its beginning.</p>` : ''}${snapshot?.kind === 'invalid' ? `<p role="alert">${snapshot.issue} Start a new journey to replace it, or play Practice without changing it.</p>` : ''}${notice}`;
    actions = `${snapshot?.record ? `<button id="journey-continue">Continue journey${checkpoint?.kind === 'cove' ? ' · from cove start' : ''}</button>` : ''}<button id="journey-new">New journey</button><button id="journey-practice">Practice</button><button id="journey-settings">Options</button>`;
  } else if ((mode === 'story' || mode === 'transcript') && storyId) {
    renderIllustratedStory(mode === 'transcript');
    return;
  } else if (mode === 'practice') {
    heading = 'Practice coves';
    body = '<p>Independent crossings. Practice does not change your journey.</p>' +
      masteryCriteriaMarkup() + masteryNotice();
    actions =
      practiceCoves
        .map(
          (entry) =>
            `<button class="cove-button cove-button--quiet practice-row" data-practice="${entry.id}" id="practice-${entry.id}"><span class="practice-title">${entry.title}</span>${masteryBadgeMarkup(mastery.best(entry.id), journey?.snapshot.record?.completed.some(id => id === entry.id))}</button>`,
        )
        .join('') + '<button id="journey-title">Back to title</button>';
  } else if (mode === 'replace') {
    heading = 'Start a new journey?';
    body = '<p>This replaces the saved journey. Your best rescues and Sound, Motion and Tips settings are kept.</p>';
    actions =
      '<button id="journey-replace-cancel">Keep current journey</button><button id="journey-replace-confirm">Replace journey</button>';
  } else if (mode === 'return-title') {
    heading = 'Return home?';

    body = `<p>This crossing will start again from its beginning. Its moves and Undo history are only kept while you play.</p>${session.result ? '<p>Returning home keeps this rescue’s lantern result.</p>' : ''}<p>${checkpointNotice}</p>`;
    actions =
      '<button id="journey-return-cancel">Keep playing</button><button id="journey-return-confirm">Return home</button>';
  } else {
    heading = 'Six coves are safe.';
    body = '<p>You’ve reached the end of the available coast. You can revisit any crossing in Practice.</p>' + notice;
    actions =
      '<button id="journey-title">Return Home</button><button id="journey-practice">Practice</button><button id="journey-settings">Options</button>';
  }
  $('dialog-content').innerHTML =
    `<header class="dialog-head${mode === 'story' ? ' sr-only' : ''}"><h2 id="dialog-title">${heading}</h2></header><div class="dialog-body journey-copy">${body}</div><footer class="dialog-footer journey-actions">${actions}</footer>`;
  dialog.classList.toggle('story-caption', mode === 'story');
  for (const button of dialog.querySelectorAll<HTMLButtonElement>('button:not([data-practice])'))
    setControl(
      button,
      null,
      button.textContent ?? '',
      button.id === 'story-continue' ? 'warm' : button.id === 'story-skip' ? 'quiet' : 'action',
    );
  const on = (id: string, fn: () => void) => {
    const element = $(id);
    if (element) element.onclick = fn;
  };
  on('journey-new', () =>
    snapshot?.kind === 'empty' ? beginJourney() : showJourney('replace', 'journey-replace-cancel'),
  );
  on('journey-continue', continueSavedJourney);
  on('journey-replace-confirm', beginJourney);
  on('journey-replace-cancel', () => showJourney('journey', 'journey-new'));
  on('journey-practice', () => showJourney('practice', 'practice-first-crossing'));
  on('journey-settings', () => openSettings(mode as JourneyMode));
  on('journey-title', returnToJourneyTitle);

  on('journey-return-confirm', returnToJourneyTitle);

  on('journey-return-cancel', () => {
    app.classList.remove('journey-screen');

    $('seascape').inert = false;

    world.setStoryFraming(false);
    switchDialog('menu', 'journey-return');
    flushLayout();
  });
  for (const button of dialog.querySelectorAll<HTMLButtonElement>('[data-practice]'))
    button.onclick = () =>
      visitPractice(practiceCoves.find((entry) => entry.id === button.dataset.practice)!);
  renderStoryStatus();
}

function renderIllustratedStory(transcript: boolean) {
  if (!storyId) return;
  const scene = storyScenes[storyId];
  if (transcript) {
    $('dialog-content').innerHTML =
      `${header('Read story', undefined, 'Back to story')}<div class="dialog-body story-transcript"><h3>${scene.title}</h3>${scene.shots.map((shot) => `<section><p>${shot.caption}</p><p class="story-description">${shot.description}</p></section>`).join('')}</div><footer class="dialog-footer"><button id="story-read-back">Back to story</button></footer>`;
    const back = () => switchDialog('story', 'story-read');
    $('cancel').onclick = back;
    $('story-read-back').onclick = back;
    setControl($('story-read-back'), null, 'Back to story');
    return;
  }
  $('dialog-content').innerHTML =
    `<h2 id="dialog-title" class="sr-only">${scene.title}</h2><div class="story-picture"><canvas id="story-canvas" role="img"></canvas><p class="story-chapter" aria-hidden="true">Last Ferry <span>The Long Tide</span></p><div id="story-captions"><p id="story-caption" aria-live="polite" aria-atomic="true"></p></div></div><nav class="story-controls" aria-label="Story controls"><span id="story-position" aria-label="Shot"></span><button id="story-pause">Pause</button><button id="story-sound"></button><details id="story-more"><summary>More</summary><div class="story-secondary"><button id="story-replay">Replay</button><button id="story-replay-scene" hidden>Replay scene</button><button id="story-skip">Skip animation</button><button id="story-read">Read story</button><button id="story-settings">Options</button></div></details><button id="story-continue">Next</button></nav>`;

  for (const button of dialog.querySelectorAll<HTMLButtonElement>('button'))
    setControl(
      button,
      null,
      button.textContent ?? '',
      button.id === 'story-continue' ? 'warm' : 'quiet',
    );
  if (journey?.snapshot.persistent === false || mastery.issue) {
    const notice = document.createElement('p');
    notice.className = 'story-storage-notice';
    notice.setAttribute('role', 'status');
    notice.textContent = [
      journey?.snapshot.persistent === false ? 'Journey progress lasts for this visit only.' : '',
      mastery.issue ?? '',
    ].filter(Boolean).join(' ');
    $('story-continue').parentElement!.append(notice);
  }
  storyView = new StoryView($('story-canvas') as HTMLCanvasElement);
  storyUiKey = '';
  $('story-continue').onclick = (event) => {
    if (event.detail > 1 || (event.isTrusted && storyActionIntent !== storyActionKey())) return;

    storyActionIntent = null;

    continueStory();
  };
  $('story-continue').onkeydown = (event) => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
  };

  $('story-pause').onclick = () =>
    storyPresentation.paused
      ? storyPresentation.resume(motion.reduced || document.hidden)
      : storyPresentation.pause();

  $('story-sound').onclick = toggleSound;

  renderSound();

  $('story-skip').onclick = () => {
    ($('story-more') as HTMLDetailsElement).open = false;
    storyPresentation.skip();
    $('story-continue').focus({ preventScroll: true });
  };
  $('story-replay').onclick = () => storyPresentation.replay(motion.reduced || document.hidden);
  $('story-replay-scene').onclick = () => {
    storyPresentation.replay(motion.reduced || document.hidden, true);
    $('story-replay').focus({ preventScroll: true });
  };
  $('story-read').onclick = () => {
    storyPresentation.settle();
    switchDialog('transcript', 'story-read-back');
  };
  $('story-settings').onclick = () => {
    storyPresentation.settle();
    openSettings('story');
  };
  renderStoryStatus();
}

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
  const icon: CoveIcon =
    intent === 'mute' ? 'sound-on' : intent === 'retry' ? 'sound-retry' : 'sound-off';
  const compactLabel =
    sound.muted || playback.running ? label : playback.requested ? 'Retry' : 'Sound';
  setControl(control, icon, compactLabel, 'quiet', sound.muted || playback.running);

  for (const settings of [$('settings-sound'), $('home-sound'), $('story-sound')]) {
    if (settings) {
      setControl(settings, icon, label);

      settings.dataset.playback = playback.state;

      settings.dataset.soundIntent = intent;

      settings.setAttribute('aria-pressed', String(playback.running));

      settings.setAttribute('aria-label', label);
    }
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
    ? target.closest<HTMLElement>(
        '#sound-toggle, #settings-sound, #settings-mute, #home-sound, #story-sound',
      )
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

          audio: sound.presentation(),
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
  setControl(
    button,
    active ? 'fullscreen-exit' : 'fullscreen-enter',
    active ? 'Exit fullscreen' : 'Fullscreen',
  );
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
    hideBack = view.mode !== 'overview' && view.zoomStep === 0 && !view.panned && !view.focused;
  setControl(toggle, view.mode === 'overview' ? 'back-to-boat' : 'whole-cove', label);
  if (toggle.getAttribute('aria-pressed') !== pressed) toggle.setAttribute('aria-pressed', pressed);
  if (back.hidden !== hideBack) back.hidden = hideBack;
  $('zoom-in').setAttribute('aria-disabled', String(!view.canZoomIn));
  $('zoom-out').setAttribute('aria-disabled', String(!view.canZoomOut));
  const scaleLabel = ['Whole cove', 'Wide', 'Normal', 'Close', 'Closest'][view.zoomStep + 2];
  if ($('zoom-level').textContent !== scaleLabel) $('zoom-level').textContent = scaleLabel;
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
    renderView();
    updateViewport();
    positionMap();

    positionReceipt();
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
  usableBounds = safeBounds;

  if (app.classList.contains('home-screen')) {
    const menu = $('home-menu').getBoundingClientRect();

    const title = $('home-title').getBoundingClientRect();

    usableBounds =
      width > height
        ? {
            left: menu.right + 20,
            right: safeBounds.right - 12,
            top: safeBounds.top + 12,
            bottom: safeBounds.bottom - 12,
          }
        : {
            left: safeBounds.left + 12,
            right: safeBounds.right - 12,
            top: title.bottom + 12,
            bottom: menu.top - 12,
          };
  } else if (journeySurface() && dialog.open) {
    positionDialog();
    const panel = dialog.getBoundingClientRect();
    usableBounds =
      mode !== 'story' && width > height
        ? {
            left: panel.right + 12,
            right: safeBounds.right - 8,
            top: safeBounds.top + 8,
            bottom: safeBounds.bottom - 8,
          }
        : {
            left: safeBounds.left + 8,
            right: safeBounds.right - 8,
            top: safeBounds.top + 8,
            bottom: Math.max(safeBounds.top + 100, panel.top - 8),
          };
  }
  const canvas = world.host.getBoundingClientRect();
  world.setUsableRectangle({
    left: usableBounds.left - canvas.left,
    right: usableBounds.right - canvas.left,
    top: usableBounds.top - canvas.top,
    bottom: usableBounds.bottom - canvas.top,
  });
  if (!journeySurface()) {
    const key = [level.id, width, height, canvas.left, canvas.top, ...Object.values(safeBounds), session.state.boatNodeId, world.viewMode].join(':');
    if (overviewObstaclesKey !== key) {
      overviewObstaclesKey = key;
      const rectangles = playObstacles(true)
        .map((rect) => ({ left: rect.left - canvas.left, right: rect.right - canvas.left, top: rect.top - canvas.top, bottom: rect.bottom - canvas.top }));
      world.setOverviewObstacles(rectangles);
    }
  }
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
  if (reduced && mode === 'story') storyPresentation.settle();
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
  if (locationSelection && !$('local-context').hidden) return $('local-context');
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
  return journeySurface() || session.busy || dialog.open || fullscreenSupport.promoting;
}
function currentPassageDeparture() {
  const action = activeTransition?.action;
  if (action?.type !== 'move') return null;
  const before = session.history.at(-1);
  return before && edgeTo(before, action.to, level)?.current ? before : null;
}
function highlight(id?: string) {
  emphasis = id;
  world.indicate(currentPassageDeparture() ?? session.state, locationSelection ?? undefined, id);
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
  dialog.style.removeProperty('width');
  dialog.style.removeProperty('height');
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
    ? ($('continue-story') ?? $('next-cove') ?? $('choose-cove') ?? $('terminal-undo'))
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
  const target = $(focusId);
  const disclosure = target?.closest('details');
  if (disclosure) disclosure.open = true;
  target?.focus({ preventScroll: true });
}
function openSettings(parent: 'menu' | 'terminal' | JourneyMode) {
  if (parent === 'story') storyPresentation.settle();
  settingsParent = parent;
  switchDialog('settings', 'settings-sound');

  if (!dialog.open) {
    dialog.showModal();
    $('settings-sound').focus();
    positionDialog();
  }
}
function backFromSettings() {
  if (settingsParent === 'journey') {
    showHome('home-options');
    return;
  }

  switchDialog(
    settingsParent,
    settingsParent === 'terminal'
      ? 'terminal-settings'
      : settingsParent === 'menu'
        ? 'settings'
        : settingsParent === 'story'
          ? 'story-settings'
          : 'journey-settings',
  );
}
function header(title: string, eyebrow?: string, closeLabel = 'Close dialog') {
  return `<header class="dialog-head"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2 id="dialog-title">${title}</h2></div><button id="cancel" aria-label="${closeLabel}">${controlContent('close', closeLabel)}</button></header>`;
}
function renderDialog() {
  if (!mode) return;
  if (mode !== 'story') storyView = null;
  dialog.classList.toggle('story-caption', mode === 'story');
  dialog.classList.toggle(
    'cove-surface--arrival',
    mode === 'terminal' && session.state.status === 'won',
  );
  const oldFocus = (document.activeElement as HTMLElement)?.id;
  const s = session.state,
    p = pierAt(s, level);
  dialog.dataset.mode = mode;
  dialog.dataset.largeGroup = String(
    mode === 'action' &&
      (selected?.type === 'board' || selected?.type === 'unload') &&
      (selected.type === 'board'
        ? pierAt(session.state, level)
          ? session.state.waitingByPier[pierAt(session.state, level)!.id].length
          : 0
        : session.state.aboard.length) > 4,
  );
  dialog.dataset.transfer = String(
    mode === 'action' && (selected?.type === 'board' || selected?.type === 'unload'),
  );
  if (
    [
      'journey',
      'story',
      'transcript',
      'practice',
      'replace',
      'return-title',
      'journey-end',
    ].includes(mode)
  ) {
    renderJourneyDialog();
    positionDialog();
    return;
  }
  if (mode === 'action' && selected) {
    const a = selected,
      proposed = preview(s, a, level),
      text = previewCopy(s, a, level, tips.enabled),
      transfer = a.type === 'board' || a.type === 'unload' ? transferFacts(s, a, level, tips.enabled) : null;

    const ids = a.type === 'board' ? s.waitingByPier[p!.id] : a.type === 'unload' ? s.aboard : [];
    const choices =
      a.type === 'board' || a.type === 'unload'
        ? `<div class="passenger-options${level.id === 'reef-return' && ids.length === 4 ? ' reef-manifest' : ''}" role="group" aria-label="Passenger selection">${ids.map((id) => `<button id="passenger-${id}" class="cove-choice" aria-pressed="${a.passengerIds.includes(id)}">${passengerChoiceContent(passengerNames[id].split(' ·')[0], level.passengers.find((p) => p.id === id)!.slots, resolvePassengerAppearance(level, id)?.portraitKey ?? null)}</button>`).join('')}</div>`
        : '';
    $('dialog-content').innerHTML =
      `${header(transfer ? (a.type === 'board' ? 'Board passengers' : p?.isDeliveryPier ? 'Bring passengers home' : 'Let passengers ashore') : actionLabel(s, a, level), `${nodeNames[a.type === 'move' ? a.to : s.boatNodeId]} · inspection is free`)}<div id="preview" class="dialog-body ${proposed.error || (tips.enabled && proposed.state.status === 'lost') ? 'warning' : ''}" aria-live="polite" aria-atomic="true">${choices}<p class="requirement">${text.error ?? (transfer ? `${transfer.depth} · ${transfer.load}` : text.requirement)}</p>${(transfer ? transfer.detail : text.consequence) ? `<p class="consequence">${transfer ? transfer.detail : text.consequence}</p>` : ''}${!proposed.error && !transfer ? `<p class="preview-result">After this action: Boat ${load(proposed.state, level)}/${level.rules.capacity} spaces · tide ${proposed.state.tideLevel}${s.tideLevel !== proposed.state.tideLevel ? ` (now ${s.tideLevel})` : ''}</p>` : ''}</div><footer class="dialog-footer"><button id="commit" ${proposed.error ? 'disabled' : ''}>${proposed.error ? 'Action unavailable' : transfer ? `${transfer.label} · 1 action` : 'Confirm · 1 action'}</button></footer>`;

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
    const tideTable = f.schedule.length
      ? '<ol class="current-schedule">' + f.schedule.map(row => `<li><strong>After action ${row.turn}</strong> · ${row.direction} · depth ${row.depth}.${row.floods.length ? ' Flooding at ' + row.floods.join(' and ') + '.' : ''}</li>`).join('') + '</ol>'
      : '';
    $('dialog-content').innerHTML =
      `${header(f.current ? 'Reef and tide forecast' : 'Tide and pier forecast', 'Inspection · no action spent')}<div class="dialog-body forecast-detail"><strong>${f.headline}</strong>${f.current ? `<p>${f.current.direction} ${f.current.next}</p>${tideTable}<p>Sail with the current. Your action finishes before the tide changes.</p>` : ''}<p>${f.detail}</p><p>Each accepted action advances the tide schedule. Thinking and inspection do not.</p></div>`;
    world.setForecast(
      true,
      level.rules.tide.rises.find((r) => r.afterTurn > s.turn)?.level ?? s.tideLevel,
    );
  } else if (mode === 'menu') {
    const passengerCosts = level.passengers
      .map(
        (p) =>
          `${passengerList([p.id], level)} uses ${p.slots} ${p.slots === 1 ? 'space' : 'spaces'}`,
      )
      .join('; ');
    $('dialog-content').innerHTML =
      `${header('Crossing menu')}<div class="dialog-body menu-body">${s.status === 'won' ? '<button id="return-arrival">Return to arrival</button>' : ''}<div class="menu-actions"><button id="restart">Restart crossing</button><button id="settings">Settings</button></div><label class="cove-picker">Choose cove<select id="cove-picker">${practiceCoves.map((l) => `<option value="${l.id}" ${l.id === level.id ? 'selected' : ''}>${l.title}${l.id === baseline.id ? ' · baseline' : ''}</option>`).join('')}</select></label><details id="help-details"><summary>How to play · actions and depth</summary><p>${actionCostCopy(level)}</p><p>Select a named place, island, pier or landmark to see its options for free. Choose Sail to travel one passage. Select the ferry for its current place. A named single-passenger action acts directly. For several passengers, choose names in the nearby chooser, then use its named action. Select your current place for free transfer details. The chooser shows the selected load and depth. Tips in Settings adds predicted outcomes and warnings before losing actions. Tips starts Off. Route depths, currents, pier deadlines and the forecast are always available.</p><p>Boat depth needed: ${draftBandsCopy(level)}. ${passengerCosts}. A passage must be at least as deep as the boat needs.</p><p>Boarding and unloading happen before the tide rises. Use the status button for the tide and pier forecast. Undo earlier actions or restart to recover from a losing plan.</p><p>Tab and Shift+Tab move between controls; Enter or Space activates them. Escape closes a dialog first; press it again to close the location card. Selection never spends an action.</p></details></div>`;

    $('restart').onclick = restart;
    document.querySelector('.menu-body')!.insertAdjacentHTML(
      'beforeend', masteryCriteriaMarkup(masteryTargets[level.id].target, level.title) + masteryNotice(),
    );

    {
      const returnButton = document.createElement('button');
      returnButton.id = 'journey-return';

      setControl(returnButton, null, 'Home', 'quiet');

      $('settings').closest('.menu-actions')!.after(returnButton);
      returnButton.onclick = () => showJourney('return-title', 'journey-return-cancel');
      const policy = document.createElement('p');
      policy.textContent = 'Practice does not change your journey. Continuing, leaving or restarting after a rescue keeps its lantern result.';
      if (campaignPlay) {
        policy.textContent = journey?.snapshot.persistent
          ? 'Progress is saved between coves. An unfinished cove starts again. Continue story after arrival to advance. Continuing, leaving or restarting keeps the lantern result.'
          : 'Journey progress lasts for this visit only. Continue story after arrival to advance. Continuing, leaving or restarting keeps the lantern result.';
      }
      returnButton.after(policy);
    }
    const fullscreen = document.createElement('button');
    fullscreen.id = 'fullscreen';
    $('settings').closest('.menu-actions')!.after(fullscreen);
    renderFullscreen();
    $('settings').onclick = () => openSettings('menu');
    if (s.status === 'won')
      $('return-arrival').onclick = () =>
        switchDialog(
          'terminal',
          campaignPlay ? 'continue-story' : experiment ? 'next-cove' : 'choose-cove',
        );
    if (campaignPlay) $('cove-picker').closest('label')!.remove();
    if ($('cove-picker'))
      ($('cove-picker') as HTMLSelectElement).onchange = (e) => {
        const next = practiceCoves.find(entry => entry.id === (e.target as HTMLSelectElement).value);
        if (next) visitPractice(next);
      };
  } else if (mode === 'settings') {
    $('dialog-content').innerHTML =
      `${header('Settings', undefined, 'Back to ' + (settingsParent === 'terminal' ? 'arrival' : 'menu'))}<div class="dialog-body settings-body"><div class="settings-row"><span>Sound</span><div class="settings-sound-controls"><button id="settings-sound"></button><button id="settings-mute" data-sound-intent="mute" hidden>Mute sound</button></div></div><p id="audio-status" role="status"></p><label class="settings-row" for="motion-preference">Motion<select id="motion-preference"><option value="device">Follow device</option><option value="reduced">Reduced</option></select></label><p id="motion-status"></p><label class="settings-row" for="tips-preference">Tips<select id="tips-preference" aria-describedby="tips-description"><option value="off">Off</option><option value="on">On</option></select></label><p id="tips-description">Show predicted outcomes and extra guidance.</p></div><footer class="dialog-footer"><button id="settings-back">Back</button></footer>`;
    $('settings-sound').onclick = toggleSound;
    $('settings-mute').onclick = (event) =>
      explicitSound(event.currentTarget as HTMLElement, 'mute');
    const fullscreen = document.createElement('button');
    fullscreen.id = 'fullscreen';
    document.querySelector('.settings-body')!.append(fullscreen);
    renderFullscreen();
    ($('motion-preference') as HTMLSelectElement).onchange = (event) =>
      motion.setMode((event.target as HTMLSelectElement).value as MotionMode);
    const tipsControl = $('tips-preference') as HTMLSelectElement;
    tipsControl.value = tips.enabled ? 'on' : 'off';
    tipsControl.onchange = () => {
      tips.setEnabled(tipsControl.value === 'on');
      $('announcement').textContent = '';
      $('local-context').replaceChildren();
      $('local-context').removeAttribute('data-status');
      cardPlacement = null;
      render();
    };
    $('settings-back').onclick = backFromSettings;
    if (journeySurface()) $('cancel').setAttribute('aria-label', 'Back to journey');
    renderSound();
    renderMotion();
  } else {
    const f = statusCopy(s, level),
      won = s.status === 'won',
      next = won && experiment;
    dialog.dataset.outcome = won ? 'won' : 'lost';
    const lossTitle = s.lossReason ? {
      PASSENGER_STRANDED: 'A turn too late.',
      RETURN_CUT_OFF: 'The way home is cut off.',
      RETURN_CAPACITY: 'Too few homeward trips.',
      RETURN_DEPTH: 'No way to lighten the boat.',
    }[s.lossReason.code] : '';
    $('dialog-content').innerHTML =
      `${header(won ? (isBellwater ? 'Bellwater is safe.' : 'Everyone home.') : lossTitle)}<div class="dialog-body ending ${won ? '' : 'loss'}"><p>${won ? `${level.objective.requiredPassengerIds.length} passengers safe at Harbor · ${s.turn} actions.` : f.headline}</p>${won ? '' : `<p>${f.detail}</p>`}</div><footer class="dialog-footer terminal-actions">${won ? `<button id="${next ? 'next-cove' : 'choose-cove'}">${next ? 'Next cove' : 'Choose a cove'}</button><button id="terminal-settings">Settings</button>` : ''}<button id="terminal-undo">↶ Undo last action</button><button id="terminal-restart">Restart</button></footer>`;
    if (next)
      $('next-cove').onclick = () => visitPractice(practiceCoves.find(entry => entry.id === 'bellwater')!);
    else if (won) $('choose-cove').onclick = () => switchDialog('menu', 'cove-picker');
    if (won) $('terminal-settings').onclick = () => openSettings('terminal');
    $('terminal-undo').onclick = undo;
    $('terminal-restart').onclick = restart;
    if (won && session.result) {
      document.querySelector('.ending')!.insertAdjacentHTML(
        'beforeend',
        masteryResultMarkup(session.result, mastery.best(level.id)) +
        '<p class="checkpoint-policy">Continuing, leaving or restarting keeps this result. Until then, Undo can change it.</p>' +
        masteryNotice(),
      );
    }
    if (won && campaignPlay) {
      const nextControl = $('next-cove') ?? $('choose-cove');
      nextControl.id = 'continue-story';
      setControl(nextControl, 'next-cove', 'Continue story', 'warm');
      nextControl.onclick = acceptStoryCove;
      const policy = document.createElement('p');
      policy.className = 'checkpoint-policy';
      const progress = journey!.snapshot;
      const record = progress.record!;
      if (record.checkpoint.kind === 'cove') {
        const next = acceptCove(record, record.checkpoint.id, s.status);
        const handoff = next.checkpoint.kind === 'complete'
          ? 'Continue story completes this coast.'
          : `Next crossing: ${storyCoves.find((entry) => entry.id === checkpointCove(next))!.level.title}.`;
        const checkpoint = progress.persistent ? 'Reloading restarts this cove.' : 'Progress lasts for this visit only.';
        policy.textContent = `${handoff} Undo stays available until you continue. ${checkpoint}`;
      }
      document.querySelector('.ending')!.append(policy);
    }
  }
  const controls: [string, CoveIcon | null, string | null, CoveFace, boolean?][] = [
    ['cancel', 'close', $('cancel').getAttribute('aria-label'), 'quiet', true],
    [
      'commit',
      'confirm',
      null,
      selected?.type === 'unload' && s.boatNodeId === homeNodeId ? 'warm' : 'action',
    ],
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

  if (pendingReceipt?.id === id && reason === 'complete' && !document.hidden) {
    const data = pendingReceipt;

    receipt.innerHTML = `<strong>${data.title}</strong>${data.depth ? `<span>${data.depth}</span>` : ''}`;

    receipt.hidden = false;

    receipt.dataset.transition = String(id);

    positionReceipt();

    receiptTimer = setTimeout(clearReceipt, 3200);
  } else clearReceipt();

  $('announcement').textContent =
    `${pendingReceipt?.title ? pendingReceipt.title + '. ' + pendingReceipt.depth + '. ' : ''}${session.state.turn} actions completed. ${statusCopy(session.state, level).headline}`;

  if (session.state.status !== 'playing') openDialog('terminal', undefined, 'undo');
  else focusAvailable(returnId);
  positionReceipt();
}
function execute(action: Action) {
  if (session.busy || journeySurface()) return;

  const transaction = session.commit(copy(action));
  if (!transaction) return;

  clearReceipt();

  world.poses.accept(transaction.before, action);
  actionOrigin = !keyboardInput && lastPointer ? { x: lastPointer.x, y: lastPointer.y } : null;
  sound.reconcileState(transaction.after, level, true);
  if (action.type === 'move') locationSelection = action.to;
  emphasis = undefined;
  const plan = world.plan(transaction.before, transaction.after, action);
  const id = ++transitionSerial;
  activeTransition = { id, action: copy(action), plan, startedAt: performance.now() };

  if (action.type === 'board' || action.type === 'unload')
    pendingReceipt = {
      id,
      ...transferReceipt(transaction.before, transaction.after, action, level),
    };

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
  renderDock();
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
    locationDetails = false;
    selectionOrigin = !keyboardInput && lastPointer ? { x: lastPointer.x, y: lastPointer.y } : null;
    world.frameLocation(id);
    renderMap();
    renderLocation();
    renderDock();
    positionMap();
  }
  highlight();
  $('local-context').focus({ preventScroll: true });
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
      if (keyboardInput) scheduleLayout();
    }
  };
  button.onblur = () => { restoreHighlight(); scheduleLayout(); };
}
function renderMap() {
  const departure = currentPassageDeparture();
  const s = departure ?? session.state;
  labelDimensions.clear();
  $('map-labels').hidden = s.status === 'won';
  $('map-labels').innerHTML =
    level.nodes
      .map((n) => {
        const facts = locationFacts(s, n.id, level, tips.enabled);
        const [status, symbol, description] = {
          current: ['current', '•', 'current location'],
          remote: ['nonadjacent', '◇', 'no direct passage'],
          'too-shallow': ['too-shallow', '╱', 'adjacent, too shallow'],
          'against-current': ['against-current', '×', 'adjacent, against the current'],
          loss: ['available', '!', 'adjacent, ' + facts.consequence],
          safe: ['available', '', 'adjacent passage available'],
        }[departure && facts.wouldLose ? 'safe' : facts.status];
        return `<div id="stop-${n.id}" class="map-stop" data-adjacent="${facts.relation === 'adjacent'}"><button id="map-${n.id}" class="map-target" data-status="${status}" data-risk="${!departure && facts.wouldLose ? 'loss' : 'safe'}" data-destination="${n.id}" aria-expanded="${locationSelection === n.id}" aria-controls="local-context" ${facts.current ? 'aria-current="location"' : ''} aria-label="Select ${facts.name}; ${description}${facts.home ? '; Home, delivery destination' : ''}" title="${description}" ${session.busy || s.status !== 'playing' ? 'disabled' : ''}><span class="map-hit"><span class="map-symbol" aria-hidden="true">${facts.home ? iconMarkup('harbor-home') : symbol}</span></span><span class="map-name"><b class="cove-name cove-surface cove-surface--compact">${facts.name}${facts.home ? '<span class="map-home cove-objective"> · Home</span>' : ''}</b></span></button></div>`;
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
  const facts = locationFacts(session.state, locationSelection!, level, tips.enabled);
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
        paragraph(facts.transferNote) +
        [facts.board, facts.unload]
          .filter((action) => action !== null)
          .map((action) => {
            const info = transferFacts(session.state, action!, level, tips.enabled);
            return paragraph(`${info.label} · 1 action. ${info.depth}. ${info.detail}`);
          })
          .join('')
      : paragraph(facts.passage, 'requirement') +
        paragraph(facts.limitation && !facts.passage ? facts.limitation : '') +
        paragraph(facts.waiting.length ? facts.waitingCopy : '') +
        paragraph(facts.safety) +
        paragraph(facts.consequence, facts.wouldLose ? 'location-warning' : '');
  const routes =
    facts.current
      ? `<details class="route-details"><summary>Routes and deadlines · free</summary>${level.nodes
          .filter((n) => edgeTo(session.state, n.id, level))
          .map((n) => {
            const next = locationFacts(session.state, n.id, level, tips.enabled);
            return `<button data-inspect-route="${n.id}">Inspect ${next.name}</button><p>${next.passage} ${next.safety}</p>`;
          })
          .join('')}</details>`
      : '';
  const edge = facts.move ? edgeTo(session.state, facts.id, level) : null;
  const flow = edge?.current ? currentNotice(session.state, level, edge) : null;
  const loss = facts.wouldLose && facts.move ? preview(session.state, facts.move, level).state.lossReason : null;
  const floodWarning = loss?.code === 'PASSENGER_STRANDED'
    ? `${passengerList(loss.passengerIds, level)} will be lost when ${nodeNames[level.piers.find((pier) => pier.id === loss.pierId)!.nodeId]} floods.`
    : '';
  const reason = facts.relation === 'remote'
    ? 'No direct passage'
    : facts.status === 'against-current' && flow
      ? `Against the current. ${flow.compact}.`
    : !facts.current && !facts.canSail
      ? edge && edge.baseDepth + session.state.tideLevel < draft(session.state, level)
        ? 'Needs depth ' + draft(session.state, level) + ' · passage ' + (edge.baseDepth + session.state.tideLevel)
        : facts.limitation
      : floodWarning || (facts.wouldLose ? facts.consequence : flow ? `${flow.direction} ${flow.next}` : facts.consequence);
  const actions = !facts.current && facts.move
    ? '<button id="sail" data-risk="' + (facts.wouldLose ? 'loss' : 'safe') + '" ' + (facts.canSail ? '' : 'disabled') + '>Sail · 1 action</button>'
    : `<span class="current-place">${facts.current ? 'At ' : ''}${facts.name}</span>`;
  card.setAttribute('aria-label', facts.name + ' · free inspection');
  card.innerHTML = '<div class="location-toolbar">' + actions + '<button id="location-details" aria-expanded="' + locationDetails + '" aria-controls="location-facts">Details</button><button id="close-location" aria-label="Close location card">×</button></div>' + paragraph(reason, facts.wouldLose ? 'location-warning' : 'location-reason') + '<div id="location-facts" ' + (locationDetails ? '' : 'hidden') + '>' + details + routes + '</div>';
  for (const button of card.querySelectorAll<HTMLButtonElement>('[data-inspect-route]')) {
    setControl(button, null, button.textContent ?? '', 'quiet');
    button.onclick = () => selectLocation(button.dataset.inspectRoute!);
  }
  setControl($('location-details'), null, 'Details', 'quiet');
  $('location-details').onclick = () => {
    locationDetails = !locationDetails;
    $('location-details').setAttribute('aria-expanded', String(locationDetails));
    $('location-facts').hidden = !locationDetails;
    positionMap();
  };
  setControl($('close-location'), 'close', 'Close location card', 'quiet', true);
  if ($('sail')) {
    setControl($('sail'), 'sail', (facts.wouldLose ? 'Sail anyway to ' : 'Sail to ') + facts.name, 'action');
    $('sail').setAttribute('aria-label', (facts.wouldLose ? 'Sail anyway to ' : 'Sail to ') + facts.name + ' · 1 action');
  }
  $('close-location').onclick = (event) => {
    event.stopPropagation();
    if (!keyboardInput) closingFence = {
      scope: 'dismiss', rect: $('close-location').getBoundingClientRect(),
      until: performance.now() + 180, x: event.clientX, y: event.clientY,
    };
    clearLocation(true);
  };
  if ($('sail')) $('sail').onclick = (event) => {
    event.stopPropagation();
    if (blocked() || event.detail > 1 || locationSelection !== facts.id) return;
    const current = locationFacts(session.state, facts.id, level, tips.enabled);
    if (!current.move || !current.canSail) return;
    if (current.wouldLose !== facts.wouldLose || current.consequence !== facts.consequence) {
      renderLocation();
      positionMap();
      return;
    }
    if (!keyboardInput) closingFence = {
      scope: 'commit', rect: $('sail').getBoundingClientRect(),
      until: performance.now() + 180, x: event.clientX, y: event.clientY,
    };
    returnId = 'local-context';
    execute(current.move);
  };
}
function renderDock() {
  const dock = $('dock-actions'),
    facts = locationFacts(session.state, session.state.boatNodeId, level, tips.enabled),
    visible =
      !journeySurface() &&
      (!locationSelection || locationSelection === session.state.boatNodeId) &&
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
  dock.dataset.owner = facts.name;

  dock.replaceChildren();
  const owner = document.createElement('span');
  owner.className = 'dock-owner';
  owner.textContent = 'At ' + facts.name;
  dock.append(owner);

  for (const type of ['board', 'unload'] as const) {
    const ids = type === 'board' ? facts.boardOptions : facts.aboard;

    if (!ids.length || !facts[type]) continue;

    const action = { type, passengerIds: [...ids] };

    const info = transferFacts(session.state, action, level, tips.enabled);

    const direct = ids.length === 1 && info.direct;

    const button = document.createElement('button');

    button.id = type;

    const groupLabel = type === 'board' ? 'Board' : facts.home ? 'Bring home' : 'Let ashore';

    setControl(
      button,
      type === 'unload' && facts.home ? 'harbor-home' : type,
      ids.length === 1 ? info.label : groupLabel,
      facts.home && type === 'unload' ? 'warm' : 'action',
    );

    if (!direct) button.setAttribute('aria-haspopup', 'dialog');

    dock.append(button);
    button.onfocus = () => {
      if (keyboardInput && !blocked()) world.frameLocation(session.state.boatNodeId);
    };

    button.onclick = (event) => {
      event.stopPropagation();

      if (blocked() || event.detail > 1) return;

      const current = transferFacts(session.state, action, level, tips.enabled);

      if (direct && current.direct) {
        returnId = type;

        if (!keyboardInput)
          closingFence = {
            scope: 'commit',
            rect: button.getBoundingClientRect(),
            until: performance.now() + 180,
            x: event.clientX,
            y: event.clientY,
          };

        execute(action);
      } else openDialog('action', action, type);
    };
  }
}
function render() {
  const departure = currentPassageDeparture(),
    s = departure ?? session.state,
    p = pierAt(s, level),
    facts = statusCopy(s, level),
    objective = objectiveCopy(s, level);
  $('objective').textContent = objective.headline;
  setControl($('load-toggle'), null, `${load(s, level)}/${level.rules.capacity} · Depth ${draft(s, level)}`, 'quiet');
  $('load-toggle').setAttribute('aria-label', `${load(s, level)} of ${level.rules.capacity} spaces · boat needs depth ${draft(s, level)} · crossing status`);
  $('readout').innerHTML =
    `<strong id="boat-summary">Depth ${draft(s, level)} · ${load(s, level)}/${level.rules.capacity} spaces</strong><span><b data-testid="turn">${String(s.turn).padStart(2, '0')}</b> actions · Tide <b data-testid="tide">${s.tideLevel}</b> · <b id="progress">${objective.progress}</b></span>`;
  if (!$('place-index')) {
    const index = document.createElement('details');
    index.id = 'place-index';
    index.innerHTML = '<summary>Inspect a place</summary><div></div>';
    $('readout').after(index);
  }
  const index = $('place-index');
  if (index.dataset.cove !== level.id) {
    index.dataset.cove = level.id;
    const list = index.querySelector('div')!;
    list.replaceChildren();
    for (const node of level.nodes) {
      const control = document.createElement('button');
      setControl(control, null, nodeNames[node.id], 'quiet');
      control.dataset.inspectPlace = node.id;
      control.onclick = () => {
        toggleStatus(false);
        selectLocation(node.id);
      };
      list.append(control);
    }
  }
  const forecast = forecastCopy(s, level);
  const current = s.status === 'playing' ? forecast.current : null;
  const headline = departure && current ? current.underway : facts.urgent ? facts.headline : current?.compact ?? forecast.headline;
  const showDeadline = facts.urgent && !departure;
  const due = occupiedPierDeadline(s, level);
  const sharedEvent = showDeadline && due && current && current.turnsIn === due.actions;
  const concise = sharedEvent
    ? `<strong>In ${due.actions} action${due.actions === 1 ? '' : 's'}</strong><span>${nodeNames[due.pier.nodeId]} floods · ${current.name} turns</span>`
    : '';
  $('status-toggle').innerHTML =
    `<span class="status-symbol" aria-hidden="true">${showDeadline ? '!' : '≈'}</span><span class="forecast-lines"><strong id="status-headline">${headline}</strong>${showDeadline && current ? `<span class="reef-outlook">${current.compact}</span>` : ''}</span>${concise ? `<span class="forecast-short" aria-hidden="true">${concise}</span>` : ''}`;
  $('status-toggle').setAttribute('aria-label', current
    ? departure ? `${current.direction} ${current.underway}.` : `${facts.urgent ? facts.headline + ' ' : ''}${current.direction} ${current.next} Open reef and tide forecast.`
    : `${headline} Open tide and pier forecast.`);
  $('status-toggle').classList.toggle('urgent', showDeadline);
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

  clearReceipt();

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

  clearReceipt();

  if (dialog.open) closeDialog(false);
  const result = session.result;
  if (session.restart()) {
    if (result) mastery.accept(result);
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
    if (result && mastery.issue) notifyView(mastery.issue);
  }
}

function positionReceipt() {
  if (receipt.hidden) return;
  const canvas = world.host.getBoundingClientRect();
  const frame = world.layoutFrameStatus();
  const rect = receipt.getBoundingClientRect();
  const local = (r: Rectangle): Rectangle => ({
    left: r.left + canvas.left,
    right: r.right + canvas.left,
    top: r.top + canvas.top,
    bottom: r.bottom + canvas.top,
  });
  const boat = local(frame.boat);
  const obstacles = [
    ...document.querySelectorAll<HTMLElement>(
      '.tools button, #load-toggle, #crossing-details, #dock-actions, #status-toggle, .view-controls, .map-target, .map-name, #local-context, #dialog[open]',
    ),
  ]
    .filter(
      (e) =>
        !e.hidden &&
        !e.closest('[hidden]') &&
        getComputedStyle(e).visibility !== 'hidden' &&
        e.getBoundingClientRect().width > 0,
    )
    .map((e) => e.getBoundingClientRect());
  const placement = placeLocalCard(
    rect.width,
    rect.height,
    safeBounds,
    [...obstacles, boat, ...frame.passengers.map(local), local(frame.lighthouse), ...(frame.bell ? [local(frame.bell)] : [])],
    [
      [boat.left - rect.width - 12, boat.top],
      [boat.left, boat.bottom + 12],
      [boat.right + 12, boat.top],
    ],
    [boat.left, boat.top],
  );
  receipt.style.visibility = placement ? 'visible' : 'hidden';
  if (placement) {
    receipt.style.left = placement.left + 'px';
    receipt.style.top = placement.top + 'px';
  }
}
function positionDialog() {
  if (!dialog.open) return;
  const canvas = world.host.getBoundingClientRect();
  dialog.style.maxWidth = safeBounds.right - safeBounds.left + 'px';
  if (journeySurface()) {
    dialog.dataset.layout = 'journey';
    if (mode === 'story') {
      dialog.style.width = safeBounds.right - safeBounds.left + 'px';
      dialog.style.height = safeBounds.bottom - safeBounds.top + 'px';
    } else {
      dialog.style.removeProperty('height');
      dialog.style.removeProperty('width');
    }
    dialog.style.setProperty('--dialog-max-height', safeBounds.bottom - safeBounds.top + 'px');
    dialog.style.left = safeBounds.left + 'px';
    dialog.style.right = 'auto';
    dialog.style.bottom = 'auto';
    const rect = dialog.getBoundingClientRect();
    dialog.style.top = Math.max(safeBounds.top, safeBounds.bottom - rect.height) + 'px';
    if (mode === 'story') storyView?.render(storyPresentation.frame);
    return;
  }
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

    dialog.style.removeProperty('height');

    const rect = dialog.getBoundingClientRect();
    const previousPlacement = actionPlacement;
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
        top: safeBounds.bottom - rect.height,
        bottom: safeBounds.bottom,
        layout: 'sheet',
      };
    }
    if (transfer && previousPlacement && canvas.width >= canvas.height && canvas.height > 360) {
      const bottom = Math.min(
        safeBounds.bottom,
        Math.max(safeBounds.top + rect.height, previousPlacement.bottom),
      );
      actionPlacement = { ...actionPlacement, top: bottom - rect.height, bottom };
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
function playObstacles(persistentOnly = false) {
  return [...document.querySelectorAll<HTMLElement>(persistentOnly
    ? '.tools button, #load-toggle, #status-toggle, .view-controls > button'
    : '.tools button, #load-toggle, #crossing-details, #status-toggle, .view-controls > button, #zoom-tools')]
    .filter((element) => !element.hidden && !element.closest('[hidden]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')
    .map((element) => element.getBoundingClientRect());
}
function factsWidth() {
  return locationSelection && locationFacts(session.state, locationSelection, level, tips.enabled).wouldLose ? 320 : 292;
}
function toggleStatus(open: boolean) {
  $('crossing-details').hidden = !open;
  $('load-toggle').setAttribute('aria-expanded', String(open));
  labelLayout.clear();
  scheduleLayout();
}
$('load-toggle').onclick = () => toggleStatus(!!$('crossing-details').hidden);
$('close-status').onclick = () => { toggleStatus(false); $('load-toggle').focus({ preventScroll: true }); };

function positionOwnedControls(
  bounds: Rectangle, chrome: Rectangle[], figures: Rectangle[],
  markers: { id: string; bounds: Rectangle }[], stage: Rectangle,
  boat: Rectangle, lighthouse: Rectangle,
) {
  const placed: Rectangle[] = [];
  const stops = markers.map(marker => marker.bounds);
  const subjects = [...figures, lighthouse, ...stops];
  const size = (element: HTMLElement) => ({ width: element.offsetWidth, height: element.offsetHeight });
  function position(element: HTMLElement, box: Rectangle) {
    element.style.left = box.left + 'px';
    element.style.top = box.top + 'px';
    placed.push(box);
  }
  const local = $('local-context');
  cardPlacement = null;
  protectedBounds = [];
  if (locationSelection && !local.hidden) {
    const marker = markers.find(m => m.id === locationSelection)!;
    const inset = 4;
    const width = Math.min(locationDetails ? 324 : factsWidth(), bounds.right - bounds.left - inset * 2);
    local.style.width = width + 'px';
    const midpoint = (bounds.top + bounds.bottom) / 2;
    const above = Math.max(bounds.top, ...chrome.filter(r => r.bottom < midpoint).map(r => r.bottom + inset));
    const below = Math.min(bounds.bottom, ...chrome.filter(r => r.top > midpoint).map(r => r.top - inset));
    local.style.setProperty('--local-max-height', Math.max(96, below - above) + 'px');
    const origin = selectionOrigin && {
      left: selectionOrigin.x - stage.left - 7, right: selectionOrigin.x - stage.left + 7,
      top: selectionOrigin.y - stage.top - 7, bottom: selectionOrigin.y - stage.top + 7,
    };
    protectedBounds = [...figures, ...chrome];
    const nearby = besideOwner(size(local), marker.bounds, bounds, [...subjects, ...chrome, ...(origin ? [origin] : [])]);
    local.dataset.placement = nearby ? 'local' : 'edge';
    cardPlacement = nearby ?? atScreenEdge(size(local), bounds, chrome, subjects);
    position(local, cardPlacement);
  }
  $('selection-leader').replaceChildren();
  const dock = $('dock-actions');
  dockPlacement = null;
  if (!dock.hidden) {
    const visible = overlaps(boat, bounds, 0);
    dock.style.visibility = visible ? 'visible' : 'hidden';
    if (visible) {
      const obstacles = [...chrome, ...placed];
      dock.dataset.placement = 'local';
      dock.dataset.layout = 'row';
      let nearby = besideOwner(size(dock), boat, bounds, [...obstacles, ...subjects]);
      if (!nearby && dock.children.length > 2) {
        dock.dataset.layout = 'column';
        nearby = besideOwner(size(dock), boat, bounds, [...obstacles, ...subjects]);
      }
      if (!nearby) {
        dock.dataset.placement = 'edge';
        dock.dataset.layout = 'row';
      }
      dockPlacement = nearby ?? atScreenEdge(size(dock), bounds, obstacles, subjects);
      position(dock, dockPlacement);
    }
  }
  return placed;
}

function positionMap() {
  if (session.state.status === 'won') {
    labelLayout.clear();
    labelAnchors.clear();
    cardPlacement = null;
    dockPlacement = null;
    protectedBounds = [];
    positionDialog();
    return;
  }
  const canvas = world.host.getBoundingClientRect(), stage = $('seascape').getBoundingClientRect();
  const frame = world.layoutFrameStatus();
  const ox = canvas.left - stage.left, oy = canvas.top - stage.top;
  const atLocal = (r: Rectangle) => ({
    left: r.left + ox, right: r.right + ox, top: r.top + oy, bottom: r.bottom + oy,
  });
  const toLocal = (r: Rectangle) => ({
    left: r.left - stage.left, right: r.right - stage.left, top: r.top - stage.top, bottom: r.bottom - stage.top,
  });
  const boat = atLocal(frame.boat), lighthouse = atLocal(frame.lighthouse);
  const figures = [boat, ...frame.passengers.map(atLocal)];
  const chrome = playObstacles().map(toLocal), bounds = toLocal(safeBounds);
  const endpoints = frame.nodes.map(node => ({ id: node.id, x: node.x + ox, y: node.y + oy }));
  const markers = placeCoveTargets(endpoints, bounds, chrome, figures);
  const placed = positionOwnedControls(bounds, chrome, figures, markers, stage, boat, lighthouse);
  const nav = $('map-labels');
  const density = world.viewStatus().mode === 'overview' ? 'overview' : 'play';
  if (nav.dataset.density !== density) nav.dataset.density = density;
  const dimensionsKey = [canvas.width, canvas.height, density, devicePixelRatio].join(':');
  if (labelDimensionsKey !== dimensionsKey) {
    labelDimensions.clear();
    labelDimensionsKey = dimensionsKey;
  }
  const departure = currentPassageDeparture();
  const focused = keyboardInput ? (document.activeElement as HTMLElement)?.dataset.destination : undefined;
  const current = session.state.boatNodeId;
  const priority = (id: string) => id === focused ? 0 : id === locationSelection ? 1 :
    id === current ? 2 : id === homeNodeId ? 3 : edgeTo(session.state, id, level) ? 4 : 5;
  const labels = markers.flatMap(marker => {
    const group = $('stop-' + marker.id);
    if (!group) return [];
    const visible = marker.onscreen && marker.id !== departure?.boatNodeId &&
      !(session.busy && selected?.type === 'move' && marker.id === current);
    group.classList.toggle('offscreen', !visible);
    group.classList.toggle('on-figure', marker.onFigure);
    const faceCue = { left: marker.x - 11, right: marker.x + 11, top: marker.y - 11, bottom: marker.y + 11 };
    group.classList.toggle('over-passenger', figures.slice(1).some(figure => overlaps(figure, faceCue, 0)));
    group.style.setProperty('--target-size', marker.size + 'px');
    group.style.left = marker.bounds.left + 'px';
    group.style.top = marker.bounds.top + 'px';
    const name = group.querySelector<HTMLElement>('.map-name')!;
    let dimensions = labelDimensions.get(marker.id);
    if (dimensions?.element !== name) {
      dimensions = { element: name, width: name.offsetWidth, height: name.offsetHeight };
      labelDimensions.set(marker.id, dimensions);
    }
    return visible ? [{ id: marker.id, group, marker, name, ...dimensions }] : [];
  }).sort((a, b) => priority(a.id) - priority(b.id));
  const passages: Rectangle[] = [];
  const activeEdge = edgeTo(session.state, emphasis ?? locationSelection ?? '', level)?.id;
  for (const edge of level.edges) {
    if (!edge.current && edge.id !== activeEdge) continue;
    const path = world.paths.get(edge.id)!;
    for (const fraction of [0.25, 0.35, 0.45, 0.55, 0.65, 0.75]) {
      const { position } = samplePath(path, path.length * fraction);
      const point = world.project([position.x, position.z]);
      passages.push({ left: point.x + ox - 5, right: point.x + ox + 5,
        top: point.y + oy - 4, bottom: point.y + oy + 4 });
    }
  }
  const dockNamesCurrent = dockPlacement && $('dock-actions').dataset.placement === 'local';
  const names = labels.filter(({ id }) =>
    id !== current || !dockNamesCurrent || focused === current || locationSelection === current);
  const result = placeCoveNames(names, markers.filter(m => m.onscreen), bounds,
    [...chrome, ...figures, lighthouse, ...placed, ...(frame.bell ? [atLocal(frame.bell)] : [])],
    labelAnchors, passages);
  labelLayout = result.placed;
  labelAnchors = result.anchors;
  for (const { id, group, marker, name } of labels) {
    const rect = labelLayout.get(id);
    group.dataset.labelVisible = String(!!rect);
    if (!rect) continue;
    name.style.left = rect.left - marker.bounds.left + 'px';
    name.style.top = rect.top - marker.bounds.top + 'px';
  }
  if (focused && !labelLayout.has(focused)) viewControls.dataset.focusedPlace = nodeNames[focused];
  else delete viewControls.dataset.focusedPlace;
  positionDialog();
}
function bindWorld() {
  world.onSelect = selectLocation;
  world.onCurrent = localContext;
  world.onClear = () => clearLocation();
  world.onPresentationStart = (action) => {
    if (action.type === 'move') sound.startTravel();
  };
  world.onTransferContact = (contact) =>
    sound.transferContact({
      weight: contact.passengerIds.some(
        (id) => (level.passengers.find((p) => p.id === id)?.slots ?? 0) >= 2,
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
}
bindWorld();
function closeZoom(restoreFocus = false) {
  if ($('zoom-tools').hidden) return;
  $('zoom-tools').hidden = true;
  $('view-zoom').setAttribute('aria-expanded', 'false');
  if (restoreFocus) $('view-zoom').focus({ preventScroll: true });
  scheduleLayout();
}
$('view-zoom').onclick = () => {
  if (blocked()) return;
  if (!$('zoom-tools').hidden) return closeZoom();
  $('view-zoom').setAttribute('aria-expanded', 'true');
  $('zoom-tools').hidden = false;
  $('zoom-out').focus({ preventScroll: true });
  scheduleLayout();
};
for (const [id, step] of [['zoom-in', 1], ['zoom-out', -1]] as const) {
  $(id).onclick = () => {
    if (blocked() || $(id).getAttribute('aria-disabled') === 'true') return;
    world.adjustZoom(step);
    scheduleLayout();
  };
}
viewControls.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || $('zoom-tools').hidden) return;
  event.preventDefault();
  event.stopPropagation();
  closeZoom(true);
});
viewControls.addEventListener('focusout', event => {
  if (!viewControls.contains(event.relatedTarget as Node | null)) closeZoom();
});
document.addEventListener('pointerdown', event => {
  if (!viewControls.contains(event.target as Node)) closeZoom();
}, true);
$('view-toggle').onclick = () => {
  if (dialog.open) return;
  closeZoom();
  if (world.viewStatus().mode === 'overview') clearLocation();
  world.setViewMode(world.viewStatus().mode === 'overview' ? 'play' : 'overview');
  scheduleLayout();
};
$('back-to-boat').onclick = () => {
  if (dialog.open) return;
  closeZoom();
  clearLocation();
  world.backToBoat();
  $('view-toggle').focus({ preventScroll: true });
  scheduleLayout();
};
const panGesture = new PanGesture();
let panPointer: number | null = null;
let suppressPanClick = false;
let canvas = world.renderer.domElement;
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
function bindCanvas() {
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
}
bindCanvas();
const layoutObserver = new ResizeObserver(scheduleLayout);
layoutObserver.observe(world.host);
layoutObserver.observe(dialog);
for (const control of document.querySelectorAll<HTMLElement>('.tools button, #load-toggle, #crossing-details, #local-context')) layoutObserver.observe(control);
layoutObserver.observe(viewControls);
layoutObserver.observe($('status-toggle'));
const refreshLabelFonts = () => {
  labelDimensions.clear();
  labelAnchors.clear();
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
function dismissDialogLayer() {
  if (mode === 'settings') backFromSettings();
  else if (journeySurface()) {
    if (mode === 'replace') showJourney('journey', 'journey-new');
    else if (mode === 'practice') returnToJourneyTitle();
    else if (mode === 'return-title') $('journey-return-cancel').click();
    else if (mode === 'transcript') switchDialog('story', 'story-read');
    else if (mode === 'story') {
      const more = $('story-more') as HTMLDetailsElement;
      if (more.open) {
        more.open = false;
        more.querySelector('summary')!.focus();
        return;
      }
      storyPresentation.skip();
      $('story-continue').focus({ preventScroll: true });
    }
  } else closeDialog(true);
}
dialog.addEventListener('cancel', (e) => {
  e.preventDefault();
  dismissDialogLayer();
});
dialog.addEventListener('click', (e) => e.stopPropagation());
dialog.addEventListener('keydown', (e) => {
  if (
    e.key === 'Escape' &&
    (mode === 'story' ||
      mode === 'transcript' ||
      (mode === 'settings' && settingsParent === 'story'))
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat) dismissDialogLayer();
    return;
  }
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

        if (e.key === 'Enter' || e.key === ' ') {
          captureSoundIntent(e.target);
          storyActionIntent = (e.target as Element).closest('#story-continue')
            ? storyActionKey()
            : null;
        } else soundIntent = null;
      }
    }
    if (e.repeat && ['Enter', ' '].includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (e.key === 'Escape' && !dialog.open && !$('crossing-details').hidden) {
      e.preventDefault();
      e.stopImmediatePropagation();
      toggleStatus(false);
      $('load-toggle').focus({ preventScroll: true });
      return;
    }
    if (e.key === 'Escape' && !dialog.open && locationSelection && locationDetails) {
      e.preventDefault();
      e.stopImmediatePropagation();
      $('location-details').click();
      $('location-details').focus({ preventScroll: true });
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
    storyActionIntent = (e.target as Element).closest('#story-continue') ? storyActionKey() : null;
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

    const commit = (e.target as Element).closest(
      '#sail, #commit, #board, #unload, #story-continue, #home-play',
    );

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
  if (document.hidden && mode === 'story') storyPresentation.settle();
  if (document.hidden) {
    clearReceipt();

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

  clearReceipt();

  storyPresentation.cancel();
  storyView = null;
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

if (journey) showHome();

if (import.meta.env.DEV)
  Object.assign(window, {
    __LAST_FERRY__: {
      getMasteryStatus: () => ({
        successfulUndos: session.successfulUndos,
        current: session.result,
        best: mastery.best(level.id),
        persistent: mastery.persistent,
        issue: mastery.issue,
      }),
      getState: () => copy(session.state),
      getCampaignStatus: () =>
        copy({
          entry: journey ? 'journey' : 'direct',
          active: campaignPlay,
          level: level.id,
          mode,
          scene: storyId,
          settled: storyPresentation.settled,
          progress: journey?.snapshot ?? null,
        }),
      getStoryStatus: () =>
        copy({
          timeline: storyPresentation.frame,
          view: storyView?.status() ?? null,
          clockPending: !!storyFrameRequest,
          coveredWorld: world.storyCovered,
          worldFramePending: !!world.frameRequest,
          world: world.storyPresentation(),
        }),
      getLegalActions: () => copy(legalActions(session.state, level)),
      getRenderStatus: () => ({
        profile: world.profile,
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
          controls: playObstacles(),
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
