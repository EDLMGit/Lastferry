import { expect, test } from 'vitest';
import { Vector3, Vector4 } from 'three';
import { reefReturn } from '../../src/levels/level';
import { passageFlow } from '../../src/game/rules';
import { getLevelPaths, samplePath } from '../../src/scene/paths';
import { createReefPassage, reefShelves, setReefDirection } from '../../src/scene/reef';
import { createSeabedField } from '../../src/scene/seabed';

const reef = reefReturn.edges.find((edge) => edge.current)!;
const paths = getLevelPaths(reefReturn);
const path = paths.get(reef.id)!;

test('the three visible reef chevrons point along the current at every tide and after a reversal is undone', () => {
  const { arrows } = createReefPassage(path);
  for (const tide of [0, 1, 2, 1]) {
    const reverse = passageFlow(reef, tide)!.from !== reef.nodes[0];
    setReefDirection(arrows, reverse);
    expect(arrows.children).toHaveLength(3);
    for (const arrow of arrows.children) {
      const nearest = path.points.reduce((a, b) =>
        a.distanceToSquared(arrow.position) < b.distanceToSquared(arrow.position) ? a : b,
      );
      const index = path.points.indexOf(nearest);
      const waterway = samplePath(path, path.distances[index]).tangent;
      const pointsToward = new Vector3(0, 0, 1).applyQuaternion(arrow.quaternion);
      expect(pointsToward.dot(waterway) * (reverse ? -1 : 1)).toBeGreaterThan(0.98);
    }
  }
});

test('two visible skerries rise from submerged shelves beside the deeper central sailing line', () => {
  const bed = createSeabedField(reefReturn, new Vector4(-12, -9, 24, 23), 16, paths);
  const center = samplePath(path, path.length / 2).position;
  const channel = bed.sampleAuthored(center.x, center.z).height;
  for (const shelf of reefShelves(path)) {
    const height = bed.sampleAuthored(shelf.x, shelf.z).height;
    expect(height).toBeLessThan(0);
    expect(height).toBeGreaterThan(channel + 1);
  }
  bed.texture.dispose();
});
