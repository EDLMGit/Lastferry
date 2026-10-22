import { MathUtils, Vector3 } from 'three';
import { buildPath, samplePath, type CanonicalPath } from './paths';

const legacyPaths = new WeakMap<Vector3[], CanonicalPath>();

export function sampleJourney(
  input: CanonicalPath | Vector3[],
  progress: number,
  fromAngle = Math.PI / 2,
  reverse = false,
) {
  let path: CanonicalPath;
  if (Array.isArray(input)) {
    const cached = legacyPaths.get(input);
    path = cached ?? buildPath(input);
    if (!cached) legacyPaths.set(input, path);
  } else path = input;
  const t = Number.isFinite(progress) ? MathUtils.clamp(progress, 0, 1) : 0,
    eased = t * t * (3 - 2 * t),
    pose = samplePath(path, eased * path.length, reverse);
  if (!path.length) return { ...pose, angle: fromAngle };
  const initial = path.headings[reverse ? path.headings.length - 1 : 0] + (reverse ? Math.PI : 0),
    winding = Math.round((fromAngle - initial) / (Math.PI * 2)) * Math.PI * 2,
    clearance = Math.min(pose.distance, path.length - pose.distance),
    turn = MathUtils.clamp((clearance - 0.45) / 0.55, 0, 1),
    blend = turn * turn * (3 - 2 * turn);
  return { ...pose, angle: fromAngle + (pose.angle + winding - fromAngle) * blend };
}
