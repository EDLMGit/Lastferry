import { Group } from 'three';
import type { Level } from '../levels/level';
import { box, cylinder } from './models';

export function createPier(p: Level['piers'][number], stone: boolean) {
  const group = new Group();
  group.name = `pier-${p.id}`;
  const [x, z] = p.positionXZ,
    end = p.landAnchorXZ[1],
    y = p.elevation * 0.18 - 0.06;
  for (let i = 0; i < 9; i++)
    box(
      group,
      stone ? (i % 2 ? '#a9b6ac' : '#899d97') : i % 2 ? '#c09560' : '#b78b58',
      [p.width, 0.09, 0.14],
      [x, y, z + ((end - z) * i) / 8],
      0.015,
    );
  for (const px of [x - p.width / 2, x + p.width / 2])
    for (const pz of [z + 0.02, end]) {
      const pile = cylinder(group, '#79644a', 0.065, 0.07, 0.83, [px, y - 0.27, pz], 9);
      pile.userData.pierPile = true;
      cylinder(group, '#dbc799', 0.075, 0.075, 0.055, [px, y + 0.17, pz], 9);
    }
  box(group, '#b68f5b', [0.35, 0.055, 0.49], [x, y - 0.015, z + 0.25], 0.015);
  cylinder(group, '#655b43', 0.025, 0.025, 0.65, [x + 0.36, y + 0.33, z - 0.1], 7);
  box(group, '#f5cb77', [0.13, 0.19, 0.13], [x + 0.36, y + 0.68, z - 0.1]);
  return group;
}
