import { initial, type State } from '../game/rules';
import type { Level } from '../levels/level';
import { storyScenes, type SceneId } from './registry';

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
  private scene: SceneId | null = null;
  private startedAt = 0;
  private elapsed = 0;
  settled = true;
  constructor(private readonly changed: () => void) {}
  start(scene: SceneId, still: boolean, now = performance.now()) {
    this.cancel();
    this.scene = scene;
    this.startedAt = now;
    this.settled = still;
    this.elapsed = still ? storyScenes[scene].duration : 0;
  }
  update(now = performance.now()) {
    if (!this.scene || this.settled) return;
    this.elapsed = Math.max(this.elapsed, Math.max(0, now - this.startedAt));
    if (this.elapsed >= storyScenes[this.scene].duration) this.settle();
  }
  get frame() {
    return {
      scene: this.scene,
      elapsed: this.elapsed,
      duration: this.scene ? storyScenes[this.scene].duration : 0,
      settled: this.settled,
    };
  }
  settle() {
    if (!this.scene || this.settled) return;
    this.elapsed = storyScenes[this.scene].duration;
    this.settled = true;
    this.changed();
  }
  cancel() {
    this.scene = null;
    this.elapsed = 0;
    this.settled = true;
  }
}
