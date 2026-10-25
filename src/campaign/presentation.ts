import { initial, type State } from '../game/rules';
import type { Level } from '../levels/level';

export function restoredHarbor(level: Level): State {
  return {
    ...initial(level),
    boatNodeId: level.piers.find((pier) => pier.id === level.objective.deliveryPierId)!.nodeId,
    aboard: [],
    waitingByPier: Object.fromEntries(level.piers.map((pier) => [pier.id, []])),
    delivered: level.passengers.map((passenger) => passenger.id),
    status: 'won',
  };
}

export class StoryPresentation {
  private timer: ReturnType<typeof setTimeout> | undefined;
  settled = true;
  constructor(private readonly changed: () => void) {}
  start(still: boolean) {
    this.cancel();
    this.settled = still;
    if (!still) this.timer = setTimeout(() => this.settle(), 8000);
  }
  settle() {
    this.cancel();
    this.settled = true;
    this.changed();
  }
  cancel() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}
