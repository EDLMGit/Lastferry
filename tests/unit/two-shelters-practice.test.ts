import { describe, expect, test } from 'vitest';
import {
  JourneyProgress,
  JOURNEY_STORAGE_KEY,
  parseJourney,
  validateJourney,
  type JourneyRecord,
  type JourneyStorage,
} from '../../src/campaign/progress';
import {
  practiceCove,
  practiceCoves,
  storyCove,
  storyCoves,
  storyScenes,
  type CoveId,
} from '../../src/campaign/registry';
import { reefReturn, twoShelters } from '../../src/levels/level';

const completed = ['holding-pier', 'bellwater', 'driftwood-yard'] as const;
const acknowledged = ['opening', 'another-bell', 'driftwood-light'] as const;
const records: Record<string, JourneyRecord> = {
  pendingLaunch: {
    version: 1,
    checkpoint: { kind: 'scene', id: 'a-wider-deck' },
    completed: [...completed],
    acknowledgedScenes: [...acknowledged],
  },
  activeWide: {
    version: 1,
    checkpoint: { kind: 'cove', id: 'wide-berth' },
    completed: [...completed],
    acknowledgedScenes: [...acknowledged, 'a-wider-deck'],
  },
  completedFour: {
    version: 1,
    checkpoint: { kind: 'complete' },
    completed: [...completed, 'wide-berth'],
    acknowledgedScenes: [...acknowledged, 'a-wider-deck'],
  },
};

describe.each([twoShelters, reefReturn])('$title independent Practice boundary', (candidate) => {
  test('the candidate is playable without acquiring a campaign slot or launch', () => {
    expect(practiceCove(candidate.id)).toBe(candidate);
    expect(practiceCoves.filter((entry) => entry.id === candidate.id)).toHaveLength(1);
    expect(storyCove(candidate.id)).toBeUndefined();
    expect(storyCoves.map(({ id, entryScene }) => [id, entryScene])).toEqual([
      ['holding-pier', 'opening'],
      ['bellwater', 'another-bell'],
      ['driftwood-yard', 'driftwood-light'],
      ['wide-berth', 'a-wider-deck'],
    ]);
    expect(storyScenes['a-wider-deck'].destination).toBe('wide-berth');
    expect(twoShelters.rules.capacity).toBe(4);
    expect(reefReturn.rules.capacity).toBe(6);
  });

  test.each(Object.entries(records))(
    '%s is read without rewriting bytes or accepting Practice',
    (_, record) => {
      const raw = `\n${JSON.stringify(record, null, 2)}\n`;
      let stored: string | null = raw;
      const writes: [string, string][] = [];
      const storage: JourneyStorage = {
        getItem: (key) => (key === JOURNEY_STORAGE_KEY ? stored : null),
        setItem: (key, value) => {
          writes.push([key, value]);
          stored = value;
        },
      };
      const progress = new JourneyProgress(() => storage);
      expect(progress.snapshot).toMatchObject({ kind: 'valid', raw, record });
      expect(progress.accept(candidate.id as CoveId, 'won')).toBe(false);
      expect(progress.snapshot).toMatchObject({ kind: 'valid', raw, record });
      expect(writes).toEqual([]);
      expect(stored).toBe(raw);
      expect(new JourneyProgress(() => storage).snapshot.raw).toBe(raw);
    },
  );

  test('a Practice checkpoint or fabricated replacement completion is still rejected', () => {
    expect(
      validateJourney({
        ...records.activeWide,
        checkpoint: { kind: 'cove', id: candidate.id },
      }).valid,
    ).toBe(false);
    expect(
      parseJourney(
        JSON.stringify({
          ...records.completedFour,
          completed: [...completed, candidate.id],
        }),
      ).valid,
    ).toBe(false);
    expect(validateJourney(records.pendingLaunch)).toEqual({
      valid: true,
      record: records.pendingLaunch,
    });
    expect(validateJourney(records.activeWide)).toEqual({
      valid: true,
      record: records.activeWide,
    });
    expect(validateJourney(records.completedFour)).toEqual({
      valid: true,
      record: records.completedFour,
    });
  });
});
