import '../ui/cove-ui.css';
import './asset-gallery.css';
import catalog from '../../assets/catalog.json';
import { controlContent, escapeLabel, iconMarkup, iconNames, setControl, type CoveIcon } from '../ui/cove-ui';

const root = document.querySelector<HTMLElement>('#gallery')!;
const text = escapeLabel;
const entries = catalog.entries;
const sourceLink = (path: string, label: string) => `<a href="/${encodeURI(path)}" target="_blank" rel="noopener">${text(label)}</a>`;
root.innerHTML = `<header><p>Last Ferry · developer tools</p><h1>Cove asset gallery</h1><p>Live component sources and canonical inventory. This is design evidence, not a gameplay capture.</p><p>${entries.length} families · <a href="/">Open the game</a> · <a href="/assets/catalog.json">Canonical JSON</a></p></header><section class="cove-panel gallery-panel"><h2>Shared controls</h2><div id="controls" class="specimens"></div><div class="passenger-options"><button class="cove-choice" aria-pressed="true"><span class="cove-choice-check" aria-hidden="true">${iconMarkup('confirm')}</span><span class="cove-choice-copy"><b>Moss</b><span> · 2 spaces</span></span></button><button class="cove-choice" aria-pressed="false"><span class="cove-choice-check" aria-hidden="true">${iconMarkup('confirm')}</span><span class="cove-choice-copy"><b>Rue</b><span> · 1 space</span></span></button></div><p class="gallery-warning">! Flood warning · a waiting passenger would be lost. Inspection is free.</p><p><span class="cove-name cove-objective">${iconMarkup('harbor-home')}Harbor · Home</span> &nbsp; ${controlContent('back-to-boat', 'Back to boat identifies the camera control')}</p></section><section class="cove-panel gallery-panel"><h2>Original 24px glyphs</h2><div class="icon-grid">${iconNames.map((name) => `<div>${iconMarkup(name)}<span>${name}</span></div>`).join('')}</div></section><section><h2>Canonical inventory</h2><label>Filter by family, kind or meaning <input id="filter" type="search" /></label><p id="count" role="status"></p><div id="inventory"></div></section>`;
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
  document.querySelector('#inventory')!.innerHTML = shown.map((entry) => `<details class="cove-panel gallery-panel"><summary><b>${text(entry.name)}</b> <span>${text(entry.id)} · ${text(entry.status)}</span></summary><p>${text(entry.meaning)}</p><p>${text(entry.visualSignature)}</p><p>Human acceptance: ${text(entry.acceptance.state)}</p><h3>Source and ownership</h3><ul>${entry.sources.map((source) => `<li>${sourceLink(source.path, source.path)} · ${text(source.symbol)}</li>`).join('')}</ul><p>${text(entry.reuseAndOwnership)}</p><p>${text(entry.behaviorToPreserve)}</p><h3>Provenance</h3><p>${text(entry.provenance)}</p><pre>${text(JSON.stringify(catalog.provenanceProfiles[entry.provenance as keyof typeof catalog.provenanceProfiles], null, 2))}</pre><h3>Evidence</h3><ul>${entry.evidence.map((item) => `<li>${sourceLink(item.path, item.role)}</li>`).join('')}</ul><h3>Type contract</h3><pre>${text(JSON.stringify(entry.typeSpecific, null, 2))}</pre></details>`).join('');
};
document.querySelector('#filter')!.addEventListener('input', showInventory);
showInventory();
