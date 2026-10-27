import { initial, type State } from '../game/rules';
import type { Level } from '../levels/level';
import { storyScenes, type SceneId, type StoryCue } from './registry';

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
  private shotIndex = 0;
  private startedAt = 0;
  private lastUpdate = 0;
  private elapsed = 0;
  private runToken = 0;
  private consumed = new Set<string>();
  private recap = false;
  settled = true;
  constructor(
    private readonly changed: () => void,
    private readonly runChanged: (token: number | null) => void = () => {},
    private readonly cue: (token: number, cue: StoryCue) => void = () => {},
  ) {}
  start(scene: SceneId, still: boolean, now = performance.now(), restored = false) {
    this.scene = scene;
    this.shotIndex = restored ? storyScenes[scene].shots.length - 1 : 0;
    this.recap = restored;
    this.enter(still || restored, now);
  }
  private enter(still: boolean, now: number) {
    this.runToken++;
    this.runChanged(still ? null : this.runToken);
    this.consumed.clear();
    this.startedAt = now;
    this.lastUpdate = now;
    this.settled = still;
    this.elapsed = still ? this.shot!.durationMs : 0;
  }
  private get shot() {
    return this.scene ? storyScenes[this.scene].shots[this.shotIndex] : null;
  }
  update(now = performance.now()) {
    const shot = this.shot;
    if (!shot || this.settled) return;
    if (now - this.lastUpdate > 1000) {
      this.settle();
      return;
    }
    this.lastUpdate = Math.max(this.lastUpdate, now);
    this.elapsed = Math.min(shot.durationMs, Math.max(this.elapsed, now - this.startedAt, 0));
    for (const cue of shot.cues) {
      if (this.elapsed < cue.atMs || this.consumed.has(cue.id)) continue;
      this.consumed.add(cue.id);
      if (this.elapsed - cue.atMs <= 250) this.cue(this.runToken, cue);
    }
    if (this.elapsed >= shot.durationMs) this.settle();
  }
  next(still: boolean, now = performance.now()) {
    if (!this.scene || this.frame.final) return false;
    this.shotIndex++;
    this.recap = false;
    this.enter(still, now);
    this.changed();
    return true;
  }
  replay(still: boolean, wholeScene = false, now = performance.now()) {
    if (!this.scene) return;
    if (wholeScene) this.shotIndex = 0;
    this.recap = false;
    this.enter(still, now);
    this.changed();
  }
  skip() {
    if (!this.scene) return;
    this.shotIndex = storyScenes[this.scene].shots.length - 1;
    this.recap = true;
    this.enter(true, performance.now());
    this.changed();
  }
  get frame() {
    const shot = this.shot;
    const captionOpacity = !shot
      ? 0
      : this.settled
        ? 1
        : Math.max(0, Math.min(1, (this.elapsed - shot.captionCueMs) / 240));
    return {
      scene: this.scene,
      shotIndex: this.shotIndex,
      shot: shot?.id ?? null,
      elapsed: this.elapsed,
      duration: shot?.durationMs ?? 0,
      settled: this.settled,
      captionVisible: captionOpacity > 0,
      captionOpacity,
      runToken: this.runToken,
      final: !!this.scene && this.shotIndex === storyScenes[this.scene].shots.length - 1,
      recap: this.recap,
    };
  }
  settle() {
    if (!this.shot || this.settled) return;
    this.elapsed = this.shot.durationMs;
    this.settled = true;
    this.runToken++;
    this.runChanged(null);
    this.changed();
  }
  cancel() {
    this.runToken++;
    this.runChanged(null);
    this.scene = null;
    this.elapsed = 0;
    this.settled = true;
    this.recap = false;
  }
}
