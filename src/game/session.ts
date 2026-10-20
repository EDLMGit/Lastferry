import { copy, initial, reduce, type State, type Action } from './rules';
/** Presentation lock is independent of turn resolution. No queued inputs. */
export class Session {
  state: State = initial();
  history: State[] = [];
  busy = false;
  commit(a: Action): { before: State; after: State } | null {
    if (this.busy) return null;
    const next = reduce(this.state, a);
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
    this.state = initial();
    this.history = [];
    return true;
  }
}
