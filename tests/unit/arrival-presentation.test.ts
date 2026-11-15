import { describe, expect, test } from 'vitest';
import plans from '../../data/ternhaven/witnesses.json';
import { practiceCoves, storyCoves } from '../../src/campaign/registry';
import { ternhaven, wideBerth, type Level, passengerName } from '../../src/levels/level';
import { initial, type Action, type State } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { resultFor, masteryTargets } from '../../src/game/mastery';
import { resolvePassengerAppearance } from '../../src/game/passenger-appearance';
import { arrivalMarkup, rescuedCast } from '../../src/ui/arrival';
import { arrivalLanternsMarkup, masteryBadgeMarkup } from '../../src/ui/lanterns';
import { iconMarkup } from '../../src/ui/cove-ui';

function fixture(level: Level): State {
  return { ...initial(level), status: 'won', turn: masteryTargets[level.id]?.target ?? 14,
    aboard: [], delivered: [...level.objective.requiredPassengerIds],
    waitingByPier: Object.fromEntries(level.piers.map(pier => [pier.id, []])) };
}

function render(level: Level, state = fixture(level)) {
  return arrivalMarkup({ level, state, result: resultFor(level.id, state.turn, 0), best: null,
    forward: { id: 'choose-cove', label: 'Choose a cove' } });
}

describe('arrival presentation from real level identities', () => {
  test.each(practiceCoves)('$id lists every required rescued name and original appearance', level => {
    const state = fixture(level);
    const before = structuredClone(state);
    const cast = rescuedCast(level, state);
    const markup = render(level, state);
    expect(cast.map(person => person.id)).toEqual(level.objective.requiredPassengerIds);
    expect(markup.match(/data-passenger-id=/g)).toHaveLength(level.objective.requiredPassengerIds.length);
    for (const person of cast) {
      expect(person.name).toBe(passengerName(person.id, level));
      expect(person.appearance).toEqual(resolvePassengerAppearance(level, person.id));
      expect(markup).toContain(`data-passenger-id="${person.id}"`);
      expect(markup).toContain(`data-appearance="${person.appearance?.portraitKey}"`);
      expect(markup).toContain(`>${person.name}</span>`);
    }
    expect(markup).not.toContain('aria-pressed');
    expect(markup).not.toContain('cove-choice-capacity');
    expect(state).toEqual(before);
  });

  test('matching Journey entries reuse the same level identities and the six-person showcase remains complete', () => {
    expect(storyCoves).toHaveLength(7);
    for (const entry of storyCoves) expect(practiceCoves).toContain(entry.level);
    const six = render(wideBerth);
    expect(six).toContain('data-cast-size="6"');
    expect(six.match(/class="arrival-name"/g)).toHaveLength(6);
    expect(render(ternhaven)).toContain('data-cast-size="4"');
    expect(render(practiceCoves[0])).toContain('data-cast-size="3"');
  });

  test('actual Ternhaven redelivery includes Sedge from the earlier trip and suppresses a partial delivery card', () => {
    const session = new Session(ternhaven);
    const actions = plans.witnesses[0].actions as Action[];
    for (const action of actions.slice(0, -1)) {
      expect(session.commit(action)).not.toBeNull();
      session.finish();
    }
    expect(session.state.delivered).toContain('sedge');
    expect(render(ternhaven, session.state)).toBe('');
    expect(rescuedCast(ternhaven, session.state)).toEqual([]);
    expect(session.commit(actions.at(-1)!)).not.toBeNull();
    session.finish();
    expect(session.state.status).toBe('won');
    expect(render(ternhaven, session.state)).toContain('data-passenger-id="sedge"');
    expect(rescuedCast(ternhaven, session.state)).toHaveLength(4);
    expect(session.undo()).toBe(true);
    expect(render(ternhaven, session.state)).toBe('');
    expect(session.commit(actions.at(-1)!)).not.toBeNull();
    session.finish();
    expect(rescuedCast(ternhaven, session.state)).toHaveLength(4);
    expect(session.result?.lanterns).toBe(2);
  });

  test.each([1, 2, 3] as const)('current %i-lantern crown remains separate from an accepted three-lantern best', count => {
    const state = fixture(ternhaven);
    const current = resultFor(ternhaven.id, count === 1 ? 15 : 14, count === 2 ? 1 : 0)!;
    const best = resultFor(ternhaven.id, 13, 0)!;
    const markup = arrivalMarkup({ level: ternhaven, state, result: current, best,
      forward: { id: 'choose-cove', label: 'Choose a cove' } });
    const crown = arrivalLanternsMarkup(current);
    expect(crown.match(/data-lit="true"/g)).toHaveLength(count);
    expect(crown).toContain(`aria-label="This rescue · ${count} of 3 lanterns"`);
    expect(markup).toContain('Best accepted rescue · 3 of 3 lanterns');
    expect(markup.match(/class="mastery-metrics"/g)).toHaveLength(1);
    expect(masteryBadgeMarkup(best)).not.toContain('arrival-lantern');
  });

  test('pending and unavailable portraits retain named stable slots without a selectable tile', () => {
    const ready = render(ternhaven);
    expect(ready.match(/data-portrait-state="pending"/g)).toHaveLength(4);
    expect(ready.match(/class="arrival-portrait-fallback"/g)).toHaveLength(4);
    const unknown = structuredClone(ternhaven);
    unknown.passengers[0].species = 'future-neighbor';
    unknown.passengers[0].appearance = 'unavailable';
    const markup = render(unknown);
    expect(markup).toContain('data-appearance="unavailable"');
    expect(markup).toContain(`>${passengerName(unknown.passengers[0].id, unknown)}</span>`);
    expect(markup).toContain('>future-neighbor</span>');
    expect(markup.match(/data-portrait-state="pending"/g)).toHaveLength(3);
  });

  test('generic unscored rescue and explicit storage failure stay honest', () => {
    const level = { ...ternhaven, id: 'unscored-arrival' };
    const markup = arrivalMarkup({ level, state: fixture(level), result: null, best: null,
      forward: { id: 'choose-cove', label: 'Choose a cove' }, notice: 'Storage is unavailable.' });
    expect(markup).toContain('Rescued · no lantern rating');
    expect(markup).not.toContain('class="arrival-lantern"');
    expect(markup).not.toContain('keeps this result');
    expect(markup).toContain('class="arrival-storage-notice" role="status">Storage is unavailable.');
  });

  test('Replay uses a distinct original decorative icon inside a semantic named action', () => {
    expect(iconMarkup('replay')).not.toBe(iconMarkup('undo'));
    expect(iconMarkup('replay')).toContain('focusable="false"');
    expect(render(ternhaven)).toContain('aria-label="Replay crossing"');
    expect(render(ternhaven)).toContain('data-icon="replay"');
    expect(render(ternhaven)).toContain('aria-label="Undo last action"');
  });
});
