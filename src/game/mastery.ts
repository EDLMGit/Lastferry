import { storageForRecord, writeConfirmed } from './save-storage';

export type MasteryTarget = { revision: number; target: number };
export const masteryTargets: Readonly<Record<string, MasteryTarget>> = {
  'first-crossing': { revision: 1, target: 8 },
  'holding-pier': { revision: 1, target: 9 },
  bellwater: { revision: 1, target: 10 },
  'driftwood-yard': { revision: 1, target: 12 },
  'two-shelters': { revision: 1, target: 12 },
  'wide-berth': { revision: 1, target: 14 },
  'reef-return': { revision: 1, target: 11 },
  'orchard-landing': { revision: 1, target: 13 },
  ternhaven: { revision: 1, target: 14 },
};

export type MasteryResult = {
  coveId: string;
  revision: number;
  actions: number;
  successfulUndos: number;
  lanterns: 1 | 2 | 3;
};

export const MASTERY_STORAGE_KEY = 'last-ferry.mastery.v1';
export type MasteryStorage = Pick<Storage, 'getItem' | 'setItem'>;
type MasteryRecord = { version: 1; results: Record<string, MasteryResult> };

export function resultFor(coveId: string, actions: number, successfulUndos: number): MasteryResult | null {
  if (
    !Object.hasOwn(masteryTargets, coveId) ||
    !Number.isSafeInteger(actions) || actions < 1 ||
    !Number.isSafeInteger(successfulUndos) || successfulUndos < 0
  ) return null;
  const { target, revision } = masteryTargets[coveId];
  return {
    coveId,
    revision,
    actions,
    successfulUndos,
    lanterns: actions > target ? 1 : successfulUndos > 0 ? 2 : 3,
  };
}

function resultKey(result: Pick<MasteryResult, 'coveId' | 'revision'>) {
  return result.coveId + '@' + result.revision;
}

function better(candidate: MasteryResult, previous?: MasteryResult) {
  return !previous ||
    candidate.lanterns > previous.lanterns ||
    (candidate.lanterns === previous.lanterns && candidate.actions < previous.actions) ||
    (candidate.lanterns === previous.lanterns && candidate.actions === previous.actions &&
      candidate.successfulUndos < previous.successfulUndos);
}

function exactKeys(value: unknown, names: string[]): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value, name));
}

function validResult(value: unknown): value is MasteryResult {
  if (!exactKeys(value, ['coveId', 'revision', 'actions', 'successfulUndos', 'lanterns'])) return false;
  if (
    typeof value.coveId !== 'string' || !Object.hasOwn(masteryTargets, value.coveId) ||
    !Number.isSafeInteger(value.revision) || (value.revision as number) < 1 ||
    !Number.isSafeInteger(value.actions) || (value.actions as number) < 1 ||
    !Number.isSafeInteger(value.successfulUndos) || (value.successfulUndos as number) < 0 ||
    ![1, 2, 3].includes(value.lanterns as number)
  ) return false;
  return value.revision !== masteryTargets[value.coveId].revision ||
    value.lanterns === resultFor(value.coveId, value.actions as number, value.successfulUndos as number)!.lanterns;
}

function parseRecord(raw: string | null): MasteryRecord | null {
  if (raw === null) return { version: 1, results: {} };
  try {
    if (raw.length > 32768) return null;
    const value: unknown = JSON.parse(raw);
    if (
      !exactKeys(value, ['version', 'results']) || value.version !== 1 ||
      value.results === null || typeof value.results !== 'object' || Array.isArray(value.results)
    ) return null;
    const results: Record<string, MasteryResult> = {};
    for (const [key, result] of Object.entries(value.results)) {
      if (!validResult(result) || key !== resultKey(result)) return null;
      results[key] = { ...result };
    }
    return { version: 1, results };
  } catch {
    return null;
  }
}

export class MasteryStore {
  private record: MasteryRecord = { version: 1, results: {} };
  private storageIssue: string | null = null;

  constructor(private getStorage: () => MasteryStorage = () => storageForRecord(MASTERY_STORAGE_KEY)) {
    this.sync();
  }

  get persistent() {
    return this.storageIssue === null;
  }

  get issue() {
    return this.storageIssue;
  }

  best(coveId: string): MasteryResult | null {
    if (!Object.hasOwn(masteryTargets, coveId)) return null;
    const key = resultKey({ coveId, revision: masteryTargets[coveId].revision });
    const result = this.record.results[key];
    return result ? { ...result } : null;
  }

  accept(result: MasteryResult | null): boolean {
    if (!validResult(result) || result.revision !== masteryTargets[result.coveId].revision) return false;
    return this.sync(result);
  }

  retry() {
    if (this.storageIssue) this.sync();
  }

  private sync(result?: MasteryResult) {
    let storage: MasteryStorage | undefined;
    let saved: MasteryRecord | null = null;
    try {
      storage = this.getStorage();
      saved = parseRecord(storage.getItem(MASTERY_STORAGE_KEY));
      if (saved) {
        for (const [key, stored] of Object.entries(saved.results)) {
          if (better(stored, this.record.results[key])) this.record.results[key] = stored;
        }
        this.storageIssue = null;
      } else this.storageIssue = 'Saved lantern results could not be read. New results last for this visit.';
    } catch {
      this.unavailable();
    }
    const improved = !!result && better(result, this.record.results[resultKey(result)]);
    if (result && improved) this.record.results[resultKey(result)] = { ...result };
    if (storage && saved && Object.entries(this.record.results).some(([key, local]) => better(local, saved.results[key]))) {
      try {
        const raw = JSON.stringify(this.record);
        writeConfirmed(storage, MASTERY_STORAGE_KEY, raw);
      } catch {
        this.unavailable();
      }
    }
    return improved;
  }

  private unavailable() {
    this.storageIssue = 'Lantern results last for this visit. Saving is unavailable on this device.';
  }
}
