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

  test('each shot holds until Next without touching the pending checkpoint', () => {
    const changed = vi.fn();
    const presentation = new StoryPresentation(changed);
    presentation.start('opening', false, 0);
    for (let t = 100; t <= 8000; t += 100) presentation.update(t);
    expect(presentation.frame).toMatchObject({
      shot: 'tide',
      elapsed: 6000,
      settled: true,
      final: false,
    });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(presentation.next(false, 8000)).toBe(true);
    expect(presentation.frame).toMatchObject({ shot: 'lantern', elapsed: 0, settled: false });
    expect(presentation.next(false, 8001)).toBe(true);
    expect(presentation.frame).toMatchObject({ shot: 'ferry', elapsed: 0, final: true });
    expect(presentation.next(false, 8002)).toBe(false);
    expect(presentation.frame.scene).toBe('opening');
  });

  test('caption reveals the complete current phrase after its brief visual lead and remains held', () => {
    const presentation = new StoryPresentation(vi.fn());
    presentation.start('opening', false, 0);
    presentation.update(1000);
    presentation.update(1050);
    expect(presentation.frame.captionOpacity).toBe(0);
    presentation.update(1170);
    expect(presentation.frame.captionOpacity).toBeCloseTo(0.5);
    presentation.update(1290);
    expect(presentation.frame.captionOpacity).toBe(1);
    presentation.settle();
    presentation.update(30000);
    expect(presentation.frame).toMatchObject({ captionVisible: true, elapsed: 6000, shot: 'tide' });
  });

  test('Skip reaches the final readable endpoint but leaves the scene pending', () => {
    const presentation = new StoryPresentation(vi.fn());
    presentation.start('opening', false, 0);
    presentation.skip();
    expect(presentation.frame).toMatchObject({
      scene: 'opening',
      shot: 'ferry',
      elapsed: 7000,
      recap: true,
      final: true,
      settled: true,
      captionOpacity: 1,
    });
  });

  test('Reduced Motion starts at each still endpoint, while restore chooses the final recap', () => {
    const presentation = new StoryPresentation(vi.fn());
    presentation.start('opening', true, 0);
    expect(presentation.frame).toMatchObject({ shot: 'tide', elapsed: 6000, captionOpacity: 1 });
    presentation.next(true, 10);
    expect(presentation.frame).toMatchObject({ shot: 'lantern', elapsed: 6000, settled: true });
    presentation.start('opening', false, 0, true);
    expect(presentation.frame).toMatchObject({
      shot: 'ferry',
      recap: true,
      elapsed: 7000,
      settled: true,
    });
    presentation.start('another-bell', true, 0);
    expect(presentation.frame).toMatchObject({ shot: 'harbor', elapsed: 5000, final: true });
  });

  test('opening reading/settings/hide settlement affects only the current shot and never replays itself', () => {
    const runs = vi.fn();
    const presentation = new StoryPresentation(vi.fn(), runs);
    presentation.start('opening', false, 0);
    presentation.next(false, 100);
    presentation.update(400);
    presentation.settle();
    const token = presentation.frame.runToken;
    presentation.update(100000);
    presentation.settle();
    expect(presentation.frame).toMatchObject({
      shot: 'lantern',
      settled: true,
      runToken: token,
      recap: false,
    });
    expect(runs).toHaveBeenLastCalledWith(null);
  });

  test('Replay invalidates the old run, restarts only its shot, and whole replay returns to tide', () => {
    const runs = vi.fn(),
      cue = vi.fn();
    const presentation = new StoryPresentation(vi.fn(), runs, cue);
    presentation.start('opening', false, 0);
    presentation.next(false, 100);
    presentation.update(1100);
    presentation.update(1550);
    expect(cue).toHaveBeenCalledTimes(1);
    const firstToken = cue.mock.calls[0][0];
    presentation.replay(false, false, 2000);
    expect(presentation.frame).toMatchObject({ shot: 'lantern', elapsed: 0 });
    expect(presentation.frame.runToken).toBeGreaterThan(firstToken);
    presentation.update(3000);
    presentation.update(3450);
    expect(cue).toHaveBeenCalledTimes(2);
    expect(cue.mock.calls[1][0]).not.toBe(firstToken);
    presentation.replay(false, true, 4000);
    expect(presentation.frame).toMatchObject({ shot: 'tide', elapsed: 0 });
  });

  test('large stalled intervals settle safely without bursting missed cues', () => {
    const cue = vi.fn(),
      run = vi.fn();
    const presentation = new StoryPresentation(vi.fn(), run, cue);
    presentation.start('opening', false, 0);
    presentation.update(5000);
    expect(presentation.frame).toMatchObject({ shot: 'tide', elapsed: 6000, settled: true });
    expect(cue).not.toHaveBeenCalled();
    expect(run).toHaveBeenLastCalledWith(null);
  });

  test('missed or normally consumed cue cannot return on a later frame', () => {
    const cue = vi.fn();
    const presentation = new StoryPresentation(vi.fn(), () => {}, cue);
    presentation.start('opening', false, 0);
    presentation.update(1000);
    presentation.update(1700);
    presentation.update(2200);
    presentation.update(2300);
    expect(cue).not.toHaveBeenCalled();
    presentation.replay(false, false, 3000);
    presentation.update(4000);
    presentation.update(4900);
    presentation.update(4900);
    expect(cue).toHaveBeenCalledTimes(1);
  });

  test('cancellation has no late frame, cue or continuation work', () => {
    const changed = vi.fn(),
      cue = vi.fn(),
      run = vi.fn();
    const presentation = new StoryPresentation(changed, run, cue);
    presentation.start('opening', false, 0);
    presentation.cancel();
    presentation.update(100000);
    presentation.skip();
    presentation.replay(false);
    expect(presentation.next(false)).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    expect(cue).not.toHaveBeenCalled();
    expect(presentation.frame).toMatchObject({ scene: null, elapsed: 0, settled: true });
    expect(run).toHaveBeenLastCalledWith(null);
  });

  test('backwards timestamps cannot reverse visual progress', () => {
    const presentation = new StoryPresentation(vi.fn());
    presentation.start('opening', false, 100);
    presentation.update(800);
    presentation.update(500);
    expect(presentation.frame.elapsed).toBe(700);
  });
});
