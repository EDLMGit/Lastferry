import { MathUtils, Vector3 } from 'three';
export function sampleJourney(path: Vector3[], progress: number, fromAngle = Math.PI / 2) {
  const k = progress * progress * (3 - 2 * progress);
  const lens = path.slice(1).map((p, i) => p.distanceTo(path[i]));
  const total = lens.reduce((a, b) => a + b, 0);
  let distance = k * total,
    idx = 0;
  while (idx < lens.length - 1 && distance > lens[idx]) distance -= lens[idx++];
  const local = Math.min(1, distance / lens[idx]),
    position = new Vector3().lerpVectors(path[idx], path[idx + 1], local);
  const direction = path[idx + 1].clone().sub(path[idx]);
  let target = Math.atan2(direction.x, direction.z);
  if (idx < lens.length - 1 && local > 0.82) {
    const next = path[idx + 2].clone().sub(path[idx + 1]),
      nextAngle = Math.atan2(next.x, next.z);
    target +=
      ((Math.atan2(Math.sin(nextAngle - target), Math.cos(nextAngle - target)) * (local - 0.82)) /
        0.18) *
      0.5;
  }
  if (idx > 0 && local < 0.18) {
    const prev = path[idx].clone().sub(path[idx - 1]),
      prevAngle = Math.atan2(prev.x, prev.z);
    target +=
      Math.atan2(Math.sin(prevAngle - target), Math.cos(prevAngle - target)) *
      (1 - local / 0.18) *
      0.5;
  }
  // Clear the jetty broadside before turning; settle broadside before returning.
  const clearance = Math.min(k * total, (1 - k) * total);
  const turn = MathUtils.clamp((clearance - 0.45) / 0.55, 0, 1);
  const blend = turn * turn * (3 - 2 * turn);
  const angle =
    fromAngle + Math.atan2(Math.sin(target - fromAngle), Math.cos(target - fromAngle)) * blend;
  return { position, angle };
}
