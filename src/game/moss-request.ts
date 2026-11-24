import type { State } from './rules';
import type { MasteryStorage } from './mastery';
import { storageForRecord } from './save-storage';

export const MOSS_REQUEST = 'Take Pip and Rue home first. I can wait at Stone Pier.';
export const MOSS_ENTRY_TITLE = 'Moss’s Own Crossing';
export const HARBOR_LOG_KEY = 'last-ferry.harbor-log.v1';

// Each first delivery must happen while Moss is at Stone, even if the rabbits
// travel separately. A later stop at Stone cannot qualify an earlier delivery.
export function rabbitsCameHomeFirst(history: readonly State[]): boolean {
  return ['rabbit-1', 'rabbit-2'].every(id => {
    const arrival = history.find(state => state.delivered.includes(id));
    return arrival?.waitingByPier['stone-pier']?.includes('sheep-1') === true;
  });
}

// Keepsakes survive replacing a Journey. Neither one implies a lantern rating.
// Unknown bytes (including a future format) stay intact on disk.
type Keepsake = 'rue-lantern' | 'moss-own-crossing';
function readEntries(raw: string | null): Keepsake[] {
  if (raw === null) return [];
  const record = JSON.parse(raw);
  if (record?.version !== 1 || !Array.isArray(record.entries) || Object.keys(record).length !== 2 ||
    record.entries.length > 2 || !record.entries.every((id: unknown) => id === 'rue-lantern' || id === 'moss-own-crossing'))
    throw new Error('Unrecognized Harbor entry');
  return record.entries;
}

export class HarborEntryStore {
  private entries = new Set<Keepsake>();
  private unsaved = false;
  issue: string | null = null;

  constructor(private getStorage: () => MasteryStorage = () => storageForRecord(HARBOR_LOG_KEY)) {
    try {
      this.entries = new Set(readEntries(this.getStorage().getItem(HARBOR_LOG_KEY)));
    } catch {
      this.issue = 'The saved Harbor log could not be read. New entries last for this visit.';
    }
  }

  get mossEarned() {
    return this.entries.has('moss-own-crossing');
  }

  get holdingRescued() {
    return this.entries.has('rue-lantern');
  }

  keep(entry: Keepsake) {
    if (!this.entries.has(entry)) {
      this.entries.add(entry);
      this.unsaved = true;
    }
    this.retry();
  }

  retry() {
    if (!this.unsaved && !this.issue) return;
    try {
      const storage = this.getStorage();
      const saved = readEntries(storage.getItem(HARBOR_LOG_KEY));
      for (const id of saved) this.entries.add(id);
      if ([...this.entries].some(id => !saved.includes(id))) {
        const raw = JSON.stringify({ version: 1, entries: [...this.entries].sort() });
        storage.setItem(HARBOR_LOG_KEY, raw);
        if (storage.getItem(HARBOR_LOG_KEY) !== raw) throw new Error('Harbor entry unavailable');
      }
      this.unsaved = false;
      this.issue = null;
    } catch {
      this.issue = 'New Harbor log entries last for this visit. Saving is unavailable on this device.';
    }
  }
}
