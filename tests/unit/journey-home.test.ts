import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  JOURNEY_STORAGE_KEY, JOURNEY_DROWNED_ORCHARD_BACKUP_KEY as backup,
  JourneyProgress, checkpointCove, legacyContinuationScene, parseJourney, validateJourney,
  type JourneyRecord, type JourneyStorage,
} from '../../src/campaign/progress';
import { scenePredecessor, storyCoves, supperScene } from '../../src/campaign/registry';
import { Session } from '../../src/game/session';
import { MasteryStore, MASTERY_STORAGE_KEY } from '../../src/game/mastery';
import { type Action } from '../../src/game/rules';

const archived = JSON.parse(readFileSync('reviews/ternhaven-journey/gameplay/390x844/route.json', 'utf8')).reloaded;
const eight: JourneyRecord = JSON.parse(archived.journey);
const original = '\r\n' + JSON.stringify(eight, null, 2) + '\t';
const pending = { ...eight, checkpoint: { kind: 'scene', id: 'orchard-underwater' } };
const earlierBackups = ['before-six-coves', 'before-orchard', 'before-ternhaven'].map(name => JOURNEY_STORAGE_KEY + '.' + name);

function fixture(raw: string = original) {
  const values = new Map<string, string>([[JOURNEY_STORAGE_KEY, raw], [MASTERY_STORAGE_KEY, archived.mastery]]);
  const writes: [string, string][] = [];
  const storage: JourneyStorage = {
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { values.set(key, value); writes.push([key, value]); },
  };
  return { values, storage, writes };
}

describe('safe continuation from the original Ternhaven endpoint', () => {
  test('only deliberate Continue copies the exact original bytes; occupied slots and earlier backups survive', () => {
    const { values, writes, storage } = fixture();
    for (const key of [...earlierBackups, backup, backup + '.2']) values.set(key, 'retained ' + key);
    const journey = new JourneyProgress(() => storage);
    expect(journey.snapshot).toMatchObject({ raw: original, record: eight });
    expect(checkpointCove(eight)).toBe('ternhaven');
    expect(legacyContinuationScene(eight)).toBe('orchard-underwater');
    expect(journey.acknowledge('orchard-underwater')).toBe(false);
    expect(journey.accept('drowned-orchard', 'won')).toBe(false);
    expect(writes).toEqual([]);
    expect(journey.continueAvailableContent()).toBe(true);
    expect(writes).toEqual([[backup + '.3', original], [JOURNEY_STORAGE_KEY, JSON.stringify(pending)]]);
    for (const key of [...earlierBackups, backup, backup + '.2']) expect(values.get(key)).toBe('retained ' + key);
    const restored = new JourneyProgress(() => storage);
    expect(restored.snapshot.record).toEqual(pending);
    expect(restored.continueAvailableContent()).toBe(false);
    values.set(JOURNEY_STORAGE_KEY, original);
    expect(new JourneyProgress(() => storage).continueAvailableContent()).toBe(true);
    expect(writes.slice(2)).toEqual([writes[1]]);
  });

  test.each(['backup refuses', 'backup silently fails', 'primary refuses', 'newer checkpoint during backup'])(
    '%s leaves the eighth rescue intact and allows an explicit retry', condition => {
      const { values, storage, writes } = fixture();
      const differentBytes = JSON.stringify(eight);
      let blocked = true;
      const journey = new JourneyProgress(() => ({
        getItem: storage.getItem,
        setItem(key, value) {
          if (blocked && key === backup && condition === 'backup refuses') throw Error('Read only');
          if (blocked && key === backup && condition === 'backup silently fails') return;
          if (blocked && key === JOURNEY_STORAGE_KEY && condition === 'primary refuses') throw Error('Quota');
          storage.setItem(key, value);
          if (blocked && key === backup && condition === 'newer checkpoint during backup')
            values.set(JOURNEY_STORAGE_KEY, differentBytes);
        },
      }));
      expect(journey.continueAvailableContent()).toBe(false);
      expect(journey.snapshot).toMatchObject({ raw: original, record: eight });
      expect(journey.snapshot.issue).toContain('Try Continue again');
      expect(writes.some(([key]) => key === JOURNEY_STORAGE_KEY)).toBe(false);
      expect(values.get(JOURNEY_STORAGE_KEY)).toBe(condition === 'newer checkpoint during backup' ? differentBytes : original);
      expect(journey.acknowledge('orchard-underwater')).toBe(false);
      blocked = false;
      const retry = condition === 'newer checkpoint during backup' ? new JourneyProgress(() => storage) : journey;
      expect(retry.continueAvailableContent()).toBe(true);
      expect(retry.snapshot.record).toEqual(pending);
      expect(retry.snapshot.issue).toBeNull();
      expect(values.get(backup)).toBe(original);
      if (condition === 'newer checkpoint during backup') expect(values.get(backup + '.2')).toBe(differentBytes);
    },
  );

  test.each([
    { ...eight, checkpoint: { kind: 'complete', id: 'ternhaven' } },
    { ...eight, completed: [...eight.completed].reverse() },
    { ...eight, completed: [...eight.completed, 'drowned-orchard'] },
    { ...eight, acknowledgedScenes: [...eight.acknowledgedScenes, supperScene] },
    { ...eight, checkpoint: { kind: 'scene', id: supperScene } },
    { ...eight, version: 2 },
  ])('inconsistent endpoint stays untouched: %j', damaged => {
    const bytes = JSON.stringify(damaged);
    const { writes, values, storage } = fixture(bytes);
    const journey = new JourneyProgress(() => storage);
    expect(journey.snapshot.kind).toBe('invalid');
    expect(journey.continueAvailableContent()).toBe(false);
    expect(writes).toEqual([]);
    expect(values.get(JOURNEY_STORAGE_KEY)).toBe(bytes);
  });
});

test('each late rescue advances after terminal Undo and redelivery without a rating; supper and credits reload separately', () => {
  const { storage, values } = fixture();
  const journey = new JourneyProgress(() => storage);
  expect(journey.continueAvailableContent()).toBe(true);
  for (const entry of storyCoves.slice(8)) {
    expect(journey.acknowledge(entry.entryScene)).toBe(true);
    const session = new Session(entry.level);
    const before = values.get(JOURNEY_STORAGE_KEY);
    const witness = JSON.parse(readFileSync('data/' + entry.id + '/witnesses.json', 'utf8')).witnesses[0];
    const actions = witness.actions as Action[];
    for (const action of actions) {
      expect(session.commit(action)).not.toBeNull();
      session.finish();
    }
    expect(session.state.status).toBe('won');
    expect(session.result).toBeNull();
    expect(session.undo()).toBe(true);
    expect(journey.accept(entry.id, session.state.status)).toBe(false);
    expect(values.get(JOURNEY_STORAGE_KEY)).toBe(before);
    expect(session.commit(actions.at(-1)!)).not.toBeNull();
    session.finish();
    expect(journey.accept(entry.id, session.state.status)).toBe(true);
    expect(new MasteryStore(() => storage).accept(session.takeResult())).toBe(false);
    expect(values.get(MASTERY_STORAGE_KEY)).toBe(archived.mastery);
    expect(journey.accept(entry.id, 'won')).toBe(false);
  }
  const atSupper = new JourneyProgress(() => storage);
  const gathered = atSupper.snapshot.record!;
  expect(gathered.checkpoint).toEqual({ kind: 'scene', id: supperScene });
  expect(gathered.completed).toEqual(storyCoves.map(c => c.id));
  expect(gathered.acknowledgedScenes).toEqual(storyCoves.map(c => c.entryScene));
  expect(checkpointCove(gathered)).toBe('last-ferry');
  expect(scenePredecessor(supperScene).id).toBe('last-ferry');
  expect(validateJourney({ ...gathered, checkpoint: { kind: 'complete' } }).valid).toBe(false);
  expect(atSupper.acknowledge(supperScene)).toBe(true);
  const atCredits = new JourneyProgress(() => storage);
  const complete = atCredits.snapshot.record!;
  expect(complete).toEqual({ ...gathered, checkpoint: { kind: 'complete' }, acknowledgedScenes: [...gathered.acknowledgedScenes, supperScene] });
  expect(parseJourney(JSON.stringify(complete)).valid).toBe(true);
  expect(validateJourney({ ...complete, checkpoint: gathered.checkpoint }).valid).toBe(false);
  expect(atCredits.continueAvailableContent()).toBe(false);
  expect(atCredits.acknowledge(supperScene)).toBe(false);
  expect(values.get(backup)).toBe(original);
});

test('a stale open chapter cannot roll back a newer saved rescue', () => {
  const { storage, values } = fixture();
  const firstTab = new JourneyProgress(() => storage);
  expect(firstTab.continueAvailableContent()).toBe(true);
  const oldTab = new JourneyProgress(() => storage);
  expect(firstTab.acknowledge('orchard-underwater')).toBe(true);
  expect(firstTab.accept('drowned-orchard', 'won')).toBe(true);
  const newer = values.get(JOURNEY_STORAGE_KEY);
  expect(oldTab.acknowledge('orchard-underwater')).toBe(true);
  expect(values.get(JOURNEY_STORAGE_KEY)).toBe(newer);
  expect(oldTab.snapshot.persistent).toBe(false);
  expect(oldTab.snapshot.issue).toContain('will not survive closing');
});

test('a silent refusal to save a late chapter is reported as in-session progress', () => {
  const { storage, values } = fixture(JSON.stringify(pending));
  const unchanged = values.get(JOURNEY_STORAGE_KEY);
  const journey = new JourneyProgress(() => ({ getItem: storage.getItem, setItem() {} }));
  expect(journey.acknowledge('orchard-underwater')).toBe(true);
  expect(journey.snapshot.persistent).toBe(false);
  expect(values.get(JOURNEY_STORAGE_KEY)).toBe(unchanged);
});
