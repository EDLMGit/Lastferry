import { MathUtils, Vector3 } from 'three';
import type { Level } from '../levels/level';
import { buildPath, samplePath, type CanonicalPath } from './paths';
import { journeyProgress } from './transitions';

const legacyPaths = new WeakMap<Vector3[], CanonicalPath>();
const turn = Math.PI * 2;

export type JourneyPlan = {
  path: CanonicalPath;
  reverse: boolean;
  fromAngle: number;
  toAngle: number;
  courseOffset: number;
  initialCourseAngle: number;
  departureTurn: number;
  fromBerth: boolean;
  toBerth: boolean;
};

function smooth(value: number) {
  const x = MathUtils.clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

export function angularChange(from: number, to: number) {
  const delta = ((((to - from + Math.PI) % turn) + turn) % turn) - Math.PI;
  return Math.abs(delta + Math.PI) < 1e-10 ? Math.PI : delta;
}

export function berthHeading(level: Level, nodeId: string, incoming: number): number | null {
  const node = level.nodes.find((candidate) => candidate.id === nodeId);
  const pier = level.piers.find(
    (candidate) => candidate.id === node?.pierId && candidate.nodeId === nodeId,
  );
  if (!pier) return null;
  const axis =
    Math.atan2(
      pier.positionXZ[0] - pier.landAnchorXZ[0],
      pier.positionXZ[1] - pier.landAnchorXZ[1],
    ) +
    Math.PI / 2;
  const first = angularChange(incoming, axis),
    opposite = angularChange(incoming, axis + Math.PI);
  return incoming + (Math.abs(first) <= Math.abs(opposite) ? first : opposite);
}

export function initialHeading(level: Level) {
  return berthHeading(level, level.start.boatNodeId, Math.PI / 2) ?? Math.PI / 2;
}

export function planJourney(
  path: CanonicalPath,
  fromAngle: number,
  reverse = false,
  berths: { fromBerth?: number; toBerth?: number } = {},
): JourneyPlan {
  const rawInitial = samplePath(path, 0, reverse).angle,
    initialCourseAngle = fromAngle + angularChange(fromAngle, rawInitial),
    courseOffset = initialCourseAngle - rawInitial,
    finalCourseAngle = samplePath(path, path.length, reverse).angle + courseOffset,
    fromBerth = berths.fromBerth !== undefined,
    toBerth = berths.toBerth !== undefined,
    toAngle = !path.length
      ? fromAngle
      : toBerth
        ? finalCourseAngle + angularChange(finalCourseAngle, berths.toBerth!)
        : finalCourseAngle,
    departureTurn = fromBerth ? 0 : (Math.abs(initialCourseAngle - fromAngle) / Math.PI) * 0.22;
  return {
    path,
    reverse,
    fromAngle,
    toAngle,
    courseOffset,
    initialCourseAngle,
    departureTurn,
    fromBerth,
    toBerth,
  };
}

export function sampleJourney(
  input: JourneyPlan | CanonicalPath | Vector3[],
  progress: number,
  fromAngle = Math.PI / 2,
  reverse = false,
) {
  let plan: JourneyPlan;
  if ('path' in input) plan = input;
  else {
    let path: CanonicalPath;
    if (Array.isArray(input)) {
      const cached = legacyPaths.get(input);
      path = cached ?? buildPath(input);
      if (!cached) legacyPaths.set(input, path);
    } else path = input;
    plan = planJourney(path, fromAngle, reverse);
  }
  const { path } = plan,
    t = Number.isFinite(progress) ? MathUtils.clamp(progress, 0, 1) : 0,
    travel = MathUtils.clamp((t - plan.departureTurn) / (1 - plan.departureTurn), 0, 1),
    pose = samplePath(path, journeyProgress(travel) * path.length, plan.reverse);
  if (!path.length || t === 0) return { ...pose, angle: plan.fromAngle };
  if (t === 1) return { ...pose, angle: plan.toAngle };
  if (t < plan.departureTurn)
    return {
      ...pose,
      angle:
        plan.fromAngle +
        (plan.initialCourseAngle - plan.fromAngle) * smooth(t / plan.departureTurn),
    };
  const courseAngle = pose.angle + plan.courseOffset,
    departure = plan.fromBerth ? smooth((pose.distance - 0.45) / 0.55) : 1,
    approach = plan.toBerth ? 1 - smooth((path.length - pose.distance - 0.45) / 0.55) : 0,
    steering = plan.fromAngle + (courseAngle - plan.fromAngle) * departure;
  return { ...pose, angle: steering + (plan.toAngle - steering) * approach };
}
