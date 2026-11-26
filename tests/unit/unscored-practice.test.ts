import { describe, expect, test, vi } from 'vitest';
import holdingWitness from '../../data/experiments/holding-pier-solution.json';
import { holdingPier } from '../../src/levels/level';
import { type Action, initial } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { MasteryStore, MASTERY_STORAGE_KEY, masteryTargets, resultFor } from '../../src/game/mastery';
import { masteryBadgeMarkup, masteryCriteriaMarkup } from '../../src/ui/lanterns';

vi.mock('../../src/campaign/registry', async importOriginal => {
  const registry = await importOriginal<typeof import('../../src/campaign/registry')>();
  return {
    ...registry,
    practiceCoves: [...registry.practiceCoves, {
      ...registry.practiceCoves[0], id: 'unscored-fixture', title: 'Unscored Fixture',
    }],
  };
});

const candidate = { ...holdingPier, id: 'unscored-fixture' };
const actions = holdingWitness.actions as Action[];

function play(session: Session, sequence = actions) {
  for (const action of sequence) {
    expect(session.commit(action)).not.toBeNull();
    session.finish();
  }
}

describe('unscored Practice compatibility', () => {
  test('the shared target table lists only accepted coves and keeps Orchard target 13', () => {
    const markup = masteryCriteriaMarkup();
    expect(markup.match(/<dt>/g)).toHaveLength(9);
    expect(markup).not.toContain('Unscored Fixture');
    expect(markup).toContain('<dt>Ternhaven</dt><dd>14 actions</dd>');
    expect(markup).not.toContain('undefined');
    expect(markup).toContain('<dt>Orchard Landing</dt><dd>13 actions</dd>');
    expect(masteryTargets['orchard-landing']).toEqual({ target: 13, revision: 1 });
  });

  test('an unscored crossing shows its story rescue status', () => {
    const markup = masteryBadgeMarkup(null, false, false);
    expect(markup).toContain('Story crossing · no lantern rating');
    expect(masteryBadgeMarkup(null, true, false)).toContain('Rescued · no lantern rating');
    expect(markup).not.toContain('<svg');
    expect(markup).not.toContain('Not yet rated');
    expect(masteryBadgeMarkup(null)).toContain('Not yet rated');
    expect(masteryBadgeMarkup(null, true)).toContain('Rescued · not yet rated');
  });

  test('a real unscored win, terminal Undo and redelivery preserve unrestricted attempt behavior', () => {
    const session = new Session(candidate);
    play(session, actions.slice(0, -1));
    const beforeDelivery = structuredClone(session.state);
    play(session, actions.slice(-1));
    expect(session.state.status).toBe('won');
    expect(session.state.turn).toBe(9);
    expect(session.result).toBeNull();
    expect(session.takeResult()).toBeNull();
    expect(session.undo()).toBe(true);
    expect(session.state).toEqual(beforeDelivery);
    expect(session.successfulUndos).toBe(1);
    play(session, actions.slice(-1));
    expect(session.state.status).toBe('won');
    expect(session.result).toBeNull();
    expect(session.restart()).toBe(true);
    expect(session.state).toEqual(initial(candidate));
    expect(session.history).toEqual([]);
    expect(session.successfulUndos).toBe(0);
  });

  test('accepting no result never writes over a real existing Practice best or Journey data', () => {
    const best = resultFor('orchard-landing', 13, 0)!;
    const raw = '\n' + JSON.stringify({ version: 1, results: { 'orchard-landing@1': best } }, null, 2);
    const values = new Map([[MASTERY_STORAGE_KEY, raw], ['last-ferry.journey.v1', 'separate untouched save bytes']]);
    const writes: string[] = [];
    const mastery = new MasteryStore(() => ({
      getItem: key => values.get(key) ?? null,
      setItem(key, value) { writes.push(key); values.set(key, value); },
    }));
    const session = new Session(candidate);
    play(session);
    expect(mastery.accept(session.takeResult())).toBe(false);
    expect(mastery.accept(resultFor(candidate.id, session.state.turn, 0))).toBe(false);
    expect(mastery.best(candidate.id)).toBeNull();
    expect(mastery.best('orchard-landing')).toEqual(best);
    expect(values.get(MASTERY_STORAGE_KEY)).toBe(raw);
    expect(values.get('last-ferry.journey.v1')).toBe('separate untouched save bytes');
    expect(writes).toEqual([]);
  });
});
