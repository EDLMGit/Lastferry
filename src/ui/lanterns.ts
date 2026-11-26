import type { MasteryResult } from '../game/mastery';
import { masteryTargets } from '../game/mastery';
import { practiceCoves } from '../campaign/registry';
import { escapeLabel } from './cove-ui';
import lanternSource from '../../assets/ui/mastery-lantern.svg?raw';
import resultLanternSource from '../../assets/ui/result-lantern.svg?raw';
import './lanterns.css';

export function lanterns(count: number) {
  return `<span class="mastery-lanterns" aria-hidden="true">${[1, 2, 3].map(index =>
    lanternSource.replace('<svg ', `<svg class="mastery-lantern" data-lit="${index <= count}" `),
  ).join('')}</span>`;
}

export function arrivalLanternsMarkup(current: MasteryResult | null) {
  if (!current) return '<p class="arrival-unrated">Rescued · no lantern rating</p>';
  return `<div class="arrival-lanterns" role="img" aria-label="This rescue · ${current.lanterns} of 3 lanterns" data-lanterns="${current.lanterns}">${[1, 2, 3].map(index =>
    resultLanternSource.replace('<svg ', `<svg class="arrival-lantern" data-lit="${index <= current.lanterns}" data-lantern="${index}" `),
  ).join('')}<span class="arrival-lantern-count" aria-hidden="true">${current.lanterns}/3 lanterns</span></div>`;
}

function metrics(result: MasteryResult) {
  return `${result.actions} actions · ${result.successfulUndos} ${result.successfulUndos === 1 ? 'Undo' : 'Undos'}`;
}

export function masteryResultMarkup(current: MasteryResult, best: MasteryResult | null = null) {
  const different = best && (best.actions !== current.actions || best.successfulUndos !== current.successfulUndos || best.lanterns !== current.lanterns);
  return `<section id="mastery-result" class="mastery-result" data-lanterns="${current.lanterns}" data-actions="${current.actions}" data-undos="${current.successfulUndos}" aria-label="This rescue"><div class="mastery-heading"><strong>This rescue · ${current.lanterns} of 3 lanterns</strong>${lanterns(current.lanterns)}</div><p class="mastery-metrics">${metrics(current)}</p>${different ? `<p id="mastery-best" class="mastery-best">Best rescue · ${best.lanterns} of 3 lanterns<br>${metrics(best)}</p>` : ''}</section>`;
}

export function masteryBadgeMarkup(best: MasteryResult | null, knownRescued = false, scored = true) {
  if (!scored) return `<span class="mastery-badge mastery-unrated">${knownRescued ? 'Rescued' : 'Story crossing'} · no lantern rating</span>`;
  if (!best) return `<span class="mastery-badge mastery-unrated">${knownRescued ? 'Rescued · not yet rated' : 'Not yet rated'}</span>`;
  return `<span class="mastery-badge" role="img" aria-label="Best · ${best.lanterns} of 3 lanterns · ${metrics(best)}">${lanterns(best.lanterns)}<span aria-hidden="true">${best.lanterns} of 3</span></span>`;
}

export function masteryCriteriaMarkup(target?: number, title?: string) {
  const heading = target === undefined ? (title ?? 'Three lanterns · targets') : `Three lanterns · target ${target} actions`;
  const efficiency = target === undefined ? 'Rescue within this cove’s action target.' : `Rescue in ${target} actions or fewer.`;
  const targets = target === undefined ? `<dl class="mastery-targets">${practiceCoves.filter(cove => Object.hasOwn(masteryTargets, cove.id)).map(cove =>
    `<div><dt>${escapeLabel(cove.title)}</dt><dd>${masteryTargets[cove.id].target} actions</dd></div>`,
  ).join('')}</dl>` : '';
  return `<details class="mastery-criteria"><summary aria-label="${escapeLabel(title && target !== undefined ? `${title} · ${heading}` : heading)}">${escapeLabel(heading)}</summary><ol><li>Bring everyone home.</li><li>${efficiency}</li><li>Meet that target without using Undo.</li></ol><p>Each lantern includes the ones before it. Undo is always available. Only successful Undos count, and restarting begins a fresh attempt.</p>${targets}</details>`;
}
