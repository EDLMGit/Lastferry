import { describe, expect, test } from 'vitest';
import { acknowledgeScene, acceptCove, JourneyProgress, newJourney, type JourneyRecord } from '../../src/campaign/progress';
import { canRevisit, returnDestination } from '../../src/campaign/revisit';
import { storyCoves, supperScene } from '../../src/campaign/registry';
import { MasteryStore, MASTERY_STORAGE_KEY, resultFor } from '../../src/game/mastery';

describe('earned crossings and Journey destinations', () => {
  const first = acknowledgeScene(newJourney(), 'opening');
  const atBell = acceptCove(first, 'holding-pier', 'won');
  test('only accepted Journey rescues and a standalone earned First Crossing are revisitable', () => {
    expect(canRevisit('holding-pier', first, false)).toBe(false);
    expect(canRevisit('holding-pier', atBell, false)).toBe(true);
    expect(canRevisit('last-ferry', atBell, true)).toBe(false);
    expect(canRevisit('first-crossing', null, false)).toBe(false);
    expect(canRevisit('first-crossing', null, true)).toBe(true);
  });

  test('follow a pending story or cove, supper, legacy continuation or completed Harbor log', () => {
    expect(returnDestination(null)).toEqual({ kind: 'home', label: 'Return Home' });
    expect(returnDestination(atBell).label).toBe('Continue to Bellwater');
    expect(returnDestination(acknowledgeScene(atBell, 'another-bell')).label).toBe('Continue to Bellwater');
    let record = newJourney();
    for (const cove of storyCoves) {
      record = acknowledgeScene(record, cove.entryScene);
      record = acceptCove(record, cove.id, 'won');
    }
    expect(returnDestination(record)).toEqual({ kind: 'journey', label: 'Continue to supper' });
    expect(returnDestination(acknowledgeScene(record, supperScene))).toEqual({ kind: 'log', label: 'Open Harbor log' });
    const old: JourneyRecord = { version: 1, checkpoint: { kind: 'complete' }, completed: ['holding-pier','bellwater'], acknowledgedScenes: ['opening','another-bell'] };
    expect(returnDestination(old)).toEqual({ kind: 'journey', label: 'Continue to Driftwood' });
  });

  test('a second tab advancing the Journey updates the return without modifying its checkpoint', () => {
    let raw = JSON.stringify(atBell);
    const journey = new JourneyProgress(() => ({ getItem: () => raw, setItem() { throw Error('Unexpected write'); } }));
    raw = JSON.stringify(acceptCove(acknowledgeScene(atBell,'another-bell'),'bellwater','won'));
    expect(journey.refresh()).toBe(true);
    expect(returnDestination(journey.snapshot.record).label).toBe('Continue to Driftwood');
    expect(journey.refresh()).toBe(false);
  });
});

test('retry a partially accepted lantern best without weakening a newer score or re-awarding it', () => {
  let blocked = true;
  const records = new Map<string,string>();
  const storage = {
    getItem: (key:string) => records.get(key) ?? null,
    setItem(key:string, value:string) { if (blocked) throw Error('Quota'); records.set(key,value); },
  };
  const store = new MasteryStore(() => storage);
  expect(store.accept(resultFor('holding-pier',12,0))).toBe(true);
  expect(store.issue).toContain('visit');
  blocked = false;
  const stronger = new MasteryStore(() => storage);
  stronger.accept(resultFor('holding-pier',9,0));
  const original = storage.getItem(MASTERY_STORAGE_KEY);
  store.retry();
  expect(store.issue).toBeNull();
  expect(store.best('holding-pier')?.lanterns).toBe(3);
  expect(storage.getItem(MASTERY_STORAGE_KEY)).toBe(original);
});
