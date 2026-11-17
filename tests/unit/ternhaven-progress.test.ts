import { describe, expect, test } from 'vitest';
import {
  JourneyProgress, JOURNEY_STORAGE_KEY, JOURNEY_LEGACY_BACKUP_KEY, JOURNEY_ORCHARD_BACKUP_KEY,
  JOURNEY_TERNHAVEN_BACKUP_KEY, legacyContinuationScene, type JourneyRecord, type JourneyStorage,
} from '../../src/campaign/progress';
import { practiceCove, scenePredecessor, storyCove } from '../../src/campaign/registry';
import { MasteryStore, MASTERY_STORAGE_KEY } from '../../src/game/mastery';
import { initial, type Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { ternhaven, orchardLanding } from '../../src/levels/level';
import witnesses from '../../data/ternhaven/witnesses.json';

const seven: JourneyRecord = {
  version: 1,
  completed: ['holding-pier', 'bellwater', 'driftwood-yard', 'two-shelters', 'wide-berth', 'reef-return', 'orchard-landing'],
  acknowledgedScenes: ['opening', 'another-bell', 'driftwood-light', 'among-the-reeds', 'a-wider-deck', 'lights-beyond-the-reef', 'orchard-paths'],
  checkpoint: { kind: 'complete' },
};
const raw = '\r\n' + JSON.stringify(seven, null, 3) + '\t';
const pending: JourneyRecord = { ...seven, checkpoint: { kind: 'scene', id: 'ternhaven-wave' } };
const playing: JourneyRecord = { ...seven, checkpoint: { kind: 'cove', id: 'ternhaven' }, acknowledgedScenes: [...seven.acknowledgedScenes, 'ternhaven-wave'] };
const complete: JourneyRecord = { ...playing, checkpoint: { kind: 'complete' }, completed: [...seven.completed, 'ternhaven'] };

function backing(bytes = raw) {
  const values = new Map([[JOURNEY_STORAGE_KEY, bytes]]);
  const writes: [string, string][] = [];
  const storage: JourneyStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); writes.push([key, value]); },
  };
  return { values, writes, storage };
}

function act(session: Session, actions: readonly Action[]) {
  for (const action of actions) {
    expect(session.commit(action)).not.toBeNull();
    session.finish();
  }
}

describe('historical seven-cove endpoint', () => {
  test('only Continue advances; verifies and deduplicates byte-exact backups without replacing earlier families', () => {
    const { values, writes, storage } = backing();
    const backup = 'last-ferry.journey.v1.before-ternhaven';
    expect(JOURNEY_TERNHAVEN_BACKUP_KEY).toBe(backup);
    const previous = [
      [JOURNEY_LEGACY_BACKUP_KEY, 'two or four coves'],
      [JOURNEY_ORCHARD_BACKUP_KEY, 'six coves'],
      [backup, JSON.stringify(seven)], [backup + '.2', 'different old record'],
    ];
    for (const [key, value] of previous) values.set(key, value);
    const legacy = new JourneyProgress(() => storage);
    expect(legacy.snapshot).toMatchObject({ record: seven, persistent: true, raw });
    expect(legacy.acknowledge('ternhaven-wave')).toBe(false);
    expect(legacy.accept('ternhaven', 'won')).toBe(false);
    expect(writes).toEqual([]);
    expect(legacy.continueAvailableContent()).toBe(true);
    expect(writes.map(([key]) => key)).toEqual([backup + '.3', JOURNEY_STORAGE_KEY]);
    expect(writes[0][1]).toBe(raw);
    expect(JSON.parse(writes[1][1])).toEqual(pending);
    for (const [key, value] of previous) expect(values.get(key)).toBe(value);
    const reloaded = new JourneyProgress(() => storage);
    expect(reloaded.snapshot.record).toEqual(pending);
    expect(reloaded.continueAvailableContent()).toBe(false);
    expect(writes).toHaveLength(2);
    values.set(JOURNEY_STORAGE_KEY, raw);
    expect(new JourneyProgress(() => storage).continueAvailableContent()).toBe(true);
    expect(writes.slice(2)).toEqual([writes[1]]);
  });

  test.each(['before backup', 'during backup', 'silent backup', 'backup throws', 'silent primary', 'primary throws'])(
    '%s preserves primary bytes and offers an honest memory-only continuation', condition => {
      const { values, writes, storage } = backing();
      const newer = JSON.stringify(playing, null, 4);
      const progress = new JourneyProgress(() => ({
        getItem: storage.getItem,
        setItem(key, value) {
          const part = key === JOURNEY_TERNHAVEN_BACKUP_KEY ? 'backup' : 'primary';
          if (condition === 'silent ' + part) return;
          if (condition === part + ' throws') throw new Error('Unavailable');
          storage.setItem(key, value);
          if (condition === 'during backup' && part === 'backup') values.set(JOURNEY_STORAGE_KEY, newer);
        },
      }));
      if (condition === 'before backup') values.set(JOURNEY_STORAGE_KEY, newer);
      expect(progress.continueAvailableContent()).toBe(true);
      expect(progress.snapshot).toMatchObject({ record: pending, persistent: false });
      expect(progress.snapshot.issue).toContain('will not survive closing');
      expect(progress.acknowledge('ternhaven-wave')).toBe(true);
      expect(progress.accept('ternhaven', 'won')).toBe(true);
      expect(progress.snapshot.record).toEqual(complete);
      expect(writes.some(([key]) => key === JOURNEY_STORAGE_KEY)).toBe(false);
      expect(values.get(JOURNEY_STORAGE_KEY)).toBe(condition === 'before backup' || condition === 'during backup' ? newer : raw);
    },
  );

  test.each([
    { ...seven, checkpoint: { kind: 'complete', id: 'orchard-landing' } },
    { ...seven, completed: [...seven.completed].reverse() },
    { ...seven, acknowledgedScenes: [...seven.acknowledgedScenes].reverse() },
    { ...seven, completed: [...seven.completed.slice(0, -1), 'ternhaven'] },
    { ...seven, acknowledgedScenes: [...seven.acknowledgedScenes, 'ternhaven-wave'] },
    { ...seven, completed: [...seven.completed, 'future-cove'] },
    { ...seven, version: 2 }, { ...seven, accepted: true },
  ])('inconsistent or future endpoint is neither rewritten nor offered as a continuation: %j', spoof => {
    const original = JSON.stringify(spoof);
    const { values, writes, storage } = backing(original);
    expect(legacyContinuationScene(spoof)).toBeNull();
    const progress = new JourneyProgress(() => storage);
    expect(progress.snapshot.kind).toBe('invalid');
    expect(progress.continueAvailableContent()).toBe(false);
    expect(writes).toEqual([]);
    expect(values.get(JOURNEY_STORAGE_KEY)).toBe(original);
  });

  test('Practice best cannot grant progress; a one-lantern Journey rescue can finish exactly once', () => {
    const { storage, values } = backing();
    const bestStore = new MasteryStore(() => storage);
    const practice = new Session(practiceCove('ternhaven')!);
    act(practice, witnesses.witnesses[2].actions as Action[]);
    const best = practice.takeResult();
    expect(best).toMatchObject({ actions: 13, revision: 1, lanterns: 3 });
    expect(bestStore.accept(best)).toBe(true);
    const bestBytes = values.get(MASTERY_STORAGE_KEY);
    const journey = new JourneyProgress(() => storage);
    expect(values.get(JOURNEY_STORAGE_KEY)).toBe(raw);
    expect(journey.continueAvailableContent()).toBe(true);
    expect(journey.snapshot.record).toEqual(pending);
    expect(scenePredecessor('ternhaven-wave')).toBe(orchardLanding);
    expect(journey.accept('ternhaven', 'won')).toBe(false);
    expect(journey.acknowledge('ternhaven-wave')).toBe(true);
    expect(journey.snapshot.record).toEqual(playing);
    const session = new Session(storyCove('ternhaven')!.level);
    expect(session.state).toEqual(initial(ternhaven));
    expect(session.history).toEqual([]);
    expect(session.successfulUndos).toBe(0);
    expect(session.result).toBeNull();
    const plan = witnesses.witnesses[0].actions as Action[];
    act(session, [...plan.slice(0, -1), { type: 'wait' }, plan.at(-1)!]);
    expect(session.result).toMatchObject({ actions: 15, lanterns: 1 });
    expect(journey.snapshot.record).toEqual(playing);
    expect(session.undo()).toBe(true);
    expect(journey.accept('ternhaven', session.state.status)).toBe(false);
    act(session, plan.slice(-1));
    expect(journey.accept('ternhaven', session.state.status)).toBe(true);
    expect(bestStore.accept(session.takeResult())).toBe(false);
    expect(journey.accept('ternhaven', 'won')).toBe(false);
    expect(new JourneyProgress(() => storage).snapshot.record).toEqual(complete);
    expect(new MasteryStore(() => storage).best('ternhaven')).toEqual(best);
    expect(values.get(MASTERY_STORAGE_KEY)).toBe(bestBytes);
    expect(values.get(JOURNEY_TERNHAVEN_BACKUP_KEY)).toBe(raw);
  });
});
