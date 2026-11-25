import { holdingPier, level as firstCrossing, type Level } from '../levels/level';
import { masteryTargets, type MasteryResult, type MasteryStore } from '../game/mastery';
import { MOSS_ENTRY_TITLE, MOSS_REQUEST } from '../game/moss-request';
import { controlContent, escapeLabel, portraitSources } from '../ui/cove-ui';
import { masteryBadgeMarkup } from '../ui/lanterns';
import { legacyContinuationScene, type JourneyRecord } from './progress';
import { canRevisit } from './revisit';
import { storyCoves, storyScenes } from './registry';
import { createCoveStoryPainter } from './story-painter';
import './harbor-log.css';

type HarborPage = {
  record: JourneyRecord | null;
  holdingRescued: boolean;
  mossEarned: boolean;
};

function picture(memory: 'lantern' | 'moss', description: string) {
  return `<canvas class="harbor-picture" data-memory="${memory}" width="440" height="210" role="img" aria-label="${description}"></canvas>`;
}

export function lanternIllustrationMarkup() {
  return picture('lantern', 'Rue’s lantern glows beside Rue, Pip and Moss at the lighthouse landing.');
}

export function mossIllustrationMarkup() {
  return picture('moss', 'Moss rides the yellow ferry alone, the lighthouse shining ahead.');
}

export function paintHarborPictures(container: ParentNode) {
  for (const canvas of container.querySelectorAll<HTMLCanvasElement>('canvas.harbor-picture')) {
    const painter = createCoveStoryPainter(canvas);
    painter.resize(440, 210, Math.min(window.devicePixelRatio || 1, 2));
    painter.drawHarborMemory(canvas.dataset.memory === 'moss' ? 'moss' : 'lantern');
  }
}

function progressText(record: JourneyRecord | null) {
  return `${record?.completed.length ?? 0} of ${storyCoves.length} coves rescued`;
}

export function nextHarborDestination(record: JourneyRecord | null) {
  if (!record) return holdingPier.title;
  const scene = legacyContinuationScene(record) ??
    (record.checkpoint.kind === 'scene' ? record.checkpoint.id : null);
  if (scene) {
    const destination = storyScenes[scene].destination;
    return storyCoves.find(cove => cove.id === destination)?.level.title ?? storyScenes[scene].title;
  }
  const checkpoint = record.checkpoint;
  return checkpoint.kind === 'cove' ? storyCoves.find(cove => cove.id === checkpoint.id)?.level.title : null;
}

export function homeHarborCard(page: HarborPage, best: MasteryResult | null) {
  if (!page.holdingRescued && !page.mossEarned) return '';
  return `<button id="home-practice" class="home-harbor-card">
    ${page.mossEarned ? mossIllustrationMarkup() : lanternIllustrationMarkup()}
    <span class="home-harbor-copy">
      <span class="harbor-progress">${progressText(page.record)}</span>
      <strong>${page.mossEarned ? MOSS_ENTRY_TITLE : 'Rue’s Lantern'}</strong>
      <span>${page.holdingRescued ? 'Pip, Rue and Moss are home.' : 'Moss had a crossing of his own.'}</span>
      ${best ? `<span class="home-harbor-best">Holding Pier best · ${best.lanterns} ${best.lanterns === 1 ? 'lantern' : 'lanterns'}</span>` : ''}
      <span class="home-log-link">Open Harbor log <span aria-hidden="true">→</span></span>
    </span>
  </button>`;
}

function revisitRow(entry: Level, best: MasteryResult | null) {
  const scored = Object.hasOwn(masteryTargets, entry.id);
  return `<button class="cove-button cove-button--quiet practice-row" data-practice="${entry.id}" id="practice-${entry.id}">
    <span class="practice-title">Revisit · ${escapeLabel(entry.title)}</span>
    ${masteryBadgeMarkup(best, true, scored)}
  </button>`;
}

export function harborLogMarkup(page: HarborPage, mastery: MasteryStore, issue: string | null) {
  const completed = page.record?.completed ?? [];
  const best = mastery.best('holding-pier');
  const standaloneBest = mastery.best(firstCrossing.id);
  const mayRevisitHolding = canRevisit('holding-pier', page.record, !!standaloneBest);
  const destination = nextHarborDestination(page.record);
  const lanternPage = page.holdingRescued ? `<article class="harbor-entry" id="harbor-lantern-page">
    ${lanternIllustrationMarkup()}
    <div class="harbor-entry-copy"><h3>Rue’s Lantern</h3><p>Pip, Rue and Moss are home from Holding Pier.</p>
    ${best ? `<div class="harbor-entry-best">Best rescue ${masteryBadgeMarkup(best)}</div>` : ''}
    ${mayRevisitHolding ? `<button class="cove-button cove-button--quiet" id="harbor-replay-holding">${controlContent('replay', 'Revisit Holding Pier')}</button>` : ''}</div>
  </article>` : '';
  const requestPage = mayRevisitHolding || page.mossEarned ? `<article class="harbor-entry harbor-request" id="harbor-moss-page" data-earned="${page.mossEarned}">
    ${page.mossEarned ? mossIllustrationMarkup() : ''}
    <div class="harbor-entry-copy">
      ${page.mossEarned ? `<h3>${MOSS_ENTRY_TITLE}</h3>` : `<div class="harbor-author"><img src="${portraitSources['sheep-wool']}" alt="" width="50" height="50"><h3>Moss’s request</h3></div>`}
      <blockquote>“${MOSS_REQUEST}”</blockquote>
      ${mayRevisitHolding ? `<button class="cove-button ${page.mossEarned ? 'cove-button--quiet' : 'cove-button--warm'}" id="harbor-take-request">${controlContent('sail', page.mossEarned ? 'Revisit Moss’s request' : 'Take Moss’s request')}</button>` : ''}
    </div>
  </article>` : '';
  const notices = [mastery.issue, issue].filter(Boolean).map(text =>
    `<p class="mastery-notice" role="status">${escapeLabel(text!)}</p>`).join('');
  const revisits = storyCoves.filter(cove => completed.includes(cove.id));
  const olderBests = storyCoves.filter(cove => !completed.includes(cove.id)).flatMap(cove => {
    const saved = mastery.best(cove.id);
    return saved ? [`<li data-saved-best="${cove.id}"><span>${escapeLabel(cove.level.title)}</span>${masteryBadgeMarkup(saved)}</li>`] : [];
  });
  return `<header class="harbor-log-head"><div><h2 id="dialog-title" tabindex="-1">Harbor log</h2><p>${progressText(page.record)}${destination ? ` · Next stop · ${escapeLabel(destination)}` : ''}</p></div>
    <button id="journey-title" class="cove-button cove-button--quiet">${controlContent('harbor-home', 'Home')}</button></header>
    ${notices}
    ${lanternPage || requestPage ? `<div class="harbor-pages">${lanternPage}${requestPage}</div>` : '<p class="harbor-empty">Your first page awaits the rescue at Holding Pier.</p>'}
    ${revisits.length ? `<section class="harbor-practice" aria-label="Rescued Journey coves"><h3>Rescued coves</h3>
      <div class="harbor-crossings">${revisits.map(cove => revisitRow(cove.level, mastery.best(cove.id))).join('')}</div></section>` : ''}
    ${standaloneBest ? `<section class="harbor-practice" aria-label="Separate crossing"><h3>Separate crossing</h3>
      <div class="harbor-crossings">${revisitRow(firstCrossing, standaloneBest)}</div></section>` : ''}
    ${olderBests.length ? `<section class="harbor-practice"><h3>Earlier lantern bests</h3>
      <ul class="harbor-saved-bests">${olderBests.join('')}</ul></section>` : ''}`;
}
