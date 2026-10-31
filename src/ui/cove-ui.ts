import type { PortraitKey } from '../game/passenger-appearance';
import creamPortrait from '../../cove-portrait-package/portraits/rabbit-cream.png';
import tanPortrait from '../../cove-portrait-package/portraits/rabbit-tan.png';
import beaverPortrait from '../../assets/portraits/beaver-brown.png';
import woolPortrait from '../../cove-portrait-package/portraits/sheep-wool.png';

export const portraitSources: Record<PortraitKey, string> = {
  'rabbit-cream': creamPortrait,
  'rabbit-tan': tanPortrait,
  'sheep-wool': woolPortrait,
  'beaver-brown': beaverPortrait,
};

const originals = import.meta.glob<string>(
  ['../../cove-ui-package/ui/icons/*.svg', '!../../cove-ui-package/ui/icons/cove-icons.svg'],
  { eager: true, query: '?raw', import: 'default' },
);

export const iconNames = [
  'board', 'unload', 'sail', 'harbor-home', 'undo', 'wait', 'whole-cove', 'back-to-boat',
  'menu', 'settings', 'close', 'confirm', 'next-cove', 'sound-on', 'sound-off',
  'sound-retry', 'fullscreen-enter', 'fullscreen-exit',
] as const;
export type CoveIcon = (typeof iconNames)[number];
export type CoveFace = 'quiet' | 'action' | 'warm';

export function escapeLabel(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export function iconMarkup(name: CoveIcon) {
  const source = originals[`../../cove-ui-package/ui/icons/${name}.svg`];
  if (!source) throw new Error(`Missing cove icon: ${name}`);
  return source.replace('<svg ', `<svg class="cove-glyph" data-icon="${name}" `);
}

export function controlContent(name: CoveIcon | null, label: string) {
  return `${name ? iconMarkup(name) : ''}<span class="cove-label">${escapeLabel(label)}</span>`;
}

export function passengerChoiceContent(name: string, spaces: number, portrait: PortraitKey | null) {
  const image = portrait ? portraitSources[portrait] : null;
  return `<span class="cove-choice-portrait" data-appearance="${portrait ?? 'unavailable'}" aria-hidden="true">${image ? `<img class="cove-portrait-image" src="${escapeLabel(image)}" alt="" aria-hidden="true" width="256" height="256" draggable="false" decoding="async" data-portrait-state="pending">` : ''}</span><span class="cove-choice-copy"><span class="cove-choice-check" aria-hidden="true">${iconMarkup('confirm')}</span><b class="cove-choice-name">${escapeLabel(name)}</b><span class="cove-choice-capacity">${spaces} ${spaces === 1 ? 'space' : 'spaces'}</span></span>`;
}

export function observePassengerPortraits(root: HTMLElement) {
  const settle = (event: Event) => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.classList.contains('cove-portrait-image'))
      image.dataset.portraitState = event.type === 'load' && image.naturalWidth > 0 ? 'loaded' : 'failed';
  };
  root.addEventListener('load', settle, true);
  root.addEventListener('error', settle, true);
}

export function setControl(
  button: HTMLElement,
  name: CoveIcon | null,
  label: string,
  face: CoveFace = 'quiet',
  iconOnly = false,
) {
  for (const [name, enabled] of [
    ['cove-button', true], ['cove-button--quiet', face === 'quiet'],
    ['cove-button--warm', face === 'warm'], ['cove-button--icon', iconOnly],
  ] as const)
    if (button.classList.contains(name) !== enabled) button.classList.toggle(name, enabled);
  let glyph = button.querySelector<SVGElement>(':scope > .cove-glyph');
  if (glyph?.dataset.icon !== (name ?? undefined)) {
    glyph?.remove();
    glyph = null;
  }
  let text = button.querySelector<HTMLSpanElement>(':scope > .cove-label');
  if (!text) {
    button.replaceChildren();
    glyph = null;
    text = document.createElement('span');
    text.className = 'cove-label';
    button.append(text);
  }
  if (name && !glyph) button.insertAdjacentHTML('afterbegin', iconMarkup(name));
  if (text.textContent !== label) text.textContent = label;
  if (text.classList.contains('sr-only') !== iconOnly) text.classList.toggle('sr-only', iconOnly);
}
