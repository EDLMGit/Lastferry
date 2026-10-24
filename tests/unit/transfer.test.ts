import { describe, expect, test } from 'vitest';
import { initial, reduce, type Action, type State } from '../../src/game/rules';
import { holdingPier } from '../../src/levels/level';
import { TransferTimeline } from '../../src/scene/transfer';

const transfer = (before: State, action: Action, reduced = false) =>
  TransferTimeline.create(before, reduce(before, action, holdingPier), action, reduced);
const unload = { type: 'unload', passengerIds: ['sheep-1'] } as const;
const unloading = () => transfer(initial(holdingPier), { ...unload, passengerIds: ['sheep-1'] })!;

describe('passenger contacts on the visual transfer timeline', () => {
  test('creating a transfer and presenting its opening do not play contacts; each wood phase is consumed once', () => {
    const timeline = unloading();
    expect(timeline.presentation().records).toEqual([]);
    expect(timeline.advance(0.1)).toBeNull();
    expect(timeline.advance(0.26)?.passengerIds).toEqual(['sheep-1']);
    expect(timeline.advance(0.26)).toBeNull();
    expect(timeline.advance(0.51)).toBeNull();
    expect(timeline.advance(0.8)).toBeNull();
    expect(timeline.advance(1)).toBeNull();
    expect(timeline.presentation().records.map((record) => record.outcome)).toEqual(['emitted']);
  });

  test('an unloading frame that reaches land drops missed wooden contacts instead of playing a burst', () => {
    const timeline = unloading();
    expect(timeline.advance(0.65)).toBeNull();
    expect(timeline.advance(1)).toBeNull();
    expect(timeline.presentation().records.map((record) => record.outcome)).toEqual(['stale']);
    const delayed = unloading();
    expect(delayed.advance(0.52)).toBeNull();
    expect(delayed.presentation().records.map((record) => record.outcome)).toEqual(['stale']);
  });

  test('boarding contacts depend on actual selected membership changes, and reach the wooden bridge before sounding', () => {
    const before = {
      ...initial(holdingPier),
      aboard: [],
      waitingByPier: { ...initial(holdingPier).waitingByPier, 'stone-pier': ['sheep-1'] },
    };
    const after = { ...before, aboard: ['rabbit-1', 'rabbit-2'] };
    const timeline = TransferTimeline.create(
      before,
      after,
      { type: 'board', passengerIds: ['rabbit-1', 'rabbit-2', 'sheep-1'] },
      false,
    )!;
    expect(timeline.advance(0.3)).toBeNull();
    expect(timeline.advance(0.51)?.passengerIds).toEqual(['rabbit-1', 'rabbit-2']);
    expect(timeline.advance(0.76)?.stage).toBe('settling');
    expect(timeline.advance(1)).toBeNull();
    expect(
      TransferTimeline.create(before, before, { type: 'board', passengerIds: ['sheep-1'] }, false),
    ).toBeNull();
    expect(transfer(initial(holdingPier), { type: 'wait' })).toBeNull();
    const delayed = TransferTimeline.create(
      before,
      after,
      { type: 'board', passengerIds: ['rabbit-1'] },
      false,
    )!;
    expect(delayed.advance(0.78)?.stage).toBe('settling');
    expect(delayed.presentation().records.map((record) => record.outcome)).toEqual([
      'stale',
      'emitted',
    ]);
  });

  test('partial unloading excludes passengers still aboard and behaves the same at Harbor', () => {
    const before = { ...initial(holdingPier), aboard: ['rabbit-1', 'rabbit-2', 'sheep-1'] };
    const after = { ...before, aboard: ['rabbit-2', 'sheep-1'], delivered: ['rabbit-1'] };
    const timeline = TransferTimeline.create(
      before,
      after,
      { type: 'unload', passengerIds: ['rabbit-1'] },
      false,
    )!;
    expect(timeline.advance(0.27)?.passengerIds).toEqual(['rabbit-1']);
    expect(timeline.advance(0.52)).toBeNull();
  });

  test('reduced motion emits one quiet compact event even when its first frame completes the transfer', () => {
    const timeline = transfer(
      initial(holdingPier),
      { ...unload, passengerIds: ['sheep-1'] },
      true,
    )!;
    expect(timeline.advance(1)).toMatchObject({ stage: 'compact', reduced: true });
    expect(timeline.advance(1)).toBeNull();
    expect(timeline.presentation().records).toHaveLength(1);
  });

  test('cancel or recovery consumes pending phases; a real replay gets a fresh timeline', () => {
    const timeline = unloading();
    timeline.cancel();
    expect(timeline.advance(0.51)).toBeNull();
    expect(timeline.presentation().records.map((record) => record.outcome)).toEqual(['cancelled']);
    expect(unloading().advance(0.26)?.stage).toBe('crossing');
  });
});
