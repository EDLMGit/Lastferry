import { describe, expect, test } from 'vitest';
import {
  JourneyProgress,
  JOURNEY_STORAGE_KEY,
  acceptCove,
  acknowledgeScene,
  checkpointCove,
  newJourney,
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
} from '../../src/campaign/registry';
import { Session } from '../../src/game/session';
import type { Action } from '../../src/game/rules';
import { bellwater, holdingPier, level as firstCrossing } from '../../src/levels/level';

function checkpoints() {
  const opening = newJourney();
  const holding = acknowledgeScene(opening, 'opening');
  const transition = acceptCove(holding, 'holding-pier', 'won');
  const second = acknowledgeScene(transition, 'another-bell');
  const complete = acceptCove(second, 'bellwater', 'won');
  return { opening, holding, transition, second, complete };
}

function memory(raw: string | null = null) {
  const values = new Map<string, string>([
    ['last-ferry.sound', 'muted'],
    ['last-ferry.motion', 'reduced'],
  ]);
  if (raw !== null) values.set(JOURNEY_STORAGE_KEY, raw);
  const reads: string[] = [];
  const writes: [string, string][] = [];
  const storage: JourneyStorage = {
    getItem(key) {
      reads.push(key);
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      writes.push([key, value]);
      values.set(key, value);
    },
  };
  return { values, reads, writes, storage };
}

describe('authored story registry', () => {
  test('only the two existing story puzzles are registered, with practice separate', () => {
    expect(storyCoves.map(({ id, order }) => [id, order])).toEqual([
      ['holding-pier', 0],
      ['bellwater', 1],
    ]);
    expect(storyCove('holding-pier')?.level).toBe(holdingPier);
    expect(storyCove('bellwater')?.level).toBe(bellwater);
    expect(storyCove('first-crossing')).toBeUndefined();
    expect(practiceCoves).toEqual([firstCrossing, holdingPier, bellwater]);
    expect(practiceCove('first-crossing')).toBe(firstCrossing);
    expect(practiceCove('future-cove')).toBeUndefined();
    expect(storyCove('future-cove')).toBeUndefined();
    expect(
      storyCoves.every(({ entryScene, id }) => storyScenes[entryScene].destination === id),
    ).toBe(true);
  });

  test('all opening copy and the connective beat remain available without sound or motion', () => {
    expect(Object.keys(storyScenes)).toEqual(['opening', 'another-bell']);
    expect(storyScenes.opening.captions).toEqual([
      'Your first evening alone at the helm.',
      'The tide will be high tonight.',
      'Bring everyone to the lighthouse.',
    ]);
    expect(storyScenes['another-bell'].captions).toEqual([
      'Pip, Rue and Moss are safe. Across the water, Bellwater is still waiting.',
    ]);
    expect(storyScenes.opening.duration).toBeGreaterThanOrEqual(6000);
    expect(storyScenes.opening.duration).toBeLessThanOrEqual(9000);
    expect(storyScenes['another-bell'].duration).toBeGreaterThanOrEqual(3000);
    expect(storyScenes['another-bell'].duration).toBeLessThanOrEqual(5000);
  });
});

describe('journey checkpoint transactions', () => {
  test('all five checkpoints round-trip with coherent accepted completions and scene acknowledgments', () => {
    const records = Object.values(checkpoints());
    expect(records.map(checkpointCove)).toEqual([
      'holding-pier',
      'holding-pier',
      'bellwater',
      'bellwater',
      'bellwater',
    ]);
    for (const record of records) {
      expect(validateJourney(record)).toEqual({ valid: true, record });
      expect(parseJourney(JSON.stringify(record))).toEqual({ valid: true, record });
      expect(Object.keys(record)).toEqual([
        'version',
        'checkpoint',
        'completed',
        'acknowledgedScenes',
      ]);
    }
    expect(records[2]).toEqual({
      version: 1,
      checkpoint: { kind: 'scene', id: 'another-bell' },
      completed: ['holding-pier'],
      acknowledgedScenes: ['opening'],
    });
    expect(records[4]).toEqual({
      version: 1,
      checkpoint: { kind: 'complete' },
      completed: ['holding-pier', 'bellwater'],
      acknowledgedScenes: ['opening', 'another-bell'],
    });
  });

  test('wrong or repeated scene and cove completions never skip a puzzle or repeat acknowledgment', () => {
    const { opening, holding, transition, second, complete } = checkpoints();
    expect(acknowledgeScene(opening, 'another-bell')).toBe(opening);
    expect(acknowledgeScene(holding, 'opening')).toBe(holding);
    expect(acknowledgeScene(transition, 'opening')).toBe(transition);
    expect(acceptCove(opening, 'holding-pier', 'won')).toBe(opening);
    expect(acceptCove(holding, 'bellwater', 'won')).toBe(holding);
    expect(acceptCove(transition, 'holding-pier', 'won')).toBe(transition);
    expect(acceptCove(second, 'holding-pier', 'won')).toBe(second);
    expect(acceptCove(complete, 'bellwater', 'won')).toBe(complete);
    expect(acknowledgeScene(complete, 'another-bell')).toBe(complete);
    for (const status of ['playing', 'lost', 'busy', 'preview', '']) {
      expect(acceptCove(holding, 'holding-pier', status)).toBe(holding);
    }
  });

  test('transitions are pure and cannot serialize puzzle or presentation state', () => {
    const record = newJourney();
    const before = structuredClone(record);
    const next = acknowledgeScene(record, 'opening');
    next.completed.push('bellwater');
    expect(record).toEqual(before);
    expect(validateJourney(next).valid).toBe(false);
    expect(validateJourney({ ...before, busy: true }).valid).toBe(false);
    expect(validateJourney({ ...before, history: [] }).valid).toBe(false);
    expect(
      validateJourney({ ...before, checkpoint: { ...before.checkpoint, turn: 3 } }).valid,
    ).toBe(false);
  });

  test('actual Holding win, tide Undo, terminal Undo and restart do not advance a checkpoint', () => {
    const backing = memory();
    const progress = new JourneyProgress(() => backing.storage);
    progress.replace();
    progress.acknowledge('opening');
    const held = progress.snapshot;
    const session = new Session(holdingPier);
    const actions: Action[] = [
      { type: 'unload', passengerIds: ['sheep-1'] },
      { type: 'move', to: 'shallows' },
      { type: 'move', to: 'rabbit-pier' },
      { type: 'board', passengerIds: ['rabbit-1', 'rabbit-2'] },
      { type: 'move', to: 'shallows' },
      { type: 'move', to: 'stone' },
      { type: 'board', passengerIds: ['sheep-1'] },
      { type: 'move', to: 'harbor' },
      { type: 'unload', passengerIds: ['rabbit-1', 'rabbit-2', 'sheep-1'] },
    ];
    actions.forEach((action, i) => {
      expect(session.commit(action)).not.toBeNull();
      session.finish();
      if (i === 3) {
        expect(session.state.tideLevel).toBe(1);
        expect(session.undo()).toBe(true);
        expect(session.state.tideLevel).toBe(0);
        session.commit(action);
        session.finish();
      }
      expect(progress.snapshot).toEqual(held);
    });
    expect(session.state.status).toBe('won');
    expect(session.undo()).toBe(true);
    expect(session.state.status).toBe('playing');
    expect(progress.accept('holding-pier', session.state.status)).toBe(false);
    session.commit(actions.at(-1)!);
    session.finish();
    expect(progress.snapshot).toEqual(held);
    expect(progress.accept('holding-pier', session.state.status)).toBe(true);
    const accepted = progress.snapshot;
    session.restart();
    expect(progress.snapshot).toEqual(accepted);
    expect(new Session(bellwater).history).toEqual([]);
  });
});

describe('validated local journey storage', () => {
  test.each([
    ['malformed', '{not json'],
    ['null', 'null'],
    ['array', '[]'],
    ['unsupported', JSON.stringify({ ...newJourney(), version: 0 })],
    ['future version', JSON.stringify({ ...newJourney(), version: 2 })],
    [
      'unknown scene',
      JSON.stringify({ ...newJourney(), checkpoint: { kind: 'scene', id: 'supper' } }),
    ],
    [
      'unknown cove',
      JSON.stringify({
        ...checkpoints().holding,
        checkpoint: { kind: 'cove', id: 'first-crossing' },
      }),
    ],
    [
      'early cove',
      JSON.stringify({ ...newJourney(), checkpoint: { kind: 'cove', id: 'bellwater' } }),
    ],
    [
      'duplicate completion',
      JSON.stringify({ ...checkpoints().transition, completed: ['holding-pier', 'holding-pier'] }),
    ],
    [
      'wrong acknowledgment order',
      JSON.stringify({
        ...checkpoints().complete,
        acknowledgedScenes: ['another-bell', 'opening'],
      }),
    ],
    ['unaccepted endpoint', JSON.stringify({ ...newJourney(), checkpoint: { kind: 'complete' } })],
    ['oversized', ' '.repeat(8193)],
  ])('%s save is retained without silent reset or write', (_name, raw) => {
    const backing = memory(raw);
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.snapshot.kind).toBe('invalid');
    expect(progress.snapshot.raw).toBe(raw);
    expect(progress.snapshot.issue).toContain('kept');
    expect(backing.writes).toEqual([]);
    expect(progress.acknowledge('opening')).toBe(false);
    expect(progress.accept('holding-pier', 'won')).toBe(false);
    expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(raw);
  });

  test('a canceled replacement is read-only; explicit replacement writes only the journey key', () => {
    const raw = JSON.stringify(checkpoints().second);
    const backing = memory(raw);
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.snapshot.record).toEqual(checkpoints().second);
    expect(progress.snapshot.raw).toBe(raw);
    expect(backing.writes).toEqual([]);
    expect(progress.replace()).toEqual(newJourney());
    expect(backing.reads).toEqual([JOURNEY_STORAGE_KEY]);
    expect(backing.writes).toEqual([[JOURNEY_STORAGE_KEY, JSON.stringify(newJourney())]]);
    expect(backing.values.get('last-ferry.sound')).toBe('muted');
    expect(backing.values.get('last-ferry.motion')).toBe('reduced');
  });

  test('invalid data is replaced only by the explicit replacement operation', () => {
    const backing = memory('original invalid data');
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.snapshot.kind).toBe('invalid');
    progress.replace();
    expect(progress.snapshot.kind).toBe('valid');
    expect(progress.snapshot.issue).toBeNull();
    expect(backing.writes.length).toBe(1);
  });

  test('accepting departure stores completion and pending destination in one write and survives reload', () => {
    const backing = memory(JSON.stringify(checkpoints().holding));
    const progress = new JourneyProgress(() => backing.storage);
    expect(progress.accept('holding-pier', 'won')).toBe(true);
    expect(progress.accept('holding-pier', 'won')).toBe(false);
    expect(backing.writes).toEqual([
      [JOURNEY_STORAGE_KEY, JSON.stringify(checkpoints().transition)],
    ]);
    const restored = new JourneyProgress(() => backing.storage);
    expect(restored.snapshot.record).toEqual(checkpoints().transition);
    expect(restored.acknowledge('another-bell')).toBe(true);
    expect(restored.acknowledge('another-bell')).toBe(false);
    expect(backing.writes.length).toBe(2);
    expect(restored.accept('bellwater', 'won')).toBe(true);
    const endpoint = new JourneyProgress(() => backing.storage);
    expect(endpoint.snapshot.record).toEqual(checkpoints().complete);
    expect(endpoint.accept('bellwater', 'won')).toBe(false);
    expect(backing.writes.length).toBe(3);
  });

  test('snapshots cannot mutate stored progress behind validation', () => {
    const backing = memory(JSON.stringify(checkpoints().holding));
    const progress = new JourneyProgress(() => backing.storage);
    const snapshot = progress.snapshot;
    snapshot.record!.completed.push('bellwater');
    snapshot.record!.checkpoint = { kind: 'complete' };
    snapshot.kind = 'invalid';
    expect(progress.snapshot.record).toEqual(checkpoints().holding);
    expect(backing.writes).toEqual([]);
  });

  test.each(['access', 'read', 'write'])(
    'unavailable storage at %s stays playable in memory with truthful notice',
    (failure) => {
      const backing = memory();
      const storage: JourneyStorage = {
        getItem(key) {
          if (failure === 'read') throw new Error('Denied read');
          return backing.storage.getItem(key);
        },
        setItem(key, value) {
          if (failure === 'write') throw new Error('Quota exceeded');
          backing.storage.setItem(key, value);
        },
      };
      const progress = new JourneyProgress(() => {
        if (failure === 'access') throw new Error('Denied access');
        return storage;
      });
      progress.replace();
      expect(progress.snapshot.persistent).toBe(false);
      expect(progress.snapshot.issue).toContain('will not survive closing');
      expect(progress.acknowledge('opening')).toBe(true);
      expect(progress.accept('holding-pier', 'won')).toBe(true);
      expect(progress.acknowledge('another-bell')).toBe(true);
      expect(progress.accept('bellwater', 'won')).toBe(true);
      expect(progress.snapshot.record).toEqual(checkpoints().complete);
      expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBeUndefined();
      expect(backing.values.get('last-ferry.sound')).toBe('muted');
      expect(backing.values.get('last-ferry.motion')).toBe('reduced');
    },
  );

  test('failed replacement preserves the original storage bytes while the new in-memory journey works', () => {
    const raw = '{bad original save';
    const backing = memory(raw);
    const progress = new JourneyProgress(() => ({
      getItem: backing.storage.getItem,
      setItem() {
        throw new Error('Full');
      },
    }));
    progress.replace();
    expect(progress.snapshot.record).toEqual(newJourney());
    expect(progress.snapshot.persistent).toBe(false);
    expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(raw);
    expect(progress.acknowledge('opening')).toBe(true);
  });

  test('invalid relationships passed to pure operations cannot become accepted progress', () => {
    const forged = { ...newJourney(), completed: ['bellwater'] } as JourneyRecord;
    expect(acknowledgeScene(forged, 'opening')).toBe(forged);
    expect(acceptCove(forged, 'holding-pier', 'won')).toBe(forged);
  });
});
