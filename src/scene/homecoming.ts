export type HomecomingRectangle = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type HomecomingPose = {
  height: number;
  pitch: number;
};

export function acknowledgmentPose(
  species: string,
  index: number,
  elapsed: number,
): HomecomingPose {
  const start = 100 + index * 140;
  const duration = species === 'rabbit' ? 520 : 760;
  const progress = (elapsed - start) / duration;
  if (progress <= 0 || progress >= 1) return { height: 0, pitch: 0 };
  const arc = Math.sin(progress * Math.PI);
  return species === 'rabbit'
    ? { height: arc * 0.17, pitch: Math.sin(progress * Math.PI * 2) * 0.045 }
    : { height: arc * 0.035, pitch: Math.sin(progress * Math.PI * 2) * 0.028 };
}

export class HomecomingTimeline {
  active = false;
  finite = false;
  startedAt: number | null = null;
  celebrations = 0;
  settled = false;
  reason = 'ordinary';
  start(time: number, reduced: boolean) {
    if (this.active) return false;
    this.active = true;
    this.finite = !reduced;
    this.startedAt = time;
    this.celebrations++;
    this.settled = reduced;
    this.reason = reduced ? 'reduced-motion' : 'arrival';
    return true;
  }
  update(time: number) {
    if (this.finite && this.startedAt !== null && time - this.startedAt >= 1300)
      this.settle('complete');
  }
  settle(reason = 'recovery') {
    if (!this.active) return;
    this.finite = false;
    this.settled = true;
    this.reason = reason;
  }
  restore() {
    this.active = true;
    this.finite = false;
    this.startedAt = null;
    this.settled = true;
    this.reason = 'restored';
  }
  reset() {
    this.active = false;
    this.finite = false;
    this.startedAt = null;
    this.settled = false;
    this.reason = 'ordinary';
  }
  elapsed(time: number) {
    return this.startedAt === null ? 0 : Math.max(0, time - this.startedAt);
  }
}

export function rectanglesOverlap(a: HomecomingRectangle, b: HomecomingRectangle, gap = 0) {
  return (
    a.left < b.right + gap &&
    a.right > b.left - gap &&
    a.top < b.bottom + gap &&
    a.bottom > b.top - gap
  );
}
