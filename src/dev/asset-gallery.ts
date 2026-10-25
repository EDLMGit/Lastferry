import '../ui/cove-ui.css';
import './asset-gallery.css';
import catalog from '../../assets/catalog.json';
import { controlContent, escapeLabel, iconMarkup, iconNames, passengerChoiceContent, setControl, type CoveIcon } from '../ui/cove-ui';

const root = document.querySelector<HTMLElement>('#gallery')!;
const text = escapeLabel;
const entries = catalog.entries;
const sourceLink = (path: string, label: string) => `<a href="/${encodeURI(path)}" target="_blank" rel="noopener">${text(label)}</a>`;
const choices = (names: [string, number, boolean][], focus = false) =>
  `<div class="passenger-options" role="group" aria-label="Specimen passenger selection">${names.map(([name, spaces, selected], index) => `<button class="cove-choice" aria-pressed="${selected}"${focus && index === 0 ? ' data-demo-state="focus"' : ''}>${passengerChoiceContent(name, spaces)}</button>`).join('')}</div>`;
const residents: [string, number, boolean][] = [['Pip', 1, true], ['Rue', 1, true], ['Moss', 2, true]];
root.innerHTML = `<header><p>Last Ferry · developer tools</p><h1>Cove asset gallery</h1><p>Live component sources and canonical inventory. This is design evidence, not a gameplay capture.</p><p>${entries.length} families · <a href="/">Open the game</a> · <a href="/assets/catalog.json">Canonical JSON</a></p></header>
<section class="cove-panel cove-surface gallery-panel"><h2>Shared controls</h2><div id="controls" class="specimens"></div><p><span class="cove-name cove-surface cove-surface--compact cove-objective">${iconMarkup('harbor-home')}Harbor · Home</span> &nbsp; ${controlContent('back-to-boat', 'Back to boat identifies the camera control')}</p></section>
<section aria-labelledby="panel-material-heading"><h2 id="panel-material-heading">Painted reading material</h2><p>Actual shared CSS and one original SVG corner. Component geometry remains local; no text is baked into the decoration.</p><div class="panel-specimens">
<article id="gallery-three-passengers" class="cove-panel cove-surface gallery-panel panel-specimen"><p>Harbor · inspection is free</p><h3>Deliver Pip, Rue and Moss</h3>${choices(residents)}<p><strong>After unloading: boat needs depth 1.</strong></p><p>Everyone will be safely home at Harbor.</p><p>After this action: Boat 0/4 spaces · tide 2.</p><button id="gallery-confirm"></button></article>
<article id="gallery-narrow-passengers" class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow"><p>320px panel · native selection buttons</p><h3>Room for full labels</h3>${choices([['Pip', 1, true], ['Rue', 1, false], ['Moss', 2, true]], true)}<p class="gallery-warning">Pip boards, then the tide rises. Rue is still waiting at Rabbit Pier when it floods. This ends the crossing.</p></article>
<article id="gallery-text-stress" class="cove-panel cove-surface gallery-panel panel-specimen panel-specimen--narrow gallery-text-stress"><p>Bounded stress specimen · 320px panel, 20px text (125%)</p><h3>Longer names</h3>${choices([['Alexandria', 1, true], ['Marigold', 1, false], ['Moss', 2, true]])}<p>Gallery-only labels test wrapping. Actual passenger and level data are unchanged.</p></article>
</div><div class="cove-panel cove-surface cove-surface--compact gallery-panel"><h3>Compact face</h3><p>Shared opaque wash with no corner decoration. HUD, names, forecast and local options retain their own dimensions.</p><button id="gallery-forecast" class="cove-panel cove-surface cove-surface--compact gallery-forecast" data-demo-state="focus">! Rabbit Pier floods in 1 action.</button></div>
<div class="cove-panel cove-surface cove-surface--arrival gallery-panel"><h3>Everyone home.</h3><p>Arrival uses only a warmer upper catchlight. Normal action and home colors remain the existing button family.</p><button id="gallery-next"></button></div></section>
<section class="cove-panel cove-surface gallery-panel"><h2>Original 24px glyphs</h2><div class="icon-grid">${iconNames.map((name) => `<div>${iconMarkup(name)}<span>${name}</span></div>`).join('')}</div></section><section><h2>Canonical inventory</h2><label>Filter by family, kind or meaning <input id="filter" type="search" /></label><p id="count" role="status"></p><div id="inventory"></div></section>`;
setControl(document.querySelector('#gallery-confirm')!, 'confirm', 'Confirm · 1 action', 'warm');
setControl(document.querySelector('#gallery-next')!, 'next-cove', 'Next cove', 'warm');
const demoControls: [CoveIcon | null, string, 'quiet' | 'action' | 'warm', string?][] = [
  ['board', 'Board', 'action'], ['unload', 'Let ashore', 'action'],
  ['unload', 'Bring home', 'warm'], ['sail', 'Sail · 1 action', 'action'],
  ['confirm', 'Confirm · 1 action', 'action'], ['next-cove', 'Next cove', 'warm'],
  ['undo', 'Undo', 'quiet'], ['wait', 'Wait · 1 action', 'quiet'],
  ['whole-cove', 'Whole cove', 'quiet'], ['back-to-boat', 'Back to boat', 'quiet'],
  ['sound-retry', 'Retry sound', 'quiet'], ['fullscreen-exit', 'Exit fullscreen', 'quiet'],
  ['board', 'Pressed', 'action', 'pressed'], ['board', 'Focus', 'action', 'focus'],
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
  ['menu', 'Menu'], ['settings', 'Settings'], ['close', 'Close'],
  ['sound-on', 'Mute sound'], ['sound-off', 'Enable sound'],
  ['fullscreen-enter', 'Fullscreen'],
] as const) {
  const button = document.createElement('button');
  setControl(button, icon, label, 'quiet', true);
  button.title = label;
  document.querySelector('#controls')!.append(button);
}
for (const button of root.querySelectorAll<HTMLButtonElement>('.cove-choice'))
  button.onclick = () => button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
const showInventory = () => {
  const query = (document.querySelector('#filter') as HTMLInputElement).value.toLowerCase();
  const shown = entries.filter((entry) => `${entry.id} ${entry.name} ${entry.kind} ${entry.meaning}`.toLowerCase().includes(query));
  document.querySelector('#count')!.textContent = `${shown.length} of ${entries.length} families`;
  document.querySelector('#inventory')!.innerHTML = shown.map((entry) => `<details class="cove-panel cove-surface cove-surface--compact gallery-panel"><summary><b>${text(entry.name)}</b> <span>${text(entry.id)} · ${text(entry.status)}</span></summary><p>${text(entry.meaning)}</p><p>${text(entry.visualSignature)}</p><p>Human acceptance: ${text(entry.acceptance.state)}</p><h3>Source and ownership</h3><ul>${entry.sources.map((source) => `<li>${sourceLink(source.path, source.path)} · ${text(source.symbol)}</li>`).join('')}</ul><p>${text(entry.reuseAndOwnership)}</p><p>${text(entry.behaviorToPreserve)}</p><h3>Provenance</h3><p>${text(entry.provenance)}</p><pre>${text(JSON.stringify(catalog.provenanceProfiles[entry.provenance as keyof typeof catalog.provenanceProfiles], null, 2))}</pre><h3>Evidence</h3><ul>${entry.evidence.map((item) => `<li>${sourceLink(item.path, item.role)}</li>`).join('')}</ul><h3>Type contract</h3><pre>${text(JSON.stringify(entry.typeSpecific, null, 2))}</pre></details>`).join('');
};
document.querySelector('#filter')!.addEventListener('input', showInventory);
showInventory();
