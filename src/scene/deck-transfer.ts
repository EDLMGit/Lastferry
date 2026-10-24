import { Vector3 } from 'three';

export const deckEntryZ = 0.28;
export const bridgeBowOffset = 0.3;
export const firstRabbitDeckZ = 0.1;

export function sampleDeckTransfer(
  board: boolean,
  from: Vector3,
  bridge: Vector3,
  gate: Vector3,
  corridor: Vector3,
  land: Vector3,
  destination: Vector3,
  progress: number,
) {
  const marks = board ? [0, 0.5, 0.67, 0.81, 1] : [0, 0.09, 0.19, 1 / 3, 2 / 3, 1];
  const points = board
    ? [from, bridge, gate, corridor, destination]
    : [from, corridor, gate, bridge, land, destination];
  const p = Math.min(1, Math.max(0, progress));
  const index = Math.min(marks.length - 2, marks.findIndex((mark) => mark > p) - 1);
  if (index < 0) return destination.clone();
  return new Vector3().lerpVectors(
    points[index],
    points[index + 1],
    (p - marks[index]) / (marks[index + 1] - marks[index]),
  );
}

export function transferHeading(board: boolean, heading: number, progress: number) {
  const angle = Math.atan2(Math.sin(heading), Math.cos(heading));
  const turn = board
    ? Math.min(1, Math.max(0, progress / 0.5))
    : 1 - Math.min(1, Math.max(0, (progress - 1 / 3) / (2 / 3)));
  return angle * turn;
}
