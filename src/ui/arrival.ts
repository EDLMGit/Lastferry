import type { Level } from '../levels/level';
import { passengerName } from '../levels/level';
import type { State } from '../game/rules';
import type { MasteryResult } from '../game/mastery';
import { masteryTargets } from '../game/mastery';
import { resolvePassengerAppearance } from '../game/passenger-appearance';
import { arrivalFigureSources, controlContent, escapeLabel, iconMarkup, portraitSources } from './cove-ui';
import { arrivalLanternsMarkup } from './lanterns';
import { MOSS_ENTRY_TITLE, MOSS_REQUEST } from '../game/moss-request';
import { lanternIllustrationMarkup, mossIllustrationMarkup } from '../campaign/harbor-log';
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
  offerRequest?: boolean;
  keepsake?: 'rue' | 'moss';
  requestMissed?: boolean;
};

export function rescuedCast(level: Level, state: State) {
  if (state.status !== 'won') return [];
  return level.objective.requiredPassengerIds.filter(id => state.delivered.includes(id)).map(id => ({
    id,
    name: passengerName(id, level),
    appearance: resolvePassengerAppearance(level, id),
  }));
}

function castFigures(cast: ReturnType<typeof rescuedCast>) {
  return `<ul id="arrival-cast" class="arrival-cast" aria-label="Rescued neighbors">${cast.map(({ id, name, appearance }) => {
    const portrait = appearance?.portraitKey ?? null;
    return `<li data-passenger-id="${escapeLabel(id)}" data-appearance="${portrait ?? 'unavailable'}"><span class="arrival-portrait"><span class="arrival-portrait-fallback" aria-hidden="true">${escapeLabel(appearance?.species ?? 'neighbor')}</span>${portrait ? `<img class="cove-portrait-image" src="${escapeLabel(arrivalFigureSources[portrait])}" alt="" width="256" height="256" draggable="false" decoding="async" data-portrait-state="pending">` : ''}</span><span class="arrival-name">${escapeLabel(name)}</span></li>`;
  }).join('')}</ul>`;
}

function rescueDetails(options: ArrivalOptions) {
  const { level, state, result, best, successfulUndos = 0, policy, keepsake } = options;
  const actions = result?.actions ?? state.turn;
  const undos = result?.successfulUndos ?? successfulUndos;
  const target = masteryTargets[level.id]?.target;
  return `<details id="arrival-details"><summary><span class="arrival-details-closed">Details</span><span class="arrival-details-open">Hide details</span></summary>
    <div class="arrival-detail-body" tabindex="0" aria-label="Rescue details">
      <h3>${escapeLabel(level.title)}</h3>
      <section ${result ? 'id="mastery-result"' : ''} class="arrival-result" data-lanterns="${result?.lanterns ?? 0}" data-actions="${actions}" data-undos="${undos}" aria-label="This rescue">
        ${result ? '' : '<p>Rescued · no lantern rating</p>'}<p class="mastery-metrics">${actions} actions · ${undos} ${undos === 1 ? 'Undo' : 'Undos'}</p>
      </section>
      ${best ? `<p id="mastery-best">Best accepted rescue · ${best.lanterns} of 3 lanterns<br>${best.actions} actions · ${best.successfulUndos} ${best.successfulUndos === 1 ? 'Undo' : 'Undos'}</p>` : ''}
      ${target !== undefined ? `<p>One lantern for bringing everyone home, two for finishing in ${target} actions or fewer, and three for meeting that target without Undo.</p>` : ''}
      ${keepsake === 'moss' ? '<p>Pip and Rue were safe at Harbor while Moss waited at Stone Pier.</p>' : ''}
      ${policy ? `<p>${escapeLabel(policy)}</p>` : ''}
      <div class="arrival-more-actions">
        <button id="accept-harbor-home" class="cove-button cove-button--quiet">${controlContent('harbor-home', 'Home')}</button>
        <button id="terminal-restart" class="cove-button cove-button--quiet" aria-label="Replay crossing">${controlContent('replay', 'Replay')}</button>
        <button id="terminal-settings" class="cove-button cove-button--quiet" aria-label="Settings">${controlContent('settings', 'Settings')}</button>
      </div>
    </div></details>`;
}

function mossInvitation(showLevelName: boolean) {
  const replay = showLevelName ? 'Replay Holding Pier for Moss' : 'Replay for Moss';
  return `<section class="arrival-invitation" aria-labelledby="arrival-speaker">
    <img class="arrival-speaker-portrait" src="${escapeLabel(portraitSources['sheep-wool'])}" alt="" width="56" height="56" draggable="false">
    <div class="arrival-invitation-copy"><strong id="arrival-speaker">Moss</strong><p id="arrival-request-line">“${escapeLabel(MOSS_REQUEST)}”</p></div>
    <div class="arrival-invitation-action"><button id="take-moss-request" class="cove-button cove-button--quiet" aria-describedby="arrival-request-line arrival-page-reward">${controlContent('replay', replay)}</button>
      <span class="arrival-page-reward" id="arrival-page-reward"><span class="arrival-page-icon" aria-hidden="true"></span>Earn a Harbor log page</span></div>
  </section>`;
}

export function arrivalMarkup(options: ArrivalOptions) {
  const { level, state, result, forward, notice, keepsake, offerRequest, requestMissed } = options;
  const cast = rescuedCast(level, state);
  if (!cast.length || cast.length !== level.objective.requiredPassengerIds.length) return '';
  const title = keepsake === 'rue' ? 'Rue’s Lantern' : keepsake === 'moss' ? MOSS_ENTRY_TITLE : 'Everyone home.';
  const art = keepsake === 'moss' ? mossIllustrationMarkup() : keepsake === 'rue' ? lanternIllustrationMarkup() : '';
  return `<section id="arrival-content" class="arrival-content${keepsake ? ' arrival-with-keepsake' : ''}${offerRequest ? ' arrival-has-invitation' : ''}" data-keepsake="${keepsake ?? ''}" data-cast-size="${cast.length}" aria-labelledby="dialog-title">
    <button id="cancel" class="arrival-close cove-button cove-button--quiet cove-button--icon" aria-label="Close arrival">${controlContent('close', 'Close arrival')}</button>
    ${art ? `<div class="arrival-keepsake">${art}</div>` : castFigures(cast)}
    <div class="arrival-overview">
      ${!keepsake && result ? arrivalLanternsMarkup(result) : ''}
      <header class="arrival-heading"><h2 id="dialog-title">${title}</h2>${keepsake ? '' : `<p>${escapeLabel(level.title)}</p>`}</header>
      ${keepsake && result ? arrivalLanternsMarkup(result) : ''}
    </div>
    <div class="arrival-actions"><button id="${escapeLabel(forward.id)}" class="cove-button cove-button--warm">${controlContent(null, forward.label)}${iconMarkup('next-cove')}</button>
      ${requestMissed ? `<button id="retry-moss-request" aria-describedby="arrival-request-line">${controlContent(null, 'Try Moss’s request again')}</button>` : ''}</div>
    ${offerRequest ? mossInvitation(!!keepsake) : ''}
    ${requestMissed ? '<p id="arrival-request-line" class="arrival-retry-line">Moss needs to be at Stone Pier when each rabbit reaches Harbor.</p>' : ''}
    <footer class="arrival-utilities"><button id="terminal-undo" class="cove-button cove-button--quiet" aria-label="Undo last action">${controlContent('undo', 'Undo')}</button>
      ${rescueDetails(options)}</footer>
    ${notice ? `<p class="arrival-storage-notice" role="status">${escapeLabel(notice)}</p>` : ''}
  </section>`;
}
