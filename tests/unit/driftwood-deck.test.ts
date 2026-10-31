import { expect, test } from 'vitest';
import { Box3, Mesh, Plane, Vector3 } from 'three';
import { animal } from '../../src/scene/models';
import { firstRabbitDeckZ } from '../../src/scene/deck-transfer';

const anchors = [
  [-0.22, 0.26, firstRabbitDeckZ],
  [0.22, 0.26, 0.3],
  [0, 0.26, 0.69],
];
const occupants = ['rabbit', 'rabbit', 'beaver'].map((species, index) => {
  const group = animal(species, index === 1 ? 1 : 0);
  group.scale.set(
    species === 'rabbit' ? 1.25 : 1.15,
    species === 'rabbit' ? 1.65 : 1.5,
    species === 'rabbit' ? 1.25 : 1.15,
  );
  group.position.set(...(anchors[index] as [number, number, number]));
  group.updateMatrixWorld(true);
  const meshes: { box: Box3; planes: Plane[]; points: Vector3[] }[] = [];
  group.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const attribute = object.geometry.getAttribute('position'),
      indices = object.geometry.index;
    const points = Array.from({ length: attribute.count }, (_, i) =>
      new Vector3().fromBufferAttribute(attribute, i).applyMatrix4(object.matrixWorld),
    );
    const planes: Plane[] = [];
    for (let i = 0; i < (indices?.count ?? attribute.count); i += 3) {
      const vertices = [0, 1, 2].map((j) => points[indices ? indices.getX(i + j) : i + j]);
      const plane = new Plane().setFromCoplanarPoints(...(vertices as [Vector3, Vector3, Vector3]));
      if (plane.normal.lengthSq() > 0.5) planes.push(plane);
    }
    meshes.push({ box: new Box3().setFromObject(object), planes, points });
  });
  return meshes;
});

test('every legal Driftwood aboard subset keeps actual modeled bodies apart on shared anchors', () => {
  const failures: string[] = [];
  for (let mask = 1; mask < 8; mask++)
    for (let i = 0; i < 3; i++)
      if (mask & (1 << i))
        for (let j = i + 1; j < 3; j++)
          if (mask & (1 << j)) {
            for (const [a, b] of [
              [i, j],
              [j, i],
            ])
              for (const mesh of occupants[a])
                for (const other of occupants[b]) {
                  if (!mesh.box.intersectsBox(other.box)) continue;
                  for (const point of mesh.points)
                    if (
                      other.box.containsPoint(point) &&
                      other.planes.every((plane) => plane.distanceToPoint(point) < -1e-6)
                    ) {
                      if (failures.length < 15)
                        failures.push(`${mask}:${a}/${b}:${point.toArray().join(',')}`);
                    }
                }
          }
  expect(failures).toEqual([]);
});
import { MathUtils } from 'three';
import {
  bridgeBowOffset,
  deckTransferEntry,
  sampleDeckTransfer,
  transferHeading,
} from '../../src/scene/deck-transfer';

test.each([
  [Math.PI / 2, true],
  [-Math.PI / 2, true],
  [Math.PI / 2, false],
  [-Math.PI / 2, false],
] as const)(
  'Nell transfer avoids already-aboard rabbit bodies at berth %s boarding=%s',
  (heading, board) => {
    const axis = new Vector3(0, 1, 0),
      hullY = 0.135,
      entry = deckTransferEntry('beaver');
    const world = (p: Vector3) =>
      p
        .clone()
        .applyAxisAngle(axis, heading)
        .add(new Vector3(0, hullY, 0));
    const bridge = new Vector3(
      MathUtils.clamp(Math.sin(heading) * bridgeBowOffset, -0.45, 0.45),
      0.535,
      -1.3 + entry.bridgeAdvance,
    );
    const gate = world(new Vector3(Math.sign(heading) * entry.side, 0.26, entry.z));
    const corridor = world(new Vector3(0, 0.26, entry.z));
    const destination = world(new Vector3(...(anchors[2] as [number, number, number])));
    const failures: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100,
        k = t * t * (3 - 2 * t);
      const point = sampleDeckTransfer(
        board,
        board ? new Vector3(0, 0.535, -1.42) : destination,
        bridge,
        gate,
        corridor,
        new Vector3(0, 0.565, -2.35),
        board ? destination : new Vector3(0, 0.535, -1.42),
        k,
      );
      point.y += Math.sin(t * Math.PI * 4) ** 2 * 0.055;
      point.y -= hullY;
      point.applyAxisAngle(axis, -heading);
      const yaw = transferHeading(board, heading, k) - heading;
      for (const mesh of occupants[2])
        for (const p of mesh.points) {
          const vertex = p
            .clone()
            .sub(new Vector3(...(anchors[2] as [number, number, number])))
            .applyAxisAngle(axis, yaw)
            .add(point);
          for (const rabbit of [0, 1])
            for (const other of occupants[rabbit])
              if (
                other.box.containsPoint(vertex) &&
                other.planes.every((plane) => plane.distanceToPoint(vertex) < -1e-6)
              ) {
                if (failures.length < 15)
                  failures.push(`${i}:${rabbit}:${vertex.toArray().join(',')}`);
              }
        }
    }
    expect(failures).toEqual([]);
  },
);
