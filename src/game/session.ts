import { copy, initial, reduce, type State, type Action } from './rules';
import { level as baseline, type Level } from '../levels/level';
/** Presentation lock is independent of turn resolution. No queued inputs. */
export class Session {
  state: State;
  history: State[] = [];
  busy = false;
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
    this.busy = true;
    return { before, after: copy(next) };
  }
  finish() {
    this.busy = false;
  }
  undo() {
    if (this.busy || !this.history.length) return false;
    this.state = this.history.pop()!;
    return true;
  }
  restart() {
    if (this.busy) return false;
    this.state = initial(this.level);
    this.history = [];
    return true;
  }
}
