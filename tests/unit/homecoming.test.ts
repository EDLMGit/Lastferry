import { expect, test } from 'vitest';
import { Group, Vector3 } from 'three';
import { CrossingEffects } from '../../src/scene/effects';
import { lighthouse } from '../../src/scene/models';
import { acknowledgmentPose, HomecomingTimeline } from '../../src/scene/homecoming';

test('an arrival runs once, settles its finite reaction and can start afresh only after reset', () => {
  const timeline = new HomecomingTimeline();
  expect(timeline.start(100, false)).toBe(true);
  expect(timeline.start(200, false)).toBe(false);
  expect(timeline.celebrations).toBe(1);
  timeline.update(600);
  expect(timeline.finite).toBe(true);
  timeline.update(1500);
  expect(timeline.finite).toBe(false);
  expect(timeline.active).toBe(true);
  expect(timeline.start(1600, false)).toBe(false);
  timeline.reset();
  expect(timeline.active).toBe(false);
  expect(timeline.start(1700, false)).toBe(true);
  expect(timeline.celebrations).toBe(2);
});

test('reduced motion and recovery settle without scheduling a later reaction', () => {
  const timeline = new HomecomingTimeline();
  timeline.start(100, true);
  timeline.update(200);
  expect(timeline.finite).toBe(false);
  expect(timeline.settled).toBe(true);
  expect(timeline.start(300, false)).toBe(false);
  timeline.reset();
  timeline.start(400, false);
  timeline.settle('hidden');
  timeline.update(60000);
  expect(timeline.finite).toBe(false);
  expect(timeline.reason).toBe('hidden');
  timeline.reset();
  timeline.restore();
  expect(timeline.startedAt).toBeNull();
  expect(timeline.finite).toBe(false);
  expect(timeline.celebrations).toBe(2);
});

test('rabbit and sheep gestures leave exact resting transforms outside one finite staggered window', () => {
  const resting = { height: 0, pitch: 0 };
  for (const species of ['rabbit', 'sheep'])
    for (const index of [0, 1, 2]) {
      expect(acknowledgmentPose(species, index, 0)).toEqual(resting);
      expect(acknowledgmentPose(species, index, 1300)).toEqual(resting);
      expect(acknowledgmentPose(species, index, 60000)).toEqual(resting);
    }
  expect(acknowledgmentPose('rabbit', 0, 360).height).toBeGreaterThan(0.16);
  expect(acknowledgmentPose('rabbit', 1, 200)).toEqual(resting);
  expect(acknowledgmentPose('sheep', 0, 480).height).toBeLessThan(0.04);
});

test('the independent decorative beam remains bounded and static under reduced motion', () => {
  const home = lighthouse(new Group(), 0, 0, 0),
    effects = new CrossingEffects(home),
    boat = new Vector3();
  expect(effects.sweep.visible).toBe(false);
  expect(effects.sweep.userData.excludeFromFrame).toBe(true);
  expect(effects.sweep.children).toHaveLength(1);
  const building = home.group.rotation.toArray();
  effects.arrive(0, false);
  for (let time = 0; time <= 20000; time += 50) effects.update(time, boat, 0, false, 0, false);
  expect(effects.sweep.rotation.y).toBeCloseTo(Math.PI * 2);
  expect(home.group.rotation.toArray()).toEqual(building);
  effects.update(20050, boat, 0, false, 0, true);
  const steady = effects.sweep.rotation.y;
  effects.update(80000, boat, 0, false, 0, true);
  expect(effects.sweep.rotation.y).toBe(steady);
  expect(effects.sweep.children).toHaveLength(1);
  effects.reset();
  expect(effects.sweep.visible).toBe(false);
  effects.settle(false);
  effects.update(90000, boat, 0, false, 0, false);
  effects.update(90050, boat, 0, false, 0, false);
  expect(effects.sweep.rotation.y).toBeGreaterThan(0);
  expect(effects.presentation().arrival.active).toBe(false);
});
