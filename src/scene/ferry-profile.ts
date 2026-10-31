import type { Level } from '../levels/level';
import { Matrix4, Shape, Vector3 } from 'three';

export type FerryProfile = {
  id: 'four-space' | 'six-space';
  capacity: number;
  deckY: number;
  beam: number;
  bow: number;
  stern: number;
  gateX: number;
  gateZ: number;
  wake: {
    fore: number;
    aft: number;
    lateral: number;
    outline?: [number, number][];
    margin?: number;
  };
  berthHold: number;
  berthTurn: number;
};
export const smallFerryProfile: FerryProfile = {
  id: 'four-space',
  capacity: 4,
  deckY: 0.26,
  beam: 1.06,
  bow: 1.04,
  stern: 0.89,
  gateX: 0.51,
  gateZ: 0.28,
  wake: { fore: 0.76, aft: 0.76, lateral: 0.48 },
  berthHold: 0.45,
  berthTurn: 0.55,
};
export function wideHullOutline() {
  const outline = new Shape();
  outline.moveTo(-0.98, -1.58);
  outline.quadraticCurveTo(-1.13, 0.45, -0.96, 2.05);
  outline.quadraticCurveTo(0, 2.45, 0.96, 2.05);
  outline.quadraticCurveTo(1.13, 0.45, 0.98, -1.58);
  outline.quadraticCurveTo(0, -1.75, -0.98, -1.58);
  return outline;
}
const wakeOutline = wideHullOutline()
  .getPoints(48)
  .map((p) => [p.x * 1.025, p.y * 1.025] as [number, number]);
export function hullDraftY(requiredDraft: number) {
  return 0.03 - (requiredDraft - 1) * 0.075;
}
export const wideFerryProfile: FerryProfile = {
  id: 'six-space',
  capacity: 6,
  deckY: 0.26,
  beam: 2.4,
  bow: 2.43,
  stern: 1.78,
  gateX: 0.88,
  gateZ: 1.72,
  wake: {
    fore: Math.max(...wakeOutline.map((p) => p[1])) + 0.18,
    aft: -Math.min(...wakeOutline.map((p) => p[1])) + 0.18,
    lateral: Math.max(...wakeOutline.map((p) => p[0])) + 0.18,
    outline: wakeOutline,
    margin: 0.18,
  },
  berthHold: 0.9,
  berthTurn: 1,
};
export function ferryProfile(level?: Pick<Level, 'rules'>): FerryProfile {
  return level?.rules.capacity === 6 ? wideFerryProfile : smallFerryProfile;
}
export function passengerScale(species: string): [number, number, number] {
  return species === 'rabbit' ? [1.25, 1.65, 1.25] : [1.15, 1.5, 1.15];
}
export function deckSeat(level: Level, id: string): Vector3 {
  const passenger = level.passengers.find((p) => p.id === id)!;
  const peers = level.passengers.filter((p) => p.species === passenger.species);
  const index = peers.findIndex((p) => p.id === id);
  if (ferryProfile(level).id === 'four-space')
    return new Vector3(
      ...((passenger.species === 'rabbit'
        ? index === 0
          ? [-0.22, 0.26, 0.1]
          : [0.22, 0.26, 0.3]
        : [0, 0.26, 0.69]) as [number, number, number]),
    );
  const stable = [...peers].sort((a, b) => a.id.localeCompare(b.id)).findIndex((p) => p.id === id);
  return new Vector3(
    stable % 2 ? 0.7 : -0.7,
    wideFerryProfile.deckY,
    passenger.species === 'sheep' ? -0.15 : 0.6 + Math.floor(stable / 2) * 0.5,
  );
}
export function shoreSeat(
  level: Level,
  id: string,
  pier: Level['piers'][number],
  delivered = false,
): Vector3 {
  const passenger = level.passengers.find((p) => p.id === id)!;
  const peers = level.passengers.filter((p) => p.species === passenger.species).sort((a, b) => a.id.localeCompare(b.id));
  const index = peers.findIndex((p) => p.id === id);
  const bank = passenger.species === 'sheep' ? 0.75 : index < 2 ? 0.62 : 1.05;
  return new Vector3(
    pier.positionXZ[0] + (index % 2 ? bank : -bank),
    pier.elevation * 0.18 + (delivered ? 0.03 : -0.005),
    pier.positionXZ[1] - (passenger.species === 'sheep' ? 3.3 : 1.85 + Math.floor(index / 2) * 0.6),
  );
}
export function wideTransferWindow(won: boolean) {
  return won ? 0.72 * 0.72 * (3 - 2 * 0.72) : 1;
}
export function wideTransferProgress(ids: string[], id: string, progress: number, window = 1) {
  const order = [...ids].sort((a, b) => a.localeCompare(b));
  const index = order.indexOf(id);
  return Math.max(0, Math.min(1, (progress / window) * order.length - index));
}
export function sampleWideTransfer(points: Vector3[], progress: number): Vector3 {
  const distances = points.slice(1).map((p, i) => p.distanceTo(points[i]));
  const total = distances.reduce((a, b) => a + b, 0);
  let distance = Math.max(0, Math.min(1, progress)) * total;
  for (let index = 0; index < distances.length; index++) {
    if (distance <= distances[index] || index === distances.length - 1)
      return points[index]
        .clone()
        .lerp(points[index + 1], distances[index] ? distance / distances[index] : 1);
    distance -= distances[index];
  }
  return points.at(-1)!.clone();
}

export function wideTransferPath(
  level: Level,
  id: string,
  pier: Level['piers'][number],
  hullMatrix: Matrix4,
  from: Vector3,
  destination: Vector3,
  board: boolean,
) {
  const profile = ferryProfile(level),
    seat = deckSeat(level, id);
  const pierY = pier.elevation * 0.18 - 0.005;
  const side =
    Math.sign(
      new Vector3(pier.positionXZ[0], pierY, pier.positionXZ[1]).applyMatrix4(
        hullMatrix.clone().invert(),
      ).x,
    ) || 1;
  const gate = new Vector3(side * profile.gateX, profile.deckY, profile.gateZ).applyMatrix4(
    hullMatrix,
  );
  const bridge = new Vector3(gate.x, pierY, pier.positionXZ[1] - 0.225);
  const shore = new Vector3(pier.positionXZ[0], pierY, pier.positionXZ[1] - 0.225);
  const shoreAisle = new Vector3(pier.positionXZ[0], pierY, board ? from.z : destination.z);
  const fore = new Vector3(0, profile.deckY, profile.gateZ).applyMatrix4(hullMatrix);
  const aisle = new Vector3(0, profile.deckY, seat.z).applyMatrix4(hullMatrix);
  const points = board
    ? [from, shoreAisle, shore, bridge, gate, fore, aisle, destination]
    : [from, aisle, fore, gate, bridge, shore, shoreAisle, destination];
  const distances = points.slice(1).map((point, index) => point.distanceTo(points[index]));
  const total = distances.reduce((a, b) => a + b, 0);
  const at = (index: number) => distances.slice(0, index).reduce((a, b) => a + b, 0) / total;
  const bridgeStart = at(3), bridgeEnd = at(4);
  const turnAt = board ? bridgeStart + (bridgeEnd - bridgeStart) * 0.35 : bridgeStart + (bridgeEnd - bridgeStart) * 0.65;
  return { points, turnAt, turnStart: board ? bridgeStart : 0, turnEnd: board ? 1 : bridgeEnd, gate, bridge };
}

export function wideTransferAngle(
  board: boolean,
  heading: number,
  progress: number,
  turnAt: number,
  turnStart = 0,
  turnEnd = 1,
) {
  const value = board
    ? Math.max(0, Math.min(1, (progress - turnStart) / (turnAt - turnStart)))
    : 1 - Math.max(0, Math.min(1, (progress - turnAt) / (turnEnd - turnAt)));
  const turn = value * value * (3 - 2 * value);
  return Math.atan2(Math.sin(heading), Math.cos(heading)) * turn;
}
