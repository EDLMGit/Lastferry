import { afterEach, describe, expect, test, vi } from 'vitest';
import { StoryPresentation, restoredHarbor } from '../../src/campaign/presentation';
import { storyScenes } from '../../src/campaign/registry';
import { initial } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { holdingPier } from '../../src/levels/level';

afterEach(() => vi.useRealTimers());

describe('bounded optional story motion', () => {
  test('restored connective scenery depicts the safe Harbor without altering a puzzle or inventing Undo history', () => {
    const originalLevel = structuredClone(holdingPier);
    const session = new Session(holdingPier);
    const originalState = structuredClone(session.state);
    const scenery = restoredHarbor(holdingPier);
    expect(scenery).toMatchObject({
      boatNodeId: 'harbor',
      aboard: [],
      status: 'won',
      turn: 0,
      tideLevel: 0,
      delivered: holdingPier.objective.requiredPassengerIds,
    });
    expect(Object.values(scenery.waitingByPier).flat()).toEqual([]);
    expect(session.state).toEqual(originalState);
    expect(session.state).toEqual(initial(holdingPier));
    expect(session.history).toEqual([]);
    expect(session.busy).toBe(false);
    expect(holdingPier).toEqual(originalLevel);
    scenery.delivered.pop();
    expect(holdingPier).toEqual(originalLevel);
    expect(restoredHarbor(holdingPier).delivered).toEqual(
      holdingPier.objective.requiredPassengerIds,
    );
  });

  test('watching settles at eight seconds and retains the readable endpoint indefinitely', () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start(false);
    expect(presentation.settled).toBe(false);
    vi.advanceTimersByTime(storyScenes.opening.duration - 1);
    expect(changed).not.toHaveBeenCalled();
    expect(presentation.settled).toBe(false);
    vi.advanceTimersByTime(1);
    expect(presentation.settled).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(120000);
    expect(presentation.settled).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('Skip or background settling cancels the pending motion completion callback', () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start(false);
    vi.advanceTimersByTime(500);
    presentation.settle();
    expect(presentation.settled).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(120000);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  test('Reduced Motion or a restored pending scene starts settled without scheduling a timeout', () => {
    vi.useFakeTimers();
    const presentation = new StoryPresentation(vi.fn());
    presentation.start(true);
    expect(presentation.settled).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('a new scene owns its own complete interval without inheriting an old callback', () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start(false);
    vi.advanceTimersByTime(7000);
    presentation.start(false);
    vi.advanceTimersByTime(1000);
    expect(presentation.settled).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(7000);
    expect(presentation.settled).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  test('navigation and disposal cancellation cannot perform a late presentation update', () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start(false);
    vi.advanceTimersByTime(7999);
    presentation.cancel();
    presentation.cancel();
    vi.advanceTimersByTime(120000);
    expect(changed).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
