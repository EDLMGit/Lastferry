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
  outline.moveTo(0, -1.76);
  outline.bezierCurveTo(-0.74, -1.75, -0.83, -1.69, -0.85, -1.12);
  outline.bezierCurveTo(-0.88, -0.66, -0.92, 0.64, -0.81, 1.24);
  outline.bezierCurveTo(-0.75, 1.66, -0.37, 1.86, 0, 1.98);
  outline.bezierCurveTo(0.37, 1.86, 0.75, 1.66, 0.81, 1.24);
  outline.bezierCurveTo(0.92, 0.64, 0.88, -0.66, 0.85, -1.12);
  outline.bezierCurveTo(0.83, -1.69, 0.74, -1.75, 0, -1.76);
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
  deckY: 0.635,
  beam: 1.87,
  bow: 2.04,
  stern: 1.83,
  gateX: 0.83,
  gateZ: 0.335,
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
  if (level.id === 'orchard-landing') {
    const [x, z] = passenger.slots === 3 ? [-0.24, 1.43] : passenger.slots === 2 ? [-0.48, -0.525] : [0.55, 1.045];
    return new Vector3(x, wideFerryProfile.deckY, z);
  }
  const bank = level.passengers.filter((p) => p.slots === passenger.slots);
  const stable = bank.sort((a, b) => a.id.localeCompare(b.id)).findIndex((p) => p.id === id);
  return new Vector3(
    (stable % 2 ? 1 : -1) * (passenger.slots === 2 ? 0.48 : stable < 2 ? 0.57 : 0.45),
    wideFerryProfile.deckY,
    passenger.slots === 2 ? -0.525 : 0.93 + Math.floor(stable / 2) * 0.48,
  );
}
export function shoreSeat(
  level: Level,
  id: string,
  pier: Level['piers'][number],
  delivered = false,
): Vector3 {
  const passenger = level.passengers.find((p) => p.id === id)!;
  if (level.id === 'orchard-landing') {
    const [x, z] = passenger.slots === 3 ? [0.8, -0.6] : passenger.slots === 2 ? [-0.75, -0.62] : [-0.65, 0.18];
    return new Vector3(pier.positionXZ[0] + x, pier.elevation * 0.18 - 0.005, pier.landAnchorXZ[1] + z);
  }
  if (level.id === 'reef-return') {
    const peers = level.passengers.filter((p) => p.slots === passenger.slots)
      .sort((a, b) => a.id.localeCompare(b.id));
    const side = peers[0].id === id ? -1 : 1;
    const larger = passenger.slots === 2;
    return new Vector3(
      pier.positionXZ[0] + side * (larger ? 0.75 : -0.61),
      pier.elevation * 0.18 + (delivered ? 0.03 : -0.005),
      pier.landAnchorXZ[1] + (larger ? -0.52 : 0.30),
    );
  }
  const peers = level.passengers.filter((p) => p.species === passenger.species).sort((a, b) => a.id.localeCompare(b.id));
  const index = peers.findIndex((p) => p.id === id);
  const bank = passenger.species === 'sheep' ? 0.75 : index < 2 ? 0.62 : 1.05;
  return new Vector3(
    pier.positionXZ[0] + (index % 2 ? bank : -bank),
    pier.elevation * 0.18 + (delivered ? 0.03 : -0.005),
    pier.landAnchorXZ[1] - (passenger.species === 'sheep' ? 2.05 : 0.6 + Math.floor(index / 2) * 0.6),
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
  const gateZ = profile.gateZ;
  const gate = new Vector3(side * profile.gateX, profile.deckY, gateZ).applyMatrix4(
    hullMatrix,
  );
  const pierOverlap = level.id === 'orchard-landing' ? 0.52 : 0.25;
  const bridge = new Vector3(gate.x, pierY, pier.positionXZ[1] - pierOverlap);
  const shore = new Vector3(pier.positionXZ[0], pierY, bridge.z);
  const shoreAisle = new Vector3(pier.positionXZ[0], pierY, board ? from.z : destination.z);
  const large = level.passengers.find((p) => p.id === id)!.slots >= 2;
  const entryX = large || level.id === 'orchard-landing' ? seat.x : 0;
  const transverse = new Vector3(entryX, profile.deckY, gateZ).applyMatrix4(hullMatrix);
  const aisle = new Vector3(entryX, profile.deckY, seat.z).applyMatrix4(hullMatrix);
  const points = board
    ? [from, shoreAisle, shore, bridge, gate, transverse, aisle, destination]
    : [from, aisle, transverse, gate, bridge, shore, shoreAisle, destination];
  const distances = points.slice(1).map((point, index) => point.distanceTo(points[index]));
  const total = distances.reduce((a, b) => a + b, 0);
  const at = (index: number) => distances.slice(0, index).reduce((a, b) => a + b, 0) / total;
  const start = at(board ? 5 : 1);
  const end = at(board ? 6 : 2);
  const approach = large ? Math.min(0.23 / total, (end - start) * 0.28) : 0;
  const turning = Math.min((large ? 0.27 : 0.075) / total, (end - start - approach) * 0.7);
  const turnAt = board ? start + approach + turning : end - approach - turning;
  return { points, turnAt, turnStart: board ? start + approach : 0, turnEnd: board ? 1 : end - approach, gate, bridge };
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
