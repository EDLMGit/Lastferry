import { describe, expect, test } from 'vitest';
import { harborLogMarkup } from '../../src/campaign/harbor-log';
import { acceptCove, acknowledgeScene, newJourney } from '../../src/campaign/progress';
import { MasteryStore, resultFor } from '../../src/game/mastery';

function storedBests(...coves: string[]) {
  const values = new Map<string, string>();
  const mastery = new MasteryStore(() => ({
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  }));
  for (const id of coves) mastery.accept(resultFor(id, 12, 0));
  return mastery;
}

describe('Harbor log revisit access', () => {
  test('a fresh log shows the next story destination without any launch buttons', () => {
    const markup = harborLogMarkup({ record: null, holdingRescued: false, mossEarned: false }, storedBests(), null);
    expect(markup).toContain('0 of 12 coves rescued');
    expect(markup).toContain('Holding Pier');
    expect(markup).not.toContain('data-practice=');
    expect(markup).not.toContain('First Crossing');
    expect(markup).not.toContain('Bellwater');
  });

  test('older keepsakes and bests stay visible while only the earned standalone crossing can launch', () => {
    const markup = harborLogMarkup({ record: newJourney(), holdingRescued: true, mossEarned: true },
      storedBests('first-crossing', 'holding-pier', 'orchard-landing'), null);
    expect(markup).toContain('0 of 12 coves rescued');
    expect(markup).toContain('Moss’s Own Crossing');
    expect(markup).toContain('Rue’s Lantern');
    expect(markup).toContain('data-saved-best="orchard-landing"');
    expect(markup).toContain('data-practice="first-crossing"');
    expect(markup.match(/ data-practice=/g)).toHaveLength(1);
    expect(markup).not.toContain('id="harbor-replay-holding"');
    expect(markup).not.toContain('id="harbor-take-request"');
  });

  test('a saved Holding rescue unlocks its revisit and request even without a lantern record', () => {
    const record = acceptCove(acknowledgeScene(newJourney(), 'opening'), 'holding-pier', 'won');
    const markup = harborLogMarkup({ record, holdingRescued: true, mossEarned: false }, storedBests(), null);
    expect(markup).toContain('1 of 12 coves rescued');
    expect(markup).toContain('id="harbor-take-request"');
    expect(markup).toContain('data-practice="holding-pier"');
    expect(markup).not.toContain('data-practice="bellwater"');
  });
});
