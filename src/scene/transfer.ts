import type { Action, State } from '../game/rules';

export type TransferStage = 'crossing' | 'settling' | 'compact';
export type TransferCue = {
  passengerIds: string[];
  stage: TransferStage;
  progress: number;
  reduced: boolean;
};
type ContactRecord = {
  stage: TransferStage;
  progress: number | null;
  outcome: 'emitted' | 'stale' | 'cancelled';
};

export class TransferTimeline {
  readonly passengerIds: string[];
  readonly action: 'board' | 'unload';
  private cursor = 0;
  private records: ContactRecord[] = [];
  private marks: { stage: TransferStage; at: number; until: number }[];

  private constructor(
    action: 'board' | 'unload',
    passengerIds: string[],
    readonly reduced: boolean,
  ) {
    this.action = action;
    this.passengerIds = passengerIds;
    this.marks = reduced
      ? [{ stage: 'compact', at: 0, until: 1 }]
      : action === 'board'
        ? [
            { stage: 'crossing', at: 0.5, until: 0.62 },
            { stage: 'settling', at: 0.75, until: 0.87 },
          ]
        : [{ stage: 'crossing', at: 0.25, until: 0.37 }];
  }

  static create(before: State, after: State, action: Action, reduced: boolean) {
    if (action.type !== 'board' && action.type !== 'unload') return null;
    const passengerIds = [...new Set(action.passengerIds)].filter((id) =>
      action.type === 'board'
        ? !before.aboard.includes(id) && after.aboard.includes(id)
        : before.aboard.includes(id) && !after.aboard.includes(id),
    );
    return passengerIds.length ? new TransferTimeline(action.type, passengerIds, reduced) : null;
  }

  advance(progress: number): TransferCue | null {
    const t = Math.max(0, Math.min(1, progress));
    let cue: TransferCue | null = null;
    while (this.cursor < this.marks.length && t >= this.marks[this.cursor].at) {
      const mark = this.marks[this.cursor++];
      const stale = t > mark.until;
      this.records.push({ stage: mark.stage, progress: t, outcome: stale ? 'stale' : 'emitted' });
      if (!stale)
        cue = {
          passengerIds: [...this.passengerIds],
          stage: mark.stage,
          progress: t,
          reduced: this.reduced,
        };
    }
    return cue;
  }

  cancel() {
    while (this.cursor < this.marks.length)
      this.records.push({
        stage: this.marks[this.cursor++].stage,
        progress: null,
        outcome: 'cancelled',
      });
  }

  presentation() {
    return {
      action: this.action,
      passengerIds: [...this.passengerIds],
      reduced: this.reduced,
      pending: this.marks.length - this.cursor,
      records: this.records.map((record) => ({ ...record })),
    };
  }
}
