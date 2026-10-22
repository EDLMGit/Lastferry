import type { Action } from '../game/rules';

export type JourneyTiming = { base: number; perUnit: number; minimum: number; maximum: number };
export const slowerTiming: JourneyTiming = {
  base: 900,
  perUnit: 150,
  minimum: 1400,
  maximum: 2400,
};
export const restrainedTiming: JourneyTiming = {
  base: 800,
  perUnit: 140,
  minimum: 1200,
  maximum: 2300,
};
export const journeyTiming = restrainedTiming;
export type CompletionReason = 'complete' | 'recovery' | 'visibility' | 'cancelled' | 'error';
export type TransitionPlan = { duration: number; tideDuration: number; recoveryDelay: number };

export function transitionPlan(
  action: Action,
  won: boolean,
  pathLength: number,
  reduced: boolean,
  timing: JourneyTiming = journeyTiming,
): TransitionPlan {
  const length = Number.isFinite(pathLength) ? Math.max(0, pathLength) : 0;
  const duration = reduced
    ? 30
    : action.type === 'move'
      ? Math.min(timing.maximum, Math.max(timing.minimum, timing.base + timing.perUnit * length))
      : action.type === 'unload' && won
        ? 900
        : 520;
  return { duration, tideDuration: Math.min(duration, 550), recoveryDelay: duration + 1000 };
}

export function journeyProgress(progress: number) {
  const t = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const ramp = 0.19;
  const departure = (time: number) => {
    const x = time / ramp;
    return (ramp * (x ** 3 - x ** 4 / 2)) / (1 - ramp);
  };
  if (t < ramp) return departure(t);
  if (t > 1 - ramp) return 1 - departure(1 - t);
  return (t - ramp / 2) / (1 - ramp);
}

export function settlingProgress(
  elapsed: number,
  plan: Pick<TransitionPlan, 'duration' | 'tideDuration'>,
) {
  const start = Math.max(0, plan.duration - plan.tideDuration);
  return Math.min(1, Math.max(0, (elapsed - start) / plan.tideDuration));
}
