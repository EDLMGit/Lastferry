type RecordStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Some storage providers report failure after committing the write. */
export function writeConfirmed(storage: RecordStorage, key: string, value: string) {
  try {
    storage.setItem(key, value);
    if (storage.getItem(key) === value) return;
  } catch {
    // Confirm exact bytes once more before reporting an unsaved result.
  }
  if (storage.getItem(key) !== value) throw new Error('Result could not be saved.');
}

interface SaveHost {
  localStorage: RecordStorage;
  lastFerrySaves?: {
    read(key: string): string | null | undefined;
    write(key: string, value: string): boolean;
  };
}

// Installed WebView storage can acknowledge writes before they reach disk.
// The Android shell can confirm the core record synchronously. An installation
// without a native record continues to read the original v0.1.3 bytes.
export function storageForRecord(recordKey: string, host: SaveHost = window): RecordStorage {
  const native = host.lastFerrySaves;
  if (!native) return host.localStorage;

  function mirror(value: string) {
    try {
      if (host.localStorage.getItem(recordKey) !== value) host.localStorage.setItem(recordKey, value);
    } catch {
      // The confirmed native copy remains readable even when the mirror is full.
    }
  }

  return {
    getItem(key) {
      if (key !== recordKey) return host.localStorage.getItem(key);
      const saved = native.read(key);
      // Android WebView exposes a null Java String as JavaScript undefined.
      if (saved == null) return host.localStorage.getItem(key);
      mirror(saved);
      return saved;
    },
    setItem(key, value) {
      if (key !== recordKey) {
        host.localStorage.setItem(key, value);
        return;
      }
      if (!native.write(key, value)) throw new Error('Android could not save this record.');
      mirror(value);
    },
  };
}
