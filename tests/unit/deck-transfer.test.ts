import { expect, test } from 'vitest';
import { Vector3 } from 'three';
import {
  bridgeBowOffset,
  deckEntryZ,
  firstRabbitDeckZ,
  sampleDeckTransfer,
  transferHeading,
} from '../../src/scene/deck-transfer';

test.each([Math.PI / 2, -Math.PI / 2])(
  'both berth headings cross the open entry and finish exactly on their anchors: %s',
  (heading) => {
    const axis = new Vector3(0, 1, 0);
    const world = (p: Vector3) => p.clone().applyAxisAngle(axis, heading);
    const local = (p: Vector3) => p.clone().applyAxisAngle(axis, -heading);
    const side = Math.sign(heading);
    const from = new Vector3(0, 0.54, -1.02);
    const bridge = new Vector3(Math.sin(heading) * bridgeBowOffset, 0.54, -0.44);
    const gate = world(new Vector3(side * 0.51, 0.26, deckEntryZ));
    const corridor = world(new Vector3(0, 0.26, deckEntryZ));
    const land = new Vector3(0, 0.56, -1.5);
    for (const anchor of [
      new Vector3(-0.22, 0.26, firstRabbitDeckZ),
      new Vector3(0.22, 0.26, 0.3),
      new Vector3(0, 0.26, 0.69),
    ]) {
      const destination = world(anchor);
      const board = (p: number) =>
        sampleDeckTransfer(true, from, bridge, gate, corridor, land, destination, p);
      const unload = (p: number) =>
        sampleDeckTransfer(false, destination, bridge, gate, corridor, land, from, p);
      expect(board(0).distanceTo(from)).toBe(0);
      expect(board(1).distanceTo(destination)).toBe(0);
      expect(unload(0).distanceTo(destination)).toBe(0);
      expect(unload(1).distanceTo(from)).toBe(0);
      expect(board(0.5).distanceTo(bridge)).toBeLessThan(1e-12);
      expect(unload(1 / 3).distanceTo(bridge)).toBeLessThan(1e-12);
      for (let i = 0; i <= 400; i++) {
        for (const sample of [board, unload]) {
          const point = local(sample(i / 400));
          if (Math.abs(point.x) <= 0.51 && Math.abs(point.x) >= 0.4) {
            expect(point.z).toBeGreaterThan(-0.3);
            expect(point.z).toBeLessThan(0.6);
          }
          if (Math.abs(point.x) <= 0.35) expect(point.z).toBeGreaterThanOrEqual(-0.020001);
        }
      }
      expect(transferHeading(true, heading, 1)).toBeCloseTo(heading);
      expect(transferHeading(false, heading, 0)).toBeCloseTo(heading);
      expect(transferHeading(false, heading, 1)).toBeCloseTo(0, 12);
      expect(transferHeading(true, heading, 0.5)).toBeCloseTo(heading);
      expect(transferHeading(false, heading, 1 / 3)).toBeCloseTo(heading);
    }
  },
);
