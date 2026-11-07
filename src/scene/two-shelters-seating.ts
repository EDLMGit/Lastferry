import { Matrix4, Vector3 } from 'three';
import type { Level } from '../levels/level';
import { deckSeat } from './ferry-profile';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const largeNeighbors = (level: Level) =>
  level.passengers
    .filter((passenger) => passenger.slots === 2)
    .sort((a, b) => b.id.localeCompare(a.id));

export function shelterDeckSeat(level: Level, id: string, aboard: readonly string[]) {
  const passenger = level.passengers.find((passenger) => passenger.id === id)!;
  const large = largeNeighbors(level);
  return passenger.id === large[1]?.id && aboard.includes(large[0].id)
    ? new Vector3(0, 0.26, 0.045)
    : deckSeat(level, id);
}

export function shelterAnchorDuring(
  level: Level,
  id: string,
  before: readonly string[],
  after: readonly string[],
  progress: number,
) {
  const from = shelterDeckSeat(level, id, before);
  const to = shelterDeckSeat(level, id, after);
  if (progress >= 1 || !before.includes(id)) return to;
  if (!after.includes(id)) return from;
  const movingForward = to.z < from.z;
  return from.lerp(to, smooth(movingForward ? progress / 0.16 : (progress - 0.84) / 0.16));
}

export function shelterTransferProgress(
  level: Level,
  id: string,
  before: readonly string[],
  after: readonly string[],
  progress: number,
) {
  const board = after.includes(id);
  const selected = level.passengers.filter(
    (passenger) => before.includes(passenger.id) !== after.includes(passenger.id),
  );
  const large = largeNeighbors(level);
  const rank = (id: string) => (id === large[0]?.id ? 2 : id === large[1]?.id ? 1 : 0);
  selected.sort((a, b) => (rank(a.id) - rank(b.id)) * (board ? 1 : -1) || a.id.localeCompare(b.id));
  const beaver = large[1];
  const shifts =
    beaver && before.includes(beaver.id) && after.includes(beaver.id)
      ? shelterDeckSeat(level, beaver.id, after).z - shelterDeckSeat(level, beaver.id, before).z
      : 0;
  const start = shifts < 0 ? 0.16 : 0;
  const end = shifts > 0 ? 0.84 : 1;
  return smooth(
    clamp((progress - start) / (end - start)) * selected.length -
      selected.findIndex((passenger) => passenger.id === id),
  );
}

export function shelterTransferEntry(level: Level, id: string, aboard: readonly string[]) {
  const passenger = level.passengers.find((passenger) => passenger.id === id)!;
  if (passenger.species === 'rabbit')
    return { z: shelterDeckSeat(level, id, aboard).z, side: 0.51, bridgeAdvance: 0.46 };
  const seat = shelterDeckSeat(level, id, aboard);
  return { z: seat.z, side: 0.45, bridgeAdvance: 0.1 };
}

export function shelterShoreSeat(
  level: Level,
  id: string,
  pier: Level['piers'][number],
  delivered = false,
) {
  const passenger = level.passengers.find((passenger) => passenger.id === id)!;
  const x =
    passenger.species === 'rabbit'
      ? 0
      : passenger.id === largeNeighbors(level)[0]?.id
        ? -0.35
        : 0.35;
  return new Vector3(
    pier.positionXZ[0] + x,
    pier.elevation * 0.18 + (delivered ? 0.03 : -0.005),
    pier.positionXZ[1] - (passenger.species === 'rabbit' ? 0.16 : 0.9),
  );
}

export function shelterTransferPose(
  level: Level,
  id: string,
  aboard: readonly string[],
  pier: Level['piers'][number],
  hullMatrix: Matrix4,
  from: Vector3,
  destination: Vector3,
  board: boolean,
  heading: number,
  progress: number,
) {
  const passenger = level.passengers.find((passenger) => passenger.id === id)!;
  const shore = board ? from : destination;
  const entry = shelterTransferEntry(level, id, aboard);
  const side =
    Math.sign(
      new Vector3(pier.positionXZ[0], pier.elevation * 0.18, pier.positionXZ[1]).applyMatrix4(
        hullMatrix.clone().invert(),
      ).x,
    ) || 1;
  const gate = new Vector3(side * entry.side, 0.26, entry.z).applyMatrix4(hullMatrix);
  const corridor = new Vector3(0, 0.26, entry.z).applyMatrix4(hullMatrix);
  const shoreY = pier.elevation * 0.18 - 0.005;
  const laneX =
    pier.positionXZ[0] +
    (passenger.species === 'rabbit'
      ? 0
      : passenger.id === largeNeighbors(level)[0]?.id
        ? -0.5
        : 0.5);
  const laneBack = new Vector3(laneX, shoreY, shore.z);
  const laneFront = new Vector3(laneX, shoreY, pier.positionXZ[1] + 0.42);
  const bridgeReach = Math.max(0, pier.width / 2 - 0.32);
  const bridge = new Vector3(
    Math.max(pier.positionXZ[0] - bridgeReach, Math.min(pier.positionXZ[0] + bridgeReach, gate.x)),
    shoreY,
    laneFront.z,
  );
  const points = board
    ? [from, laneBack, laneFront, bridge, gate, corridor, destination]
    : [from, corridor, gate, bridge, laneFront, laneBack, destination];
  const marks = board ? [0, 0.12, 0.36, 0.5, 0.67, 0.81, 1] : [0, 0.1, 0.2, 0.34, 0.48, 0.85, 1];
  const t = clamp(progress);
  const end = marks.findIndex((mark) => mark > t);
  const index = end < 0 ? points.length - 2 : Math.max(0, end - 1);
  const position = points[index]
    .clone()
    .lerp(points[index + 1], (t - marks[index]) / (marks[index + 1] - marks[index]));
  const turn = board ? smooth((t - 0.5) / 0.17) : 1 - smooth((t - 0.2) / 0.14);
  return { position, angle: Math.atan2(Math.sin(heading), Math.cos(heading)) * turn, bridge, gate };
}
