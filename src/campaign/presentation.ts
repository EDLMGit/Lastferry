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
  paused = false;
  private revealed = false;
  private interruptionGap = 0;
  constructor(
    private readonly changed: () => void,
    private readonly runChanged: (token: number | null) => void = () => {},
    private readonly cue: (token: number, cue: StoryCue) => void = () => {},
  ) {}
  start(scene: SceneId, still: boolean, now = performance.now(), restored = false) {
    this.scene = scene;
    this.shotIndex = restored ? storyScenes[scene].shots.length - 1 : 0;
    this.recap = restored;
    this.interruptionGap = 0;
    this.paused = still || restored;
    this.enter(still || restored, now);
  }
  private enter(still: boolean, now: number) {
    this.runToken++;
    this.runChanged(still || this.paused ? null : this.runToken);
    this.consumed.clear();
    this.revealed = still || this.paused;
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
    if (!shot || this.settled || this.paused) return;
    if (now - this.lastUpdate > 1000) {
      this.interruptionGap = now - this.lastUpdate;
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
    if (this.elapsed >= shot.durationMs) {
      if (!this.frame.final) this.next(false, now);
      else {
        this.settled = true;
        this.runChanged(null);
        this.changed();
      }
    }
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
    if (wholeScene) {
      this.shotIndex = 0;
      this.paused = still;
    }
    this.recap = false;
    this.enter(still, now);
    this.changed();
  }
  skip() {
    if (!this.scene) return;
    this.shotIndex = storyScenes[this.scene].shots.length - 1;
    this.recap = true;
    this.paused = true;
    this.enter(true, performance.now());
    this.changed();
  }
  get frame() {
    const shot = this.shot;
    const captionOpacity = !shot
      ? 0
      : this.settled || this.revealed
        ? 1
        : Math.max(0, Math.min(1, (this.elapsed - shot.captionCueMs) / 240));
    return {
      scene: this.scene,
      shotIndex: this.shotIndex,
      shot: shot?.id ?? null,
      elapsed: this.elapsed,
      duration: shot?.durationMs ?? 0,
      settled: this.settled,
      paused: this.paused,
      interruptionGap: this.interruptionGap,
      captionVisible: captionOpacity > 0,
      captionOpacity,
      runToken: this.runToken,
      final: !!this.scene && this.shotIndex === storyScenes[this.scene].shots.length - 1,
      recap: this.recap,
    };
  }
  pause() {
    if (!this.shot || this.paused) return;
    this.paused = true;
    this.revealed = true;
    this.runToken++;
    this.runChanged(null);
    this.changed();
  }
  resume(still: boolean, now = performance.now()) {
    if (!this.shot || still || !this.paused) return;
    this.paused = false;
    if (this.settled) {
      if (!this.frame.final) this.next(false, now);
      else this.changed();
      return;
    }
    this.startedAt = now - this.elapsed;
    this.lastUpdate = now;
    this.runToken++;
    this.runChanged(this.runToken);
    this.changed();
  }
  settle() {
    if (!this.shot || (this.settled && this.paused)) return;
    this.paused = true;
    this.revealed = true;
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
    this.paused = false;
  }
}
