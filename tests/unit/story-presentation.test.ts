import { describe, expect, test, vi } from 'vitest';
import { StoryPresentation, restoredHarbor } from '../../src/campaign/presentation';
import { storyScenes } from '../../src/campaign/registry';
import { initial } from '../../src/game/rules';
import { Session } from '../../src/game/session';
import { holdingPier } from '../../src/levels/level';

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

  test('the render clock drives authored opening progress and holds its endpoint without acknowledging a checkpoint', () => {
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start('opening', false, 100);
    expect(presentation.settled).toBe(false);
    presentation.update(100 + 1600);
    expect(presentation.frame.elapsed).toBe(1600);
    presentation.update(100 + storyScenes.opening.duration - 1);
    expect(changed).not.toHaveBeenCalled();
    expect(presentation.settled).toBe(false);
    presentation.update(100 + storyScenes.opening.duration);
    expect(presentation.settled).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    presentation.update(120000);
    expect(presentation.settled).toBe(true);
    expect(presentation.frame.elapsed).toBe(storyScenes.opening.duration);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  test('Skip and background settling reach the same endpoint once with no delayed render work', () => {
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start('opening', false, 0);
    presentation.update(500);
    presentation.settle();
    expect(presentation.settled).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(presentation.frame.elapsed).toBe(storyScenes.opening.duration);
    presentation.settle();
    presentation.update(120000);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  test('Reduced Motion and restored pending scenes begin at their authored endpoints', () => {
    const presentation = new StoryPresentation(vi.fn());
    presentation.start('opening', true, 0);
    expect(presentation.settled).toBe(true);
    expect(presentation.frame.elapsed).toBe(storyScenes.opening.duration);
    presentation.start('another-bell', true, 200);
    expect(presentation.frame).toMatchObject({ elapsed: 4000, settled: true });
  });

  test('the shorter Harbor scene owns its own interval without inheriting opening time', () => {
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start('opening', false, 0);
    presentation.update(7000);
    presentation.start('another-bell', false, 7000);
    presentation.update(8000);
    expect(presentation.settled).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    expect(presentation.frame.elapsed).toBe(1000);
    presentation.update(11000);
    expect(presentation.settled).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  test('immediate navigation and disposal cancel finite jobs before any late frame can change presentation', () => {
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start('opening', false, 0);
    presentation.cancel();
    presentation.cancel();
    presentation.update(120000);
    expect(changed).not.toHaveBeenCalled();
    expect(presentation.frame).toMatchObject({ scene: null, elapsed: 0, settled: true });
  });

  test('out of order timestamps cannot reverse an in-progress acknowledgment', () => {
    const presentation = new StoryPresentation(vi.fn());
    presentation.start('opening', false, 100);
    presentation.update(1600);
    presentation.update(1200);
    expect(presentation.frame.elapsed).toBe(1500);
  });
});
