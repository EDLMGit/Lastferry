export type MotionMode = 'device' | 'reduced';

type MotionQuery = Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>;
type MotionStorage = Pick<Storage, 'getItem' | 'setItem'>;
type Listener = (reduced: boolean, mode: MotionMode) => void;

export const motionStorageKey = 'last-ferry-motion';

function availableStorage(): MotionStorage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export class MotionPreference {
  private currentMode: MotionMode = 'device';
  private currentReduced: boolean;
  private readonly listeners = new Set<Listener>();
  private disposed = false;

  constructor(
    private readonly query: MotionQuery,
    private readonly storage: MotionStorage | undefined = availableStorage(),
  ) {
    try {
      if (storage?.getItem(motionStorageKey) === 'reduced') {
        this.currentMode = 'reduced';
      }
    } catch {
      this.currentMode = 'device';
    }
    this.currentReduced = this.resolve();
    query.addEventListener('change', this.onDeviceChange);
  }

  get mode(): MotionMode {
    return this.currentMode;
  }

  get reduced(): boolean {
    return this.currentReduced;
  }

  setMode(mode: MotionMode): void {
    if (this.disposed) return;
    const nextMode = mode === 'reduced' ? 'reduced' : 'device';
    const modeChanged = nextMode !== this.currentMode;
    this.currentMode = nextMode;
    try {
      this.storage?.setItem(motionStorageKey, nextMode);
    } catch {}
    this.update(modeChanged);
  }

  subscribe(listener: Listener): () => void {
    if (!this.disposed) this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.query.removeEventListener('change', this.onDeviceChange);
    this.listeners.clear();
  }

  private readonly onDeviceChange = (): void => {
    this.update(false);
  };

  private resolve(): boolean {
    return this.currentMode === 'reduced' || this.query.matches;
  }

  private update(modeChanged: boolean): void {
    const reduced = this.resolve();
    if (!modeChanged && reduced === this.currentReduced) return;
    this.currentReduced = reduced;
    for (const listener of this.listeners) {
      listener(this.currentReduced, this.currentMode);
    }
  }
}
