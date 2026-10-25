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
