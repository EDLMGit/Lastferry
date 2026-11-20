import { describe, expect, test } from 'vitest';
import {
  JourneyProgress, JOURNEY_STORAGE_KEY, JOURNEY_LEGACY_BACKUP_KEY, JOURNEY_ORCHARD_BACKUP_KEY,
  acknowledgeScene, acceptCove, checkpointCove, legacyContinuationScene, parseJourney,
  type JourneyRecord, type JourneyStorage,
} from '../../src/campaign/progress';
import { scenePredecessor } from '../../src/campaign/registry';
import { MasteryStore, MASTERY_STORAGE_KEY, masteryTargets } from '../../src/game/mastery';
import { Session } from '../../src/game/session';
import { initial, type Action } from '../../src/game/rules';
import { orchardLanding, reefReturn } from '../../src/levels/level';
import orchardWitnesses from '../../data/orchard-landing/witnesses.json';

const six: JourneyRecord = {
  version: 1,
  checkpoint: { kind: 'complete' },
  completed: ['holding-pier', 'bellwater', 'driftwood-yard', 'two-shelters', 'wide-berth', 'reef-return'],
  acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light', 'among-the-reeds', 'a-wider-deck', 'lights-beyond-the-reef'],
};
const pending: JourneyRecord = { ...six, checkpoint: { kind: 'scene', id: 'orchard-paths' } };
const active = (): JourneyRecord => acknowledgeScene(pending, 'orchard-paths');
const rawSix = '\n' + JSON.stringify(six, null, 2) + '\n';

function memory(raw = rawSix) {
  const values = new Map([[JOURNEY_STORAGE_KEY, raw]]);
  const writes: [string, string][] = [];
  const storage: JourneyStorage = {
    getItem: key => values.get(key) ?? null,
    setItem(key, value) {
      values.set(key, value);
      writes.push([key, value]);
    },
  };
  return { values, writes, storage };
}

function rescue(index: number) {
  const session = new Session(orchardLanding);
  for (const action of orchardWitnesses.witnesses[index].actions as Action[]) {
    expect(session.commit(action)).not.toBeNull();
    session.finish();
  }
  expect(session.state.status).toBe('won');
  return session;
}

describe('exact completed-six continuation into Orchard', () => {
  test('read preserves original bytes and earned rescues until one explicit continuation', () => {
    const backing = memory();
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.snapshot).toMatchObject({ kind: 'valid', raw: rawSix, record: six, persistent: true });
    expect(legacyContinuationScene(six)).toBe('orchard-paths');
    expect(checkpointCove(six)).toBe('reef-return');
    expect(scenePredecessor('orchard-paths')).toBe(reefReturn);
    expect(progress.acknowledge('orchard-paths')).toBe(false);
    expect(progress.accept('orchard-landing', 'won')).toBe(false);
    expect(backing.writes).toEqual([]);
    expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(rawSix);
    expect(progress.continueAvailableContent()).toBe(true);
    expect(progress.snapshot.record).toEqual(pending);
    expect(progress.continueAvailableContent()).toBe(false);
    expect(backing.writes).toEqual([
      [JOURNEY_ORCHARD_BACKUP_KEY, rawSix],
      [JOURNEY_STORAGE_KEY, JSON.stringify(pending)],
    ]);
    const resumed = new JourneyProgress(() => backing.storage);
    expect(resumed.snapshot.record).toEqual(pending);
    expect(resumed.continueAvailableContent()).toBe(false);
    expect(resumed.acknowledge('orchard-paths')).toBe(true);
    expect(resumed.acknowledge('orchard-paths')).toBe(false);
    expect(resumed.snapshot.record).toEqual(active());
    expect(backing.values.get(JOURNEY_ORCHARD_BACKUP_KEY)).toBe(rawSix);
    const session = new Session(orchardLanding);
    expect(session.state).toEqual(initial(orchardLanding));
    expect(session.state.turn).toBe(0);
    expect(session.history).toEqual([]);
    expect(session.successfulUndos).toBe(0);
    expect(session.result).toBeNull();
  });

  test('earlier valid boundaries remain in place without a backup or conversion write', () => {
    const boundaries: JourneyRecord[] = [
      { version: 1, checkpoint: { kind: 'scene', id: 'opening' }, completed: [], acknowledgedScenes: [] },
      { version: 1, checkpoint: { kind: 'cove', id: 'holding-pier' }, completed: [], acknowledgedScenes: ['opening'] },
      { ...six, checkpoint: { kind: 'cove', id: 'reef-return' }, completed: six.completed.slice(0, -1) },
      pending, active(),
    ];
    for (const record of boundaries) {
      const raw = '\n' + JSON.stringify(record, null, 4) + '\n';
      const backing = memory(raw);
      const progress = new JourneyProgress(() => backing.storage);
      expect(progress.snapshot.record).toEqual(record);
      expect(progress.continueAvailableContent()).toBe(false);
      expect(backing.writes).toEqual([]);
      expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(raw);
    }
  });

  test('existing backup slots and earlier migrations are never overwritten', () => {
    const backing = memory();
    backing.values.set(JOURNEY_LEGACY_BACKUP_KEY, 'original two-cove bytes');
    backing.values.set(JOURNEY_LEGACY_BACKUP_KEY + '.2', 'original four-cove bytes');
    backing.values.set(JOURNEY_ORCHARD_BACKUP_KEY, 'different six-cove bytes');
    backing.values.set(JOURNEY_ORCHARD_BACKUP_KEY + '.2', 'another different backup');
    const previous = new Map(backing.values);
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.continueAvailableContent()).toBe(true);
    expect(backing.values.get(JOURNEY_ORCHARD_BACKUP_KEY + '.3')).toBe(rawSix);
    for (const [key, value] of previous) {
      if (key !== JOURNEY_STORAGE_KEY) expect(backing.values.get(key)).toBe(value);
    }
    backing.values.set(JOURNEY_STORAGE_KEY, rawSix);
    backing.writes.length = 0;
    const again = new JourneyProgress(() => backing.storage);
    expect(again.continueAvailableContent()).toBe(true);
    expect(backing.writes).toEqual([[JOURNEY_STORAGE_KEY, JSON.stringify(pending)]]);
  });

  test.each(['backup throws', 'backup silent', 'primary throws', 'primary silent'])(
    '%s keeps old bytes and a playable in-memory continuation', failure => {
      const backing = memory();
      const progress = new JourneyProgress(() => ({
        getItem: backing.storage.getItem,
        setItem(key, value) {
          const failedKey = failure.startsWith('backup') ? JOURNEY_ORCHARD_BACKUP_KEY : JOURNEY_STORAGE_KEY;
          if (key === failedKey) {
            if (failure.endsWith('throws')) throw new Error('Unavailable');
            return;
          }
          backing.storage.setItem(key, value);
        },
      }));
      expect(progress.continueAvailableContent()).toBe(true);
      expect(progress.snapshot).toMatchObject({ record: pending, persistent: false });
      expect(progress.snapshot.issue).toContain('will not survive closing');
      expect(progress.acknowledge('orchard-paths')).toBe(true);
      expect(progress.accept('orchard-landing', 'won')).toBe(true);
      expect(progress.snapshot.record?.checkpoint).toEqual({ kind: 'scene', id: 'ternhaven-wave' });
      expect(progress.snapshot.record?.completed).toEqual([...six.completed, 'orchard-landing']);
      expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(rawSix);
    },
  );

  test.each(['before', 'during'])('a newer live checkpoint appearing %s backup is retained', when => {
    const backing = memory();
    const newer = JSON.stringify(active(), null, 2);
    const progress = new JourneyProgress(() => ({
      getItem: backing.storage.getItem,
      setItem(key, value) {
        backing.storage.setItem(key, value);
        if (key === JOURNEY_ORCHARD_BACKUP_KEY && when === 'during')
          backing.values.set(JOURNEY_STORAGE_KEY, newer);
      },
    }));
    if (when === 'before') backing.values.set(JOURNEY_STORAGE_KEY, newer);
    expect(progress.continueAvailableContent()).toBe(true);
    expect(progress.snapshot).toMatchObject({ record: pending, persistent: false });
    expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(newer);
    expect(backing.writes).toEqual(when === 'before' ? [] : [[JOURNEY_ORCHARD_BACKUP_KEY, rawSix]]);
    expect(progress.acknowledge('orchard-paths')).toBe(true);
    expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(newer);
  });

  test.each([
    { ...six, completed: six.completed.slice(0, -1), acknowledgedScenes: six.acknowledgedScenes.slice(0, -1) },
    { ...six, completed: [...six.completed.slice(0, -1), 'orchard-landing'] },
    { ...six, acknowledgedScenes: [...six.acknowledgedScenes.slice(0, -1), 'orchard-paths'] },
    { ...six, completed: [...six.completed].reverse() },
    { ...six, acknowledgedScenes: [...six.acknowledgedScenes].reverse() },
    { ...six, acknowledgedScenes: [...six.acknowledgedScenes, 'orchard-paths'] },
    { ...six, completed: [...six.completed, 'orchard-landing'] },
    { ...six, completed: [...six.completed, 'future-cove'] },
    { ...six, checkpoint: { kind: 'complete', id: 'reef-return' } },
    { ...six, extra: true },
    { ...six, version: 2 },
  ])('malformed and invented completion cannot trigger conversion: %j', record => {
    const raw = JSON.stringify(record);
    const backing = memory(raw);
    const progress = new JourneyProgress(() => backing.storage);
    expect(parseJourney(raw).valid).toBe(false);
    expect(legacyContinuationScene(record)).toBeNull();
    expect(progress.snapshot.kind).toBe('invalid');
    expect(progress.continueAvailableContent()).toBe(false);
    expect(backing.writes).toEqual([]);
    expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(raw);
  });

  test('accepted Practice mastery survives extension and worse replay without granting completion', () => {
    const backing = memory();
    const mastery = new MasteryStore(() => backing.storage);
    const best = rescue(1).takeResult();
    expect(best).toMatchObject({ coveId: 'orchard-landing', actions: 13, lanterns: 3, revision: 1 });
    expect(masteryTargets['orchard-landing']).toEqual({ target: 13, revision: 1 });
    expect(mastery.accept(best)).toBe(true);
    const masteryBytes = backing.values.get(MASTERY_STORAGE_KEY);
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.snapshot.record).toEqual(six);
    expect(progress.continueAvailableContent()).toBe(true);
    expect(progress.snapshot.record).toEqual(pending);
    expect(progress.snapshot.record?.completed).not.toContain('orchard-landing');
    expect(backing.values.get(MASTERY_STORAGE_KEY)).toBe(masteryBytes);
    const restored = new JourneyProgress(() => backing.storage);
    expect(restored.acknowledge('orchard-paths')).toBe(true);
    const session = rescue(0);
    expect(session.result).toMatchObject({ actions: 12, lanterns: 3 });
    expect(restored.snapshot.record).toEqual(active());
    expect(session.undo()).toBe(true);
    expect(session.result).toBeNull();
    expect(restored.accept('orchard-landing', session.state.status)).toBe(false);
    expect(session.commit(orchardWitnesses.witnesses[0].actions.at(-1)! as Action)).not.toBeNull();
    session.finish();
    expect(session.result).toMatchObject({ actions: 12, successfulUndos: 1, lanterns: 2 });
    expect(restored.accept('orchard-landing', session.state.status)).toBe(true);
    expect(mastery.accept(session.takeResult())).toBe(false);
    expect(restored.accept('orchard-landing', 'won')).toBe(false);
    expect(restored.snapshot.record?.checkpoint).toEqual({ kind: 'scene', id: 'ternhaven-wave' });
    expect(restored.snapshot.record?.completed).toEqual([...six.completed, 'orchard-landing']);
    expect(restored.snapshot.record?.acknowledgedScenes).toEqual([...six.acknowledgedScenes, 'orchard-paths']);
    expect(new JourneyProgress(() => backing.storage).snapshot.record).toEqual(restored.snapshot.record);
    expect(new MasteryStore(() => backing.storage).best('orchard-landing')).toEqual(best);
    expect(backing.values.get(MASTERY_STORAGE_KEY)).toBe(masteryBytes);
    expect(backing.values.get(JOURNEY_ORCHARD_BACKUP_KEY)).toBe(rawSix);
  });

  test('fresh Reef acceptance produces pending Orchard without a legacy migration or score write', () => {
    const atReef: JourneyRecord = {
      ...six, checkpoint: { kind: 'cove', id: 'reef-return' }, completed: six.completed.slice(0, -1),
    };
    const backing = memory(JSON.stringify(atReef));
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.continueAvailableContent()).toBe(false);
    expect(progress.accept('reef-return', 'playing')).toBe(false);
    expect(progress.accept('reef-return', 'won')).toBe(true);
    expect(progress.snapshot.record).toEqual(pending);
    expect(progress.continueAvailableContent()).toBe(false);
    expect(backing.writes).toEqual([[JOURNEY_STORAGE_KEY, JSON.stringify(pending)]]);
    expect(backing.values.get(MASTERY_STORAGE_KEY)).toBeUndefined();
    expect(acceptCove(pending, 'orchard-landing', 'won')).toBe(pending);
  });
});
