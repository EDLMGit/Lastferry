import type { Level } from '../levels/level';
import { passengerName } from '../levels/level';
import type { State } from '../game/rules';
import type { MasteryResult } from '../game/mastery';
import { masteryTargets } from '../game/mastery';
import { resolvePassengerAppearance } from '../game/passenger-appearance';
import { arrivalFigureSources, controlContent, escapeLabel } from './cove-ui';
import { arrivalLanternsMarkup } from './lanterns';
import './arrival.css';

export type ArrivalOptions = {
  level: Level;
  state: State;
  result: MasteryResult | null;
  best: MasteryResult | null;
  successfulUndos?: number;
  forward: { id: string; label: string };
  policy?: string;
  notice?: string;
};

export function rescuedCast(level: Level, state: State) {
  if (state.status !== 'won') return [];
  return level.objective.requiredPassengerIds.filter(id => state.delivered.includes(id)).map(id => ({
    id,
    name: passengerName(id, level),
    appearance: resolvePassengerAppearance(level, id),
  }));
}

export function arrivalMarkup({ level, state, result, best, successfulUndos = 0, forward, policy = '', notice = '' }: ArrivalOptions) {
  const cast = rescuedCast(level, state);
  if (state.status !== 'won' || cast.length !== level.objective.requiredPassengerIds.length) return '';
  const metrics = result ?? { actions: state.turn, successfulUndos };
  const target = Object.hasOwn(masteryTargets, level.id) ? masteryTargets[level.id].target : null;
  const better = best && (!result || best.lanterns > result.lanterns ||
    (best.lanterns === result.lanterns && (best.actions < result.actions ||
      (best.actions === result.actions && best.successfulUndos < result.successfulUndos))));
  const criteria = target === null ? '<p>Playtest · no lantern rating.</p>' :
    `<ol><li>Bring everyone home.</li><li>Finish in ${target} actions or fewer.</li><li>Meet that target without a successful Undo.</li></ol><p>Lanterns are cumulative. Every rescue is complete; the others are optional replay goals. Undo is always available.</p>`;
  const previous = best ? `<p id="mastery-best">Best accepted rescue · ${best.lanterns} of 3 lanterns<br>${best.actions} actions · ${best.successfulUndos} ${best.successfulUndos === 1 ? 'Undo' : 'Undos'}</p>` : '<p>No accepted best yet.</p>';
  return `<section id="arrival-content" class="arrival-content" data-cast-size="${cast.length}" aria-labelledby="dialog-title">
    <button id="cancel" class="arrival-close cove-button cove-button--quiet cove-button--icon" aria-label="Close arrival">${controlContent('close', 'Close arrival')}</button>
    <div class="arrival-overview">
      ${arrivalLanternsMarkup(result)}
      <header class="arrival-heading"><h2 id="dialog-title">Everyone home.</h2><p>${escapeLabel(level.title)}</p></header>
    </div>
    <ul id="arrival-cast" class="arrival-cast" aria-label="Rescued neighbors">${cast.map(({ id, name, appearance }) => {
      const portrait = appearance?.portraitKey ?? null;
      return `<li data-passenger-id="${escapeLabel(id)}" data-appearance="${portrait ?? 'unavailable'}"><span class="arrival-portrait"><span class="arrival-portrait-fallback" aria-hidden="true">${escapeLabel(appearance?.species ?? 'neighbor')}</span>${portrait ? `<img class="cove-portrait-image" src="${escapeLabel(arrivalFigureSources[portrait])}" alt="" width="256" height="256" draggable="false" decoding="async" data-portrait-state="pending">` : ''}</span><span class="arrival-name">${escapeLabel(name)}</span></li>`;
    }).join('')}</ul>
    <section ${result ? 'id="mastery-result"' : ''} class="arrival-result" data-lanterns="${result?.lanterns ?? 0}" data-actions="${metrics.actions}" data-undos="${metrics.successfulUndos}" aria-label="This rescue">
      <p class="mastery-metrics">${metrics.actions} actions · ${metrics.successfulUndos} ${metrics.successfulUndos === 1 ? 'Undo' : 'Undos'}</p>
      ${better ? '<p class="arrival-best-note">Your better accepted best is kept.</p>' : ''}
    </section>
    <div class="arrival-actions"><button id="${escapeLabel(forward.id)}" class="cove-button cove-button--warm">${controlContent(forward.id === 'choose-cove' ? 'whole-cove' : 'next-cove', forward.label)}</button><button id="terminal-restart" class="cove-button" aria-label="Replay crossing">${controlContent('replay', 'Replay')}</button></div>
    <footer class="arrival-utilities"><button id="terminal-undo" class="cove-button cove-button--quiet" aria-label="Undo last action">${controlContent('undo', 'Undo')}</button><details id="arrival-details"><summary><span class="arrival-details-closed">Details</span><span class="arrival-details-open">Hide details</span></summary><div class="arrival-detail-body" tabindex="0" aria-label="Rescue details"><h3>About this rescue</h3>${criteria}${previous}${result ? '<p>Continuing, leaving or replaying keeps this result. Until then, Undo can change it. Closing this card or opening Settings keeps it provisional.</p>' : ''}${policy ? `<p>${escapeLabel(policy)}</p>` : ''}</div></details><button id="terminal-settings" class="cove-button cove-button--quiet cove-button--icon" aria-label="Settings">${controlContent('settings', 'Settings')}</button></footer>
    ${notice ? `<p class="arrival-storage-notice" role="status">${escapeLabel(notice)}</p>` : ''}
  </section>`;
}
