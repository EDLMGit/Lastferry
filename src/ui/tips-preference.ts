type TipsStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const tipsStorageKey = 'last-ferry-tips';

function availableStorage(): TipsStorage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export class TipsPreference {
  private current = false;

  constructor(private readonly storage: TipsStorage | undefined = availableStorage()) {
    try {
      this.current = storage?.getItem(tipsStorageKey) === 'true';
    } catch {
      this.current = false;
    }
  }

  get enabled(): boolean {
    return this.current;
  }

  setEnabled(enabled: boolean): void {
    this.current = enabled;
    try {
      this.storage?.setItem(tipsStorageKey, String(enabled));
    } catch {}
  }
}
