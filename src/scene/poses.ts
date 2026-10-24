import type { Action, State } from '../game/rules';
import { edgeTo } from '../game/rules';
import type { Level } from '../levels/level';
import { berthHeading, initialHeading, planJourney, type JourneyPlan } from './motion';
import { getLevelPaths, samplePath } from './paths';

export class PresentationPoses {
  heading: number;
  readonly history: number[] = [];
  journey: JourneyPlan | null = null;
  private paths;

  constructor(private level: Level) {
    this.paths = getLevelPaths(level);
    this.heading = initialHeading(level);
  }

  accept(before: State, action: Action) {
    const from = this.heading;
    let journey: JourneyPlan | null = null;
    if (action.type === 'move') {
      const edge = edgeTo(before, action.to, this.level)!;
      const path = this.paths.get(edge.id)!;
      const reverse = edge.nodes[0] !== before.boatNodeId;
      const incoming = samplePath(path, path.length, reverse).angle;
      journey = planJourney(path, from, reverse, {
        fromBerth: berthHeading(this.level, before.boatNodeId, from) ?? undefined,
        toBerth: berthHeading(this.level, action.to, incoming) ?? undefined,
      });
    }
    this.history.push(from);
    this.journey = journey;
    this.heading = journey?.toAngle ?? from;
  }

  undo() {
    const heading = this.history.pop();
    if (heading === undefined) return false;
    this.heading = heading;
    this.journey = null;
    return true;
  }

  reset() {
    this.heading = initialHeading(this.level);
    this.history.length = 0;
    this.journey = null;
  }

  presentation() {
    return {
      heading: this.heading,
      history: [...this.history],
      next: this.journey
        ? {
            fromAngle: this.journey.fromAngle,
            toAngle: this.journey.toAngle,
            reverse: this.journey.reverse,
          }
        : null,
    };
  }
}
