import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { Session } from '../../src/game/session';
import type { Action } from '../../src/game/rules';
import { holdingPier } from '../../src/levels/level';
import { PresentationPoses } from '../../src/scene/poses';
import { sampleJourney } from '../../src/scene/motion';

test('accepted transactions pair exact planned poses with complete gameplay Undo', () => {
  const session = new Session(holdingPier),
    poses = new PresentationPoses(holdingPier);
  const actions = JSON.parse(readFileSync('data/experiments/holding-pier-solution.json', 'utf8'))
    .actions as Action[];
  const headings = [poses.heading];
  for (const action of actions) {
    const accepted = session.commit(action)!;
    poses.accept(accepted.before, action);
    const planned = poses.heading;
    if (poses.journey) {
      expect(sampleJourney(poses.journey, 1).angle).toBe(planned);
      expect(sampleJourney(poses.journey, 0).angle).toBe(headings.at(-1));
      sampleJourney(poses.journey, 0.37);
      expect(poses.heading).toBe(planned);
    } else expect(planned).toBe(headings.at(-1));
    expect(poses.history.length).toBe(session.history.length);
    headings.push(planned);
    session.finish();
  }
  expect(session.state.status).toBe('won');
  for (let i = actions.length - 1; i >= 0; i--) {
    expect(session.undo()).toBe(true);
    expect(poses.undo()).toBe(true);
    expect(poses.heading).toBe(headings[i]);
    expect(poses.history.length).toBe(session.history.length);
  }
  expect(poses.undo()).toBe(false);
});

test('invalid input, nonmoves, alternate next route and restart preserve pose-history agreement', () => {
  const session = new Session(holdingPier),
    poses = new PresentationPoses(holdingPier);
  const accept = (action: Action) => {
    const transaction = session.commit(action);
    if (transaction) poses.accept(transaction.before, action);
    session.finish();
    return transaction;
  };
  expect(accept({ type: 'move', to: 'shallows' })).toBeNull();
  expect(poses.history).toEqual([]);
  accept({ type: 'unload', passengerIds: ['sheep-1'] });
  accept({ type: 'move', to: 'shallows' });
  const retained = poses.heading;
  accept({ type: 'wait' });
  expect(poses.heading).toBe(retained);
  expect(session.undo() && poses.undo()).toBe(true);
  expect(poses.heading).toBe(retained);
  accept({ type: 'move', to: 'stone' });
  expect(poses.journey!.fromAngle).toBe(retained);
  expect(poses.history.length).toBe(session.history.length);
  session.restart();
  poses.reset();
  expect(poses.history).toEqual([]);
  expect(poses.heading).toBe(new PresentationPoses(holdingPier).heading);
});
