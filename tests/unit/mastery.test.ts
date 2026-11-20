import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import audit from '../../reviews/three-lanterns-preparation/TARGET_AUDIT.json';
import holdingWitness from '../../data/experiments/holding-pier-solution.json';
import orchardWitnesses from '../../data/orchard-landing/witnesses.json';
import { practiceCoves } from '../../src/campaign/registry';
import { JourneyProgress, JOURNEY_STORAGE_KEY, newJourney } from '../../src/campaign/progress';
import { holdingPier, orchardLanding } from '../../src/levels/level';
import { initial, type Action } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import {
  MasteryStore, MASTERY_STORAGE_KEY, masteryTargets, resultFor,
  type MasteryResult, type MasteryStorage,
} from '../../src/game/mastery';

function play(session: Session, actions: Action[]) {
  for (const action of actions) {
    expect(session.commit(action)).not.toBeNull();
    session.finish();
  }
  return session;
}

function storage(raw: string | null = null) {
  const values = new Map<string, string>();
  if (raw !== null) values.set(MASTERY_STORAGE_KEY, raw);
  const reads: string[] = [];
  const writes: string[] = [];
  const owner: MasteryStorage = {
    getItem(key) {
      reads.push(key);
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      writes.push(key);
      values.set(key, value);
    },
  };
  return { owner, values, reads, writes };
}

const first = (actions: number, undos: number) => resultFor('first-crossing', actions, undos)!;
const serialized = (results: Record<string, MasteryResult>) => JSON.stringify({ version: 1, results });

describe('authored lantern scoring', () => {
  for (const reviewed of audit.results) {
    for (const witness of reviewed.witnesses) {
      test(reviewed.id + ' / ' + witness.id + ' earns its authored result through Session', () => {
        const file = JSON.parse(readFileSync(witness.source, 'utf8'));
        const actions = file.actions ?? file.witnesses.find((entry: { id: string }) => entry.id === witness.id).actions;
        const level = practiceCoves.find(cove => cove.id === reviewed.id)!;
        const session = play(new Session(level), actions as Action[]);
        expect(session.state.status).toBe('won');
        expect(masteryTargets[level.id].target).toBe(reviewed.target);
        expect(session.result).toMatchObject({
          coveId: level.id,
          revision: 1,
          actions: witness.actions,
          successfulUndos: 0,
          lanterns: witness.qualifies ? 3 : 1,
        });
      });
    }
  }

  test('ordinary, tide and terminal rewinds count separately from final route actions', () => {
    const session = new Session(holdingPier);
    const actions = holdingWitness.actions as Action[];
    expect(session.undo()).toBe(false);
    expect(session.successfulUndos).toBe(0);
    play(session, actions.slice(0, 4));
    expect(session.state.tideLevel).toBe(1);
    const fourth = structuredClone(session.state);
    expect(session.undo()).toBe(true);
    expect(session.state.tideLevel).toBe(0);
    expect(session.successfulUndos).toBe(1);
    play(session, actions.slice(3, 4));
    expect(session.state).toEqual(fourth);
    expect(session.undo()).toBe(true);
    expect(session.undo()).toBe(true);
    expect(session.successfulUndos).toBe(3);
    play(session, actions.slice(2));
    expect(session.result).toMatchObject({ actions: 9, successfulUndos: 3, lanterns: 2 });
    expect(session.undo()).toBe(true);
    expect(session.result).toBeNull();
    play(session, actions.slice(-1));
    expect(session.result).toMatchObject({ actions: 9, successfulUndos: 4, lanterns: 2 });
  });

  test('a provisional three can be withdrawn, redelivered as two and accepted only once', () => {
    const actions = holdingWitness.actions as Action[];
    const session = play(new Session(holdingPier), actions.slice(0, -1));
    expect(session.result).toBeNull();
    expect(session.commit(actions.at(-1)!)).not.toBeNull();
    expect(session.result).toBeNull();
    expect(session.takeResult()).toBeNull();
    expect(session.undo()).toBe(false);
    expect(session.restart()).toBe(false);
    expect(session.successfulUndos).toBe(0);
    session.finish();
    expect(session.result?.lanterns).toBe(3);
    expect(session.undo()).toBe(true);
    play(session, actions.slice(-1));
    const result = session.takeResult();
    expect(result).toMatchObject({ actions: 9, successfulUndos: 1, lanterns: 2 });
    expect(session.takeResult()).toBeNull();
    expect(session.result).toBeNull();
  });

  test('rejected inputs and animation finish do not reset history, successful restart does', () => {
    const session = new Session(holdingPier);
    const firstAction = holdingWitness.actions[0] as Action;
    play(session, [firstAction]);
    expect(session.undo()).toBe(true);
    expect(session.commit({ type: 'move', to: 'missing' })).toBeNull();
    expect(session.undo()).toBe(false);
    expect(session.successfulUndos).toBe(1);
    expect(session.commit(firstAction)).not.toBeNull();
    expect(session.commit(firstAction)).toBeNull();
    expect(session.restart()).toBe(false);
    expect(session.undo()).toBe(false);
    expect(session.successfulUndos).toBe(1);
    session.finish();
    session.finish();
    expect(session.successfulUndos).toBe(1);
    expect(session.restart()).toBe(true);
    expect(session.successfulUndos).toBe(0);
    expect(session.state).toEqual(initial(holdingPier));
    play(session, holdingWitness.actions as Action[]);
    expect(session.result?.lanterns).toBe(3);
  });

  test('cosmetic restored Harbor states and initial mounts cannot earn a result', () => {
    const won = play(new Session(holdingPier), holdingWitness.actions as Action[]).state;
    const background = new Session(holdingPier);
    background.state = structuredClone(won);
    background.finish();
    expect(background.result).toBeNull();
    expect(background.takeResult()).toBeNull();
    expect(new Session(orchardLanding).result).toBeNull();
    const completed = play(new Session(orchardLanding), orchardWitnesses.witnesses[0].actions as Action[]);
    completed.state = { ...completed.state };
    expect(completed.result).toBeNull();
  });

  test('loss recovery keeps Undo history, and a new cove starts its own attempt', () => {
    const session = new Session(holdingPier);
    play(session, Array.from({ length: 4 }, (): Action => ({ type: 'wait' })));
    expect(session.state.status).toBe('lost');
    expect(session.result).toBeNull();
    while (session.history.length) expect(session.undo()).toBe(true);
    play(session, holdingWitness.actions as Action[]);
    expect(session.result).toMatchObject({ lanterns: 2, successfulUndos: 4, actions: 9 });
    expect(new Session(orchardLanding).successfulUndos).toBe(0);
  });
});

describe('separate accepted mastery records', () => {
  test('one actual best run survives poorer replays and ties without mixing its statistics', () => {
    const backing = storage();
    const mastery = new MasteryStore(() => backing.owner);
    expect(mastery.accept(first(8, 1))).toBe(true);
    expect(mastery.accept(first(7, 4))).toBe(true);
    expect(mastery.best('first-crossing')).toEqual(first(7, 4));
    expect(mastery.accept(first(8, 2))).toBe(false);
    expect(mastery.accept(first(7, 2))).toBe(true);
    expect(mastery.accept(first(7, 2))).toBe(false);
    expect(backing.writes).toHaveLength(3);
    expect(mastery.accept(first(8, 0))).toBe(true);
    expect(mastery.best('first-crossing')).toEqual(first(8, 0));
    expect(mastery.accept(first(7, 1))).toBe(false);
    expect(new MasteryStore(() => backing.owner).best('first-crossing')).toEqual(first(8, 0));
  });

  test('a second store cannot overwrite a better result accepted by another owner', () => {
    const backing = storage();
    const firstOwner = new MasteryStore(() => backing.owner);
    const secondOwner = new MasteryStore(() => backing.owner);
    firstOwner.accept(first(7, 0));
    expect(secondOwner.accept(first(8, 1))).toBe(false);
    expect(secondOwner.best('first-crossing')).toEqual(first(7, 0));
    secondOwner.accept(resultFor('holding-pier', 9, 0));
    expect(new MasteryStore(() => backing.owner).best('first-crossing')).toEqual(first(7, 0));
    expect(backing.writes).toHaveLength(2);
  });

  test('results are copies and a matching future Journey cove uses the same stable key', () => {
    const backing = storage();
    const mastery = new MasteryStore(() => backing.owner);
    const result = resultFor('orchard-landing', 13, 0)!;
    mastery.accept(result);
    result.actions = 99;
    const returned = mastery.best('orchard-landing')!;
    returned.successfulUndos = 99;
    expect(mastery.best('orchard-landing')).toEqual(resultFor('orchard-landing', 13, 0));
    expect(JSON.parse(backing.values.get(MASTERY_STORAGE_KEY)!).results['orchard-landing@1'])
      .toEqual(resultFor('orchard-landing', 13, 0));
  });

  test('older scoring revisions are retained but never displayed or accepted as current', () => {
    const future = { ...first(7, 0), revision: 2 };
    const backing = storage(serialized({ 'first-crossing@2': future }));
    const mastery = new MasteryStore(() => backing.owner);
    expect(mastery.best('first-crossing')).toBeNull();
    expect(mastery.accept(future)).toBe(false);
    expect(mastery.accept(first(8, 1))).toBe(true);
    expect(mastery.best('first-crossing')).toEqual(first(8, 1));
    expect(JSON.parse(backing.values.get(MASTERY_STORAGE_KEY)!).results['first-crossing@2']).toEqual(future);
  });

  for (const raw of [
    '{',
    JSON.stringify({ version: 2, results: {} }),
    JSON.stringify({ version: 1, results: [] }),
    serialized({ 'first-crossing@1': { ...first(8, 0), actions: -1 } }),
    serialized({ 'first-crossing@1': { ...first(8, 0), successfulUndos: 1 } }),
    serialized({ 'first-crossing@1': { ...first(8, 0), successfulUndos: 1.5 } }),
    serialized({ 'first-crossing@1': { ...first(8, 0), actions: Number.MAX_SAFE_INTEGER + 1 } }),
    serialized({ 'first-crossing@1': { ...first(8, 0), coveId: 'unknown' } }),
    serialized({ 'holding-pier@1': first(8, 0) }),
  ]) {
    test('unusable stored results keep play and current-visit bests available: ' + raw.slice(0, 90), () => {
      const backing = storage(raw);
      const mastery = new MasteryStore(() => backing.owner);
      expect(mastery.best('first-crossing')).toBeNull();
      expect(mastery.persistent).toBe(false);
      expect(mastery.issue).toContain('visit');
      expect(mastery.accept(first(8, 0))).toBe(true);
      expect(mastery.best('first-crossing')).toEqual(first(8, 0));
      expect(backing.values.get(MASTERY_STORAGE_KEY)).toBe(raw);
      expect(backing.writes).toEqual([]);
    });
  }

  test('blocked access, failed writes and silent writes retain honest current-visit results', () => {
    for (const owner of [
      () => { throw new Error('Access denied'); },
      () => ({ getItem() { throw new Error('Read denied'); }, setItem() {} }),
      () => ({ getItem() { return null; }, setItem() { throw new Error('Quota'); } }),
      () => ({ getItem() { return null; }, setItem() {} }),
    ]) {
      const mastery = new MasteryStore(owner);
      expect(mastery.accept(first(8, 0))).toBe(true);
      expect(mastery.best('first-crossing')).toEqual(first(8, 0));
      expect(mastery.accept(first(9, 0))).toBe(false);
      expect(mastery.persistent).toBe(false);
      expect(mastery.issue).toContain('visit');
    }
  });

  test('legacy Journey rescues earn no synthetic rating and New Journey preserves bests', () => {
    const backing = storage();
    const legacy = JSON.stringify({
      version: 1, completed: ['holding-pier', 'bellwater'],
      acknowledgedScenes: ['opening', 'another-bell'], checkpoint: { kind: 'complete' },
    }, null, 2);
    backing.values.set(JOURNEY_STORAGE_KEY, legacy);
    const mastery = new MasteryStore(() => backing.owner);
    expect(backing.reads).toEqual([MASTERY_STORAGE_KEY]);
    expect(mastery.best('holding-pier')).toBeNull();
    const run = play(new Session(holdingPier), holdingWitness.actions as Action[]).takeResult();
    expect(mastery.accept(run)).toBe(true);
    expect(backing.values.get(JOURNEY_STORAGE_KEY)).toBe(legacy);
    expect(backing.writes).toEqual([MASTERY_STORAGE_KEY]);
    const progress = new JourneyProgress(() => backing.owner);
    expect(progress.snapshot.record?.completed).toEqual(['holding-pier', 'bellwater']);
    progress.replace();
    expect(progress.snapshot.record).toEqual(newJourney());
    expect(new MasteryStore(() => backing.owner).best('holding-pier')).toEqual(run);
  });
});
