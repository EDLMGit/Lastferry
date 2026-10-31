import * as T from 'three';
import { animal } from '../scene/models';
import '../ui/cove-ui.css';
import './asset-gallery.css';
import catalog from '../../assets/catalog.json';
import {
  controlContent,
  escapeLabel,
  iconMarkup,
  iconNames,
  observePassengerPortraits,
  passengerChoiceContent,
  portraitSources,
  setControl,
  type CoveIcon,
} from '../ui/cove-ui';
import type { PortraitKey } from '../game/passenger-appearance';
import { storyScenes } from '../campaign/registry';
import { checkpointCopy } from '../campaign/progress';
import { createCoveStoryPainter } from '../campaign/story-painter';

const root = document.querySelector<HTMLElement>('#gallery')!;
const text = escapeLabel;
const entries = catalog.entries;
const sourceLink = (path: string, label: string) =>
  `<a href="/${encodeURI(path)}" target="_blank" rel="noopener">${text(label)}</a>`;
const choices = (names: [string, number, boolean, PortraitKey | null][], focus = false) =>
  `<div class="passenger-options" role="group" aria-label="Specimen passenger selection">${names.map(([name, spaces, selected, appearance], index) => `<button class="cove-choice" aria-pressed="${selected}"${focus && index === 0 ? ' data-demo-state="focus"' : ''}>${passengerChoiceContent(name, spaces, appearance)}</button>`).join('')}</div>`;
const residents: [string, number, boolean, PortraitKey][] = [
  ['Pip', 1, true, 'rabbit-cream'],
  ['Rue', 1, true, 'rabbit-tan'],
  ['Moss', 2, true, 'sheep-wool'],
];
observePassengerPortraits(root);
root.innerHTML = `<header><p>Last Ferry · developer tools</p><h1>Cove asset gallery</h1><p>Live component sources and canonical inventory. This is design evidence, not a gameplay capture.</p><p>${entries.length} families · <a href="/">Open the game</a> · <a href="/assets/catalog.json">Canonical JSON</a></p></header>
<section class="cove-panel cove-surface gallery-panel"><h2>Shared controls</h2><div id="controls" class="specimens"></div><p><span class="cove-name cove-surface cove-surface--compact cove-objective">${iconMarkup('harbor-home')}Harbor · Home</span> &nbsp; ${controlContent('back-to-boat', 'Back to boat identifies the camera control')}</p></section>
<section aria-labelledby="panel-material-heading"><h2 id="panel-material-heading">Painted reading material</h2><p>Actual shared CSS and one original SVG corner. Component geometry remains local; no text is baked into the decoration.</p><div class="panel-specimens">
<article id="gallery-three-passengers" class="cove-panel cove-surface gallery-panel panel-specimen"><p>Harbor · inspection is free</p><h3>Deliver Pip, Rue and Moss</h3>${choices(residents)}<p><strong>After unloading: boat needs depth 1.</strong></p><p>Everyone will be safely home at Harbor.</p><p>After this action: Boat 0/4 spaces · tide 2.</p><button id="gallery-confirm"></button></article>
<article id="gallery-narrow-passengers" class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow"><p>320px panel · native selection buttons</p><h3>Room for full labels</h3>${choices(
  [
    ['Pip', 1, true, 'rabbit-cream'],
    ['Rue', 1, false, 'rabbit-tan'],
    ['Moss', 2, true, 'sheep-wool'],
  ],
  true,
)}<p class="gallery-warning">Pip boards, then the tide rises. Rue is still waiting at Rabbit Pier when it floods. This ends the crossing.</p></article>
<article id="gallery-text-stress" class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow gallery-text-stress"><p>Bounded stress specimen · 320px panel, 20px text (125%)</p><h3>Longer names</h3>${choices(
  [
    ['Alexandria', 1, true, 'rabbit-cream'],
    ['Marigold', 1, false, 'rabbit-tan'],
    ['Moss', 2, true, 'sheep-wool'],
  ],
)}<p>Gallery-only labels use explicit appearance fixtures to test wrapping. Actual passenger and level data are unchanged.</p></article>
</div><div class="cove-panel cove-surface cove-surface--compact gallery-panel"><h3>Compact face</h3><p>Shared opaque wash with no corner decoration. HUD, names, forecast and local options retain their own dimensions.</p><button id="gallery-forecast" class="cove-panel cove-surface cove-surface--compact gallery-forecast" data-demo-state="focus">! Rabbit Pier floods in 1 action.</button></div>
<div class="cove-panel cove-surface cove-surface--arrival gallery-panel"><h3>Everyone home.</h3><p>Arrival uses only a warmer upper catchlight. Normal action and home colors remain the existing button family.</p><button id="gallery-next"></button></div></section>
<section aria-labelledby="beaver-heading"><h2 id="beaver-heading">Nell · real beaver model</h2><p>The production geometry, including the broad resting tail, muzzle and compact paws. A static developer specimen uses the same model factory; it is not gameplay evidence.</p><div class="panel-specimens"><figure class="cove-panel cove-surface gallery-panel"><canvas id="gallery-beaver-model" style="width:100%;height:260px;display:block" role="img" aria-label="Nell the warm brown beaver with a lighter muzzle, small round ears, broad nose and flat darker tail"></canvas><figcaption>Nell · two spaces · original editable geometry</figcaption></figure><article class="cove-panel cove-surface gallery-panel panel-specimen--narrow"><h3>Driftwood neighbors</h3>${choices([['Nell',2,true,'beaver-brown'],['Fern',1,true,'rabbit-cream'],['Oat',1,true,'rabbit-tan']])}<p>Explicit stable coats survive offered subsets and passenger-array reorder.</p><p><a href="/?cove=driftwood-yard">Open the actual Driftwood rescue</a></p></article></div></section><section aria-labelledby="portrait-heading"><h2 id="portrait-heading">Model-derived static portraits</h2><p>Four original transparent 256px PNG derivatives, displayed at 44px beside live copy in the shared choice helper. Offline SVG diffuse shading is not pixel-identical WebGL. These are design specimens, not gameplay captures.</p><div class="portrait-sources">${(Object.entries(portraitSources) as [PortraitKey, string][]).map(([key, url]) => `<figure class="cove-panel cove-surface gallery-panel"><img class="portrait-source" src="${url}" width="256" height="256" alt="${key.replace('-', ' ')} model-derived source portrait" draggable="false" /><figcaption>${key} · 256×256 PNG</figcaption></figure>`).join('')}</div><div class="panel-specimens"><article id="gallery-bellwater-portraits" class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow"><h3>Bellwater names, same appearances</h3>${choices(
  [
    ['Tansy', 1, false, 'rabbit-cream'],
    ['Lark', 1, true, 'rabbit-tan'],
    ['Bram', 2, false, 'sheep-wool'],
  ],
  true,
)}<p>Names and capacities remain level-owned. Offered order cannot recolor Lark.</p></article><article id="gallery-failed-portrait" class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow"><h3>Unavailable image</h3>${choices([['Lark', 1, true, 'rabbit-tan']])}<p>The image request intentionally fails. The reserved slot, full name/cost and selected check stay usable.</p></article><article id="gallery-unknown-portrait" class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow"><h3>Future appearance fallback</h3>${choices([['Future passenger', 1, false, null]])}<p>Explicit unavailable appearance preserves text instead of guessing a different animal.</p></article></div></section>
<section aria-labelledby="home-heading"><h2 id="home-heading">Live Home composition</h2><p>Authored framing of the retained ferry, lighthouse and water. The actual root composes around measured title/menu bounds; this gallery does not create a second World.</p><p><a href="/">Open actual Home</a> · ${sourceLink('docs/HOME_COMPOSITION.md', 'Camera, layouts and ownership recipe')}</p><div class="cove-panel cove-surface gallery-panel"><h3>Last Ferry · The Long Tide</h3><button id="gallery-home-play"></button><button id="gallery-home-options"></button><p>Saved cove: Continue · from cove start. These are shared control specimens, not gameplay evidence.</p></div></section><section aria-labelledby="story-heading"><h2 id="story-heading">Illustrated story and journey surfaces</h2><p>The four composed endpoints below use the actual production painter and registry captions. These static design specimens are not journey recordings or gameplay evidence. The opening reference is approved; the production port, new Harbor art and story sound mix await human review.</p><article class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow"><p>Journey entrance</p><h3>Last Ferry</h3><p>${text(checkpointCopy)}</p><button id="gallery-journey-new"></button><button id="gallery-journey-continue"></button></article><div class="story-specimens">${Object.values(
  storyScenes,
)
  .flatMap((scene) =>
    scene.shots.map(
      (shot, index) =>
        `<figure class="cove-panel cove-surface gallery-story"><h3>${text(scene.title)} · ${text(shot.id)}</h3><canvas data-illustration="${shot.illustration}" data-duration-ms="${shot.durationMs}" role="img" aria-label="${text(shot.description)}"></canvas><figcaption class="gallery-story-caption">${text(shot.caption)}</figcaption><button class="gallery-story-continue" data-continue-label="${text(index === scene.shots.length - 1 ? scene.continueLabel : 'Next')}"></button><p>${shot.durationMs / 1000}s finite illustration; normal opening playback advances until the final held endpoint. The primary action is immediately available. Next changes only the picture; only the final handoff acknowledges the scene.</p><p>${text(shot.description)}</p></figure>`,
    ),
  )
  .join(
    '',
  )}</div><div class="cove-panel cove-surface gallery-panel"><h3>Story effects and optional narration</h3><p>Finite tide wash, lantern contact and ferry water share the existing Sound owner. This gallery does not autoplay sound. Actual runtime audio, cancellation checks and listening limitations belong in the review report.</p><p>${sourceLink('src/audio/story-effects.ts', 'Story envelope definitions')} · ${sourceLink('src/audio/atmosphere.ts', 'Sound ownership and routing')} · ${sourceLink('LAST_FERRY_STORY_PRODUCTION_PACKAGE/audio/narration-script.json', 'Narration script: recordings absent')}</p><p>Four narration IDs are optional asset slots only. There is no delivered voice, live TTS or unavailable narration control.</p></div></section>
<section class="cove-panel cove-surface gallery-panel"><h2>Original 24px glyphs</h2><div class="icon-grid">${iconNames.map((name) => `<div>${iconMarkup(name)}<span>${name}</span></div>`).join('')}</div></section><section><h2>Canonical inventory</h2><label>Filter by family, kind or meaning <input id="filter" type="search" /></label><p id="count" role="status"></p><div id="inventory"></div></section>`;
const failedPortrait = root.querySelector<HTMLImageElement>('#gallery-failed-portrait img')!;
failedPortrait.dataset.portraitState = 'pending';
failedPortrait.src = '/__portrait-unavailable.png';
setControl(document.querySelector('#gallery-confirm')!, 'confirm', 'Confirm · 1 action', 'warm');
setControl(document.querySelector('#gallery-next')!, 'next-cove', 'Next cove', 'warm');
setControl(document.querySelector('#gallery-home-play')!, null, 'Play', 'warm');
setControl(document.querySelector('#gallery-home-options')!, 'settings', 'Options', 'quiet');
setControl(document.querySelector('#gallery-journey-new')!, 'next-cove', 'New journey', 'warm');
setControl(
  document.querySelector('#gallery-journey-continue')!,
  'next-cove',
  'Continue journey · from cove start',
  'action',
);
for (const button of root.querySelectorAll<HTMLButtonElement>('.gallery-story-continue'))
  setControl(button, 'next-cove', button.dataset.continueLabel!, 'warm');
const beaverCanvas = root.querySelector<HTMLCanvasElement>('#gallery-beaver-model')!;
const beaverRenderer = new T.WebGLRenderer({ canvas: beaverCanvas, alpha: true, antialias: true });
beaverRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
beaverRenderer.outputColorSpace = T.SRGBColorSpace;
beaverRenderer.toneMapping = T.ACESFilmicToneMapping;
const beaverScene = new T.Scene();
const beaver = animal('beaver');
beaver.scale.set(1.15, 1.5, 1.15);
beaverScene.add(beaver, new T.AmbientLight('#dce8dd', 2.2));
const beaverKey = new T.DirectionalLight('#ffe4bc', 3);
beaverKey.position.set(-3, 5, 4);
beaverScene.add(beaverKey);
const beaverCamera = new T.OrthographicCamera(-0.65, 0.65, 1, -0.3, 0.01, 20);
beaverCamera.position.set(2.7, 2.3, 5);
beaverCamera.lookAt(0, 0.4, 0);
const beaverResize = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  if (width <= 0 || height <= 0) return;
  const halfHeight = 0.65;
  beaverCamera.left = -halfHeight * width / height;
  beaverCamera.right = halfHeight * width / height;
  beaverCamera.top = halfHeight;
  beaverCamera.bottom = -halfHeight;
  beaverCamera.updateProjectionMatrix();
  beaverRenderer.setSize(width, height, false);
  beaverRenderer.render(beaverScene, beaverCamera);
});
beaverResize.observe(beaverCanvas);
const storyPainters = new Map<HTMLCanvasElement, ReturnType<typeof createCoveStoryPainter>>();
const storyResize = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const canvas = entry.target as HTMLCanvasElement,
      painter = storyPainters.get(canvas)!;
    painter.resize(entry.contentRect.width, entry.contentRect.height, devicePixelRatio);
    painter.draw(
      canvas.dataset.illustration as Parameters<typeof painter.draw>[0],
      Number(canvas.dataset.durationMs) / 1000,
    );
  }
});
for (const canvas of root.querySelectorAll<HTMLCanvasElement>('[data-illustration]')) {
  storyPainters.set(canvas, createCoveStoryPainter(canvas));
  storyResize.observe(canvas);
}
function releaseStoryGallery() {
  storyResize.disconnect();
  beaverResize.disconnect();
  beaverScene.traverse((object) => {
    if (object instanceof T.Mesh) object.geometry.dispose();
  });
  beaverRenderer.dispose();
  storyPainters.clear();
}
window.addEventListener('pagehide', releaseStoryGallery, { once: true });
const demoControls: [CoveIcon | null, string, 'quiet' | 'action' | 'warm', string?][] = [
  ['board', 'Board', 'action'],
  ['unload', 'Let ashore', 'action'],
  ['unload', 'Bring home', 'warm'],
  ['sail', 'Sail · 1 action', 'action'],
  ['confirm', 'Confirm · 1 action', 'action'],
  ['next-cove', 'Next cove', 'warm'],
  ['undo', 'Undo', 'quiet'],
  ['wait', 'Wait · 1 action', 'quiet'],
  ['whole-cove', 'Whole cove', 'quiet'],
  ['back-to-boat', 'Back to boat', 'quiet'],
  ['sound-retry', 'Retry sound', 'quiet'],
  ['fullscreen-exit', 'Exit fullscreen', 'quiet'],
  ['board', 'Pressed', 'action', 'pressed'],
  ['board', 'Focus', 'action', 'focus'],
  ['sail', 'Unavailable', 'action', 'disabled'],
];
for (const [icon, label, face, state] of demoControls) {
  const button = document.createElement('button');
  setControl(button, icon, label, face);
  if (state === 'disabled') button.disabled = true;
  else if (state) button.dataset.demoState = state;
  document.querySelector('#controls')!.append(button);
}
for (const [icon, label] of [
  ['menu', 'Menu'],
  ['settings', 'Settings'],
  ['close', 'Close'],
  ['sound-on', 'Mute sound'],
  ['sound-off', 'Enable sound'],
  ['fullscreen-enter', 'Fullscreen'],
] as const) {
  const button = document.createElement('button');
  setControl(button, icon, label, 'quiet', true);
  button.title = label;
  document.querySelector('#controls')!.append(button);
}
for (const button of root.querySelectorAll<HTMLButtonElement>('.cove-choice'))
  button.onclick = () =>
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
const showInventory = () => {
  const query = (document.querySelector('#filter') as HTMLInputElement).value.toLowerCase();
  const shown = entries.filter((entry) =>
    `${entry.id} ${entry.name} ${entry.kind} ${entry.meaning}`.toLowerCase().includes(query),
  );
  document.querySelector('#count')!.textContent = `${shown.length} of ${entries.length} families`;
  document.querySelector('#inventory')!.innerHTML = shown
    .map(
      (entry) =>
        `<details class="cove-panel cove-surface cove-surface--compact gallery-panel"><summary><b>${text(entry.name)}</b> <span>${text(entry.id)} · ${text(entry.status)}</span></summary><p>${text(entry.meaning)}</p><p>${text(entry.visualSignature)}</p><p>Human acceptance: ${text(entry.acceptance.state)}</p><h3>Source and ownership</h3><ul>${entry.sources.map((source) => `<li>${sourceLink(source.path, source.path)} · ${text(source.symbol)}</li>`).join('')}</ul><p>${text(entry.reuseAndOwnership)}</p><p>${text(entry.behaviorToPreserve)}</p><h3>Provenance</h3><p>${text(entry.provenance)}</p><pre>${text(JSON.stringify(catalog.provenanceProfiles[entry.provenance as keyof typeof catalog.provenanceProfiles], null, 2))}</pre><h3>Evidence</h3><ul>${entry.evidence.map((item) => `<li>${sourceLink(item.path, item.role)}</li>`).join('')}</ul><h3>Type contract</h3><pre>${text(JSON.stringify(entry.typeSpecific, null, 2))}</pre></details>`,
    )
    .join('');
};
document.querySelector('#filter')!.addEventListener('input', showInventory);
showInventory();

const driftwoodLink = document.createElement("section");
driftwoodLink.id = "driftwood-yard";
driftwoodLink.innerHTML = `<h2>Driftwood Yard · authored environment and illustrated connection</h2><p><a href="/?cove=driftwood-yard">Play the actual timber-yard cove</a> · <a href="/">Open the journey for the earned Nell lantern scene</a></p>`;
document.querySelector("main")!.append(driftwoodLink);
