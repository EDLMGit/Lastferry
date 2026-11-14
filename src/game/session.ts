import { copy, initial, reduce, type State, type Action } from './rules';
import { level as baseline, type Level } from '../levels/level';
import { resultFor } from './mastery';
export class Session {
  state: State;
  history: State[] = [];
  busy = false;
  successfulUndos = 0;
  private committedWin: State | null = null;
  private accepted = false;
  constructor(public level: Level = baseline) {
    this.state = initial(level);
  }
  commit(a: Action): { before: State; after: State } | null {
    if (this.busy) return null;
    const next = reduce(this.state, a, this.level);
    if (next === this.state) return null;
    const before = copy(this.state);
    this.history.push(before);
    this.state = next;
    this.committedWin = next.status === 'won' ? next : null;
    this.busy = true;
    return { before, after: copy(next) };
  }
  finish() {
    this.busy = false;
  }
  get result() {
    return !this.busy && !this.accepted && this.state.status === 'won' && this.state === this.committedWin
      ? resultFor(this.level.id, this.state.turn, this.successfulUndos)
      : null;
  }
  takeResult() {
    const result = this.result;
    if (result) this.accepted = true;
    return result;
  }
  undo() {
    if (this.busy || !this.history.length) return false;
    this.state = this.history.pop()!;
    this.successfulUndos++;
    this.committedWin = null;
    return true;
  }
  restart() {
    if (this.busy) return false;
    this.state = initial(this.level);
    this.history = [];
    this.successfulUndos = 0;
    this.committedWin = null;
    this.accepted = false;
    return true;
  }
}
